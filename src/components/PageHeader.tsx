import React from 'react';
import { useAppStore } from '../store/appStore';
import { ALGORITHM_METADATA } from '../algorithms/metadata';
import { Terminal } from 'lucide-react';

export const PageHeader: React.FC = () => {
  const selectedAlgorithm = useAppStore((s) => s.selectedAlgorithm);
  const movementMode = useAppStore((s) => s.movementMode);
  const weightedTerrainEnabled = useAppStore((s) => s.weightedTerrainEnabled);
  const meta = ALGORITHM_METADATA[selectedAlgorithm];

  return (
    <div className="border-b border-[#DEDED5] dark:border-[#2E322E] bg-[#F6F5F0] dark:bg-[#121312] py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono-tech text-[#F0442D] uppercase tracking-widest font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>SEARCH ALGORITHMS / INTERACTIVE LAB</span>
          </div>

          {/* Main Editorial Heading */}
          <h1 className="text-2xl sm:text-3xl font-serif-editorial italic text-[#191A18] dark:text-[#EDEDE8] mt-0.5 tracking-tight">
            “Every path has a logic.”
          </h1>

          {/* Supporting text */}
          <p className="text-xs sm:text-sm text-[#73746D] dark:text-[#9A9C94] max-w-2xl mt-1 leading-relaxed">
            Explore how search algorithms navigate obstacles, evaluate possibilities, and discover optimal routes in discrete space.
          </p>
        </div>

        {/* Algorithm Configuration Capsule */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech self-start md:self-end">
          <div className="px-2.5 py-1 rounded bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] text-[#191A18] dark:text-[#EDEDE8]">
            <span className="text-[#9E9F97] mr-1.5">Active:</span>
            <span className="font-bold text-[#F0442D]">{meta.name}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] text-[#191A18] dark:text-[#EDEDE8]">
            <span className="text-[#9E9F97] mr-1.5">Grid:</span>
            <span className="font-semibold">{movementMode}</span>
          </div>

          {weightedTerrainEnabled && (
            <div className="px-2.5 py-1 rounded bg-[#B45309]/10 border border-[#B45309]/30 text-[#B45309] dark:text-[#FBBF24] font-semibold">
              Weights (3×) Enabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
