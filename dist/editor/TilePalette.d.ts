export declare class TilePalette {
    private tiles;
    private selectedTileId;
    private container;
    private onTileSelected?;
    constructor(container: HTMLElement, tiles: HTMLImageElement[]);
    private render;
    selectTile(tileId: number): void;
    getSelectedTile(): number;
    setTiles(tiles: HTMLImageElement[]): void;
    addTile(image: HTMLImageElement): void;
    removeTile(tileId: number): void;
    getTileImage(tileId: number): HTMLImageElement | undefined;
    getAllTiles(): HTMLImageElement[];
    setOnTileSelected(callback: (tileId: number) => void): void;
    clearSelection(): void;
    getTileCount(): number;
    isEmpty(): boolean;
    loadTilesetFromImage(image: HTMLImageElement, tileWidth: number, tileHeight: number): void;
    exportTileset(): {
        tiles: string[];
        tileWidth: number;
        tileHeight: number;
    };
    importTileset(tilesetData: {
        tiles: string[];
        tileWidth: number;
        tileHeight: number;
    }): void;
}
//# sourceMappingURL=TilePalette.d.ts.map