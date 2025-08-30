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

export class SaveManager {
    private storageKey = "PrinceTSSaves";
    private static readonly CURRENT_VERSION = 1;
    private static readonly SAVE_DATA_VERSION = 1;

    constructor() {
        if (!localStorage.getItem(this.storageKey)) {
            const empty: Array<SaveData | null> = [null, null, null];
            localStorage.setItem(this.storageKey, JSON.stringify(empty));
        }
    }

    /**
     * Generate a simple checksum for save data integrity
     */
    private generateChecksum(data: Omit<SaveData, 'checksum'>): string {
        const dataString = JSON.stringify(data);
        let checksum = 0;
        for (let i = 0; i < dataString.length; i++) {
            checksum = ((checksum << 5) - checksum + dataString.charCodeAt(i)) & 0xFFFFFFFF;
        }
        return checksum.toString(16);
    }

    /**
     * Validate save data integrity
     */
    private validateSaveDataIntegrity(data: SaveData): boolean {
        if (!data.checksum) {
            console.warn("Save data missing checksum");
            return false;
        }

        const dataWithoutChecksum = { ...data };
        delete dataWithoutChecksum.checksum;
        
        const expectedChecksum = this.generateChecksum(dataWithoutChecksum);
        const isValid = data.checksum === expectedChecksum;
        
        if (!isValid) {
            console.warn("Save data checksum validation failed");
        }
        
        return isValid;
    }

    /**
     * Migrate save data to current version if needed
     */
    private migrateSaveData(data: any): SaveData | null {
        if (!data || typeof data !== 'object') {
            return null;
        }

        // Handle version 0 (no version field)
        if (!data.version) {
            const migratedData: SaveData = {
                level: data.level || 1,
                playerX: data.playerX || 0,
                playerY: data.playerY || 0,
                health: data.health || 100,
                inventory: Array.isArray(data.inventory) ? data.inventory : [],
                timestamp: data.timestamp || Date.now(),
                packName: data.packName || 'default',
                version: SaveManager.SAVE_DATA_VERSION
            };
            
            // Generate checksum for migrated data
            migratedData.checksum = this.generateChecksum(migratedData);
            return migratedData;
        }

        // Handle future versions here
        if (data.version > SaveManager.SAVE_DATA_VERSION) {
            console.warn(`Save data version ${data.version} is newer than supported version ${SaveManager.SAVE_DATA_VERSION}`);
            return null;
        }

        return data as SaveData;
    }

    public save(slot: number, data: SaveData): void {
        if (!this.isLocalStorageAvailable()) {
            console.warn("localStorage not available, cannot save game");
            return;
        }

        // Validate slot number
        if (slot < 0 || slot > 9) {
            console.error("Invalid save slot number:", slot);
            return;
        }

        // Validate save data
        if (!this.validateSaveData(data)) {
            console.error("Invalid save data provided");
            return;
        }

        try {
            // Prepare save data with version and checksum
            const saveData: SaveData = {
                ...data,
                version: SaveManager.SAVE_DATA_VERSION,
                timestamp: Date.now()
            };
            
            // Generate checksum for data integrity
            saveData.checksum = this.generateChecksum(saveData);

            // Check storage quota before saving
            if (!this.checkStorageQuota()) {
                console.warn("Storage quota exceeded, attempting to clear old saves");
                this.clearOldestSave();
                
                // Try again after clearing
                if (!this.checkStorageQuota()) {
                    console.error("Still insufficient storage after clearing old saves");
                    return;
                }
            }

            const saves = this.loadAll();
            saves[slot] = saveData;
            
            localStorage.setItem(this.storageKey, JSON.stringify(saves));
            console.log(`Game saved to slot ${slot + 1} with checksum: ${saveData.checksum}`);
        } catch (error) {
            console.error("Failed to save game:", error);
        }
    }

    private validateSaveData(data: SaveData): boolean {
        // Check if all required fields exist
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Validate required fields
        if (typeof data.level !== 'number' || data.level < 0) {
            console.warn("Invalid level in save data");
            return false;
        }

        if (typeof data.playerX !== 'number' || !isFinite(data.playerX)) {
            console.warn("Invalid playerX in save data");
            return false;
        }

        if (typeof data.playerY !== 'number' || !isFinite(data.playerY)) {
            console.warn("Invalid playerY in save data");
            return false;
        }

        if (typeof data.health !== 'number' || data.health < 0 || data.health > 9999) {
            console.warn("Invalid health in save data");
            return false;
        }

        if (!Array.isArray(data.inventory)) {
            console.warn("Invalid inventory in save data");
            return false;
        }

        if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
            console.warn("Invalid timestamp in save data");
            return false;
        }

        return true;
    }

    private isLocalStorageAvailable(): boolean {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    private checkStorageQuota(): boolean {
        try {
            // Try to save a test item to check if we have space
            const testKey = '__quota_test__';
            const testData = 'x'.repeat(1024); // 1KB test data
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage quota check failed:', e);
            
            // Try to free up space by clearing old saves
            try {
                this.clearOldestSave();
                // Test again after clearing
                const testKey2 = '__quota_test_2__';
                const testData2 = 'x'.repeat(512); // Smaller test
                localStorage.setItem(testKey2, testData2);
                localStorage.removeItem(testKey2);
                return true;
            } catch (clearError) {
                console.error('Failed to free up localStorage space:', clearError);
                // Try to clear all saves as last resort
                try {
                    this.clearAllSaves();
                    return true;
                } catch (finalError) {
                    console.error('Failed to clear all saves:', finalError);
                    return false;
                }
            }
        }
    }

    private clearAllSaves(): void {
        console.log('Clearing all saves due to storage quota exceeded');
        localStorage.setItem(this.storageKey, JSON.stringify([null, null, null]));
    }

    private clearOldestSave(): void {
        const saves = this.loadAll();
        let oldestIndex = -1;
        let oldestTime = Infinity;
        
        for (let i = 0; i < saves.length; i++) {
            const save = saves[i];
            if (save && save.timestamp && save.timestamp < oldestTime) {
                oldestTime = save.timestamp;
                oldestIndex = i;
            }
        }
        
        if (oldestIndex !== -1) {
            console.log(`Clearing oldest save (slot ${oldestIndex + 1}) to free space`);
            this.clear(oldestIndex);
        }
    }

    public load(slot: number): SaveData | null {
        if (!this.isLocalStorageAvailable()) {
            console.warn("localStorage not available, cannot load game");
            return null;
        }

        // Validate slot number
        if (slot < 0 || slot > 9) {
            console.error("Invalid save slot number:", slot);
            return null;
        }

        try {
            const saves = this.loadAll();
            const save = saves[slot];
            
            if (!save) {
                return null;
            }

            // Migrate save data if needed
            const migratedSave = this.migrateSaveData(save);
            if (!migratedSave) {
                console.error(`Save data in slot ${slot + 1} could not be migrated`);
                this.clear(slot);
                return null;
            }

            // Validate the migrated save data
            if (!this.validateSaveData(migratedSave)) {
                console.error(`Save data in slot ${slot + 1} is corrupted`);
                this.clear(slot); // Clear corrupted save
                return null;
            }

            // Validate data integrity if checksum is present
            if (migratedSave.checksum && !this.validateSaveDataIntegrity(migratedSave)) {
                console.error(`Save data in slot ${slot + 1} failed integrity check`);
                this.clear(slot); // Clear corrupted save
                return null;
            }

            return migratedSave;
        } catch (error) {
            console.error("Failed to load game:", error);
            return null;
        }
    }

    public loadAll(): Array<SaveData | null> {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return [null, null, null];
            
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length !== 3) {
                console.warn('Invalid save data format, resetting to empty slots');
                return [null, null, null];
            }
            
            return parsed;
        } catch (error) {
            console.error('Failed to load save data:', error);
            return [null, null, null];
        }
    }

    public clear(slot: number): void {
        const all = this.loadAll();
        all[slot] = null;
        localStorage.setItem(this.storageKey, JSON.stringify(all));
        console.log(`Slot ${slot + 1} cleared`);
    }

    public hasSave(slot: number): boolean {
        return this.load(slot) !== null;
    }

    public getSaveInfo(slot: number): { exists: boolean; timestamp?: number; level?: number } {
        const save = this.load(slot);
        return {
            exists: save !== null,
            timestamp: save?.timestamp,
            level: save?.level
        };
    }
} 