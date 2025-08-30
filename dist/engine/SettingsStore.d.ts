import { Settings } from './types.js';
/**
 * SettingsStore - Manages persistent application settings with localStorage
 */
export declare class SettingsStore {
    private settings;
    private storageKey;
    private changeCallbacks;
    constructor(storageKey?: string);
    /**
     * Get a setting value by path (e.g., 'video.scaleMode')
     */
    get<T>(path: string): T;
    /**
     * Set a setting value by path (e.g., 'video.scaleMode', 'integer')
     */
    set<T>(path: string, value: T): void;
    /**
     * Get all settings
     */
    getAll(): Settings;
    /**
     * Set all settings at once
     */
    setAll(settings: Partial<Settings>): void;
    /**
     * Reset settings to defaults
     */
    reset(): void;
    /**
     * Load settings from localStorage
     */
    load(): void;
    /**
     * Save settings to localStorage
     */
    save(): void;
    /**
     * Export settings as JSON string
     */
    exportJson(): string;
    /**
     * Import settings from JSON string
     */
    importJson(json: string): boolean;
    /**
     * Add a change callback
     */
    onChange(callback: (settings: Settings) => void): void;
    /**
     * Remove a change callback
     */
    removeChangeCallback(callback: (settings: Settings) => void): void;
    /**
     * Clear all change callbacks
     */
    clearChangeCallbacks(): void;
    /**
     * Merge loaded settings with defaults
     */
    private mergeWithDefaults;
    /**
     * Validate settings structure
     */
    private validateSettings;
    /**
     * Notify all change callbacks
     */
    private notifyChangeCallbacks;
    /**
     * Clear all stored settings
     */
    clear(): void;
    /**
     * Get storage key
     */
    getStorageKey(): string;
    /**
     * Check if settings are stored
     */
    hasStoredSettings(): boolean;
}
//# sourceMappingURL=SettingsStore.d.ts.map