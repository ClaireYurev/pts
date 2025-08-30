import { GameEngine } from "../GameEngine.js";
import { SettingsStore } from "../SettingsStore.js";
import { LibraryManager } from "../library/LibraryManager.js";
import { SaveSystem } from "../save/SaveSystem.js";
import { AudioManager } from "../AudioManager.js";
import { CheatManager } from "../../dev/CheatManager.js";
import { SecurityManager } from "../SecurityManager.js";
import { BootConfig } from "./BootConfig.js";
export interface BootContext {
    engine: GameEngine;
    settingsStore: SettingsStore;
    libraryManager: LibraryManager;
    saveSystem: SaveSystem;
    audioManager: AudioManager;
    cheatManager: CheatManager;
    securityManager: SecurityManager;
}
export interface BootResult {
    success: boolean;
    warnings: string[];
    config: BootConfig;
}
export declare function bootGame(context: BootContext): Promise<BootResult>;
//# sourceMappingURL=boot.d.ts.map