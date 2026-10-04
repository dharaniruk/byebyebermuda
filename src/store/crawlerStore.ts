// ============================================================
// ZUSTAND STORE — global crawler state & history
// ============================================================

import { create } from 'zustand';
import {
  CrawlerConfig,
  CrawlerState,
  DemoScenario,
  CrawlStrategy,
  CrawlHistoryItem,
} from '../engine/types';
import {
  createInitialState,
  initializeCrawl,
  advanceCrawl,
  buildScenarioMap,
} from '../engine/crawler';

const HISTORY_STORAGE_KEY = 'byebyebermuda_crawl_history';

function loadInitialHistory(): CrawlHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load crawl history', e);
  }

  // Prepopulate with a sample run if empty
  return [
    {
      id: 'h_sample_1',
      timestamp: Date.now() - 3600000,
      startUrl: 'https://demo.local/home',
      strategy: 'bfs',
      pagesVisited: 4,
      pagesDiscovered: 4,
      cyclesDetected: 2,
      duplicatesSkipped: 2,
      brokenLinks: 0,
      maxDepth: 2,
      duration: 1.84,
      status: 'complete',
      scenario: 'Simple Cycle',
      demoMode: true,
    },
    {
      id: 'h_sample_2',
      timestamp: Date.now() - 86400000,
      startUrl: 'https://demo.local/products',
      strategy: 'dfs',
      pagesVisited: 8,
      pagesDiscovered: 8,
      cyclesDetected: 4,
      duplicatesSkipped: 3,
      brokenLinks: 1,
      maxDepth: 4,
      duration: 3.42,
      status: 'complete',
      scenario: 'Multiple Cycles',
      demoMode: true,
    },
  ];
}

function saveHistory(history: CrawlHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save crawl history', e);
  }
}

const DEFAULT_CONFIG: CrawlerConfig = {
  startUrl: 'https://demo.local/home',
  strategy: 'bfs',
  maxPages: 50,
  maxDepth: 10,
  crawlDelay: 500,
  domainScope: 'same_domain',
  respectRobotsTxt: true,
  demoMode: true,
  demoScenario: 'simple_cycle',
};

interface CrawlerStore {
  crawlerState: CrawlerState;
  _intervalId: ReturnType<typeof setInterval> | null;

  // Actions
  setConfig: (config: Partial<CrawlerConfig>) => void;
  startCrawl: () => void;
  pauseCrawl: () => void;
  resumeCrawl: () => void;
  resetCrawl: () => void;
  stepCrawl: () => void;
  fastForward: () => void;
  selectNode: (nodeId: string | null) => void;
  setAnimationSpeed: (speed: number) => void;
  setScenario: (scenario: DemoScenario) => void;
  setStrategy: (strategy: CrawlStrategy) => void;
  highlightCycle: (cycleId: string | null) => void;

  // History Actions
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  runFromHistory: (item: CrawlHistoryItem) => void;
}

export const useCrawlerStore = create<CrawlerStore>((set, get) => ({
  crawlerState: {
    ...createInitialState(DEFAULT_CONFIG),
    history: loadInitialHistory(),
  },
  _intervalId: null,

  setConfig: (partial) => {
    set(s => ({
      crawlerState: {
        ...s.crawlerState,
        config: { ...s.crawlerState.config, ...partial },
      },
    }));
  },

  setScenario: (scenario) => {
    set(s => ({
      crawlerState: {
        ...createInitialState({ ...s.crawlerState.config, demoScenario: scenario }),
        history: s.crawlerState.history,
      },
    }));
  },

  setStrategy: (strategy) => {
    set(s => ({
      crawlerState: {
        ...s.crawlerState,
        config: { ...s.crawlerState.config, strategy },
      },
    }));
  },

  highlightCycle: (cycleId) => {
    set(s => {
      const cycle = s.crawlerState.detectedCycles.find(c => c.id === cycleId);
      const highlightedNodeId = cycle?.sourceNodeId || cycle?.targetNodeId || null;

      return {
        crawlerState: {
          ...s.crawlerState,
          highlightedCycleId: cycleId,
          selectedNodeId: highlightedNodeId || s.crawlerState.selectedNodeId,
        },
      };
    });
  },

  startCrawl: () => {
    const { crawlerState, _intervalId } = get();
    if (_intervalId) clearInterval(_intervalId);

    const initialized = initializeCrawl(createInitialState(crawlerState.config));
    const scenarioMap = buildScenarioMap(crawlerState.config.demoScenario);

    set({
      crawlerState: {
        ...initialized,
        history: crawlerState.history,
      },
    });

    const startTime = Date.now();

    const run = () => {
      const current = get().crawlerState;
      if (current.status !== 'crawling') {
        clearInterval(get()._intervalId!);
        set({ _intervalId: null });
        return;
      }

      const { state: next, done } = advanceCrawl(current, scenarioMap);
      const elapsed = Number(((Date.now() - startTime) / 1000).toFixed(2));

      let updatedHistory = current.history;

      if (done) {
        clearInterval(get()._intervalId!);
        set({ _intervalId: null });

        // Record history item
        const newHistoryItem: CrawlHistoryItem = {
          id: `h_${Date.now()}`,
          timestamp: Date.now(),
          startUrl: current.config.startUrl,
          strategy: current.config.strategy,
          pagesVisited: next.stats.pagesVisited,
          pagesDiscovered: next.stats.pagesDiscovered,
          cyclesDetected: next.stats.cyclesDetected,
          duplicatesSkipped: next.stats.duplicatesSkipped,
          brokenLinks: next.stats.brokenLinks,
          maxDepth: next.stats.maxDepthReached,
          duration: elapsed,
          status: 'complete',
          scenario: current.config.demoScenario.replace('_', ' ').toUpperCase(),
          demoMode: current.config.demoMode,
        };

        updatedHistory = [newHistoryItem, ...current.history.slice(0, 19)];
        saveHistory(updatedHistory);
      }

      set({
        crawlerState: {
          ...next,
          stats: { ...next.stats, crawlTime: elapsed },
          history: updatedHistory,
        },
      });
    };

    const delay = Math.max(50, crawlerState.config.crawlDelay);
    const id = setInterval(run, delay);
    set({ _intervalId: id });
  },

  pauseCrawl: () => {
    const { _intervalId } = get();
    if (_intervalId) {
      clearInterval(_intervalId);
      set({ _intervalId: null });
    }
    set(s => ({
      crawlerState: { ...s.crawlerState, status: 'paused' },
    }));
  },

  resumeCrawl: () => {
    const { crawlerState } = get();
    if (crawlerState.status !== 'paused') return;
    const scenarioMap = buildScenarioMap(crawlerState.config.demoScenario);

    set(s => ({
      crawlerState: { ...s.crawlerState, status: 'crawling' },
    }));

    const startTime = Date.now() - (crawlerState.stats.crawlTime * 1000);

    const run = () => {
      const current = get().crawlerState;
      if (current.status !== 'crawling') {
        clearInterval(get()._intervalId!);
        set({ _intervalId: null });
        return;
      }
      const { state: next, done } = advanceCrawl(current, scenarioMap);
      const elapsed = Number(((Date.now() - startTime) / 1000).toFixed(2));

      let updatedHistory = current.history;

      if (done) {
        clearInterval(get()._intervalId!);
        set({ _intervalId: null });

        const newHistoryItem: CrawlHistoryItem = {
          id: `h_${Date.now()}`,
          timestamp: Date.now(),
          startUrl: current.config.startUrl,
          strategy: current.config.strategy,
          pagesVisited: next.stats.pagesVisited,
          pagesDiscovered: next.stats.pagesDiscovered,
          cyclesDetected: next.stats.cyclesDetected,
          duplicatesSkipped: next.stats.duplicatesSkipped,
          brokenLinks: next.stats.brokenLinks,
          maxDepth: next.stats.maxDepthReached,
          duration: elapsed,
          status: 'complete',
          scenario: current.config.demoScenario.replace('_', ' ').toUpperCase(),
          demoMode: current.config.demoMode,
        };

        updatedHistory = [newHistoryItem, ...current.history.slice(0, 19)];
        saveHistory(updatedHistory);
      }

      set({
        crawlerState: {
          ...next,
          stats: { ...next.stats, crawlTime: elapsed },
          history: updatedHistory,
        },
      });
    };

    const delay = Math.max(50, crawlerState.config.crawlDelay);
    const id = setInterval(run, delay);
    set({ _intervalId: id });
  },

  resetCrawl: () => {
    const { _intervalId, crawlerState } = get();
    if (_intervalId) clearInterval(_intervalId);
    set({
      _intervalId: null,
      crawlerState: {
        ...createInitialState(crawlerState.config),
        history: crawlerState.history,
      },
    });
  },

  stepCrawl: () => {
    const { crawlerState, _intervalId } = get();
    if (_intervalId) clearInterval(_intervalId);

    let current = crawlerState;
    if (current.status === 'idle') {
      current = initializeCrawl(createInitialState(current.config));
    }
    if (current.status !== 'crawling') return;

    const scenarioMap = buildScenarioMap(current.config.demoScenario);
    const { state: next } = advanceCrawl(current, scenarioMap);
    set({
      crawlerState: {
        ...next,
        history: current.history,
      },
      _intervalId: null,
    });
  },

  fastForward: () => {
    const { crawlerState, _intervalId } = get();
    if (_intervalId) clearInterval(_intervalId);

    let current = crawlerState;
    if (current.status === 'idle') {
      current = initializeCrawl(createInitialState(current.config));
    }
    const scenarioMap = buildScenarioMap(current.config.demoScenario);

    let done = false;
    let steps = 0;
    while (!done && steps < 200) {
      const result = advanceCrawl(current, scenarioMap);
      current = result.state;
      done = result.done;
      steps++;
    }

    set({
      crawlerState: {
        ...current,
        history: crawlerState.history,
      },
      _intervalId: null,
    });
  },

  selectNode: (nodeId) => {
    set(s => ({
      crawlerState: { ...s.crawlerState, selectedNodeId: nodeId },
    }));
  },

  setAnimationSpeed: (speed) => {
    set(s => ({
      crawlerState: { ...s.crawlerState, animationSpeed: speed },
    }));
  },

  deleteHistoryItem: (id) => {
    set(s => {
      const updated = s.crawlerState.history.filter(h => h.id !== id);
      saveHistory(updated);
      return {
        crawlerState: { ...s.crawlerState, history: updated },
      };
    });
  },

  clearHistory: () => {
    saveHistory([]);
    set(s => ({
      crawlerState: { ...s.crawlerState, history: [] },
    }));
  },

  runFromHistory: (item) => {
    get().setConfig({
      startUrl: item.startUrl,
      strategy: item.strategy,
      demoMode: item.demoMode,
    });
    get().startCrawl();
  },
}));
