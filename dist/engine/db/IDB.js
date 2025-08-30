/**
 * Simple IndexedDB wrapper for save system
 */
export class IDB {
    constructor(config) {
        this.db = null;
        this.config = config;
    }
    async openDB() {
        if (this.db) {
            return this.db;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.name, this.config.version);
            request.onerror = () => {
                reject(new Error(`Failed to open database: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.config.storeName)) {
                    db.createObjectStore(this.config.storeName, { keyPath: 'slot' });
                }
            };
        });
    }
    async put(key, value) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.config.storeName], 'readwrite');
            const store = transaction.objectStore(this.config.storeName);
            const request = store.put({ slot: key, data: value });
            request.onerror = () => {
                reject(new Error(`Failed to save data: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    async get(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.config.storeName], 'readonly');
            const store = transaction.objectStore(this.config.storeName);
            const request = store.get(key);
            request.onerror = () => {
                reject(new Error(`Failed to load data: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
        });
    }
    async delete(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.config.storeName], 'readwrite');
            const store = transaction.objectStore(this.config.storeName);
            const request = store.delete(key);
            request.onerror = () => {
                reject(new Error(`Failed to delete data: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }
    async getAll() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.config.storeName], 'readonly');
            const store = transaction.objectStore(this.config.storeName);
            const request = store.getAll();
            request.onerror = () => {
                reject(new Error(`Failed to load all data: ${request.error?.message}`));
            };
            request.onsuccess = () => {
                const results = request.result;
                resolve(results.map(item => ({ slot: item.slot, data: item.data })));
            };
        });
    }
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
//# sourceMappingURL=IDB.js.map