/**
 * Shared types for core engine components
 */
export type ScaleMode = 'integer' | 'fit' | 'stretch';
export type AudioLatency = 'auto' | 'low' | 'compat';
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
    input: {};
    accessibility: {
        highContrast: boolean;
        reduceFlashes: boolean;
        lateJumpMs: number;
        stickyGrab: boolean;
    };
    lang: string;
}
export declare const DEFAULT_SETTINGS: Settings;
//# sourceMappingURL=types.d.ts.map