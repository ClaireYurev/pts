import { LevelData } from './EditorApp.js';
export declare class ImportManager {
    constructor();
    importFile(file: File): Promise<LevelData>;
    private readFileAsText;
    private isGamePack;
    private isLevel;
    private importGamePack;
    private importLevel;
    private validateLevel;
    private validateGamePack;
}
//# sourceMappingURL=ImportManager.d.ts.map