import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'LEVEL_COMPLETED';

interface GameStore {
    score: number;
    level: number;
    lives: number;
    gameState: GameState;
    highScore: number;

    setGameState: (state: GameState) => void;
    addScore: (points: number) => void;
    loseLife: () => void;
    nextLevel: () => void;
    resetGame: () => void;
    updateHighScore: (score: number) => void;
}

export const useGameStore = create<GameStore>()(
    persist(
        (set) => ({
            score: 0,
            level: 1,
            lives: 3,
            gameState: 'START',
            highScore: 0,

            setGameState: (gameState) => set({ gameState }),
            addScore: (points) => set((state) => ({ score: state.score + points })),
            loseLife: () => set((state) => ({
                lives: Math.max(0, state.lives - 1),
                gameState: state.lives <= 1 ? 'GAMEOVER' : state.gameState
            })),
            nextLevel: () => set((state) => ({ level: state.level + 1, gameState: 'LEVEL_COMPLETED' })),
            resetGame: () => set({ score: 0, level: 1, lives: 3, gameState: 'PLAYING' }),
            updateHighScore: (score) => set((state) => ({
                highScore: Math.max(state.highScore, score)
            })),
        }),
        {
            name: 'brick-breaker-storage',
            partialize: (state) => ({ highScore: state.highScore }),
        }
    )
);
