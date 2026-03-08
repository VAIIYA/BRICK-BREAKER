import React, { useRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../lib/constants';
import { useGameEngine } from '../../hooks/useGameEngine';
import PauseMenu from './PauseMenu';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gameState } = useGameStore();

    // The hook handles the entire loop and rendering to the canvasRef
    useGameEngine(canvasRef);

    return (
        <div className="relative group">
            <div className="relative neon-border bg-black shadow-[0_0_50_rgba(0,0,0,0.8)] overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block cursor-none"
                />

                {/* Start Overlay */}
                <AnimatePresence>
                    {gameState === 'START' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10"
                        >
                            <h2 className="arcade-font text-neon-cyan text-xl mb-4 animate-pulse">READY PILOT?</h2>
                            <p className="arcade-font text-[10px] text-white">CLICK OR PRESS SPACE TO LAUNCH</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <PauseMenu />
            </div>

            {/* Decorative Border Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-cyan rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 pointer-events-none" />
        </div>
    );
};

export default GameCanvas;
