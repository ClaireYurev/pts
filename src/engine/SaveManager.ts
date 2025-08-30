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
    private readonly SAVE_VERSION = "1.0.0";
    private readonly CHECKSUM_ALGORITHM = "SHA-256";

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
            console.error("Local storage not available");
            return;
        }

        try {
            // Validate save data before saving
            if (!this.validateSaveData(data)) {
                console.error("Invalid save data provided");
                return;
            }

            // Add metadata to save data
            const saveDataWithMetadata = {
                ...data,
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                checksum: this.generateChecksum(data)
            };

            // Validate the complete save data
            if (!this.validateCompleteSaveData(saveDataWithMetadata)) {
                console.error("Save data validation failed after adding metadata");
                return;
            }

            const key = `${this.storageKey}_${slot}`;
            const serializedData = JSON.stringify(saveDataWithMetadata);
            
            // Check storage quota before saving
            if (!this.checkStorageQuota(serializedData)) {
                console.error("Insufficient storage space for save data");
                return;
            }

            localStorage.setItem(key, serializedData);
            console.log(`Game saved successfully to slot ${slot}`);
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

    private validateCompleteSaveData(data: any): boolean {
        // Check if all required metadata fields exist
        if (!data || typeof data !== 'object') {
            return false;
        }

        if (typeof data.version !== 'string' || data.version.length === 0) {
            console.warn("Missing or invalid version in save data");
            return false;
        }

        if (typeof data.timestamp !== 'number' || data.timestamp <= 0) {
            console.warn("Missing or invalid timestamp in save data");
            return false;
        }

        if (typeof data.checksum !== 'string' || data.checksum.length === 0) {
            console.warn("Missing or invalid checksum in save data");
            return false;
        }

        // Validate the actual save data
        const { version, timestamp, checksum, ...saveData } = data;
        return this.validateSaveData(saveData as SaveData);
    }

    private generateChecksum(data: SaveData): string {
        try {
            // Create a deterministic string representation
            const dataString = JSON.stringify(data, Object.keys(data).sort());
            
            // Simple checksum implementation (in production, use crypto.subtle.digest)
            let checksum = 0;
            for (let i = 0; i < dataString.length; i++) {
                checksum = ((checksum << 5) - checksum + dataString.charCodeAt(i)) & 0xFFFFFFFF;
            }
            
            return checksum.toString(16);
        } catch (error) {
            console.error("Failed to generate checksum:", error);
            return "";
        }
    }

    private verifyChecksum(saveDataWithMetadata: any): boolean {
        try {
            const { version, timestamp, checksum, ...saveData } = saveDataWithMetadata;
            const expectedChecksum = this.generateChecksum(saveData as SaveData);
            return checksum === expectedChecksum;
        } catch (error) {
            console.error("Failed to verify checksum:", error);
            return false;
        }
    }

    private isVersionCompatible(version: string): boolean {
        // Simple version compatibility check
        const currentVersion = this.SAVE_VERSION.split('.');
        const saveVersion = version.split('.');
        
        // Major version must match
        return currentVersion[0] === saveVersion[0];
    }

    private migrateSaveData(saveDataWithMetadata: any): SaveData | null {
        try {
            console.log("Migrating save data from version", saveDataWithMetadata.version, "to", this.SAVE_VERSION);
            
            // Extract the actual save data
            const { version, timestamp, checksum, ...saveData } = saveDataWithMetadata;
            
            // Apply migration rules based on version
            const migratedData = this.applyMigrationRules(saveData, version);
            
            // Validate migrated data
            if (this.validateSaveData(migratedData)) {
                console.log("Save data migration completed successfully");
                return migratedData;
            } else {
                console.error("Save data migration failed validation");
                return null;
            }
        } catch (error) {
            console.error("Failed to migrate save data:", error);
            return null;
        }
    }

    private applyMigrationRules(data: any, fromVersion: string): SaveData {
        // Apply version-specific migration rules
        const migratedData = { ...data };
        
        // Example migration: add missing fields with defaults
        if (!migratedData.inventory) {
            migratedData.inventory = [];
        }
        
        if (typeof migratedData.health !== 'number') {
            migratedData.health = 100;
        }
        
        return migratedData as SaveData;
    }

    private attemptSaveDataRepair(saveDataWithMetadata: any): SaveData | null {
        try {
            console.log("Attempting to repair corrupted save data");
            
            // Extract the actual save data
            const { version, timestamp, checksum, ...saveData } = saveDataWithMetadata;
            
            // Try to repair common issues
            const repairedData = this.repairSaveData(saveData);
            
            // Validate repaired data
            if (this.validateSaveData(repairedData)) {
                console.log("Save data repair completed successfully");
                return repairedData;
            } else {
                console.error("Save data repair failed validation");
                return null;
            }
        } catch (error) {
            console.error("Failed to repair save data:", error);
            return null;
        }
    }

    private repairSaveData(data: any): SaveData {
        // Repair common save data issues
        const repairedData = { ...data };
        
        // Fix missing or invalid fields
        if (typeof repairedData.level !== 'number' || repairedData.level < 0) {
            repairedData.level = 1;
        }
        
        if (typeof repairedData.playerX !== 'number' || !isFinite(repairedData.playerX)) {
            repairedData.playerX = 0;
        }
        
        if (typeof repairedData.playerY !== 'number' || !isFinite(repairedData.playerY)) {
            repairedData.playerY = 0;
        }
        
        if (typeof repairedData.health !== 'number' || repairedData.health < 0 || repairedData.health > 9999) {
            repairedData.health = 100;
        }
        
        if (!Array.isArray(repairedData.inventory)) {
            repairedData.inventory = [];
        }
        
        if (typeof repairedData.timestamp !== 'number' || repairedData.timestamp <= 0) {
            repairedData.timestamp = Date.now();
        }
        
        return repairedData as SaveData;
    }

    private checkStorageQuota(data: string): boolean {
        try {
            // Estimate storage usage
            const estimatedSize = new Blob([data]).size;
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            
            if (estimatedSize > maxSize) {
                console.warn("Save data exceeds size limit");
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Failed to check storage quota:", error);
            return false;
        }
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