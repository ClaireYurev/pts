import { LevelCanvas } from "./LevelCanvas";
import { TriggerManager } from "./TriggerManager";
export declare class EditorApp {
    private levelCanvas;
    private tilePalette;
    private entityPalette;
    private triggerManager;
    private scriptEditor;
    private cutsceneEditor;
    private exportManager;
    private importManager;
    private currentMode;
    private selectedTileId;
    private selectedEntity;
    private selectedTrigger;
    constructor();
    private createSampleTileImages;
    private setupEventListeners;
    private setupModeSwitching;
    private setupTabSwitching;
    private switchTab;
    private setMode;
    private showContextMenu;
    private editSelectedObject;
    private deleteSelectedObject;
    private exportCurrentPack;
    private importPack;
    loadPackData(packData: any): void;
    getLevelCanvas(): LevelCanvas;
    getTriggerManager(): TriggerManager;
}
//# sourceMappingURL=EditorApp.d.ts.map