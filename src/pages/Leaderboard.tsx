import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react';

interface ScoreEntry {
    alias: string;
    score: number;
    level: number;
    wallet: string;
}

const Leaderboard: React.FC = () => {
    const navigate = useNavigate();
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const { data, error } = await supabase
                    .from('scores')
                    .select('alias, score, level, wallet')
                    .order('score', { ascending: false })
                    .limit(50);

                if (error) throw error;
                setScores(data || []);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScores();
    }, []);

    const truncateWallet = (wallet: string) => {
        return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <button
                    onClick={() => navigate('/')}
                    className="arcade-font text-[10px] text-neon-cyan hover:underline mb-8 flex items-center gap-2"
                >
                    <ArrowLeft size={10} /> RETURN TO BASE
                </button>

                <div className="text-center mb-12">
                    <Trophy className="w-12 h-12 text-neon-yellow mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,230,0,0.5)]" />
                    <h1 className="arcade-font text-2xl text-neon-yellow">GLOBAL COMMANDERS</h1>
                </div>

                <div className="border border-neon-cyan/20 bg-neon-cyan/5 p-1 min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="arcade-font text-[10px] text-neon-cyan border-b border-white/10">
                                <th className="p-4">RANK</th>
                                <th className="p-4">CALLSIGN</th>
                                <th className="p-4">LEVEL</th>
                                <th className="p-4 text-right">SCORE</th>
                            </tr>
                        </thead>
                        <tbody className="arcade-font text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-500 animate-pulse">
                                        <Loader2 className="animate-spin mx-auto mb-2" />
                                        SYNCHRONIZING UPLINK...
                                    </td>
                                </tr>
                            ) : scores.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-500">
                                        NO COMMAND DATA FOUND
                                    </td>
                                </tr>
                            ) : (
                                scores.map((s, i) => (
                                    <tr key={i} className="hover:bg-white/5 border-b border-white/5 transition-colors">
                                        <td className="p-4 text-gray-500">#{i + 1}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{s.alias}</span>
                                                <span className="text-[8px] opacity-40">{truncateWallet(s.wallet)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-neon-magenta">{s.level}</td>
                                        <td className="p-4 text-right text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                                            {s.score.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Leaderboard;
