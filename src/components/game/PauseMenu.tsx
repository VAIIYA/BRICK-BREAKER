import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, Home } from 'lucide-react';

const PauseMenu: React.FC = () => {
    const { gameState, setGameState, resetGame } = useGameStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (gameState === 'PLAYING') setGameState('PAUSED');
                else if (gameState === 'PAUSED') setGameState('PLAYING');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, setGameState]);

    if (gameState !== 'PAUSED') return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a1133] border-2 border-neon-yellow p-10 flex flex-col gap-6 shadow-[0_0_30px_rgba(255,230,0,0.3)]"
            >
                <h2 className="arcade-font text-neon-yellow text-2xl mb-4 text-center">SYSTEM PAUSED</h2>

                <button
                    onClick={() => setGameState('PLAYING')}
                    className="btn-arcade flex items-center justify-between"
                >
                    <span>RESUME MISSION</span>
                    <Play size={16} />
                </button>

                <button
                    onClick={() => {
                        resetGame();
                        setGameState('PLAYING');
                    }}
                    className="btn-arcade border-neon-cyan text-neon-cyan flex items-center justify-between"
                >
                    <span>RESTART</span>
                    <RotateCcw size={16} />
                </button>

                <button
                    onClick={() => {
                        setGameState('START');
                        navigate('/');
                    }}
                    className="btn-arcade border-red-500 text-red-500 flex items-center justify-between"
                >
                    <span>ABORT MISSION</span>
                    <Home size={16} />
                </button>
            </motion.div>
        </div>
    );
};

export default PauseMenu;
