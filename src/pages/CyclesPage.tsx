// ============================================================
// CYCLES REPORT PAGE — Dedicated Loop Interception Audit
// ============================================================

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, AlertOctagon, ArrowRight, Ban, Play, ExternalLink,
  CheckCircle2, Sparkles, AlertTriangle, Layers, RotateCcw
} from 'lucide-react';
import { useCrawlerStore } from '../store/crawlerStore';
import Footer from '../components/layout/Footer';

export default function CyclesPage() {
  const navigate = useNavigate();
  const { crawlerState, highlightCycle, startCrawl } = useCrawlerStore();
  const { detectedCycles, stats, nodes } = crawlerState;

  const handleShowInGraph = (cycleId: string) => {
    highlightCycle(cycleId);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#030712] pt-14 flex flex-col">
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex-1 w-full">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              CYCLE INTERCEPTION TELEMETRY
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              CYCLES & LOOP DETECTION REPORT
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Real-time audit log of directed circular loops intercepted by the exact visited set and blocked from repeated execution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Back to Live Crawl
            </button>
          </div>
        </div>

        {/* ── Summary Counters ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 border-red-500/30 bg-red-950/20">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Cycles Intercepted
            </span>
            <span className="text-2xl font-bold font-mono text-red-400">
              {stats.cyclesDetected}
            </span>
          </div>

          <div className="card p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Requests Saved
            </span>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {stats.requestsSaved}
            </span>
          </div>

          <div className="card p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Infinite Loops Prevented
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {stats.cyclesDetected > 0 ? stats.cyclesDetected : 0}
            </span>
          </div>

          <div className="card p-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Loop Traversal State
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1 mt-1.5">
              <CheckCircle2 className="w-4 h-4" /> 100% PROTECTED
            </span>
          </div>
        </div>

        {/* ── Cycle Detection Records ── */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Detected Loop Chains</span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs font-mono">
                {detectedCycles.length}
              </span>
            </h2>
          </div>

          {detectedCycles.length === 0 ? (
            <div className="card p-12 text-center border-dashed border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-300">No Cycles Encountered Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No circular links have been detected in the current session. Run a crawl using the <strong>"Simple Cycle"</strong> or <strong>"Multiple Cycles"</strong> demo scenario to see loop detection in action.
              </p>
              <button
                onClick={() => {
                  useCrawlerStore.getState().setScenario('simple_cycle');
                  useCrawlerStore.getState().startCrawl();
                  navigate('/');
                }}
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Run Simple Cycle Demo
              </button>
            </div>
          ) : (
            detectedCycles.map((cycle, index) => (
              <motion.div
                key={cycle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-5 border-red-500/30 bg-slate-950/60 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold rounded-lg">
                      Cycle #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Timestamp: {new Date(cycle.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] rounded">
                      {cycle.path.length - 1} nodes · {cycle.path.length - 1} edges
                    </span>

                    <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> STATUS: BLOCKED
                    </span>

                    <button
                      onClick={() => handleShowInGraph(cycle.id)}
                      className="px-3 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      SHOW IN GRAPH
                    </button>
                  </div>
                </div>

                {/* The Cycle Loop Path visualization */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                    Circular Traversal Sequence:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    {cycle.path.map((stepUrl, i) => {
                      const isEndCycle = i === cycle.path.length - 1;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold ${
                            isEndCycle
                              ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                              : 'bg-slate-800 border border-slate-700 text-slate-300'
                          }`}>
                            {stepUrl.replace('https://demo.local', '') || '/'}
                          </span>
                          {i < cycle.path.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Diagnostic Note */}
                <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                  <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-400">Loop Severed: </span>
                    <span>
                      Target canonical URL <strong className="font-mono text-slate-200">{cycle.targetUrl}</strong> was already present in the exact visited set. The crawler dropped this candidate edge to prevent infinite traversal recursion.
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ── DSA Theory Lore ── */}
        <div className="card p-6 bg-slate-950 border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>How BYEBYEBERMUDA Guarantees Termination</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            In graph theory, a directed graph G = (V, E) contains a cycle if a directed path starts and ends at the same vertex. Without a visited set V_visited, graph traversal algorithms (BFS and DFS) will enter an infinite loop. BYEBYEBERMUDA enforces an invariant where each canonical URL u in V is processed at most once, guaranteeing total runtime bounded by O(V + E).
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
}
