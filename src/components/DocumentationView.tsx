import React from 'react';
import { Compass, ShieldCheck, Dices, Cpu } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-mono-tech select-none leading-relaxed text-[#191A18] dark:text-[#EDEDE8]">
      <div className="border-b border-[#DEDED5] dark:border-[#2E322E] pb-4">
        <h2 className="text-2xl font-serif-editorial italic">
          Pathfinding Architecture & Technical Reference
        </h2>
        <p className="text-xs text-[#73746D] dark:text-[#9A9C94] mt-1">
          Algorithmic specifications, heuristic formulas, data structures, and spatial geometry.
        </p>
      </div>

      {/* Heuristic Functions */}
      <section className="space-y-3 p-5 bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Compass className="w-4 h-4 text-[#F0442D]" />
          <h3>1. Admissible Distance Heuristics</h3>
        </div>
        <p className="text-xs text-[#73746D] dark:text-[#9A9C94]">
          For A* to guarantee the shortest path, its heuristic estimate h(n) must be admissible (never overestimating the true remaining cost to the goal) and monotonic (consistent).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 bg-[#F6F5F0] dark:bg-[#232623] rounded">
            <span className="font-bold block text-sm">Manhattan Distance (4-Way)</span>
            <code className="text-[#F0442D] block my-1">h(n) = |Δr| + |Δc|</code>
            <p className="text-[11px] text-[#73746D] dark:text-[#9A9C94]">
              Used for 4-directional grids where agents can only traverse North, South, East, and West.
            </p>
          </div>

          <div className="p-3 bg-[#F6F5F0] dark:bg-[#232623] rounded">
            <span className="font-bold block text-sm">Octile Distance (8-Way)</span>
            <code className="text-[#F0442D] block my-1">h(n) = (|Δr| + |Δc|) + (√2 - 2) * min(|Δr|, |Δc|)</code>
            <p className="text-[11px] text-[#73746D] dark:text-[#9A9C94]">
              Used when diagonal transitions are permitted at Euclidean cost √2 ≈ 1.4142.
            </p>
          </div>
        </div>
      </section>

      {/* Corner Cutting Rules */}
      <section className="space-y-3 p-5 bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg">
        <div className="flex items-center gap-2 text-sm font-bold">
          <ShieldCheck className="w-4 h-4 text-[#F0442D]" />
          <h3>2. Diagonal Corner Cutting Invariants</h3>
        </div>
        <p className="text-xs text-[#73746D] dark:text-[#9A9C94]">
          When diagonal motion is enabled, navigating diagonally between two adjacent orthogonal obstacles must follow strict physics rules:
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <span className="font-bold min-w-24">• Standard:</span>
            <span className="text-[#73746D] dark:text-[#9A9C94]">
              Agent cannot squeeze through the diagonal seam if both adjacent orthogonal cells are walls.
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold min-w-24">• Strict:</span>
            <span className="text-[#73746D] dark:text-[#9A9C94]">
              Agent cannot move diagonally if either adjacent orthogonal cell is blocked.
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold min-w-24">• Free:</span>
            <span className="text-[#73746D] dark:text-[#9A9C94]">
              Diagonal movement is allowed regardless of corner configuration as long as the target cell itself is open.
            </span>
          </div>
        </div>
      </section>

      {/* Binary Min-Heap Priority Queue */}
      <section className="space-y-3 p-5 bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Cpu className="w-4 h-4 text-[#F0442D]" />
          <h3>3. Binary Min-Heap Priority Queue</h3>
        </div>
        <p className="text-xs text-[#73746D] dark:text-[#9A9C94]">
          Instead of naively re-sorting the frontier list on every iteration (O(N log N)), AI PathFinder implements a custom Binary Min-Heap with O(log N) push and pop operations. Deterministic tie-breaking ensures identical runs produce identical, reproducible search paths.
        </p>
      </section>

      {/* Maze Generation Theory */}
      <section className="space-y-3 p-5 bg-white dark:bg-[#1A1C1A] border border-[#DEDED5] dark:border-[#2E322E] rounded-lg">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Dices className="w-4 h-4 text-[#F0442D]" />
          <h3>4. Maze Generation Algorithms</h3>
        </div>
        <div className="space-y-2 text-xs text-[#73746D] dark:text-[#9A9C94]">
          <p>
            <strong className="text-[#191A18] dark:text-[#EDEDE8]">Recursive Backtracking DFS:</strong> Carves passages two units at a time through a wall-filled grid, backtracking upon encountering dead ends. This produces an organic labyrinth spanning tree with long winding corridors and zero unreachable loops.
          </p>
          <p>
            <strong className="text-[#191A18] dark:text-[#EDEDE8]">Random Obstacle Percolation:</strong> Uniformly distributes obstacles across open space with protected safety radii around start and destination cells, verifying solvability via an automated BFS check.
          </p>
        </div>
      </section>
    </div>
  );
};
