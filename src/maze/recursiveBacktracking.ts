import type { Coordinate } from '../algorithms/types';
import { areCoordsEqual } from '../algorithms/helpers';
import type { MazeOptions } from './types';

/**
 * Generates an architectural labyrinth using Recursive Backtracking (Depth-First Search spanning tree).
 * Produces crisp corridors and walls with guaranteed connectivity.
 */
export function generateRecursiveBacktrackingMaze(options: MazeOptions): boolean[][] {
  const { rows, cols, start, destination } = options;

  // Initialize all cells as walls (true)
  const walls: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => true)
  );

  // Helper to check if coordinate is inside grid boundaries
  const inBounds = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols;

  // Determine an internal odd cell or start coordinate to begin carving
  let startR = start.r % 2 === 1 ? start.r : start.r + 1;
  let startC = start.c % 2 === 1 ? start.c : start.c + 1;

  if (startR >= rows) startR = Math.max(1, rows - 2);
  if (startC >= cols) startC = Math.max(1, cols - 2);

  const stack: Coordinate[] = [{ r: startR, c: startC }];
  walls[startR][startC] = false;

  const directions = [
    { dr: -2, dc: 0, wallR: -1, wallC: 0 },
    { dr: 2, dc: 0, wallR: 1, wallC: 0 },
    { dr: 0, dc: -2, wallR: 0, wallC: -1 },
    { dr: 0, dc: 2, wallR: 0, wallC: 1 }
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    // Shuffle directions for randomized organic corridors
    const shuffled = [...directions].sort(() => Math.random() - 0.5);
    let carved = false;

    for (const dir of shuffled) {
      const nr = current.r + dir.dr;
      const nc = current.c + dir.dc;

      // Must be strictly within grid with at least 0 border
      if (inBounds(nr, nc) && walls[nr][nc]) {
        // Knock down wall between
        const wr = current.r + dir.wallR;
        const wc = current.c + dir.wallC;
        walls[wr][wc] = false;
        walls[nr][nc] = false;

        stack.push({ r: nr, c: nc });
        carved = true;
        break;
      }
    }

    if (!carved) {
      stack.pop();
    }
  }

  // Ensure start cell is open
  walls[start.r][start.c] = false;

  // Connect start to nearest open passage
  connectToOpenCorridor(start, walls, rows, cols);

  // Ensure destination cell is open
  walls[destination.r][destination.c] = false;

  // Connect destination to nearest open passage
  connectToOpenCorridor(destination, walls, rows, cols);

  // Randomly knock down ~8% of interior walls to create loops and multiple path choices
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (walls[r][c] && Math.random() < 0.08) {
        // Only if it joins two open passages
        const openOrthogonals =
          (!walls[r - 1][c] ? 1 : 0) +
          (!walls[r + 1][c] ? 1 : 0) +
          (!walls[r][c - 1] ? 1 : 0) +
          (!walls[r][c + 1] ? 1 : 0);
        if (openOrthogonals >= 2) {
          walls[r][c] = false;
        }
      }
    }
  }

  return walls;
}

function connectToOpenCorridor(
  target: Coordinate,
  walls: boolean[][],
  rows: number,
  cols: number
): void {
  // BFS search to find nearest already open passage and carve path
  const queue: Coordinate[] = [target];
  const visited = new Set<string>();
  const parent = new Map<string, Coordinate>();
  visited.add(`${target.r},${target.c}`);

  let foundCorridor: Coordinate | null = null;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (!areCoordsEqual(curr, target) && !walls[curr.r][curr.c]) {
      foundCorridor = curr;
      break;
    }

    const deltas = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];

    for (const d of deltas) {
      const nr = curr.r + d.dr;
      const nc = curr.c + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const k = `${nr},${nc}`;
        if (!visited.has(k)) {
          visited.add(k);
          parent.set(k, curr);
          queue.push({ r: nr, c: nc });
        }
      }
    }
  }

  // Carve backwards
  if (foundCorridor) {
    let curr: Coordinate | undefined = foundCorridor;
    while (curr) {
      walls[curr.r][curr.c] = false;
      curr = parent.get(`${curr.r},${curr.c}`);
    }
  }
}
