import type { Coordinate, SearchOptions } from './types';

export const SQRT_2 = 1.4142135623730951;

export function coordKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function areCoordsEqual(a: Coordinate, b: Coordinate): boolean {
  return a.r === b.r && a.c === b.c;
}

/**
 * Calculates heuristic distance based on movement mode.
 * Admissible and consistent for non-negative weights.
 */
export function calculateHeuristic(
  a: Coordinate,
  b: Coordinate,
  movementMode: '4-directional' | '8-directional',
  diagonalCostMultiplier: number = SQRT_2
): number {
  const dr = Math.abs(a.r - b.r);
  const dc = Math.abs(a.c - b.c);

  if (movementMode === '4-directional') {
    // Manhattan distance
    return dr + dc;
  } else {
    // Octile distance: handles diagonal cost D2 with orthogonal cost 1
    const d1 = 1;
    const d2 = diagonalCostMultiplier;
    return d1 * (dr + dc) + (d2 - 2 * d1) * Math.min(dr, dc);
  }
}

export interface NeighborStep {
  coord: Coordinate;
  cost: number;
}

/**
 * Returns valid accessible neighbors from (r, c) respecting walls, bounds, and diagonal corner-cutting rules.
 */
export function getValidNeighbors(
  r: number,
  c: number,
  options: SearchOptions
): NeighborStep[] {
  const {
    rows,
    cols,
    isWall,
    getWeight,
    movementMode,
    diagonalCostMultiplier = SQRT_2,
    cornerCuttingRule = 'no-squeeze'
  } = options;

  const results: NeighborStep[] = [];

  // Orthogonal deltas: Up, Down, Left, Right
  const orthogonalDeltas = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];

  for (const { dr, dc } of orthogonalDeltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      if (!isWall(nr, nc)) {
        const weight = Math.max(1, getWeight(nr, nc));
        results.push({
          coord: { r: nr, c: nc },
          cost: weight
        });
      }
    }
  }

  if (movementMode === '8-directional') {
    // Diagonal deltas: Up-Left, Up-Right, Down-Left, Down-Right
    const diagonalDeltas = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 }
    ];

    for (const { dr, dc } of diagonalDeltas) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (isWall(nr, nc)) continue;

      // Check corner cutting rules with adjacent orthogonal cells (r+dr, c) and (r, c+dc)
      const wall1 = isWall(r + dr, c);
      const wall2 = isWall(r, c + dc);

      if (cornerCuttingRule === 'never') {
        if (wall1 || wall2) continue;
      } else if (cornerCuttingRule === 'no-squeeze') {
        if (wall1 && wall2) continue;
      }
      // 'unrestricted' allows diagonal move as long as target isn't a wall

      const baseWeight = Math.max(1, getWeight(nr, nc));
      const stepCost = baseWeight * diagonalCostMultiplier;

      results.push({
        coord: { r: nr, c: nc },
        cost: stepCost
      });
    }
  }

  return results;
}

/**
 * Reconstructs the path by walking parent pointers from destination to start.
 */
export function reconstructPath(
  parentMap: Map<string, Coordinate>,
  start: Coordinate,
  destination: Coordinate
): Coordinate[] {
  if (areCoordsEqual(start, destination)) {
    return [start];
  }

  const path: Coordinate[] = [];
  let current: Coordinate | undefined = destination;
  const startKey = coordKey(start.r, start.c);

  while (current) {
    path.push(current);
    const currKey = coordKey(current.r, current.c);
    if (currKey === startKey) {
      break;
    }
    current = parentMap.get(currKey);
  }

  // If path didn't reach start, no valid path was formed
  if (path.length === 0 || !areCoordsEqual(path[path.length - 1], start)) {
    return [];
  }

  return path.reverse();
}

/**
 * Calculates exact path traversal cost using step transitions.
 */
export function calculatePathCost(
  path: Coordinate[],
  options: SearchOptions
): number {
  if (path.length <= 1) return 0;
  let totalCost = 0;
  const { getWeight, diagonalCostMultiplier = SQRT_2 } = options;

  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1];
    const to = path[i];
    const isDiagonal = from.r !== to.r && from.c !== to.c;
    const weight = Math.max(1, getWeight(to.r, to.c));
    const stepCost = isDiagonal ? weight * diagonalCostMultiplier : weight;
    totalCost += stepCost;
  }

  return Math.round(totalCost * 100) / 100;
}
