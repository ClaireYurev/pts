/**
 * Simple IndexedDB wrapper for save system
 */

export interface IDBConfig {
    name: string;
    version: number;
    stores: {
        name: string;
        keyPath: string;
        indexes?: Array<{
            name: string;
            keyPath: string;
            options?: IDBIndexParameters;
        }>;
    }[];
}

export class IDB {
    private db: IDBDatabase | null = null;
    private config: IDBConfig;

    constructor(config: IDBConfig) {
        this.config = config;
    }

    async open(): Promise<void> {
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
                const db = (event.target as IDBOpenDBRequest).result;
                
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

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async get<T>(storeName: string, key: string): Promise<T | null> {
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

    async put<T>(storeName: string, value: T): Promise<void> {
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

    async delete(storeName: string, key: string): Promise<void> {
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

    async getAll<T>(storeName: string): Promise<T[]> {
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

    async clear(storeName: string): Promise<void> {
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

    async count(storeName: string): Promise<number> {
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

    isOpen(): boolean {
        return this.db !== null;
    }

    getDatabaseName(): string {
        return this.config.name;
    }
} 