import { GamePack } from "./GamePack.js";
export declare class GamePackLoader {
    private loadedAssets;
    loadPack(url: string): Promise<GamePack>;
    private loadAssets;
    private loadImage;
    getAsset(url: string): HTMLImageElement | undefined;
    getAllAssets(): Map<string, HTMLImageElement>;
    clearAssets(): void;
}
