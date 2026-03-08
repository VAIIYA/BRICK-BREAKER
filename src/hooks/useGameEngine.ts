import { useCallback, useRef, useEffect } from 'react';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PHYSICS_TIMESTEP,
    MAX_DELTA_TIME,
    INITIAL_BALL_SPEED,
    PADDLE_Y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    COLORS,
    BRICK_HP_COLORS
} from '../lib/constants';
import { useGameStore } from '../store/gameStore';
import type { GameState } from '../store/gameStore';
import { usePhysics } from './usePhysics';
import { usePowerups } from './usePowerups';
import type { Powerup } from './usePowerups';
import { useAudio } from './useAudio';
import { getLevelData } from '../lib/levels';

export interface Point { x: number; y: number; }
export interface GameObject { x: number; y: number; width: number; height: number; }

export interface Ball {
    x: number; y: number;
    dx: number; dy: number;
    radius: number;
    speed: number;
    attached: boolean;
    trail: Point[];
}

export interface Paddle extends GameObject {
    speed: number;
    color: string;
}

export interface Brick extends GameObject {
    hp: number;
    maxHp: number;
    color: string;
    type: 'NORMAL' | 'INDESTRUCTIBLE' | 'BOSS';
    powerup?: string;
}

export interface Particle extends Point {
    dx: number;
    dy: number;
    color: string;
    life: number;
    size: number;
}

export const useGameEngine = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const { gameState, setGameState, addScore, loseLife, nextLevel, level } = useGameStore();
    const { resolveWallCollisions, resolvePaddleCollision, resolveBrickCollisions } = usePhysics();
    const { spawnPowerup, updatePowerups } = usePowerups();
    const { playBrickHit, playLevelComplete, playGameOver } = useAudio();

    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);
    const accumulatorRef = useRef<number>(0);

    const paddleRef = useRef({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH });
    const ballRef = useRef<Ball>({
        x: CANVAS_WIDTH / 2,
        y: PADDLE_Y - 10,
        dx: 0,
        dy: 0,
        radius: 8,
        speed: INITIAL_BALL_SPEED,
        attached: true,
        trail: []
    });
    const bricksRef = useRef<Brick[]>([]);
    const powerupsRef = useRef<Powerup[]>([]);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const levelData = getLevelData(level);
        bricksRef.current = levelData.bricks;
        ballRef.current = {
            ...ballRef.current,
            x: paddleRef.current.x + paddleRef.current.width / 2,
            y: PADDLE_Y - 10,
            attached: true,
            dx: 0,
            dy: 0,
            trail: []
        };
        powerupsRef.current = [];
        particlesRef.current = [];
    }, [level]);

    const handleInput = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;

        let newX = mouseX - paddleRef.current.width / 2;
        newX = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.width, newX));
        paddleRef.current.x = newX;

        if (ballRef.current.attached) {
            ballRef.current.x = newX + paddleRef.current.width / 2;
        }
    }, [canvasRef]);

    const handleAction = useCallback(() => {
        if (gameState === ('START' as GameState)) {
            setGameState('PLAYING');
        }
        if (ballRef.current.attached) {
            ballRef.current.attached = false;
            ballRef.current.dx = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
            ballRef.current.dy = -INITIAL_BALL_SPEED;
        }
    }, [gameState, setGameState]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const currentWindow = window;
        currentWindow.addEventListener('mousemove', handleInput);
        currentWindow.addEventListener('mousedown', handleAction);
        return () => {
            currentWindow.removeEventListener('mousemove', handleInput);
            currentWindow.removeEventListener('mousedown', handleAction);
        };
    }, [handleInput, handleAction, canvasRef]);

    const createParticles = (x: number, y: number, color: string) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 16; i++) {
            newParticles.push({
                x,
                y,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                color,
                life: 1.0,
                size: Math.random() * 3 + 1
            });
        }
        particlesRef.current.push(...newParticles);
    };

    const update = useCallback((_dt: number) => {
        if (gameState !== ('PLAYING' as GameState)) return;

        let ball = ballRef.current;
        if (!ball.attached) {
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 8) ball.trail.shift();

            ball = resolveWallCollisions(ball);

            if (ball.y > CANVAS_HEIGHT) {
                loseLife();
                if (gameState === ('GAMEOVER' as GameState)) {
                    playGameOver();
                }
                ballRef.current = {
                    ...ball,
                    x: paddleRef.current.x + paddleRef.current.width / 2,
                    y: PADDLE_Y - 10,
                    attached: true,
                    dx: 0, dy: 0,
                    trail: []
                };
                return;
            }

            ball = resolvePaddleCollision(ball, {
                x: paddleRef.current.x,
                y: PADDLE_Y,
                width: paddleRef.current.width,
                height: PADDLE_HEIGHT,
                speed: 0,
                color: ''
            });

            const { ball: nextBall, hitBrickIndex } = resolveBrickCollisions(ball, bricksRef.current);
            ball = nextBall;

            if (hitBrickIndex !== null) {
                const brick = bricksRef.current[hitBrickIndex];
                brick.hp--;
                addScore(brick.hp === 0 ? 50 : 20);
                playBrickHit(brick.hp);
                createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color || COLORS.cyan);

                if (brick.hp <= 0) {
                    const p = spawnPowerup(brick.x, brick.y);
                    if (p) powerupsRef.current.push(p);
                }

                if (bricksRef.current.every(b => b.hp <= 0 || b.type === 'INDESTRUCTIBLE')) {
                    nextLevel();
                    playLevelComplete();
                }
            }

            ballRef.current = ball;
        }

        // Update Boss movement
        bricksRef.current.forEach(b => {
            if (b.type === 'BOSS' && b.hp > 0) {
                const speed = 2; // Fixed speed for simplicity
                const time = Date.now() / 1000;
                const range = CANVAS_WIDTH - b.width - 40;
                b.x = 20 + (Math.sin(time * speed) + 1) / 2 * range;
            }
        });

        powerupsRef.current = updatePowerups(powerupsRef.current);
        powerupsRef.current = powerupsRef.current.filter(p => {
            const hit = p.y + p.height >= PADDLE_Y &&
                p.y <= PADDLE_Y + PADDLE_HEIGHT &&
                p.x + p.width >= paddleRef.current.x &&
                p.x <= paddleRef.current.x + paddleRef.current.width;

            if (hit) {
                return false;
            }
            return true;
        });

        particlesRef.current = particlesRef.current
            .map(p => ({
                ...p,
                x: p.x + p.dx,
                y: p.y + p.dy,
                life: p.life - 0.02
            }))
            .filter(p => p.life > 0);

    }, [gameState, resolveWallCollisions, resolvePaddleCollision, resolveBrickCollisions, addScore, loseLife, nextLevel, spawnPowerup, updatePowerups, playBrickHit, playLevelComplete, playGameOver]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < CANVAS_HEIGHT; i += 4) {
            ctx.fillRect(0, i, CANVAS_WIDTH, 2);
        }

        bricksRef.current.forEach(brick => {
            if (brick.hp <= 0) return;
            const color = BRICK_HP_COLORS[brick.hp] || COLORS.silver;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        });

        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.cyan;
        ctx.fillStyle = COLORS.cyan;
        ctx.fillRect(paddleRef.current.x, PADDLE_Y, paddleRef.current.width, PADDLE_HEIGHT);

        ballRef.current.trail.forEach((p, i) => {
            const alpha = (i / ballRef.current.trail.length) * 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, ballRef.current.radius * (i / 8), 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.cyan;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
        ctx.fill();

        powerupsRef.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
            ctx.fill();
        });

        particlesRef.current.forEach(p => {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        ctx.shadowBlur = 0;
    }, [canvasRef]);

    const animate = useCallback((time: number) => {
        if (previousTimeRef.current !== undefined) {
            let deltaTime = time - previousTimeRef.current;
            if (deltaTime > MAX_DELTA_TIME) deltaTime = MAX_DELTA_TIME;
            accumulatorRef.current += deltaTime;
            while (accumulatorRef.current >= PHYSICS_TIMESTEP) {
                update(PHYSICS_TIMESTEP);
                accumulatorRef.current -= PHYSICS_TIMESTEP;
            }
            render();
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [update, render]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);

    return { paddle: paddleRef.current, ball: ballRef.current, bricks: bricksRef.current };
};
