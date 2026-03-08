export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 20;
export const PADDLE_Y = CANVAS_HEIGHT - 40;
export const PADDLE_SPEED = 8;

export const BALL_RADIUS = 8;
export const INITIAL_BALL_SPEED = 5;
export const MAX_BALL_SPEED = 12;

export const BRICK_GAP = 5;
export const BRICK_OFFSET_TOP = 60;
export const BRICK_OFFSET_LEFT = 20;

export const BRICK_COLS = 12;
export const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_GAP * (BRICK_COLS - 1))) / BRICK_COLS;
export const BRICK_HEIGHT = 25;
export const BRICK_PADDING = 10;

export const POWERUP_CHANCE = 0.15;
export const POWERUP_FALL_SPEED = 2;
export const POWERUP_SIZE = 30;

export const COLORS = {
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    yellow: '#FFE600',
    green: '#00FF88',
    red: '#FF4444',
    silver: '#C0C0C0',
    white: '#FFFFFF',
    bg: '#050714',
};

export const BRICK_HP_COLORS: Record<number, string> = {
    1: COLORS.cyan,
    2: COLORS.yellow,
    3: COLORS.red,
};

export const PHYSICS_FPS = 60;
export const PHYSICS_TIMESTEP = 1000 / PHYSICS_FPS;
export const MAX_DELTA_TIME = 50;
