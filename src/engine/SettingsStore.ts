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

export class SettingsStore {
    private static instance: SettingsStore;
    private settings: Settings;
    private listeners: Map<string, Set<(value: any) => void>> = new Map();
    private readonly STORAGE_KEY = 'pts:settings';

    private constructor() {
        this.settings = this.loadSettings();
        this.setupStorageListener();
    }

    public static getInstance(): SettingsStore {
        if (!SettingsStore.instance) {
            SettingsStore.instance = new SettingsStore();
        }
        return SettingsStore.instance;
    }

    private getDefaultSettings(): Settings {
        return {
            video: {
                scaleMode: 'integer',
                fullscreen: false,
                safeAreaPct: 0.9,
                fpsCap: 60,
                vsync: true
            },
            audio: {
                master: 1.0,
                music: 0.8,
                sfx: 0.9,
                muted: true, // Start muted for autoplay safety
                latency: 'auto'
            },
            input: {
                profile: 'classic',
                deadzonePct: 0.1
            },
            accessibility: {
                highContrast: false,
                reduceFlashes: false,
                lateJumpMs: 100,
                stickyGrab: false
            },
            lang: 'en'
        };
    }

    private loadSettings(): Settings {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure all properties exist
                return this.mergeWithDefaults(parsed);
            }
        } catch (error) {
            console.error('Failed to load settings from localStorage:', error);
        }
        return this.getDefaultSettings();
    }

    private mergeWithDefaults(partial: Partial<Settings>): Settings {
        const defaults = this.getDefaultSettings();
        return {
            video: { ...defaults.video, ...partial.video },
            audio: { ...defaults.audio, ...partial.audio },
            input: { ...defaults.input, ...partial.input },
            accessibility: { ...defaults.accessibility, ...partial.accessibility },
            lang: partial.lang ?? defaults.lang
        };
    }

    private saveSettings(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings to localStorage:', error);
        }
    }

    private setupStorageListener(): void {
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            if (event.key === this.STORAGE_KEY && event.newValue) {
                try {
                    const newSettings = JSON.parse(event.newValue);
                    this.settings = this.mergeWithDefaults(newSettings);
                    this.notifyAllListeners();
                } catch (error) {
                    console.error('Failed to parse settings from storage event:', error);
                }
            }
        });
    }

    // Video settings
    public getVideoSettings() { return this.settings.video; }
    public setScaleMode(mode: 'integer' | 'fit' | 'stretch'): void {
        this.settings.video.scaleMode = mode;
        this.saveSettings();
        this.notifyListeners('video.scaleMode', mode);
    }
    public setFullscreen(fullscreen: boolean): void {
        this.settings.video.fullscreen = fullscreen;
        this.saveSettings();
        this.notifyListeners('video.fullscreen', fullscreen);
    }
    public setSafeAreaPct(pct: number): void {
        this.settings.video.safeAreaPct = Math.max(0.1, Math.min(1.0, pct));
        this.saveSettings();
        this.notifyListeners('video.safeAreaPct', this.settings.video.safeAreaPct);
    }
    public setFpsCap(fps: number | undefined): void {
        this.settings.video.fpsCap = fps;
        this.saveSettings();
        this.notifyListeners('video.fpsCap', fps);
    }
    public setVsync(vsync: boolean | undefined): void {
        this.settings.video.vsync = vsync;
        this.saveSettings();
        this.notifyListeners('video.vsync', vsync);
    }

    // Audio settings
    public getAudioSettings() { return this.settings.audio; }
    public setMasterVolume(volume: number): void {
        this.settings.audio.master = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.notifyListeners('audio.master', this.settings.audio.master);
    }
    public setMusicVolume(volume: number): void {
        this.settings.audio.music = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.notifyListeners('audio.music', this.settings.audio.music);
    }
    public setSfxVolume(volume: number): void {
        this.settings.audio.sfx = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.notifyListeners('audio.sfx', this.settings.audio.sfx);
    }
    public setAudioMuted(muted: boolean): void {
        this.settings.audio.muted = muted;
        this.saveSettings();
        this.notifyListeners('audio.muted', muted);
    }
    public setAudioLatency(latency: 'auto' | 'low' | 'compat'): void {
        this.settings.audio.latency = latency;
        this.saveSettings();
        this.notifyListeners('audio.latency', latency);
    }

    // Input settings
    public getInputSettings() { return this.settings.input; }
    public setInputProfile(profile: 'classic' | 'wasd' | 'custom'): void {
        this.settings.input.profile = profile;
        this.saveSettings();
        this.notifyListeners('input.profile', profile);
    }
    public setDeadzonePct(pct: number): void {
        this.settings.input.deadzonePct = Math.max(0, Math.min(0.5, pct));
        this.saveSettings();
        this.notifyListeners('input.deadzonePct', this.settings.input.deadzonePct);
    }

    // Accessibility settings
    public getAccessibilitySettings() { return this.settings.accessibility; }
    public setHighContrast(highContrast: boolean): void {
        this.settings.accessibility.highContrast = highContrast;
        this.saveSettings();
        this.notifyListeners('accessibility.highContrast', highContrast);
    }
    public setReduceFlashes(reduceFlashes: boolean): void {
        this.settings.accessibility.reduceFlashes = reduceFlashes;
        this.saveSettings();
        this.notifyListeners('accessibility.reduceFlashes', reduceFlashes);
    }
    public setLateJumpMs(ms: number): void {
        this.settings.accessibility.lateJumpMs = Math.max(0, Math.min(500, ms));
        this.saveSettings();
        this.notifyListeners('accessibility.lateJumpMs', this.settings.accessibility.lateJumpMs);
    }
    public setStickyGrab(stickyGrab: boolean): void {
        this.settings.accessibility.stickyGrab = stickyGrab;
        this.saveSettings();
        this.notifyListeners('accessibility.stickyGrab', stickyGrab);
    }

    // Language settings
    public getLanguage(): string { return this.settings.lang; }
    public setLanguage(lang: string): void {
        this.settings.lang = lang;
        this.saveSettings();
        this.notifyListeners('lang', lang);
    }

    // Event system
    public addListener(path: string, callback: (value: any) => void): void {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.add(callback);
        }
    }

    public removeListener(path: string, callback: (value: any) => void): void {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.delete(callback);
            if (pathListeners.size === 0) {
                this.listeners.delete(path);
            }
        }
    }

    private notifyListeners(path: string, value: any): void {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.forEach(callback => {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`Error in settings listener for ${path}:`, error);
                }
            });
        }
    }

    private notifyAllListeners(): void {
        // Notify all registered listeners with current values
        this.listeners.forEach((callbacks, path) => {
            const value = this.getValueByPath(path);
            callbacks.forEach(callback => {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`Error in settings listener for ${path}:`, error);
                }
            });
        });
    }

    private getValueByPath(path: string): any {
        const parts = path.split('.');
        let current: any = this.settings;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return undefined;
            }
        }
        return current;
    }

    // Utility methods
    public getAllSettings(): Settings {
        return { ...this.settings };
    }

    // Generic getter/setter methods for PiMenu compatibility
    public get<T>(path: string): T | undefined {
        return this.getValueByPath(path) as T;
    }

    public set(path: string, value: any): void {
        const parts = path.split('.');
        let current: any = this.settings;
        
        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
            if (current && typeof current === 'object' && parts[i] in current) {
                current = current[parts[i]];
            } else {
                return; // Path doesn't exist
            }
        }
        
        // Set the value
        const lastPart = parts[parts.length - 1];
        if (current && typeof current === 'object' && lastPart in current) {
            current[lastPart] = value;
            this.saveSettings();
            this.notifyListeners(path, value);
        }
    }

    public getAll(): Settings {
        return { ...this.settings };
    }

    public onChange(callback: (settings: Settings) => void): void {
        // Add a listener for all changes
        this.addListener('*', callback);
    }

    public clearChangeCallbacks(): void {
        this.listeners.clear();
    }

    public resetToDefaults(): void {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.notifyAllListeners();
    }

    public exportSettings(): string {
        return JSON.stringify(this.settings, null, 2);
    }

    public importSettings(jsonString: string): boolean {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = this.mergeWithDefaults(imported);
            this.saveSettings();
            this.notifyAllListeners();
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }
} 