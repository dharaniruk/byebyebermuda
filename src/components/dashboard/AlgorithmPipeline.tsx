// ============================================================
// ALGORITHM PIPELINE VISUALIZER
// ============================================================

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { PipelineStage } from '../../engine/types';

interface PipelineStep {
  stage: PipelineStage | PipelineStage[];
  label: string;
  description: string;
  icon: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { stage: 'receive',       label: 'URL',           description: 'Receive target URL',           icon: '🌐' },
  { stage: 'canonicalize',  label: 'CANONICALIZE',  description: 'Normalize URL form',           icon: '⚙️' },
  { stage: 'bloom_check',   label: 'BLOOM FILTER',  description: 'Probabilistic pre-check',     icon: '🔍' },
  { stage: 'exact_check',   label: 'HASH SET',      description: 'Exact membership check',       icon: '#️⃣' },
  { stage: ['accept', 'cycle_detected', 'duplicate_found'],
    label: 'DECISION',      description: 'Accept or skip URL',            icon: '✓' },
  { stage: 'fetch',         label: 'FETCH',         description: 'Retrieve page',                icon: '📥' },
  { stage: 'extract',       label: 'EXTRACT',       description: 'Parse outgoing links',         icon: '🔗' },
  { stage: 'queue_add',     label: 'QUEUE / STACK', description: 'Add unseen URLs',              icon: '📋' },
  { stage: ['continue', 'complete'],
    label: 'CONTINUE',      description: 'Process next in frontier',     icon: '▶️' },
];

function isActive(step: PipelineStep, currentStage: PipelineStage): boolean {
  if (Array.isArray(step.stage)) {
    return step.stage.includes(currentStage);
  }
  return step.stage === currentStage;
}

function isCompleted(step: PipelineStep, currentStage: PipelineStage): boolean {
  const stages: PipelineStage[] = [
    'receive', 'canonicalize', 'bloom_check', 'exact_check',
    'accept', 'fetch', 'extract', 'queue_add', 'continue', 'complete'
  ];
  const stepStage = Array.isArray(step.stage) ? step.stage[0] : step.stage;
  const stepIdx = stages.indexOf(stepStage);
  const currentIdx = stages.indexOf(currentStage);
  return currentIdx > stepIdx;
}

export default function AlgorithmPipeline() {
  const { crawlerState } = useCrawlerStore();
  const { pipelineStage, currentCanonical, currentUrl } = crawlerState;

  const activePipeline = PIPELINE_STEPS.find(s => isActive(s, pipelineStage));

  return (
    <div className="card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Algorithm Pipeline
        </h3>
      </div>

      {/* Current URL */}
      {currentUrl && (
        <div className="mb-4 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Processing</p>
          <p className="text-xs font-mono text-cyan-400 truncate">{currentCanonical || currentUrl}</p>
        </div>
      )}

      {/* Pipeline steps - horizontal on wide, vertical on narrow */}
      <div className="flex flex-col gap-1 flex-1">
        {PIPELINE_STEPS.map((step, idx) => {
          const active = isActive(step, pipelineStage);
          const done = isCompleted(step, pipelineStage);

          return (
            <div key={idx}>
              <motion.div
                animate={active ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ repeat: active ? Infinity : 0, duration: 1.5 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300 ${
                  active
                    ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                    : done
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-slate-800 bg-slate-900/30'
                }`}
              >
                <span className="text-sm flex-shrink-0">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold tracking-wider ${
                      active ? 'text-cyan-400' : done ? 'text-green-400' : 'text-slate-600'
                    }`}>
                      {step.label}
                    </span>
                    {active && (
                      <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-[10px] text-cyan-500 font-mono"
                      >
                        ◼
                      </motion.div>
                    )}
                  </div>
                  <p className={`text-[10px] ${active ? 'text-slate-400' : done ? 'text-slate-600' : 'text-slate-700'}`}>
                    {step.description}
                  </p>
                </div>
                {done && <span className="text-green-500 text-xs flex-shrink-0">✓</span>}
                {active && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full flex-shrink-0"
                  />
                )}
              </motion.div>

              {/* Arrow between steps */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className={`w-3 h-3 ${done ? 'text-green-500/50' : 'text-slate-700'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active stage explanation */}
      {activePipeline && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/30 rounded-lg"
        >
          <p className="text-[10px] text-cyan-400/70 uppercase tracking-wider mb-1">Current Stage</p>
          <p className="text-xs font-bold text-cyan-400">{activePipeline.label}</p>
          <p className="text-[10px] text-slate-400 mt-1">{activePipeline.description}</p>
          {pipelineStage === 'cycle_detected' && (
            <p className="text-[10px] text-red-400 mt-1 font-bold">⚠ CYCLE DETECTED — Traversal blocked</p>
          )}
          {pipelineStage === 'bloom_check' && (
            <p className="text-[10px] text-amber-400 mt-1">
              Bloom Filters can produce false positives — Exact Hash Set provides correctness
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
