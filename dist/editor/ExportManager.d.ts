import { GamePack, LevelData } from './EditorApp.js';
import { ECAGraph } from './VisualScriptEditor.js';
import { Cutscene } from './CutsceneEditor.js';
export declare class ExportManager {
    constructor();
    exportLevel(level: LevelData): void;
    exportPack(gamePack: GamePack): void;
    exportPackAsZip(gamePack: GamePack, scripts?: ECAGraph[], cutscenes?: Cutscene[], assets?: Map<string, Blob>): Promise<void>;
    exportPackAsZipWithJSZip(gamePack: GamePack, scripts?: ECAGraph[], cutscenes?: Cutscene[], assets?: Map<string, Blob>): Promise<void>;
    exportToClipboard(data: any): void;
    exportLevelToClipboard(level: LevelData): void;
    exportPackToClipboard(gamePack: GamePack): void;
    validateLevel(level: LevelData): string[];
    validateGamePack(gamePack: GamePack): string[];
    validateScript(script: ECAGraph): string[];
    validateCutscene(cutscene: Cutscene): string[];
    createGamePack(id: string, name: string, version: string, levels: LevelData[], metadata?: Record<string, any>): GamePack;
    getExportFormats(): string[];
    getExportFormatDescription(format: string): string;
    getExportFormatExtension(format: string): string;
}
//# sourceMappingURL=ExportManager.d.ts.map