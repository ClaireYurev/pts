import { DEFAULT_SETTINGS } from './types.js';
import { RENDERER } from './Constants.js';
/**
 * SettingsStore - Manages persistent application settings with localStorage
 */
export class SettingsStore {
    constructor(storageKey = RENDERER.STORAGE_KEY) {
        this.changeCallbacks = [];
        this.storageKey = storageKey;
        this.settings = { ...DEFAULT_SETTINGS };
        this.load();
    }
    /**
     * Get a setting value by path (e.g., 'video.scaleMode')
     */
    get(path) {
        const keys = path.split('.');
        let value = this.settings;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                console.warn(`SettingsStore: Path '${path}' not found, returning undefined`);
                return undefined;
            }
        }
        return value;
    }
    /**
     * Set a setting value by path (e.g., 'video.scaleMode', 'integer')
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.settings;
        // Navigate to the parent object
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        // Set the value
        current[lastKey] = value;
        // Save and notify
        this.save();
        this.notifyChangeCallbacks();
        console.log(`SettingsStore: Set '${path}' to ${JSON.stringify(value)}`);
    }
    /**
     * Get all settings
     */
    getAll() {
        return { ...this.settings };
    }
    /**
     * Set all settings at once
     */
    setAll(settings) {
        this.settings = { ...this.settings, ...settings };
        this.save();
        this.notifyChangeCallbacks();
        console.log('SettingsStore: All settings updated');
    }
    /**
     * Reset settings to defaults
     */
    reset() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.save();
        this.notifyChangeCallbacks();
        console.log('SettingsStore: Settings reset to defaults');
    }
    /**
     * Load settings from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle missing properties
                this.settings = this.mergeWithDefaults(parsed);
                console.log('SettingsStore: Settings loaded from localStorage');
            }
            else {
                console.log('SettingsStore: No stored settings found, using defaults');
            }
        }
        catch (error) {
            console.error('SettingsStore: Failed to load settings from localStorage:', error);
            console.log('SettingsStore: Using default settings');
        }
    }
    /**
     * Save settings to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            console.log('SettingsStore: Settings saved to localStorage');
        }
        catch (error) {
            console.error('SettingsStore: Failed to save settings to localStorage:', error);
        }
    }
    /**
     * Export settings as JSON string
     */
    exportJson() {
        return JSON.stringify(this.settings, null, 2);
    }
    /**
     * Import settings from JSON string
     */
    importJson(json) {
        try {
            const parsed = JSON.parse(json);
            // Validate the structure
            if (!this.validateSettings(parsed)) {
                throw new Error('Invalid settings structure');
            }
            // Merge with defaults
            this.settings = this.mergeWithDefaults(parsed);
            // Save and notify
            this.save();
            this.notifyChangeCallbacks();
            console.log('SettingsStore: Settings imported successfully');
            return true;
        }
        catch (error) {
            console.error('SettingsStore: Failed to import settings:', error);
            return false;
        }
    }
    /**
     * Add a change callback
     */
    onChange(callback) {
        this.changeCallbacks.push(callback);
    }
    /**
     * Remove a change callback
     */
    removeChangeCallback(callback) {
        const index = this.changeCallbacks.indexOf(callback);
        if (index > -1) {
            this.changeCallbacks.splice(index, 1);
        }
    }
    /**
     * Clear all change callbacks
     */
    clearChangeCallbacks() {
        this.changeCallbacks = [];
    }
    /**
     * Merge loaded settings with defaults
     */
    mergeWithDefaults(loaded) {
        const merged = { ...DEFAULT_SETTINGS };
        // Deep merge function
        const deepMerge = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    target[key] = target[key] || {};
                    deepMerge(target[key], source[key]);
                }
                else {
                    target[key] = source[key];
                }
            }
            return target;
        };
        return deepMerge(merged, loaded);
    }
    /**
     * Validate settings structure
     */
    validateSettings(settings) {
        // Basic structure validation
        const requiredSections = ['video', 'audio', 'input', 'accessibility', 'lang'];
        for (const section of requiredSections) {
            if (!settings[section] || typeof settings[section] !== 'object') {
                return false;
            }
        }
        // Validate video settings
        const video = settings.video;
        if (typeof video.scaleMode !== 'string' ||
            typeof video.fullscreen !== 'boolean' ||
            typeof video.safeAreaPct !== 'number') {
            return false;
        }
        // Validate audio settings
        const audio = settings.audio;
        if (typeof audio.master !== 'number' ||
            typeof audio.music !== 'number' ||
            typeof audio.sfx !== 'number' ||
            typeof audio.muted !== 'boolean' ||
            typeof audio.latency !== 'string') {
            return false;
        }
        // Validate accessibility settings
        const accessibility = settings.accessibility;
        if (typeof accessibility.highContrast !== 'boolean' ||
            typeof accessibility.reduceFlashes !== 'boolean' ||
            typeof accessibility.lateJumpMs !== 'number' ||
            typeof accessibility.stickyGrab !== 'boolean') {
            return false;
        }
        return true;
    }
    /**
     * Notify all change callbacks
     */
    notifyChangeCallbacks() {
        const settingsCopy = { ...this.settings };
        this.changeCallbacks.forEach(callback => {
            try {
                callback(settingsCopy);
            }
            catch (error) {
                console.error('SettingsStore: Error in change callback:', error);
            }
        });
    }
    /**
     * Clear all stored settings
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            this.settings = { ...DEFAULT_SETTINGS };
            this.notifyChangeCallbacks();
            console.log('SettingsStore: All settings cleared');
        }
        catch (error) {
            console.error('SettingsStore: Failed to clear settings:', error);
        }
    }
    /**
     * Get storage key
     */
    getStorageKey() {
        return this.storageKey;
    }
    /**
     * Check if settings are stored
     */
    hasStoredSettings() {
        return localStorage.getItem(this.storageKey) !== null;
    }
}
//# sourceMappingURL=SettingsStore.js.map