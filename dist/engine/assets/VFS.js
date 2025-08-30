/**
 * Virtual File System for asset loading
 * Supports built-in, remote URL, and local file sources with caching
 */
export class VFS {
    constructor(config = {}) {
        this.cache = new Map();
        this.cacheSize = 0;
        this.stats = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalSize: 0,
            cachedFiles: 0
        };
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
    async readJson(path) {
        this.stats.totalRequests++;
        // Check cache first
        const cacheKey = `json:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.stats.cacheMisses++;
        try {
            let data;
            if (this.isBuiltInPath(path)) {
                data = await this.readBuiltInJson(path);
            }
            else if (this.isUrl(path)) {
                data = await this.readUrlJson(path);
            }
            else if (this.isFile(path)) {
                data = await this.readFileJson(path);
            }
            else {
                throw new Error(`Unsupported path format: ${path}`);
            }
            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, data);
            }
            return data;
        }
        catch (error) {
            console.error(`Failed to read JSON from ${path}:`, error);
            throw error;
        }
    }
    /**
     * Read image data from various sources
     */
    async readImage(path) {
        this.stats.totalRequests++;
        // Check cache first
        const cacheKey = `image:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.stats.cacheMisses++;
        try {
            let image;
            if (this.isBuiltInPath(path)) {
                image = await this.loadBuiltInImage(path);
            }
            else if (this.isUrl(path)) {
                image = await this.loadUrlImage(path);
            }
            else if (this.isFile(path)) {
                image = await this.loadFileImage(path);
            }
            else {
                throw new Error(`Unsupported path format: ${path}`);
            }
            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, image);
            }
            return image;
        }
        catch (error) {
            console.error(`Failed to read image from ${path}:`, error);
            throw error;
        }
    }
    /**
     * Read audio data from various sources
     */
    async readAudio(path) {
        this.stats.totalRequests++;
        // Check cache first
        const cacheKey = `audio:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.stats.cacheMisses++;
        try {
            let audioData;
            if (this.isBuiltInPath(path)) {
                audioData = await this.readBuiltInAudio(path);
            }
            else if (this.isUrl(path)) {
                audioData = await this.readUrlAudio(path);
            }
            else if (this.isFile(path)) {
                audioData = await this.readFileAudio(path);
            }
            else {
                throw new Error(`Unsupported path format: ${path}`);
            }
            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, audioData);
            }
            return audioData;
        }
        catch (error) {
            console.error(`Failed to read audio from ${path}:`, error);
            throw error;
        }
    }
    /**
     * Read text data from various sources
     */
    async readText(path) {
        this.stats.totalRequests++;
        // Check cache first
        const cacheKey = `text:${path}`;
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            this.stats.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.stats.cacheMisses++;
        try {
            let text;
            if (this.isBuiltInPath(path)) {
                text = await this.readBuiltInText(path);
            }
            else if (this.isUrl(path)) {
                text = await this.readUrlText(path);
            }
            else if (this.isFile(path)) {
                text = await this.readFileText(path);
            }
            else {
                throw new Error(`Unsupported path format: ${path}`);
            }
            // Cache the result
            if (this.config.cacheEnabled) {
                this.cacheData(cacheKey, text);
            }
            return text;
        }
        catch (error) {
            console.error(`Failed to read text from ${path}:`, error);
            throw error;
        }
    }
    // Built-in asset handling
    async readBuiltInJson(path) {
        const fullPath = this.config.builtInPath + path;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load built-in JSON: ${response.statusText}`);
        }
        return response.json();
    }
    async readBuiltInText(path) {
        const fullPath = this.config.builtInPath + path;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load built-in text: ${response.statusText}`);
        }
        return response.text();
    }
    async readBuiltInAudio(path) {
        const fullPath = this.config.builtInPath + path;
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`Failed to load built-in audio: ${response.statusText}`);
        }
        return response.arrayBuffer();
    }
    loadBuiltInImage(path) {
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
    async readUrlJson(path) {
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
    async readUrlText(path) {
        const response = await fetch(path, {
            mode: 'cors'
        });
        if (!response.ok) {
            throw new Error(`Failed to load URL text: ${response.statusText}`);
        }
        return response.text();
    }
    async readUrlAudio(path) {
        const response = await fetch(path, {
            mode: 'cors'
        });
        if (!response.ok) {
            throw new Error(`Failed to load URL audio: ${response.statusText}`);
        }
        return response.arrayBuffer();
    }
    loadUrlImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load URL image: ${path}`));
            img.src = path;
        });
    }
    // File asset handling
    async readFileJson(path) {
        // For file paths, we assume it's a File object stored in memory
        // This would typically be handled by the LibraryManager
        throw new Error('File JSON reading not implemented - use LibraryManager');
    }
    async readFileText(path) {
        // For file paths, we assume it's a File object stored in memory
        throw new Error('File text reading not implemented - use LibraryManager');
    }
    async readFileAudio(path) {
        // For file paths, we assume it's a File object stored in memory
        throw new Error('File audio reading not implemented - use LibraryManager');
    }
    loadFileImage(path) {
        // For file paths, we assume it's a File object stored in memory
        return new Promise((resolve, reject) => {
            reject(new Error('File image loading not implemented - use LibraryManager'));
        });
    }
    // Path type detection
    isBuiltInPath(path) {
        return !path.startsWith('http') && !path.startsWith('file:') && !path.includes('://');
    }
    isUrl(path) {
        return path.startsWith('http://') || path.startsWith('https://');
    }
    isFile(path) {
        return path.startsWith('file:') || path.includes('://');
    }
    // Cache management
    cacheData(key, data) {
        if (!this.config.cacheEnabled)
            return;
        const dataSize = this.estimateDataSize(data);
        // Check if we need to evict cache entries
        while (this.cacheSize + dataSize > this.config.maxCacheSize && this.cache.size > 0) {
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
    estimateDataSize(data) {
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        }
        else if (data instanceof HTMLImageElement) {
            // Rough estimate for images
            return data.width * data.height * 4; // 4 bytes per pixel
        }
        else if (typeof data === 'string') {
            return data.length * 2; // 2 bytes per character (UTF-16)
        }
        else if (typeof data === 'object') {
            return JSON.stringify(data).length * 2;
        }
        return 1024; // Default estimate
    }
    // Cache control
    clearCache() {
        this.cache.clear();
        this.cacheSize = 0;
        this.stats.cachedFiles = 0;
        this.stats.totalSize = 0;
    }
    getCacheStats() {
        return { ...this.stats };
    }
    setCacheEnabled(enabled) {
        this.config.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }
    setMaxCacheSize(size) {
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
    async validatePath(path) {
        try {
            if (this.isBuiltInPath(path)) {
                const response = await fetch(this.config.builtInPath + path, { method: 'HEAD' });
                return response.ok;
            }
            else if (this.isUrl(path)) {
                const response = await fetch(path, { method: 'HEAD', mode: 'cors' });
                return response.ok;
            }
            return false;
        }
        catch {
            return false;
        }
    }
    getSupportedFormats() {
        return ['json', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp3', 'wav', 'ogg', 'txt'];
    }
    // For compatibility with LibraryManager
    get vfs() {
        return this;
    }
}
//# sourceMappingURL=VFS.js.map