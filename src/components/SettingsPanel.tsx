import React from 'react';
import { useAppStore } from '../store/appStore';
import { Compass, ShieldCheck, Mountain, Dices } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const movementMode = useAppStore((s) => s.movementMode);
  const setMovementMode = useAppStore((s) => s.setMovementMode);
  const cornerCuttingRule = useAppStore((s) => s.cornerCuttingRule);
  const setCornerCuttingRule = useAppStore((s) => s.setCornerCuttingRule);
  const weightedTerrainEnabled = useAppStore((s) => s.weightedTerrainEnabled);
  const setWeightedTerrainEnabled = useAppStore((s) => s.setWeightedTerrainEnabled);
  const generateMaze = useAppStore((s) => s.generateMaze);
  const searchStatus = useAppStore((s) => s.searchStatus);

  const isSearching = searchStatus === 'searching';

  return (
    <div className="space-y-4 select-none font-mono-tech">
      {/* Movement Mode */}
      <div className="space-y-1.5">
        <label className="text-[11px] uppercase tracking-wider text-[#73746D] dark:text-[#9A9C94] font-semibold flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          <span>Movement Grid</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setMovementMode('4-directional')}
            disabled={isSearching}
            className={`p-2.5 rounded-md border text-center transition-all ${
              movementMode === '4-directional'
                ? 'border-[#191A18] dark:border-white bg-[#191A18] text-white dark:bg-white dark:text-[#191A18] font-bold shadow-xs'
                : 'border-[#DEDED5] dark:border-[#2E322E] bg-white dark:bg-[#1A1C1A] text-[#73746D] dark:text-[#9A9C94] hover:border-[#C4C4BA]'
            }`}
          >
            4-Directional
            <div className="text-[10px] font-normal opacity-80 mt-0.5">Orthogonal (N,S,E,W)</div>
          </button>

          <button
            onClick={() => setMovementMode('8-directional')}
            disabled={isSearching}
            className={`p-2.5 rounded-md border text-center transition-all ${
              movementMode === '8-directional'
                ? 'border-[#191A18] dark:border-white bg-[#191A18] text-white dark:bg-white dark:text-[#191A18] font-bold shadow-xs'
                : 'border-[#DEDED5] dark:border-[#2E322E] bg-white dark:bg-[#1A1C1A] text-[#73746D] dark:text-[#9A9C94] hover:border-[#C4C4BA]'
            }`}
          >
            8-Directional
            <div className="text-[10px] font-normal opacity-80 mt-0.5">Diagonal (√2 cost)</div>
          </button>
        </div>
      </div>

      {/* Diagonal Corner Cutting (shown if 8-directional) */}
      {movementMode === '8-directional' && (
        <div className="space-y-1.5 bg-[#EEEEE8]/50 dark:bg-[#232623]/50 p-2.5 rounded-md border border-[#DEDED5] dark:border-[#2E322E]">
          <label className="text-[10px] uppercase tracking-wider text-[#73746D] dark:text-[#9A9C94] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Diagonal Corner Rule</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => setCornerCuttingRule('no-squeeze')}
              disabled={isSearching}
              className={`py-1.5 px-2 rounded text-center transition-all ${
                cornerCuttingRule === 'no-squeeze'
                  ? 'bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] shadow-xs font-semibold'
                  : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18]'
              }`}
              title="Cannot cut through diagonal if both adjacent walls exist"
            >
              Standard
            </button>
            <button
              onClick={() => setCornerCuttingRule('never')}
              disabled={isSearching}
              className={`py-1.5 px-2 rounded text-center transition-all ${
                cornerCuttingRule === 'never'
                  ? 'bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] shadow-xs font-semibold'
                  : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18]'
              }`}
              title="Cannot step diagonally if even 1 adjacent cell is a wall"
            >
              Strict
            </button>
            <button
              onClick={() => setCornerCuttingRule('unrestricted')}
              disabled={isSearching}
              className={`py-1.5 px-2 rounded text-center transition-all ${
                cornerCuttingRule === 'unrestricted'
                  ? 'bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] shadow-xs font-semibold'
                  : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18]'
              }`}
              title="Allowed diagonally regardless of corners"
            >
              Free
            </button>
          </div>
        </div>
      )}

      {/* Weighted Terrain Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#B45309]/10 text-[#B45309] flex items-center justify-center">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#191A18] dark:text-[#EDEDE8]">
              Weighted Terrain
            </div>
            <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94]">
              Mud tiles incur 3× path cost
            </div>
          </div>
        </div>

        <button
          onClick={() => setWeightedTerrainEnabled(!weightedTerrainEnabled)}
          disabled={isSearching}
          className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
            weightedTerrainEnabled ? 'bg-[#F0442D]' : 'bg-[#DEDED5] dark:bg-[#2E322E]'
          }`}
          role="switch"
          aria-checked={weightedTerrainEnabled}
        >
          <span
            className={`block w-4 h-4 rounded-full bg-white transition-transform ${
              weightedTerrainEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Maze Quick Generation Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-wider text-[#73746D] dark:text-[#9A9C94] font-semibold flex items-center gap-1.5">
          <Dices className="w-3.5 h-3.5" />
          <span>Maze Generation</span>
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => generateMaze('recursive-backtracking')}
            disabled={isSearching}
            className="p-2 bg-white dark:bg-[#1A1C1A] hover:bg-[#EEEEE8] dark:hover:bg-[#232623] border border-[#DEDED5] dark:border-[#2E322E] rounded text-left transition-colors"
          >
            <div className="font-semibold text-[#191A18] dark:text-[#EDEDE8]">Labyrinth</div>
            <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94]">Recursive DFS</div>
          </button>

          <button
            onClick={() => generateMaze('random-medium')}
            disabled={isSearching}
            className="p-2 bg-white dark:bg-[#1A1C1A] hover:bg-[#EEEEE8] dark:hover:bg-[#232623] border border-[#DEDED5] dark:border-[#2E322E] rounded text-left transition-colors"
          >
            <div className="font-semibold text-[#191A18] dark:text-[#EDEDE8]">Random 25%</div>
            <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94]">Medium Obstacles</div>
          </button>
        </div>
      </div>
    </div>
  );
};
