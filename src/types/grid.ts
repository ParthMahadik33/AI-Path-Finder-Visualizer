export type CellVisualState =
  | 'empty'
  | 'wall'
  | 'weight'
  | 'start'
  | 'dest'
  | 'frontier'
  | 'explored'
  | 'path';

export interface GridDimensions {
  rows: number;
  cols: number;
}

export type PlaybackSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export type SearchStatus = 'idle' | 'searching' | 'paused' | 'completed' | 'no_path';

export type DragMode =
  | 'none'
  | 'draw_wall'
  | 'erase_wall'
  | 'draw_weight'
  | 'erase_weight'
  | 'move_start'
  | 'move_dest';
