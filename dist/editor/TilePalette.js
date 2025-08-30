export class TilePalette {
    constructor() {
        this.tiles = new Map();
        this.selectedTile = 'ground';
        this.initializeDefaultTiles();
    }
    initializeDefaultTiles() {
        const defaultTiles = [
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
    selectTile(tileId) {
        if (this.tiles.has(tileId)) {
            this.selectedTile = tileId;
        }
    }
    getSelectedTile() {
        return this.selectedTile;
    }
    getTileDefinition(tileId) {
        return this.tiles.get(tileId);
    }
    getAllTiles() {
        return Array.from(this.tiles.values());
    }
    addTile(tile) {
        this.tiles.set(tile.id, tile);
    }
    removeTile(tileId) {
        return this.tiles.delete(tileId);
    }
    getTileProperties(tileId) {
        const tile = this.tiles.get(tileId);
        return tile?.properties;
    }
    setTileProperties(tileId, properties) {
        const tile = this.tiles.get(tileId);
        if (tile) {
            tile.properties = { ...tile.properties, ...properties };
        }
    }
    getTileColor(tileId) {
        const tile = this.tiles.get(tileId);
        return tile?.color || '#666';
    }
    getTileName(tileId) {
        const tile = this.tiles.get(tileId);
        return tile?.name || tileId;
    }
    isTileWalkable(tileId) {
        const properties = this.getTileProperties(tileId);
        return properties?.walkable ?? false;
    }
    isTileSolid(tileId) {
        const properties = this.getTileProperties(tileId);
        return properties?.solid ?? false;
    }
    isTileLiquid(tileId) {
        const properties = this.getTileProperties(tileId);
        return properties?.liquid ?? false;
    }
    getTileDamage(tileId) {
        const properties = this.getTileProperties(tileId);
        return properties?.damage ?? 0;
    }
    exportTileDefinitions() {
        return Object.fromEntries(this.tiles);
    }
    importTileDefinitions(definitions) {
        this.tiles.clear();
        Object.entries(definitions).forEach(([id, tile]) => {
            this.tiles.set(id, tile);
        });
    }
    createCustomTile(id, name, color, properties = {}) {
        const tile = {
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
    getTilesByCategory() {
        const categories = {
            basic: [],
            hazards: [],
            liquids: [],
            decorative: []
        };
        this.getAllTiles().forEach(tile => {
            if (tile.id === 'empty') {
                categories.basic.push(tile);
            }
            else if (tile.properties?.damage > 0) {
                categories.hazards.push(tile);
            }
            else if (tile.properties?.liquid) {
                categories.liquids.push(tile);
            }
            else if (tile.properties?.decorative) {
                categories.decorative.push(tile);
            }
            else {
                categories.basic.push(tile);
            }
        });
        return categories;
    }
    searchTiles(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllTiles().filter(tile => tile.name.toLowerCase().includes(lowercaseQuery) ||
            tile.id.toLowerCase().includes(lowercaseQuery));
    }
    getTileSuggestions(partialId) {
        const lowercasePartial = partialId.toLowerCase();
        return this.getAllTiles().filter(tile => tile.id.toLowerCase().startsWith(lowercasePartial));
    }
    validateTileId(tileId) {
        // Check if tile ID is valid (alphanumeric and underscores only)
        return /^[a-zA-Z0-9_]+$/.test(tileId) && tileId.length > 0;
    }
    getTileCount() {
        return this.tiles.size;
    }
    clear() {
        this.tiles.clear();
        this.initializeDefaultTiles();
    }
}
//# sourceMappingURL=TilePalette.js.map