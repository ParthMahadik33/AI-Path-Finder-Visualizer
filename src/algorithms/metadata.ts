import type { AlgorithmMetadata, AlgorithmType } from './types';

export const ALGORITHM_METADATA: Record<AlgorithmType, AlgorithmMetadata> = {
  astar: {
    id: 'astar',
    name: 'A* Search',
    shortTag: 'A*',
    category: 'Informed / Heuristic',
    guaranteesShortest: true,
    supportsWeights: true,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    heuristicType: 'Manhattan (4-way) / Octile (8-way)',
    description:
      'A* combines Dijkstra’s accumulated path cost g(n) with an admissible heuristic h(n) predicting the remaining distance to the goal. By prioritizing nodes with minimal f(n) = g(n) + h(n), it focuses its search directly toward the target while mathematically guaranteeing an optimal shortest path.',
    tradeoffs:
      'Guarantees shortest path on non-negative weights with an admissible heuristic. Uses more memory than depth-first approaches as all visited and frontier nodes remain stored.',
    pseudocode: [
      'openSet = PriorityQueue(comparator: min f = g + h)',
      'gScore[start] = 0, fScore[start] = h(start, goal)',
      'openSet.push(start)',
      'while openSet is not empty:',
      '    current = openSet.pop()',
      '    if current == goal: return reconstructPath(current)',
      '    for each neighbor of current:',
      '        tentative_g = gScore[current] + weight(current, neighbor)',
      '        if tentative_g < gScore[neighbor]:',
      '            cameFrom[neighbor] = current',
      '            gScore[neighbor] = tentative_g',
      '            fScore[neighbor] = tentative_g + h(neighbor, goal)',
      '            openSet.push(neighbor)'
    ]
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search',
    shortTag: 'BFS',
    category: 'Uninformed / Queue',
    guaranteesShortest: true,
    supportsWeights: false,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    heuristicType: 'None (Uninformed)',
    description:
      'Breadth-First Search explores the search space uniformly layer by layer using a FIFO (first-in, first-out) queue. It guarantees finding the route with the fewest edges/steps on unweighted graphs, expanding equally in all available directions.',
    tradeoffs:
      'Guarantees fewest-hop path on unweighted graphs. However, it blindly explores in every direction without goal orientation, making it computationally expensive on open grids, and ignores terrain weights.',
    pseudocode: [
      'queue = FIFOQueue()',
      'queue.push(start), visited.add(start)',
      'while queue is not empty:',
      '    current = queue.pop()',
      '    if current == goal: return reconstructPath(current)',
      '    for each neighbor of current:',
      '        if neighbor not in visited:',
      '            visited.add(neighbor)',
      '            cameFrom[neighbor] = current',
      '            queue.push(neighbor)'
    ]
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    shortTag: 'DIJKSTRA',
    category: 'Uniform Cost / Greedy',
    guaranteesShortest: true,
    supportsWeights: true,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    heuristicType: 'None (h = 0)',
    description:
      'Dijkstra’s algorithm finds the shortest path by systematically visiting the unvisited vertex with the smallest known accumulated distance g(n). It can be viewed as A* with h(n) = 0. It is universally optimal for any graph with non-negative traversal weights.',
    tradeoffs:
      'Guarantees absolute minimal cost even across varied terrain weights. Like BFS, it expands uniformly outward in all directions without directing search effort toward the goal, visiting more nodes than A*.',
    pseudocode: [
      'pq = PriorityQueue(comparator: min g)',
      'dist[start] = 0, pq.push(start, 0)',
      'while pq is not empty:',
      '    current = pq.pop()',
      '    if current == goal: return reconstructPath(current)',
      '    for each neighbor of current:',
      '        new_dist = dist[current] + weight(current, neighbor)',
      '        if new_dist < dist[neighbor]:',
      '            dist[neighbor] = new_dist',
      '            cameFrom[neighbor] = current',
      '            pq.push(neighbor, new_dist)'
    ]
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    shortTag: 'GREEDY',
    category: 'Heuristic / Depth-leaning',
    guaranteesShortest: false,
    supportsWeights: false,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    heuristicType: 'Manhattan / Octile Estimate',
    description:
      'Greedy Best-First Search evaluates nodes solely on their heuristic estimate h(n) to the goal. It aggressively plunges toward the target along whatever direction looks closest, often discovering a route significantly faster than other algorithms.',
    tradeoffs:
      'Extremely fast in unconstrained corridors, but does NOT guarantee the shortest path. Can get easily misled by concave obstacles, dead ends, or local minima, creating suboptimal serpentine detours.',
    pseudocode: [
      'pq = PriorityQueue(comparator: min h(node, goal))',
      'pq.push(start), visited.add(start)',
      'while pq is not empty:',
      '    current = pq.pop()',
      '    if current == goal: return reconstructPath(current)',
      '    for each neighbor of current:',
      '        if neighbor not in visited:',
      '            visited.add(neighbor)',
      '            cameFrom[neighbor] = current',
      '            pq.push(neighbor)'
    ]
  }
};
