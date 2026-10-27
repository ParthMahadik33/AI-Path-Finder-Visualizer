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
  getValidNeighbors,
  reconstructPath,
  calculatePathCost
} from './helpers';

interface DijkstraNode {
  coord: Coordinate;
  g: number;
  parent: Coordinate | null;
  seq: number;
}

export function runDijkstra(options: SearchOptions): AlgorithmResult {
  const startTime = performance.now();
  const trace: TraceEvent[] = [];
  let stepCounter = 0;

  const { start, destination } = options;

  if (areCoordsEqual(start, destination)) {
    const duration = performance.now() - startTime;
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'COMPLETE',
        coord: start,
        g: 0,
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
      algorithm: 'dijkstra'
    };
  }

  // Priority queue: lowest g-cost first; if tie, lower seq first
  const pq = new PriorityQueue<DijkstraNode>((a, b) => {
    if (Math.abs(a.g - b.g) > 1e-6) {
      return a.g - b.g;
    }
    return a.seq - b.seq;
  });

  const parentMap = new Map<string, Coordinate>();
  const gScores = new Map<string, number>();
  const visited = new Set<string>();
  const discovered = new Set<string>();

  let insertSeq = 0;
  const startKey = coordKey(start.r, start.c);
  gScores.set(startKey, 0);
  discovered.add(startKey);

  pq.push({
    coord: start,
    g: 0,
    parent: null,
    seq: ++insertSeq
  });

  if (options.recordTrace ?? true) {
    trace.push({
      type: 'DISCOVER',
      coord: start,
      g: 0,
      f: 0,
      parent: null,
      description: `Discovered origin (${start.r}, ${start.c}) with g=0.0`,
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
        g: current.g,
        f: current.g,
        parent: current.parent,
        description: `Relaxing node (${current.coord.r}, ${current.coord.c}) with minimal cost g=${current.g.toFixed(2)}`,
        stepNumber: ++stepCounter
      });
    }

    if (areCoordsEqual(current.coord, destination)) {
      pathFound = true;
      break;
    }

    const neighbors = getValidNeighbors(current.coord.r, current.coord.c, options);

    for (const { coord: neighbor, cost: stepCost } of neighbors) {
      const nKey = coordKey(neighbor.r, neighbor.c);
      if (visited.has(nKey)) continue;

      const tentativeG = current.g + stepCost;
      const prevG = gScores.get(nKey);

      if (prevG === undefined || tentativeG < prevG - 1e-6) {
        gScores.set(nKey, tentativeG);
        parentMap.set(nKey, current.coord);

        pq.push({
          coord: neighbor,
          g: tentativeG,
          parent: current.coord,
          seq: ++insertSeq
        });

        const isNewDiscovery = !discovered.has(nKey);
        discovered.add(nKey);

        if (options.recordTrace ?? true) {
          trace.push({
            type: isNewDiscovery ? 'DISCOVER' : 'UPDATE',
            coord: neighbor,
            g: tentativeG,
            f: tentativeG,
            parent: current.coord,
            description: isNewDiscovery
              ? `Discovered (${neighbor.r}, ${neighbor.c}) with cumulative g=${tentativeG.toFixed(2)}`
              : `Relaxed edge to (${neighbor.r}, ${neighbor.c}) with lower g=${tentativeG.toFixed(2)}`,
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
        description: `Optimal Dijkstra route discovered with total cost ${pathCost}`,
        stepNumber: ++stepCounter
      });
    }
  } else {
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'NO_PATH',
        coord: destination,
        description: 'Priority queue exhausted. No path found to destination.',
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
    algorithm: 'dijkstra'
  };
}
