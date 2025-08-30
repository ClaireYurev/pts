/**
 * Simple IndexedDB wrapper for save system
 */
export class IDB {
    constructor(config) {
        this.db = null;
        this.config = config;
    }
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.name, this.config.version);
            request.onerror = () => {
                reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object stores
                this.config.stores.forEach(storeConfig => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
                        // Create indexes
                        storeConfig.indexes?.forEach(indexConfig => {
                            store.createIndex(indexConfig.name, indexConfig.keyPath, indexConfig.options);
                        });
                    }
                });
            };
        });
    }
    async close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
    async get(storeName, key) {
        if (!this.db) {
            throw new Error('Database not open');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not open'));
                return;
            }
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onerror = () => {
                reject(new Error(`Failed to get from ${storeName}: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve(request.result || null);
            };
        });
    }
    async put(storeName, value) {
        if (!this.db) {
            throw new Error('Database not open');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not open'));
                return;
            }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);
            request.onerror = () => {
                reject(new Error(`Failed to put to ${storeName}: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    async delete(storeName, key) {
        if (!this.db) {
            throw new Error('Database not open');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not open'));
                return;
            }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            request.onerror = () => {
                reject(new Error(`Failed to delete from ${storeName}: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    async getAll(storeName) {
        if (!this.db) {
            throw new Error('Database not open');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not open'));
                return;
            }
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onerror = () => {
                reject(new Error(`Failed to get all from ${storeName}: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve(request.result || []);
            };
        });
    }
    async clear(storeName) {
        if (!this.db) {
            throw new Error('Database not open');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not open'));
                return;
            }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onerror = () => {
                reject(new Error(`Failed to clear ${storeName}: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    async count(storeName) {
        if (!this.db) {
            throw new Error('Database not open');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not open'));
                return;
            }
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            request.onerror = () => {
                reject(new Error(`Failed to count ${storeName}: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }
    isOpen() {
        return this.db !== null;
    }
    getDatabaseName() {
        return this.config.name;
    }
}
//# sourceMappingURL=IDB.js.map