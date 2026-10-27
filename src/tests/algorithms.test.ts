import { describe, it, expect } from 'vitest';
import { runAStar } from '../algorithms/astar';
import { runBFS } from '../algorithms/bfs';
import { runDijkstra } from '../algorithms/dijkstra';
import { runGreedyBestFirst } from '../algorithms/greedyBestFirst';
import { PriorityQueue } from '../algorithms/priorityQueue';
import type { Coordinate, SearchOptions } from '../algorithms/types';
import { generateRandomMaze } from '../maze/randomMaze';
import { generateRecursiveBacktrackingMaze } from '../maze/recursiveBacktracking';

// Helper to create an empty grid option
function createBaseOptions(
  rows = 10,
  cols = 10,
  start: Coordinate = { r: 1, c: 1 },
  destination: Coordinate = { r: 8, c: 8 }
): SearchOptions {
  return {
    rows,
    cols,
    start,
    destination,
    isWall: () => false,
    getWeight: () => 1,
    movementMode: '4-directional',
    cornerCuttingRule: 'no-squeeze',
    recordTrace: true
  };
}

// Helper to verify path adjacency
function verifyPathAdjacency(
  path: Coordinate[],
  movementMode: '4-directional' | '8-directional'
): boolean {
  if (path.length <= 1) return true;
  for (let i = 1; i < path.length; i++) {
    const dr = Math.abs(path[i].r - path[i - 1].r);
    const dc = Math.abs(path[i].c - path[i - 1].c);
    if (movementMode === '4-directional') {
      if (dr + dc !== 1) return false;
    } else {
      if (dr > 1 || dc > 1 || (dr === 0 && dc === 0)) return false;
    }
  }
  return true;
}

describe('PriorityQueue Min-Heap', () => {
  it('correctly maintains min-heap order', () => {
    const pq = new PriorityQueue<number>((a, b) => a - b);
    const nums = [42, 12, 88, 5, 23, 1, 100, 3];
    for (const n of nums) pq.push(n);

    const sorted: number[] = [];
    while (!pq.isEmpty()) {
      sorted.push(pq.pop()!);
    }

    expect(sorted).toEqual([1, 3, 5, 12, 23, 42, 88, 100]);
  });
});

describe('Pathfinding Algorithms Correctness', () => {
  it('1. A* finds valid shortest path in an unobstructed grid', () => {
    const opts = createBaseOptions(10, 10, { r: 0, c: 0 }, { r: 4, c: 4 });
    const result = runAStar(opts);

    expect(result.pathFound).toBe(true);
    expect(result.path.length).toBe(9); // Manhattan distance 8 steps + 1 start cell
    expect(result.path[0]).toEqual({ r: 0, c: 0 });
    expect(result.path[result.path.length - 1]).toEqual({ r: 4, c: 4 });
    expect(verifyPathAdjacency(result.path, '4-directional')).toBe(true);
  });

  it('2. BFS finds a shortest path in an unweighted grid', () => {
    const opts = createBaseOptions(15, 15, { r: 2, c: 2 }, { r: 8, c: 5 });
    const result = runBFS(opts);

    expect(result.pathFound).toBe(true);
    expect(result.path[0]).toEqual({ r: 2, c: 2 });
    expect(result.path[result.path.length - 1]).toEqual({ r: 8, c: 5 });
    // Manhattan distance is |8-2| + |5-2| = 6 + 3 = 9 steps -> 10 nodes
    expect(result.path.length).toBe(10);
    expect(verifyPathAdjacency(result.path, '4-directional')).toBe(true);
  });

  it('3. Dijkstra handles weighted terrain and finds the true lowest-cost detour', () => {
    // Setup a 5x5 grid where direct path has high weight (weight = 10)
    // but detour around column 0 has weight 1.
    const opts: SearchOptions = {
      rows: 5,
      cols: 5,
      start: { r: 0, c: 2 },
      destination: { r: 4, c: 2 },
      isWall: () => false,
      getWeight: (_r, c) => (c === 2 ? 10 : 1), // center column is expensive
      movementMode: '4-directional',
      recordTrace: true
    };

    const dijkstraResult = runDijkstra(opts);
    const astarResult = runAStar(opts);

    expect(dijkstraResult.pathFound).toBe(true);
    expect(astarResult.pathFound).toBe(true);
    // Both optimal algorithms should find a path with lower cost than straight line
    // Straight line cost: 4 steps * 10 = 40. Detour steps have cost around 10.
    expect(dijkstraResult.pathCost).toBeLessThan(30);
    expect(dijkstraResult.pathCost).toBe(astarResult.pathCost);
  });

  it('4. Greedy Best-First Search returns a valid path when one exists', () => {
    const opts = createBaseOptions(10, 10, { r: 1, c: 1 }, { r: 7, c: 8 });
    const result = runGreedyBestFirst(opts);

    expect(result.pathFound).toBe(true);
    expect(result.path[0]).toEqual({ r: 1, c: 1 });
    expect(result.path[result.path.length - 1]).toEqual({ r: 7, c: 8 });
    expect(verifyPathAdjacency(result.path, '4-directional')).toBe(true);
  });

  it('5. All algorithms correctly report failure for unreachable destinations', () => {
    // Surround destination (4, 4) with walls
    const isWall = (r: number, c: number) => {
      return (
        (r === 3 && c >= 3 && c <= 5) ||
        (r === 5 && c >= 3 && c <= 5) ||
        (c === 3 && r >= 3 && r <= 5) ||
        (c === 5 && r >= 3 && r <= 5)
      );
    };

    const opts: SearchOptions = {
      rows: 10,
      cols: 10,
      start: { r: 0, c: 0 },
      destination: { r: 4, c: 4 },
      isWall,
      getWeight: () => 1,
      movementMode: '4-directional',
      recordTrace: true
    };

    const algorithms = [runAStar, runBFS, runDijkstra, runGreedyBestFirst];
    for (const algo of algorithms) {
      const res = algo(opts);
      expect(res.pathFound).toBe(false);
      expect(res.path).toEqual([]);
      expect(res.pathCost).toBe(0);
    }
  });

  it('6. All algorithms handle start equal to destination without error', () => {
    const opts = createBaseOptions(5, 5, { r: 2, c: 2 }, { r: 2, c: 2 });
    const algorithms = [runAStar, runBFS, runDijkstra, runGreedyBestFirst];

    for (const algo of algorithms) {
      const res = algo(opts);
      expect(res.pathFound).toBe(true);
      expect(res.path).toEqual([{ r: 2, c: 2 }]);
      expect(res.pathCost).toBe(0);
    }
  });

  it('7. Walls are never included in the final reconstructed path', () => {
    // Create an obstacle wall in the middle
    const isWall = (r: number, c: number) => r === 3 && c >= 1 && c <= 7;
    const opts: SearchOptions = {
      rows: 8,
      cols: 10,
      start: { r: 1, c: 4 },
      destination: { r: 6, c: 4 },
      isWall,
      getWeight: () => 1,
      movementMode: '4-directional',
      recordTrace: true
    };

    const res = runAStar(opts);
    expect(res.pathFound).toBe(true);
    for (const pt of res.path) {
      expect(isWall(pt.r, pt.c)).toBe(false);
    }
    expect(verifyPathAdjacency(res.path, '4-directional')).toBe(true);
  });

  it('8. Diagonal movement correctly respects corner-cutting rules', () => {
    // Setup two diagonal blocks meeting at corner:
    // (1, 2) is a wall, (2, 1) is a wall.
    // Moving from (1, 1) to (2, 2) squeezes between these two walls.
    const isWall = (r: number, c: number) => {
      return (r === 1 && c === 2) || (r === 2 && c === 1);
    };

    const optsNever: SearchOptions = {
      rows: 5,
      cols: 5,
      start: { r: 1, c: 1 },
      destination: { r: 2, c: 2 },
      isWall,
      getWeight: () => 1,
      movementMode: '8-directional',
      cornerCuttingRule: 'never',
      recordTrace: false
    };

    const resNever = runAStar(optsNever);
    // Under 'never', direct diagonal step from (1,1) to (2,2) cannot be taken directly.
    // Path must detour around.
    expect(resNever.pathFound).toBe(true);
    expect(resNever.path.length).toBeGreaterThan(2);

    const optsUnrestricted: SearchOptions = {
      ...optsNever,
      cornerCuttingRule: 'unrestricted'
    };
    const resUnrestricted = runAStar(optsUnrestricted);
    expect(resUnrestricted.pathFound).toBe(true);
    // Under 'unrestricted', it can step directly from (1,1) to (2,2)
    expect(resUnrestricted.path.length).toBe(2);
  });

  it('9. Maze generators produce valid mazes with protected start and destination', () => {
    const start = { r: 1, c: 1 };
    const destination = { r: 15, c: 25 };

    const randomMaze = generateRandomMaze({
      rows: 20,
      cols: 30,
      start,
      destination,
      density: 0.25,
      ensureSolvable: true
    });

    expect(randomMaze[start.r][start.c]).toBe(false);
    expect(randomMaze[destination.r][destination.c]).toBe(false);

    // Verify solvable
    const testResult = runBFS({
      rows: 20,
      cols: 30,
      start,
      destination,
      isWall: (r, c) => randomMaze[r][c],
      getWeight: () => 1,
      movementMode: '4-directional',
      recordTrace: false
    });
    expect(testResult.pathFound).toBe(true);

    const recursiveMaze = generateRecursiveBacktrackingMaze({
      rows: 21,
      cols: 31,
      start,
      destination
    });
    expect(recursiveMaze[start.r][start.c]).toBe(false);
    expect(recursiveMaze[destination.r][destination.c]).toBe(false);

    const recResult = runBFS({
      rows: 21,
      cols: 31,
      start,
      destination,
      isWall: (r, c) => recursiveMaze[r][c],
      getWeight: () => 1,
      movementMode: '4-directional',
      recordTrace: false
    });
    expect(recResult.pathFound).toBe(true);
  });
});
