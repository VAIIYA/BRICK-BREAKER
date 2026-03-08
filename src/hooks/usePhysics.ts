import { useCallback } from 'react';
import {
    CANVAS_WIDTH,
} from '../lib/constants';
import type { Ball, Paddle, Brick } from './useGameEngine';

export const usePhysics = () => {
    const resolveWallCollisions = useCallback((ball: Ball): Ball => {
        let { x, y, dx, dy, radius } = ball;

        // Bounds check
        if (x + dx > CANVAS_WIDTH - radius || x + dx < radius) {
            dx = -dx;
        }
        if (y + dy < radius) {
            dy = -dy;
        }

        return { ...ball, x: x + dx, y: y + dy, dx, dy };
    }, []);

    const resolvePaddleCollision = useCallback((ball: Ball, paddle: Paddle): Ball => {
        let { x, y, dx, dy, radius, speed } = ball;

        // Check if ball hits paddle top
        if (
            y + radius >= paddle.y &&
            y - radius <= paddle.y + paddle.height &&
            x >= paddle.x &&
            x <= paddle.x + paddle.width
        ) {
            // Calculate hit position relative to paddle center (-0.5 to 0.5)
            const hitPos = (x - (paddle.x + paddle.width / 2)) / paddle.width;

            // Reflect angle based on hit position
            const maxAngle = Math.PI / 3; // 60 degrees
            const angle = hitPos * maxAngle;

            dx = Math.sin(angle) * speed;
            dy = -Math.cos(angle) * speed;

            // Move ball out of paddle to prevent sticking
            y = paddle.y - radius;
        }

        return { ...ball, x, y, dx, dy };
    }, []);

    const resolveBrickCollisions = useCallback((ball: Ball, bricks: Brick[]): { ball: Ball, hitBrickIndex: number | null } => {
        let { x, y, dx, dy, radius } = ball;
        let hitBrickIndex: number | null = null;

        for (let i = 0; i < bricks.length; i++) {
            const b = bricks[i];
            if (b.hp <= 0) continue;

            if (
                x + radius > b.x &&
                x - radius < b.x + b.width &&
                y + radius > b.y &&
                y - radius < b.y + b.height
            ) {
                const prevX = x - dx;
                // Check if hit horizontal or vertical
                if (prevX <= b.x || prevX >= b.x + b.width) {
                    dx = -dx;
                } else {
                    dy = -dy;
                }

                hitBrickIndex = i;
                break;
            }
        }

        return { ball: { ...ball, dx, dy }, hitBrickIndex };
    }, []);

    return { resolveWallCollisions, resolvePaddleCollision, resolveBrickCollisions };
};
