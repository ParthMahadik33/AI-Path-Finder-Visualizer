import React from 'react';
import { useAppStore } from '../store/appStore';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Timer,
  Radio
} from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const nodesExplored = useAppStore((s) => s.nodesExplored);
  const nodesDiscovered = useAppStore((s) => s.nodesDiscovered);
  const pathLength = useAppStore((s) => s.pathLength);
  const pathCost = useAppStore((s) => s.pathCost);
  const searchDurationMs = useAppStore((s) => s.searchDurationMs);
  const searchStatus = useAppStore((s) => s.searchStatus);
  const rows = useAppStore((s) => s.rows);
  const cols = useAppStore((s) => s.cols);

  const totalGridCells = rows * cols;
  const exploredPercent = totalGridCells > 0 ? ((nodesExplored / totalGridCells) * 100).toFixed(1) : '0';
  const pathPercent = nodesExplored > 0 ? ((pathLength / nodesExplored) * 100).toFixed(1) : '0';

  const getStatusBadge = () => {
    switch (searchStatus) {
      case 'searching':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#BAE6FD]/40 text-[#0284C7] dark:bg-[#0369A1]/20 dark:text-[#38BDF8]">
            <Radio className="w-3 h-3 animate-pulse" />
            SEARCHING
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF08A]/40 text-[#A16207] dark:bg-[#713F12]/30 dark:text-[#FDE047]">
            <Timer className="w-3 h-3" />
            PAUSED
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#BBF7D0]/40 text-[#15803D] dark:bg-[#14532D]/30 dark:text-[#4ADE80]">
            <CheckCircle2 className="w-3 h-3" />
            ROUTE DISCOVERED
          </span>
        );
      case 'no_path':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FECDD3]/40 text-[#BE123C] dark:bg-[#881337]/30 dark:text-[#FB7185]">
            <XCircle className="w-3 h-3" />
            NO PATH (UNREACHABLE)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEEEE8] dark:bg-[#232623] text-[#73746D] dark:text-[#9A9C94]">
            IDLE / READY
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 select-none font-mono-tech">
      <div className="flex items-center justify-between border-b border-[#DEDED5] dark:border-[#2E322E] pb-2">
        <span className="text-[11px] uppercase tracking-wider text-[#73746D] dark:text-[#9A9C94] font-semibold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>Search Telemetry</span>
        </span>
        {getStatusBadge()}
      </div>

      {/* Grid of Key Numerical Readouts */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Nodes Explored */}
        <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E]">
          <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94] uppercase tracking-wider">
            Nodes Explored
          </div>
          <div className="text-xl font-bold text-[#191A18] dark:text-[#EDEDE8] mt-1">
            {nodesExplored.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#9E9F97] mt-0.5">
            {exploredPercent}% of total grid
          </div>
        </div>

        {/* Nodes Discovered */}
        <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E]">
          <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94] uppercase tracking-wider">
            Frontier / Seen
          </div>
          <div className="text-xl font-bold text-[#191A18] dark:text-[#EDEDE8] mt-1">
            {nodesDiscovered.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#9E9F97] mt-0.5">
            Discovered nodes
          </div>
        </div>

        {/* Path Length */}
        <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E]">
          <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94] uppercase tracking-wider">
            Path Length
          </div>
          <div className="text-xl font-bold text-[#F0442D] mt-1">
            {pathLength > 0 ? `${pathLength} steps` : '—'}
          </div>
          <div className="text-[10px] text-[#9E9F97] mt-0.5">
            {pathLength > 0 ? `${pathPercent}% efficiency` : 'No route'}
          </div>
        </div>

        {/* Path Cost */}
        <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E]">
          <div className="text-[10px] text-[#73746D] dark:text-[#9A9C94] uppercase tracking-wider">
            Total Path Cost
          </div>
          <div className="text-xl font-bold text-[#191A18] dark:text-[#EDEDE8] mt-1">
            {pathCost > 0 ? pathCost.toFixed(2) : '0.00'}
          </div>
          <div className="text-[10px] text-[#9E9F97] mt-0.5">
            Weighted traversal sum
          </div>
        </div>
      </div>

      {/* Computation vs Animation Benchmark Bar */}
      <div className="p-3 bg-white dark:bg-[#1A1C1A] rounded-md border border-[#DEDED5] dark:border-[#2E322E] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#73746D] dark:text-[#9A9C94] flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-[#F0442D]" />
            Algorithm Execution Time
          </span>
          <span className="font-bold text-[#191A18] dark:text-[#EDEDE8]">
            {searchDurationMs > 0 ? `${searchDurationMs} ms` : '< 1 ms'}
          </span>
        </div>
        <p className="text-[10px] text-[#9E9F97] leading-relaxed">
          * Measured pure algorithmic computation time (excluding UI animation playback).
        </p>

        {/* Visual search efficiency bar */}
        {nodesExplored > 0 && (
          <div className="pt-2 border-t border-[#DEDED5] dark:border-[#2E322E] space-y-1">
            <div className="flex justify-between text-[10px] text-[#73746D] dark:text-[#9A9C94]">
              <span>Search Ratio (Path vs Explored)</span>
              <span>{pathLength} / {nodesExplored}</span>
            </div>
            <div className="w-full h-2 bg-[#EEEEE8] dark:bg-[#232623] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, Math.max(5, (pathLength / nodesExplored) * 100))}%` }}
                className="bg-[#F0442D] h-full transition-all"
                title="Final path steps"
              />
              <div
                style={{ width: `${Math.max(0, 100 - (pathLength / nodesExplored) * 100)}%` }}
                className="bg-[#8FA6B2] dark:bg-[#334958] h-full transition-all"
                title="Explored non-path nodes"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
