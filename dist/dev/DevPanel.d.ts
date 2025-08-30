import { CheatManager } from "./CheatManager.js";
import { FreeCamera } from "./FreeCamera.js";
import { DebugOverlay } from "./DebugOverlay.js";
import { GameEngine } from "../engine/GameEngine.js";
export declare class DevPanel {
    private panel;
    private cheatManager;
    private freeCamera;
    private debugOverlay;
    private engine;
    private visible;
    private resetConfirmationActive;
    private resetConfirmationTimeout;
    constructor(cheatManager: CheatManager, freeCamera: FreeCamera, debugOverlay: DebugOverlay, engine: GameEngine);
    private createPanel;
    private setupEventListeners;
    private applyCheats;
    private updateActiveCheatsDisplay;
    toggle(): void;
    private syncCheckboxes;
    update(): void;
    private handleResetGame;
    private performGameReset;
}
//# sourceMappingURL=DevPanel.d.ts.map