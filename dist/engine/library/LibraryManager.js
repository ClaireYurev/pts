import { VFS } from '../assets/VFS.js';
export class LibraryManager {
    constructor(config = {}) {
        this.registry = new Map();
        this.currentPack = null;
        this.idb = null;
        this.config = {
            builtinPacksPath: 'packs/manifest.json',
            cacheEnabled: true,
            ...config
        };
        this.vfs = config.vfs || new VFS({ cacheEnabled: this.config.cacheEnabled });
        if (this.config.cacheEnabled) {
            this.initLibraryDB();
        }
    }
    async initLibraryDB() {
        try {
            const request = indexedDB.open('GameLibrary', 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('library')) {
                    db.createObjectStore('library', { keyPath: 'id' });
                }
            };
            request.onsuccess = () => {
                this.idb = request.result;
                this.loadRegistryFromDB();
            };
            request.onerror = () => {
                console.warn('Failed to initialize library database');
            };
        }
        catch (error) {
            console.warn('Library database initialization failed:', error);
        }
    }
    /**
     * Initialize the library with built-in packs
     */
    async initialize() {
        try {
            // Load built-in packs from manifest
            await this.loadBuiltinPacks();
            // Load cached packs from IndexedDB
            if (this.config.cacheEnabled) {
                await this.loadRegistryFromDB();
            }
            console.log(`Library initialized with ${this.registry.size} packs`);
        }
        catch (error) {
            console.error('Failed to initialize library:', error);
        }
    }
    /**
     * Load built-in packs from manifest.json
     */
    async loadBuiltinPacks() {
        try {
            const manifest = await this.vfs.readJson(this.config.builtinPacksPath);
            if (manifest && manifest.packs) {
                for (const packInfo of manifest.packs) {
                    const item = {
                        id: packInfo.id,
                        name: packInfo.name,
                        description: packInfo.description,
                        cover: packInfo.cover,
                        source: 'builtin',
                        urlOrKey: packInfo.path || packInfo.id,
                        installed: true
                    };
                    this.registry.set(item.id, item);
                }
            }
        }
        catch (error) {
            console.warn('Failed to load built-in packs:', error);
        }
    }
    /**
     * Load registry from IndexedDB
     */
    async loadRegistryFromDB() {
        if (!this.idb) {
            return;
        }
        try {
            const transaction = this.idb.transaction(['library'], 'readonly');
            const store = transaction.objectStore('library');
            const request = store.getAll();
            request.onsuccess = () => {
                const items = request.result;
                for (const item of items) {
                    if (item.source !== 'builtin') {
                        this.registry.set(item.id, item);
                    }
                }
            };
        }
        catch (error) {
            console.warn('Failed to load registry from DB:', error);
        }
    }
    /**
     * Save registry to IndexedDB
     */
    async saveRegistryToDB() {
        if (!this.idb) {
            return;
        }
        try {
            const transaction = this.idb.transaction(['library'], 'readwrite');
            const store = transaction.objectStore('library');
            for (const item of this.registry.values()) {
                if (item.source !== 'builtin') {
                    await new Promise((resolve, reject) => {
                        const request = store.put(item);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }
        }
        catch (error) {
            console.warn('Failed to save registry to DB:', error);
        }
    }
    /**
     * Get all library items
     */
    getLibraryItems() {
        return Array.from(this.registry.values());
    }
    /**
     * Get a specific library item
     */
    getLibraryItem(id) {
        return this.registry.get(id);
    }
    /**
     * Get the currently loaded pack
     */
    getCurrentPack() {
        return this.currentPack;
    }
    /**
     * Load a pack from URL
     */
    async loadPackFromUrl(url) {
        try {
            // Validate URL
            if (!url.startsWith('https://')) {
                throw new Error('Only HTTPS URLs are supported for security');
            }
            // Load and validate pack
            const packData = await this.vfs.readJson(url);
            const validatedPack = this.validatePack(packData);
            // Create library item
            const item = {
                id: validatedPack.id,
                name: validatedPack.name,
                description: validatedPack.description,
                cover: validatedPack.cover,
                source: 'url',
                urlOrKey: url,
                installed: false,
                pack: validatedPack
            };
            // Add to registry
            this.registry.set(item.id, item);
            // Save to IndexedDB
            if (this.config.cacheEnabled) {
                await this.saveRegistryToDB();
            }
            console.log(`Loaded pack from URL: ${validatedPack.name}`);
            return item;
        }
        catch (error) {
            console.error('Failed to load pack from URL:', error);
            throw error;
        }
    }
    /**
     * Load a pack from local file
     */
    async loadPackFromFile(file) {
        try {
            // Validate file type
            if (!file.name.endsWith('.ptspack.json')) {
                throw new Error('Invalid file type. Expected .ptspack.json file');
            }
            // Read and validate pack
            const packData = await this.vfs.readLocalFile(file);
            const validatedPack = this.validatePack(packData);
            // Create library item
            const item = {
                id: validatedPack.id,
                name: validatedPack.name,
                description: validatedPack.description,
                cover: validatedPack.cover,
                source: 'local',
                urlOrKey: file.name,
                installed: false,
                pack: validatedPack
            };
            // Add to registry (ephemeral, not saved to DB)
            this.registry.set(item.id, item);
            console.log(`Loaded pack from file: ${validatedPack.name}`);
            return item;
        }
        catch (error) {
            console.error('Failed to load pack from file:', error);
            throw error;
        }
    }
    /**
     * Install a local pack to cache
     */
    async installLocalPack(itemId) {
        const item = this.registry.get(itemId);
        if (!item || item.source !== 'local') {
            throw new Error('Invalid item or not a local pack');
        }
        try {
            item.installed = true;
            // Save to IndexedDB
            if (this.config.cacheEnabled) {
                await this.saveRegistryToDB();
            }
            console.log(`Installed local pack: ${item.name}`);
        }
        catch (error) {
            console.error('Failed to install local pack:', error);
            throw error;
        }
    }
    /**
     * Switch to a different pack
     */
    async switchPack(packId) {
        const item = this.registry.get(packId);
        if (!item) {
            throw new Error(`Pack not found: ${packId}`);
        }
        try {
            // Load pack data if not already loaded
            if (!item.pack) {
                if (item.source === 'builtin') {
                    item.pack = await this.vfs.readJson(item.urlOrKey);
                }
                else if (item.source === 'url') {
                    item.pack = await this.vfs.readJson(item.urlOrKey);
                }
                else {
                    throw new Error('Local pack data not available');
                }
            }
            // Update last played timestamp
            item.lastPlayed = Date.now();
            // Set as current pack
            this.currentPack = packId;
            // Save to IndexedDB
            if (this.config.cacheEnabled) {
                await this.saveRegistryToDB();
            }
            if (item.pack) {
                console.log(`Switched to pack: ${item.pack.name}`);
                return item.pack;
            }
            else {
                throw new Error('Pack data is undefined');
            }
        }
        catch (error) {
            console.error('Failed to switch pack:', error);
            throw error;
        }
    }
    /**
     * Remove a pack from the library
     */
    async removePack(packId) {
        const item = this.registry.get(packId);
        if (!item) {
            throw new Error(`Pack not found: ${packId}`);
        }
        // Don't allow removing built-in packs
        if (item.source === 'builtin') {
            throw new Error('Cannot remove built-in packs');
        }
        try {
            // Remove from registry
            this.registry.delete(packId);
            // Remove from IndexedDB
            if (this.idb) {
                const transaction = this.idb.transaction(['library'], 'readwrite');
                const store = transaction.objectStore('library');
                await new Promise((resolve, reject) => {
                    const request = store.delete(packId);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            // Clear current pack if it was the one removed
            if (this.currentPack === packId) {
                this.currentPack = null;
            }
            console.log(`Removed pack: ${item.name}`);
        }
        catch (error) {
            console.error('Failed to remove pack:', error);
            throw error;
        }
    }
    /**
     * Validate pack data structure
     */
    validatePack(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid pack data: not an object');
        }
        if (!data.id || typeof data.id !== 'string') {
            throw new Error('Invalid pack data: missing or invalid id');
        }
        if (!data.name || typeof data.name !== 'string') {
            throw new Error('Invalid pack data: missing or invalid name');
        }
        if (!data.version || typeof data.version !== 'string') {
            throw new Error('Invalid pack data: missing or invalid version');
        }
        if (!data.levels || !Array.isArray(data.levels)) {
            throw new Error('Invalid pack data: missing or invalid levels array');
        }
        // Basic schema validation (stub - can be expanded)
        const pack = {
            id: data.id,
            name: data.name,
            description: data.description,
            version: data.version,
            author: data.author,
            cover: data.cover,
            levels: data.levels,
            assets: data.assets || {},
            metadata: data.metadata
        };
        return pack;
    }
    /**
     * Get pack statistics
     */
    getStats() {
        const items = Array.from(this.registry.values());
        return {
            totalPacks: items.length,
            builtinPacks: items.filter(item => item.source === 'builtin').length,
            urlPacks: items.filter(item => item.source === 'url').length,
            localPacks: items.filter(item => item.source === 'local').length,
            installedPacks: items.filter(item => item.installed).length
        };
    }
    /**
     * Clear all cached data
     */
    async clearCache() {
        await this.vfs.clearCache();
        // Clear non-builtin packs from registry
        for (const [id, item] of this.registry.entries()) {
            if (item.source !== 'builtin') {
                this.registry.delete(id);
            }
        }
        // Clear IndexedDB
        if (this.idb) {
            try {
                const transaction = this.idb.transaction(['library'], 'readwrite');
                const store = transaction.objectStore('library');
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            catch (error) {
                console.warn('Failed to clear library database:', error);
            }
        }
    }
}
//# sourceMappingURL=LibraryManager.js.map