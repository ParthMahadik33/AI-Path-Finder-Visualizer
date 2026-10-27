import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ALGORITHM_METADATA } from '../algorithms/metadata';
import { BookOpen, Code, ChevronRight, ChevronDown, Binary, Info } from 'lucide-react';

export const AlgorithmExplanation: React.FC = () => {
  const selectedAlgorithm = useAppStore((s) => s.selectedAlgorithm);
  const currentInspectEvent = useAppStore((s) => s.currentInspectEvent);
  const searchStatus = useAppStore((s) => s.searchStatus);
  const nodesDiscovered = useAppStore((s) => s.nodesDiscovered);
  const nodesExplored = useAppStore((s) => s.nodesExplored);

  const [pseudocodeOpen, setPseudocodeOpen] = useState(false);
  const meta = ALGORITHM_METADATA[selectedAlgorithm];

  const hasEvent = currentInspectEvent !== null && searchStatus !== 'idle';

  return (
    <div className="space-y-4 select-none font-mono-tech">
      <div className="flex items-center justify-between border-b border-[#DEDED5] dark:border-[#2E322E] pb-2">
        <span className="text-[11px] uppercase tracking-wider text-[#73746D] dark:text-[#9A9C94] font-semibold flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Inside the search</span>
        </span>
        <span className="text-[10px] text-[#F0442D] font-bold">
          {meta.shortTag} THEORY
        </span>
      </div>

      {/* Real-time Dynamic Event Inspector */}
      {hasEvent ? (
        <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#F0442D]/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#F0442D] flex items-center gap-1">
              <Binary className="w-3 h-3" />
              Active Inspection
            </span>
            <span className="text-[10px] text-[#73746D] dark:text-[#9A9C94]">
              Step #{currentInspectEvent.stepNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-[#F6F5F0] dark:bg-[#232623] rounded">
              <span className="text-[9px] text-[#73746D] dark:text-[#9A9C94] block">Current Node</span>
              <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">
                ({currentInspectEvent.coord.r}, {currentInspectEvent.coord.c})
              </span>
            </div>

            <div className="p-2 bg-[#F6F5F0] dark:bg-[#232623] rounded">
              <span className="text-[9px] text-[#73746D] dark:text-[#9A9C94] block">Frontier Open</span>
              <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">
                {Math.max(0, nodesDiscovered - nodesExplored)} nodes
              </span>
            </div>

            {currentInspectEvent.g !== undefined && (
              <div className="p-2 bg-[#F6F5F0] dark:bg-[#232623] rounded">
                <span className="text-[9px] text-[#73746D] dark:text-[#9A9C94] block">g(n) Path Cost</span>
                <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">
                  {currentInspectEvent.g.toFixed(2)}
                </span>
              </div>
            )}

            {currentInspectEvent.h !== undefined && (
              <div className="p-2 bg-[#F6F5F0] dark:bg-[#232623] rounded">
                <span className="text-[9px] text-[#73746D] dark:text-[#9A9C94] block">h(n) Heuristic</span>
                <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">
                  {currentInspectEvent.h.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {currentInspectEvent.f !== undefined && (
            <div className="p-2 bg-[#F0442D]/5 dark:bg-[#F0442D]/10 rounded border border-[#F0442D]/20 text-xs">
              <div className="text-[9px] text-[#F0442D] uppercase font-bold">
                Evaluation Priority: f(n) = g(n) + h(n)
              </div>
              <div className="font-bold text-[#191A18] dark:text-[#EDEDE8] mt-0.5">
                f = {currentInspectEvent.f.toFixed(2)}
              </div>
            </div>
          )}

          {currentInspectEvent.description && (
            <p className="text-[11px] text-[#73746D] dark:text-[#9A9C94] leading-relaxed pt-1 border-t border-[#DEDED5] dark:border-[#2E322E]">
              {currentInspectEvent.description}
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#191A18] dark:text-[#EDEDE8]">
            <Info className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Search Concept Overview</span>
          </div>
          <p className="text-[11px] text-[#73746D] dark:text-[#9A9C94] leading-relaxed">
            {meta.description}
          </p>
        </div>
      )}

      {/* Complexity & Characteristics */}
      <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E] space-y-2 text-xs">
        <div className="text-[10px] uppercase font-bold text-[#73746D] dark:text-[#9A9C94] tracking-wider">
          Algorithm Properties
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[#9E9F97] block">Time Complexity:</span>
            <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">{meta.timeComplexity}</span>
          </div>
          <div>
            <span className="text-[#9E9F97] block">Space Complexity:</span>
            <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">{meta.spaceComplexity}</span>
          </div>
          <div>
            <span className="text-[#9E9F97] block">Heuristic Function:</span>
            <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">{meta.heuristicType}</span>
          </div>
          <div>
            <span className="text-[#9E9F97] block">Shortest Guaranteed:</span>
            <span
              className={`font-bold ${
                meta.guaranteesShortest
                  ? 'text-[#15803D] dark:text-[#22C55E]'
                  : 'text-[#B45309] dark:text-[#FBBF24]'
              }`}
            >
              {meta.guaranteesShortest ? 'Yes (Optimal)' : 'No (Heuristic)'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#DEDED5] dark:border-[#2E322E] text-[10px] text-[#73746D] dark:text-[#9A9C94] leading-relaxed">
          <span className="font-semibold text-[#191A18] dark:text-[#EDEDE8]">Trade-off: </span>
          {meta.tradeoffs}
        </div>
      </div>

      {/* Expandable Pseudocode Section */}
      <div className="border border-[#DEDED5] dark:border-[#2E322E] rounded-md overflow-hidden bg-white dark:bg-[#1A1C1A]">
        <button
          onClick={() => setPseudocodeOpen(!pseudocodeOpen)}
          className="w-full flex items-center justify-between p-2.5 text-xs font-semibold text-[#191A18] dark:text-[#EDEDE8] hover:bg-[#EEEEE8] dark:hover:bg-[#232623] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-[#F0442D]" />
            Algorithm Pseudocode
          </span>
          {pseudocodeOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#73746D]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#73746D]" />
          )}
        </button>

        {pseudocodeOpen && (
          <div className="p-3 bg-[#191A18] text-[#F6F5F0] text-[11px] font-mono-tech overflow-x-auto leading-relaxed border-t border-[#DEDED5] dark:border-[#2E322E]">
            {meta.pseudocode.map((line, idx) => (
              <div key={idx} className="hover:bg-white/5 px-1 rounded">
                <span className="text-[#73746D] select-none mr-3 inline-block w-4 text-right">
                  {idx + 1}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
