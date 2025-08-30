/**
 * Simple IndexedDB wrapper for save system
 */
export interface IDBConfig {
    name: string;
    version: number;
    storeName: string;
}
export declare class IDB {
    private db;
    private config;
    constructor(config: IDBConfig);
    openDB(): Promise<IDBDatabase>;
    put(key: string | number, value: any): Promise<void>;
    get(key: string | number): Promise<any | null>;
    delete(key: string | number): Promise<void>;
    getAll(): Promise<any[]>;
    close(): void;
}
//# sourceMappingURL=IDB.d.ts.map