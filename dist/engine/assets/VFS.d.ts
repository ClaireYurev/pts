/**
 * Virtual File System for asset loading
 * Supports built-in, remote URL, and local file sources with caching
 */
export interface VFSCacheEntry {
    hash: string;
    data: any;
    timestamp: number;
    type: 'json' | 'image' | 'audio';
}
export interface VFSConfig {
    cacheEnabled?: boolean;
    cacheExpiryHours?: number;
    maxCacheSize?: number;
}
export declare class VFS {
    private cache;
    private config;
    private idb;
    constructor(config?: VFSConfig);
    private initCache;
    /**
     * Read JSON data from path or URL
     */
    readJson(pathOrUrl: string): Promise<any>;
    /**
     * Read image data from path or URL
     */
    readImage(pathOrUrl: string): Promise<HTMLImageElement>;
    /**
     * Read audio data from path or URL
     */
    readAudio(pathOrUrl: string): Promise<ArrayBuffer>;
    /**
     * Read local file from File object
     */
    readLocalFile(file: File): Promise<any>;
    /**
     * Install local file to cache
     */
    installLocalFile(file: File, id: string): Promise<void>;
    private isUrl;
    private fetchFromUrl;
    private fetchFromPath;
    private getFromCache;
    private setCache;
    private setCacheToDB;
    private isCacheValid;
    private cleanupCache;
    private generateHash;
    private getFileType;
    /**
     * Clear all cached data
     */
    clearCache(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        memoryEntries: number;
        totalSize: number;
    };
}
//# sourceMappingURL=VFS.d.ts.map