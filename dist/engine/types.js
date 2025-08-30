/**
 * Shared types for core engine components
 */
// Default settings
export const DEFAULT_SETTINGS = {
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
//# sourceMappingURL=types.js.map