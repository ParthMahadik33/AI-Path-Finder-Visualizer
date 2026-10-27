export interface Coordinate {
  r: number;
  c: number;
}

export type MovementMode = '4-directional' | '8-directional';

export type CornerCuttingRule = 'never' | 'no-squeeze' | 'unrestricted';
// 'never': Cannot move diagonally if either adjacent orthogonal neighbor is blocked
// 'no-squeeze': Cannot squeeze through diagonal if both orthogonal neighbors are blocked (standard game pathfinding)
// 'unrestricted': Can move diagonally as long as the destination cell itself is not blocked

export type AlgorithmType = 'astar' | 'bfs' | 'dijkstra' | 'greedy';

export type TraceEventType =
  | 'DISCOVER'   // Discovered and added to frontier
  | 'EXPLORE'    // Popped from frontier and processed
  | 'UPDATE'     // g-cost updated to a shorter path
  | 'PATH_STEP'  // Reconstructed as part of the final route
  | 'COMPLETE'   // Search finished successfully
  | 'NO_PATH';   // Frontier exhausted, destination unreachable

export interface TraceEvent {
  type: TraceEventType;
  coord: Coordinate;
  g?: number;
  h?: number;
  f?: number;
  parent?: Coordinate | null;
  description?: string;
  stepNumber: number;
}

export interface SearchOptions {
  rows: number;
  cols: number;
  start: Coordinate;
  destination: Coordinate;
  isWall: (r: number, c: number) => boolean;
  getWeight: (r: number, c: number) => number;
  movementMode: MovementMode;
  diagonalCostMultiplier?: number; // default sqrt(2) ~ 1.414
  cornerCuttingRule?: CornerCuttingRule;
  recordTrace?: boolean; // default true
}

export interface AlgorithmResult {
  path: Coordinate[];
  pathFound: boolean;
  pathCost: number;
  nodesExplored: number;
  nodesDiscovered: number;
  trace: TraceEvent[];
  durationMs: number;
  algorithm: AlgorithmType;
}

export interface AlgorithmMetadata {
  id: AlgorithmType;
  name: string;
  shortTag: string;
  category: string;
  guaranteesShortest: boolean;
  supportsWeights: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  heuristicType: string;
  description: string;
  tradeoffs: string;
  pseudocode: string[];
}
