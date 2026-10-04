// ============================================================
// CRAWLER GRAPH — React Flow interactive graph visualization
// ============================================================

import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Maximize2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useCrawlerStore } from '../../store/crawlerStore';
import { CrawlNode, NodeStatus } from '../../engine/types';
import { computeLayout } from '../../engine/crawler';

// ─── Node color mapping strictly according to specification ───

const STATUS_STYLES: Record<NodeStatus, { bg: string; border: string; text: string; dot: string; glow?: string }> = {
  crawling:     { bg: '#0c4a6e', border: '#22d3ee', text: '#67e8f9', dot: '#22d3ee', glow: 'rgba(34, 211, 238, 0.7)' },
  visited:      { bg: '#064e3b', border: '#10b981', text: '#6ee7b7', dot: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  undiscovered: { bg: '#1e293b', border: '#475569', text: '#94a3b8', dot: '#64748b' },
  queued:       { bg: '#172554', border: '#3b82f6', text: '#93c5fd', dot: '#3b82f6' },
  bloom_candidate: { bg: '#451a03', border: '#f59e0b', text: '#fde68a', dot: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
  duplicate:    { bg: '#2e1065', border: '#a855f7', text: '#d8b4fe', dot: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' },
  cycle:        { bg: '#450a0a', border: '#ef4444', text: '#fca5a5', dot: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' },
  broken:       { bg: '#431407', border: '#f97316', text: '#fdba74', dot: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' },
};

// ─── Custom Node Component ───────────────────────────────────

function CrawlNodeComponent({ data }: NodeProps) {
  const node: CrawlNode = data.crawlNode;
  const isSelected = data.isSelected;
  const isCycleHighlighted = data.isCycleHighlighted;
  const style = STATUS_STYLES[node.status] || STATUS_STYLES.undiscovered;

  const label = node.pageTitle.length > 14
    ? node.pageTitle.substring(0, 14) + '…'
    : node.pageTitle;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isCycleHighlighted ? 1.1 : 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      style={{
        background: style.bg,
        border: `2px solid ${isCycleHighlighted ? '#ef4444' : isSelected ? '#22d3ee' : style.border}`,
        boxShadow: isCycleHighlighted
          ? '0 0 25px rgba(239, 68, 68, 0.9), 0 0 50px rgba(239, 68, 68, 0.4)'
          : isSelected
          ? `0 0 0 3px ${style.border}90, 0 0 25px ${style.glow || 'rgba(34,211,238,0.5)'}`
          : node.status === 'crawling'
          ? `0 0 20px ${style.glow}`
          : node.status === 'cycle'
          ? '0 0 15px rgba(239, 68, 68, 0.6)'
          : `0 0 8px ${style.border}30`,
      }}
      className="px-3.5 py-2.5 rounded-xl min-w-[110px] max-w-[160px] cursor-pointer transition-all relative group"
    >
      <Handle type="target" position={Position.Top} style={{ background: style.border, width: 8, height: 8 }} />

      <div className="flex items-center gap-1.5 mb-1">
        <motion.div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: style.dot }}
          animate={node.status === 'crawling' ? { scale: [1, 1.6, 1], opacity: [1, 0.4, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <span className="text-[11px] font-bold tracking-wide truncate" style={{ color: style.text }}>
          {label}
        </span>
      </div>

      <div className="text-[9px] font-mono truncate text-slate-400 flex items-center justify-between">
        <span>D:{node.depth}</span>
        {node.httpStatus && (
          <span className={node.httpStatus >= 400 ? 'text-orange-400 font-bold' : 'text-emerald-400'}>
            {node.httpStatus}
          </span>
        )}
      </div>

      {node.status === 'cycle' && (
        <div className="mt-1.5 px-1.5 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-[8px] text-red-400 font-extrabold text-center tracking-wider animate-pulse flex items-center justify-center gap-1">
          <AlertTriangle className="w-2.5 h-2.5" />
          CYCLE
        </div>
      )}

      {node.status === 'broken' && (
        <div className="mt-1.5 px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/50 rounded text-[8px] text-orange-400 font-bold text-center">
          BROKEN ({node.httpStatus})
        </div>
      )}

      {node.status === 'duplicate' && (
        <div className="mt-1.5 px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded text-[8px] text-purple-300 font-bold text-center">
          DUPLICATE
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: style.border, width: 8, height: 8 }} />
    </motion.div>
  );
}

const nodeTypes = { crawlNode: CrawlNodeComponent };

// ─── Inner Graph with ReactFlow Context ────────────────────────

function InnerCrawlerGraph() {
  const { crawlerState, selectNode, resetCrawl } = useCrawlerStore();
  const { nodes: crawlNodes, edges: crawlEdges, selectedNodeId, highlightedCycleId, detectedCycles } = crawlerState;

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const layoutMap = useMemo(() => computeLayout(crawlNodes), [crawlNodes]);

  // Find active highlighted cycle path if any
  const highlightedCycle = useMemo(() => {
    if (!highlightedCycleId) return null;
    return detectedCycles.find(c => c.id === highlightedCycleId) || null;
  }, [highlightedCycleId, detectedCycles]);

  const highlightedCanonicals = useMemo(() => {
    return new Set(highlightedCycle?.path || []);
  }, [highlightedCycle]);

  // Sync crawler nodes -> React Flow
  useEffect(() => {
    const newNodes: Node[] = crawlNodes.map(n => {
      const pos = layoutMap.get(n.id) ?? { x: 0, y: 0 };
      const inHighlightedCycle = highlightedCanonicals.has(n.canonicalUrl);

      return {
        id: n.id,
        type: 'crawlNode',
        position: pos,
        data: {
          crawlNode: n,
          isSelected: n.id === selectedNodeId,
          isCycleHighlighted: inHighlightedCycle,
        },
      };
    });
    setRfNodes(newNodes);
  }, [crawlNodes, selectedNodeId, layoutMap, setRfNodes, highlightedCanonicals]);

  // Sync crawler edges -> React Flow
  useEffect(() => {
    const newEdges: Edge[] = crawlEdges.map(e => {
      const isCycleEdge = e.isCycle || e.isBlocked;
      const isEdgeInHighlightedCycle = highlightedCycle && (
        (e.source === highlightedCycle.sourceNodeId && e.target === highlightedCycle.targetNodeId) ||
        (highlightedCycle.path.length > 0 && isCycleEdge)
      );

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: !isCycleEdge,
        style: {
          stroke: isEdgeInHighlightedCycle
            ? '#ef4444'
            : isCycleEdge
            ? '#ef4444'
            : '#22d3ee90',
          strokeWidth: isEdgeInHighlightedCycle ? 3.5 : isCycleEdge ? 2.5 : 1.8,
          strokeDasharray: isCycleEdge ? '6 3' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCycleEdge ? '#ef4444' : '#22d3ee',
          width: 14,
          height: 14,
        },
        label: isCycleEdge ? '⚠ BLOCKED' : undefined,
        labelStyle: { fill: '#fca5a5', fontSize: 9, fontWeight: 800, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#450a0a', fillOpacity: 0.9, rx: 4 },
      };
    });
    setRfEdges(newEdges);
  }, [crawlEdges, setRfEdges, highlightedCycle]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 bg-[#030712] shadow-2xl">
      {/* Top Floating Graph Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Fit graph to viewport"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => zoomIn({ duration: 300 })}
          className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <div className="w-px h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={resetCrawl}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Graph"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Highlighted Cycle Banner Overlay */}
      {highlightedCycle && (
        <div className="absolute top-3 left-3 z-10 bg-red-950/90 backdrop-blur-md border border-red-500/60 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-red-300 font-bold">CYCLE HIGHLIGHTED: </span>
            <span className="text-slate-200">{highlightedCycle.path.join(' → ')}</span>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      {crawlNodes.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-grid">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-3 shadow-inner">
            <div className="w-4 h-4 rounded-full bg-cyan-500 animate-ping" />
          </div>
          <p className="text-slate-300 text-sm font-bold">Interactive Web Graph Viewport</p>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            Enter a starting URL above or pick a demo scenario and click <strong>START CRAWL</strong> to begin real-time graph exploration.
          </p>
        </div>
      ) : (
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={3.0}
          attributionPosition="bottom-right"
        >
          <Background color="#1e293b" gap={28} size={1} />
          <Controls className="bg-slate-900 border border-slate-700" showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const crawlNode: CrawlNode = node.data?.crawlNode;
              if (!crawlNode) return '#334155';
              return STATUS_STYLES[crawlNode.status]?.border ?? '#334155';
            }}
            maskColor="rgba(3,7,18,0.75)"
            className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
          />
        </ReactFlow>
      )}

      {/* Bottom Color Legend Bar */}
      <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 flex flex-wrap gap-3 text-[10px] font-medium shadow-md">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300">Crawling</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-300">Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span className="text-slate-400">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-amber-300">Bloom</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-purple-300">Duplicate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-red-400 font-bold">Cycle Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-orange-300">Broken Link</span>
        </div>
      </div>
    </div>
  );
}

export default function CrawlerGraph() {
  return (
    <ReactFlowProvider>
      <InnerCrawlerGraph />
    </ReactFlowProvider>
  );
}
