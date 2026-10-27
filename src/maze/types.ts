import type { Coordinate } from '../algorithms/types';

export interface MazeOptions {
  rows: number;
  cols: number;
  start: Coordinate;
  destination: Coordinate;
  density?: number; // 0.1 to 0.5 for random maze
  ensureSolvable?: boolean;
}

export type MazeType = 'recursive-backtracking' | 'random-sparse' | 'random-medium' | 'random-dense';
