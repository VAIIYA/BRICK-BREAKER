import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useWalletStore } from '../store/walletStore';
import { getSupabase } from '../lib/supabase';
import { Trophy, RotateCcw, Home, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const GameOver: React.FC = () => {
    const { score, level, resetGame, highScore, updateHighScore } = useGameStore();
    const { address, alias } = useWalletStore();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (score > highScore) {
            updateHighScore(score);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00FFFF', '#FF00FF', '#FFE600']
            });
        }
    }, [score, highScore, updateHighScore]);

    const handleSubmitScore = async () => {
        if (!address || !alias || isSubmitting || isSubmitted) return;

        setIsSubmitting(true);
        try {
            const supabaseInstance = getSupabase(address);
            const { error } = await supabaseInstance
                .from('scores')
                .insert({
                    wallet: address,
                    alias: alias,
                    score: score,
                    level: level,
                    timestamp: new Date().toISOString()
                });

            if (error) throw error;
            setIsSubmitted(true);
        } catch (err) {
            console.error('Error submitting score:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-arcade-bg overflow-hidden">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md bg-[#0a1133] border-2 border-neon-magenta p-10 shadow-[0_0_30px_rgba(255,0,255,0.3)] text-center"
            >
                <h1 className="arcade-font text-neon-magenta text-3xl mb-12 animate-pulse">MISSION OVER</h1>

                <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="arcade-font text-[10px] text-gray-400">FINAL SCORE</span>
                        <span className="arcade-font text-white">{score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="arcade-font text-[10px] text-gray-400">SECTOR REACHED</span>
                        <span className="arcade-font text-neon-yellow">LVL {level}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="arcade-font text-[10px] text-gray-400">PERSONAL BEST</span>
                        <span className="arcade-font text-neon-cyan">{highScore.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        disabled={isSubmitting || isSubmitted}
                        onClick={handleSubmitScore}
                        className={`btn-arcade flex items-center justify-center gap-2 ${isSubmitted ? 'border-green-500 text-green-500' : 'border-neon-cyan text-neon-cyan'}`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Trophy size={16} />}
                        <span>{isSubmitted ? 'SCORE TRANSMITTED' : 'SUBMIT TO LEADERBOARD'}</span>
                    </button>

                    <button
                        onClick={() => {
                            resetGame();
                            navigate('/game');
                        }}
                        className="btn-arcade flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={16} />
                        <span>RETRY MISSION</span>
                    </button>

                    <button
                        onClick={() => {
                            resetGame();
                            navigate('/');
                        }}
                        className="btn-arcade border-gray-500 text-gray-500 hover:bg-white/5 flex items-center justify-center gap-2"
                    >
                        <Home size={16} />
                        <span>ABORT TO BASE</span>
                    </button>
                </div>
            </motion.div>

            {score > highScore && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 arcade-font text-neon-yellow text-xs"
                >
                    NEW SECTOR RECORD ESTABLISHED!
                </motion.div>
            )}
        </div>
    );
};

export default GameOver;
