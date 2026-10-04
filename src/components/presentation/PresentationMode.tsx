// ============================================================
// PRESENTATION MODE COMPONENT
// Cinematic presentation walkthrough for judging panels & viva
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Sparkles,
  Layers, Terminal, Award
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  tagline: string;
  badge: string;
  content: React.ReactNode;
}

export default function PresentationMode({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides: Slide[] = [
    {
      id: 0,
      title: 'The Problem: Bermuda Loops',
      tagline: 'Why Unprotected Web Crawlers Crash and Burn',
      badge: 'PROBLEM STATEMENT',
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-red-950/30 border border-red-500/40 rounded-2xl text-center space-y-3">
            <p className="text-xl font-mono text-red-400 font-bold">A → B → C → A</p>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Without cycle protection, when page <strong>C</strong> links back to page <strong>A</strong>,
              the crawler revisits <strong>A</strong>, discovering <strong>B</strong> again, looping into eternity.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-2xl font-bold text-red-400 font-mono">∞</span>
              <p className="text-xs text-slate-400 mt-1">Network Waste</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-2xl font-bold text-red-400 font-mono">O(∞)</span>
              <p className="text-xs text-slate-400 mt-1">Memory Explosion</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-2xl font-bold text-red-400 font-mono">CRASH</span>
              <p className="text-xs text-slate-400 mt-1">Stack/Queue Overflow</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Step 1: URL Canonicalization',
      tagline: 'Standardizing Infinite URL Variants to a Single Identity',
      badge: 'NORMALIZATION',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Web servers expose identical content across dozens of subtle URL variants. We collapse them before duplicate checks:
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-amber-400">https://demo.local/page#top</span>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <span className="text-green-400 font-bold">https://demo.local/page</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-amber-400">https://demo.local/page?utm_source=fb</span>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <span className="text-green-400 font-bold">https://demo.local/page</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-amber-400">https://demo.local/page/</span>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <span className="text-green-400 font-bold">https://demo.local/page</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-300">
            ✓ Result: 1 canonical entry instead of 3 redundant crawls.
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Step 2: Two-Tier Duplicate Defense',
      tagline: 'Probabilistic Bloom Filter + Deterministic Hash Set',
      badge: 'DATA STRUCTURES',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-violet-950/30 border border-violet-500/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
              <span>Layer 1: Bloom Filter</span>
            </div>
            <p className="text-xs text-slate-300">
              Compact bit array (128 bits, 3 hash functions). Provides lightning fast O(k) pre-checks with ~18% relative RAM use.
            </p>
            <div className="text-[10px] font-mono text-violet-300 bg-violet-950/60 p-2 rounded">
              "Definitely New" → Instant Crawl<br/>
              "Possibly Seen" → Fallback to Layer 2
            </div>
          </div>
          <div className="p-5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <span>Layer 2: Exact Hash Set</span>
            </div>
            <p className="text-xs text-slate-300">
              Deterministic string hash set. Guarantees 0% false positives and 100% traversal correctness.
            </p>
            <div className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 p-2 rounded">
              "In Set" → BLOCK Traversal<br/>
              "Not In Set" → Accept & Register
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Step 3: Cycle Interception in Action',
      tagline: 'When a Loop is Encountered, We Sever the Edge',
      badge: 'GRAPH EXECUTION',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-around font-mono text-xs">
            <div className="p-2.5 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 font-bold">
              PAGE A (Visited)
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <div className="p-2.5 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 font-bold">
              PAGE B (Visited)
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <div className="p-2.5 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 font-bold">
              PAGE C (Visiting)
            </div>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>LINK DETECTED: C → A</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target "A" is checked in Exact Hash Set → <strong>MATCH FOUND</strong>.
              Crawler records "CYCLE DETECTED", marks edge as <strong>BLOCKED</strong>, and refuses to re-fetch A.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Traversal Guarantee: O(V + E)',
      tagline: 'Every Reachable Vertex Visited Exactly Once',
      badge: 'VIVA & JURY SUMMARY',
      content: (
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-1 text-cyan-400">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Guaranteed Termination & Optimal Complexity</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            By treating the web as a directed graph G = (V, E) and maintaining a canonical visited set,
            <strong> BYEBYEBERMUDA</strong> guarantees safe traversal with no infinite loops, 0 redundant fetches,
            and optimal O(V + E) runtime.
          </p>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto flex justify-around text-xs font-mono text-cyan-300">
            <span>BFS: Queue (FIFO)</span>
            <span>·</span>
            <span>DFS: Stack (LIFO)</span>
          </div>
        </div>
      ),
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isOpen, autoPlay, slides.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/95 backdrop-blur-xl p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col min-h-[500px]"
      >
        {/* Top bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-full text-[10px] font-mono font-bold">
              {slides[currentSlide].badge}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              SLIDE {currentSlide + 1} OF {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                autoPlay
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={autoPlay ? 'Pause Auto-Advance' : 'Play Auto-Advance'}
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{autoPlay ? 'Auto' : 'Manual'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="p-8 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xs sm:text-sm text-cyan-400 font-mono mt-1">
                  {slides[currentSlide].tagline}
                </p>
              </div>

              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
            className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === i ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="flex items-center gap-1 px-4 py-2 bg-cyan-500 text-slate-900 hover:bg-cyan-400 rounded-xl text-xs font-bold transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
