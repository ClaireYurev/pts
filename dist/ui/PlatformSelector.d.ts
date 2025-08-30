import { PauseManager } from "../engine/PauseManager.js";
interface PiMenuInterface {
    close(): void;
}
export declare class PlatformSelector {
    private overlay;
    private isVisible;
    private onPlatformChange?;
    private pauseManager?;
    private piMenu?;
    private abortController;
    private eventListeners;
    constructor();
    private createOverlay;
    private setupEventListeners;
    private renderPlatforms;
    private createPlatformCard;
    private getPlatformKey;
    show(): void;
    hide(): void;
    toggle(): void;
    setPlatformChangeCallback(callback: (platformKey: string) => void): void;
    setPauseManager(pauseManager: PauseManager): void;
    setPiMenu(piMenu: PiMenuInterface): void;
    isPlatformSelectorVisible(): boolean;
    cleanup(): void;
    updateZIndexForFullscreen(isFullscreen: boolean): void;
}
export {};
//# sourceMappingURL=PlatformSelector.d.ts.map