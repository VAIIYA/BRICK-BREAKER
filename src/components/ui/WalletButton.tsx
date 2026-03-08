import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStore } from '../../store/walletStore';
import {
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
    ChevronDown,
    LogOut,
    ShieldCheck,
    ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nacl from 'tweetnacl';

const WalletButton: React.FC = () => {
    const { publicKey, signMessage, disconnect, connected } = useWallet();
    const { isVerified, setVerified, setWallet, clear, address } = useWalletStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (connected && publicKey) {
            setWallet(publicKey.toBase58());
        } else {
            clear();
        }
    }, [connected, publicKey, setWallet, clear]);

    const handleSignMessage = useCallback(async () => {
        if (!publicKey || !signMessage) return;

        try {
            const message = `Sign in to BRICK BREAKER\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);

            // Verify locally
            const verified = nacl.sign.detached.verify(
                encodedMessage,
                signature,
                publicKey.toBytes()
            );

            if (verified) {
                setVerified(true);
                sessionStorage.setItem(`siws_${publicKey.toBase58()}`, 'true');
            }
        } catch (error) {
            console.error('SIWS Error:', error);
        }
    }, [publicKey, signMessage, setVerified]);

    if (!connected) {
        return (
            <div className="neon-border-wrapper">
                <WalletMultiButton className="!bg-transparent !arcade-font !text-[10px] !h-12 !px-8 !border-none !rounded-none !transition-all hover:!bg-white/5" />
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex bg-black border border-white/10 overflow-hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-r border-white/10"
                >
                    <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-neon-cyan shadow-[0_0_8px_#00FFFF]' : 'bg-neon-magenta animate-pulse'}`} />
                    <span className="arcade-font text-[10px] text-white">
                        {address?.slice(0, 4)}...{address?.slice(-4)}
                    </span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {!isVerified && (
                    <button
                        onClick={handleSignMessage}
                        className="px-4 py-3 arcade-font text-[9px] text-neon-magenta hover:bg-neon-magenta/10 transition-colors animate-pulse"
                    >
                        VERIFY ROLE
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-[#0a1133] border border-white/10 z-50 shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <span className="arcade-font text-[8px] text-gray-500 uppercase tracking-widest">Operator Status</span>
                                {isVerified ? <ShieldCheck size={12} className="text-neon-cyan" /> : <ShieldAlert size={12} className="text-neon-magenta" />}
                            </div>

                            <button
                                onClick={() => {
                                    disconnect();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors arcade-font text-[9px] text-red-500"
                            >
                                <LogOut size={12} />
                                TERMINATE SESSION
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletButton;
