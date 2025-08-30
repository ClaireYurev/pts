import { Renderer } from "./Renderer.js";
import { InputHandler } from "./InputHandler.js";
import { PhysicsEngine } from "./PhysicsEngine.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { AnimationController } from "./AnimationController.js";
import { StateMachine } from "./StateMachine.js";
import { GameLoop } from "./GameLoop.js";
import { Entity } from "./Entity.js";
import { GamePackLoader } from "./GamePackLoader.js";
import { GamePack } from "./GamePack.js";
import { PauseManager } from "./PauseManager.js";
import { AudioManager } from "./AudioManager.js";
import { SettingsStore } from "./SettingsStore.js";
import { SaveManager } from "./SaveManager.js";
import { PiMenu } from "../ui/PiMenu.js";
import { CheatManager, CheatFlag } from "../dev/CheatManager.js";
import { FreeCamera } from "../dev/FreeCamera.js";
import { DebugOverlay } from "../dev/DebugOverlay.js";
import { PlatformConfig, PlatformManager } from "./PlatformConfig.js";

export class GameEngine {
    private renderer: Renderer;
    private input: InputHandler;
    private physics: PhysicsEngine;
    private collision: CollisionSystem;
    private animation: AnimationController;
    private stateMachine: StateMachine;
    private loop: GameLoop;
    private entities: Entity[] = [];
    private packLoader: GamePackLoader;
    private currentPack?: GamePack;
    private fpsDisplay: boolean = false;
    public pauseManager: PauseManager;
    
    // Audio and settings
    public audioManager: AudioManager;
    public settingsStore: SettingsStore;
    public saveManager: SaveManager;
    
    // UI
    public piMenu: PiMenu;
    
    // Dev tools and cheats
    public cheatManager: CheatManager;
    private freeCamera: FreeCamera;
    private debugOverlay: DebugOverlay;
    
    // State management
    private platformSwitchInProgress = false;

    // Platform switching state management
    private platformSwitchLock = false;
    private platformSwitchPromise: Promise<void> | null = null;
    private currentPlatformKey: string = 'snes';

    constructor(public canvas: HTMLCanvasElement, platformKey?: string) {
        this.renderer = new Renderer(canvas, platformKey);
        this.input = new InputHandler(canvas);
        this.physics = new PhysicsEngine(980); // Increased gravity for better game feel
        // Set floor to match platform canvas height
        const platform = this.renderer.getCurrentPlatform();
        this.physics.setFloorY(platform.resolution.height);
        this.collision = new CollisionSystem();
        this.animation = new AnimationController();
        this.stateMachine = new StateMachine();
        this.packLoader = new GamePackLoader();
        this.pauseManager = new PauseManager();
        
        // Initialize audio and settings
        this.audioManager = new AudioManager();
        this.settingsStore = SettingsStore.getInstance();
        this.saveManager = new SaveManager();
        
        // Initialize UI
        this.piMenu = new PiMenu(this.pauseManager, this.saveManager, this.settingsStore);
        
        // Initialize dev tools and cheats
        this.cheatManager = new CheatManager();
        this.freeCamera = new FreeCamera();
        this.debugOverlay = new DebugOverlay();
        
        // Initialize debug overlay with canvas
        this.debugOverlay.initialize(canvas);
        
        this.loop = new GameLoop(
            this.update.bind(this),
            this.render.bind(this)
        );

        // Apply optimal performance settings for current browser
        this.loop.applyOptimalSettings();

        // Apply settings to renderer and audio
        this.applySettings();

        // Add some test entities for demonstration
        this.createTestEntities();
        
        // Set up collision system with player entity reference
        this.collision.setPlayerEntityGetter(() => this.entities[0] || null);
        
        // Initialize performance monitoring
        this.initializePerformanceMonitoring();
        
        // Setup user interaction handling for audio
        this.setupUserInteractionHandling();
    }

    private initializePerformanceMonitoring(): void {
        // Monitor performance and adjust settings if needed
        setInterval(() => {
            const stats = this.loop.getPerformanceStats();
            const renderStats = this.renderer.getRenderStats();
            
            // Log performance stats in debug mode
            if (this.fpsDisplay) {
                console.log(`Performance: FPS=${stats.fps}, Render=${renderStats.frameTime.toFixed(2)}ms, Entities=${renderStats.renderedEntities}/${renderStats.totalEntities}, Culled=${renderStats.culledEntities}`);
            }
            
            // Auto-adjust settings if performance is poor
            if (stats.fps < 30 && !this.loop.isFixedTimestepEnabled()) {
                console.log('Performance warning: Enabling fixed timestep for better stability');
                this.loop.setFixedTimestep(true);
            }
            
            // Enable culling if too many entities
            if (renderStats.totalEntities > 100 && !this.renderer.getRenderStats().culledEntities) {
                console.log('Performance warning: Enabling viewport culling');
                this.renderer.setCullingEnabled(true);
            }
        }, 5000); // Check every 5 seconds
    }

        private createTestEntities(): void {
        // Get platform dimensions
        const platform = this.renderer.getCurrentPlatform();
        const internalDims = this.renderer.getInternalDimensions();
        
        // Scale entity sizes based on platform resolution
        const baseScale = Math.min(platform.resolution.width, platform.resolution.height) / 320; // Base scale relative to 320x240
        const playerSize = Math.max(8, Math.round(16 * baseScale));
        const groundSize = Math.max(8, Math.round(16 * baseScale));
        const platformWidth = Math.max(16, Math.round(32 * baseScale));
        const platformHeight = Math.max(4, Math.round(8 * baseScale));
        
        // Create a test player entity (scaled for platform)
        const player = new Entity(50, 50);
        player.width = playerSize;
        player.height = playerSize;
        this.entities.push(player);
        
        // Create some static ground entities (scaled for platform)
        const groundCount = Math.ceil(internalDims.width / groundSize);
        for (let i = 0; i < groundCount; i++) {
            const ground = new Entity(i * groundSize, internalDims.height - groundSize);
            ground.isStatic = true;
            ground.width = groundSize;
            ground.height = groundSize;
            this.entities.push(ground);
        }
        
        // Create some platforms
        const platformCount = Math.min(5, Math.floor(internalDims.width / platformWidth));
        for (let i = 0; i < platformCount; i++) {
            const platformEntity = new Entity(100 + i * platformWidth * 2, internalDims.height - 80);
            platformEntity.isStatic = true;
            platformEntity.width = platformWidth;
            platformEntity.height = platformHeight;
            this.entities.push(platformEntity);
        }
    }

    public async loadGamePack(url: string): Promise<void> {
        try {
            this.currentPack = await this.packLoader.loadPack(url);
            console.log(`Loaded game pack: ${this.currentPack.name}`);
            
            // Set physics gravity if specified
            if (this.currentPack.defaultGravity !== undefined) {
                this.physics.setGravity(this.currentPack.defaultGravity);
            }
        } catch (error) {
            console.error("Failed to load game pack:", error);
        }
    }

    public start(): void {
        this.loop.start();
    }

    public stop(): void {
        this.loop.stop();
        // Clean up event listeners
        this.input.cleanup();
    }

    public toggleFPSDisplay(): void {
        this.fpsDisplay = !this.fpsDisplay;
    }

    private update(dt: number): void {
        // Check if game is paused
        if (this.pauseManager.isPaused) {
            return;
        }
        
        // Validate delta time to prevent spiral of death
        if (!isFinite(dt) || dt < 0) {
            console.warn("Invalid delta time provided to game engine update");
            return;
        }
        
        const clampedDt = Math.max(0, Math.min(dt, 1/30)); // Cap at 30 FPS equivalent
        
        try {
            // Update input handler
            this.input.update();
            
            // Update dev tools
            this.freeCamera.update(clampedDt);
            
            // Handle state machine input and updates
            this.stateMachine.handleInput(this.input);
            this.stateMachine.update(clampedDt);
            
            // Update physics for all entities (with cheat integration)
            this.physics.update(this.entities, clampedDt);
            
            // Apply cheat effects
            this.applyCheatEffects();
            
            // Update animations for all entities
            for (const entity of this.entities) {
                if (entity && entity.animationController) {
                    entity.animationController.update(clampedDt);
                }
            }
            
            // Check collisions (with NoClip cheat integration)
            this.checkCollisionsWithCheats();
            
            // Handle trigger catch-up for fast-moving entities
            this.handleTriggerCatchUp();
            
            // Handle player input for test
            this.handlePlayerInput();
        } catch (error) {
            console.error("Error in game engine update:", error);
            
            // Attempt to recover from critical errors
            this.attemptErrorRecovery(error);
        }
    }

    private attemptErrorRecovery(error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn("Attempting error recovery:", errorMessage);
        
        try {
            // Clean up input states
            this.input.cleanup();
            
            // Reset any invalid entity positions
            for (const entity of this.entities) {
                if (!isFinite(entity.position.x) || !isFinite(entity.position.y)) {
                    console.warn("Resetting invalid entity position");
                    entity.position.x = 0;
                    entity.position.y = 0;
                    entity.velocity.x = 0;
                    entity.velocity.y = 0;
                }
            }
            
            // Reset camera position if needed
            const camera = this.renderer.getCamera();
            if (!isFinite(camera.x) || !isFinite(camera.y)) {
                console.warn("Resetting invalid camera position");
                this.renderer.setCamera(0, 0);
            }
            
            console.log("Error recovery completed successfully");
        } catch (recoveryError) {
            console.error("Error recovery failed:", recoveryError);
            this.handleCriticalError();
        }
    }

    private handleCriticalError(): void {
        console.error("Critical error detected, attempting game restart");
        
        try {
            // Stop the current game loop
            this.loop.stop();
            
            // Clear all entities
            this.entities = [];
            
            // Reset all subsystems
            this.input.cleanup();
            this.cheatManager.reset();
            this.freeCamera.setEnabled(false);
            this.debugOverlay.setEnabled(false);
            
            // Recreate test entities
            this.createTestEntities();
            
            // Restart the game loop
            setTimeout(() => {
                try {
                    this.loop.start();
                    console.log("Game successfully restarted after critical error");
                } catch (restartError) {
                    console.error("Failed to restart game loop:", restartError);
                    // Display user-friendly error message
                    this.displayError("Game failed to restart. Please refresh the page.");
                }
            }, 1000);
        } catch (error) {
            console.error("Critical error recovery failed:", error);
            this.displayError("Game encountered a critical error. Please refresh the page.");
        }
    }

    private displayError(message: string): void {
        // Create error overlay
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            z-index: 10000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>Game Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }

    private applyCheatEffects(): void {
        const player = this.entities[0];
        if (!player) return;

        // Apply health override
        if (this.cheatManager.hasHealthOverride()) {
            const healthValue = this.cheatManager.getHealthOverride();
            if (healthValue !== null) {
                player.health = healthValue;
            }
        }

        // Apply GiveSword cheat
        if (this.cheatManager.on(CheatFlag.GiveSword)) {
            if (!player.inventory.includes('Sword')) {
                player.inventory.push('Sword');
            }
        }
    }

    private checkCollisionsWithCheats(): void {
        const player = this.entities[0];
        if (!player) return;

        // If Noclip is active, skip collision checks for the player
        if (this.cheatManager.on(CheatFlag.Noclip)) {
            // Only check collisions between non-player entities
            const nonPlayerEntities = this.entities.slice(1);
            this.collision.checkCollisions(nonPlayerEntities);
        } else {
            // Normal collision checking
            this.collision.checkCollisions(this.entities);
        }
    }

    private handlePlayerInput(): void {
        try {
            const player = this.entities[0];
            if (!player) return;

            const speed = 150; // Base movement speed
            
            // Get movement input using new action-based system
            let moveX = 0;
            if (this.input.isActionDown('Left')) moveX--;
            if (this.input.isActionDown('Right')) moveX++;
            
            // Apply movement
            player.velocity.x = moveX * speed;
            
            // Jump logic with late jump buffer support
            if (this.input.isActionDown('Jump')) {
                const isOnGround = this.collision.isOnGround(player, this.entities.filter(e => e && e.isStatic));
                
                // Update ground state for late jump buffer
                this.input.updateGroundState(isOnGround);
                
                if (isOnGround && player.velocity.y >= 0) {
                    player.velocity.y = -300;
                }
            } else {
                // Update ground state even when not jumping
                const isOnGround = this.collision.isOnGround(player, this.entities.filter(e => e && e.isStatic));
                this.input.updateGroundState(isOnGround);
            }

            // Action button (for ledge grabbing, etc.)
            if (this.input.isActionDown('Action')) {
                // Handle sticky grab logic
                const isNearLedge = this.checkNearLedge(player);
                if (isNearLedge) {
                    this.input.updateLedgeGrabState(true);
                    // Trigger ledge grab
                    this.handleLedgeGrab(player);
                } else {
                    this.input.updateLedgeGrabState(false);
                }
            } else {
                this.input.updateLedgeGrabState(false);
            }

            // Dev tool keyboard shortcuts (keep these as direct key checks for now)
            if (this.input.isKeyPressed("F1")) {
                this.debugOverlay.setEnabled(!this.debugOverlay.isEnabled());
            }
            
            if (this.input.isKeyPressed("KeyC")) {
                this.freeCamera.setEnabled(!this.freeCamera.isEnabled());
            }
            
            // Numpad 5 to reset free camera to player
            if (this.input.isKeyPressed("Numpad5") && this.freeCamera.isEnabled()) {
                this.freeCamera.setPosition(player.position.x, player.position.y);
            }
            
            // Quick cheat toggles
            if (this.input.isKeyPressed("KeyG")) {
                this.cheatManager.toggle(CheatFlag.God);
            }
            
            if (this.input.isKeyPressed("KeyN")) {
                this.cheatManager.toggle(CheatFlag.Noclip);
            }
            
            if (this.input.isKeyPressed("KeyT")) {
                this.cheatManager.toggle(CheatFlag.InfTime);
            }
            
            if (this.input.isKeyPressed("KeyS")) {
                this.cheatManager.toggle(CheatFlag.GiveSword);
            }
        } catch (error) {
            console.error("Error in player input handling:", error);
        }
    }

    private handleTriggerCatchUp(): void {
        // Handle trigger catch-up for fast-moving entities
        // This prevents entities from moving so fast they skip over triggers
        for (const entity of this.entities) {
            if (entity.velocity && (Math.abs(entity.velocity.x) > 100 || Math.abs(entity.velocity.y) > 100)) {
                // Entity is moving fast, check for triggers along the path
                this.checkTriggerPath(entity);
            }
        }
    }

    private checkTriggerPath(entity: Entity): void {
        // Get entity's old and new positions
        const oldPos = entity.previousPosition || entity.position;
        const newPos = entity.position;
        
        // Calculate movement vector
        const deltaX = newPos.x - oldPos.x;
        const deltaY = newPos.y - oldPos.y;
        
        // If movement is significant, check for triggers along the path
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            // Sample points along the movement path
            const steps = Math.max(Math.ceil(Math.abs(deltaX) / 10), Math.ceil(Math.abs(deltaY) / 10));
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const checkX = oldPos.x + deltaX * t;
                const checkY = oldPos.y + deltaY * t;
                
                // Check for triggers at this position
                this.checkTriggersAtPosition(entity, checkX, checkY);
            }
        }
    }

    private checkTriggersAtPosition(entity: Entity, x: number, y: number): void {
        // This would check for triggers at the given position
        // and fire them if the entity should trigger them
        // Implementation depends on your trigger system
        
        // Example implementation:
        const triggers = this.getTriggersAtPosition(x, y);
        triggers.forEach(trigger => {
            if (this.shouldTrigger(entity, trigger)) {
                this.fireTrigger(trigger, entity);
            }
        });
    }

    private getTriggersAtPosition(x: number, y: number): any[] {
        // This would return all triggers at the given position
        // Implementation depends on your trigger system
        return [];
    }

    private shouldTrigger(entity: Entity, trigger: any): boolean {
        // Check if the entity should trigger this trigger
        // Implementation depends on your trigger system
        return true;
    }

    private fireTrigger(trigger: any, entity: Entity): void {
        // Fire the trigger for the entity
        // Implementation depends on your trigger system
        console.log(`Trigger fired: ${trigger.id} by entity ${entity.id}`);
    }

    /**
     * Check if player is near a ledge for sticky grab
     */
    private checkNearLedge(player: Entity): boolean {
        // Simple ledge detection - check if there's a gap in front of the player
        const ledgeCheckDistance = 20;
        const groundCheckDistance = 30;
        
        // Check if there's ground in front of the player
        const frontGround = this.collision.isOnGround(
            { ...player, position: { x: player.position.x + ledgeCheckDistance, y: player.position.y } } as Entity,
            this.entities.filter(e => e && e.isStatic)
        );
        
        // Check if there's no ground below the front position
        const frontBelowGround = this.collision.isOnGround(
            { ...player, position: { x: player.position.x + ledgeCheckDistance, y: player.position.y + groundCheckDistance } } as Entity,
            this.entities.filter(e => e && e.isStatic)
        );
        
        return !frontGround && !frontBelowGround;
    }

    /**
     * Handle ledge grab mechanics
     */
    private handleLedgeGrab(player: Entity): void {
        // Simple ledge grab - snap to ledge position
        const ledgeSnapDistance = 10;
        player.position.x += ledgeSnapDistance;
        player.velocity.x = 0;
        player.velocity.y = 0;
    }

    private render(): void {
        try {
            // Clear the screen with platform-specific background color
            const platform = this.renderer.getCurrentPlatform();
            this.renderer.clear(platform.backgroundColor);
            
            // Get internal dimensions for platform scaling
            const internalDims = this.renderer.getInternalDimensions();
            
            // Get font metrics for proper text sizing
            const fontMetrics = this.renderer.getFontMetrics();
            
            // Render all entities
            for (const entity of this.entities) {
                if (!entity) continue; // Skip null/undefined entities
                
                const img = entity.animationController?.getCurrentImage();
                if (img) {
                    this.renderer.drawImage(img, entity.position.x, entity.position.y, entity.width, entity.height);
                } else {
                    // Draw placeholder rectangle if no image
                    const color = entity.isStatic ? "#8B4513" : "#FF0000"; // Brown for static, red for dynamic
                    this.renderer.drawRect(entity.position.x, entity.position.y, entity.width, entity.height, color);
                }
            }
        
            // COORDINATED TEXT RENDERING SYSTEM - No more overlaps!
            const lineHeight = fontMetrics.charHeight + 2;
            let currentY = lineHeight;
            const minDimension = Math.min(internalDims.width, internalDims.height);
            
            // 1. FPS Display (top-left) - only if debug overlay is disabled
            if (this.fpsDisplay && !this.debugOverlay.isEnabled()) {
                this.renderer.drawText(`FPS:${this.loop.getFPS()}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                currentY += lineHeight;
            }
            
            // 2. State Display (only if there's space and not overlapping)
            const currentState = this.stateMachine.getCurrentState();
            if (currentState && internalDims.width > 200) {
                this.renderer.drawText(`State:${currentState.name}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                currentY += lineHeight;
            }
            
            // 3. Player Debug Info (only if debug overlay is disabled to avoid duplication)
            const player = this.entities[0];
            if (player && !this.debugOverlay.isEnabled()) {
                const isOnGround = this.collision.isOnGround(player, this.entities.filter(e => e && e.isStatic));
                
                if (minDimension > 160) { // Not Game Boy size
                    this.renderer.drawText(`Y:${Math.round(player.position.y)}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                    
                    this.renderer.drawText(`VY:${Math.round(player.velocity.y)}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                    
                    this.renderer.drawText(`Gnd:${isOnGround}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                } else {
                    // Very compact for Game Boy size
                    this.renderer.drawText(`Y:${Math.round(player.position.y)}`, 2, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                    this.renderer.drawText(`G:${isOnGround ? '1' : '0'}`, 2, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                }
            }
            
            // Render pause overlay if paused
            if (this.pauseManager.isPaused) {
                this.renderer.drawRect(0, 0, internalDims.width, internalDims.height, "rgba(0,0,0,0.5)");
                const pauseText = "PAUSED";
                const textWidth = pauseText.length * fontMetrics.charWidth;
                const textX = (internalDims.width - textWidth) / 2;
                const textY = internalDims.height / 2;
                this.renderer.drawText(pauseText, textX, textY, `${fontMetrics.charHeight}px monospace`, "#FFF");
            }
            
            // COORDINATED BOTTOM TEXT RENDERING - No more overlaps!
            const bottomTexts: Array<{text: string, color: string, priority: number}> = [];
            
            // Add instructions (highest priority - always show)
            const instructions = this.getCompactInstructions(internalDims, fontMetrics);
            instructions.forEach(instruction => {
                bottomTexts.push({text: instruction, color: "#FFF", priority: 1});
            });
            
            // Render debug overlay (if enabled, it handles its own text positioning)
            if (player && this.debugOverlay.isEnabled()) {
                // Update debug info
                this.debugOverlay.update({
                    fps: this.loop.getFPS(),
                    frameTime: 16.67, // Default 60fps frame time
                    entities: this.entities.length,
                    playerPosition: player.position,
                    playerVelocity: player.velocity,
                    playerHealth: player.health,
                    gameTime: Date.now()
                });
                
                // Render the debug overlay
                this.debugOverlay.render();
            }
            
            // Add cheat status (only if debug overlay is disabled)
            if (player && !this.debugOverlay.isEnabled()) {
                const activeCheats = this.cheatManager.getActiveFlags();
                if (activeCheats.length > 0) {
                    const cheatText = `Cheats:${activeCheats.join(',')}`;
                    const maxChars = Math.floor(internalDims.width / fontMetrics.charWidth) - 2;
                    const displayText = cheatText.length > maxChars ? cheatText.substring(0, maxChars) + '...' : cheatText;
                    bottomTexts.push({text: displayText, color: "#FF0", priority: 2});
                }
                
                // Add player health and inventory (only if space allows)
                if (internalDims.width > 200) {
                    bottomTexts.push({text: `HP:${player.health}`, color: "#0F0", priority: 3});
                    if (player.inventory.length > 0) {
                        const invText = `Inv:${player.inventory.join(',')}`;
                        const maxChars = Math.floor(internalDims.width / fontMetrics.charWidth) - 2;
                        const displayInvText = invText.length > maxChars ? invText.substring(0, maxChars) + '...' : invText;
                        bottomTexts.push({text: displayInvText, color: "#0F0", priority: 4});
                    }
                }
            }
            
            // Sort by priority and render from bottom up
            bottomTexts.sort((a, b) => a.priority - b.priority);
            let currentBottomY = internalDims.height - (bottomTexts.length * (fontMetrics.charHeight + 1));
            
            bottomTexts.forEach(({text, color}) => {
                this.renderer.drawText(text, 5, currentBottomY, `${fontMetrics.charHeight}px monospace`, color);
                currentBottomY += fontMetrics.charHeight + 1;
            });
            
            // Render the internal canvas to the display canvas
            this.renderer.renderToDisplay();
            
        } catch (error) {
            console.error("Error in game engine render:", error);
        }
    }

    private getCompactInstructions(internalDims: { width: number; height: number }, fontMetrics: { charWidth: number; charHeight: number }): string[] {
        const minDimension = Math.min(internalDims.width, internalDims.height);
        
        if (minDimension <= 160) {
            // Very compact for Game Boy
            return [
                "WASD:Move Space:Jump",
                "P:Menu Dev:`"
            ];
        } else if (minDimension <= 256) {
            // Compact for NES/SNES
            return [
                "WASD/Arrows:Move Space:Jump",
                "P:Menu Dev:`=Panel"
            ];
        } else {
            // Full instructions for larger screens
            return [
                "WASD/Arrows:Move Space:Jump P:Menu",
                "Dev:F1=Debug C=FreeCam G=GodMode N=NoClip `=Panel"
            ];
        }
    }

    // Public getters for subsystems
    public getRenderer(): Renderer {
        return this.renderer;
    }

    public getInput(): InputHandler {
        return this.input;
    }

    public getPhysics(): PhysicsEngine {
        return this.physics;
    }

    public getCollision(): CollisionSystem {
        return this.collision;
    }

    public getStateMachine(): StateMachine {
        return this.stateMachine;
    }

    public getEntities(): Entity[] {
        return this.entities;
    }

    public addEntity(entity: Entity): void {
        if (!entity) {
            console.warn('Attempted to add null/undefined entity');
            return;
        }
        this.entities.push(entity);
    }

    public removeEntity(entity: Entity): void {
        if (!entity) {
            console.warn('Attempted to remove null/undefined entity');
            return;
        }
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    public getFPS(): number {
        return this.loop.getFPS();
    }

    public getPauseManager(): PauseManager {
        return this.pauseManager;
    }

    public getCheatManager(): CheatManager {
        return this.cheatManager;
    }

    public getFreeCamera(): FreeCamera {
        return this.freeCamera;
    }

    public getDebugOverlay(): DebugOverlay {
        return this.debugOverlay;
    }

    public getInputMap(): any {
        return this.input.getInputMap();
    }

    public getGamepad(): any {
        return this.input.getGamepad();
    }

    // Platform management
    /**
     * Set platform with proper state synchronization
     */
    public async setPlatform(platformKey: string): Promise<void> {
        // Check if platform switch is already in progress
        if (this.platformSwitchLock) {
            console.warn("Platform switch already in progress, waiting for completion");
            if (this.platformSwitchPromise) {
                await this.platformSwitchPromise;
            }
            return;
        }
        
        // Validate platform key
        if (!platformKey || typeof platformKey !== 'string') {
            throw new Error("Invalid platform key provided");
        }
        
        // Check if platform is already set
        if (this.currentPlatformKey === platformKey) {
            console.log(`Platform already set to ${platformKey}`);
            return;
        }
        
        // Acquire platform switch lock
        this.platformSwitchLock = true;
        
        try {
            // Create platform switch promise
            this.platformSwitchPromise = this.performPlatformSwitch(platformKey);
            await this.platformSwitchPromise;
        } finally {
            // Release platform switch lock
            this.platformSwitchLock = false;
            this.platformSwitchPromise = null;
        }
    }

    /**
     * Perform the actual platform switch with proper state management
     */
    private async performPlatformSwitch(platformKey: string): Promise<void> {
        console.log(`Switching platform from ${this.currentPlatformKey} to ${platformKey}`);
        
        try {
            // Pause the game during platform switch
            const wasPaused = this.pauseManager.isPaused;
            this.pauseManager.pause();
            
            // Stop the game loop temporarily
            this.loop.stop();
            
            // Clear current entities
            this.entities.length = 0;
            
            // Update renderer platform
            await this.renderer.setPlatform(platformKey);
            
            // Update current platform key
            this.currentPlatformKey = platformKey;
            
            // Recreate entities for new platform
            this.createTestEntities();
            
            // Restart game loop
            this.loop.start();
            
            // Restore pause state
            if (!wasPaused) {
                this.pauseManager.resume();
            }
            
            console.log(`Platform switch completed successfully: ${platformKey}`);
        } catch (error) {
            console.error(`Platform switch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            // Attempt to recover by reverting to previous platform
            try {
                await this.renderer.setPlatform(this.currentPlatformKey);
                this.loop.start();
                if (!this.pauseManager.isPaused) {
                    this.pauseManager.resume();
                }
                console.log("Recovered to previous platform state");
            } catch (recoveryError) {
                console.error("Failed to recover from platform switch error:", recoveryError);
                throw new Error("Platform switch failed and recovery failed");
            }
            
            throw error;
        }
    }

    /**
     * Get current platform key
     */
    public getCurrentPlatformKey(): string {
        return this.currentPlatformKey;
    }

    /**
     * Check if platform switch is in progress
     */
    public isPlatformSwitchInProgress(): boolean {
        return this.platformSwitchLock;
    }

    private recreateEntitiesForPlatform(): void {
        try {
            // Clear existing entities
            this.entities = [];
            
            // Recreate entities for new platform
            this.createTestEntities();
            
            // Update collision system
            this.collision.setPlayerEntityGetter(() => this.entities[0] || null);
            
            console.log("Entities recreated for new platform");
        } catch (error) {
            console.error("Error recreating entities for platform:", error);
        }
    }

    public getCurrentPlatform(): PlatformConfig {
        return this.renderer.getCurrentPlatform();
    }

    public getAllPlatforms(): PlatformConfig[] {
        return PlatformManager.getAllPlatforms();
    }

    // Settings and audio management
    private applySettings(): void {
        const videoSettings = this.settingsStore.getVideoSettings();
        const audioSettings = this.settingsStore.getAudioSettings();

        // Apply video settings to renderer
        this.renderer.setScaleMode(videoSettings.scaleMode);
        this.renderer.setSafeArea(videoSettings.safeAreaPct);
        if (videoSettings.fpsCap) {
            this.loop.setFixedTimestepRate(1 / videoSettings.fpsCap);
        }
        // Note: vsync is handled by the browser, no direct control needed

        // Apply audio settings
        this.audioManager.setMasterVolume(audioSettings.master);
        this.audioManager.setMusicVolume(audioSettings.music);
        this.audioManager.setSfxVolume(audioSettings.sfx);
        this.audioManager.setMuted(audioSettings.muted);
        this.audioManager.setLatencyMode(audioSettings.latency);

        // Setup settings change listeners
        this.setupSettingsListeners();
    }

    private setupSettingsListeners(): void {
        // Video settings listeners
        this.settingsStore.addListener('video.scaleMode', (mode) => {
            this.renderer.setScaleMode(mode);
        });
        this.settingsStore.addListener('video.safeAreaPct', (pct) => {
            this.renderer.setSafeArea(pct);
        });
        this.settingsStore.addListener('video.fpsCap', (fps) => {
            if (fps) {
                this.loop.setFixedTimestepRate(1 / fps);
            }
        });
        // Note: vsync is handled by the browser, no direct control needed

        // Audio settings listeners
        this.settingsStore.addListener('audio.master', (volume) => {
            this.audioManager.setMasterVolume(volume);
        });
        this.settingsStore.addListener('audio.music', (volume) => {
            this.audioManager.setMusicVolume(volume);
        });
        this.settingsStore.addListener('audio.sfx', (volume) => {
            this.audioManager.setSfxVolume(volume);
        });
        this.settingsStore.addListener('audio.muted', (muted) => {
            this.audioManager.setMuted(muted);
        });
        this.settingsStore.addListener('audio.latency', (latency) => {
            this.audioManager.setLatencyMode(latency);
        });
    }

    private setupUserInteractionHandling(): void {
        const interactionEvents = ['mousedown', 'keydown', 'touchstart', 'click'];
        
        const handleUserInteraction = () => {
            this.audioManager.onUserInteraction();
            
            // Remove event listeners after first interaction
            interactionEvents.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        };
        
        // Add event listeners for user interaction
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { once: true });
        });
    }

    // Public getters for audio and settings
    public getAudioManager(): AudioManager {
        return this.audioManager;
    }

    public getSettingsStore(): SettingsStore {
        return this.settingsStore;
    }
} 