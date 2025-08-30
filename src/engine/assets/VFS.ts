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

export class VFS {
    private config: VFSConfig;
    private cache: Map<string, any> = new Map();
    private cacheSize: number = 0;
    private stats: VFSStats = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalSize: 0,
        cachedFiles: 0
    };

    constructor(config: VFSConfig = {}) {
        this.config = {
            builtInPath: '/assets/',
            cacheEnabled: true,
            maxCacheSize: 50 * 1024 * 1024, // 50MB default
            cacheExpiryHours: 24,
            ...config
        };
    }

    /**
     * Read JSON data from various sources
     */
    async readJson(path: string): Promise<any> {
        this.stats.totalRequests++;
        
        // Check cache first
        const cacheKey = `json:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }

        this.stats.cacheMisses++;
        
        try {
            let data: any;
            
            if (this.isBuiltInPath(path)) {
                data = await this.readBuiltInJson(path);
            } else if (this.isUrl(path)) {
                data = await this.readUrlJson(path);
            } else if (this.isFile(path)) {
                data = await this.readFileJson(path);
            } else {
                throw new Error(`Unsupported path format: ${path}`);
            }

            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error(`Failed to read JSON from ${path}:`, error);
            throw error;
        }
    }

    /**
     * Read image data from various sources
     */
    async readImage(path: string): Promise<HTMLImageElement> {
        this.stats.totalRequests++;
        
        // Check cache first
        const cacheKey = `image:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }

        this.stats.cacheMisses++;
        
        try {
            let image: HTMLImageElement;
            
            if (this.isBuiltInPath(path)) {
                image = await this.loadBuiltInImage(path);
            } else if (this.isUrl(path)) {
                image = await this.loadUrlImage(path);
            } else if (this.isFile(path)) {
                image = await this.loadFileImage(path);
            } else {
                throw new Error(`Unsupported path format: ${path}`);
            }

            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, image);
            }

            return image;
        } catch (error) {
            console.error(`Failed to read image from ${path}:`, error);
            throw error;
        }
    }

    /**
     * Read audio data from various sources
     */
    async readAudio(path: string): Promise<ArrayBuffer> {
        this.stats.totalRequests++;
        
        // Check cache first
        const cacheKey = `audio:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }

        this.stats.cacheMisses++;
        
        try {
            let audioData: ArrayBuffer;
            
            if (this.isBuiltInPath(path)) {
                audioData = await this.readBuiltInAudio(path);
            } else if (this.isUrl(path)) {
                audioData = await this.readUrlAudio(path);
            } else if (this.isFile(path)) {
                audioData = await this.readFileAudio(path);
            } else {
                throw new Error(`Unsupported path format: ${path}`);
            }

            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, audioData);
            }

            return audioData;
        } catch (error) {
            console.error(`Failed to read audio from ${path}:`, error);
            throw error;
        }
    }

    /**
     * Read text data from various sources
     */
    async readText(path: string): Promise<string> {
        this.stats.totalRequests++;
        
        // Check cache first
        const cacheKey = `text:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }

        this.stats.cacheMisses++;
        
        try {
            let text: string;
            
            if (this.isBuiltInPath(path)) {
                text = await this.readBuiltInText(path);
            } else if (this.isUrl(path)) {
                text = await this.readUrlText(path);
            } else if (this.isFile(path)) {
                text = await this.readFileText(path);
            } else {
                throw new Error(`Unsupported path format: ${path}`);
            }

            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, text);
            }

            return text;
        } catch (error) {
            console.error(`Failed to read text from ${path}:`, error);
            throw error;
        }
    }

    // Built-in asset handling
    private async readBuiltInJson(path: string): Promise<any> {
        const fullPath = this.config.builtInPath + path;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load built-in JSON: ${response.statusText}`);
        }
        return response.json();
    }

    private async readBuiltInText(path: string): Promise<string> {
        const fullPath = this.config.builtInPath + path;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load built-in text: ${response.statusText}`);
        }
        return response.text();
    }

    private async readBuiltInAudio(path: string): Promise<ArrayBuffer> {
        const fullPath = this.config.builtInPath + path;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load built-in audio: ${response.statusText}`);
        }
        return response.arrayBuffer();
    }

    private loadBuiltInImage(path: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const fullPath = this.config.builtInPath + path;
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load built-in image: ${path}`));
            
            img.src = fullPath;
        });
    }

    // URL asset handling
    private async readUrlJson(path: string): Promise<any> {
        const response = await fetch(path, {
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to load URL JSON: ${response.statusText}`);
        }
        return response.json();
    }

    private async readUrlText(path: string): Promise<string> {
        const response = await fetch(path, {
            mode: 'cors'
        });
        if (!response.ok) {
            throw new Error(`Failed to load URL text: ${response.statusText}`);
        }
        return response.text();
    }

    private async readUrlAudio(path: string): Promise<ArrayBuffer> {
        const response = await fetch(path, {
            mode: 'cors'
        });
        if (!response.ok) {
            throw new Error(`Failed to load URL audio: ${response.statusText}`);
        }
        return response.arrayBuffer();
    }

    private loadUrlImage(path: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load URL image: ${path}`));
            
            img.src = path;
        });
    }

    // File asset handling
    private async readFileJson(path: string): Promise<any> {
        // For file paths, we assume it's a File object stored in memory
        // This would typically be handled by the LibraryManager
        throw new Error('File JSON reading not implemented - use LibraryManager');
    }

    private async readFileText(path: string): Promise<string> {
        // For file paths, we assume it's a File object stored in memory
        throw new Error('File text reading not implemented - use LibraryManager');
    }

    private async readFileAudio(path: string): Promise<ArrayBuffer> {
        // For file paths, we assume it's a File object stored in memory
        throw new Error('File audio reading not implemented - use LibraryManager');
    }

    private loadFileImage(path: string): Promise<HTMLImageElement> {
        // For file paths, we assume it's a File object stored in memory
        return new Promise((resolve, reject) => {
            reject(new Error('File image loading not implemented - use LibraryManager'));
        });
    }

    // Path type detection
    private isBuiltInPath(path: string): boolean {
        return !path.startsWith('http') && !path.startsWith('file:') && !path.includes('://');
    }

    private isUrl(path: string): boolean {
        return path.startsWith('http://') || path.startsWith('https://');
    }

    private isFile(path: string): boolean {
        return path.startsWith('file:') || path.includes('://');
    }

    // Cache management
    private cacheData(key: string, data: any): void {
        if (!this.config.cacheEnabled) return;

        const dataSize = this.estimateDataSize(data);
        
        // Check if we need to evict cache entries
        while (this.cacheSize + dataSize > this.config.maxCacheSize! && this.cache.size > 0) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                const firstData = this.cache.get(firstKey);
                this.cacheSize -= this.estimateDataSize(firstData);
                this.cache.delete(firstKey);
                this.stats.cachedFiles--;
            }
        }

        // Add to cache
        this.cache.set(key, data);
        this.cacheSize += dataSize;
        this.stats.cachedFiles++;
        this.stats.totalSize = this.cacheSize;
    }

    private estimateDataSize(data: any): number {
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        } else if (data instanceof HTMLImageElement) {
            // Rough estimate for images
            return data.width * data.height * 4; // 4 bytes per pixel
        } else if (typeof data === 'string') {
            return data.length * 2; // 2 bytes per character (UTF-16)
        } else if (typeof data === 'object') {
            return JSON.stringify(data).length * 2;
        }
        return 1024; // Default estimate
    }

    // Cache control
    public clearCache(): void {
        this.cache.clear();
        this.cacheSize = 0;
        this.stats.cachedFiles = 0;
        this.stats.totalSize = 0;
    }

    public getCacheStats(): VFSStats {
        return { ...this.stats };
    }

    public setCacheEnabled(enabled: boolean): void {
        this.config.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }

    public setMaxCacheSize(size: number): void {
        this.config.maxCacheSize = size;
        // Evict excess cache entries
        while (this.cacheSize > size && this.cache.size > 0) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                const firstData = this.cache.get(firstKey);
                this.cacheSize -= this.estimateDataSize(firstData);
                this.cache.delete(firstKey);
                this.stats.cachedFiles--;
            }
        }
        this.stats.totalSize = this.cacheSize;
    }

    // Utility methods
    public async validatePath(path: string): Promise<boolean> {
        try {
            if (this.isBuiltInPath(path)) {
                const response = await fetch(this.config.builtInPath + path, { method: 'HEAD' });
                return response.ok;
            } else if (this.isUrl(path)) {
                const response = await fetch(path, { method: 'HEAD', mode: 'cors' });
                return response.ok;
            }
            return false;
        } catch {
            return false;
        }
    }

    public getSupportedFormats(): string[] {
        return ['json', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp3', 'wav', 'ogg', 'txt'];
    }

    // For compatibility with LibraryManager
    public get vfs(): VFS {
        return this;
    }
} 