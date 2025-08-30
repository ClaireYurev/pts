export interface Entity {
    x: number;
    y: number;
    type: string;
    properties?: Record<string, any>;
}
export declare class LevelCanvas {
    private ctx;
    private canvas;
    private tileWidth;
    private tileHeight;
    private grid;
    private entities;
    private tilesetImage?;
    private cameraX;
    private cameraY;
    private isDragging;
    private lastMouseX;
    private lastMouseY;
    constructor(canvas: HTMLCanvasElement, width: number, height: number);
    private setupEventListeners;
    private zoom;
    drawGrid(): void;
    drawTiles(): void;
    drawEntities(): void;
    drawTriggers(triggers: any[]): void;
    placeTile(x: number, y: number, tileId: number): void;
    placeEntity(x: number, y: number, entityType: string): void;
    removeEntity(x: number, y: number): void;
    redraw(): void;
    setTileset(image: HTMLImageElement): void;
    getGrid(): number[][];
    setGrid(grid: number[][]): void;
    getEntities(): Entity[];
    setEntities(entities: Entity[]): void;
    getCanvas(): HTMLCanvasElement;
    getTileSize(): {
        width: number;
        height: number;
    };
    setTileSize(width: number, height: number): void;
    getCamera(): {
        x: number;
        y: number;
    };
    setCamera(x: number, y: number): void;
    resetCamera(): void;
}
//# sourceMappingURL=LevelCanvas.d.ts.map