export interface Settings {
    video: {
        scaleMode: 'integer' | 'fit' | 'stretch';
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
        latency: 'auto' | 'low' | 'compat';
    };
    input: {
        profile: 'classic' | 'wasd' | 'custom';
        deadzonePct: number;
    };
    accessibility: {
        highContrast: boolean;
        reduceFlashes: boolean;
        lateJumpMs: number;
        stickyGrab: boolean;
    };
    lang: string;
}
export declare class SettingsStore {
    private static instance;
    private settings;
    private listeners;
    private readonly STORAGE_KEY;
    private constructor();
    static getInstance(): SettingsStore;
    private getDefaultSettings;
    private loadSettings;
    private mergeWithDefaults;
    private saveSettings;
    private setupStorageListener;
    getVideoSettings(): {
        scaleMode: "integer" | "fit" | "stretch";
        fullscreen: boolean;
        safeAreaPct: number;
        fpsCap?: number;
        vsync?: boolean;
    };
    setScaleMode(mode: 'integer' | 'fit' | 'stretch'): void;
    setFullscreen(fullscreen: boolean): void;
    setSafeAreaPct(pct: number): void;
    setFpsCap(fps: number | undefined): void;
    setVsync(vsync: boolean | undefined): void;
    getAudioSettings(): {
        master: number;
        music: number;
        sfx: number;
        muted: boolean;
        latency: "auto" | "low" | "compat";
    };
    setMasterVolume(volume: number): void;
    setMusicVolume(volume: number): void;
    setSfxVolume(volume: number): void;
    setAudioMuted(muted: boolean): void;
    setAudioLatency(latency: 'auto' | 'low' | 'compat'): void;
    getInputSettings(): {
        profile: "classic" | "wasd" | "custom";
        deadzonePct: number;
    };
    setInputProfile(profile: 'classic' | 'wasd' | 'custom'): void;
    setDeadzonePct(pct: number): void;
    getAccessibilitySettings(): {
        highContrast: boolean;
        reduceFlashes: boolean;
        lateJumpMs: number;
        stickyGrab: boolean;
    };
    setHighContrast(highContrast: boolean): void;
    setReduceFlashes(reduceFlashes: boolean): void;
    setLateJumpMs(ms: number): void;
    setStickyGrab(stickyGrab: boolean): void;
    getLanguage(): string;
    setLanguage(lang: string): void;
    addListener(path: string, callback: (value: any) => void): void;
    removeListener(path: string, callback: (value: any) => void): void;
    private notifyListeners;
    private notifyAllListeners;
    private getValueByPath;
    getAllSettings(): Settings;
    get<T>(path: string): T | undefined;
    set(path: string, value: any): void;
    getAll(): Settings;
    onChange(callback: (settings: Settings) => void): void;
    clearChangeCallbacks(): void;
    resetToDefaults(): void;
    exportSettings(): string;
    importSettings(jsonString: string): boolean;
}
//# sourceMappingURL=SettingsStore.d.ts.map