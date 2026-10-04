// ============================================================
// QUEUE / STACK VISUALIZER
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { List, Layers } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { getUrlLabel } from '../../engine/canonicalize';

export default function QueueVisualizer() {
  const { crawlerState } = useCrawlerStore();
  const { config, queue, stack, nodes } = crawlerState;
  const isBfs = config.strategy === 'bfs';
  const frontier = isBfs ? queue : stack;

  const getNodeLabel = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? node.pageTitle : id;
  };

  const getNodeUrl = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? node.canonicalUrl : id;
  };

  return (
    <div className="card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isBfs
            ? <List className="w-4 h-4 text-blue-400" />
            : <Layers className="w-4 h-4 text-violet-400" />
          }
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isBfs ? 'BFS Queue' : 'DFS Stack'}
            </h3>
            <p className="text-[10px] text-slate-500">{frontier.length} items</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          isBfs
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
        }`}>
          {isBfs ? 'FIFO' : 'LIFO'}
        </div>
      </div>

      {/* Frontier indicator */}
      <div className="mb-2">
        <div className={`text-[9px] font-bold uppercase tracking-widest text-center py-1 rounded border ${
          isBfs
            ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
            : 'text-violet-400 border-violet-500/30 bg-violet-500/10'
        }`}>
          {isBfs ? '← FRONT (next to process)' : '▲ TOP (next to process)'}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {frontier.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-600 font-mono">
              {crawlerState.status === 'complete' ? 'Crawl complete — frontier empty' : 'Frontier empty'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {(isBfs ? frontier : [...frontier].reverse()).map((id, idx) => {
              const isNext = idx === 0;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: isBfs ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-2 px-2 py-2 rounded border text-xs transition-all ${
                    isNext
                      ? isBfs
                        ? 'border-blue-500/60 bg-blue-500/10 text-blue-300'
                        : 'border-violet-500/60 bg-violet-500/10 text-violet-300'
                      : 'border-slate-700/50 bg-slate-800/30 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] text-slate-600 font-mono w-4 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{getNodeLabel(id)}</div>
                    <div className="text-[9px] font-mono text-slate-600 truncate">{getNodeUrl(id)}</div>
                  </div>
                  {isNext && (
                    <span className={`text-[9px] font-bold ${isBfs ? 'text-blue-400' : 'text-violet-400'}`}>
                      NEXT
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Rear indicator */}
      {frontier.length > 0 && (
        <div className="mt-2">
          <div className={`text-[9px] font-bold uppercase tracking-widest text-center py-1 rounded border ${
            isBfs
              ? 'text-blue-400/50 border-blue-500/20 bg-blue-500/5'
              : 'text-violet-400/50 border-violet-500/20 bg-violet-500/5'
          }`}>
            {isBfs ? '→ REAR (new items added here)' : '▼ BOTTOM'}
          </div>
        </div>
      )}

      {/* Characteristics */}
      <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${isBfs ? 'text-blue-400' : 'text-violet-400'}`}>
            {isBfs ? 'BFS' : 'DFS'}
          </span>
          <span>—</span>
          <span>{isBfs ? 'Level-by-level exploration' : 'Depth-first exploration'}</span>
        </div>
        <div>Traversal: O(V + E)</div>
      </div>
    </div>
  );
}
