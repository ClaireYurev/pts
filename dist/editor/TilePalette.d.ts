export interface TileDefinition {
    id: string;
    name: string;
    color: string;
    icon?: string;
    properties?: Record<string, any>;
}
export declare class TilePalette {
    private tiles;
    private selectedTile;
    constructor();
    private initializeDefaultTiles;
    selectTile(tileId: string): void;
    getSelectedTile(): string;
    getTileDefinition(tileId: string): TileDefinition | undefined;
    getAllTiles(): TileDefinition[];
    addTile(tile: TileDefinition): void;
    removeTile(tileId: string): boolean;
    getTileProperties(tileId: string): Record<string, any> | undefined;
    setTileProperties(tileId: string, properties: Record<string, any>): void;
    getTileColor(tileId: string): string;
    getTileName(tileId: string): string;
    isTileWalkable(tileId: string): boolean;
    isTileSolid(tileId: string): boolean;
    isTileLiquid(tileId: string): boolean;
    getTileDamage(tileId: string): number;
    exportTileDefinitions(): Record<string, TileDefinition>;
    importTileDefinitions(definitions: Record<string, TileDefinition>): void;
    createCustomTile(id: string, name: string, color: string, properties?: Record<string, any>): TileDefinition;
    getTilesByCategory(): Record<string, TileDefinition[]>;
    searchTiles(query: string): TileDefinition[];
    getTileSuggestions(partialId: string): TileDefinition[];
    validateTileId(tileId: string): boolean;
    getTileCount(): number;
    clear(): void;
}
//# sourceMappingURL=TilePalette.d.ts.map