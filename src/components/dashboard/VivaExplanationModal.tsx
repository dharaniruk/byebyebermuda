// ============================================================
// VIVA EXPLANATION MODAL — "Explain This Step" Mode
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, CheckCircle2, AlertTriangle, Lightbulb, BookOpen, Layers } from 'lucide-react';
import { PipelineStage } from '../../engine/types';

interface VivaExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: PipelineStage;
  currentUrl: string | null;
  currentCanonical: string | null;
  strategy: 'bfs' | 'dfs';
}

const STAGE_EXPLANATIONS: Record<PipelineStage, {
  title: string;
  simpleExplanation: string;
  technicalDetails: string;
  vivaAnswer: string;
  keyDsaConcept: string;
}> = {
  idle: {
    title: 'Ready State',
    simpleExplanation: 'The crawler is sitting ready at the launch pad waiting for the starting seed URL and parameters.',
    technicalDetails: 'Initializes the BFS queue / DFS stack, allocates bit vectors for the Bloom Filter, and instantiates an empty Exact Visited Hash Set.',
    vivaAnswer: 'Before crawling starts, memory structures are zeroed out to ensure clean state and avoid state leakage across runs.',
    keyDsaConcept: 'State Initialization & Memory Allocation',
  },
  receive: {
    title: 'URL Ingestion',
    simpleExplanation: 'A new candidate URL has been popped from the frontier or received as the starting seed.',
    technicalDetails: 'Extracts the raw URL string from the crawl queue or stack to begin processing.',
    vivaAnswer: 'Every candidate link discovered on any webpage must enter through this ingestion point before any network or parsing action.',
    keyDsaConcept: 'Frontier Dequeue / De-stacking',
  },
  canonicalize: {
    title: 'URL Canonicalization',
    simpleExplanation: 'We take the raw URL and strip junk like #fragments, tracking tags (?utm_source=...), and fix lowercase/slashes so duplicate forms become identical.',
    technicalDetails: 'Applies deterministic RFC 3986 normalization rules: Lowercase host, strip hash, remove marketing query parameters, remove trailing slashes, and sort remaining query params.',
    vivaAnswer: 'Without canonicalization, /about and /about#team and /about?ref=1 would be treated as 3 different URLs, wasting 3x resources.',
    keyDsaConcept: 'String Normalization & Hash Key Equivalence',
  },
  bloom_check: {
    title: 'Bloom Filter Probabilistic Pre-Check',
    simpleExplanation: 'A super-fast, tiny memory bit check asks: "Have we probably seen this URL before?" If it says NO, we are 100% sure it is new!',
    technicalDetails: 'Passes canonical URL through k=3 independent hash functions. If any bit is 0, the element is DEFINITELY NOT in the set. If all bits are 1, it is POSSIBLY SEEN (due to hash collisions).',
    vivaAnswer: 'Bloom Filters save massive RAM in large-scale search engines by filtering out 90%+ of new URLs without querying heavy databases. However, because of false positives, we must verify candidates in the Exact Hash Set.',
    keyDsaConcept: 'Probabilistic Data Structures (O(k) Lookup)',
  },
  exact_check: {
    title: 'Exact Hash Set Verification',
    simpleExplanation: 'We check our exact master list of visited URLs. Unlike the Bloom filter, this never makes mistakes.',
    technicalDetails: 'Performs an O(1) average lookup in a Hash Set of canonical strings to guarantee correctness and zero false positives.',
    vivaAnswer: 'The Bloom Filter gives speed; the Hash Set gives truth. This 2-tier architecture provides both high throughput and absolute correctness.',
    keyDsaConcept: 'Hash Table / Hash Set (O(1) amortized)',
  },
  accept: {
    title: 'Page Accepted for Crawl',
    simpleExplanation: 'The URL passed all duplicate checks! It is brand new, so we officially register it in our visited set and Bloom filter.',
    technicalDetails: 'Inserts canonical URL into visited Hash Set and flips corresponding k bits in Bloom Filter bit array.',
    vivaAnswer: 'Once accepted, the URL cannot be crawled again. It is now part of the explored vertex set V_visited.',
    keyDsaConcept: 'Set Insertion & State Transition',
  },
  fetch: {
    title: 'Simulated Page Fetch',
    simpleExplanation: 'We simulate sending an HTTP GET request to download the webpage and its status code.',
    technicalDetails: 'In this prototype, responses, latency (50-300ms), and HTTP status codes (200, 404, 500) are generated safely without real internet requests.',
    vivaAnswer: 'Simulating the fetch keeps the demo completely safe, offline-capable, and deterministic for presentation evaluation.',
    keyDsaConcept: 'HTTP Client Simulation & Error Handling',
  },
  extract: {
    title: 'Link Extraction',
    simpleExplanation: 'We parse the HTML content of the page and find all outgoing hyperlinks (<a href="...">).',
    technicalDetails: 'Parses DOM hyperlinks, resolving relative paths against the current base URL to generate raw outgoing directed edges.',
    vivaAnswer: 'Extracting hyperlinks corresponds to discovering the adjacency list of the current vertex in the directed web graph G=(V,E).',
    keyDsaConcept: 'Directed Graph Adjacency List Exploration',
  },
  queue_add: {
    title: 'Frontier Insertion (Queue / Stack)',
    simpleExplanation: 'We push all the newly discovered, unvisited links into our frontier data structure for upcoming steps.',
    technicalDetails: 'If BFS is selected, links are enqueued into a FIFO Queue (level-order traversal). If DFS is selected, links are pushed onto a LIFO Stack (depth-order traversal).',
    vivaAnswer: 'BFS guarantees finding the shortest hop path to any page; DFS is memory-friendly for deep branch exploration.',
    keyDsaConcept: 'FIFO Queue vs LIFO Stack Scheduling',
  },
  continue: {
    title: 'Iteration Continuation',
    simpleExplanation: 'The current page is finished. The crawler loops back to take the next link from the frontier.',
    technicalDetails: 'Checks if frontier is non-empty and verifies bounds against maxPages and maxDepth limits.',
    vivaAnswer: 'The crawl loop continues until either the reachable connected component is exhausted or configured safety bounds are met.',
    keyDsaConcept: 'Loop Invariant & Termination Condition',
  },
  cycle_detected: {
    title: 'Cycle Detected & Blocked',
    simpleExplanation: 'A link points back to a page we already crawled! We flag the cycle and reject traversing it again.',
    technicalDetails: 'The candidate canonical URL was found already present in the Visited Hash Set. The directed edge is tagged as a back-edge / cycle and dropped from the frontier.',
    vivaAnswer: 'Cycle detection is the central defense against infinite loops like A → B → C → A. Without it, the crawler would run forever and crash.',
    keyDsaConcept: 'Back-Edge Detection in Directed Graphs',
  },
  duplicate_found: {
    title: 'Duplicate URL Collapsed',
    simpleExplanation: 'Two different URL strings pointed to the same canonical location. We skipped the redundant work.',
    technicalDetails: 'Canonical hash matched an existing visited record. Redundant traversal is pruned.',
    vivaAnswer: 'Collapsing duplicates saves network bandwidth and avoids storing duplicate document indexes.',
    keyDsaConcept: 'Equivalence Class Partitioning',
  },
  complete: {
    title: 'Crawl Completed Successfully',
    simpleExplanation: 'All reachable pages have been crawled without a single repeated visit or infinite loop!',
    technicalDetails: 'Frontier is empty or safety limits reached. Final metrics, execution times, and graph summary are compiled.',
    vivaAnswer: 'The crawler successfully visited every reachable vertex at most once in O(V + E) time with zero loop traps.',
    keyDsaConcept: 'Graph Traversal Completeness',
  },
};

export default function VivaExplanationModal({
  isOpen,
  onClose,
  currentStage,
  currentUrl,
  currentCanonical,
  strategy,
}: VivaExplanationModalProps) {
  if (!isOpen) return null;

  const explanation = STAGE_EXPLANATIONS[currentStage] || STAGE_EXPLANATIONS.idle;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Viva & Technical Evaluator Guide
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Step: {explanation.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Context bar */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="truncate max-w-[70%]">
                <span className="text-[10px] text-slate-500 uppercase block">Active Target</span>
                <span className="font-mono text-cyan-300 truncate block">
                  {currentCanonical || currentUrl || 'None (Awaiting Start)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Traversal Mode</span>
                <span className="font-mono font-bold text-violet-400 uppercase">{strategy}</span>
              </div>
            </div>

            {/* 1. Simple Explanation */}
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Plain English Summary</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {explanation.simpleExplanation}
              </p>
            </div>

            {/* 2. Technical DSA Lore */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Technical Architecture
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded font-mono">
                  {explanation.keyDsaConcept}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {explanation.technicalDetails}
              </p>
            </div>

            {/* 3. Viva Answer Script */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                💡 Sample Viva Answer (For Professors / Evaluators):
              </span>
              <p className="text-xs text-amber-200/90 leading-relaxed italic">
                "{explanation.vivaAnswer}"
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-cyan-500 text-slate-900 font-bold text-xs rounded-xl hover:bg-cyan-400 transition-colors uppercase tracking-wider"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
