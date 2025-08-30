/**
 * Virtual File System for asset loading
 * Supports built-in, remote URL, and local file sources with caching
 */
export interface VFSConfig {
    builtInPath?: string;
    cacheEnabled?: boolean;
    maxCacheSize?: number;
    cacheExpiryHours?: number;
}
export interface VFSStats {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    totalSize: number;
    cachedFiles: number;
}
export declare class VFS {
    private config;
    private cache;
    private cacheSize;
    private stats;
    constructor(config?: VFSConfig);
    /**
     * Read JSON data from various sources
     */
    readJson(path: string): Promise<any>;
    /**
     * Read image data from various sources
     */
    readImage(path: string): Promise<HTMLImageElement>;
    /**
     * Read audio data from various sources
     */
    readAudio(path: string): Promise<ArrayBuffer>;
    /**
     * Read text data from various sources
     */
    readText(path: string): Promise<string>;
    private readBuiltInJson;
    private readBuiltInText;
    private readBuiltInAudio;
    private loadBuiltInImage;
    private readUrlJson;
    private readUrlText;
    private readUrlAudio;
    private loadUrlImage;
    private readFileJson;
    private readFileText;
    private readFileAudio;
    private loadFileImage;
    private isBuiltInPath;
    private isUrl;
    private isFile;
    private cacheData;
    private estimateDataSize;
    clearCache(): void;
    getCacheStats(): VFSStats;
    setCacheEnabled(enabled: boolean): void;
    setMaxCacheSize(size: number): void;
    validatePath(path: string): Promise<boolean>;
    getSupportedFormats(): string[];
    get vfs(): VFS;
}
//# sourceMappingURL=VFS.d.ts.map