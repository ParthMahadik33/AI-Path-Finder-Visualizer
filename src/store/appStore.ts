import { create } from 'zustand';
import type {
  Coordinate,
  AlgorithmType,
  MovementMode,
  CornerCuttingRule,
  TraceEvent,
  AlgorithmResult
} from '../algorithms/types';
import { runAlgorithm } from '../algorithms';
import type { CellVisualState, PlaybackSpeed, SearchStatus } from '../types/grid';
import { generateRandomMaze, generateRecursiveBacktrackingMaze } from '../maze';
import type { MazeType } from '../maze';
import confetti from 'canvas-confetti';

export interface AppState {
  // Grid Dimensions & Coordinates
  rows: number;
  cols: number;
  start: Coordinate;
  destination: Coordinate;

  // Grid Matrices
  walls: boolean[][];
  weights: number[][]; // 1 = standard, 3 = rough/mud terrain
  cellVisuals: CellVisualState[][];

  // Algorithm & Search Settings
  selectedAlgorithm: AlgorithmType;
  movementMode: MovementMode;
  cornerCuttingRule: CornerCuttingRule;
  weightedTerrainEnabled: boolean;
  activeBrush: 'wall' | 'weight' | 'eraser';

  // Playback State
  searchStatus: SearchStatus;
  playbackSpeed: PlaybackSpeed;
  trace: TraceEvent[];
  currentStepIndex: number;
  currentInspectEvent: TraceEvent | null;

  // Metrics
  nodesExplored: number;
  nodesDiscovered: number;
  pathLength: number;
  pathCost: number;
  searchDurationMs: number;
  finalPath: Coordinate[];

  // View & UI State
  viewMode: '2d' | '3d';
  theme: 'light' | 'dark';
  shortcutsModalOpen: boolean;
  activeTab: 'visualizer' | 'algorithms' | 'documentation';

  // Actions
  setDimensions: (rows: number, cols: number) => void;
  setStart: (coord: Coordinate) => void;
  setDestination: (coord: Coordinate) => void;
  setCellWall: (r: number, c: number, isWall: boolean) => void;
  setCellWeight: (r: number, c: number, weight: number) => void;
  setActiveBrush: (brush: 'wall' | 'weight' | 'eraser') => void;
  setSelectedAlgorithm: (algo: AlgorithmType) => void;
  setMovementMode: (mode: MovementMode) => void;
  setCornerCuttingRule: (rule: CornerCuttingRule) => void;
  setWeightedTerrainEnabled: (enabled: boolean) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'visualizer' | 'algorithms' | 'documentation') => void;

  // Maze Actions
  generateMaze: (type: MazeType) => void;

  // Grid Clearing Actions
  clearWalls: () => void;
  clearPath: () => void;
  resetAll: () => void;

  // Playback Control Actions
  startSearch: () => void;
  pauseSearch: () => void;
  resumeSearch: () => void;
  stepForward: () => void;
  resetSearch: () => void;
  applyStep: (event: TraceEvent) => void;
  finishPlayback: (result: AlgorithmResult) => void;
}

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 30;
const DEFAULT_START: Coordinate = { r: 10, c: 5 };
const DEFAULT_DEST: Coordinate = { r: 10, c: 24 };

function createEmptyMatrix<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => initialValue));
}

function computeVisualGrid(
  rows: number,
  cols: number,
  walls: boolean[][],
  weights: number[][],
  start: Coordinate,
  destination: Coordinate
): CellVisualState[][] {
  const visuals: CellVisualState[][] = createEmptyMatrix(rows, cols, 'empty');
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === start.r && c === start.c) {
        visuals[r][c] = 'start';
      } else if (r === destination.r && c === destination.c) {
        visuals[r][c] = 'dest';
      } else if (walls[r][c]) {
        visuals[r][c] = 'wall';
      } else if (weights[r][c] > 1) {
        visuals[r][c] = 'weight';
      }
    }
  }
  return visuals;
}

// Initial theme detection
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pathfinder_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export const useAppStore = create<AppState>((set, get) => {
  const initialTheme = getInitialTheme();
  if (typeof document !== 'undefined') {
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  const initialWalls = createEmptyMatrix(DEFAULT_ROWS, DEFAULT_COLS, false);
  const initialWeights = createEmptyMatrix(DEFAULT_ROWS, DEFAULT_COLS, 1);
  const initialVisuals = computeVisualGrid(
    DEFAULT_ROWS,
    DEFAULT_COLS,
    initialWalls,
    initialWeights,
    DEFAULT_START,
    DEFAULT_DEST
  );

  return {
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    start: DEFAULT_START,
    destination: DEFAULT_DEST,
    walls: initialWalls,
    weights: initialWeights,
    cellVisuals: initialVisuals,

    selectedAlgorithm: 'astar',
    movementMode: '4-directional',
    cornerCuttingRule: 'no-squeeze',
    weightedTerrainEnabled: false,
    activeBrush: 'wall',

    searchStatus: 'idle',
    playbackSpeed: 'normal',
    trace: [],
    currentStepIndex: 0,
    currentInspectEvent: null,

    nodesExplored: 0,
    nodesDiscovered: 0,
    pathLength: 0,
    pathCost: 0,
    searchDurationMs: 0,
    finalPath: [],

    viewMode: '2d',
    theme: initialTheme,
    shortcutsModalOpen: false,
    activeTab: 'visualizer',

    setDimensions: (newRows: number, newCols: number) => {
      const rows = Math.max(10, Math.min(50, newRows));
      const cols = Math.max(15, Math.min(70, newCols));

      const newStart: Coordinate = {
        r: Math.floor(rows / 2),
        c: Math.max(1, Math.floor(cols * 0.15))
      };
      const newDest: Coordinate = {
        r: Math.floor(rows / 2),
        c: Math.min(cols - 2, Math.floor(cols * 0.85))
      };

      const newWalls = createEmptyMatrix(rows, cols, false);
      const newWeights = createEmptyMatrix(rows, cols, 1);
      const newVisuals = computeVisualGrid(rows, cols, newWalls, newWeights, newStart, newDest);

      set({
        rows,
        cols,
        start: newStart,
        destination: newDest,
        walls: newWalls,
        weights: newWeights,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        searchDurationMs: 0,
        finalPath: []
      });
    },

    setStart: (coord: Coordinate) => {
      const { rows, cols, destination, walls, weights, cellVisuals } = get();
      if (coord.r < 0 || coord.r >= rows || coord.c < 0 || coord.c >= cols) return;
      if (coord.r === destination.r && coord.c === destination.c) return;

      const newWalls = walls.map((row) => [...row]);
      newWalls[coord.r][coord.c] = false; // Cannot be a wall

      const newVisuals = cellVisuals.map((row) => [...row]);
      // Reset previous start cell
      const oldStart = get().start;
      newVisuals[oldStart.r][oldStart.c] = weights[oldStart.r][oldStart.c] > 1 ? 'weight' : 'empty';
      newVisuals[coord.r][coord.c] = 'start';

      set({
        start: coord,
        walls: newWalls,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    setDestination: (coord: Coordinate) => {
      const { rows, cols, start, walls, weights, cellVisuals } = get();
      if (coord.r < 0 || coord.r >= rows || coord.c < 0 || coord.c >= cols) return;
      if (coord.r === start.r && coord.c === start.c) return;

      const newWalls = walls.map((row) => [...row]);
      newWalls[coord.r][coord.c] = false; // Cannot be a wall

      const newVisuals = cellVisuals.map((row) => [...row]);
      // Reset previous destination cell
      const oldDest = get().destination;
      newVisuals[oldDest.r][oldDest.c] = weights[oldDest.r][oldDest.c] > 1 ? 'weight' : 'empty';
      newVisuals[coord.r][coord.c] = 'dest';

      set({
        destination: coord,
        walls: newWalls,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    setCellWall: (r: number, c: number, isWall: boolean) => {
      const { start, destination, rows, cols, walls, cellVisuals, weights } = get();
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if ((r === start.r && c === start.c) || (r === destination.r && c === destination.c)) return;

      const newWalls = walls.map((row) => [...row]);
      newWalls[r][c] = isWall;

      const newVisuals = cellVisuals.map((row) => [...row]);
      if (isWall) {
        newVisuals[r][c] = 'wall';
      } else {
        newVisuals[r][c] = weights[r][c] > 1 ? 'weight' : 'empty';
      }

      set({
        walls: newWalls,
        cellVisuals: newVisuals,
        // Invalidate outdated search results on grid mutation
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    setCellWeight: (r: number, c: number, weight: number) => {
      const { start, destination, rows, cols, weights, cellVisuals, walls } = get();
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if ((r === start.r && c === start.c) || (r === destination.r && c === destination.c)) return;
      if (walls[r][c]) return;

      const newWeights = weights.map((row) => [...row]);
      newWeights[r][c] = weight;

      const newVisuals = cellVisuals.map((row) => [...row]);
      newVisuals[r][c] = weight > 1 ? 'weight' : 'empty';

      set({
        weights: newWeights,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    setActiveBrush: (brush) => set({ activeBrush: brush }),
    setSelectedAlgorithm: (algo) => set({ selectedAlgorithm: algo }),
    setMovementMode: (mode) => set({ movementMode: mode }),
    setCornerCuttingRule: (rule) => set({ cornerCuttingRule: rule }),
    setWeightedTerrainEnabled: (enabled) => set({ weightedTerrainEnabled: enabled }),
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
    setActiveTab: (tab) => set({ activeTab: tab }),

    setTheme: (theme) => {
      localStorage.setItem('pathfinder_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },

    toggleTheme: () => {
      const nextTheme = get().theme === 'light' ? 'dark' : 'light';
      get().setTheme(nextTheme);
    },

    generateMaze: (type: MazeType) => {
      const { rows, cols, start, destination, weights } = get();

      let newWalls: boolean[][];
      if (type === 'recursive-backtracking') {
        newWalls = generateRecursiveBacktrackingMaze({ rows, cols, start, destination });
      } else {
        const densityMap: Record<string, number> = {
          'random-sparse': 0.15,
          'random-medium': 0.25,
          'random-dense': 0.35
        };
        newWalls = generateRandomMaze({
          rows,
          cols,
          start,
          destination,
          density: densityMap[type] ?? 0.25,
          ensureSolvable: true
        });
      }

      const newVisuals = computeVisualGrid(rows, cols, newWalls, weights, start, destination);

      set({
        walls: newWalls,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    clearWalls: () => {
      const { rows, cols, start, destination, weights } = get();
      const newWalls = createEmptyMatrix(rows, cols, false);
      const newVisuals = computeVisualGrid(rows, cols, newWalls, weights, start, destination);

      set({
        walls: newWalls,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    clearPath: () => {
      const { rows, cols, start, destination, walls, weights } = get();
      const newVisuals = computeVisualGrid(rows, cols, walls, weights, start, destination);

      set({
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    resetAll: () => {
      const { rows, cols, start, destination } = get();
      const newWalls = createEmptyMatrix(rows, cols, false);
      const newWeights = createEmptyMatrix(rows, cols, 1);
      const newVisuals = computeVisualGrid(rows, cols, newWalls, newWeights, start, destination);

      set({
        walls: newWalls,
        weights: newWeights,
        cellVisuals: newVisuals,
        searchStatus: 'idle',
        trace: [],
        currentStepIndex: 0,
        currentInspectEvent: null,
        nodesExplored: 0,
        nodesDiscovered: 0,
        pathLength: 0,
        pathCost: 0,
        finalPath: []
      });
    },

    startSearch: () => {
      const {
        rows,
        cols,
        start,
        destination,
        walls,
        weights,
        selectedAlgorithm,
        movementMode,
        cornerCuttingRule,
        weightedTerrainEnabled,
        playbackSpeed
      } = get();

      // Reset previous path visuals while retaining walls and weights
      const freshVisuals = computeVisualGrid(rows, cols, walls, weights, start, destination);
      set({ cellVisuals: freshVisuals });

      // Run algorithm computation
      const result = runAlgorithm(selectedAlgorithm, {
        rows,
        cols,
        start,
        destination,
        isWall: (r, c) => walls[r][c],
        getWeight: (r, c) => (weightedTerrainEnabled ? weights[r][c] : 1),
        movementMode,
        cornerCuttingRule,
        recordTrace: true
      });

      if (playbackSpeed === 'instant') {
        // Immediately apply final state
        get().finishPlayback(result);
      } else {
        set({
          trace: result.trace,
          currentStepIndex: 0,
          currentInspectEvent: result.trace[0] ?? null,
          searchStatus: 'searching',
          searchDurationMs: result.durationMs,
          nodesExplored: 0,
          nodesDiscovered: 0,
          pathLength: 0,
          pathCost: 0,
          finalPath: result.path
        });
      }
    },

    pauseSearch: () => {
      if (get().searchStatus === 'searching') {
        set({ searchStatus: 'paused' });
      }
    },

    resumeSearch: () => {
      if (get().searchStatus === 'paused') {
        set({ searchStatus: 'searching' });
      }
    },

    stepForward: () => {
      const { trace, currentStepIndex, searchStatus, finalPath } = get();
      if (currentStepIndex >= trace.length) return;

      const event = trace[currentStepIndex];
      get().applyStep(event);

      const nextIndex = currentStepIndex + 1;
      const isFinished = nextIndex >= trace.length;

      set({
        currentStepIndex: nextIndex,
        currentInspectEvent: event,
        searchStatus: isFinished ? (finalPath.length > 0 ? 'completed' : 'no_path') : searchStatus
      });

      if (isFinished && finalPath.length > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#F0442D', '#22C55E', '#3B82F6']
        });
      }
    },

    applyStep: (event: TraceEvent) => {
      const { cellVisuals, start, destination } = get();
      const { coord, type } = event;

      // Never overwrite start or destination markers
      if ((coord.r === start.r && coord.c === start.c) || (coord.r === destination.r && coord.c === destination.c)) {
        return;
      }

      const nextVisuals = cellVisuals.map((row) => [...row]);

      if (type === 'DISCOVER') {
        if (nextVisuals[coord.r][coord.c] !== 'explored' && nextVisuals[coord.r][coord.c] !== 'path') {
          nextVisuals[coord.r][coord.c] = 'frontier';
        }
      } else if (type === 'EXPLORE') {
        if (nextVisuals[coord.r][coord.c] !== 'path') {
          nextVisuals[coord.r][coord.c] = 'explored';
        }
      } else if (type === 'PATH_STEP') {
        nextVisuals[coord.r][coord.c] = 'path';
      }

      set({ cellVisuals: nextVisuals });
    },

    finishPlayback: (result: AlgorithmResult) => {
      const { rows, cols, start, destination, walls, weights } = get();
      const finalVisuals = computeVisualGrid(rows, cols, walls, weights, start, destination);

      // Apply all explored and path cells
      for (const event of result.trace) {
        const { coord, type } = event;
        if ((coord.r === start.r && coord.c === start.c) || (coord.r === destination.r && coord.c === destination.c)) {
          continue;
        }
        if (type === 'EXPLORE' || type === 'DISCOVER') {
          if (finalVisuals[coord.r][coord.c] !== 'path') {
            finalVisuals[coord.r][coord.c] = 'explored';
          }
        }
      }

      for (const pt of result.path) {
        if (!((pt.r === start.r && pt.c === start.c) || (pt.r === destination.r && pt.c === destination.c))) {
          finalVisuals[pt.r][pt.c] = 'path';
        }
      }

      set({
        cellVisuals: finalVisuals,
        trace: result.trace,
        currentStepIndex: result.trace.length,
        currentInspectEvent: result.trace[result.trace.length - 1] ?? null,
        searchStatus: result.pathFound ? 'completed' : 'no_path',
        nodesExplored: result.nodesExplored,
        nodesDiscovered: result.nodesDiscovered,
        pathLength: result.pathFound ? Math.max(0, result.path.length - 1) : 0,
        pathCost: result.pathCost,
        searchDurationMs: result.durationMs,
        finalPath: result.path
      });

      if (result.pathFound) {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#F0442D', '#22C55E', '#3B82F6']
        });
      }
    },

    resetSearch: () => {
      get().clearPath();
    }
  };
});
