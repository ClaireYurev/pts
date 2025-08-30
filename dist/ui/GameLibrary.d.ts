export interface GamePackInfo {
    name: string;
    file: string;
    description?: string;
    version?: string;
}
export declare class GameLibrary {
    private packs;
    private currentPack;
    constructor();
    private loadManifest;
    getPacks(): GamePackInfo[];
    getCurrentPack(): string;
    setCurrentPack(packFile: string): void;
    loadPack(packFile: string): void;
    getPackByName(name: string): GamePackInfo | undefined;
    getPackByFile(file: string): GamePackInfo | undefined;
    addPack(pack: GamePackInfo): void;
    removePack(file: string): void;
    getActivePackInfo(): GamePackInfo | undefined;
}
//# sourceMappingURL=GameLibrary.d.ts.map