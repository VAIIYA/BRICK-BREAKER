import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy } from 'lucide-react';

const HowToPlay: React.FC = () => {
    const navigate = useNavigate();

    const controls = [
        { key: 'MOUSE', action: 'MOVE PADDLE' },
        { key: 'CLICK', action: 'LAUNCH BALL' },
        { key: 'ESC', action: 'PAUSE MISSION' }
    ];

    const objectives = [
        { title: 'DEMOLITION', desc: 'CLEAR ALL BRICKS IN SECTOR' },
        { title: 'DODGE', desc: 'PREVENT BALL FROM FALLING' },
        { title: 'COLLECT', desc: 'GRAB POWER-UPS FOR ADVANTAGE' }
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-arcade-bg">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl grid md:grid-cols-2 gap-12"
            >
                {/* Controls */}
                <div className="border border-neon-cyan/20 bg-neon-cyan/5 p-8 rounded-lg">
                    <h2 className="arcade-font text-neon-cyan text-xl mb-8 flex items-center gap-3">
                        <Target className="text-neon-cyan" /> CONTROLS
                    </h2>
                    <div className="space-y-6">
                        {controls.map((c, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                                <span className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan arcade-font text-[10px]">
                                    {c.key}
                                </span>
                                <span className="arcade-font text-[10px] text-white italic">{c.action}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Objectives */}
                <div className="border border-neon-magenta/20 bg-neon-magenta/5 p-8 rounded-lg">
                    <h2 className="arcade-font text-neon-magenta text-xl mb-8 flex items-center gap-3">
                        <Trophy className="text-neon-magenta" /> MISSION
                    </h2>
                    <div className="space-y-8">
                        {objectives.map((o, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <span className="arcade-font text-xs text-neon-magenta underline">{o.title}</span>
                                <span className="arcade-font text-[9px] text-gray-400 leading-relaxed">
                                    {o.desc}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-center mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="btn-arcade border-neon-yellow text-neon-yellow"
                    >
                        RETURN TO BASE
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default HowToPlay;
