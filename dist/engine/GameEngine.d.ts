import { Renderer } from "./Renderer.js";
import { InputHandler } from "./InputHandler.js";
import { PhysicsEngine } from "./PhysicsEngine.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { StateMachine } from "./StateMachine.js";
import { Entity } from "./Entity.js";
import { PauseManager } from "./PauseManager.js";
import { AudioManager } from "./AudioManager.js";
import { SettingsStore } from "./SettingsStore.js";
import { SaveManager } from "./SaveManager.js";
import { PiMenu } from "../ui/PiMenu.js";
import { CheatManager } from "../dev/CheatManager.js";
import { FreeCamera } from "../dev/FreeCamera.js";
import { DebugOverlay } from "../dev/DebugOverlay.js";
import { PlatformConfig } from "./PlatformConfig.js";
export declare class GameEngine {
    canvas: HTMLCanvasElement;
    private renderer;
    private input;
    private physics;
    private collision;
    private animation;
    private stateMachine;
    private loop;
    private entities;
    private packLoader;
    private currentPack?;
    private fpsDisplay;
    pauseManager: PauseManager;
    audioManager: AudioManager;
    settingsStore: SettingsStore;
    saveManager: SaveManager;
    piMenu: PiMenu;
    cheatManager: CheatManager;
    private freeCamera;
    private debugOverlay;
    private platformSwitchInProgress;
    constructor(canvas: HTMLCanvasElement, platformKey?: string);
    private initializePerformanceMonitoring;
    private createTestEntities;
    loadGamePack(url: string): Promise<void>;
    start(): void;
    stop(): void;
    toggleFPSDisplay(): void;
    private update;
    private attemptErrorRecovery;
    private handleCriticalError;
    private displayError;
    private applyCheatEffects;
    private checkCollisionsWithCheats;
    private handlePlayerInput;
    private handleTriggerCatchUp;
    private checkTriggerPath;
    private checkTriggersAtPosition;
    private getTriggersAtPosition;
    private shouldTrigger;
    private fireTrigger;
    /**
     * Check if player is near a ledge for sticky grab
     */
    private checkNearLedge;
    /**
     * Handle ledge grab mechanics
     */
    private handleLedgeGrab;
    private render;
    private getCompactInstructions;
    getRenderer(): Renderer;
    getInput(): InputHandler;
    getPhysics(): PhysicsEngine;
    getCollision(): CollisionSystem;
    getStateMachine(): StateMachine;
    getEntities(): Entity[];
    addEntity(entity: Entity): void;
    removeEntity(entity: Entity): void;
    getFPS(): number;
    getPauseManager(): PauseManager;
    getCheatManager(): CheatManager;
    getFreeCamera(): FreeCamera;
    getDebugOverlay(): DebugOverlay;
    getInputMap(): any;
    getGamepad(): any;
    setPlatform(platformKey: string): boolean;
    private recreateEntitiesForPlatform;
    getCurrentPlatform(): PlatformConfig;
    getAllPlatforms(): PlatformConfig[];
    private applySettings;
    private setupSettingsListeners;
    private setupUserInteractionHandling;
    getAudioManager(): AudioManager;
    getSettingsStore(): SettingsStore;
}
//# sourceMappingURL=GameEngine.d.ts.map