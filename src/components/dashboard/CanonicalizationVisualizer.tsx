// ============================================================
// CANONICALIZATION VISUALIZER COMPONENT
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { canonicalizeUrl } from '../../engine/canonicalize';

const PRESET_URLS = [
  { label: 'Fragment & Hash', url: 'https://demo.local/products#reviews' },
  { label: 'Trailing Slash', url: 'https://demo.local/about/' },
  { label: 'Tracking Query Params', url: 'https://demo.local/pricing?utm_source=twitter&utm_medium=social&ref=feed' },
  { label: 'Unsorted Query & Casing', url: 'https://DEMO.local/search?q=crawler&sort=desc&page=2' },
  { label: 'Compound Redundancy', url: 'http://demo.local:80/blog/post-1/?utm_campaign=launch#comments' },
];

export default function CanonicalizationVisualizer() {
  const [inputUrl, setInputUrl] = useState(PRESET_URLS[0].url);
  const result = canonicalizeUrl(inputUrl);

  return (
    <div className="card p-4 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            URL Canonicalization
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full font-mono">
          Pre-Check Normalizer
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
        Canonicalization converts varied and equivalent URL representations into one standardized form
        <strong> before</strong> Bloom filter checks and visited set verification.
      </p>

      {/* Presets */}
      <div className="mb-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
          Select Test Scenario:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_URLS.map((item) => (
            <button
              key={item.label}
              onClick={() => setInputUrl(item.url)}
              className={`text-[10px] px-2 py-1 rounded transition-all ${
                inputUrl === item.url
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-3">
        <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
          Raw Incoming URL
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="https://example.com/path#tag"
          />
        </div>
      </div>

      {/* Transformation Trace */}
      <div className="flex-1 space-y-2 mb-3">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
          Normalization Pipeline:
        </span>

        {result.steps.map((step, idx) => (
          <motion.div
            key={step.rule}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-2.5 rounded-lg border text-xs ${
              step.changed
                ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[11px] flex items-center gap-1.5">
                {step.changed ? (
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                ) : (
                  <span className="w-3 h-3 text-center text-slate-600">·</span>
                )}
                {step.rule}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  step.changed
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {step.changed ? 'MODIFIED' : 'PASSED'}
              </span>
            </div>
            {step.changed && (
              <div className="font-mono text-[10px] space-y-1 mt-1.5 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <div className="text-slate-500 line-through truncate">BEFORE: {step.before}</div>
                <div className="text-cyan-300 font-bold truncate">AFTER: {step.after}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Final Output */}
      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-1.5 text-green-400 font-bold text-xs mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>CANONICALIZED HASH KEY</span>
        </div>
        <div className="font-mono text-xs text-green-300 break-all bg-slate-950/80 p-2 rounded border border-green-500/20">
          {result.canonical}
        </div>
      </div>
    </div>
  );
}
