// ============================================================
// VISUALIZER PAGE — Dedicated Algorithm Sandbox & Laboratories
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Link2, LayoutGrid, Hash, GitFork, ShieldAlert, Sparkles,
  ArrowRight, Check, AlertTriangle, Play, RotateCcw
} from 'lucide-react';
import Footer from '../components/layout/Footer';
import CanonicalizationVisualizer from '../components/dashboard/CanonicalizationVisualizer';
import BloomFilterVisualizer from '../components/dashboard/BloomFilterVisualizer';
import HashSetVisualizer from '../components/dashboard/HashSetVisualizer';
import QueueVisualizer from '../components/dashboard/QueueVisualizer';
import CycleDetector from '../components/dashboard/CycleDetector';
import { useCrawlerStore } from '../store/crawlerStore';
import { bloomAdd, bloomCheck, createBloomFilter, falsePositiveProbability } from '../engine/bloomFilter';

type LabTab = 'canonicalizer' | 'bloom' | 'hashset' | 'bfsdfs' | 'cycledetector';

export default function VisualizerPage() {
  const [activeLab, setActiveLab] = useState<LabTab>('bloom');

  // Interactive Bloom Sandbox state
  const [customBloomState, setCustomBloomState] = useState(createBloomFilter());
  const [bloomInput, setBloomInput] = useState('https://demo.local/pricing');
  const [bloomCheckResult, setBloomCheckResult] = useState<{
    result: 'possibly_seen' | 'definitely_new' | null;
    positions: number[];
  }>({ result: null, positions: [] });

  const handleBloomAdd = () => {
    if (!bloomInput.trim()) return;
    const next = bloomAdd(customBloomState, bloomInput.trim());
    setCustomBloomState(next);
    setBloomCheckResult({ result: 'possibly_seen', positions: next.lastHashPositions });
  };

  const handleBloomCheck = () => {
    if (!bloomInput.trim()) return;
    const res = bloomCheck(customBloomState, bloomInput.trim());
    setCustomBloomState(res.updatedState);
    setBloomCheckResult({ result: res.result, positions: res.positions });
  };

  const handleBloomReset = () => {
    setCustomBloomState(createBloomFilter());
    setBloomCheckResult({ result: null, positions: [] });
  };

  const setBitsCount = customBloomState.bits.filter((b) => b === 1).length;
  const fpProb = falsePositiveProbability(setBitsCount, customBloomState.size, customBloomState.hashCount);

  return (
    <div className="min-h-screen bg-[#030712] pt-14 flex flex-col">
      <div className="max-w-screen-xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
              DSA Deep-Dive Laboratories
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">ALGORITHM VISUALIZER</h1>
          <p className="text-slate-400 text-xs mt-1">
            Interactive individual component sandboxes for URL Normalization, Bloom Filter Bit Arrays, Exact Hash Sets, BFS/DFS traversal, and Cycle Interception.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
          {[
            { id: 'bloom', label: 'Bloom Filter Sandbox', icon: LayoutGrid, color: 'text-violet-400' },
            { id: 'canonicalizer', label: 'URL Canonicalizer', icon: Link2, color: 'text-cyan-400' },
            { id: 'hashset', label: 'Exact Visited Set', icon: Hash, color: 'text-green-400' },
            { id: 'bfsdfs', label: 'Queue / Stack Frontier', icon: GitFork, color: 'text-blue-400' },
            { id: 'cycledetector', label: 'Cycle Detector', icon: ShieldAlert, color: 'text-red-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLab(tab.id as LabTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 border border-slate-700 text-white shadow-lg shadow-cyan-500/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lab Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Visualizer Body */}
          <div className="lg:col-span-2">
            {activeLab === 'bloom' && (
              <div className="card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-violet-400" />
                      Bloom Filter Bit-Array Laboratory
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      128-bit array with k = 3 independent hash functions.
                    </p>
                  </div>
                  <button
                    onClick={handleBloomReset}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Array
                  </button>
                </div>

                {/* Input & Interactive Actions */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    URL Input string:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bloomInput}
                      onChange={(e) => setBloomInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                      placeholder="https://example.com/page"
                    />
                    <button
                      onClick={handleBloomAdd}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      + Add to Bloom
                    </button>
                    <button
                      onClick={handleBloomCheck}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Test Lookup
                    </button>
                  </div>
                </div>

                {/* Query Result Callout */}
                {bloomCheckResult.result && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border text-xs font-mono ${
                      bloomCheckResult.result === 'definitely_new'
                        ? 'bg-green-950/30 border-green-500/50 text-green-300'
                        : 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>RESULT: {bloomCheckResult.result === 'definitely_new' ? 'DEFINITELY NEW' : 'POSSIBLY SEEN'}</span>
                      <span>Hash Indices: [{bloomCheckResult.positions.join(', ')}]</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {bloomCheckResult.result === 'definitely_new'
                        ? 'At least one hash position contained 0. The item is guaranteed to have NEVER been added.'
                        : 'All k=3 bit indices are 1. The item may have been added, OR this is a hash collision (False Positive).'}
                    </p>
                  </motion.div>
                )}

                {/* 128-Bit Grid Display */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-2">
                    <span>BIT ARRAY (m = 128 bits)</span>
                    <span className="text-cyan-400">{setBitsCount} of 128 bits set ({( (setBitsCount / 128) * 100 ).toFixed(1)}%)</span>
                  </div>
                  <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    {customBloomState.bits.map((bit, idx) => {
                      const isHighlighted = bloomCheckResult.positions.includes(idx);
                      return (
                        <div
                          key={idx}
                          title={`Bit ${idx}: ${bit}`}
                          className={`h-5 rounded text-[8px] font-mono font-bold flex items-center justify-center transition-all ${
                            isHighlighted
                              ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/50 z-10'
                              : bit === 1
                              ? 'bg-violet-600/60 border border-violet-400/50 text-violet-200'
                              : 'bg-slate-900 border border-slate-800 text-slate-700'
                          }`}
                        >
                          {bit}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mathematical Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-mono block">Lookup Cost</span>
                    <span className="text-base font-bold text-cyan-400 font-mono">O(3) ≈ O(1)</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-mono block">Current Collision Risk</span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {(fpProb * 100).toFixed(3)}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-mono block">Relative Memory</span>
                    <span className="text-base font-bold text-green-400 font-mono">~18% of Set</span>
                  </div>
                </div>
              </div>
            )}

            {activeLab === 'canonicalizer' && (
              <div className="h-[520px]">
                <CanonicalizationVisualizer />
              </div>
            )}

            {activeLab === 'hashset' && (
              <div className="h-[520px]">
                <HashSetVisualizer />
              </div>
            )}

            {activeLab === 'bfsdfs' && (
              <div className="h-[520px]">
                <QueueVisualizer />
              </div>
            )}

            {activeLab === 'cycledetector' && (
              <div className="h-[520px]">
                <CycleDetector />
              </div>
            )}
          </div>

          {/* Right Theory & Explanation Sidebar */}
          <div className="space-y-4">
            <div className="card p-5 space-y-3">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                DSA Theory Card
              </span>
              <h3 className="text-sm font-bold text-white">
                {activeLab === 'bloom' && 'Why Bloom Filters?'}
                {activeLab === 'canonicalizer' && 'RFC 3986 URL Normalization'}
                {activeLab === 'hashset' && 'Hash Set: The Correctness Layer'}
                {activeLab === 'bfsdfs' && 'Queue (FIFO) vs Stack (LIFO)'}
                {activeLab === 'cycledetector' && 'Directed Acyclic vs Cyclic Graphs'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeLab === 'bloom' && (
                  'In web-scale crawlers with billions of pages, checking a relational database or disk-backed hash set for every extracted URL creates severe I/O bottlenecks. A Bloom filter acts as a high-speed probabilistic shield residing entirely in L1/L2 cache.'
                )}
                {activeLab === 'canonicalizer' && (
                  'Without standardizing queries, casing, and hash anchors, identical content is visited redundantly. URL canonicalization guarantees that two logically identical web documents yield the exact same string key.'
                )}
                {activeLab === 'hashset' && (
                  'Because Bloom filters can return false positives (due to bit collisions from unrelated items), we must never use a Bloom filter as the sole source of truth. The Exact Hash Set guarantees 0% error rate.'
                )}
                {activeLab === 'bfsdfs' && (
                  'BFS explores all immediate neighbors first before moving deeper, making it ideal for finding shallow pages and shortest paths. DFS dives down one link chain, using less memory during very wide branchings.'
                )}
                {activeLab === 'cycledetector' && (
                  'Cyclic graphs have back-edges leading to ancestors. If a crawler blindly enqueues links without visited tracking, cyclic graphs guarantee infinite execution loops and eventual out-of-memory errors.'
                )}
              </p>
            </div>

            <div className="card p-5 bg-cyan-950/20 border-cyan-500/30 space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                💡 Viva Tip for this Stage
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {activeLab === 'bloom' && '"Bloom filters have 0 false negatives, which means if it says a URL is new, we never need to check anything else — we can crawl right away!"'}
                {activeLab === 'canonicalizer' && '"Canonicalization is applied before hashing and membership checking to avoid storing multiple equivalent representations in memory."'}
                {activeLab === 'hashset' && '"The exact hash set uses an amortized O(1) hash table lookup with O(V) space complexity where V is the total number of unique pages."'}
                {activeLab === 'bfsdfs' && '"Both BFS and DFS maintain an overall O(V + E) time complexity across the entire web graph traversal."'}
                {activeLab === 'cycledetector' && '"Cycle detection occurs in O(1) time by intercepting candidate links during the adjacency list expansion phase."'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
