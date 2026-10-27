import React from 'react';
import { useAppStore } from '../store/appStore';
import type { AlgorithmType } from '../algorithms/types';
import { ALGORITHM_METADATA } from '../algorithms/metadata';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const AlgorithmSelector: React.FC = () => {
  const selectedAlgorithm = useAppStore((s) => s.selectedAlgorithm);
  const setSelectedAlgorithm = useAppStore((s) => s.setSelectedAlgorithm);
  const searchStatus = useAppStore((s) => s.searchStatus);

  const isSearching = searchStatus === 'searching';
  const algorithms: AlgorithmType[] = ['astar', 'bfs', 'dijkstra', 'greedy'];

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono-tech uppercase tracking-wider text-[#73746D] dark:text-[#9A9C94] font-semibold">
          Select Algorithm
        </span>
        <span className="text-[10px] font-mono-tech text-[#9E9F97]">
          4 Implemented
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {algorithms.map((algoId) => {
          const meta = ALGORITHM_METADATA[algoId];
          const isSelected = selectedAlgorithm === algoId;

          return (
            <button
              key={algoId}
              onClick={() => setSelectedAlgorithm(algoId)}
              disabled={isSearching}
              className={`relative text-left p-3 rounded-md border transition-all ${
                isSelected
                  ? 'border-[#F0442D] bg-[#F0442D]/5 dark:bg-[#F0442D]/10 text-[#191A18] dark:text-[#EDEDE8] shadow-xs'
                  : 'border-[#DEDED5] dark:border-[#2E322E] bg-white dark:bg-[#1A1C1A] hover:border-[#C4C4BA] dark:hover:border-[#404440] text-[#73746D] dark:text-[#9A9C94]'
              }`}
            >
              {/* Selected indicator stripe */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F0442D] rounded-l-md" />
              )}

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#191A18] dark:text-[#EDEDE8]">
                      {meta.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono-tech px-1.5 py-0.5 rounded uppercase font-bold ${
                        isSelected
                          ? 'bg-[#F0442D] text-white'
                          : 'bg-[#EEEEE8] dark:bg-[#232623] text-[#73746D] dark:text-[#9A9C94]'
                      }`}
                    >
                      {meta.shortTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#73746D] dark:text-[#9A9C94] mt-0.5 font-mono-tech">
                    {meta.category}
                  </div>
                </div>

                {/* Optimality indicator */}
                <div className="flex items-center gap-1 text-[10px] font-mono-tech">
                  {meta.guaranteesShortest ? (
                    <span
                      className="flex items-center gap-1 text-[#15803D] dark:text-[#22C55E]"
                      title="Mathematically guarantees optimal shortest path"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Optimal</span>
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-[#B45309] dark:text-[#FBBF24]"
                      title="Heuristic path, does not guarantee shortest route"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Heuristic</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
