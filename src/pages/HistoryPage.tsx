// ============================================================
// CRAWL HISTORY PAGE — Audit Log of Previous Sessions
// ============================================================

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  History, Play, Trash2, FileText, CheckCircle2, RotateCcw,
  ArrowRight, ShieldAlert, Globe, Clock, Layers, Sparkles
} from 'lucide-react';
import { useCrawlerStore } from '../store/crawlerStore';
import Footer from '../components/layout/Footer';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { crawlerState, deleteHistoryItem, clearHistory, runFromHistory } = useCrawlerStore();
  const { history } = crawlerState;

  const handleRunAgain = (item: any) => {
    runFromHistory(item);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#030712] pt-14 flex flex-col">
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex-1 w-full">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-2">
              <History className="w-3.5 h-3.5" />
              SESSION AUDIT TRAIL
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              CRAWL HISTORY & TELEMETRY LOGS
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Historical record of previous web crawler runs, cycle interdiction rates, and execution statistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3.5 py-2 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              New Crawl Session
            </button>
          </div>
        </div>

        {/* ── History Table / Cards ── */}
        {history.length === 0 ? (
          <div className="card p-12 text-center border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <History className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-bold text-slate-300">No Crawl History Recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run a crawl session from the dashboard and completed crawl runs will automatically appear here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" /> Start First Crawl
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {history.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="card p-5 border-slate-800 hover:border-slate-700/80 bg-slate-950/50 transition-all shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: URL, Strategy, Scenario, Timestamp */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-cyan-400">
                        {item.startUrl}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-violet-300 uppercase">
                        {item.strategy.toUpperCase()}
                      </span>
                      {item.demoMode && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                          {item.scenario || 'Demo Scenario'}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Stats strip */}
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-1">
                      <span>Pages: <strong className="text-slate-200">{item.pagesVisited}</strong>/{item.pagesDiscovered}</span>
                      <span>Cycles: <strong className="text-red-400">{item.cyclesDetected}</strong></span>
                      <span>Duplicates: <strong className="text-purple-300">{item.duplicatesSkipped}</strong></span>
                      <span>Depth: <strong className="text-slate-300">{item.maxDepth}</strong></span>
                      <span>Duration: <strong className="text-emerald-400">{item.duration}s</strong></span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunAgain(item)}
                      className="px-3.5 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      RUN AGAIN
                    </button>

                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 rounded-xl transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
