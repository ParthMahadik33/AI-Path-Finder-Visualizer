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

interface AStarNode {
  coord: Coordinate;
  g: number;
  h: number;
  f: number;
  parent: Coordinate | null;
  seq: number; // for deterministic tie-breaking
}

export function runAStar(options: SearchOptions): AlgorithmResult {
  const startTime = performance.now();
  const trace: TraceEvent[] = [];
  let stepCounter = 0;

  const { start, destination, movementMode, diagonalCostMultiplier } = options;

  // Immediate check for start equals destination
  if (areCoordsEqual(start, destination)) {
    const duration = performance.now() - startTime;
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'COMPLETE',
        coord: start,
        g: 0,
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
      algorithm: 'astar'
    };
  }

  // Min-heap comparator: lower f first; if equal f, lower h first; if equal h, lower seq first
  const pq = new PriorityQueue<AStarNode>((a, b) => {
    if (Math.abs(a.f - b.f) > 1e-6) {
      return a.f - b.f;
    }
    if (Math.abs(a.h - b.h) > 1e-6) {
      return a.h - b.h;
    }
    return a.seq - b.seq;
  });

  const parentMap = new Map<string, Coordinate>();
  const gScores = new Map<string, number>();
  const closedSet = new Set<string>();
  const discoveredSet = new Set<string>();

  let insertSeq = 0;
  const initialH = calculateHeuristic(start, destination, movementMode, diagonalCostMultiplier);
  const initialG = 0;
  const initialF = initialG + initialH;

  const startKey = coordKey(start.r, start.c);
  gScores.set(startKey, initialG);
  discoveredSet.add(startKey);

  pq.push({
    coord: start,
    g: initialG,
    h: initialH,
    f: initialF,
    parent: null,
    seq: ++insertSeq
  });

  if (options.recordTrace ?? true) {
    trace.push({
      type: 'DISCOVER',
      coord: start,
      g: initialG,
      h: initialH,
      f: initialF,
      parent: null,
      description: `Discovered start node (g=${initialG}, h=${initialH.toFixed(1)}, f=${initialF.toFixed(1)})`,
      stepNumber: ++stepCounter
    });
  }

  let nodesExploredCount = 0;
  let pathFound = false;

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    const currKey = coordKey(current.coord.r, current.coord.c);

    // If already closed with an equal or better path, skip
    if (closedSet.has(currKey)) {
      continue;
    }
    closedSet.add(currKey);
    nodesExploredCount++;

    if (options.recordTrace ?? true) {
      trace.push({
        type: 'EXPLORE',
        coord: current.coord,
        g: current.g,
        h: current.h,
        f: current.f,
        parent: current.parent,
        description: `Evaluating cell (${current.coord.r}, ${current.coord.c}) with f=${current.f.toFixed(2)} [g=${current.g.toFixed(2)} + h=${current.h.toFixed(2)}]`,
        stepNumber: ++stepCounter
      });
    }

    // Goal check
    if (areCoordsEqual(current.coord, destination)) {
      pathFound = true;
      break;
    }

    const neighbors = getValidNeighbors(current.coord.r, current.coord.c, options);

    for (const { coord: neighbor, cost: stepCost } of neighbors) {
      const nKey = coordKey(neighbor.r, neighbor.c);
      if (closedSet.has(nKey)) continue;

      const tentativeG = current.g + stepCost;
      const prevG = gScores.get(nKey);

      if (prevG === undefined || tentativeG < prevG - 1e-6) {
        gScores.set(nKey, tentativeG);
        parentMap.set(nKey, current.coord);

        const h = calculateHeuristic(neighbor, destination, movementMode, diagonalCostMultiplier);
        const f = tentativeG + h;

        pq.push({
          coord: neighbor,
          g: tentativeG,
          h,
          f,
          parent: current.coord,
          seq: ++insertSeq
        });

        const isNewDiscovery = !discoveredSet.has(nKey);
        discoveredSet.add(nKey);

        if (options.recordTrace ?? true) {
          trace.push({
            type: isNewDiscovery ? 'DISCOVER' : 'UPDATE',
            coord: neighbor,
            g: tentativeG,
            h,
            f,
            parent: current.coord,
            description: isNewDiscovery
              ? `Added (${neighbor.r}, ${neighbor.c}) to frontier with f=${f.toFixed(2)}`
              : `Updated (${neighbor.r}, ${neighbor.c}) with shorter path g=${tentativeG.toFixed(2)}`,
            stepNumber: ++stepCounter
          });
        }
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
        description: `Optimal path discovered with length ${finalPath.length - 1} and total cost ${pathCost}`,
        stepNumber: ++stepCounter
      });
    }
  } else {
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'NO_PATH',
        coord: destination,
        description: 'Search terminated. No valid path exists between start and destination.',
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
    nodesDiscovered: discoveredSet.size,
    trace,
    durationMs,
    algorithm: 'astar'
  };
}
