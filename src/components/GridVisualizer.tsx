import React, { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import type { DragMode } from '../types/grid';
import { areCoordsEqual } from '../algorithms/helpers';
import { MapPin, Target } from 'lucide-react';

export const GridVisualizer: React.FC = () => {
  const rows = useAppStore((s) => s.rows);
  const cols = useAppStore((s) => s.cols);
  const start = useAppStore((s) => s.start);
  const destination = useAppStore((s) => s.destination);
  const walls = useAppStore((s) => s.walls);
  const weights = useAppStore((s) => s.weights);
  const cellVisuals = useAppStore((s) => s.cellVisuals);
  const activeBrush = useAppStore((s) => s.activeBrush);
  const searchStatus = useAppStore((s) => s.searchStatus);

  const setStart = useAppStore((s) => s.setStart);
  const setDestination = useAppStore((s) => s.setDestination);
  const setCellWall = useAppStore((s) => s.setCellWall);
  const setCellWeight = useAppStore((s) => s.setCellWeight);

  const [dragMode, setDragMode] = useState<DragMode>('none');
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const isSearching = searchStatus === 'searching';

  const handlePointerDown = useCallback(
    (r: number, c: number, e: React.PointerEvent) => {
      if (isSearching) return;
      e.preventDefault();

      if (areCoordsEqual({ r, c }, start)) {
        setDragMode('move_start');
        return;
      }
      if (areCoordsEqual({ r, c }, destination)) {
        setDragMode('move_dest');
        return;
      }

      if (activeBrush === 'wall') {
        const willBeWall = !walls[r][c];
        setDragMode(willBeWall ? 'draw_wall' : 'erase_wall');
        setCellWall(r, c, willBeWall);
      } else if (activeBrush === 'weight') {
        const willBeWeight = weights[r][c] <= 1;
        setDragMode(willBeWeight ? 'draw_weight' : 'erase_weight');
        setCellWeight(r, c, willBeWeight ? 3 : 1);
      } else if (activeBrush === 'eraser') {
        setDragMode('erase_wall');
        setCellWall(r, c, false);
        setCellWeight(r, c, 1);
      }
    },
    [isSearching, start, destination, activeBrush, walls, weights, setCellWall, setCellWeight]
  );

  const handlePointerEnter = useCallback(
    (r: number, c: number) => {
      if (isSearching || dragMode === 'none') return;

      const isStart = areCoordsEqual({ r, c }, start);
      const isDest = areCoordsEqual({ r, c }, destination);

      if (dragMode === 'move_start') {
        if (!isDest) {
          setStart({ r, c });
        }
      } else if (dragMode === 'move_dest') {
        if (!isStart) {
          setDestination({ r, c });
        }
      } else if (dragMode === 'draw_wall') {
        if (!isStart && !isDest) {
          setCellWall(r, c, true);
        }
      } else if (dragMode === 'erase_wall') {
        if (!isStart && !isDest) {
          setCellWall(r, c, false);
          setCellWeight(r, c, 1);
        }
      } else if (dragMode === 'draw_weight') {
        if (!isStart && !isDest && !walls[r][c]) {
          setCellWeight(r, c, 3);
        }
      } else if (dragMode === 'erase_weight') {
        if (!isStart && !isDest) {
          setCellWeight(r, c, 1);
        }
      }
    },
    [isSearching, dragMode, start, destination, walls, setStart, setDestination, setCellWall, setCellWeight]
  );

  const handlePointerUp = useCallback(() => {
    setDragMode('none');
  }, []);

  // Touch move handler to support mobile dragging
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isSearching || dragMode === 'none') return;
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target instanceof HTMLElement) {
        const cellData = target.dataset.cellCoord;
        if (cellData) {
          const [r, c] = cellData.split(',').map(Number);
          if (!isNaN(r) && !isNaN(c)) {
            handlePointerEnter(r, c);
          }
        }
      }
    },
    [isSearching, dragMode, handlePointerEnter]
  );

  return (
    <div
      ref={gridContainerRef}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerUp}
      className="relative w-full h-full flex items-center justify-center p-3 sm:p-5 select-none overflow-hidden bg-[#F6F5F0] dark:bg-[#121312]"
      role="grid"
      aria-label="Pathfinding maze grid"
    >
      {/* Background Architectural Grid Accent */}
      <div className="w-full max-w-5xl aspect-[30/20] max-h-[calc(100vh-270px)] bg-white dark:bg-[#1A1C1A] rounded-md shadow-xs border border-[#DEDED5] dark:border-[#2E322E] p-2 flex flex-col justify-center">
        <div
          className="grid gap-[1px] bg-[#E8E8E0] dark:bg-[#282B28] p-[1px] rounded-sm w-full h-full overflow-hidden"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }}
        >
          {cellVisuals.map((rowArr, r) =>
            rowArr.map((cellState, c) => {
              const isStart = r === start.r && c === start.c;
              const isDest = r === destination.r && c === destination.c;
              const isWall = walls[r][c];
              const isWeighted = weights[r][c] > 1;

              let cellBg = 'bg-white dark:bg-[#1D201D]';
              let cellBorder = '';
              let animClass = '';

              if (isStart) {
                cellBg = 'bg-[#2563EB] text-white shadow-xs';
              } else if (isDest) {
                cellBg = 'bg-[#15803D] text-white shadow-xs';
              } else if (cellState === 'path') {
                cellBg = 'bg-[#F0442D] text-white';
                animClass = 'animate-path-flow';
              } else if (cellState === 'explored') {
                cellBg = 'bg-[#8FA6B2] dark:bg-[#334958]';
                animClass = 'animate-pop-in';
              } else if (cellState === 'frontier') {
                cellBg = 'bg-[#BAE6FD] dark:bg-[#1E3A5F]';
                animClass = 'animate-pop-in';
              } else if (isWall) {
                cellBg = 'bg-[#191A18] dark:bg-[#0D0E0D]';
              } else if (isWeighted) {
                cellBg = 'bg-[#D4C9A8] dark:bg-[#3D3728] weighted-hatch';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  data-cell-coord={`${r},${c}`}
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                  role="gridcell"
                  aria-label={`Cell at row ${r}, column ${c}, state: ${cellState}`}
                  className={`relative flex items-center justify-center transition-colors duration-150 cursor-pointer select-none rounded-[1px] ${cellBg} ${cellBorder} ${animClass} hover:opacity-90 active:scale-95`}
                >
                  {/* Start Marker Icon */}
                  {isStart && (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-xs" />
                      <span className="text-[7px] font-bold tracking-tighter leading-none hidden sm:block">
                        START
                      </span>
                    </div>
                  )}

                  {/* Destination Marker Icon */}
                  {isDest && (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-xs" />
                      <span className="text-[7px] font-bold tracking-tighter leading-none hidden sm:block">
                        END
                      </span>
                    </div>
                  )}

                  {/* Weight Badge when cell is weighted and not covered by start/dest */}
                  {isWeighted && !isStart && !isDest && !isWall && cellState !== 'path' && (
                    <span className="text-[8px] font-mono-tech font-bold text-[#78350F] dark:text-[#FCD34D] opacity-75 pointer-events-none">
                      3×
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
