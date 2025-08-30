import { GamePack } from '../engine/GamePack';
import { ECAScript } from '../runtime/scripting/ECA';
import { CutsceneData } from '../runtime/cutscene/CutscenePlayer';
export interface ExportOptions {
    includeAssets: boolean;
    includeScripts: boolean;
    includeCutscenes: boolean;
    includeLevels: boolean;
    validateSchema: boolean;
    compress: boolean;
}
export interface ExportResult {
    success: boolean;
    filename?: string;
    errors?: string[];
    warnings?: string[];
    size?: number;
}
export declare class ExportManager {
    private ajv;
    private validators;
    constructor();
    private initializeValidators;
    exportGamePack(gamePack: GamePack, options?: ExportOptions): Promise<ExportResult>;
    importGamePack(file: File): Promise<{
        success: boolean;
        gamePack?: GamePack;
        errors?: string[];
    }>;
    private blobToBase64;
    private downloadFile;
    validateScript(script: ECAScript): string[];
    validateCutscene(cutscene: CutsceneData): string[];
    getSchemaErrors(schemaType: string, data: any): string[];
}
//# sourceMappingURL=ExportManager.d.ts.map