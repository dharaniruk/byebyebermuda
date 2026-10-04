// ============================================================
// HASH SET VISUALIZER — Exact visited set panel
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Check, AlertCircle } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';

export default function HashSetVisualizer() {
  const { crawlerState } = useCrawlerStore();
  const { visitedSet, currentCanonical, nodes } = crawlerState;

  const visitedUrls = Array.from(visitedSet);
  const isCurrentInSet = currentCanonical && visitedSet.has(currentCanonical);

  return (
    <div className="card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" /> Exact Hash Set
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Canonical URL visited set</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono font-bold text-cyan-400">{visitedUrls.length}</div>
          <div className="text-[10px] text-slate-500">entries</div>
        </div>
      </div>

      {/* Current check */}
      {currentCanonical && (
        <div className={`mb-3 p-2 rounded-lg border text-xs ${
          isCurrentInSet
            ? 'border-red-500/40 bg-red-500/10'
            : 'border-green-500/40 bg-green-500/10'
        }`}>
          <div className="text-[10px] text-slate-500 mb-0.5">Checking:</div>
          <div className="font-mono text-[10px] truncate text-slate-300">{currentCanonical}</div>
          <div className={`mt-1 font-bold text-[10px] ${isCurrentInSet ? 'text-red-400' : 'text-green-400'}`}>
            {isCurrentInSet ? '✗ ALREADY VISITED — fetch skipped' : '✓ NOT FOUND — URL accepted'}
          </div>
        </div>
      )}

      {/* URL list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {visitedUrls.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-600 font-mono">Empty — no URLs visited yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visitedUrls.map((url, idx) => {
              const isHighlighted = url === currentCanonical;
              return (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded border text-[10px] font-mono transition-all ${
                    isHighlighted
                      ? 'border-red-500/50 bg-red-500/10 text-red-300'
                      : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="truncate flex-1">{url}</span>
                  {isHighlighted && (
                    <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Memory note */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-800/40 rounded text-center">
            <div className="text-xs font-bold text-slate-300">O(1)</div>
            <div className="text-[10px] text-slate-500">avg lookup</div>
          </div>
          <div className="p-2 bg-slate-800/40 rounded text-center">
            <div className="text-xs font-bold text-slate-300">O(V)</div>
            <div className="text-[10px] text-slate-500">memory</div>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          Exact Hash Set is the correctness layer — no false positives.
        </p>
      </div>
    </div>
  );
}
