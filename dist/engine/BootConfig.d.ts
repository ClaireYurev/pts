import { GameEngine } from "./GameEngine.js";
export interface BootConfig {
    packUrl?: string;
    level?: number;
    playerX?: number;
    playerY?: number;
    health?: number;
    lives?: number;
    score?: number;
    time?: number;
    difficulty?: string;
    skipCutscene?: boolean;
    musicVolume?: number;
    sfxVolume?: number;
    mute?: boolean;
    resolution?: {
        width: number;
        height: number;
    };
    fullscreen?: boolean;
    platform?: string;
    inputMethod?: string;
    subtitles?: boolean;
    highContrast?: boolean;
    lang?: string;
    debug?: boolean;
    cheats?: string[];
    [key: string]: any;
}
export declare class BootConfigManager {
    private static readonly KNOWN_CHEATS;
    private static readonly DIFFICULTY_LEVELS;
    private static readonly INPUT_METHODS;
    private static readonly SUPPORTED_LANGUAGES;
    /**
     * Parse URL parameters into a BootConfig object with validation and sanitization
     */
    static parse(): BootConfig;
    /**
     * Validate the boot configuration
     */
    static validate(cfg: BootConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Apply the boot configuration to the game engine
     */
    static apply(cfg: BootConfig, engine: GameEngine): void;
    /**
     * Generate a shareable URL with current game state
     */
    static generateShareUrl(engine: GameEngine): string;
    /**
     * Copy the current game state URL to clipboard
     */
    static copyShareUrl(engine: GameEngine): Promise<boolean>;
    /**
     * Get preset configuration by name
     */
    private static getPresetConfig;
    /**
     * Get all available preset names
     */
    static getAvailablePresets(): string[];
    /**
     * Clear all URL parameters (useful for resetting to defaults)
     */
    static clearUrlParams(): void;
    /**
     * Validate if a string is a valid URL
     */
    private static isValidUrl;
}
//# sourceMappingURL=BootConfig.d.ts.map