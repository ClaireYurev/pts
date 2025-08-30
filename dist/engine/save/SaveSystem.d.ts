import { SaveGameV1, SaveSlot, SaveResult, LoadResult, SaveSystemStats } from './SaveTypes.js';
export declare class SaveSystem {
    private db;
    private readonly STORE_NAME;
    private readonly MAX_SLOTS;
    private isInitialized;
    constructor(config?: any);
    initialize(): Promise<void>;
    listSaves(): Promise<SaveSlot[]>;
    save(slot: number, saveData: Omit<SaveGameV1, 'slot' | 'timestamp'>): Promise<SaveResult>;
    load(slot: number): Promise<LoadResult>;
    clear(slot: number): Promise<boolean>;
    clearAll(): Promise<boolean>;
    getStats(): Promise<SaveSystemStats>;
    exportSave(slot: number): Promise<string | null>;
    importSave(slot: number, saveDataJson: string): Promise<SaveResult>;
    private ensureInitialized;
    private validateSaveData;
    private generateThumbnail;
    close(): Promise<void>;
    getInitializedState(): boolean;
    getMaxSlots(): number;
}
//# sourceMappingURL=SaveSystem.d.ts.map