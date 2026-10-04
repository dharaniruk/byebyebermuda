// ============================================================
// MAIN APP ROUTER & GLOBAL MODALS
// ============================================================

import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import HistoryPage from './pages/HistoryPage';
import CyclesPage from './pages/CyclesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VisualizerPage from './pages/VisualizerPage';
import TechnicalDetailsPage from './pages/TechnicalDetailsPage';
import ArchitecturePage from './pages/ArchitecturePage';
import AboutPage from './pages/AboutPage';
import SettingsModal from './components/settings/SettingsModal';
import PresentationMode from './components/presentation/PresentationMode';
import VivaExplanationModal from './components/dashboard/VivaExplanationModal';
import { useCrawlerStore } from './store/crawlerStore';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isVivaOpen, setIsVivaOpen] = useState(false);

  const { crawlerState } = useCrawlerStore();
  const { pipelineStage, currentUrl, currentCanonical, config } = crawlerState;

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900 flex flex-col">
        {/* Global Navigation Header */}
        <Navbar
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onPresentationOpen={() => setIsPresentationOpen(true)}
          onVivaOpen={() => setIsVivaOpen(true)}
        />

        {/* Main Application Routes */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/cycles" element={<CyclesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/visualizer" element={<VisualizerPage />} />
            <Route path="/technical-details" element={<TechnicalDetailsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <PresentationMode
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
        />

        <VivaExplanationModal
          isOpen={isVivaOpen}
          onClose={() => setIsVivaOpen(false)}
          currentStage={pipelineStage}
          currentUrl={currentUrl}
          currentCanonical={currentCanonical}
          strategy={config.strategy}
        />
      </div>
    </HashRouter>
  );
}
