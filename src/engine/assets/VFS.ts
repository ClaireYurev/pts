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

export class VFS {
    private cache: Map<string, VFSCacheEntry> = new Map();
    private config: VFSConfig;
    private idb: IDBDatabase | null = null;

    constructor(config: VFSConfig = {}) {
        this.config = {
            cacheEnabled: true,
            cacheExpiryHours: 24,
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            ...config
        };
        
        if (this.config.cacheEnabled) {
            this.initCache();
        }
    }

    private async initCache(): Promise<void> {
        try {
            const request = indexedDB.open('VFS-Cache', 1);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('vfs-cache')) {
                    const store = db.createObjectStore('vfs-cache', { keyPath: 'hash' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            request.onsuccess = () => {
                this.idb = request.result;
            };

            request.onerror = () => {
                console.warn('Failed to initialize VFS cache, continuing without cache');
            };
        } catch (error) {
            console.warn('VFS cache initialization failed:', error);
        }
    }

    /**
     * Read JSON data from path or URL
     */
    async readJson(pathOrUrl: string): Promise<any> {
        try {
            // Check cache first
            const cached = await this.getFromCache(pathOrUrl, 'json');
            if (cached) {
                return cached;
            }

            let data: any;

            if (this.isUrl(pathOrUrl)) {
                data = await this.fetchFromUrl(pathOrUrl);
            } else {
                data = await this.fetchFromPath(pathOrUrl);
            }

            // Validate JSON
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            // Cache the result
            await this.setCache(pathOrUrl, data, 'json');

            return data;
        } catch (error) {
            console.error(`Failed to read JSON from ${pathOrUrl}:`, error);
            throw error;
        }
    }

    /**
     * Read image data from path or URL
     */
    async readImage(pathOrUrl: string): Promise<HTMLImageElement> {
        try {
            // Check cache first
            const cached = await this.getFromCache(pathOrUrl, 'image');
            if (cached) {
                return cached;
            }

            const image = new Image();
            
            return new Promise((resolve, reject) => {
                image.onload = async () => {
                    try {
                        await this.setCache(pathOrUrl, image, 'image');
                        resolve(image);
                    } catch (error) {
                        console.warn('Failed to cache image:', error);
                        resolve(image);
                    }
                };
                
                image.onerror = () => {
                    reject(new Error(`Failed to load image: ${pathOrUrl}`));
                };

                if (this.isUrl(pathOrUrl)) {
                    image.crossOrigin = 'anonymous';
                    image.src = pathOrUrl;
                } else {
                    image.src = pathOrUrl;
                }
            });
        } catch (error) {
            console.error(`Failed to read image from ${pathOrUrl}:`, error);
            throw error;
        }
    }

    /**
     * Read audio data from path or URL
     */
    async readAudio(pathOrUrl: string): Promise<ArrayBuffer> {
        try {
            // Check cache first
            const cached = await this.getFromCache(pathOrUrl, 'audio');
            if (cached) {
                return cached;
            }

            let response: Response;
            
            if (this.isUrl(pathOrUrl)) {
                response = await fetch(pathOrUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                });
            } else {
                response = await fetch(pathOrUrl);
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            
            // Cache the result
            await this.setCache(pathOrUrl, arrayBuffer, 'audio');

            return arrayBuffer;
        } catch (error) {
            console.error(`Failed to read audio from ${pathOrUrl}:`, error);
            throw error;
        }
    }

    /**
     * Read local file from File object
     */
    async readLocalFile(file: File): Promise<any> {
        try {
            const extension = file.name.split('.').pop()?.toLowerCase();
            
            if (extension === 'json') {
                const text = await file.text();
                return JSON.parse(text);
            } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) {
                return new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = () => reject(new Error('Failed to load image'));
                    image.src = URL.createObjectURL(file);
                });
            } else if (['mp3', 'wav', 'ogg', 'webm'].includes(extension || '')) {
                return await file.arrayBuffer();
            } else {
                throw new Error(`Unsupported file type: ${extension}`);
            }
        } catch (error) {
            console.error('Failed to read local file:', error);
            throw error;
        }
    }

    /**
     * Install local file to cache
     */
    async installLocalFile(file: File, id: string): Promise<void> {
        try {
            const data = await this.readLocalFile(file);
            const hash = await this.generateHash(file.name + file.size + file.lastModified);
            
            await this.setCacheToDB(hash, data, this.getFileType(file.name));
            console.log(`Installed local file ${file.name} as ${id}`);
        } catch (error) {
            console.error('Failed to install local file:', error);
            throw error;
        }
    }

    private isUrl(pathOrUrl: string): boolean {
        return pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://');
    }

    private async fetchFromUrl(url: string): Promise<any> {
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    private async fetchFromPath(path: string): Promise<any> {
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    private async getFromCache(pathOrUrl: string, type: 'json' | 'image' | 'audio'): Promise<any | null> {
        if (!this.config.cacheEnabled) {
            return null;
        }

        try {
            const hash = await this.generateHash(pathOrUrl);
            
            // Check memory cache first
            const memoryEntry = this.cache.get(hash);
            if (memoryEntry && memoryEntry.type === type) {
                return memoryEntry.data;
            }

            // Check IndexedDB cache
            if (this.idb) {
                const transaction = this.idb.transaction(['vfs-cache'], 'readonly');
                const store = transaction.objectStore('vfs-cache');
                const request = store.get(hash);
                
                return new Promise((resolve) => {
                    request.onsuccess = () => {
                        const entry = request.result as VFSCacheEntry;
                        if (entry && entry.type === type && this.isCacheValid(entry)) {
                            // Add to memory cache
                            this.cache.set(hash, entry);
                            resolve(entry.data);
                        } else {
                            resolve(null);
                        }
                    };
                    
                    request.onerror = () => resolve(null);
                });
            }
        } catch (error) {
            console.warn('Cache read failed:', error);
        }

        return null;
    }

    private async setCache(pathOrUrl: string, data: any, type: 'json' | 'image' | 'audio'): Promise<void> {
        if (!this.config.cacheEnabled) {
            return;
        }

        try {
            const hash = await this.generateHash(pathOrUrl);
            
            // Add to memory cache
            this.cache.set(hash, {
                hash,
                data,
                timestamp: Date.now(),
                type
            });

            // Add to IndexedDB cache
            await this.setCacheToDB(hash, data, type);
        } catch (error) {
            console.warn('Cache write failed:', error);
        }
    }

    private async setCacheToDB(hash: string, data: any, type: 'json' | 'image' | 'audio'): Promise<void> {
        if (!this.idb) {
            return;
        }

        try {
            const transaction = this.idb.transaction(['vfs-cache'], 'readwrite');
            const store = transaction.objectStore('vfs-cache');
            
            const entry: VFSCacheEntry = {
                hash,
                data,
                timestamp: Date.now(),
                type
            };

            await new Promise<void>((resolve, reject) => {
                const request = store.put(entry);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            // Clean up old entries
            await this.cleanupCache();
        } catch (error) {
            console.warn('IndexedDB cache write failed:', error);
        }
    }

    private isCacheValid(entry: VFSCacheEntry): boolean {
        const expiryTime = this.config.cacheExpiryHours! * 60 * 60 * 1000;
        return Date.now() - entry.timestamp < expiryTime;
    }

    private async cleanupCache(): Promise<void> {
        if (!this.idb) {
            return;
        }

        try {
            const transaction = this.idb.transaction(['vfs-cache'], 'readwrite');
            const store = transaction.objectStore('vfs-cache');
            const index = store.index('timestamp');
            
            const cutoffTime = Date.now() - (this.config.cacheExpiryHours! * 60 * 60 * 1000);
            
            const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
            
            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
        } catch (error) {
            console.warn('Cache cleanup failed:', error);
        }
    }

    private async generateHash(input: string): Promise<string> {
        // Simple hash function for caching
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    private getFileType(filename: string): 'json' | 'image' | 'audio' {
        const extension = filename.split('.').pop()?.toLowerCase();
        
        if (extension === 'json') {
            return 'json';
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) {
            return 'image';
        } else if (['mp3', 'wav', 'ogg', 'webm'].includes(extension || '')) {
            return 'audio';
        } else {
            return 'json'; // Default
        }
    }

    /**
     * Clear all cached data
     */
    async clearCache(): Promise<void> {
        this.cache.clear();
        
        if (this.idb) {
            try {
                const transaction = this.idb.transaction(['vfs-cache'], 'readwrite');
                const store = transaction.objectStore('vfs-cache');
                await new Promise<void>((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.warn('Failed to clear IndexedDB cache:', error);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { memoryEntries: number; totalSize: number } {
        return {
            memoryEntries: this.cache.size,
            totalSize: 0 // TODO: Calculate actual size
        };
    }
} 