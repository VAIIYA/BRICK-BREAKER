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
    id: string;
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

export interface ActiveEffect {
    type: Powerup['type'];
    endTime: number;
}

export const useGameEngine = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
    const { gameState, setGameState, addScore, loseLife, nextLevel, level } = useGameStore();
    const { resolveWallCollisions, resolvePaddleCollision, resolveBrickCollisions } = usePhysics();
    const { spawnPowerup, updatePowerups } = usePowerups();
    const { playBrickHit, playLevelComplete, playGameOver, playPaddleHit } = useAudio();

    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);
    const accumulatorRef = useRef<number>(0);

    const paddleRef = useRef({
        x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        width: PADDLE_WIDTH,
        isSticky: false,
        hasLaser: false,
        lasersLeft: 0,
        hasShield: false
    });

    const ballsRef = useRef<Ball[]>([{
        id: Math.random().toString(36).substr(2, 9),
        x: CANVAS_WIDTH / 2,
        y: PADDLE_Y - 10,
        dx: 0,
        dy: 0,
        radius: 8,
        speed: INITIAL_BALL_SPEED,
        attached: true,
        trail: []
    }]);

    const bricksRef = useRef<Brick[]>([]);
    const powerupsRef = useRef<Powerup[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const activeEffectsRef = useRef<ActiveEffect[]>([]);

    const comboRef = useRef(0);
    const bricksDestroyedRef = useRef(0);

    useEffect(() => {
        const levelData = getLevelData(level);
        bricksRef.current = levelData.bricks;
        ballsRef.current = [{
            id: Math.random().toString(36).substr(2, 9),
            x: paddleRef.current.x + paddleRef.current.width / 2,
            y: PADDLE_Y - 10,
            attached: true,
            dx: 0,
            dy: 0,
            radius: 8,
            speed: INITIAL_BALL_SPEED * (1 + (Math.floor(bricksDestroyedRef.current / 5) * 0.02)),
            trail: []
        }];
        powerupsRef.current = [];
        particlesRef.current = [];
        comboRef.current = 0;
    }, [level]);

    const handleInput = useCallback((e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }

        const mouseX = clientX - rect.left;

        let newX = mouseX - paddleRef.current.width / 2;
        newX = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.width, newX));
        paddleRef.current.x = newX;

        ballsRef.current.forEach(ball => {
            if (ball.attached) {
                ball.x = newX + paddleRef.current.width / 2;
            }
        });
    }, [canvasRef]);

    const handleAction = useCallback(() => {
        if (gameState === ('START' as GameState)) {
            setGameState('PLAYING');
        }

        let launched = false;
        ballsRef.current.forEach(ball => {
            if (ball.attached) {
                ball.attached = false;
                ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1) * 0.5;
                ball.dy = -ball.speed;
                launched = true;
            }
        });

        if (!launched && paddleRef.current.hasLaser && paddleRef.current.lasersLeft > 0) {
            // Shoot laser
            paddleRef.current.lasersLeft--;
            // Logic for laser particle or ray...
        }
    }, [gameState, setGameState]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        window.addEventListener('mousemove', handleInput);
        window.addEventListener('touchmove', handleInput, { passive: false });
        window.addEventListener('mousedown', handleAction);
        window.addEventListener('touchstart', handleAction);

        return () => {
            window.removeEventListener('mousemove', handleInput);
            window.removeEventListener('touchmove', handleInput);
            window.removeEventListener('mousedown', handleAction);
            window.removeEventListener('touchstart', handleAction);
        };
    }, [handleInput, handleAction, canvasRef]);

    const createParticles = (x: number, y: number, color: string) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 16; i++) {
            newParticles.push({
                x,
                y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                color,
                life: 1.0,
                size: Math.random() * 3 + 1
            });
        }
        particlesRef.current.push(...newParticles);
    };

    const applyPowerup = (type: Powerup['type']) => {
        const now = Date.now();
        switch (type) {
            case 'MULTI-BALL':
                const currentBall = ballsRef.current[0];
                if (currentBall) {
                    for (let i = 0; i < 2; i++) {
                        ballsRef.current.push({
                            ...currentBall,
                            id: Math.random().toString(36).substr(2, 9),
                            dx: currentBall.dx + (Math.random() - 0.5) * 2,
                            dy: -Math.abs(currentBall.dy),
                            attached: false
                        });
                    }
                }
                break;
            case 'WIDE':
                paddleRef.current.width = PADDLE_WIDTH * 1.5;
                activeEffectsRef.current.push({ type: 'WIDE', endTime: now + 10000 });
                break;
            case 'NARROW':
                paddleRef.current.width = PADDLE_WIDTH * 0.7;
                activeEffectsRef.current.push({ type: 'NARROW', endTime: now + 8000 });
                break;
            case 'STICKY':
                paddleRef.current.isSticky = true;
                activeEffectsRef.current.push({ type: 'STICKY', endTime: now + 15000 });
                break;
            case 'SPEED-UP':
                ballsRef.current.forEach(b => b.speed *= 1.2);
                activeEffectsRef.current.push({ type: 'SPEED-UP', endTime: now + 8000 });
                break;
            case 'LASER':
                paddleRef.current.hasLaser = true;
                paddleRef.current.lasersLeft = 5;
                activeEffectsRef.current.push({ type: 'LASER', endTime: now + 10000 });
                break;
            case 'SHIELD':
                paddleRef.current.hasShield = true;
                activeEffectsRef.current.push({ type: 'SHIELD', endTime: now + 20000 });
                break;
            case 'POINTSx2':
                activeEffectsRef.current.push({ type: 'POINTSx2', endTime: now + 12000 });
                break;
        }
    };

    const update = useCallback((_dt: number) => {
        if (gameState !== ('PLAYING' as GameState)) return;

        const now = Date.now();
        // Update active effects timers
        activeEffectsRef.current = activeEffectsRef.current.filter(effect => {
            if (now > effect.endTime) {
                // Revert effects
                if (effect.type === 'WIDE' || effect.type === 'NARROW') paddleRef.current.width = PADDLE_WIDTH;
                if (effect.type === 'STICKY') paddleRef.current.isSticky = false;
                if (effect.type === 'LASER') paddleRef.current.hasLaser = false;
                if (effect.type === 'SHIELD') paddleRef.current.hasShield = false;
                return false;
            }
            return true;
        });

        // Update Balls
        ballsRef.current.forEach((ball, index) => {
            if (!ball.attached) {
                ball.trail.push({ x: ball.x, y: ball.y });
                if (ball.trail.length > 8) ball.trail.shift();

                const nextBall = resolveWallCollisions(ball);
                ball.x = nextBall.x;
                ball.y = nextBall.y;
                ball.dx = nextBall.dx;
                ball.dy = nextBall.dy;

                if (ball.y > CANVAS_HEIGHT) {
                    if (paddleRef.current.hasShield) {
                        ball.dy = -Math.abs(ball.dy);
                        paddleRef.current.hasShield = false;
                        activeEffectsRef.current = activeEffectsRef.current.filter(e => e.type !== 'SHIELD');
                        playPaddleHit();
                    } else {
                        ballsRef.current.splice(index, 1);
                        if (ballsRef.current.length === 0) {
                            loseLife();
                            comboRef.current = 0;
                            if (gameState === ('GAMEOVER' as GameState)) {
                                playGameOver();
                            }
                            ballsRef.current = [{
                                id: Math.random().toString(36).substr(2, 9),
                                x: paddleRef.current.x + paddleRef.current.width / 2,
                                y: PADDLE_Y - 10,
                                attached: true,
                                dx: 0, dy: 0,
                                radius: 8,
                                speed: INITIAL_BALL_SPEED * (1 + (Math.floor(bricksDestroyedRef.current / 5) * 0.02)),
                                trail: []
                            }];
                        }
                    }
                    return;
                }

                const hitPaddle = resolvePaddleCollision(ball, {
                    x: paddleRef.current.x,
                    y: PADDLE_Y,
                    width: paddleRef.current.width,
                    height: PADDLE_HEIGHT,
                    speed: ball.speed,
                    color: ''
                });

                if (hitPaddle.y < ball.y) { // Collision occurred
                    ball.x = hitPaddle.x;
                    ball.y = hitPaddle.y;
                    ball.dx = hitPaddle.dx;
                    ball.dy = hitPaddle.dy;
                    playPaddleHit();
                    comboRef.current = 0; // Reset combo on paddle hit (as per typical arcade rules, or keep it?)

                    if (paddleRef.current.isSticky) {
                        ball.attached = true;
                        ball.dx = 0;
                        ball.dy = 0;
                    }
                }

                const { ball: collidedBall, hitBrickIndex } = resolveBrickCollisions(ball, bricksRef.current);
                ball.dx = collidedBall.dx;
                ball.dy = collidedBall.dy;

                if (hitBrickIndex !== null) {
                    const brick = bricksRef.current[hitBrickIndex];
                    if (brick.type !== 'INDESTRUCTIBLE') {
                        brick.hp--;
                        comboRef.current += 0.5;
                        bricksDestroyedRef.current++;

                        // Update speed every 5 bricks
                        if (bricksDestroyedRef.current % 5 === 0) {
                            ballsRef.current.forEach(b => b.speed *= 1.02);
                        }

                        const pointsMap = { NORMAL: 10, BOSS: 200, INDESTRUCTIBLE: 0 };
                        let basePoints = pointsMap[brick.type] || 10;
                        if (brick.type === 'NORMAL') basePoints = brick.maxHp * 10;

                        const multiplier = activeEffectsRef.current.some(e => e.type === 'POINTSx2') ? 2 : 1;
                        addScore(Math.floor(basePoints * (1 + Math.max(0, comboRef.current - 0.5)) * multiplier));

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
                    } else {
                        playPaddleHit(); // Clink sound
                    }
                }
            }
        });

        // Update Boss movement
        bricksRef.current.forEach(b => {
            if (b.type === 'BOSS' && b.hp > 0) {
                const speed = 2;
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
                applyPowerup(p.type);
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

    }, [gameState, resolveWallCollisions, resolvePaddleCollision, resolveBrickCollisions, addScore, loseLife, nextLevel, spawnPowerup, updatePowerups, playBrickHit, playLevelComplete, playGameOver, playPaddleHit]);

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
            const color = brick.type === 'INDESTRUCTIBLE' ? '#C0C0C0' : (BRICK_HP_COLORS[brick.hp] || COLORS.silver);
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

            if (brick.hp < brick.maxHp && brick.type !== 'INDESTRUCTIBLE') {
                ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(brick.x + 2, brick.y + 2);
                ctx.lineTo(brick.x + brick.width - 2, brick.y + brick.height - 2);
                ctx.stroke();
            }
        });

        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.cyan;
        ctx.fillStyle = COLORS.cyan;
        ctx.fillRect(paddleRef.current.x, PADDLE_Y, paddleRef.current.width, PADDLE_HEIGHT);

        if (paddleRef.current.hasShield) {
            ctx.strokeStyle = COLORS.magenta;
            ctx.lineWidth = 3;
            ctx.strokeRect(0, CANVAS_HEIGHT - 5, CANVAS_WIDTH, 5);
        }

        ballsRef.current.forEach(ball => {
            ball.trail.forEach((p, i) => {
                const alpha = (i / ball.trail.length) * 0.4;
                ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, ball.radius * (i / 8), 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.shadowBlur = 10;
            ctx.shadowColor = COLORS.cyan;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        powerupsRef.current.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
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

    return { paddle: paddleRef.current, balls: ballsRef.current, bricks: bricksRef.current, activeEffects: activeEffectsRef.current };
};
