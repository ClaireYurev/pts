import { IDB } from '../db/IDB.js';
import { SaveGameV1, SaveSlot, SaveSystemConfig } from './SaveTypes.js';

/**
 * Save system for managing game saves in IndexedDB
 */
export class SaveSystem {
    private idb: IDB;
    private canvas: HTMLCanvasElement;
    private packId: string;
    private engineVersion: string;
    private thumbnailWidth: number;
    private thumbnailHeight: number;

    constructor(config: SaveSystemConfig) {
        this.canvas = config.canvas;
        this.packId = config.packId;
        this.engineVersion = config.engineVersion || '1.0.0';
        this.thumbnailWidth = config.thumbnailWidth || 160;
        this.thumbnailHeight = config.thumbnailHeight || 90;

        // Create IndexedDB instance for this pack
        this.idb = new IDB({
            name: 'PrinceTSGame',
            version: 1,
            storeName: `saves:${this.packId}`
        });
    }

    /**
     * List all saves for this pack (returns array of length 3)
     */
    async list(): Promise<(SaveGameV1 | null)[]> {
        try {
            const allSaves = await this.idb.getAll();
            const saves: (SaveGameV1 | null)[] = [null, null, null];

            // Map saves to their slots
            for (const save of allSaves) {
                if (save.slot >= 1 && save.slot <= 3) {
                    const saveData = save.data as SaveGameV1;
                    
                    // Validate and migrate if needed
                    const validatedSave = this.validateAndMigrate(saveData);
                    saves[save.slot - 1] = validatedSave;
                }
            }

            return saves;
        } catch (error) {
            console.error('Error listing saves:', error);
            return [null, null, null];
        }
    }

    /**
     * Save game data to specified slot
     */
    async save(slot: SaveSlot, data: Partial<SaveGameV1>): Promise<void> {
        try {
            // Capture thumbnail if not provided
            if (!data.thumbnail) {
                data.thumbnail = this.captureThumbnail();
            }

            // Create complete save data
            const saveData: SaveGameV1 = {
                engineVersion: this.engineVersion,
                packId: this.packId,
                timestamp: Date.now(),
                playtimeSec: 0, // TODO: Get from game engine
                rngSeed: 0, // TODO: Get from game engine
                levelIndex: 1, // TODO: Get from game engine
                player: {
                    x: 100,
                    y: 100,
                    state: 'idle',
                    facing: 'R',
                    health: 100,
                    maxHealth: 100,
                    hasSword: false,
                    inventory: {}
                },
                world: {
                    timerSecRemaining: 300,
                    flags: {},
                    looseTilesGone: [],
                    enemies: []
                },
                scripting: {
                    variables: {},
                    completedEvents: []
                },
                ...data
            };

            await this.idb.put(slot, saveData);
            console.log(`Game saved to slot ${slot}`);
        } catch (error) {
            console.error(`Error saving to slot ${slot}:`, error);
            throw error;
        }
    }

    /**
     * Load game data from specified slot
     */
    async load(slot: SaveSlot): Promise<SaveGameV1 | null> {
        try {
            const saveData = await this.idb.get(slot);
            if (!saveData) {
                return null;
            }

            const validatedSave = this.validateAndMigrate(saveData as SaveGameV1);
            console.log(`Game loaded from slot ${slot}`);
            return validatedSave;
        } catch (error) {
            console.error(`Error loading from slot ${slot}:`, error);
            return null;
        }
    }

    /**
     * Clear save data from specified slot
     */
    async clear(slot: SaveSlot): Promise<void> {
        try {
            await this.idb.delete(slot);
            console.log(`Slot ${slot} cleared`);
        } catch (error) {
            console.error(`Error clearing slot ${slot}:`, error);
            throw error;
        }
    }

    /**
     * Capture thumbnail from canvas
     */
    captureThumbnail(): string {
        try {
            // Create a temporary canvas for thumbnail
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
                throw new Error('Could not get 2D context for thumbnail');
            }

            tempCanvas.width = this.thumbnailWidth;
            tempCanvas.height = this.thumbnailHeight;

            // Draw the main canvas scaled down to thumbnail size
            tempCtx.drawImage(
                this.canvas,
                0, 0, this.canvas.width, this.canvas.height,
                0, 0, this.thumbnailWidth, this.thumbnailHeight
            );

            // Convert to data URL with reduced quality for smaller size
            return tempCanvas.toDataURL('image/jpeg', 0.7);
        } catch (error) {
            console.error('Error capturing thumbnail:', error);
            // Return a placeholder or empty string
            return '';
        }
    }

    /**
     * Validate and migrate save data if needed
     */
    private validateAndMigrate(saveData: any): SaveGameV1 {
        // Check if this is a valid SaveGameV1
        if (this.isValidSaveGameV1(saveData)) {
            return saveData;
        }

        // Migration stub for future versions
        console.warn('Save data migration needed, using defaults');
        
        // Return default save data
        return {
            engineVersion: this.engineVersion,
            packId: this.packId,
            timestamp: Date.now(),
            playtimeSec: 0,
            rngSeed: 0,
            levelIndex: 1,
            player: {
                x: 100,
                y: 100,
                state: 'idle',
                facing: 'R',
                health: 100,
                maxHealth: 100,
                hasSword: false,
                inventory: {}
            },
            world: {
                timerSecRemaining: 300,
                flags: {},
                looseTilesGone: [],
                enemies: []
            },
            scripting: {
                variables: {},
                completedEvents: []
            }
        };
    }

    /**
     * Check if save data is valid SaveGameV1
     */
    private isValidSaveGameV1(data: any): data is SaveGameV1 {
        return (
            data &&
            typeof data.engineVersion === 'string' &&
            typeof data.packId === 'string' &&
            typeof data.timestamp === 'number' &&
            typeof data.playtimeSec === 'number' &&
            typeof data.rngSeed === 'number' &&
            typeof data.levelIndex === 'number' &&
            data.player &&
            data.world &&
            data.scripting
        );
    }

    /**
     * Get save metadata for UI display
     */
    async getSaveMetadata(slot: SaveSlot): Promise<{
        timestamp: number;
        levelIndex: number;
        playtimeSec: number;
        hasThumbnail: boolean;
    } | null> {
        const save = await this.load(slot);
        if (!save) {
            return null;
        }

        return {
            timestamp: save.timestamp,
            levelIndex: save.levelIndex,
            playtimeSec: save.playtimeSec,
            hasThumbnail: !!save.thumbnail
        };
    }

    /**
     * Close database connection
     */
    close(): void {
        this.idb.close();
    }
} 