import type {
  Coordinate,
  SearchOptions,
  AlgorithmResult,
  TraceEvent
} from './types';
import { PriorityQueue } from './priorityQueue';
import {
  coordKey,
  areCoordsEqual,
  calculateHeuristic,
  getValidNeighbors,
  reconstructPath,
  calculatePathCost
} from './helpers';

interface GreedyNode {
  coord: Coordinate;
  h: number;
  parent: Coordinate | null;
  seq: number;
}

export function runGreedyBestFirst(options: SearchOptions): AlgorithmResult {
  const startTime = performance.now();
  const trace: TraceEvent[] = [];
  let stepCounter = 0;

  const { start, destination, movementMode, diagonalCostMultiplier } = options;

  if (areCoordsEqual(start, destination)) {
    const duration = performance.now() - startTime;
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'COMPLETE',
        coord: start,
        h: 0,
        f: 0,
        parent: null,
        description: 'Start position is already the destination.',
        stepNumber: ++stepCounter
      });
    }
    return {
      path: [start],
      pathFound: true,
      pathCost: 0,
      nodesExplored: 1,
      nodesDiscovered: 1,
      trace,
      durationMs: Math.round(duration * 100) / 100,
      algorithm: 'greedy'
    };
  }

  // Priority queue: lowest h-score first; if tie, lower seq first
  const pq = new PriorityQueue<GreedyNode>((a, b) => {
    if (Math.abs(a.h - b.h) > 1e-6) {
      return a.h - b.h;
    }
    return a.seq - b.seq;
  });

  const parentMap = new Map<string, Coordinate>();
  const visited = new Set<string>();
  const discovered = new Set<string>();

  let insertSeq = 0;
  const initialH = calculateHeuristic(start, destination, movementMode, diagonalCostMultiplier);
  const startKey = coordKey(start.r, start.c);
  discovered.add(startKey);

  pq.push({
    coord: start,
    h: initialH,
    parent: null,
    seq: ++insertSeq
  });

  if (options.recordTrace ?? true) {
    trace.push({
      type: 'DISCOVER',
      coord: start,
      h: initialH,
      f: initialH,
      parent: null,
      description: `Discovered start with heuristic h=${initialH.toFixed(1)}`,
      stepNumber: ++stepCounter
    });
  }

  let nodesExploredCount = 0;
  let pathFound = false;

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    const currKey = coordKey(current.coord.r, current.coord.c);

    if (visited.has(currKey)) continue;
    visited.add(currKey);
    nodesExploredCount++;

    if (options.recordTrace ?? true) {
      trace.push({
        type: 'EXPLORE',
        coord: current.coord,
        h: current.h,
        f: current.h,
        parent: current.parent,
        description: `Greedily picking node (${current.coord.r}, ${current.coord.c}) closest to goal (h=${current.h.toFixed(2)})`,
        stepNumber: ++stepCounter
      });
    }

    if (areCoordsEqual(current.coord, destination)) {
      pathFound = true;
      break;
    }

    const neighbors = getValidNeighbors(current.coord.r, current.coord.c, options);

    for (const { coord: neighbor } of neighbors) {
      const nKey = coordKey(neighbor.r, neighbor.c);
      if (visited.has(nKey) || discovered.has(nKey)) continue;

      discovered.add(nKey);
      parentMap.set(nKey, current.coord);

      const h = calculateHeuristic(neighbor, destination, movementMode, diagonalCostMultiplier);

      pq.push({
        coord: neighbor,
        h,
        parent: current.coord,
        seq: ++insertSeq
      });

      if (options.recordTrace ?? true) {
        trace.push({
          type: 'DISCOVER',
          coord: neighbor,
          h,
          f: h,
          parent: current.coord,
          description: `Discovered neighbor (${neighbor.r}, ${neighbor.c}) with heuristic estimate h=${h.toFixed(2)}`,
          stepNumber: ++stepCounter
        });
      }
    }
  }

  let finalPath: Coordinate[] = [];
  let pathCost = 0;

  if (pathFound) {
    finalPath = reconstructPath(parentMap, start, destination);
    pathCost = calculatePathCost(finalPath, options);

    if (options.recordTrace ?? true) {
      for (const pt of finalPath) {
        trace.push({
          type: 'PATH_STEP',
          coord: pt,
          description: `Path element: (${pt.r}, ${pt.c})`,
          stepNumber: ++stepCounter
        });
      }
      trace.push({
        type: 'COMPLETE',
        coord: destination,
        description: `Path discovered with length ${finalPath.length - 1} and cost ${pathCost} (note: greedy search does not guarantee optimality)`,
        stepNumber: ++stepCounter
      });
    }
  } else {
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'NO_PATH',
        coord: destination,
        description: 'No path found to destination.',
        stepNumber: ++stepCounter
      });
    }
  }

  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    path: finalPath,
    pathFound,
    pathCost,
    nodesExplored: nodesExploredCount,
    nodesDiscovered: discovered.size,
    trace,
    durationMs,
    algorithm: 'greedy'
  };
}
