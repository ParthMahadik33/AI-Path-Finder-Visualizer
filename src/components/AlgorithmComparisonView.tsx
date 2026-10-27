import React from 'react';
import { ALGORITHM_METADATA } from '../algorithms/metadata';
import type { AlgorithmType } from '../algorithms/types';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const AlgorithmComparisonView: React.FC = () => {
  const setSelectedAlgorithm = useAppStore((s) => s.setSelectedAlgorithm);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const algos: AlgorithmType[] = ['astar', 'bfs', 'dijkstra', 'greedy'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 font-mono-tech select-none">
      <div className="border-b border-[#DEDED5] dark:border-[#2E322E] pb-4">
        <h2 className="text-xl font-serif-editorial italic text-[#191A18] dark:text-[#EDEDE8]">
          Algorithm Architecture & Comparative Analysis
        </h2>
        <p className="text-xs text-[#73746D] dark:text-[#9A9C94] mt-1">
          Detailed mathematical breakdown of search guarantees, time-space complexities, and operational trade-offs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {algos.map((id) => {
          const meta = ALGORITHM_METADATA[id];
          return (
            <div
              key={id}
              className="p-5 bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#191A18] dark:text-[#EDEDE8]">
                    {meta.name}
                  </h3>
                  <span className="text-[10px] text-[#73746D] dark:text-[#9A9C94] uppercase tracking-wider">
                    {meta.category}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F0442D] text-white">
                  {meta.shortTag}
                </span>
              </div>

              <p className="text-xs text-[#73746D] dark:text-[#9A9C94] leading-relaxed">
                {meta.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#DEDED5] dark:border-[#2E322E]">
                <div>
                  <span className="text-[10px] text-[#9E9F97] block">Time Complexity:</span>
                  <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">{meta.timeComplexity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9E9F97] block">Space Complexity:</span>
                  <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">{meta.spaceComplexity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9E9F97] block">Heuristic Function:</span>
                  <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">{meta.heuristicType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9E9F97] block">Optimal Shortest Path:</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      meta.guaranteesShortest
                        ? 'text-[#15803D] dark:text-[#22C55E]'
                        : 'text-[#B45309] dark:text-[#FBBF24]'
                    }`}
                  >
                    {meta.guaranteesShortest ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Guaranteed
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Not Guaranteed
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="text-[11px] bg-[#F6F5F0] dark:bg-[#232623] p-2.5 rounded text-[#73746D] dark:text-[#9A9C94] leading-relaxed">
                <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">Trade-off: </span>
                {meta.tradeoffs}
              </div>

              <button
                onClick={() => {
                  setSelectedAlgorithm(id);
                  setActiveTab('visualizer');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#EEEEE8] dark:bg-[#232623] hover:bg-[#F0442D] hover:text-white dark:hover:bg-[#F0442D] text-[#191A18] dark:text-[#EDEDE8] rounded text-xs font-semibold transition-colors"
              >
                <span>Select & Test on Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
