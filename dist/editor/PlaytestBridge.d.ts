import { GamePack } from './EditorApp.js';
export declare class PlaytestBridge {
    private playtestWindow;
    private playtestFrame;
    private currentPack;
    constructor();
    private setupEventListeners;
    startPlaytest(gamePack: GamePack): void;
    stopPlaytest(): void;
    private createPlaytestFrame;
    private sendGamePackToPlaytest;
    private handlePlaytestMessage;
    private showPlaytestError;
    private handleLevelComplete;
    private handleEntityInteraction;
    private loadLevelInPlaytest;
    private showGameComplete;
    updateGamePack(gamePack: GamePack): void;
    isPlaytestActive(): boolean;
    getCurrentPack(): GamePack | null;
    getPlaytestStats(): {
        isActive: boolean;
        packName: string | null;
        levelCount: number;
    };
    createPlaytestURL(gamePack: GamePack): string;
    openPlaytestInNewWindow(gamePack: GamePack): void;
}
//# sourceMappingURL=PlaytestBridge.d.ts.map