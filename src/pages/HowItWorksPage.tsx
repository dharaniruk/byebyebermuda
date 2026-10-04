// ============================================================
// HOW IT WORKS PAGE — detailed educational content
// ============================================================

import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { useState } from 'react';
import { canonicalizeUrl } from '../engine/canonicalize';

// ─── URL Canonicalization Demo ───────────────────────────────

const CANON_EXAMPLES = [
  'https://example.com/page#top',
  'https://EXAMPLE.COM/page/',
  'https://example.com/page?utm_source=email&ref=newsletter',
  'https://example.com/page?b=2&a=1',
];

function CanonicalizationDemo() {
  const [input, setInput] = useState(CANON_EXAMPLES[0]);
  const result = (() => {
    try { return canonicalizeUrl(input); }
    catch { return null; }
  })();

  return (
    <div className="card p-6">
      <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">URL CANONICALIZATION</h3>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Canonicalization converts equivalent URL representations into a standardized form
        before visited checks are performed.
      </p>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CANON_EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setInput(ex)}
            className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
              input === ex
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Example {CANON_EXAMPLES.indexOf(ex) + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <p className="text-[10px] text-slate-500 mb-1">RAW URL</p>
          <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs text-amber-400 break-all">
            {input}
          </div>
        </div>

        {result && result.steps.map((step, i) => (
          step.changed && (
            <div key={i} className="pl-4 border-l border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDown className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] text-slate-500">{step.rule}</span>
              </div>
              <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-xs text-cyan-400 break-all">
                {step.after}
              </div>
            </div>
          )
        ))}

        {result && (
          <div>
            <p className="text-[10px] text-green-400 mb-1">✓ CANONICAL URL</p>
            <div className="px-3 py-2 bg-green-500/10 border border-green-500/40 rounded-lg font-mono text-xs text-green-400 break-all">
              {result.canonical}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BFS vs DFS comparison ──────────────────────────────────

const GRAPH = {
  A: ['B', 'C'],
  B: ['D', 'E'],
  C: ['F'],
  D: [],
  E: [],
  F: [],
};

function bfsOrder(start: string): string[] {
  const queue = [start];
  const visited = new Set<string>();
  const order: string[] = [];
  visited.add(start);
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const next of GRAPH[node as keyof typeof GRAPH] ?? []) {
      if (!visited.has(next)) { visited.add(next); queue.push(next); }
    }
  }
  return order;
}

function dfsOrder(start: string): string[] {
  const stack = [start];
  const visited = new Set<string>();
  const order: string[] = [];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    for (const next of [...(GRAPH[node as keyof typeof GRAPH] ?? [])].reverse()) {
      if (!visited.has(next)) stack.push(next);
    }
  }
  return order;
}

function BfsDfsDemo() {
  const [strategy, setStrategy] = useState<'bfs' | 'dfs'>('bfs');
  const [step, setStep] = useState(0);
  const order = strategy === 'bfs' ? bfsOrder('A') : dfsOrder('A');
  const current = order[step];
  const visited = new Set(order.slice(0, step + 1));

  return (
    <div className="card p-6">
      <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">BFS vs DFS</h3>

      <div className="flex gap-2 mb-4">
        {(['bfs', 'dfs'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setStrategy(s); setStep(0); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              strategy === s
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Graph visualization */}
      <div className="flex flex-col items-center gap-4 mb-4">
        {/* Level 0 */}
        <div className="flex gap-3">
          {['A'].map(n => (
            <NodeBox key={n} label={n} current={current === n} visited={visited.has(n)} order={order.indexOf(n)} />
          ))}
        </div>
        <div className="flex gap-8">
          <div className="w-px h-6 bg-slate-700" />
          <div className="w-px h-6 bg-slate-700" />
        </div>
        {/* Level 1 */}
        <div className="flex gap-12">
          {['B', 'C'].map(n => (
            <NodeBox key={n} label={n} current={current === n} visited={visited.has(n)} order={order.indexOf(n)} />
          ))}
        </div>
        <div className="flex gap-16">
          {[0, 1, 2].map(i => <div key={i} className="w-px h-6 bg-slate-700" />)}
        </div>
        {/* Level 2 */}
        <div className="flex gap-8">
          {['D', 'E', 'F'].map(n => (
            <NodeBox key={n} label={n} current={current === n} visited={visited.has(n)} order={order.indexOf(n)} />
          ))}
        </div>
      </div>

      {/* Traversal order */}
      <div className="mb-4 p-3 bg-slate-800/60 rounded-lg">
        <p className="text-[10px] text-slate-500 mb-2">Traversal Order (step {step + 1}/{order.length})</p>
        <div className="flex gap-2 flex-wrap">
          {order.map((n, i) => (
            <span
              key={i}
              className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                i === step ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50' :
                i < step ? 'bg-green-500/20 text-green-400' :
                'bg-slate-700 text-slate-500'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs hover:text-slate-200 transition-colors"
        >← Prev</button>
        <button
          onClick={() => setStep(s => Math.min(order.length - 1, s + 1))}
          className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors"
        >Next →</button>
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs hover:text-slate-200 transition-colors"
        >Reset</button>
      </div>

      {/* Factual info */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className={`p-3 rounded-lg border ${strategy === 'bfs' ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-slate-800'}`}>
          <p className="font-bold text-slate-300 mb-1">BFS</p>
          <p className="text-slate-500">Queue (FIFO) · Level-by-level</p>
        </div>
        <div className={`p-3 rounded-lg border ${strategy === 'dfs' ? 'border-violet-500/30 bg-violet-500/5' : 'border-slate-800'}`}>
          <p className="font-bold text-slate-300 mb-1">DFS</p>
          <p className="text-slate-500">Stack (LIFO) · Depth-first</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mt-2">Both have O(V + E) traversal complexity.</p>
    </div>
  );
}

function NodeBox({ label, current, visited, order }: { label: string; current: boolean; visited: boolean; order: number }) {
  return (
    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border text-xs font-bold transition-all ${
      current ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' :
      visited ? 'bg-green-500/15 border-green-500/50 text-green-400' :
      'bg-slate-800 border-slate-700 text-slate-500'
    }`}>
      {label}
      {order >= 0 && visited && <span className="text-[8px] text-slate-500">{order + 1}</span>}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#030712] pt-14">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-white mb-3">HOW BYEBYEBERMUDA WORKS</h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            From URL canonicalization to cycle detection — every step explained
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CanonicalizationDemo />
          <BfsDfsDemo />
        </div>

        {/* Bloom Filter explainer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-6 mb-8"
        >
          <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">BLOOM FILTER EXPLAINED</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                A Bloom Filter is a space-efficient probabilistic data structure used to test whether
                an element is a member of a set. It can return false positives (saying an element
                might be present when it isn't), but never false negatives.
              </p>
              <div className="space-y-2">
                {[
                  { result: 'Definitely New', desc: 'All hash positions are 0 → URL was NEVER added', color: 'text-green-400' },
                  { result: 'Possibly Seen', desc: 'All hash positions are 1 → URL MAY have been added (false positive possible)', color: 'text-amber-400' },
                ].map(r => (
                  <div key={r.result} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
                    <p className={`text-xs font-bold mb-1 ${r.color}`}>{r.result}</p>
                    <p className="text-[10px] text-slate-500">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Example bit array (simplified)</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {Array.from({ length: 32 }, (_, i) => [3, 7, 15, 19, 24, 28].includes(i) ? 1 : 0).map((bit, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded text-[8px] font-mono font-bold flex items-center justify-center ${
                      bit === 1
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-600'
                    }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-[10px] text-amber-400 font-bold mb-1">Important</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  The Bloom Filter is never the final authority. "Possibly Seen" always triggers 
                  an Exact Hash Set lookup. Only the Hash Set provides correctness.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
