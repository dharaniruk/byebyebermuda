// ============================================================
// BLOOM FILTER VISUALIZER
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useCrawlerStore } from '../../store/crawlerStore';

export default function BloomFilterVisualizer() {
  const { crawlerState } = useCrawlerStore();
  const { bloomFilter } = crawlerState;
  const { bits, lastHashPositions, lastCheckedUrl, lastResult } = bloomFilter;

  const setBitsCount = bits.filter(b => b === 1).length;

  return (
    <div className="card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Bloom Filter</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Compact probabilistic pre-check</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-cyan-400">{setBitsCount}/{bits.length}</div>
          <div className="text-[10px] text-slate-500">bits set</div>
        </div>
      </div>

      {/* Bit array */}
      <div className="flex flex-wrap gap-1 mb-3">
        {bits.map((bit, idx) => {
          const isHashPos = lastHashPositions.includes(idx);
          return (
            <motion.div
              key={idx}
              animate={isHashPos ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-5 h-5 rounded text-[8px] font-mono font-bold flex items-center justify-center transition-all duration-300 ${
                isHashPos
                  ? 'bg-amber-500/30 border border-amber-400 text-amber-300'
                  : bit === 1
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-800 border border-slate-700 text-slate-600'
              }`}
            >
              {bit}
            </motion.div>
          );
        })}
      </div>

      {/* Hash positions */}
      {lastHashPositions.length > 0 && (
        <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
          <p className="text-[10px] text-slate-500 mb-1.5">Hash Functions → Bit Positions</p>
          <div className="flex gap-3">
            {lastHashPositions.map((pos, i) => (
              <div key={i} className="text-center">
                <div className="text-[9px] text-slate-600">H{i + 1}</div>
                <div className="text-xs font-mono text-amber-400 font-bold">{pos}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {lastCheckedUrl && (
        <div className={`p-2 rounded-lg border text-xs font-mono mb-3 ${
          lastResult === 'definitely_new'
            ? 'border-green-500/40 bg-green-500/10'
            : 'border-amber-500/40 bg-amber-500/10'
        }`}>
          <div className="text-[10px] text-slate-500 mb-0.5 truncate">
            {lastCheckedUrl.length > 40 ? lastCheckedUrl.substring(0, 40) + '…' : lastCheckedUrl}
          </div>
          <div className={`font-bold ${lastResult === 'definitely_new' ? 'text-green-400' : 'text-amber-400'}`}>
            {lastResult === 'definitely_new' ? '✓ DEFINITELY NEW' : '? POSSIBLY SEEN'}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="mt-auto space-y-2">
        <div className="p-2 bg-slate-800/40 rounded-lg">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            <span className="text-amber-400 font-bold">False Positive Warning:</span>{' '}
            "Possibly Seen" does NOT guarantee the URL was added. The Exact Hash Set provides
            correctness — the Bloom Filter is only a fast pre-check.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-slate-800/40 rounded-lg">
            <div className="text-xs font-bold text-cyan-400">O(k)</div>
            <div className="text-[10px] text-slate-500">Lookup time</div>
          </div>
          <div className="p-2 bg-slate-800/40 rounded-lg">
            <div className="text-xs font-bold text-violet-400">~18%</div>
            <div className="text-[10px] text-slate-500">Relative memory</div>
          </div>
        </div>
      </div>
    </div>
  );
}
