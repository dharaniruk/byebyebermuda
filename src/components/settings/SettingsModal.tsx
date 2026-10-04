// ============================================================
// SETTINGS MODAL COMPONENT
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Sliders, Eye, Zap, Shield, RotateCcw } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { crawlerState, setConfig, setAnimationSpeed, resetCrawl } = useCrawlerStore();
  const { config, animationSpeed } = crawlerState;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                System & Simulation Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* 1. Traversal Strategy */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Default Traversal Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['bfs', 'dfs'] as const).map((strat) => (
                  <button
                    key={strat}
                    onClick={() => setConfig({ strategy: strat })}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      config.strategy === strat
                        ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {strat.toUpperCase()} ({strat === 'bfs' ? 'Queue / Level' : 'Stack / Depth'})
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Simulation Step Speed */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Crawl Step Delay (ms)
                </label>
                <span className="font-mono text-xs text-amber-400">{config.crawlDelay} ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="50"
                value={config.crawlDelay}
                onChange={(e) => setConfig({ crawlDelay: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Fast (50ms)</span>
                <span>Balanced (600ms)</span>
                <span>Slow (1500ms)</span>
              </div>
            </div>

            {/* 3. Safety Limits */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-400" /> Hard Crawl Limits
              </label>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Max Page Threshold:</span>
                  <span className="font-mono text-green-400">{config.maxPages} pages</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={config.maxPages}
                  onChange={(e) => setConfig({ maxPages: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Max Tree Depth:</span>
                  <span className="font-mono text-green-400">Depth {config.maxDepth}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={config.maxDepth}
                  onChange={(e) => setConfig({ maxDepth: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-400"
                />
              </div>
            </div>

            {/* 4. Reset Defaults */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setConfig({
                    strategy: 'bfs',
                    maxPages: 50,
                    maxDepth: 10,
                    crawlDelay: 600,
                  });
                  resetCrawl();
                }}
                className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Default Settings & Reset
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-cyan-500 text-slate-900 font-bold text-xs rounded-xl hover:bg-cyan-400 transition-colors uppercase tracking-wider"
            >
              Save & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
