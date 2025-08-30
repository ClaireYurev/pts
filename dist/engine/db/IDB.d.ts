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
export declare class IDB {
    private db;
    private config;
    constructor(config: IDBConfig);
    open(): Promise<void>;
    close(): Promise<void>;
    get<T>(storeName: string, key: string): Promise<T | null>;
    put<T>(storeName: string, value: T): Promise<void>;
    delete(storeName: string, key: string): Promise<void>;
    getAll<T>(storeName: string): Promise<T[]>;
    clear(storeName: string): Promise<void>;
    count(storeName: string): Promise<number>;
    isOpen(): boolean;
    getDatabaseName(): string;
}
//# sourceMappingURL=IDB.d.ts.map