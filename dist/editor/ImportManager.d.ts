import { EditorApp } from "./EditorApp";
export interface ImportResult {
    success: boolean;
    data?: any;
    errors?: string[];
    warnings?: string[];
}
export declare class ImportManager {
    private editor;
    private supportedFormats;
    constructor(editor: EditorApp);
    loadFile(file: File): Promise<ImportResult>;
    private validateFile;
    private getFileExtension;
    private readFileContent;
    private parsePackData;
    private validatePackStructure;
    private loadPackIntoEditor;
    private loadAssets;
    private loadDataUrlAsset;
    loadFromUrl(url: string): Promise<ImportResult>;
    getSupportedFormats(): string[];
    validatePackCompatibility(packData: any): {
        compatible: boolean;
        issues: string[];
    };
    private checkMissingAssets;
    private assetExists;
    createImportPreview(packData: any): string;
    private countTiles;
}
//# sourceMappingURL=ImportManager.d.ts.map