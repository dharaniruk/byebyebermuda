// ============================================================
// NODE DETAILS — right panel, shows on node click
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Globe, Hash, Clock, CheckCircle, AlertTriangle, Link2, ArrowRight, Info,
} from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { CrawlNode } from '../../engine/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  undiscovered: { label: 'Undiscovered', color: 'text-slate-400' },
  queued:       { label: 'Queued', color: 'text-blue-400' },
  crawling:     { label: 'Crawling', color: 'text-cyan-400' },
  visited:      { label: 'Visited', color: 'text-green-400' },
  bloom_candidate: { label: 'Bloom Candidate', color: 'text-amber-400' },
  cycle:        { label: 'Cycle Detected', color: 'text-red-400' },
  duplicate:    { label: 'Duplicate', color: 'text-violet-400' },
  broken:       { label: 'Broken Link', color: 'text-orange-400' },
};

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`text-xs text-slate-200 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function NodeDetails() {
  const { crawlerState, selectNode } = useCrawlerStore();
  const { selectedNodeId, nodes } = crawlerState;

  const node: CrawlNode | undefined = nodes.find(n => n.id === selectedNodeId);

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="card h-full flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Page Inspector
              </h3>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status badge */}
          <div className="px-3 pt-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${
              node.status === 'visited' ? 'border-green-500/50 bg-green-500/10 text-green-400' :
              node.status === 'cycle' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
              node.status === 'broken' ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' :
              node.status === 'crawling' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' :
              node.status === 'duplicate' ? 'border-violet-500/50 bg-violet-500/10 text-violet-400' :
              'border-slate-700 bg-slate-800 text-slate-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                node.status === 'crawling' ? 'animate-pulse' : ''
              } ${STATUS_LABELS[node.status]?.color.replace('text-', 'bg-') ?? 'bg-slate-500'}`} />
              {STATUS_LABELS[node.status]?.label ?? node.status}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <Row label="Page Title" value={node.pageTitle} />
            <Row label="URL" value={node.url} mono />
            <Row label="Canonical URL" value={node.canonicalUrl} mono />
            <Row label="Depth" value={node.depth} />
            <Row
              label="HTTP Status"
              value={
                <span className={node.httpStatus && node.httpStatus >= 400 ? 'text-red-400' : 'text-green-400'}>
                  {node.httpStatus ?? 'N/A'}
                </span>
              }
            />
            <Row
              label="Response Time"
              value={node.responseTime ? `${node.responseTime}ms` : 'N/A'}
            />
            <Row
              label="Discovered"
              value={new Date(node.discoveredAt).toLocaleTimeString()}
            />
            <Row
              label="Visited"
              value={node.visitedAt ? new Date(node.visitedAt).toLocaleTimeString() : 'Not yet'}
            />
            <Row label="Content Type" value={node.contentType} mono />
            <Row
              label="Outgoing Links"
              value={node.outgoingLinks.length > 0 ? node.outgoingLinks.length : '—'}
            />
            <Row
              label="Cycle Involved"
              value={
                node.cycleInvolved
                  ? <span className="text-red-400 font-bold">YES ⚠</span>
                  : <span className="text-green-400">No</span>
              }
            />
            <Row
              label="Simulated"
              value={<span className="text-amber-400/80 text-[10px]">SIMULATED RESPONSE</span>}
            />
          </div>

          {/* Outgoing links */}
          {node.outgoingLinks.length > 0 && (
            <div className="border-t border-slate-800 p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Outgoing Links</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {node.outgoingLinks.slice(0, 5).map(link => (
                  <div key={link} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <ArrowRight className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                    <span className="truncate">{link}</span>
                  </div>
                ))}
                {node.outgoingLinks.length > 5 && (
                  <div className="text-[10px] text-slate-600">+{node.outgoingLinks.length - 5} more</div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
      {!node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card h-full flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
            <Globe className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 font-medium">No node selected</p>
          <p className="text-xs text-slate-600 mt-1">Click any node in the graph to inspect it</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
