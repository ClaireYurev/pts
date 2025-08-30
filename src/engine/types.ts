/**
 * Shared types for core engine components
 */

// Renderer scale modes
export type ScaleMode = 'integer' | 'fit' | 'stretch';

// Audio latency hints
export type AudioLatency = 'auto' | 'low' | 'compat';

// Settings interface
export interface Settings {
    video: {
        scaleMode: ScaleMode;
        fullscreen: boolean;
        safeAreaPct: number;
        fpsCap?: number;
        vsync?: boolean;
    };
    audio: {
        master: number;
        music: number;
        sfx: number;
        muted: boolean;
        latency: AudioLatency;
    };
    input: {
        // Will be filled later
    };
    accessibility: {
        highContrast: boolean;
        reduceFlashes: boolean;
        lateJumpMs: number;
        stickyGrab: boolean;
    };
    lang: string;
}

// Default settings
export const DEFAULT_SETTINGS: Settings = {
    video: {
        scaleMode: 'integer',
        fullscreen: false,
        safeAreaPct: 0.03,
        fpsCap: 60,
        vsync: true
    },
    audio: {
        master: 1.0,
        music: 0.8,
        sfx: 1.0,
        muted: false,
        latency: 'auto'
    },
    input: {},
    accessibility: {
        highContrast: false,
        reduceFlashes: false,
        lateJumpMs: 0,
        stickyGrab: false
    },
    lang: 'en'
}; 