// ============================================================
// TYPES — shared across the entire app
// ============================================================

export type CrawlStrategy = 'bfs' | 'dfs';

export type NodeStatus =
  | 'undiscovered'
  | 'queued'
  | 'crawling'
  | 'visited'
  | 'bloom_candidate'
  | 'cycle'
  | 'duplicate'
  | 'broken';

export type CrawlerStatus = 'idle' | 'crawling' | 'paused' | 'complete' | 'error';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'cycle';

export interface CrawlNode {
  id: string;
  url: string;
  canonicalUrl: string;
  depth: number;
  status: NodeStatus;
  parentId: string | null;
  discoveredAt: number;     // ms timestamp
  visitedAt: number | null;
  httpStatus: number | null;
  responseTime: number | null;
  pageTitle: string;
  contentType: string;
  outgoingLinks: string[];
  incomingLinks: string[];
  cycleInvolved: boolean;
  isSimulated: boolean;
}

export interface CrawlEdge {
  id: string;
  source: string;
  target: string;
  isCycle: boolean;
  isBlocked: boolean;
  highlighted?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  detail?: string;
}

export interface BloomFilterState {
  bits: number[];
  size: number;
  hashCount: number;
  lastCheckedUrl: string | null;
  lastHashPositions: number[];
  lastResult: 'possibly_seen' | 'definitely_new' | null;
}

export interface CrawlerConfig {
  startUrl: string;
  strategy: CrawlStrategy;
  maxPages: number;
  maxDepth: number;
  crawlDelay: number;
  domainScope: 'same_domain' | 'all';
  respectRobotsTxt: boolean;
  demoMode: boolean;
  demoScenario: DemoScenario;
}

export type DemoScenario =
  | 'simple_cycle'
  | 'multiple_cycles'
  | 'duplicate_urls'
  | 'broken_links'
  | 'deep_crawl'
  | 'large_graph';

export interface CrawlerStats {
  pagesDiscovered: number;
  pagesVisited: number;
  cyclesDetected: number;
  duplicatesSkipped: number;
  brokenLinks: number;
  maxDepthReached: number;
  requestsSaved: number;
  crawlTime: number;
  bloomCandidates: number;
  exactAccepted: number;
}

export interface DetectedCycle {
  id: string;
  path: string[];
  sourceUrl: string;
  targetUrl: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  timestamp: number;
  blocked: boolean;
}

export interface CrawlHistoryItem {
  id: string;
  timestamp: number;
  startUrl: string;
  strategy: CrawlStrategy;
  pagesVisited: number;
  pagesDiscovered: number;
  cyclesDetected: number;
  duplicatesSkipped: number;
  brokenLinks: number;
  maxDepth: number;
  duration: number;
  status: 'complete' | 'stopped' | 'error';
  scenario: string;
  demoMode: boolean;
}

export interface CrawlerState {
  // Config
  config: CrawlerConfig;
  // Status
  status: CrawlerStatus;
  currentNodeId: string | null;
  // Graph
  nodes: CrawlNode[];
  edges: CrawlEdge[];
  // Data structures
  queue: string[];          // BFS queue (node IDs)
  stack: string[];          // DFS stack (node IDs)
  visitedSet: Set<string>;  // canonical URLs
  bloomFilter: BloomFilterState;
  // Stats
  stats: CrawlerStats;
  // Logs
  logs: LogEntry[];
  // Pipeline stage
  pipelineStage: PipelineStage;
  currentUrl: string | null;
  currentCanonical: string | null;
  // Selected node for inspector
  selectedNodeId: string | null;
  // Cycles
  detectedCycles: DetectedCycle[];
  highlightedCycleId: string | null;
  // Animation
  animationSpeed: number; // 1 = normal, 2 = fast, 0.5 = slow
  stepMode: boolean;
  crawlStep: number;
  // History
  history: CrawlHistoryItem[];
}

export type PipelineStage =
  | 'idle'
  | 'receive'
  | 'canonicalize'
  | 'bloom_check'
  | 'exact_check'
  | 'accept'
  | 'fetch'
  | 'extract'
  | 'queue_add'
  | 'continue'
  | 'cycle_detected'
  | 'duplicate_found'
  | 'complete';

export interface GraphScenario {
  id: DemoScenario;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    url: string;
    title: string;
    links: string[];
    httpStatus?: number;
  }>;
}
