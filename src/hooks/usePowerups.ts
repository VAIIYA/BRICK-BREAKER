import { useState, useCallback } from 'react';
import { POWERUP_CHANCE, POWERUP_FALL_SPEED, POWERUP_SIZE } from '../lib/constants';
import type { GameObject } from './useGameEngine';

export interface Powerup extends GameObject {
    type: 'MULTI-BALL' | 'WIDE' | 'NARROW' | 'STICKY' | 'SPEED-UP' | 'LASER' | 'SHIELD' | 'POINTSx2';
    color: string;
}

export const usePowerups = () => {
    const [activePowerups] = useState<Powerup[]>([]);

    const spawnPowerup = useCallback((x: number, y: number): Powerup | null => {
        if (Math.random() > POWERUP_CHANCE) return null;

        const types: Powerup['type'][] = [
            'MULTI-BALL', 'WIDE', 'NARROW', 'STICKY', 'SPEED-UP', 'LASER', 'SHIELD', 'POINTSx2'
        ];
        const type = types[Math.floor(Math.random() * types.length)];

        // Assign colors based on type
        const colors: Record<Powerup['type'], string> = {
            'MULTI-BALL': '#3b82f6', // blue
            'WIDE': '#22c55e',      // green
            'NARROW': '#ef4444',    // red
            'STICKY': '#eab308',    // yellow
            'SPEED-UP': '#f97316',  // orange
            'LASER': '#a855f7',     // purple
            'SHIELD': '#06b6d4',    // cyan
            'POINTSx2': '#ec4899'   // pink
        };

        return {
            x,
            y,
            width: POWERUP_SIZE,
            height: POWERUP_SIZE,
            type,
            color: colors[type]
        };
    }, []);

    const updatePowerups = useCallback((powerups: Powerup[]): Powerup[] => {
        return powerups
            .map(p => ({ ...p, y: p.y + POWERUP_FALL_SPEED }))
            .filter(p => p.y < 800); // Filter out powerups that fall off screen
    }, []);

    return { activePowerups, spawnPowerup, updatePowerups };
};
