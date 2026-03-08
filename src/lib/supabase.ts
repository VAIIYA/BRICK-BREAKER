import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Leaderboard and aliases will not function correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        headers: {
            'x-wallet-address': 'initial' // Will be updated dynamically via RLS patterns if needed
        }
    }
});

// Helper to get supabase with dynamic wallet header
export const getSupabase = (walletAddress?: string) => {
    if (!walletAddress) return supabase;

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                'x-wallet-address': walletAddress
            }
        }
    });
};
