// ============================================================
// CYCLE DETECTOR PANEL
// ============================================================

import { motion } from 'framer-motion';
import { AlertOctagon, ShieldAlert, ArrowRight, Ban, Zap, RotateCcw } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';

export default function CycleDetector() {
  const { crawlerState } = useCrawlerStore();
  const { detectedCycles, stats, nodes } = crawlerState;

  return (
    <div className="card p-4 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Cycle Detection Engine
          </h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
          stats.cyclesDetected > 0
            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {stats.cyclesDetected} BLOCKED
        </span>
      </div>

      {/* Hero Banner for Cycles */}
      {stats.cyclesDetected > 0 ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl mb-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
        >
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>CYCLE DETECTED & PREVENTED</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            A directed circular edge was discovered pointing to an already visited canonical URL.
            Traversal along this edge was <strong>immediately blocked</strong> to prevent infinite recursion.
          </p>
          <div className="mt-2 text-[10px] text-red-300/80 font-mono bg-red-950/60 p-1.5 rounded border border-red-500/20">
            Action: Visited Set Match → Fetch Aborted → Edge Flagged Blocked
          </div>
        </motion.div>
      ) : (
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl mb-3 text-center">
          <p className="text-xs text-slate-400">No cyclic loops detected yet in current crawl run.</p>
          <p className="text-[10px] text-slate-600 mt-1">Start a crawl with the "Simple Cycle" scenario to see this in action.</p>
        </div>
      )}

      {/* Cycle Traversal History */}
      <div className="flex-1 space-y-2 mb-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
          Loop Interception Log:
        </span>

        {detectedCycles.length === 0 ? (
          <div className="h-28 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
            Awaiting cyclic link encounters...
          </div>
        ) : (
          detectedCycles.map((cycle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2.5 bg-slate-950 border border-red-500/30 rounded-lg text-xs"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                <span>INTERCEPTION #{i + 1}</span>
                <span>{new Date(cycle.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-red-300 flex-wrap">
                <Ban className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="font-bold text-red-400 truncate">{cycle.path.join(' → ')}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Without cycle protection, this traversal branch would loop indefinitely.
              </p>
            </motion.div>
          ))
        )}
      </div>

      {/* DSA Theory Breakdown */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5 text-[11px] text-slate-400">
        <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Why Visited Tracking Works:</span>
        </div>
        <p className="leading-tight">
          A directed web graph G = (V, E) with back-edges produces infinite walks unless visited vertices are pruned upon discovery.
        </p>
        <div className="flex justify-between font-mono text-[10px] text-cyan-400 pt-1 border-t border-slate-800">
          <span>Time: O(V + E)</span>
          <span>Space: O(V)</span>
        </div>
      </div>
    </div>
  );
}
