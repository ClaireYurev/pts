export class SettingsStore {
    constructor() {
        this.listeners = new Map();
        this.STORAGE_KEY = 'pts:settings';
        this.settings = this.loadSettings();
        this.setupStorageListener();
    }
    static getInstance() {
        if (!SettingsStore.instance) {
            SettingsStore.instance = new SettingsStore();
        }
        return SettingsStore.instance;
    }
    getDefaultSettings() {
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
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure all properties exist
                return this.mergeWithDefaults(parsed);
            }
        }
        catch (error) {
            console.error('Failed to load settings from localStorage:', error);
        }
        return this.getDefaultSettings();
    }
    mergeWithDefaults(partial) {
        const defaults = this.getDefaultSettings();
        return {
            video: { ...defaults.video, ...partial.video },
            audio: { ...defaults.audio, ...partial.audio },
            input: { ...defaults.input, ...partial.input },
            accessibility: { ...defaults.accessibility, ...partial.accessibility },
            lang: partial.lang ?? defaults.lang
        };
    }
    saveSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
        }
        catch (error) {
            console.error('Failed to save settings to localStorage:', error);
        }
    }
    setupStorageListener() {
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            if (event.key === this.STORAGE_KEY && event.newValue) {
                try {
                    const newSettings = JSON.parse(event.newValue);
                    this.settings = this.mergeWithDefaults(newSettings);
                    this.notifyAllListeners();
                }
                catch (error) {
                    console.error('Failed to parse settings from storage event:', error);
                }
            }
        });
    }
    // Video settings
    getVideoSettings() { return this.settings.video; }
    setScaleMode(mode) {
        this.settings.video.scaleMode = mode;
        this.saveSettings();
        this.notifyListeners('video.scaleMode', mode);
    }
    setFullscreen(fullscreen) {
        this.settings.video.fullscreen = fullscreen;
        this.saveSettings();
        this.notifyListeners('video.fullscreen', fullscreen);
    }
    setSafeAreaPct(pct) {
        this.settings.video.safeAreaPct = Math.max(0.1, Math.min(1.0, pct));
        this.saveSettings();
        this.notifyListeners('video.safeAreaPct', this.settings.video.safeAreaPct);
    }
    setFpsCap(fps) {
        this.settings.video.fpsCap = fps;
        this.saveSettings();
        this.notifyListeners('video.fpsCap', fps);
    }
    setVsync(vsync) {
        this.settings.video.vsync = vsync;
        this.saveSettings();
        this.notifyListeners('video.vsync', vsync);
    }
    // Audio settings
    getAudioSettings() { return this.settings.audio; }
    setMasterVolume(volume) {
        this.settings.audio.master = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.notifyListeners('audio.master', this.settings.audio.master);
    }
    setMusicVolume(volume) {
        this.settings.audio.music = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.notifyListeners('audio.music', this.settings.audio.music);
    }
    setSfxVolume(volume) {
        this.settings.audio.sfx = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.notifyListeners('audio.sfx', this.settings.audio.sfx);
    }
    setAudioMuted(muted) {
        this.settings.audio.muted = muted;
        this.saveSettings();
        this.notifyListeners('audio.muted', muted);
    }
    setAudioLatency(latency) {
        this.settings.audio.latency = latency;
        this.saveSettings();
        this.notifyListeners('audio.latency', latency);
    }
    // Input settings
    getInputSettings() { return this.settings.input; }
    setInputProfile(profile) {
        this.settings.input.profile = profile;
        this.saveSettings();
        this.notifyListeners('input.profile', profile);
    }
    setDeadzonePct(pct) {
        this.settings.input.deadzonePct = Math.max(0, Math.min(0.5, pct));
        this.saveSettings();
        this.notifyListeners('input.deadzonePct', this.settings.input.deadzonePct);
    }
    // Accessibility settings
    getAccessibilitySettings() { return this.settings.accessibility; }
    setHighContrast(highContrast) {
        this.settings.accessibility.highContrast = highContrast;
        this.saveSettings();
        this.notifyListeners('accessibility.highContrast', highContrast);
    }
    setReduceFlashes(reduceFlashes) {
        this.settings.accessibility.reduceFlashes = reduceFlashes;
        this.saveSettings();
        this.notifyListeners('accessibility.reduceFlashes', reduceFlashes);
    }
    setLateJumpMs(ms) {
        this.settings.accessibility.lateJumpMs = Math.max(0, Math.min(500, ms));
        this.saveSettings();
        this.notifyListeners('accessibility.lateJumpMs', this.settings.accessibility.lateJumpMs);
    }
    setStickyGrab(stickyGrab) {
        this.settings.accessibility.stickyGrab = stickyGrab;
        this.saveSettings();
        this.notifyListeners('accessibility.stickyGrab', stickyGrab);
    }
    // Language settings
    getLanguage() { return this.settings.lang; }
    setLanguage(lang) {
        this.settings.lang = lang;
        this.saveSettings();
        this.notifyListeners('lang', lang);
    }
    // Event system
    addListener(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.add(callback);
        }
    }
    removeListener(path, callback) {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.delete(callback);
            if (pathListeners.size === 0) {
                this.listeners.delete(path);
            }
        }
    }
    notifyListeners(path, value) {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.forEach(callback => {
                try {
                    callback(value);
                }
                catch (error) {
                    console.error(`Error in settings listener for ${path}:`, error);
                }
            });
        }
    }
    notifyAllListeners() {
        // Notify all registered listeners with current values
        this.listeners.forEach((callbacks, path) => {
            const value = this.getValueByPath(path);
            callbacks.forEach(callback => {
                try {
                    callback(value);
                }
                catch (error) {
                    console.error(`Error in settings listener for ${path}:`, error);
                }
            });
        });
    }
    getValueByPath(path) {
        const parts = path.split('.');
        let current = this.settings;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    // Utility methods
    getAllSettings() {
        return { ...this.settings };
    }
    // Generic getter/setter methods for PiMenu compatibility
    get(path) {
        return this.getValueByPath(path);
    }
    set(path, value) {
        const parts = path.split('.');
        let current = this.settings;
        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
            if (current && typeof current === 'object' && parts[i] in current) {
                current = current[parts[i]];
            }
            else {
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
    getAll() {
        return { ...this.settings };
    }
    onChange(callback) {
        // Add a listener for all changes
        this.addListener('*', callback);
    }
    clearChangeCallbacks() {
        this.listeners.clear();
    }
    resetToDefaults() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.notifyAllListeners();
    }
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }
    importSettings(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = this.mergeWithDefaults(imported);
            this.saveSettings();
            this.notifyAllListeners();
            return true;
        }
        catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }
}
//# sourceMappingURL=SettingsStore.js.map