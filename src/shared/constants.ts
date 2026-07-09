export const IPC_CHANNELS = {
  GET_CLIS: 'cli:get-all',
  GET_CLI_STATE: 'cli:get-state',
  GET_ALL_CLI_STATES: 'cli:get-all-states',
  EXECUTE_ACTION: 'cli:execute',
  CHECK_CLI_UPDATE: 'cli:check-update',
  CHECK_DEPENDENCIES: 'deps:check',
  INSTALL_DEPENDENCY: 'deps:install',
  SELECT_FOLDER: 'folder:select',
  GET_SAVED_FOLDER: 'folder:get-saved',
  SAVE_FOLDER: 'folder:save',
} as const

export const WINDOW_CONFIG = {
  /* Compact floating panel centered on screen (Raycast-like), locked to a
     5:3 landscape aspect ratio. Height is derived from width. The CLI list
     scrolls, so the window stays small instead of spanning the full height. */
  WIDTH_PCT: 0.44,
  ASPECT_W: 5,
  ASPECT_H: 3,
  MIN_WIDTH: 640,
  MAX_WIDTH: 880,
} as const

export const APP_NAME = 'CLI Launcher'
