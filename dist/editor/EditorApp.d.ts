export interface EntityData {
    id: string;
    type: string;
    x: number;
    y: number;
    props: Record<string, any>;
}
export interface LevelData {
    id: string;
    name: string;
    width: number;
    height: number;
    tiles: string[][];
    entities: EntityData[];
    links: Array<{
        from: string;
        to: string;
        type: string;
    }>;
}
export interface GamePack {
    id: string;
    name: string;
    version: string;
    levels: LevelData[];
    metadata: Record<string, any>;
}
export declare class EditorApp {
    private canvas;
    private tilePalette;
    private entityPalette;
    private inspector;
    private linkTool;
    private exportManager;
    private importManager;
    private playtestBridge;
    private currentLevel;
    private selectedTool;
    private selectedEntity;
    private isInitialized;
    constructor();
    private initializeComponents;
    private setupEventListeners;
    private createDefaultLevel;
    private selectTool;
    private switchTab;
    private selectTile;
    private selectEntity;
    private handleTileClick;
    private handleEntityClick;
    private handleEntityPlace;
    private paintTile;
    private eraseTile;
    private selectTileAt;
    private getDefaultProps;
    private generateId;
    private importLevel;
    private exportLevel;
    private playtest;
    private closePlaytest;
    private loadLevel;
    private updateStatus;
    getCurrentLevel(): LevelData;
    getSelectedEntity(): EntityData | null;
    updateEntity(entity: EntityData): void;
    deleteEntity(entityId: string): void;
}
//# sourceMappingURL=EditorApp.d.ts.map