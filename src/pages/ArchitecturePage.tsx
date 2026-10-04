// ============================================================
// ARCHITECTURE PAGE — system architecture diagram
// ============================================================

import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import Footer from '../components/layout/Footer';

const ARCH_NODES = [
  { id: 'user', label: 'USER', sub: 'Crawler Configuration', color: 'text-slate-300', border: 'border-slate-600', bg: 'bg-slate-800/60' },
  { id: 'normalizer', label: 'URL NORMALIZER', sub: 'Canonicalization', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
  { id: 'bloom', label: 'BLOOM FILTER', sub: 'Probabilistic pre-check', color: 'text-violet-400', border: 'border-violet-500/50', bg: 'bg-violet-500/10' },
  { id: 'exact', label: 'EXACT VISITED SET', sub: 'Hash set — correctness layer', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' },
  { id: 'strategy', label: 'CRAWL STRATEGY', sub: 'BFS Queue / DFS Stack', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10' },
  { id: 'fetcher', label: 'PAGE FETCHER', sub: 'Simulated HTTP response', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10' },
  { id: 'extractor', label: 'LINK EXTRACTOR', sub: 'Parse outgoing hyperlinks', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10' },
  { id: 'check', label: 'VISITED CHECK', sub: 'Back to normalizer → bloom → exact', color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10' },
  { id: 'results', label: 'RESULTS + ANALYTICS', sub: 'Graph · Stats · Logs · Export', color: 'text-slate-300', border: 'border-slate-600', bg: 'bg-slate-800/60' },
];

function ArchNode({ label, sub, color, border, bg, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`${bg} border ${border} rounded-xl px-6 py-3 text-center w-72`}
    >
      <div className={`text-sm font-bold tracking-wider ${color}`}>{label}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
    </motion.div>
  );
}

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#030712] pt-14">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-white mb-3">SYSTEM ARCHITECTURE</h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            The data flow from user configuration through URL normalization, Bloom Filter pre-check,
            exact membership verification, traversal strategy, fetch, link extraction, and back to the cycle check.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <div className="flex flex-col items-center gap-0 mb-16">
          {ARCH_NODES.map((node, i) => (
            <div key={node.id} className="flex flex-col items-center">
              <ArchNode {...node} index={i} />
              {i < ARCH_NODES.length - 1 && (
                <div className="flex flex-col items-center py-2">
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                  >
                    <ArrowDown className="w-4 h-4 text-slate-700" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizontal data flow */}
        <div className="card p-8 mb-12">
          <h2 className="text-lg font-bold text-slate-200 mb-6 text-center">CYCLE DETECTION FLOW</h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: 'URL RECEIVED', color: 'text-slate-300 border-slate-600' },
              { label: 'CANONICALIZE', color: 'text-blue-400 border-blue-500/40' },
              { label: 'BLOOM CHECK', color: 'text-violet-400 border-violet-500/40' },
              { label: 'EXACT CHECK', color: 'text-cyan-400 border-cyan-500/40' },
              { label: 'ALREADY VISITED?', color: 'text-red-400 border-red-500/40' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg border text-[10px] font-bold ${step.color} bg-slate-900/60`}>
                  {step.label}
                </div>
                {i < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-8 bg-red-500/40" />
              <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/40 rounded-lg text-[10px] text-red-400 font-bold">
                YES → BLOCKED
              </div>
              <div className="text-[9px] text-slate-600">Cycle or duplicate detected</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-8 bg-green-500/40" />
              <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/40 rounded-lg text-[10px] text-green-400 font-bold">
                NO → ACCEPTED
              </div>
              <div className="text-[9px] text-slate-600">URL added to visited set + frontier</div>
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Canonicalization Layer',
              points: [
                'Lowercase scheme and host',
                'Remove fragment (#section)',
                'Strip tracking parameters (utm_*, ref)',
                'Remove trailing slashes',
                'Sort query parameters',
              ],
            },
            {
              title: 'Bloom Filter',
              points: [
                '128-bit array',
                '3 independent hash functions',
                'O(k) lookup time',
                'Compact probabilistic pre-filter',
                'False positives possible → exact check required',
              ],
            },
            {
              title: 'Exact Hash Set',
              points: [
                'JavaScript Set of canonical URLs',
                'O(1) average lookup',
                'O(V) memory',
                'Zero false positives',
                'Correctness guarantee',
              ],
            },
            {
              title: 'BFS (Breadth-First)',
              points: [
                'FIFO queue data structure',
                'Explores level by level',
                'Shortest path discovery',
                'Good for finding nearby pages',
                'Default strategy',
              ],
            },
            {
              title: 'DFS (Depth-First)',
              points: [
                'LIFO stack data structure',
                'Explores depth first',
                'May reach deep pages sooner',
                'Different traversal order',
                'Selectable strategy',
              ],
            },
            {
              title: 'Crawl Limits',
              points: [
                'Maximum pages',
                'Maximum depth',
                'Configurable delay',
                'Domain restriction (configurable)',
                'Graceful termination',
              ],
            },
          ].map(comp => (
            <motion.div
              key={comp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-5"
            >
              <h3 className="text-sm font-bold text-slate-200 mb-3">{comp.title}</h3>
              <ul className="space-y-1.5">
                {comp.points.map(p => (
                  <li key={p} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-cyan-500 mt-0.5">·</span> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
