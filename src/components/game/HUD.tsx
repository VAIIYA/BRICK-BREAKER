import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useWalletStore } from '../../store/walletStore';
import { Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HUDProps {
    activeEffects?: { type: string; endTime: number }[];
}

const HeartIcon = ({ active }: { active: boolean }) => (
    <motion.div
        animate={{
            scale: active ? 1 : 0.8,
            opacity: active ? 1 : 0.2
        }}
        className={`transition-all duration-500`}
    >
        <Heart
            size={18}
            className={active ? "fill-neon-magenta text-neon-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" : "text-gray-800"}
        />
    </motion.div>
);

const HUD: React.FC<HUDProps> = ({ activeEffects = [] }) => {
    const { score, level, lives } = useGameStore();
    const { shortAddress, alias } = useWalletStore();

    return (
        <div className="fixed top-0 left-0 w-full p-4 flex flex-col pointer-events-none z-30 select-none">
            <div className="flex justify-between items-start w-full">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-neon-yellow" />
                        <span className="arcade-font text-[10px] text-gray-400">SCORE</span>
                    </div>
                    <div className="arcade-font text-lg text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                        {score.toLocaleString().padStart(7, '0')}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="arcade-font text-[10px] text-neon-yellow">SECTOR {level}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                    <div className="arcade-font text-[9px] text-neon-cyan mb-1">
                        {alias || 'UNKNOWN PILOT'} <span className="opacity-40 ml-2">{shortAddress}</span>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <HeartIcon
                                key={i}
                                active={i < lives}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Powerups Row */}
            <div className="mt-4 flex gap-4 overflow-hidden h-12">
                <AnimatePresence>
                    {activeEffects.map((effect, idx) => (
                        <motion.div
                            key={`${effect.type}-${idx}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className="arcade-font text-[8px] text-white px-2 py-1 border border-white/20 bg-white/5">
                                {effect.type}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HUD;
