export interface PackMeta {
    name: string;
    version: string;
    description: string;
    author: string;
    created: string;
    modified: string;
}
export interface ExportData {
    meta: PackMeta;
    tileMap: number[][];
    entities: any[];
    triggers: any[];
    scripts: any[];
    cutscenes: any[];
    assets?: string[];
    settings?: Record<string, any>;
}
export declare class ExportManager {
    private packData;
    exportPack(packData: ExportData): Promise<void>;
    private validatePackData;
    private createPackJson;
    private generateFilename;
    private exportAsJson;
    exportAsZip(packData: ExportData): Promise<void>;
    exportAssets(assets: File[]): Promise<string[]>;
    private fileToDataUrl;
    generatePackPreview(packData: ExportData): string;
    private countTiles;
    private estimatePackSize;
    validatePackName(name: string): {
        valid: boolean;
        errors: string[];
    };
    createDefaultPackMeta(): PackMeta;
    exportPackWithAssets(packData: ExportData, assetFiles: File[]): Promise<void>;
    getExportFormats(): {
        name: string;
        extension: string;
        description: string;
    }[];
    exportInFormat(packData: ExportData, format: string): Promise<void>;
}
//# sourceMappingURL=ExportManager.d.ts.map