// ============================================================
// MAIN CRAWLER APPLICATION — BYEBYEBERMUDA
// "Break the Loop. Crawl Smarter."
// ============================================================

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Triangle, Play, Pause, RotateCcw, Globe, Shield, Clock,
  ChevronDown, ChevronUp, Search, Filter, Download, ExternalLink,
  CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Terminal,
  BarChart3, List, Layers, Hash, LayoutGrid, Info, Ban, ArrowRight,
  SlidersHorizontal, Check, RefreshCw
} from 'lucide-react';
import CrawlerControls from '../components/dashboard/CrawlerControls';
import CrawlerGraph from '../components/dashboard/CrawlerGraph';
import NodeDetails from '../components/dashboard/NodeDetails';
import StatsCards from '../components/dashboard/StatsCards';
import CrawlerConsole from '../components/dashboard/CrawlerConsole';
import AlgorithmPipeline from '../components/dashboard/AlgorithmPipeline';
import BloomFilterVisualizer from '../components/dashboard/BloomFilterVisualizer';
import HashSetVisualizer from '../components/dashboard/HashSetVisualizer';
import QueueVisualizer from '../components/dashboard/QueueVisualizer';
import CanonicalizationVisualizer from '../components/dashboard/CanonicalizationVisualizer';
import CycleDetector from '../components/dashboard/CycleDetector';
import Footer from '../components/layout/Footer';
import { useCrawlerStore } from '../store/crawlerStore';
import { exportJson, exportCsv } from '../utils/export';
import { SCENARIO_LIST } from '../engine/graphGenerator';
import { DemoScenario } from '../engine/types';

type ResultsFilter = 'all' | 'visited' | 'cycles' | 'broken' | 'duplicates';
type RightTab = 'status' | 'pipeline' | 'inspector' | 'bloom' | 'hashset' | 'queue' | 'cycles';

export default function LandingPage() {
  const navigate = useNavigate();
  const {
    crawlerState,
    startCrawl,
    pauseCrawl,
    resumeCrawl,
    resetCrawl,
    setConfig,
    setScenario,
    setStrategy,
    selectNode,
  } = useCrawlerStore();

  const {
    config,
    status,
    stats,
    nodes,
    detectedCycles,
    currentNodeId,
    currentUrl,
    currentCanonical,
    queue,
    stack
  } = crawlerState;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('status');
  const [resultsFilter, setResultsFilter] = useState<ResultsFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'url' | 'depth' | 'status' | 'links'>('depth');
  const [sortAsc, setSortAsc] = useState(true);

  const resultsTableRef = useRef<HTMLDivElement>(null);

  const isCrawling = status === 'crawling';
  const isPaused = status === 'paused';
  const isDone = status === 'complete';
  const isIdle = status === 'idle';

  const currentNode = nodes.find(n => n.id === currentNodeId);
  const pendingCount = config.strategy === 'bfs' ? queue.length : stack.length;

  // Filtered and sorted results table
  const filteredNodes = useMemo(() => {
    return nodes
      .filter(n => {
        // Text search
        if (searchQuery && !n.canonicalUrl.toLowerCase().includes(searchQuery.toLowerCase()) && !n.url.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        // Category filter
        if (resultsFilter === 'visited') return n.status === 'visited';
        if (resultsFilter === 'cycles') return n.status === 'cycle' || n.cycleInvolved;
        if (resultsFilter === 'broken') return n.status === 'broken' || (n.httpStatus && n.httpStatus >= 400);
        if (resultsFilter === 'duplicates') return n.status === 'duplicate';
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'url') cmp = a.canonicalUrl.localeCompare(b.canonicalUrl);
        else if (sortField === 'depth') cmp = a.depth - b.depth;
        else if (sortField === 'status') cmp = (a.httpStatus || 200) - (b.httpStatus || 200);
        else if (sortField === 'links') cmp = a.outgoingLinks.length - b.outgoingLinks.length;
        return sortAsc ? cmp : -cmp;
      });
  }, [nodes, resultsFilter, searchQuery, sortField, sortAsc]);

  const handleStart = () => {
    startCrawl();
  };

  const handleViewPages = () => {
    resultsTableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewErrors = () => {
    setResultsFilter('broken');
    resultsTableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030712] pt-14 flex flex-col text-slate-200 selection:bg-cyan-500 selection:text-slate-900">

      {/* ══════════════════════════════════════════════════════════
          1. COMPACT HERO & PRIMARY CRAWL INPUT
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-slate-950 via-[#030712] to-[#030712] border-b border-slate-800 px-4 pt-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Compact Branding Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-1">
              <Triangle className="w-3.5 h-3.5" fill="none" strokeWidth={2} />
              <span>BYEBYEBERMUDA · WEBSITE CRAWLER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Break the Loop. <span className="text-cyan-400">Crawl Smarter.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Crawl websites safely and detect circular links before they become repeated work.
            </p>
          </div>

          {/* URL Input Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={config.startUrl}
                  onChange={(e) => setConfig({ startUrl: e.target.value, demoMode: false })}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                />
              </div>

              {/* Start / Pause / Resume Button */}
              <div className="flex items-center gap-2">
                {(isIdle || isDone) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    className="w-full sm:w-auto px-7 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    START CRAWL
                  </motion.button>
                )}

                {isCrawling && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={pauseCrawl}
                    className="w-full sm:w-auto px-7 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    PAUSE
                  </motion.button>
                )}

                {isPaused && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={resumeCrawl}
                    className="w-full sm:w-auto px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    RESUME
                  </motion.button>
                )}

                <button
                  onClick={resetCrawl}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
                  title="Reset crawl state"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simple Default Configuration Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Strategy toggle */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase px-1 font-mono font-bold">STRATEGY:</span>
                  {(['bfs', 'dfs'] as const).map((strat) => (
                    <button
                      key={strat}
                      onClick={() => setStrategy(strat)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        config.strategy === strat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {strat.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Max Pages */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-500 text-[10px]">MAX PAGES:</span>
                  <span className="text-cyan-400 font-bold">{config.maxPages}</span>
                </div>

                {/* Max Depth */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-500 text-[10px]">MAX DEPTH:</span>
                  <span className="text-cyan-400 font-bold">{config.maxDepth}</span>
                </div>

                {/* Domain Scope */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                  <span className="text-slate-500 text-[10px]">DOMAIN:</span>
                  <span className="text-slate-300 font-medium">Same Domain</span>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 font-medium transition-colors"
              >
                <span>ADVANCED OPTIONS</span>
                {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Advanced Options Drawer */}
            <AnimatePresence>
              {advancedOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card p-4 space-y-4 border-slate-800 bg-slate-950/90 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Crawl Delay */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Crawl Delay:</span>
                        <span className="font-mono text-amber-400 font-bold">{config.crawlDelay}ms</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1500"
                        step="50"
                        value={config.crawlDelay}
                        onChange={(e) => setConfig({ crawlDelay: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* Max Pages Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Max Pages Limit:</span>
                        <span className="font-mono text-cyan-400 font-bold">{config.maxPages}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="150"
                        step="5"
                        value={config.maxPages}
                        onChange={(e) => setConfig({ maxPages: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* robots.txt Compliance */}
                    <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div>
                        <span className="font-semibold block text-[11px]">Respect robots.txt</span>
                        <span className="text-[9px] text-slate-500">Simulate robots policy</span>
                      </div>
                      <button
                        onClick={() => setConfig({ respectRobotsTxt: !config.respectRobotsTxt })}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          config.respectRobotsTxt ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {config.respectRobotsTxt ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Demo Scenarios Quick Pick */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                      Demo Scenarios (Click to load & test):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SCENARIO_LIST.map((sc) => (
                        <button
                          key={sc.id}
                          onClick={() => {
                            setScenario(sc.id as DemoScenario);
                            setConfig({ demoMode: true });
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            config.demoScenario === sc.id
                              ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300 font-bold shadow-sm'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. ACTIVE CRAWL WORKSTATION (3-COLUMN LAYOUT)
      ══════════════════════════════════════════════════════════ */}
      <section className="flex-1 max-w-screen-2xl mx-auto w-full px-3 py-3">
        {/* Live Crawl Header Strip */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl mb-3 text-xs font-mono">
          <div className="flex items-center gap-3 truncate">
            <span className="text-slate-500 uppercase">CRAWLING:</span>
            <span className="text-cyan-400 font-bold truncate max-w-[280px] sm:max-w-md">
              {config.startUrl}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isCrawling ? 'bg-cyan-400 animate-pulse' : isDone ? 'bg-emerald-400' : isPaused ? 'bg-amber-400' : 'bg-slate-600'
              }`} />
              <span className={`font-bold ${
                isCrawling ? 'text-cyan-400' : isDone ? 'text-emerald-400' : isPaused ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {isCrawling ? '● CRAWLING' : isDone ? '● COMPLETE' : isPaused ? '● PAUSED' : '● READY'}
              </span>
            </div>

            <div className="hidden sm:block text-slate-400">
              Progress: <strong className="text-white">{stats.pagesVisited}</strong> / {config.maxPages} pages
            </div>
          </div>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-3">

          {/* ── LEFT: Compact Controls & Parameters ── */}
          <div className="space-y-3 lg:h-[calc(100vh-17rem)] overflow-y-auto pr-1">
            <CrawlerControls />
          </div>

          {/* ── CENTER: Live Graph (Centerpiece) + Live Activity Log ── */}
          <div className="flex flex-col gap-3">
            {/* Interactive Graph Canvas */}
            <div className="relative h-[430px] lg:h-[calc(100vh-25rem)]">
              <CrawlerGraph />
            </div>

            {/* Live Activity Console */}
            <div className="card h-[200px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Activity</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {stats.pagesVisited} visited · {stats.cyclesDetected} cycles blocked
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <CrawlerConsole />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Compact Crawl Status & Current Page Inspector ── */}
          <div className="space-y-3 lg:h-[calc(100vh-17rem)] overflow-y-auto">

            {/* 1. Compact Crawl Status Panel */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  CRAWL STATUS
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {stats.crawlTime}s
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Discovered</span>
                  <span className="text-sm font-bold text-slate-200">{stats.pagesDiscovered}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Visited</span>
                  <span className="text-sm font-bold text-emerald-400">{stats.pagesVisited}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Pending</span>
                  <span className="text-sm font-bold text-blue-400">{pendingCount}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-red-500/20">
                  <span className="text-[9px] text-slate-500 uppercase block">Cycles Detected</span>
                  <span className="text-sm font-bold text-red-400">{stats.cyclesDetected}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Duplicates</span>
                  <span className="text-sm font-bold text-purple-300">{stats.duplicatesSkipped}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Broken Links</span>
                  <span className="text-sm font-bold text-orange-400">{stats.brokenLinks}</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Current Depth: <strong className="text-slate-200">{stats.maxDepthReached}</strong></span>
                <span>Requests Saved: <strong className="text-cyan-400">{stats.requestsSaved}</strong></span>
              </div>
            </div>

            {/* 2. Compact Current Page Panel */}
            <div className="card p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  CURRENT PAGE
                </h3>
                {currentNode && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                    {currentNode.httpStatus || 200} OK
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">URL:</span>
                  <div className="text-cyan-300 text-[11px] truncate font-bold">
                    {currentCanonical || currentUrl || 'Awaiting Next Link'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-[10px]">
                  <div>
                    <span className="text-slate-500">Depth:</span>{' '}
                    <span className="text-slate-300 font-bold">{currentNode?.depth ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Links:</span>{' '}
                    <span className="text-slate-300 font-bold">{currentNode?.outgoingLinks.length ?? 0}</span>
                  </div>
                </div>

                {currentNode?.parentId && (
                  <div className="text-[10px] pt-1 text-slate-400 truncate">
                    <span className="text-slate-500">Parent:</span> {currentNode.parentId}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Cycle Alert Quick Trigger */}
            {detectedCycles.length > 0 && (
              <div
                onClick={() => navigate('/cycles')}
                className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl cursor-pointer hover:bg-red-950/60 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-red-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    ⚠ {detectedCycles.length} CYCLES DETECTED
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <p className="text-[10px] text-slate-300">
                  Repeated traversals blocked. Click to inspect exact loop chains.
                </p>
              </div>
            )}

            {/* 4. Secondary Technical Inspector Tabs (Collapsible / Selectable) */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-slate-800 bg-slate-950 text-[9px] font-mono">
                {[
                  { id: 'inspector', label: 'Inspector' },
                  { id: 'pipeline', label: 'Pipeline' },
                  { id: 'bloom', label: 'Bloom' },
                  { id: 'hashset', label: 'HashSet' },
                  { id: 'queue', label: 'Queue' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRightTab(t.id as RightTab)}
                    className={`flex-1 py-1.5 text-center transition-colors border-b-2 -mb-px ${
                      rightTab === t.id
                        ? 'text-cyan-400 border-cyan-500 bg-cyan-500/10 font-bold'
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-2 max-h-52 overflow-y-auto">
                {rightTab === 'inspector' && <NodeDetails />}
                {rightTab === 'pipeline' && <AlgorithmPipeline />}
                {rightTab === 'bloom' && <BloomFilterVisualizer />}
                {rightTab === 'hashset' && <HashSetVisualizer />}
                {rightTab === 'queue' && <QueueVisualizer />}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. CRAWL COMPLETE SUMMARY & SEARCHABLE RESULTS TABLE
      ══════════════════════════════════════════════════════════ */}
      {nodes.length > 0 && (
        <section ref={resultsTableRef} className="max-w-screen-2xl mx-auto w-full px-4 py-6 border-t border-slate-800/80 space-y-6">

          {/* Crawl Complete Summary Banner */}
          {isDone && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 bg-slate-950 border-emerald-500/40 shadow-2xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">CRAWL COMPLETE</h2>
                    <p className="text-xs font-mono text-cyan-400">{config.startUrl}</p>
                  </div>
                </div>

                {/* Primary Result Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleViewPages}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    VIEW PAGES
                  </button>
                  <button
                    onClick={() => navigate('/cycles')}
                    className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    VIEW CYCLES ({stats.cyclesDetected})
                  </button>
                  {stats.brokenLinks > 0 && (
                    <button
                      onClick={handleViewErrors}
                      className="px-3.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      VIEW ERRORS ({stats.brokenLinks})
                    </button>
                  )}
                  <button
                    onClick={() => exportJson(crawlerState)}
                    className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    EXPORT REPORT
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold font-mono text-emerald-400">{stats.pagesVisited}</span>
                  <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Pages Crawled</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold font-mono text-cyan-400">{stats.exactAccepted}</span>
                  <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Unique Pages</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-red-500/20">
                  <span className="text-lg font-bold font-mono text-red-400">{stats.cyclesDetected}</span>
                  <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Cycles Prevented</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold font-mono text-purple-300">{stats.duplicatesSkipped}</span>
                  <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Duplicates Skipped</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold font-mono text-orange-400">{stats.brokenLinks}</span>
                  <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Broken Links</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-lg font-bold font-mono text-slate-200">{stats.crawlTime}s</span>
                  <span className="text-[10px] text-slate-500 uppercase block mt-0.5">Crawl Time</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Searchable / Filterable Results Table */}
          <div className="card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <List className="w-4 h-4 text-cyan-400" />
                  <span>Crawl Results Table</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-400">
                    {filteredNodes.length} / {nodes.length}
                  </span>
                </h3>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search field */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search URLs..."
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 w-48"
                  />
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {(['all', 'visited', 'cycles', 'broken', 'duplicates'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setResultsFilter(filter)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                        resultsFilter === filter
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* CSV Download */}
                <button
                  onClick={() => exportCsv(nodes)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* The Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                    <th
                      className="p-3 cursor-pointer hover:text-cyan-300"
                      onClick={() => { setSortField('url'); setSortAsc(!sortAsc); }}
                    >
                      URL {sortField === 'url' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th
                      className="p-3 cursor-pointer hover:text-cyan-300"
                      onClick={() => { setSortField('status'); setSortAsc(!sortAsc); }}
                    >
                      STATUS {sortField === 'status' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th
                      className="p-3 cursor-pointer hover:text-cyan-300"
                      onClick={() => { setSortField('depth'); setSortAsc(!sortAsc); }}
                    >
                      DEPTH {sortField === 'depth' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th
                      className="p-3 cursor-pointer hover:text-cyan-300"
                      onClick={() => { setSortField('links'); setSortAsc(!sortAsc); }}
                    >
                      LINKS {sortField === 'links' ? (sortAsc ? '▲' : '▼') : ''}
                    </th>
                    <th className="p-3">RESULT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredNodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-mono text-xs">
                        No URLs match your search or active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredNodes.map((n) => (
                      <tr
                        key={n.id}
                        onClick={() => selectNode(n.id)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="p-3 text-cyan-300 truncate max-w-sm font-semibold">
                          {n.canonicalUrl}
                        </td>
                        <td className="p-3">
                          <span className={n.httpStatus && n.httpStatus >= 400 ? 'text-orange-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {n.httpStatus || 200}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{n.depth}</td>
                        <td className="p-3 text-slate-400">{n.outgoingLinks.length}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            n.status === 'visited' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' :
                            n.status === 'cycle' ? 'bg-red-500/20 border border-red-500/40 text-red-400' :
                            n.status === 'broken' ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400' :
                            n.status === 'duplicate' ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {n.status === 'visited' && <Check className="w-3 h-3" />}
                            {n.status === 'cycle' && <Ban className="w-3 h-3" />}
                            {n.status === 'visited' ? 'Crawled' :
                             n.status === 'cycle' ? 'Cycle Blocked' :
                             n.status === 'broken' ? 'Broken (404/500)' :
                             n.status === 'duplicate' ? 'Duplicate' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      )}

      <Footer />
    </div>
  );
}
