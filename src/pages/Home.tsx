import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStore } from '../store/walletStore';
import { supabase } from '../lib/supabase';
import WalletButton from '../components/ui/WalletButton';
import { Zap, Trophy, HelpCircle, Loader2 } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { publicKey } = useWallet();
    const { isVerified, setAlias, address } = useWalletStore();
    const [showAliasModal, setShowAliasModal] = useState(false);
    const [newAlias, setNewAlias] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (isVerified && address) {
            const checkAlias = async () => {
                const { data, error } = await supabase
                    .from('players')
                    .select('alias')
                    .eq('wallet', address)
                    .single();

                if (error || !data) {
                    setShowAliasModal(true);
                } else if (data.alias) {
                    setAlias(data.alias);
                }
            };
            checkAlias();
        }
    }, [isVerified, address, setAlias]);

    const handleAliasSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAlias.trim() || !address) return;

        setIsChecking(true);
        try {
            const { error } = await supabase
                .from('players')
                .insert({ wallet: address, alias: newAlias.trim() });

            if (error) throw error;

            setAlias(newAlias.trim());
            setShowAliasModal(false);
        } catch (err) {
            console.error('Error saving alias:', err);
            alert('Alias taken or error occurred.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--neon-bg)_0%,_#000_100%)] opacity-50" />
            <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10" />

            {/* Title Section */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-10 text-center mb-16"
            >
                <div className="inline-block relative">
                    <h1 className="arcade-font text-5xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mb-2 italic tracking-tighter">
                        BRICK
                        <span className="block text-neon-magenta drop-shadow-[0_0_15px_rgba(255,0,255,0.8)]">BREAKER</span>
                    </h1>
                    <div className="absolute -right-4 -top-4 w-12 h-12 bg-neon-yellow rounded-full blur-xl opacity-50 animate-pulse" />
                </div>
                <p className="arcade-font text-[10px] text-neon-cyan mt-4 tracking-[0.2em]">IDENTITY SECURED BY SOLANA</p>
            </motion.div>

            {/* Main Menu */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="z-10 flex flex-col gap-6 w-full max-w-xs"
            >
                {!publicKey ? (
                    <div className="text-center space-y-4">
                        <p className="arcade-font text-[8px] text-gray-500 mb-4 px-4 leading-relaxed">
                            PLEASE CONNECT WALLET TO AUTHORIZE MISSION PARAMETERS
                        </p>
                        <WalletButton />
                    </div>
                ) : !isVerified ? (
                    <div className="text-center space-y-4">
                        <p className="arcade-font text-[8px] text-neon-magenta mb-4">
                            PENDING SIWS AUTHORIZATION...
                        </p>
                        <WalletButton />
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/game')}
                            className="btn-arcade flex items-center justify-between group"
                        >
                            <span className="flex items-center gap-3">
                                <Zap className="w-4 h-4 group-hover:animate-bounce" />
                                START MISSION
                            </span>
                            <span className="text-[10px] opacity-50">GO</span>
                        </button>

                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="btn-arcade border-neon-magenta text-neon-magenta flex items-center justify-between group"
                        >
                            <span className="flex items-center gap-3">
                                <Trophy className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                COMMANDERS
                            </span>
                            <span className="text-[10px] opacity-50">TOP</span>
                        </button>

                        <button
                            onClick={() => navigate('/how-to-play')}
                            className="btn-arcade border-neon-yellow text-neon-yellow flex items-center justify-between group"
                        >
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-4 h-4" />
                                MANUAL
                            </span>
                            <span className="text-[10px] opacity-50">INFO</span>
                        </button>

                        <div className="mt-8">
                            <WalletButton />
                        </div>
                    </>
                )}
            </motion.div>

            {/* Alias Modal */}
            <AnimatePresence>
                {showAliasModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-black border-2 border-neon-cyan p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,255,255,0.3)]"
                        >
                            <h2 className="arcade-font text-white text-lg mb-4">REGISTRY REQUIRED</h2>
                            <p className="arcade-font text-[9px] text-gray-400 mb-8 leading-relaxed">
                                ENTER YOUR COMBAT CALLSIGN. ONCE REGISTERED, IT WILL BE LINKED TO YOUR WALLET ADDRESS PERMANENTLY.
                            </p>
                            <form onSubmit={handleAliasSubmit} className="space-y-6">
                                <input
                                    type="text"
                                    maxLength={12}
                                    value={newAlias}
                                    onChange={(e) => setNewAlias(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                                    placeholder="CALLSIGN_01"
                                    className="w-full bg-white/5 border-b border-neon-cyan p-2 arcade-font text-sm text-neon-cyan outline-none focus:bg-white/10 transition-colors uppercase"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newAlias.trim() || isChecking}
                                    className="btn-arcade w-full flex items-center justify-center gap-3"
                                >
                                    {isChecking ? <Loader2 className="animate-spin" /> : 'REGISTER PILOT'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
