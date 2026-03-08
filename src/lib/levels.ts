import type { Brick } from '../hooks/useGameEngine';
import {
    BRICK_WIDTH,
    BRICK_HEIGHT,
    BRICK_GAP,
    BRICK_OFFSET_TOP,
    BRICK_OFFSET_LEFT,
    BRICK_COLS
} from './constants';

export interface LevelData {
    id: number;
    name: string;
    bricks: Brick[];
}

const createBrick = (r: number, c: number, hp: number = 1, type: 'NORMAL' | 'INDESTRUCTIBLE' | 'BOSS' = 'NORMAL'): Brick => ({
    x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_GAP),
    y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_GAP),
    width: BRICK_WIDTH,
    height: BRICK_HEIGHT,
    hp,
    maxHp: hp,
    color: '',
    type
});

export const getLevelData = (levelId: number): LevelData => {
    const bricks: Brick[] = [];

    switch (levelId) {
        case 1:
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < BRICK_COLS; c++) {
                    bricks.push(createBrick(r, c, 1));
                }
            }
            return { id: 1, name: 'GRID', bricks };
        case 5:
            bricks.push({ ...createBrick(2, 4, 10, 'BOSS'), width: BRICK_WIDTH * 4, height: BRICK_HEIGHT * 2 });
            return { id: 5, name: 'GUARDIAN', bricks };
        default:
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < BRICK_COLS; c++) {
                    bricks.push(createBrick(r, c, 1));
                }
            }
            return { id: levelId, name: 'SECTOR', bricks };
    }
};
