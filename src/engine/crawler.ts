// ============================================================
// CRAWLER SIMULATION ENGINE
// ============================================================

import { canonicalizeUrl, getUrlLabel } from './canonicalize';
import { bloomAdd, bloomCheck, createBloomFilter } from './bloomFilter';
import {
  CrawlEdge,
  CrawlNode,
  CrawlerConfig,
  CrawlerState,
  DetectedCycle,
  LogEntry,
  NodeStatus,
} from './types';
import { DEMO_SCENARIOS } from './graphGenerator';

// ─── Helpers ────────────────────────────────────────────────

let _nodeCounter = 0;
let _edgeCounter = 0;
let _logCounter = 0;
let _cycleCounter = 0;

function nodeId() { return `n${++_nodeCounter}`; }
function edgeId() { return `e${++_edgeCounter}`; }
function logId() { return `l${++_logCounter}`; }
function cycleId() { return `c${++_cycleCounter}`; }

function now() { return Date.now(); }

function cleanUrlDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname + (parsed.search || '') + (parsed.hash || '');
    return path === '' ? '/' : path;
  } catch {
    return url.replace('https://demo.local', '') || '/';
  }
}

function makeLog(level: LogEntry['level'], message: string, detail?: string): LogEntry {
  return { id: logId(), timestamp: now(), level, message, detail };
}

function makeNode(
  url: string,
  depth: number,
  parentId: string | null,
  title: string,
  httpStatus: number | null = 200
): CrawlNode {
  const canonical = canonicalizeUrl(url).canonical;
  return {
    id: nodeId(),
    url,
    canonicalUrl: canonical,
    depth,
    status: 'queued',
    parentId,
    discoveredAt: now(),
    visitedAt: null,
    httpStatus,
    responseTime: Math.floor(Math.random() * 200) + 30,
    pageTitle: title,
    contentType: 'text/html; charset=UTF-8',
    outgoingLinks: [],
    incomingLinks: [],
    cycleInvolved: false,
    isSimulated: true,
  };
}

/**
 * Reconstructs a cycle path array [A, B, C, A] by walking backwards from current back to target.
 */
function reconstructCyclePath(
  nodes: CrawlNode[],
  sourceId: string,
  targetCanonical: string
): string[] {
  const path: string[] = [];
  let curr: CrawlNode | undefined = nodes.find(n => n.id === sourceId);
  const visitedIds = new Set<string>();

  while (curr && !visitedIds.has(curr.id)) {
    visitedIds.add(curr.id);
    path.unshift(curr.canonicalUrl);
    if (curr.canonicalUrl === targetCanonical) break;
    curr = nodes.find(n => n.id === curr?.parentId);
  }

  // Append target to close the loop
  path.push(targetCanonical);
  return path.length >= 2 ? path : [targetCanonical, targetCanonical];
}

// ─── Initial state ───────────────────────────────────────────

export function createInitialState(config: CrawlerConfig): CrawlerState {
  _nodeCounter = 0;
  _edgeCounter = 0;
  _logCounter = 0;
  _cycleCounter = 0;

  return {
    config,
    status: 'idle',
    currentNodeId: null,
    nodes: [],
    edges: [],
    queue: [],
    stack: [],
    visitedSet: new Set(),
    bloomFilter: createBloomFilter(),
    stats: {
      pagesDiscovered: 0,
      pagesVisited: 0,
      cyclesDetected: 0,
      duplicatesSkipped: 0,
      brokenLinks: 0,
      maxDepthReached: 0,
      requestsSaved: 0,
      crawlTime: 0,
      bloomCandidates: 0,
      exactAccepted: 0,
    },
    logs: [],
    pipelineStage: 'idle',
    currentUrl: null,
    currentCanonical: null,
    selectedNodeId: null,
    detectedCycles: [],
    highlightedCycleId: null,
    animationSpeed: 1,
    stepMode: false,
    crawlStep: 0,
    history: [],
  };
}

// ─── Main Simulation Step Engine ─────────────────────────────

export type CrawlStepResult = {
  state: CrawlerState;
  done: boolean;
};

/**
 * Build the initial state and queue the start node.
 */
export function initializeCrawl(state: CrawlerState): CrawlerState {
  const { config } = state;
  const scenario = DEMO_SCENARIOS[config.demoScenario] || DEMO_SCENARIOS['simple_cycle'];

  // Get start URL
  const startScenario = scenario.nodes[0];
  const startUrl = config.demoMode ? startScenario.url : (config.startUrl || 'https://demo.local/home');
  const startTitle = config.demoMode ? startScenario.title : (getUrlLabel(startUrl) || 'Home');
  const startNode = makeNode(startUrl, 0, null, startTitle, 200);

  const logs: LogEntry[] = [
    makeLog('info', `Crawl started for ${startUrl} (${config.strategy.toUpperCase()})`),
    makeLog('info', `Discovered seed page: ${cleanUrlDisplay(startUrl)}`),
  ];

  if (config.respectRobotsTxt) {
    logs.push(makeLog('info', 'robots.txt verified (crawl scope permitted)'));
  }

  const frontier = config.strategy === 'bfs'
    ? { queue: [startNode.id], stack: [] as string[] }
    : { queue: [] as string[], stack: [startNode.id] };

  return {
    ...state,
    status: 'crawling',
    nodes: [startNode],
    edges: [],
    queue: frontier.queue,
    stack: frontier.stack,
    visitedSet: new Set(),
    bloomFilter: createBloomFilter(),
    stats: { ...state.stats, pagesDiscovered: 1 },
    logs,
    pipelineStage: 'receive',
    currentUrl: startUrl,
    currentCanonical: startNode.canonicalUrl,
    currentNodeId: startNode.id,
    detectedCycles: [],
    highlightedCycleId: null,
  };
}

// ─── Step-based crawl advancement ───────────────────────────

export function advanceCrawl(
  state: CrawlerState,
  scenarioMap: Map<string, { url: string; title: string; links: string[]; httpStatus?: number }>
): CrawlStepResult {
  const { config } = state;
  let { nodes, edges, queue, stack, visitedSet, bloomFilter, stats, logs, detectedCycles } = state;

  // Determine frontier
  const frontier = config.strategy === 'bfs' ? queue : stack;
  if (frontier.length === 0 || stats.pagesVisited >= config.maxPages) {
    const isLimits = stats.pagesVisited >= config.maxPages;
    return {
      state: {
        ...state,
        status: 'complete',
        pipelineStage: 'complete',
        logs: [
          ...logs,
          makeLog('success', isLimits ? `Crawl limit reached (${config.maxPages} pages)` : `Crawl completed: ${stats.pagesVisited} pages crawled, ${stats.cyclesDetected} cycles prevented`),
        ],
      },
      done: true,
    };
  }

  // Pop next node ID
  const currentId = config.strategy === 'bfs' ? frontier[0] : frontier[frontier.length - 1];
  const newFrontier = config.strategy === 'bfs'
    ? frontier.slice(1)
    : frontier.slice(0, -1);

  const currentNode = nodes.find(n => n.id === currentId);
  if (!currentNode) {
    return { state, done: false };
  }

  // Depth check
  if (currentNode.depth > config.maxDepth) {
    const newNodes = nodes.map(n => n.id === currentId ? { ...n, status: 'visited' as NodeStatus } : n);
    return {
      state: {
        ...state,
        nodes: newNodes,
        queue: config.strategy === 'bfs' ? newFrontier : queue,
        stack: config.strategy === 'dfs' ? newFrontier : stack,
        logs: [...logs, makeLog('warning', `Max depth reached (${config.maxDepth}): Skipped ${cleanUrlDisplay(currentNode.canonicalUrl)}`)],
      },
      done: false,
    };
  }

  const canonical = currentNode.canonicalUrl;
  const displayUrl = cleanUrlDisplay(canonical);

  // ── Step 1: Bloom Filter check ──
  const bloomResult = bloomCheck(bloomFilter, canonical);

  // ── Step 2: Exact Hash Set check ──
  if (visitedSet.has(canonical)) {
    // Already visited — cycle or duplicate
    const isCycle = nodes.some(n => n.canonicalUrl === canonical && n.status === 'visited');
    const newNodes = nodes.map(n =>
      n.id === currentId
        ? { ...n, status: (isCycle ? 'cycle' : 'duplicate') as NodeStatus, cycleInvolved: isCycle }
        : n
    );

    const newEdges = edges.map(e =>
      e.target === currentId
        ? { ...e, isCycle: true, isBlocked: true }
        : e
    );

    const newStats = {
      ...stats,
      duplicatesSkipped: stats.duplicatesSkipped + 1,
      cyclesDetected: isCycle ? stats.cyclesDetected + 1 : stats.cyclesDetected,
      requestsSaved: stats.requestsSaved + 1,
    };

    let updatedCycles = detectedCycles;
    if (isCycle) {
      const cyclePath = reconstructCyclePath(nodes, currentNode.parentId || currentId, canonical);
      const newCycle: DetectedCycle = {
        id: cycleId(),
        path: cyclePath,
        sourceUrl: currentNode.url,
        targetUrl: canonical,
        sourceNodeId: currentNode.parentId || undefined,
        targetNodeId: currentId,
        timestamp: now(),
        blocked: true,
      };
      updatedCycles = [...detectedCycles, newCycle];
    }

    return {
      state: {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        queue: config.strategy === 'bfs' ? newFrontier : queue,
        stack: config.strategy === 'dfs' ? newFrontier : stack,
        bloomFilter: bloomResult.updatedState,
        stats: newStats,
        detectedCycles: updatedCycles,
        pipelineStage: isCycle ? 'cycle_detected' : 'duplicate_found',
        currentNodeId: currentId,
        currentUrl: currentNode.url,
        currentCanonical: canonical,
        logs: [
          ...logs,
          makeLog(
            isCycle ? 'cycle' : 'warning',
            isCycle ? `⚠ Cycle detected: ${displayUrl} (Repeated traversal blocked)` : `Duplicate skipped: ${displayUrl}`,
            isCycle ? 'Loop severed' : 'Already visited'
          ),
        ],
      },
      done: false,
    };
  }

  // ── Step 3: Accept Page ──
  visitedSet = new Set([...visitedSet, canonical]);
  bloomFilter = bloomAdd(bloomResult.updatedState, canonical);

  const scenarioNode = scenarioMap.get(currentNode.url);
  const isError = scenarioNode?.httpStatus && scenarioNode.httpStatus >= 400;
  const httpStatus = scenarioNode?.httpStatus ?? 200;

  if (isError) {
    // Broken link
    const newNodes = nodes.map(n =>
      n.id === currentId
        ? { ...n, status: 'broken' as NodeStatus, httpStatus, visitedAt: now() }
        : n
    );
    return {
      state: {
        ...state,
        nodes: newNodes,
        queue: config.strategy === 'bfs' ? newFrontier : queue,
        stack: config.strategy === 'dfs' ? newFrontier : stack,
        visitedSet,
        bloomFilter,
        stats: { ...stats, brokenLinks: stats.brokenLinks + 1, pagesVisited: stats.pagesVisited + 1 },
        pipelineStage: 'fetch',
        currentNodeId: currentId,
        currentUrl: currentNode.url,
        currentCanonical: canonical,
        logs: [
          ...logs,
          makeLog('error', `✗ Broken link: ${displayUrl} (${httpStatus})`),
        ],
      },
      done: false,
    };
  }

  // ── Step 4: Fetch & Extract Outgoing Links ──
  const outgoingUrls: string[] = scenarioNode?.links ?? [];
  const newNodes: CrawlNode[] = [];
  const newEdges: CrawlEdge[] = [];
  const newQueue = [...newFrontier];
  const newStack = [...newFrontier];
  let newStats = {
    ...stats,
    pagesVisited: stats.pagesVisited + 1,
    maxDepthReached: Math.max(stats.maxDepthReached, currentNode.depth),
    bloomCandidates: stats.bloomCandidates + 1,
    exactAccepted: stats.exactAccepted + 1,
  };

  const newLogs: LogEntry[] = [
    makeLog('success', `✓ Crawled ${displayUrl} (${httpStatus} OK, ${currentNode.responseTime}ms)`),
  ];

  if (outgoingUrls.length > 0) {
    newLogs.push(makeLog('info', `Discovered ${outgoingUrls.length} links on ${displayUrl}`));
  }

  let updatedCycles = detectedCycles;

  for (const linkUrl of outgoingUrls) {
    const linkCanonical = canonicalizeUrl(linkUrl).canonical;
    const linkScenario = scenarioMap.get(linkUrl);
    const linkDisplay = cleanUrlDisplay(linkCanonical);

    // Check if node already exists in graph
    const existingNode = [...nodes, ...newNodes].find(n => n.canonicalUrl === linkCanonical);

    if (existingNode) {
      const isCycleEdge = visitedSet.has(linkCanonical);
      newEdges.push({
        id: edgeId(),
        source: currentId,
        target: existingNode.id,
        isCycle: isCycleEdge,
        isBlocked: isCycleEdge,
      });

      if (isCycleEdge) {
        newStats = {
          ...newStats,
          cyclesDetected: newStats.cyclesDetected + 1,
          requestsSaved: newStats.requestsSaved + 1,
        };

        const cyclePath = reconstructCyclePath(nodes, currentId, linkCanonical);
        const newCycle: DetectedCycle = {
          id: cycleId(),
          path: cyclePath,
          sourceUrl: currentNode.url,
          targetUrl: linkCanonical,
          sourceNodeId: currentId,
          targetNodeId: existingNode.id,
          timestamp: now(),
          blocked: true,
        };
        updatedCycles = [...updatedCycles, newCycle];

        newLogs.push(makeLog('cycle', `⚠ Cycle detected: ${displayUrl} → ${linkDisplay} (Repeated traversal blocked)`));
      } else {
        newLogs.push(makeLog('warning', `Link already queued: ${linkDisplay}`));
      }
    } else {
      // New unseen node
      const depth = currentNode.depth + 1;
      if (depth <= config.maxDepth) {
        const childNode = makeNode(
          linkUrl,
          depth,
          currentId,
          linkScenario?.title ?? getUrlLabel(linkUrl),
          linkScenario?.httpStatus ?? 200
        );
        newNodes.push(childNode);
        newEdges.push({ id: edgeId(), source: currentId, target: childNode.id, isCycle: false, isBlocked: false });

        if (config.strategy === 'bfs') newQueue.push(childNode.id);
        else newStack.push(childNode.id);

        newLogs.push(makeLog('info', `Queued ${linkDisplay} (Depth ${depth})`));
        newStats = { ...newStats, pagesDiscovered: newStats.pagesDiscovered + 1 };
      }
    }
  }

  const allNodes = nodes.map(n =>
    n.id === currentId
      ? { ...n, status: 'visited' as NodeStatus, visitedAt: now(), httpStatus, outgoingLinks: outgoingUrls }
      : n
  );

  const done = (newQueue.length === 0 && config.strategy === 'bfs') ||
    (newStack.length === 0 && config.strategy === 'dfs') ||
    newStats.pagesVisited >= config.maxPages;

  return {
    state: {
      ...state,
      nodes: [...allNodes, ...newNodes],
      edges: [...edges, ...newEdges],
      queue: config.strategy === 'bfs' ? newQueue : queue,
      stack: config.strategy === 'dfs' ? newStack : stack,
      visitedSet,
      bloomFilter,
      stats: newStats,
      detectedCycles: updatedCycles,
      pipelineStage: done ? 'complete' : 'queue_add',
      currentNodeId: currentId,
      currentUrl: currentNode.url,
      currentCanonical: canonical,
      logs: [...logs, ...newLogs],
      status: done ? 'complete' : 'crawling',
      crawlStep: state.crawlStep + 1,
    },
    done,
  };
}

export function buildScenarioMap(demoScenario: string) {
  const scenario = DEMO_SCENARIOS[demoScenario] ?? DEMO_SCENARIOS['simple_cycle'];
  return new Map(scenario.nodes.map(n => [n.url, n]));
}

export function computeLayout(nodes: CrawlNode[]): Map<string, { x: number; y: number }> {
  const layout = new Map<string, { x: number; y: number }>();

  // Group by depth
  const depthGroups = new Map<number, string[]>();
  for (const node of nodes) {
    const g = depthGroups.get(node.depth) ?? [];
    g.push(node.id);
    depthGroups.set(node.depth, g);
  }

  const LEVEL_HEIGHT = 150;
  const NODE_WIDTH = 170;

  depthGroups.forEach((ids, depth) => {
    const count = ids.length;
    ids.forEach((id, i) => {
      layout.set(id, {
        x: (i - (count - 1) / 2) * NODE_WIDTH,
        y: depth * LEVEL_HEIGHT,
      });
    });
  });

  return layout;
}
