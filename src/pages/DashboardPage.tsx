// ============================================================
// DASHBOARD PAGE — 3-column layout with all features
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Triangle, LayoutGrid, Layers, Hash, List, Terminal, Info,
  BarChart2, AlertTriangle, Play, HelpCircle, Sparkles, Settings,
  ShieldAlert, Link2
} from 'lucide-react';
import CrawlerControls from '../components/dashboard/CrawlerControls';
import CrawlerGraph from '../components/dashboard/CrawlerGraph';
import NodeDetails from '../components/dashboard/NodeDetails';
import StatsCards from '../components/dashboard/StatsCards';
import CrawlerConsole from '../components/dashboard/CrawlerConsole';
import AlgorithmPipeline from '../components/dashboard/AlgorithmPipeline';
import BloomFilterVisualizer from '../components/dashboard/BloomFilterVisualizer';
import HashSetVisualizer from '../components/dashboard/HashSetVisualizer';
import QueueVisualizer from '../components/dashboard/QueueVisualizer';
import CanonicalizationVisualizer from '../components/dashboard/CanonicalizationVisualizer';
import CycleDetector from '../components/dashboard/CycleDetector';
import CompletionScreen from '../components/dashboard/CompletionScreen';
import PresentationMode from '../components/presentation/PresentationMode';
import VivaExplanationModal from '../components/dashboard/VivaExplanationModal';
import SettingsModal from '../components/settings/SettingsModal';
import { useCrawlerStore } from '../store/crawlerStore';

type RightTab = 'node' | 'pipeline' | 'bloom' | 'hashset' | 'queue' | 'canonical' | 'cycles';
type BottomTab = 'console' | 'stats';

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: 'pipeline', label: 'Pipeline', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'node', label: 'Inspector', icon: <Info className="w-3.5 h-3.5" /> },
  { id: 'canonical', label: 'Canonical', icon: <Link2 className="w-3.5 h-3.5" /> },
  { id: 'bloom', label: 'Bloom', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { id: 'hashset', label: 'HashSet', icon: <Hash className="w-3.5 h-3.5" /> },
  { id: 'queue', label: 'Queue/Stack', icon: <List className="w-3.5 h-3.5" /> },
  { id: 'cycles', label: 'Cycles', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
];

export default function DashboardPage() {
  const { crawlerState } = useCrawlerStore();
  const { status, stats, detectedCycles, pipelineStage, currentUrl, currentCanonical, config } = crawlerState;
  const [rightTab, setRightTab] = useState<RightTab>('pipeline');
  const [bottomTab, setBottomTab] = useState<BottomTab>('console');

  // Modals
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const statusConfig = {
    idle:     { label: 'READY', color: 'bg-slate-500', textColor: 'text-slate-400' },
    crawling: { label: 'CRAWLING', color: 'bg-cyan-400 animate-pulse', textColor: 'text-cyan-400' },
    paused:   { label: 'PAUSED', color: 'bg-amber-400', textColor: 'text-amber-400' },
    complete: { label: 'COMPLETE', color: 'bg-green-400', textColor: 'text-green-400' },
    error:    { label: 'ERROR', color: 'bg-red-400', textColor: 'text-red-400' },
  };

  const sc = statusConfig[status];

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col pt-14">
      {/* Sub-Header Toolbar */}
      <div className="border-b border-slate-800 bg-[#030712]/95 backdrop-blur-sm sticky top-14 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Brand and status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
              <div className={`w-2 h-2 rounded-full ${sc.color}`} />
              <span className={`text-[10px] font-mono font-bold tracking-wider ${sc.textColor}`}>
                ● {sc.label}
              </span>
            </div>

            {/* Cycle Alert Banner */}
            <AnimatePresence>
              {detectedCycles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/40 rounded-full cursor-pointer hover:bg-red-500/25 transition-colors"
                  onClick={() => setRightTab('cycles')}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 font-mono">
                    {detectedCycles.length} CYCLE{detectedCycles.length > 1 ? 'S' : ''} DETECTED (BLOCKED)
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Action Buttons: Presentation Mode & Explain This Step */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsVivaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold hover:bg-amber-500/25 transition-colors shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Explain This Step</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPresentationOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Presentation Mode</span>
            </motion.button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Crawl Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 flex items-center justify-center">
        <span className="text-[10px] text-amber-400/80 font-mono text-center">
          ● PROTOTYPE SIMULATION — Respect robots.txt, rate limits, and site policies when developing production pipelines.
        </span>
      </div>

      {/* 3-Column Main Dashboard Layout */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-3 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-3 h-full">

          {/* ─── LEFT: Controls ───────────────────────────────── */}
          <div className="lg:h-[calc(100vh-12rem)] overflow-y-auto pr-1">
            <CrawlerControls />
          </div>

          {/* ─── CENTER: Graph + bottom panels ───────────────── */}
          <div className="flex flex-col gap-3">
            {/* Graph */}
            <div className="relative h-[440px] lg:h-[calc(100vh-21rem)]">
              <CrawlerGraph />
            </div>

            {/* Bottom tabs: Console & Stats */}
            <div className="card flex flex-col" style={{ height: '210px' }}>
              <div className="flex border-b border-slate-800 bg-slate-950/50 px-2">
                {[
                  { id: 'console', label: 'Live Console', icon: <Terminal className="w-3.5 h-3.5" /> },
                  { id: 'stats', label: 'Crawl Metrics', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBottomTab(tab.id as BottomTab)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                      bottomTab === tab.id
                        ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5'
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-hidden">
                {bottomTab === 'console' ? (
                  <CrawlerConsole />
                ) : (
                  <div className="p-3 h-full overflow-y-auto">
                    <StatsCards stats={crawlerState.stats} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Inspector / visualizers ──────────────── */}
          <div className="flex flex-col gap-0 h-[calc(100vh-12rem)]">
            {/* Tab bar */}
            <div className="flex border-b border-slate-800 bg-slate-950 rounded-t-xl overflow-x-auto no-scrollbar">
              {RIGHT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  title={tab.label}
                  className={`flex-1 min-w-[50px] flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors border-b-2 -mb-px ${
                    rightTab === tab.id
                      ? 'text-cyan-400 border-cyan-500 bg-cyan-500/10'
                      : 'text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden rounded-b-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={rightTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {rightTab === 'pipeline' && <AlgorithmPipeline />}
                  {rightTab === 'node' && <NodeDetails />}
                  {rightTab === 'canonical' && <CanonicalizationVisualizer />}
                  {rightTab === 'bloom' && <BloomFilterVisualizer />}
                  {rightTab === 'hashset' && <HashSetVisualizer />}
                  {rightTab === 'queue' && <QueueVisualizer />}
                  {rightTab === 'cycles' && <CycleDetector />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal Overlay */}
      <CompletionScreen />

      {/* Presentation Mode Overlay */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />

      {/* Viva / "Explain This Step" Modal */}
      <VivaExplanationModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        currentStage={pipelineStage}
        currentUrl={currentUrl}
        currentCanonical={currentCanonical}
        strategy={config.strategy}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
