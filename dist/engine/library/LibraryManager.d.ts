import { VFS } from '../assets/VFS.js';
export interface GamePack {
    id: string;
    name: string;
    description?: string;
    version: string;
    author?: string;
    cover?: string;
    levels: string[];
    assets: {
        images?: string[];
        audio?: string[];
        data?: string[];
    };
    metadata?: Record<string, any>;
}
export interface LibraryItem {
    id: string;
    name: string;
    description?: string;
    cover?: string;
    source: 'builtin' | 'url' | 'local';
    urlOrKey: string;
    installed: boolean;
    lastPlayed?: number;
    pack?: GamePack;
}
export interface LibraryConfig {
    vfs?: VFS;
    builtinPacksPath?: string;
    cacheEnabled?: boolean;
}
export declare class LibraryManager {
    private vfs;
    private registry;
    private currentPack;
    private config;
    private idb;
    constructor(config?: LibraryConfig);
    private initLibraryDB;
    /**
     * Initialize the library with built-in packs
     */
    initialize(): Promise<void>;
    /**
     * Load built-in packs from manifest.json
     */
    private loadBuiltinPacks;
    /**
     * Load registry from IndexedDB
     */
    private loadRegistryFromDB;
    /**
     * Save registry to IndexedDB
     */
    private saveRegistryToDB;
    /**
     * Get all library items
     */
    getLibraryItems(): LibraryItem[];
    /**
     * Get a specific library item
     */
    getLibraryItem(id: string): LibraryItem | undefined;
    /**
     * Get the currently loaded pack
     */
    getCurrentPack(): string | null;
    /**
     * Load a pack from URL
     */
    loadPackFromUrl(url: string): Promise<LibraryItem>;
    /**
     * Load a pack from local file
     */
    loadPackFromFile(file: File): Promise<LibraryItem>;
    /**
     * Install a local pack to cache
     */
    installLocalPack(itemId: string): Promise<void>;
    /**
     * Switch to a different pack
     */
    switchPack(packId: string): Promise<GamePack>;
    /**
     * Remove a pack from the library
     */
    removePack(packId: string): Promise<void>;
    /**
     * Validate pack data structure
     */
    private validatePack;
    /**
     * Get pack statistics
     */
    getStats(): {
        totalPacks: number;
        builtinPacks: number;
        urlPacks: number;
        localPacks: number;
        installedPacks: number;
    };
    /**
     * Clear all cached data
     */
    clearCache(): Promise<void>;
}
//# sourceMappingURL=LibraryManager.d.ts.map