import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 px-4 py-2 bg-white/70 dark:bg-[#1A1C1A]/70 backdrop-blur-xs border-t border-[#DEDED5] dark:border-[#2E322E] text-[11px] font-mono-tech text-[#73746D] dark:text-[#9A9C94] select-none">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Start */}
        <div className="flex items-center gap-1.5" title="Drag to relocate starting coordinates">
          <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] flex items-center justify-center text-[8px] font-bold text-white shadow-xs">
            S
          </div>
          <span className="font-medium text-[#191A18] dark:text-[#EDEDE8]">Start (Origin)</span>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-1.5" title="Drag to relocate destination coordinates">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#15803D] flex items-center justify-center text-[8px] font-bold text-white shadow-xs">
            D
          </div>
          <span className="font-medium text-[#191A18] dark:text-[#EDEDE8]">Destination (Target)</span>
        </div>

        {/* Wall */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#191A18] dark:bg-[#0D0E0D] border border-black/20" />
          <span>Wall (Solid)</span>
        </div>

        {/* Mud / Weight */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#D4C9A8] dark:bg-[#3D3728] weighted-hatch border border-[#B45309]/30 flex items-center justify-center text-[7px] font-bold text-[#78350F] dark:text-[#FCD34D]">
            3×
          </div>
          <span>Mud (Cost 3×)</span>
        </div>

        {/* Frontier */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#BAE6FD] dark:bg-[#1E3A5F] border border-[#7DD3FC] dark:border-[#2D588E]" />
          <span>Frontier (Open)</span>
        </div>

        {/* Explored */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#8FA6B2] dark:bg-[#334958] border border-[#778F9B] dark:border-[#425B6C]" />
          <span>Explored (Closed)</span>
        </div>

        {/* Path */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#F0442D] border border-[#C82D19]" />
          <span className="font-semibold text-[#F0442D]">Optimal Path</span>
        </div>
      </div>

      <div className="hidden lg:block text-[10px] text-[#9E9F97] italic">
        Tip: Click or drag on grid to sculpt walls • Drag markers to reposition
      </div>
    </div>
  );
};
