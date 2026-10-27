import React from 'react';
import { useAppStore } from '../store/appStore';
import { X, Keyboard } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const open = useAppStore((s) => s.shortcutsModalOpen);
  const setOpen = useAppStore((s) => s.setShortcutsModalOpen);

  if (!open) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start / Pause / Resume pathfinding search' },
    { key: '→', desc: 'Step forward one algorithm cycle' },
    { key: 'R', desc: 'Reset grid and search state' },
    { key: 'C', desc: 'Clear walls while preserving endpoints' },
    { key: 'P', desc: 'Clear search path and exploration' },
    { key: 'M', desc: 'Generate a random maze' },
    { key: 'T', desc: 'Toggle Light / Dark mode' },
    { key: '3', desc: 'Toggle 2D / 3D Terrain view' },
    { key: '?', desc: 'Open / Close this shortcuts guide' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-[#1A1C1A] text-[#191A18] dark:text-[#EDEDE8] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg max-w-md w-full shadow-xl overflow-hidden font-mono-tech">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DEDED5] dark:border-[#2E322E] bg-[#F6F5F0] dark:bg-[#232623]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Keyboard className="w-4 h-4 text-[#F0442D]" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-[#EEEEE8] dark:hover:bg-[#2D302D] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="divide-y divide-[#DEDED5] dark:divide-[#2E322E] text-xs">
            {shortcuts.map((sc) => (
              <div key={sc.key} className="flex items-center justify-between py-2">
                <span className="text-[#73746D] dark:text-[#9A9C94]">{sc.desc}</span>
                <kbd className="px-2 py-0.5 bg-[#EEEEE8] dark:bg-[#232623] border border-[#DEDED5] dark:border-[#2E322E] rounded font-bold shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#DEDED5] dark:border-[#2E322E] bg-[#F6F5F0] dark:bg-[#232623] flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 bg-[#191A18] text-white dark:bg-white dark:text-[#191A18] rounded text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
