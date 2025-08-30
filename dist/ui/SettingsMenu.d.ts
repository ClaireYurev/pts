export interface Settings {
    keyBindings: Record<string, string>;
    volume: number;
    fullscreen: boolean;
    highContrast: boolean;
    fpsDisplay: boolean;
}
export declare class SettingsMenu {
    private overlay;
    private settings;
    private defaultSettings;
    constructor();
    private createOverlay;
    private setupEventListeners;
    private setupKeyRebinding;
    private applySettings;
    private applyHighContrast;
    private updateDisplay;
    private loadSettings;
    private saveSettings;
    open(): void;
    close(): void;
    getSettings(): Settings;
    updateKeyBinding(action: string, keyCode: string): void;
}
//# sourceMappingURL=SettingsMenu.d.ts.map