import type {
  Coordinate,
  SearchOptions,
  AlgorithmResult,
  TraceEvent
} from './types';
import {
  coordKey,
  areCoordsEqual,
  getValidNeighbors,
  reconstructPath,
  calculatePathCost
} from './helpers';

export function runBFS(options: SearchOptions): AlgorithmResult {
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
      algorithm: 'bfs'
    };
  }

  const queue: Coordinate[] = [start];
  const parentMap = new Map<string, Coordinate>();
  const visited = new Set<string>();
  const discovered = new Set<string>();

  const startKey = coordKey(start.r, start.c);
  discovered.add(startKey);

  if (options.recordTrace ?? true) {
    trace.push({
      type: 'DISCOVER',
      coord: start,
      parent: null,
      description: `Discovered start root (${start.r}, ${start.c})`,
      stepNumber: ++stepCounter
    });
  }

  let nodesExploredCount = 0;
  let pathFound = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currKey = coordKey(current.r, current.c);

    if (visited.has(currKey)) continue;
    visited.add(currKey);
    nodesExploredCount++;

    if (options.recordTrace ?? true) {
      trace.push({
        type: 'EXPLORE',
        coord: current,
        parent: parentMap.get(currKey) ?? null,
        description: `Inspecting queue item (${current.r}, ${current.c}) [FIFO exploration]`,
        stepNumber: ++stepCounter
      });
    }

    if (areCoordsEqual(current, destination)) {
      pathFound = true;
      break;
    }

    const neighbors = getValidNeighbors(current.r, current.c, options);

    for (const { coord: neighbor } of neighbors) {
      const nKey = coordKey(neighbor.r, neighbor.c);

      if (!discovered.has(nKey)) {
        discovered.add(nKey);
        parentMap.set(nKey, current);
        queue.push(neighbor);

        if (options.recordTrace ?? true) {
          trace.push({
            type: 'DISCOVER',
            coord: neighbor,
            parent: current,
            description: `Queued neighbor (${neighbor.r}, ${neighbor.c}) at depth ${reconstructPath(parentMap, start, neighbor).length - 1}`,
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
        description: `BFS shortest edge path discovered (${finalPath.length - 1} steps, unweighted cost ${pathCost})`,
        stepNumber: ++stepCounter
      });
    }
  } else {
    if (options.recordTrace ?? true) {
      trace.push({
        type: 'NO_PATH',
        coord: destination,
        description: 'Queue exhausted. No path found.',
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
    algorithm: 'bfs'
  };
}
