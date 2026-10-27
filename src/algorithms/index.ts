import type { AlgorithmType, SearchOptions, AlgorithmResult } from './types';
import { runAStar } from './astar';
import { runBFS } from './bfs';
import { runDijkstra } from './dijkstra';
import { runGreedyBestFirst } from './greedyBestFirst';

export type * from './types';
export * from './helpers';
export * from './metadata';
export { PriorityQueue } from './priorityQueue';
export { runAStar } from './astar';
export { runBFS } from './bfs';
export { runDijkstra } from './dijkstra';
export { runGreedyBestFirst } from './greedyBestFirst';

export function runAlgorithm(
  algorithm: AlgorithmType,
  options: SearchOptions
): AlgorithmResult {
  switch (algorithm) {
    case 'astar':
      return runAStar(options);
    case 'bfs':
      return runBFS(options);
    case 'dijkstra':
      return runDijkstra(options);
    case 'greedy':
      return runGreedyBestFirst(options);
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}
