import { GamePack } from '../engine/GamePack';
import { ECAScript } from '../runtime/scripting/ECA';
import { CutsceneData } from '../runtime/cutscene/CutscenePlayer';
export interface ImportOptions {
    validateSchema: boolean;
    mergeWithExisting: boolean;
    overwriteConflicts: boolean;
    importAssets: boolean;
    importScripts: boolean;
    importCutscenes: boolean;
    importLevels: boolean;
}
export interface ImportResult {
    success: boolean;
    gamePack?: GamePack;
    errors?: string[];
    warnings?: string[];
    importedCount: {
        levels: number;
        scripts: number;
        cutscenes: number;
        assets: number;
    };
}
export interface ImportProgress {
    stage: 'validating' | 'importing' | 'processing' | 'complete';
    progress: number;
    message: string;
}
export declare class ImportManager {
    private exportManager;
    constructor();
    importFromFile(file: File, options?: ImportOptions, onProgress?: (progress: ImportProgress) => void): Promise<ImportResult>;
    importFromURL(url: string, options?: ImportOptions, onProgress?: (progress: ImportProgress) => void): Promise<ImportResult>;
    importFromData(data: {
        levels?: Record<string, any>;
        scripts?: Record<string, ECAScript>;
        cutscenes?: Record<string, CutsceneData>;
        assets?: Record<string, any>;
    }, options?: ImportOptions): Promise<ImportResult>;
    mergeGamePacks(target: GamePack, source: GamePack, options: {
        overwriteConflicts: boolean;
        mergeLevels: boolean;
        mergeScripts: boolean;
        mergeCutscenes: boolean;
        mergeAssets: boolean;
    }): {
        success: boolean;
        conflicts: string[];
        merged: GamePack;
    };
    validateGamePack(gamePack: GamePack): string[];
    getImportPreview(file: File): Promise<{
        success: boolean;
        preview?: {
            packInfo: any;
            levelCount: number;
            scriptCount: number;
            cutsceneCount: number;
            assetCount: number;
        };
        errors?: string[];
    }>;
}
//# sourceMappingURL=ImportManager.d.ts.map