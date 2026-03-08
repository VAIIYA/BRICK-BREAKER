import * as Tone from 'tone';
import { useCallback, useEffect, useRef } from 'react';

export const useAudio = () => {
    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        // Only initialize if context is allowed (will resume on first click)
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();

        return () => {
            synthRef.current?.dispose();
        };
    }, []);

    const playBrickHit = useCallback((hp: number) => {
        if (Tone.getContext().state !== 'running') Tone.start();
        const frequencies = [440, 523.25, 659.25, 880]; // A4, C5, E5, A5
        const freq = frequencies[Math.min(hp, 3)];
        synthRef.current?.triggerAttackRelease(freq, '16n');
    }, []);

    const playPaddleHit = useCallback(() => {
        if (Tone.getContext().state !== 'running') Tone.start();
        const noise = new Tone.NoiseSynth({
            envelope: { attack: 0.001, decay: 0.05, sustain: 0 }
        }).toDestination();
        noise.triggerAttackRelease('16n');
    }, []);

    const playLevelComplete = useCallback(() => {
        if (Tone.getContext().state !== 'running') Tone.start();
        const now = Tone.now();
        synthRef.current?.triggerAttackRelease("C4", "8n", now);
        synthRef.current?.triggerAttackRelease("E4", "8n", now + 0.1);
        synthRef.current?.triggerAttackRelease("G4", "8n", now + 0.2);
        synthRef.current?.triggerAttackRelease("C5", "4n", now + 0.3);
    }, []);

    const playGameOver = useCallback(() => {
        if (Tone.getContext().state !== 'running') Tone.start();
        const now = Tone.now();
        synthRef.current?.triggerAttackRelease("C3", "4n", now);
        synthRef.current?.triggerAttackRelease("Ab2", "4n", now + 0.2);
        synthRef.current?.triggerAttackRelease("F2", "2n", now + 0.4);
    }, []);

    return {
        playBrickHit,
        playPaddleHit,
        playLevelComplete,
        playGameOver
    };
};
