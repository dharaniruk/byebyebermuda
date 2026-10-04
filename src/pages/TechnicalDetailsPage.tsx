// ============================================================
// TECHNICAL DETAILS & SPECIFICATION PAGE
// ============================================================

import { motion } from 'framer-motion';
import {
  BookOpen, ShieldCheck, Cpu, Code2, Database, Layers,
  CheckCircle2, ArrowRight, Zap, Hash, LayoutGrid, Terminal
} from 'lucide-react';
import Footer from '../components/layout/Footer';

export default function TechnicalDetailsPage() {
  return (
    <div className="min-h-screen bg-[#030712] pt-14 flex flex-col">
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex-1 w-full">

        {/* ── Header ── */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            DSA SPECIFICATION & MATHEMATICAL PROOFS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            TECHNICAL SPECIFICATION & LORE
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
            In-depth analysis of URL canonicalization algorithms, probabilistic Bloom filter false-positive bounds, exact visited hashing, and graph complexity guarantees.
          </p>
        </div>

        {/* ── 1. The Core Problem ── */}
        <div className="card p-6 mb-8 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Problem Statement: Graph Cycles & Infinite Traversal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Why Web Crawlers Get Trapped in Loops</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A web crawler models the World Wide Web as a directed graph G = (V, E), where vertices V represent canonical web documents and directed edges E represent hyperlinks. Because web applications heavily link between shared headers, navigation bars, pagination, and category trees, the graph is filled with back-edges.
          </p>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-around flex-wrap gap-2">
            <span className="text-cyan-400 font-bold">Node A</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-cyan-400 font-bold">Node B</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-cyan-400 font-bold">Node C</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-red-400 font-bold underline">Node A (Cycle Back-Edge)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Without a cycle-safe visited mechanism, Node A is re-enqueued, triggering repeated fetches of B and C indefinitely. This results in exponential network waste, database memory exhaustion, and crawler crashes.
          </p>
        </div>

        {/* ── 2. Multi-Layer Duplicate Defense ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-5 space-y-3 border-blue-500/30">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
              <Code2 className="w-4 h-4" />
              <span>Layer 1: Canonicalization</span>
            </div>
            <h3 className="font-bold text-sm text-white">RFC 3986 Normalization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardizes case, trims trailing slashes, removes marketing tags (<code>utm_*</code>, <code>ref</code>), strips <code>#hash</code> fragments, and sorts query parameters before hash generation.
            </p>
          </div>

          <div className="card p-5 space-y-3 border-violet-500/30">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase">
              <LayoutGrid className="w-4 h-4" />
              <span>Layer 2: Bloom Filter</span>
            </div>
            <h3 className="font-bold text-sm text-white">Probabilistic Pre-Check</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses m = 128 bits and k = 3 independent hash functions. Provides O(k) fast rejects using ~18% relative memory. If any bit is 0, the URL is definitely unvisited.
            </p>
          </div>

          <div className="card p-5 space-y-3 border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Hash className="w-4 h-4" />
              <span>Layer 3: Exact Hash Set</span>
            </div>
            <h3 className="font-bold text-sm text-white">Correctness Layer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic string hash set. Resolves Bloom false-positive candidates with 100% accuracy in O(1) average lookup time and O(V) space.
            </p>
          </div>
        </div>

        {/* ── 3. Complexity & Bounds ── */}
        <div className="card p-6 mb-8 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Asymptotic Complexity Analysis</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xl font-bold font-mono text-cyan-400">O(V + E)</span>
              <p className="text-[11px] text-slate-400 mt-1">Overall Traversal Runtime</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xl font-bold font-mono text-violet-400">O(k)</span>
              <p className="text-[11px] text-slate-400 mt-1">Bloom Filter Check</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xl font-bold font-mono text-emerald-400">O(1)</span>
              <p className="text-[11px] text-slate-400 mt-1">Hash Set Lookup</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xl font-bold font-mono text-amber-400">O(V)</span>
              <p className="text-[11px] text-slate-400 mt-1">Total Space Complexity</p>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
