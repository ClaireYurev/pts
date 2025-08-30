import { VFS } from '../assets/VFS.js';
export interface GamePack {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    thumbnail?: string;
    manifest: string;
    type: 'built-in' | 'installed' | 'url' | 'file';
    source: string;
    installedAt?: number;
    size?: number;
}
export interface LibraryItem {
    pack: GamePack;
    isInstalled: boolean;
    canInstall: boolean;
    isBuiltIn: boolean;
}
export interface InstallResult {
    success: boolean;
    packId: string;
    error?: string;
    size?: number;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class LibraryManager {
    private vfs;
    private builtInPacks;
    private installedPacks;
    private urlPacks;
    private filePacks;
    private currentPack;
    private onPackSwitch?;
    constructor(vfs?: VFS);
    /**
     * Initialize the library manager
     */
    initialize(): Promise<void>;
    /**
     * Load built-in packs from manifest.json
     */
    private loadBuiltInPacks;
    /**
     * Get all available packs
     */
    getAllPacks(): Promise<LibraryItem[]>;
    /**
     * Add pack from URL
     */
    addFromUrl(url: string): Promise<GamePack | null>;
    /**
     * Add pack from file
     */
    addFromFile(file: File): Promise<GamePack | null>;
    /**
     * Install a pack (cache it locally)
     */
    installPack(packId: string): Promise<InstallResult>;
    /**
     * Uninstall a pack
     */
    uninstallPack(packId: string): Promise<boolean>;
    /**
     * Switch to a different pack
     */
    switchPack(packId: string): Promise<boolean>;
    /**
     * Get current pack
     */
    getCurrentPack(): GamePack | null;
    /**
     * Set pack switch callback
     */
    setPackSwitchCallback(callback: (pack: GamePack) => void): void;
    /**
     * Find a pack by ID
     */
    private findPack;
    /**
     * Validate pack manifest
     */
    private validatePackManifest;
    /**
     * Validate a complete pack
     */
    private validatePack;
    /**
     * Extract pack from zip file
     */
    private extractPackFromZip;
    /**
     * Calculate pack size
     */
    private calculatePackSize;
    /**
     * Validate URL format
     */
    private isValidUrl;
    /**
     * Validate file type
     */
    private isValidPackFile;
    /**
     * Validate version format
     */
    private isValidVersion;
    /**
     * Get VFS instance
     */
    getVFS(): VFS;
    /**
     * Clear all non-built-in packs
     */
    clearAllPacks(): void;
    /**
     * Get library statistics
     */
    getStats(): {
        totalPacks: number;
        builtInPacks: number;
        installedPacks: number;
        urlPacks: number;
        filePacks: number;
    };
    /**
     * Load pack from URL
     */
    loadPackFromUrl(url: string): Promise<void>;
    /**
     * Load pack from file
     */
    loadPackFromFile(file: File): Promise<void>;
    /**
     * Get library items
     */
    getLibraryItems(): Promise<LibraryItem[]>;
    /**
     * Remove pack
     */
    removePack(packId: string): Promise<void>;
    /**
     * Clear cache
     */
    clearCache(): Promise<void>;
}
//# sourceMappingURL=LibraryManager.d.ts.map