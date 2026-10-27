import { areCoordsEqual } from '../algorithms/helpers';
import { runBFS } from '../algorithms/bfs';
import type { MazeOptions } from './types';

/**
 * Generates random obstacles with a target density.
 * Protects start and destination coordinates.
 * If ensureSolvable is true, regenerates or carves if path is blocked.
 */
export function generateRandomMaze(options: MazeOptions): boolean[][] {
  const { rows, cols, start, destination, density = 0.25, ensureSolvable = true } = options;

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    attempts++;
    const walls: boolean[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => false)
    );

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Protect start and destination
        if (areCoordsEqual({ r, c }, start) || areCoordsEqual({ r, c }, destination)) {
          continue;
        }

        // Keep 1-cell radius around start and destination slightly clearer
        const nearStart = Math.abs(r - start.r) <= 1 && Math.abs(c - start.c) <= 1;
        const nearDest = Math.abs(r - destination.r) <= 1 && Math.abs(c - destination.c) <= 1;
        const effectiveDensity = (nearStart || nearDest) ? density * 0.4 : density;

        if (Math.random() < effectiveDensity) {
          walls[r][c] = true;
        }
      }
    }

    if (!ensureSolvable) {
      return walls;
    }

    // Verify solvability using BFS
    const testResult = runBFS({
      rows,
      cols,
      start,
      destination,
      isWall: (r, c) => walls[r][c],
      getWeight: () => 1,
      movementMode: '4-directional',
      recordTrace: false
    });

    if (testResult.pathFound) {
      return walls;
    }
  }

  // Fallback: If after 10 attempts still blocked, carve a direct channel
  const fallbackWalls: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!areCoordsEqual({ r, c }, start) && !areCoordsEqual({ r, c }, destination)) {
        if (Math.random() < density * 0.7) {
          fallbackWalls[r][c] = true;
        }
      }
    }
  }

  // Carve direct L-path between start and destination
  let currR = start.r;
  let currC = start.c;
  while (currR !== destination.r) {
    fallbackWalls[currR][currC] = false;
    currR += currR < destination.r ? 1 : -1;
  }
  while (currC !== destination.c) {
    fallbackWalls[currR][currC] = false;
    currC += currC < destination.c ? 1 : -1;
  }
  fallbackWalls[destination.r][destination.c] = false;

  return fallbackWalls;
}
