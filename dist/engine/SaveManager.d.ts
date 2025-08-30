export interface SaveData {
    level: number;
    playerX: number;
    playerY: number;
    health: number;
    inventory: string[];
    timestamp: number;
    packName?: string;
    checksum?: string;
    version: number;
}
export declare class SaveManager {
    private storageKey;
    private static readonly CURRENT_VERSION;
    private static readonly SAVE_DATA_VERSION;
    constructor();
    /**
     * Generate a simple checksum for save data integrity
     */
    private generateChecksum;
    /**
     * Validate save data integrity
     */
    private validateSaveDataIntegrity;
    /**
     * Migrate save data to current version if needed
     */
    private migrateSaveData;
    save(slot: number, data: SaveData): void;
    private validateSaveData;
    private isLocalStorageAvailable;
    private checkStorageQuota;
    private clearAllSaves;
    private clearOldestSave;
    load(slot: number): SaveData | null;
    loadAll(): Array<SaveData | null>;
    clear(slot: number): void;
    hasSave(slot: number): boolean;
    getSaveInfo(slot: number): {
        exists: boolean;
        timestamp?: number;
        level?: number;
    };
}
//# sourceMappingURL=SaveManager.d.ts.map