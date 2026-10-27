import React from 'react';
import { useAppStore } from '../store/appStore';
import {
  Square,
  Mountain,
  Eraser,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import type { MazeType } from '../maze';

export const GridToolbar: React.FC = () => {
  const activeBrush = useAppStore((s) => s.activeBrush);
  const setActiveBrush = useAppStore((s) => s.setActiveBrush);
  const clearWalls = useAppStore((s) => s.clearWalls);
  const clearPath = useAppStore((s) => s.clearPath);
  const resetAll = useAppStore((s) => s.resetAll);
  const generateMaze = useAppStore((s) => s.generateMaze);
  const rows = useAppStore((s) => s.rows);
  const cols = useAppStore((s) => s.cols);
  const setDimensions = useAppStore((s) => s.setDimensions);
  const weightedTerrainEnabled = useAppStore((s) => s.weightedTerrainEnabled);
  const setWeightedTerrainEnabled = useAppStore((s) => s.setWeightedTerrainEnabled);
  const searchStatus = useAppStore((s) => s.searchStatus);

  const isSearching = searchStatus === 'searching';

  const handleDimensionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [r, c] = e.target.value.split('x').map(Number);
    setDimensions(r, c);
  };

  const handleMazeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MazeType;
    if (val) {
      generateMaze(val);
      e.target.value = ''; // reset dropdown
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-[#1A1C1A] border-b border-[#DEDED5] dark:border-[#2E322E] text-xs font-mono-tech select-none">
      {/* Brush Tools */}
      <div className="flex items-center gap-1.5">
        <span className="text-[#73746D] dark:text-[#9A9C94] uppercase tracking-wider font-semibold mr-1 hidden sm:inline">
          Brush:
        </span>

        <button
          onClick={() => setActiveBrush('wall')}
          disabled={isSearching}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all font-medium ${
            activeBrush === 'wall'
              ? 'bg-[#191A18] text-white dark:bg-white dark:text-[#191A18] shadow-xs'
              : 'bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D]'
          }`}
          title="Draw solid impassable obstacles"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Wall</span>
        </button>

        <button
          onClick={() => {
            setActiveBrush('weight');
            if (!weightedTerrainEnabled) setWeightedTerrainEnabled(true);
          }}
          disabled={isSearching}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all font-medium ${
            activeBrush === 'weight'
              ? 'bg-[#B45309] text-white shadow-xs'
              : 'bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D]'
          }`}
          title="Paint 3× weight rough terrain"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Mud (3×)</span>
        </button>

        <button
          onClick={() => setActiveBrush('eraser')}
          disabled={isSearching}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all font-medium ${
            activeBrush === 'eraser'
              ? 'bg-[#191A18] text-white dark:bg-white dark:text-[#191A18] shadow-xs'
              : 'bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D]'
          }`}
          title="Erase walls and terrain"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Eraser</span>
        </button>
      </div>

      {/* Maze Generator Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            onChange={handleMazeChange}
            defaultValue=""
            disabled={isSearching}
            className="appearance-none bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] pl-2.5 pr-7 py-1.5 rounded font-mono-tech border border-[#DEDED5] dark:border-[#2E322E] cursor-pointer hover:border-[#C4C4BA] dark:hover:border-[#404440] transition-colors focus:outline-none"
          >
            <option value="" disabled>
              Generate Maze...
            </option>
            <option value="recursive-backtracking">Labyrinth (Recursive)</option>
            <option value="random-sparse">Random Sparse (15%)</option>
            <option value="random-medium">Random Medium (25%)</option>
            <option value="random-dense">Random Dense (35%)</option>
          </select>
          <ChevronDown className="w-3 h-3 text-[#73746D] absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Grid Dimensions */}
        <div className="relative hidden md:block">
          <select
            value={`${rows}x${cols}`}
            onChange={handleDimensionChange}
            disabled={isSearching}
            className="appearance-none bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] pl-2.5 pr-7 py-1.5 rounded font-mono-tech border border-[#DEDED5] dark:border-[#2E322E] cursor-pointer hover:border-[#C4C4BA] dark:hover:border-[#404440] transition-colors focus:outline-none"
          >
            <option value="15x20">15 × 20 (Compact)</option>
            <option value="20x30">20 × 30 (Standard)</option>
            <option value="25x40">25 × 40 (Spacious)</option>
            <option value="30x50">30 × 50 (Dense)</option>
          </select>
          <ChevronDown className="w-3 h-3 text-[#73746D] absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Clear Buttons */}
        <button
          onClick={clearPath}
          disabled={isSearching}
          className="px-2.5 py-1.5 bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D] rounded transition-colors"
          title="Clear search path without resetting walls"
        >
          Clear Path
        </button>

        <button
          onClick={clearWalls}
          disabled={isSearching}
          className="px-2.5 py-1.5 bg-[#EEEEE8] dark:bg-[#232623] text-[#191A18] dark:text-[#EDEDE8] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D] rounded transition-colors"
          title="Clear walls without moving start and destination"
        >
          Clear Walls
        </button>

        <button
          onClick={resetAll}
          disabled={isSearching}
          className="p-1.5 text-[#73746D] hover:text-[#F0442D] dark:hover:text-[#F0442D] hover:bg-[#EEEEE8] dark:hover:bg-[#232623] rounded transition-colors"
          title="Reset grid completely (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
