export interface TileDefinition {
    id: string;
    name: string;
    color: string;
    icon?: string;
    properties?: Record<string, any>;
}

export class TilePalette {
    private tiles: Map<string, TileDefinition> = new Map();
    private selectedTile: string = 'ground';

    constructor() {
        this.initializeDefaultTiles();
    }

    private initializeDefaultTiles(): void {
        const defaultTiles: TileDefinition[] = [
            {
                id: 'empty',
                name: 'Empty',
                color: '#1a1a1a',
                properties: { walkable: true, solid: false }
            },
            {
                id: 'ground',
                name: 'Ground',
                color: '#8B4513',
                properties: { walkable: true, solid: true }
            },
            {
                id: 'wall',
                name: 'Wall',
                color: '#696969',
                properties: { walkable: false, solid: true }
            },
            {
                id: 'platform',
                name: 'Platform',
                color: '#A0522D',
                properties: { walkable: true, solid: true, platform: true }
            },
            {
                id: 'spike',
                name: 'Spike',
                color: '#FF4500',
                properties: { walkable: false, solid: false, damage: 50 }
            },
            {
                id: 'water',
                name: 'Water',
                color: '#4169E1',
                properties: { walkable: false, solid: false, liquid: true, damage: 0 }
            },
            {
                id: 'lava',
                name: 'Lava',
                color: '#DC143C',
                properties: { walkable: false, solid: false, liquid: true, damage: 100 }
            },
            {
                id: 'ice',
                name: 'Ice',
                color: '#87CEEB',
                properties: { walkable: true, solid: true, slippery: true }
            },
            {
                id: 'grass',
                name: 'Grass',
                color: '#228B22',
                properties: { walkable: true, solid: true, decorative: true }
            },
            {
                id: 'stone',
                name: 'Stone',
                color: '#708090',
                properties: { walkable: true, solid: true, durable: true }
            },
            {
                id: 'wood',
                name: 'Wood',
                color: '#DEB887',
                properties: { walkable: true, solid: true, flammable: true }
            },
            {
                id: 'metal',
                name: 'Metal',
                color: '#C0C0C0',
                properties: { walkable: true, solid: true, conductive: true }
            }
        ];

        defaultTiles.forEach(tile => {
            this.tiles.set(tile.id, tile);
        });
    }

    public selectTile(tileId: string): void {
        if (this.tiles.has(tileId)) {
            this.selectedTile = tileId;
        }
    }

    public getSelectedTile(): string {
        return this.selectedTile;
    }

    public getTileDefinition(tileId: string): TileDefinition | undefined {
        return this.tiles.get(tileId);
    }

    public getAllTiles(): TileDefinition[] {
        return Array.from(this.tiles.values());
    }

    public addTile(tile: TileDefinition): void {
        this.tiles.set(tile.id, tile);
    }

    public removeTile(tileId: string): boolean {
        return this.tiles.delete(tileId);
    }

    public getTileProperties(tileId: string): Record<string, any> | undefined {
        const tile = this.tiles.get(tileId);
        return tile?.properties;
    }

    public setTileProperties(tileId: string, properties: Record<string, any>): void {
        const tile = this.tiles.get(tileId);
        if (tile) {
            tile.properties = { ...tile.properties, ...properties };
        }
    }

    public getTileColor(tileId: string): string {
        const tile = this.tiles.get(tileId);
        return tile?.color || '#666';
    }

    public getTileName(tileId: string): string {
        const tile = this.tiles.get(tileId);
        return tile?.name || tileId;
    }

    public isTileWalkable(tileId: string): boolean {
        const properties = this.getTileProperties(tileId);
        return properties?.walkable ?? false;
    }

    public isTileSolid(tileId: string): boolean {
        const properties = this.getTileProperties(tileId);
        return properties?.solid ?? false;
    }

    public isTileLiquid(tileId: string): boolean {
        const properties = this.getTileProperties(tileId);
        return properties?.liquid ?? false;
    }

    public getTileDamage(tileId: string): number {
        const properties = this.getTileProperties(tileId);
        return properties?.damage ?? 0;
    }

    public exportTileDefinitions(): Record<string, TileDefinition> {
        return Object.fromEntries(this.tiles);
    }

    public importTileDefinitions(definitions: Record<string, TileDefinition>): void {
        this.tiles.clear();
        Object.entries(definitions).forEach(([id, tile]) => {
            this.tiles.set(id, tile);
        });
    }

    public createCustomTile(id: string, name: string, color: string, properties: Record<string, any> = {}): TileDefinition {
        const tile: TileDefinition = {
            id,
            name,
            color,
            properties: {
                walkable: true,
                solid: true,
                ...properties
            }
        };

        this.addTile(tile);
        return tile;
    }

    public getTilesByCategory(): Record<string, TileDefinition[]> {
        const categories: Record<string, TileDefinition[]> = {
            basic: [],
            hazards: [],
            liquids: [],
            decorative: []
        };

        this.getAllTiles().forEach(tile => {
            if (tile.id === 'empty') {
                categories.basic.push(tile);
            } else if (tile.properties?.damage > 0) {
                categories.hazards.push(tile);
            } else if (tile.properties?.liquid) {
                categories.liquids.push(tile);
            } else if (tile.properties?.decorative) {
                categories.decorative.push(tile);
            } else {
                categories.basic.push(tile);
            }
        });

        return categories;
    }

    public searchTiles(query: string): TileDefinition[] {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllTiles().filter(tile => 
            tile.name.toLowerCase().includes(lowercaseQuery) ||
            tile.id.toLowerCase().includes(lowercaseQuery)
        );
    }

    public getTileSuggestions(partialId: string): TileDefinition[] {
        const lowercasePartial = partialId.toLowerCase();
        return this.getAllTiles().filter(tile => 
            tile.id.toLowerCase().startsWith(lowercasePartial)
        );
    }

    public validateTileId(tileId: string): boolean {
        // Check if tile ID is valid (alphanumeric and underscores only)
        return /^[a-zA-Z0-9_]+$/.test(tileId) && tileId.length > 0;
    }

    public getTileCount(): number {
        return this.tiles.size;
    }

    public clear(): void {
        this.tiles.clear();
        this.initializeDefaultTiles();
    }
} 