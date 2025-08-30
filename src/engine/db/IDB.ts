/**
 * Simple IndexedDB wrapper for save system
 */

export interface IDBConfig {
    name: string;
    version: number;
    storeName: string;
}

export class IDB {
    private db: IDBDatabase | null = null;
    private config: IDBConfig;

    constructor(config: IDBConfig) {
        this.config = config;
    }

    async openDB(): Promise<IDBDatabase> {
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
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.config.storeName)) {
                    db.createObjectStore(this.config.storeName, { keyPath: 'slot' });
                }
            };
        });
    }

    async put(key: string | number, value: any): Promise<void> {
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

    async get(key: string | number): Promise<any | null> {
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

    async delete(key: string | number): Promise<void> {
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

    async getAll(): Promise<any[]> {
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

    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
} 