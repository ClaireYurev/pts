import { GamePack, LevelData } from './EditorApp.js';

export class ImportManager {
    constructor() {}

    public async importFile(file: File): Promise<LevelData> {
        try {
            const content = await this.readFileAsText(file);
            const data = JSON.parse(content);
            
            // Determine if it's a level or game pack
            if (this.isGamePack(data)) {
                return this.importGamePack(data);
            } else if (this.isLevel(data)) {
                return this.importLevel(data);
            } else {
                throw new Error('Invalid file format: neither level nor game pack');
            }
        } catch (error) {
            console.error('Failed to import file:', error);
            throw new Error('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private async readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    resolve(result);
                } else {
                    reject(new Error('Failed to read file as text'));
                }
            };
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsText(file);
        });
    }

    private isGamePack(data: any): data is GamePack {
        return (
            typeof data === 'object' &&
            data !== null &&
            typeof data.id === 'string' &&
            typeof data.name === 'string' &&
            typeof data.version === 'string' &&
            Array.isArray(data.levels) &&
            typeof data.metadata === 'object'
        );
    }

    private isLevel(data: any): data is LevelData {
        return (
            typeof data === 'object' &&
            data !== null &&
            typeof data.id === 'string' &&
            typeof data.name === 'string' &&
            typeof data.width === 'number' &&
            typeof data.height === 'number' &&
            Array.isArray(data.tiles) &&
            Array.isArray(data.entities) &&
            Array.isArray(data.links)
        );
    }

    private importGamePack(gamePack: GamePack): LevelData {
        // Validate game pack
        const errors = this.validateGamePack(gamePack);
        if (errors.length > 0) {
            throw new Error('Invalid game pack: ' + errors.join(', '));
        }

        // Return the first level (or prompt user to select one)
        if (gamePack.levels.length === 0) {
            throw new Error('Game pack contains no levels');
        }

        // For now, return the first level
        return gamePack.levels[0];
    }

    private importLevel(level: LevelData): LevelData {
        // Validate level
        const errors = this.validateLevel(level);
        if (errors.length > 0) {
            throw new Error('Invalid level: ' + errors.join(', '));
        }

        return level;
    }

    private validateLevel(level: LevelData): string[] {
        const errors: string[] = [];

        // Validate required fields
        if (!level.id) errors.push('Level ID is required');
        if (!level.name) errors.push('Level name is required');
        if (level.width <= 0) errors.push('Level width must be positive');
        if (level.height <= 0) errors.push('Level height must be positive');

        // Validate tiles array
        if (!Array.isArray(level.tiles)) {
            errors.push('Tiles must be an array');
        } else {
            if (level.tiles.length !== level.height) {
                errors.push(`Tiles array height (${level.tiles.length}) doesn't match level height (${level.height})`);
            }
            
            level.tiles.forEach((row, y) => {
                if (!Array.isArray(row)) {
                    errors.push(`Tiles row ${y} must be an array`);
                } else if (row.length !== level.width) {
                    errors.push(`Tiles row ${y} width (${row.length}) doesn't match level width (${level.width})`);
                }
            });
        }

        // Validate entities array
        if (!Array.isArray(level.entities)) {
            errors.push('Entities must be an array');
        } else {
            level.entities.forEach((entity, index) => {
                if (!entity.id) errors.push(`Entity ${index} missing ID`);
                if (!entity.type) errors.push(`Entity ${index} missing type`);
                if (typeof entity.x !== 'number') errors.push(`Entity ${index} X position must be a number`);
                if (typeof entity.y !== 'number') errors.push(`Entity ${index} Y position must be a number`);
                if (entity.x < 0 || entity.x >= level.width) errors.push(`Entity ${index} X position out of bounds`);
                if (entity.y < 0 || entity.y >= level.height) errors.push(`Entity ${index} Y position out of bounds`);
                if (!entity.props || typeof entity.props !== 'object') errors.push(`Entity ${index} props must be an object`);
            });
        }

        // Validate links array
        if (!Array.isArray(level.links)) {
            errors.push('Links must be an array');
        } else {
            level.links.forEach((link, index) => {
                if (!link.from) errors.push(`Link ${index} missing from entity`);
                if (!link.to) errors.push(`Link ${index} missing to entity`);
                if (!link.type) errors.push(`Link ${index} missing type`);
            });
        }

        return errors;
    }

    private validateGamePack(gamePack: GamePack): string[] {
        const errors: string[] = [];

        // Validate required fields
        if (!gamePack.id) errors.push('Game pack ID is required');
        if (!gamePack.name) errors.push('Game pack name is required');
        if (!gamePack.version) errors.push('Game pack version is required');

        // Validate levels array
        if (!Array.isArray(gamePack.levels)) {
            errors.push('Levels must be an array');
        } else if (gamePack.levels.length === 0) {
            errors.push('Game pack must contain at least one level');
        } else {
            gamePack.levels.forEach((level, index) => {
                const levelErrors = this.validateLevel(level);
                levelErrors.forEach(error => {
                    errors.push(`Level ${index}: ${error}`);
                });
            });
        }

        // Validate metadata
        if (!gamePack.metadata || typeof gamePack.metadata !== 'object') {
            errors.push('Metadata must be an object');
        }

        return errors;
    }
} 