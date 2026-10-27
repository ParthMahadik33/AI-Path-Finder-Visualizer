# AI PathFinder: Intelligent Search Algorithm Lab

**AI PathFinder** is an interactive, editorial-grade search algorithm laboratory and maze-solving visualizer. Built with React, TypeScript, Vite, Tailwind CSS, Motion, and Three.js, it demonstrates how intelligent search algorithms explore discrete space, evaluate candidate frontiers, and discover optimal routes.

![AI PathFinder](public/favicon.svg)

---

## Key Highlights

- **4 Fully Functional Algorithms**: Independent, deterministic implementations of **A\***, **Breadth-First Search (BFS)**, **Dijkstra's Algorithm**, and **Greedy Best-First Search**.
- **Real-Time Step Trace Playback**: Every search records a trace of genuine algorithm operations (`DISCOVER`, `EXPLORE`, `UPDATE`, `PATH_STEP`, `COMPLETE`, `NO_PATH`). Playback animates this trace with **Pause**, **Resume**, **Single-Step**, **Speed Control** (Slow, Normal, Fast), and **Instant** evaluation mode.
- **2D Interactive Grid & Pointer Engine**:
  - Drag across cells to draw or erase solid walls.
  - Drag **START** (`S`) or **DESTINATION** (`D`) pins to relocate endpoints anywhere on the grid.
  - Mud Terrain painting (3× traversal cost) to test cost-weighted shortest paths.
  - Multi-touch mobile support and responsive layout.
- **Three.js 3D Low-Poly Terrain**: Toggle between 2D computational map and 3D extruded terrain with ambient/directional lighting, real-time shadows, and mouse orbit/zoom controls.
- **Maze Generators**:
  - **Labyrinth (Recursive Backtracking DFS)**: Carves organic spanning trees with guaranteed solvability.
  - **Random Obstacle Percolation**: Configurable obstacle densities (Sparse 15%, Medium 25%, Dense 35%) with protected endpoints and automated connectivity validation.
- **Comprehensive Telemetry & "Inside the search" Inspector**:
  - Real measured algorithmic computation time (excluding UI animation duration).
  - Nodes explored, nodes discovered, final path length, and total weighted cost.
  - Real-time node inspector displaying active `g(n)`, `h(n)`, and `f(n)` values.
  - Expandable pseudocode and complexity breakdown.
- **Editorial Swiss Design & Complete Dark Mode**: Restrained warm palette (`#F6F5F0`, `#191A18`, `#F0442D`), IBM Plex Mono readouts, and theme persistence.

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone or navigate to the project directory
cd "AI Lab"

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

### Running Automated Algorithm Tests

```bash
# Run the Vitest test suite
npm test
```

### Production Build

```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Implemented Algorithms

| Algorithm | Category | Shortest Path Guaranteed | Weighted Terrain Support | Time Complexity | Space Complexity |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **A\* Search** | Informed / Heuristic | **Yes (Optimal)** | **Yes** | $O((V + E) \log V)$ | $O(V)$ |
| **BFS** | Uninformed / Queue | **Yes (Unweighted)** | No | $O(V + E)$ | $O(V)$ |
| **Dijkstra** | Uniform Cost | **Yes (Optimal)** | **Yes** | $O((V + E) \log V)$ | $O(V)$ |
| **Greedy Best-First** | Informed / Greedy | No (Heuristic) | No | $O((V + E) \log V)$ | $O(V)$ |

---

## Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Space` | Start / Pause / Resume pathfinding search |
| `→` | Advance single algorithm step forward |
| `R` | Reset grid and search state |
| `C` | Clear walls while preserving endpoints and weights |
| `P` | Clear path and search traces |
| `M` | Generate a random maze |
| `T` | Toggle Light / Dark theme |
| `3` | Toggle 2D Grid / 3D Terrain mode |
| `?` | Open / close keyboard shortcuts modal |

---

## Architecture & Code Structure

```
src/
  ├── algorithms/
  │   ├── types.ts              # Coordinate, SearchOptions, TraceEvent, Result interfaces
  │   ├── helpers.ts            # Manhattan / Octile heuristics, neighbor checks, corner-cutting rules
  │   ├── priorityQueue.ts      # O(log N) Binary Min-Heap with deterministic tie-breaking
  │   ├── astar.ts              # A* search algorithm engine
  │   ├── bfs.ts                # Breadth-first search engine
  │   ├── dijkstra.ts           # Dijkstra's algorithm engine
  │   ├── greedyBestFirst.ts    # Greedy best-first search engine
  │   ├── metadata.ts           # Educational metadata, complexities, and pseudocode
  │   └── index.ts              # Barrel export and algorithm dispatcher
  ├── maze/
  │   ├── types.ts              # Maze generation options
  │   ├── randomMaze.ts         # Random obstacle percolation with solvability verification
  │   └── recursiveBacktracking.ts # Recursive DFS labyrinth generator
  ├── store/
  │   └── appStore.ts           # Zustand master application state
  ├── hooks/
  │   └── usePlayback.ts        # Trace playback loop hook (Slow, Normal, Fast, Instant)
  ├── components/
  │   ├── Header.tsx            # Top navigation, view mode toggle, theme switch
  │   ├── PageHeader.tsx        # Editorial title & active configuration capsule
  │   ├── GridToolbar.tsx       # Brush tools (Wall, Mud, Eraser), dimensions, maze actions
  │   ├── GridVisualizer.tsx    # Interactive 2D canvas with pointer & touch drag
  │   ├── Terrain3D.tsx         # Three.js 3D low-poly terrain with OrbitControls
  │   ├── PlaybackControls.tsx  # Run, Pause, Step, Reset, and Speed selector
  │   ├── Legend.tsx            # Accessible symbols and color indicators
  │   ├── AlgorithmSelector.tsx # Algorithmic mode picker
  │   ├── SettingsPanel.tsx     # Movement mode, diagonal corner rules, weights
  │   ├── AnalyticsPanel.tsx    # Live telemetry, path length, cost, and execution duration
  │   ├── AlgorithmExplanation.tsx # Active node inspector with g, h, f and pseudocode
  │   ├── AlgorithmComparisonView.tsx # Side-by-side comparative table
  │   ├── DocumentationView.tsx # Mathematical references and formulas
  │   └── ShortcutsModal.tsx    # Keyboard shortcut cheat sheet
  ├── tests/
  │   └── algorithms.test.ts    # Comprehensive Vitest test suite
  └── index.css                 # Editorial Swiss design system CSS variables
```

---

## License

MIT
