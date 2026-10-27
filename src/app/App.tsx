import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { usePlayback } from '../hooks/usePlayback';
import { Header } from '../components/Header';
import { PageHeader } from '../components/PageHeader';
import { AlgorithmSelector } from '../components/AlgorithmSelector';
import { SettingsPanel } from '../components/SettingsPanel';
import { GridToolbar } from '../components/GridToolbar';
import { GridVisualizer } from '../components/GridVisualizer';
import { Terrain3D } from '../components/Terrain3D';
import { PlaybackControls } from '../components/PlaybackControls';
import { Legend } from '../components/Legend';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { AlgorithmExplanation } from '../components/AlgorithmExplanation';
import { AlgorithmComparisonView } from '../components/AlgorithmComparisonView';
import { DocumentationView } from '../components/DocumentationView';
import { ShortcutsModal } from '../components/ShortcutsModal';

export const App: React.FC = () => {
  // Activate playback engine hook
  usePlayback();

  const activeTab = useAppStore((s) => s.activeTab);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const searchStatus = useAppStore((s) => s.searchStatus);
  const startSearch = useAppStore((s) => s.startSearch);
  const pauseSearch = useAppStore((s) => s.pauseSearch);
  const resumeSearch = useAppStore((s) => s.resumeSearch);
  const stepForward = useAppStore((s) => s.stepForward);
  const resetAll = useAppStore((s) => s.resetAll);
  const clearWalls = useAppStore((s) => s.clearWalls);
  const clearPath = useAppStore((s) => s.clearPath);
  const generateMaze = useAppStore((s) => s.generateMaze);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const shortcutsModalOpen = useAppStore((s) => s.shortcutsModalOpen);
  const setShortcutsModalOpen = useAppStore((s) => s.setShortcutsModalOpen);

  // Sync theme with HTML document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (searchStatus === 'searching') {
          pauseSearch();
        } else if (searchStatus === 'paused') {
          resumeSearch();
        } else {
          startSearch();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetAll();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        clearWalls();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        clearPath();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        generateMaze('random-medium');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '3') {
        e.preventDefault();
        setViewMode(viewMode === '2d' ? '3d' : '2d');
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsModalOpen(!shortcutsModalOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    searchStatus,
    startSearch,
    pauseSearch,
    resumeSearch,
    stepForward,
    resetAll,
    clearWalls,
    clearPath,
    generateMaze,
    toggleTheme,
    viewMode,
    setViewMode,
    shortcutsModalOpen,
    setShortcutsModalOpen
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F0] dark:bg-[#121312] text-[#191A18] dark:text-[#EDEDE8] transition-colors">
      <Header />

      {activeTab === 'visualizer' && (
        <>
          <PageHeader />

          {/* Main 3-Column Studio Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Control Panel: Algorithm selection & Settings */}
            <section
              className="lg:col-span-3 space-y-4"
              aria-label="Algorithm and grid controls"
            >
              <div className="bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg p-4 shadow-2xs space-y-5">
                <AlgorithmSelector />
                <hr className="border-[#DEDED5] dark:border-[#2E322E]" />
                <SettingsPanel />
              </div>
            </section>

            {/* Center Main Stage: Interactive Grid or 3D Terrain */}
            <section
              className="lg:col-span-6 flex flex-col bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg shadow-2xs overflow-hidden"
              aria-label="Pathfinding visualization canvas"
            >
              <GridToolbar />

              <div className="relative w-full h-[540px] flex items-center justify-center overflow-hidden bg-[#F6F5F0] dark:bg-[#121312]">
                {viewMode === '2d' ? <GridVisualizer /> : <Terrain3D />}
              </div>

              <PlaybackControls />
              <Legend />
            </section>

            {/* Right Telemetry Panel: Metrics and Educational Inspector */}
            <section
              className="lg:col-span-3 space-y-4"
              aria-label="Algorithm telemetry and analysis"
            >
              <div className="bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg p-4 shadow-2xs space-y-5">
                <AnalyticsPanel />
                <hr className="border-[#DEDED5] dark:border-[#2E322E]" />
                <AlgorithmExplanation />
              </div>
            </section>
          </main>
        </>
      )}

      {activeTab === 'algorithms' && <AlgorithmComparisonView />}

      {activeTab === 'documentation' && <DocumentationView />}

      <ShortcutsModal />
    </div>
  );
};
