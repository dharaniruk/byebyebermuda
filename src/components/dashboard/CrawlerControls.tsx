// ============================================================
// CRAWLER CONTROLS — left sidebar panel
// ============================================================

import { motion } from 'framer-motion';
import {
  Play, Pause, RotateCcw, SkipForward, Zap, Settings2,
  Globe, List, Hash, Clock, Layers, ToggleLeft, ToggleRight,
  ChevronDown,
} from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { SCENARIO_LIST } from '../../engine/graphGenerator';
import { DemoScenario } from '../../engine/types';
import { useState } from 'react';

export default function CrawlerControls() {
  const {
    crawlerState,
    startCrawl,
    pauseCrawl,
    resumeCrawl,
    resetCrawl,
    stepCrawl,
    fastForward,
    setConfig,
    setScenario,
    setStrategy,
  } = useCrawlerStore();

  const { config, status } = crawlerState;
  const [scenarioOpen, setScenarioOpen] = useState(false);

  const isRunning = status === 'crawling';
  const isPaused = status === 'paused';
  const isDone = status === 'complete';
  const canStart = status === 'idle' || isDone;

  const selectedScenario = SCENARIO_LIST.find(s => s.id === config.demoScenario);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-cyan-400" />
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Crawler Controls
        </h2>
      </div>

      {/* Demo Mode Toggle */}
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-300">Demo Mode</span>
          <button
            onClick={() => setConfig({ demoMode: !config.demoMode })}
            className="transition-colors"
          >
            {config.demoMode
              ? <ToggleRight className="w-6 h-6 text-cyan-400" />
              : <ToggleLeft className="w-6 h-6 text-slate-500" />}
          </button>
        </div>
        {config.demoMode && (
          <div className="relative">
            <button
              onClick={() => setScenarioOpen(!scenarioOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:border-cyan-500/50 transition-colors"
            >
              <span>{selectedScenario?.name ?? 'Select scenario'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
            {scenarioOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden z-20 shadow-xl">
                {SCENARIO_LIST.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setScenario(s.id as DemoScenario); setScenarioOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${
                      s.id === config.demoScenario ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-slate-500 mt-0.5 text-[10px] leading-tight">{s.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!config.demoMode && (
          <div className="mt-2">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">Start URL</label>
            <input
              type="text"
              value={config.startUrl}
              onChange={e => setConfig({ startUrl: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
              placeholder="https://example.com"
            />
            <p className="text-[10px] text-amber-400/70 mt-1">Simulation mode only — no real HTTP requests</p>
          </div>
        )}
      </div>

      {/* Strategy */}
      <div className="card p-3">
        <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
          <List className="w-3 h-3" /> Strategy
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['bfs', 'dfs'] as const).map(strat => (
            <button
              key={strat}
              onClick={() => setStrategy(strat)}
              className={`py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                config.strategy === strat
                  ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-400'
                  : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {strat}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          {config.strategy === 'bfs'
            ? 'Breadth-First Search — explores level by level using a queue'
            : 'Depth-First Search — explores depth-first using a stack'}
        </p>
      </div>

      {/* Parameters */}
      <div className="card p-3 space-y-3">
        <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Settings2 className="w-3 h-3" /> Parameters
        </label>

        {[
          { label: 'Max Pages', icon: Globe, key: 'maxPages', min: 1, max: 200, step: 1 },
          { label: 'Max Depth', icon: Layers, key: 'maxDepth', min: 1, max: 20, step: 1 },
          { label: 'Crawl Delay (ms)', icon: Clock, key: 'crawlDelay', min: 50, max: 2000, step: 50 },
        ].map(({ label, icon: Icon, key, min, max, step }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Icon className="w-3 h-3" /> {label}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {config[key as keyof typeof config] as number}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={config[key as keyof typeof config] as number}
              onChange={e => setConfig({ [key]: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        ))}
      </div>

      {/* Control buttons */}
      <div className="card p-3 space-y-2">
        <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Play className="w-3 h-3" /> Controls
        </label>

        {canStart && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startCrawl}
            className="w-full py-2.5 bg-cyan-500/20 border border-cyan-500/60 text-cyan-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" /> Start Crawl
          </motion.button>
        )}

        {isRunning && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={pauseCrawl}
            className="w-full py-2.5 bg-amber-500/20 border border-amber-500/60 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Pause className="w-3.5 h-3.5" /> Pause
          </motion.button>
        )}

        {isPaused && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={resumeCrawl}
            className="w-full py-2.5 bg-green-500/20 border border-green-500/60 text-green-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" /> Resume
          </motion.button>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={stepCrawl}
            disabled={isRunning || isDone}
            className="py-2 bg-violet-500/10 border border-violet-500/40 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-3.5 h-3.5" /> Step
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fastForward}
            disabled={isRunning || isDone}
            className="py-2 bg-blue-500/10 border border-blue-500/40 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="w-3.5 h-3.5" /> Fast
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={resetCrawl}
          className="w-full py-2 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs font-medium hover:text-slate-200 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </motion.button>
      </div>

      {/* Status indicator */}
      <div className="card p-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'crawling' ? 'bg-cyan-400 animate-pulse' :
            status === 'complete' ? 'bg-green-400' :
            status === 'paused' ? 'bg-amber-400' :
            status === 'error' ? 'bg-red-400' :
            'bg-slate-600'
          }`} />
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
            {status === 'idle' ? 'READY' :
             status === 'crawling' ? 'CRAWLING' :
             status === 'paused' ? 'PAUSED' :
             status === 'complete' ? 'COMPLETE' : 'ERROR'}
          </span>
        </div>
        {status === 'crawling' && (
          <div className="mt-2">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
