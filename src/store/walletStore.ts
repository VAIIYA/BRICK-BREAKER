import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletStore {
    address: string | null;
    shortAddress: string | null;
    isVerified: boolean;
    alias: string | null;

    setWallet: (address: string | null) => void;
    setVerified: (isVerified: boolean) => void;
    setAlias: (alias: string | null) => void;
    clear: () => void;
}

export const useWalletStore = create<WalletStore>()(
    persist(
        (set) => ({
            address: null,
            shortAddress: null,
            isVerified: false,
            alias: null,

            setWallet: (address) => set({
                address,
                shortAddress: address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null,
                isVerified: false // Reset verification on wallet change
            }),
            setVerified: (isVerified) => set({ isVerified }),
            setAlias: (alias) => set({ alias }),
            clear: () => set({
                address: null,
                shortAddress: null,
                isVerified: false,
                alias: null
            }),
        }),
        {
            name: 'brick-breaker-wallet',
            partialize: (state) => ({ alias: state.alias }),
        }
    )
);
