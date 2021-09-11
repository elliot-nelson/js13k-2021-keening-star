// Constants
//
// Where possible, global values are all kept here in spot for easy tweaking.
// Don't worry about constant length -- our terser configuration in the build step
// is going to mangle all of our constants into tiny variable names.

// The "screen area", in ASCII characters.
export const SCREEN_WIDTH = 80;
export const SCREEN_HEIGHT = 24;

// The size in pixels of each character in our monospaced font.
export const FONT_WIDTH = 8;
export const FONT_HEIGHT = 16;

// The number of rows/columns of characters in the font sheet.
export const FONT_COLS = 16;
export const FONT_ROWS = 16;

// Screen scaling -- currently not used.
export const SCREEN_SCALE = 1;

// Playable area in pixels. Note that actual on-screen dimensions may differ to maintain
// aspect ratio -- see `Viewport.width` & `Viewport.height`.
//
// We add a little bit of padding to make sure we don't draw a character right on top of
// of the edge of the user's browser window.
export const GAME_WIDTH = (SCREEN_WIDTH + 1) * FONT_WIDTH * SCREEN_SCALE;
export const GAME_HEIGHT = (SCREEN_HEIGHT + 1) * FONT_HEIGHT * SCREEN_SCALE;

// Global frames per second
export const FPS = 60;

// How many frames does a turn take? This game is essentially turn-based (enemies don't
// move unless the player moves). So this value really boils down to how fast the player
// moves if they hold down an arrow key.
//
// 12 frames = 5 tiles per second.
export const TURN_FRAMES = 2;

// The number of lines of recent history to show to the player, in the normal (closed)
// case and the open (reviewing history) case.
export const LOG_CLOSED_LINES = 3;
export const LOG_OPEN_LINES = 15;

// Horizontal column for the divider between map and status area.
export const STATUS_COL = 64;

// Crit
export const COMBAT_WHIFF = 1;
export const COMBAT_HIT = 2;
export const COMBAT_CRIT = 3;
export const COMBAT_CRIT_MULTIPLIER = 1.5;

// Object types
export const TYPE_DOOR = 2;
export const TYPE_HIDDEN = 3;
export const TYPE_EXAMINE_ONLY = 4;

// Screen flickers
export const FLICKER_FRAME_1 = 169;
export const FLICKER_FRAME_2 = 221;
