import { BootConfig } from './BootConfig.js';
import { GameEngine } from '../GameEngine.js';
import { SettingsStore } from '../SettingsStore.js';
import { LibraryManager } from '../library/LibraryManager.js';
import { SaveSystem } from '../save/SaveSystem.js';
import { CheatManager } from '../../dev/CheatManager.js';
import { AudioManager } from '../AudioManager.js';
export interface BootContext {
    engine: GameEngine;
    settingsStore: SettingsStore;
    libraryManager: LibraryManager;
    saveSystem: SaveSystem;
    audioManager: AudioManager;
    cheatManager: CheatManager;
}
export interface BootResult {
    success: boolean;
    warnings: string[];
    config: BootConfig;
}
export declare function bootGame(context: BootContext): Promise<BootResult>;
//# sourceMappingURL=boot.d.ts.map