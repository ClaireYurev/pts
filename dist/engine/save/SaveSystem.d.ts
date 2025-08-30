import { SaveGameV1, SaveSlot, SaveSystemConfig } from './SaveTypes.js';
/**
 * Save system for managing game saves in IndexedDB
 */
export declare class SaveSystem {
    private idb;
    private canvas;
    private packId;
    private engineVersion;
    private thumbnailWidth;
    private thumbnailHeight;
    constructor(config: SaveSystemConfig);
    /**
     * List all saves for this pack (returns array of length 3)
     */
    list(): Promise<(SaveGameV1 | null)[]>;
    /**
     * Save game data to specified slot
     */
    save(slot: SaveSlot, data: Partial<SaveGameV1>): Promise<void>;
    /**
     * Load game data from specified slot
     */
    load(slot: SaveSlot): Promise<SaveGameV1 | null>;
    /**
     * Clear save data from specified slot
     */
    clear(slot: SaveSlot): Promise<void>;
    /**
     * Capture thumbnail from canvas
     */
    captureThumbnail(): string;
    /**
     * Validate and migrate save data if needed
     */
    private validateAndMigrate;
    /**
     * Check if save data is valid SaveGameV1
     */
    private isValidSaveGameV1;
    /**
     * Get save metadata for UI display
     */
    getSaveMetadata(slot: SaveSlot): Promise<{
        timestamp: number;
        levelIndex: number;
        playtimeSec: number;
        hasThumbnail: boolean;
    } | null>;
    /**
     * Close database connection
     */
    close(): void;
}
//# sourceMappingURL=SaveSystem.d.ts.map