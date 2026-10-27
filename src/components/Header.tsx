import React from 'react';
import { useAppStore } from '../store/appStore';
import {
  Sun,
  Moon,
  HelpCircle,
  Box,
  Layers
} from 'lucide-react';

export const Header: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setShortcutsModalOpen = useAppStore((s) => s.setShortcutsModalOpen);
  const searchStatus = useAppStore((s) => s.searchStatus);

  const getStatusText = () => {
    switch (searchStatus) {
      case 'searching':
        return 'COMPUTING TRACE';
      case 'paused':
        return 'SEARCH PAUSED';
      case 'completed':
        return 'OPTIMAL ROUTE';
      case 'no_path':
        return 'ROUTE BLOCKED';
      default:
        return 'ENGINE READY';
    }
  };

  const getStatusDotColor = () => {
    switch (searchStatus) {
      case 'searching':
        return 'bg-[#0284C7] animate-ping';
      case 'paused':
        return 'bg-[#EAB308]';
      case 'completed':
        return 'bg-[#22C55E]';
      case 'no_path':
        return 'bg-[#F0442D]';
      default:
        return 'bg-[#22C55E]';
    }
  };

  return (
    <header className="w-full bg-white dark:bg-[#1A1C1A] border-b border-[#DEDED5] dark:border-[#2E322E] select-none sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Wordmark */}
        <div className="flex items-center gap-3">
          {/* Geometric node logo */}
          <div className="w-8 h-8 rounded-md bg-[#191A18] dark:bg-white flex items-center justify-center text-white dark:text-[#191A18] shadow-xs">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 20 4 10 14 10 14 4 20 4" />
              <circle cx="4" cy="20" r="2" fill="#F0442D" stroke="none" />
              <circle cx="20" cy="4" r="2" fill="#22C55E" stroke="none" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-sm sm:text-base font-mono-tech text-[#191A18] dark:text-[#EDEDE8]">
                PATHFINDER
              </span>
              <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-[#EEEEE8] dark:bg-[#232623] text-[#73746D] dark:text-[#9A9C94] font-semibold">
                v2.4
              </span>
            </div>
            <div className="text-[10px] font-mono-tech text-[#73746D] dark:text-[#9A9C94] tracking-wider uppercase hidden sm:block">
              INTELLIGENT SEARCH LAB
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 font-mono-tech text-xs">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 rounded transition-all font-medium ${
              activeTab === 'visualizer'
                ? 'bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] font-bold'
                : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18] dark:hover:text-[#EDEDE8]'
            }`}
          >
            Visualizer
          </button>
          <button
            onClick={() => setActiveTab('algorithms')}
            className={`px-3 py-1.5 rounded transition-all font-medium ${
              activeTab === 'algorithms'
                ? 'bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] font-bold'
                : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18] dark:hover:text-[#EDEDE8]'
            }`}
          >
            Algorithms
          </button>
          <button
            onClick={() => setActiveTab('documentation')}
            className={`px-3 py-1.5 rounded transition-all font-medium hidden md:block ${
              activeTab === 'documentation'
                ? 'bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] font-bold'
                : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18] dark:hover:text-[#EDEDE8]'
            }`}
          >
            Documentation
          </button>
        </nav>

        {/* Right: Controls & Status Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 2D / 3D Mode Toggle */}
          <div className="flex items-center bg-[#EEEEE8] dark:bg-[#232623] p-0.5 rounded border border-[#DEDED5] dark:border-[#2E322E]">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono-tech transition-all ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] font-bold shadow-xs'
                  : 'text-[#73746D] dark:text-[#9A9C94]'
              }`}
              title="2D Interactive Grid View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono-tech transition-all ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] font-bold shadow-xs'
                  : 'text-[#73746D] dark:text-[#9A9C94]'
              }`}
              title="Three.js 3D Terrain View"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-[#EEEEE8] dark:hover:bg-[#232623] text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18] dark:hover:text-[#EDEDE8] transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode (T)`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Shortcuts Button */}
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="p-2 rounded hover:bg-[#EEEEE8] dark:hover:bg-[#232623] text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18] dark:hover:text-[#EDEDE8] transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Engine Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#DEDED5] dark:border-[#2E322E]">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusDotColor()}`}
              />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusDotColor()}`} />
            </span>
            <span className="text-[10px] font-mono-tech uppercase font-bold text-[#191A18] dark:text-[#EDEDE8] tracking-wider">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
