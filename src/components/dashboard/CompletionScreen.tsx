// ============================================================
// COMPLETION SCREEN
// ============================================================

import { motion } from 'framer-motion';
import { CheckCircle, Download, RotateCcw } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { exportJson, exportCsv } from '../../utils/export';

export default function CompletionScreen() {
  const { crawlerState, resetCrawl } = useCrawlerStore();
  const { stats, nodes, edges } = crawlerState;

  if (crawlerState.status !== 'complete') return null;

  const handleExportJson = () => {
    exportJson(crawlerState);
  };

  const handleExportCsv = () => {
    exportCsv(nodes);
  };

  const items = [
    { label: 'Pages Visited', value: stats.pagesVisited, color: 'text-green-400' },
    { label: 'Unique URLs', value: stats.exactAccepted, color: 'text-cyan-400' },
    { label: 'Cycles Prevented', value: stats.cyclesDetected, color: 'text-red-400' },
    { label: 'Duplicates Skipped', value: stats.duplicatesSkipped, color: 'text-amber-400' },
    { label: 'Broken Links', value: stats.brokenLinks, color: 'text-orange-400' },
    { label: 'Max Depth', value: stats.maxDepthReached, color: 'text-violet-400' },
    { label: 'Requests Saved', value: stats.requestsSaved, color: 'text-blue-400' },
    { label: 'Crawl Time', value: `${stats.crawlTime.toFixed(2)}s`, color: 'text-slate-300' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/90 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-b border-slate-700 p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white tracking-wider mb-1">CRAWL COMPLETE</h2>
          <p className="text-sm text-slate-400">Reachable graph successfully explored</p>
        </div>

        {/* Stats grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {items.map(item => (
              <div key={item.label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
                <div className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Summary text */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl mb-6">
            <p className="text-xs text-slate-300 leading-relaxed text-center">
              <span className="text-cyan-400 font-bold">BYEBYEBERMUDA</span> successfully explored the reachable
              graph without repeatedly processing previously visited canonical pages.
              {stats.cyclesDetected > 0 && ` ${stats.cyclesDetected} cycle${stats.cyclesDetected > 1 ? 's were' : ' was'} detected and blocked.`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportJson}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all"
            >
              <Download className="w-4 h-4" /> Export JSON
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCsv}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetCrawl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> New Crawl
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
