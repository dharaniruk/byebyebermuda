// ============================================================
// ABOUT PAGE — Project Story, Lore & Engineering Overview
// ============================================================

import { motion } from 'framer-motion';
import { Triangle, Shield, Cpu, Code2, Globe, Sparkles, CheckCircle2, Terminal } from 'lucide-react';
import Footer from '../components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030712] pt-14 flex flex-col">
      <div className="max-w-screen-xl mx-auto px-4 py-12 flex-1 w-full">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono mb-4">
            <Triangle className="w-3.5 h-3.5" fill="none" />
            <span>PROJECT & ENGINEERING SPECIFICATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            ABOUT <span className="text-cyan-400">BYEBYEBERMUDA</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A specialized research and educational prototype demonstrating cycle-safe directed web graph traversal, URL canonicalization, probabilistic Bloom filtering, and exact duplicate prevention.
          </p>
        </motion.div>

        {/* The Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Globe className="w-5 h-5" />
              <span>THE CORE PHILOSOPHY</span>
            </div>
            <h2 className="text-xl font-bold text-white">The Web Is a Directed Graph with Traps</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every website is essentially a set of vertices (web documents) connected by directed edges (hyperlinks).
              Without strict cycle protection, circular hyperlink loops such as <strong>A → B → C → A</strong> trap crawling agents in infinite traversals, exhausting memory and crashing indexing pipelines.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>BYEBYEBERMUDA</strong> ("Say goodbye to getting lost in the web") establishes a robust multi-layer defense: standardizing URLs with RFC 3986 canonicalization, executing sub-millisecond probabilistic Bloom filter pre-checks, and verifying state against an exact visited hash table.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
              <Cpu className="w-5 h-5" />
              <span>THE ENGINEERING STACK</span>
            </div>
            <h2 className="text-xl font-bold text-white">Architected for Real-Time Precision</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-0.5">Frontend Core</span>
                <span className="text-slate-400 font-mono text-[11px]">React 18 + TypeScript + Vite</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-0.5">Graph Engine</span>
                <span className="text-slate-400 font-mono text-[11px]">React Flow (Custom Nodes & Layouts)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-0.5">State Management</span>
                <span className="text-slate-400 font-mono text-[11px]">Zustand (Micro-State Dispatch)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 block mb-0.5">Telemetry & Charts</span>
                <span className="text-slate-400 font-mono text-[11px]">Recharts + Framer Motion</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 6 Key Architectural Pillars */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Architectural Guarantees</h2>
            <p className="text-slate-500 text-xs">Built for technical defense, viva presentations, and data engineering</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'O(V + E) Bounded Traversal',
                desc: 'Guarantees every reachable page is visited at most once, maintaining optimal asymptotic complexity.',
              },
              {
                title: 'Zero False Positive Acceptance',
                desc: 'While the Bloom filter enables fast probabilistic rejects, the Exact Hash Set guarantees 100% correctness.',
              },
              {
                title: 'RFC 3986 Normalization',
                desc: 'Handles query sorting, case normalization, trailing slashes, and anchor fragment stripping.',
              },
              {
                title: 'FIFO vs LIFO Strategy Selection',
                desc: 'Full runtime control over BFS (Breadth-First Queue) and DFS (Depth-First Stack) graph explorations.',
              },
              {
                title: 'Real-Time Loop Interception',
                desc: 'Active visualization of back-edges being severed and flagged with visual blocked-edge indicators.',
              },
              {
                title: 'Full Audit Telemetry',
                desc: 'Exportable JSON and CSV telemetry logs documenting every step, response code, and cycle encounter.',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="card p-5 border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wide">{pillar.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
