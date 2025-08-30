import { IDB } from '../db/IDB.js';
export class SaveSystem {
    constructor(config) {
        this.STORE_NAME = 'saves';
        this.MAX_SLOTS = 3;
        this.isInitialized = false;
        this.db = new IDB({
            name: 'PTSGameSaves',
            version: 1,
            stores: [{
                    name: this.STORE_NAME,
                    keyPath: 'slot',
                    indexes: [
                        { name: 'timestamp', keyPath: 'timestamp' },
                        { name: 'packId', keyPath: 'packId' }
                    ]
                }]
        });
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            await this.db.open();
            this.isInitialized = true;
            console.log('SaveSystem initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize SaveSystem:', error);
            throw error;
        }
    }
    async listSaves() {
        await this.ensureInitialized();
        try {
            const saves = await this.db.getAll(this.STORE_NAME);
            const slots = [];
            // Initialize all slots
            for (let i = 0; i < this.MAX_SLOTS; i++) {
                const save = saves.find(s => s.slot === i);
                if (save) {
                    slots.push({
                        slot: i,
                        saveData: save,
                        isEmpty: false,
                        timestamp: save.timestamp,
                        level: save.level,
                        thumbnail: save.thumbnail
                    });
                }
                else {
                    slots.push({
                        slot: i,
                        saveData: null,
                        isEmpty: true,
                        timestamp: 0,
                        level: 0,
                        thumbnail: ''
                    });
                }
            }
            return slots;
        }
        catch (error) {
            console.error('Failed to list saves:', error);
            throw error;
        }
    }
    async save(slot, saveData) {
        await this.ensureInitialized();
        if (slot < 0 || slot >= this.MAX_SLOTS) {
            return {
                success: false,
                slot,
                error: `Invalid slot number: ${slot}`
            };
        }
        try {
            // Generate thumbnail if not provided
            let thumbnail = saveData.thumbnail;
            if (!thumbnail) {
                thumbnail = await this.generateThumbnail();
            }
            const fullSaveData = {
                ...saveData,
                slot,
                timestamp: Date.now(),
                thumbnail
            };
            await this.db.put(this.STORE_NAME, fullSaveData);
            const metadata = {
                slot,
                timestamp: fullSaveData.timestamp,
                level: fullSaveData.level,
                room: fullSaveData.room,
                playerHealth: fullSaveData.player.health,
                playerMaxHealth: fullSaveData.player.maxHealth,
                hasSword: fullSaveData.player.hasSword,
                packId: fullSaveData.packId,
                packVersion: fullSaveData.packVersion
            };
            console.log(`Save successful in slot ${slot}`);
            return {
                success: true,
                slot,
                metadata
            };
        }
        catch (error) {
            console.error(`Failed to save in slot ${slot}:`, error);
            return {
                success: false,
                slot,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async load(slot) {
        await this.ensureInitialized();
        if (slot < 0 || slot >= this.MAX_SLOTS) {
            return {
                success: false,
                error: `Invalid slot number: ${slot}`
            };
        }
        try {
            const saveData = await this.db.get(this.STORE_NAME, slot.toString());
            if (!saveData) {
                return {
                    success: false,
                    error: `No save data found in slot ${slot}`
                };
            }
            // Validate save data version
            if (saveData.version !== '1.0') {
                return {
                    success: false,
                    error: `Unsupported save version: ${saveData.version}`
                };
            }
            console.log(`Load successful from slot ${slot}`);
            return {
                success: true,
                saveData
            };
        }
        catch (error) {
            console.error(`Failed to load from slot ${slot}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async clear(slot) {
        await this.ensureInitialized();
        if (slot < 0 || slot >= this.MAX_SLOTS) {
            console.error(`Invalid slot number: ${slot}`);
            return false;
        }
        try {
            await this.db.delete(this.STORE_NAME, slot.toString());
            console.log(`Slot ${slot} cleared successfully`);
            return true;
        }
        catch (error) {
            console.error(`Failed to clear slot ${slot}:`, error);
            return false;
        }
    }
    async clearAll() {
        await this.ensureInitialized();
        try {
            await this.db.clear(this.STORE_NAME);
            console.log('All save slots cleared successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to clear all saves:', error);
            return false;
        }
    }
    async getStats() {
        await this.ensureInitialized();
        try {
            const saves = await this.db.getAll(this.STORE_NAME);
            const usedSlots = saves.length;
            const totalSize = saves.reduce((size, save) => {
                return size + JSON.stringify(save).length;
            }, 0);
            const lastSaveTime = saves.length > 0 ? Math.max(...saves.map(s => s.timestamp)) : 0;
            return {
                totalSlots: this.MAX_SLOTS,
                usedSlots,
                totalSize,
                lastSaveTime
            };
        }
        catch (error) {
            console.error('Failed to get save stats:', error);
            return {
                totalSlots: this.MAX_SLOTS,
                usedSlots: 0,
                totalSize: 0,
                lastSaveTime: 0
            };
        }
    }
    async exportSave(slot) {
        const result = await this.load(slot);
        if (!result.success || !result.saveData) {
            return null;
        }
        return JSON.stringify(result.saveData, null, 2);
    }
    async importSave(slot, saveDataJson) {
        try {
            const saveData = JSON.parse(saveDataJson);
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                return {
                    success: false,
                    slot,
                    error: 'Invalid save data format'
                };
            }
            // Override slot and timestamp
            saveData.slot = slot;
            saveData.timestamp = Date.now();
            return await this.save(slot, saveData);
        }
        catch (error) {
            return {
                success: false,
                slot,
                error: error instanceof Error ? error.message : 'Invalid JSON format'
            };
        }
    }
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
    validateSaveData(saveData) {
        return (saveData &&
            typeof saveData === 'object' &&
            saveData.version === '1.0' &&
            typeof saveData.level === 'number' &&
            typeof saveData.room === 'number' &&
            typeof saveData.player === 'object' &&
            typeof saveData.player.position === 'object' &&
            typeof saveData.player.position.x === 'number' &&
            typeof saveData.player.position.y === 'number' &&
            typeof saveData.player.health === 'number' &&
            typeof saveData.player.maxHealth === 'number' &&
            typeof saveData.player.hasSword === 'boolean' &&
            typeof saveData.timer === 'number' &&
            typeof saveData.flags === 'object' &&
            typeof saveData.rngSeed === 'number' &&
            Array.isArray(saveData.enemies) &&
            typeof saveData.thumbnail === 'string' &&
            typeof saveData.packId === 'string' &&
            typeof saveData.packVersion === 'string');
    }
    async generateThumbnail() {
        try {
            // Create a simple thumbnail by capturing the current game state
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 120;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return '';
            }
            // Draw a simple placeholder thumbnail
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(0, 0, 160, 120);
            ctx.fillStyle = '#ffd700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Save', 80, 60);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.fillText(new Date().toLocaleString(), 80, 80);
            return canvas.toDataURL('image/png', 0.8);
        }
        catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return '';
        }
    }
    async close() {
        if (this.isInitialized) {
            await this.db.close();
            this.isInitialized = false;
        }
    }
    getInitializedState() {
        return this.isInitialized;
    }
    getMaxSlots() {
        return this.MAX_SLOTS;
    }
}
//# sourceMappingURL=SaveSystem.js.map