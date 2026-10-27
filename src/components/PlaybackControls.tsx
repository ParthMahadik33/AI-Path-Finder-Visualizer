import React from 'react';
import { useAppStore } from '../store/appStore';
import { Play, Pause, StepForward, RotateCcw, Zap, Gauge } from 'lucide-react';
import type { PlaybackSpeed } from '../types/grid';

export const PlaybackControls: React.FC = () => {
  const searchStatus = useAppStore((s) => s.searchStatus);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed);
  const startSearch = useAppStore((s) => s.startSearch);
  const pauseSearch = useAppStore((s) => s.pauseSearch);
  const resumeSearch = useAppStore((s) => s.resumeSearch);
  const stepForward = useAppStore((s) => s.stepForward);
  const resetSearch = useAppStore((s) => s.resetSearch);

  const isSearching = searchStatus === 'searching';
  const isPaused = searchStatus === 'paused';
  const isFinished = searchStatus === 'completed' || searchStatus === 'no_path';

  const speedOptions: { id: PlaybackSpeed; label: string }[] = [
    { id: 'slow', label: 'Slow' },
    { id: 'normal', label: 'Normal' },
    { id: 'fast', label: 'Fast' },
    { id: 'instant', label: 'Instant' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#1A1C1A] border-t border-[#DEDED5] dark:border-[#2E322E] select-none font-mono-tech">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Run / Resume / Pause Button */}
        {isSearching ? (
          <button
            onClick={pauseSearch}
            className="flex items-center gap-2 px-4 py-2 bg-[#F0442D] hover:bg-[#D73823] text-white rounded font-medium text-xs tracking-wider uppercase transition-colors shadow-xs"
            title="Pause execution (Space)"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={resumeSearch}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded font-medium text-xs tracking-wider uppercase transition-colors shadow-xs"
            title="Resume playback (Space)"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            onClick={startSearch}
            className="flex items-center gap-2 px-4 py-2 bg-[#F0442D] hover:bg-[#D73823] text-white rounded font-medium text-xs tracking-wider uppercase transition-colors shadow-xs"
            title="Execute algorithm pathfinding (Space)"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Find Path</span>
          </button>
        )}

        {/* Step Forward Button */}
        <button
          onClick={stepForward}
          disabled={isSearching || isFinished}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#EEEEE8] dark:bg-[#232623] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D] disabled:opacity-40 text-[#191A18] dark:text-[#EDEDE8] rounded font-medium text-xs transition-colors"
          title="Advance single algorithm step (ArrowRight)"
        >
          <StepForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Step</span>
        </button>

        {/* Reset Search Button */}
        <button
          onClick={resetSearch}
          disabled={isSearching}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#EEEEE8] dark:bg-[#232623] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D] disabled:opacity-40 text-[#191A18] dark:text-[#EDEDE8] rounded font-medium text-xs transition-colors"
          title="Reset search path and progress (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 bg-[#EEEEE8] dark:bg-[#232623] p-1 rounded border border-[#DEDED5] dark:border-[#2E322E]">
        <div className="px-2 text-[11px] text-[#73746D] dark:text-[#9A9C94] font-medium flex items-center gap-1">
          <Gauge className="w-3 h-3" />
          <span className="hidden sm:inline">Speed:</span>
        </div>
        {speedOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setPlaybackSpeed(opt.id)}
            className={`px-2.5 py-1 text-[11px] rounded transition-all font-medium ${
              playbackSpeed === opt.id
                ? 'bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] shadow-xs'
                : 'text-[#73746D] dark:text-[#9A9C94] hover:text-[#191A18] dark:hover:text-[#EDEDE8]'
            }`}
          >
            {opt.id === 'instant' && <Zap className="w-2.5 h-2.5 inline mr-0.5 text-[#F0442D]" />}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
