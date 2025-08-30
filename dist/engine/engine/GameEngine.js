import { Renderer } from "./Renderer.js";
import { InputHandler } from "./InputHandler.js";
import { PhysicsEngine } from "./PhysicsEngine.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { AnimationController } from "./AnimationController.js";
import { StateMachine } from "./StateMachine.js";
import { GameLoop } from "./GameLoop.js";
import { Entity } from "./Entity.js";
import { GamePackLoader } from "./GamePackLoader.js";
import { PauseManager } from "./PauseManager.js";
import { CheatManager, CheatFlag } from "../dev/CheatManager.js";
import { FreeCamera } from "../dev/FreeCamera.js";
import { DebugOverlay } from "../dev/DebugOverlay.js";
import { PlatformManager } from "./PlatformConfig.js";
export class GameEngine {
    constructor(canvas, platformKey) {
        this.canvas = canvas;
        this.entities = [];
        this.fpsDisplay = false;
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
        // Initialize dev tools and cheats
        this.cheatManager = new CheatManager();
        this.freeCamera = new FreeCamera(this.renderer);
        this.debugOverlay = new DebugOverlay(this.renderer);
        this.loop = new GameLoop(this.update.bind(this), this.render.bind(this));
        // Add some test entities for demonstration
        this.createTestEntities();
        // Set up collision system with player entity reference
        this.collision.setPlayerEntityGetter(() => this.entities[0] || null);
    }
    createTestEntities() {
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
    async loadGamePack(url) {
        try {
            this.currentPack = await this.packLoader.loadPack(url);
            console.log(`Loaded game pack: ${this.currentPack.name}`);
            // Set physics gravity if specified
            if (this.currentPack.defaultGravity !== undefined) {
                this.physics.setGravity(this.currentPack.defaultGravity);
            }
        }
        catch (error) {
            console.error("Failed to load game pack:", error);
        }
    }
    start() {
        this.loop.start();
    }
    stop() {
        this.loop.stop();
        // Clean up event listeners
        this.input.cleanup();
    }
    toggleFPSDisplay() {
        this.fpsDisplay = !this.fpsDisplay;
    }
    update(dt) {
        // Check if game is paused
        if (this.pauseManager.isPaused) {
            return;
        }
        // Validate delta time to prevent spiral of death
        if (!isFinite(dt) || dt < 0) {
            console.warn("Invalid delta time provided to game engine update");
            return;
        }
        const clampedDt = Math.max(0, Math.min(dt, 1 / 30)); // Cap at 30 FPS equivalent
        try {
            // Update input handler
            this.input.update();
            // Update dev tools
            this.freeCamera.update(this.input, clampedDt);
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
            // Handle player input for test
            this.handlePlayerInput(clampedDt);
        }
        catch (error) {
            console.error("Error in game engine update:", error);
            // Attempt to recover from critical errors
            this.attemptErrorRecovery(error);
        }
    }
    attemptErrorRecovery(error) {
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
        }
        catch (recoveryError) {
            console.error("Error recovery failed:", recoveryError);
            this.handleCriticalError();
        }
    }
    handleCriticalError() {
        console.error("Critical error detected, attempting game restart");
        try {
            // Stop the current game loop
            this.loop.stop();
            // Clear all entities
            this.entities = [];
            // Reset all subsystems
            this.input.cleanup();
            this.cheatManager.resetAll();
            this.freeCamera.enabled = false;
            this.debugOverlay.enabled = false;
            // Recreate test entities
            this.createTestEntities();
            // Restart the game loop
            setTimeout(() => {
                try {
                    this.loop.start();
                    console.log("Game successfully restarted after critical error");
                }
                catch (restartError) {
                    console.error("Failed to restart game loop:", restartError);
                    // Display user-friendly error message
                    this.displayError("Game failed to restart. Please refresh the page.");
                }
            }, 1000);
        }
        catch (error) {
            console.error("Critical error recovery failed:", error);
            this.displayError("Game encountered a critical error. Please refresh the page.");
        }
    }
    displayError(message) {
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
    applyCheatEffects() {
        const player = this.entities[0];
        if (!player)
            return;
        // Apply SetHealth cheat
        if (this.cheatManager.isActive(CheatFlag.SetHealth)) {
            const healthValue = this.cheatManager.getValue(CheatFlag.SetHealth);
            if (healthValue !== null && typeof healthValue === 'number') {
                player.health = healthValue;
            }
        }
        // Apply GiveSword cheat
        if (this.cheatManager.isActive(CheatFlag.GiveSword)) {
            player.addToInventory('Sword');
        }
    }
    checkCollisionsWithCheats() {
        const player = this.entities[0];
        if (!player)
            return;
        // If NoClip is active, skip collision checks for the player
        if (this.cheatManager.isActive(CheatFlag.NoClip)) {
            // Only check collisions between non-player entities
            const nonPlayerEntities = this.entities.slice(1);
            this.collision.checkCollisions(nonPlayerEntities);
        }
        else {
            // Normal collision checking
            this.collision.checkCollisions(this.entities);
        }
    }
    handlePlayerInput(dt) {
        try {
            const player = this.entities[0]; // Assuming first entity is player
            if (!player) {
                console.warn("No player entity found for input handling");
                return;
            }
            const axis = this.input.getAxis();
            const speed = 100; // Reduced speed for lower resolution
            // Validate axis values to prevent extreme movement
            const clampedAxisX = Math.max(-1, Math.min(1, axis.x));
            const clampedAxisY = Math.max(-1, Math.min(1, axis.y));
            // Horizontal movement
            player.velocity.x = clampedAxisX * speed;
            // Jump logic
            if (this.input.isKeyDown("Space")) {
                const isOnGround = this.collision.isOnGround(player, this.entities.filter(e => e && e.isStatic));
                if (isOnGround && player.velocity.y >= 0) { // Only jump if on ground and not already moving up
                    player.velocity.y = -300; // Reduced jump velocity for lower resolution
                }
            }
            // Dev tool keyboard shortcuts
            if (this.input.isKeyPressed("F1")) {
                this.debugOverlay.toggle();
            }
            if (this.input.isKeyPressed("KeyC")) {
                this.freeCamera.toggle();
            }
            // Numpad 5 to reset free camera to player
            if (this.input.isKeyPressed("Numpad5") && this.freeCamera.enabled) {
                const internalDims = this.renderer.getInternalDimensions();
                this.freeCamera.resetToPlayer(player.position.x, player.position.y, internalDims.width, internalDims.height);
            }
            // Quick cheat toggles
            if (this.input.isKeyPressed("KeyG")) {
                this.cheatManager.toggle(CheatFlag.GodMode);
            }
            if (this.input.isKeyPressed("KeyN")) {
                this.cheatManager.toggle(CheatFlag.NoClip);
            }
            if (this.input.isKeyPressed("KeyT")) {
                this.cheatManager.toggle(CheatFlag.InfiniteTime);
            }
            if (this.input.isKeyPressed("KeyS")) {
                this.cheatManager.toggle(CheatFlag.GiveSword);
            }
        }
        catch (error) {
            console.error("Error in player input handling:", error);
        }
    }
    render() {
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
                if (!entity)
                    continue; // Skip null/undefined entities
                const img = entity.animationController?.getCurrentImage();
                if (img) {
                    this.renderer.drawImage(img, entity.position.x, entity.position.y, entity.width, entity.height);
                }
                else {
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
            if (this.fpsDisplay && !this.debugOverlay.enabled) {
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
            if (player && !this.debugOverlay.enabled) {
                const isOnGround = this.collision.isOnGround(player, this.entities.filter(e => e && e.isStatic));
                if (minDimension > 160) { // Not Game Boy size
                    this.renderer.drawText(`Y:${Math.round(player.position.y)}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                    this.renderer.drawText(`VY:${Math.round(player.velocity.y)}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                    this.renderer.drawText(`Gnd:${isOnGround}`, 5, currentY, `${fontMetrics.charHeight}px monospace`, "#FFF");
                    currentY += lineHeight;
                }
                else {
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
            const bottomTexts = [];
            // Add instructions (highest priority - always show)
            const instructions = this.getCompactInstructions(internalDims, fontMetrics);
            instructions.forEach(instruction => {
                bottomTexts.push({ text: instruction, color: "#FFF", priority: 1 });
            });
            // Render debug overlay (if enabled, it handles its own text positioning)
            if (player && this.debugOverlay.enabled) {
                this.debugOverlay.render(this.loop.getFPS(), player.position.x, player.position.y, player.velocity.x, player.velocity.y);
                // Draw entity bounding boxes if debug overlay is enabled
                this.debugOverlay.drawEntityBoxes(this.entities);
                // Draw grid if debug overlay is enabled
                this.debugOverlay.drawGrid();
            }
            // Add cheat status (only if debug overlay is disabled)
            if (player && !this.debugOverlay.enabled) {
                const activeCheats = this.cheatManager.getActiveCheats();
                if (activeCheats.length > 0) {
                    const cheatText = `Cheats:${activeCheats.join(',')}`;
                    const maxChars = Math.floor(internalDims.width / fontMetrics.charWidth) - 2;
                    const displayText = cheatText.length > maxChars ? cheatText.substring(0, maxChars) + '...' : cheatText;
                    bottomTexts.push({ text: displayText, color: "#FF0", priority: 2 });
                }
                // Add player health and inventory (only if space allows)
                if (internalDims.width > 200) {
                    bottomTexts.push({ text: `HP:${player.health}`, color: "#0F0", priority: 3 });
                    if (player.inventory.length > 0) {
                        const invText = `Inv:${player.inventory.join(',')}`;
                        const maxChars = Math.floor(internalDims.width / fontMetrics.charWidth) - 2;
                        const displayInvText = invText.length > maxChars ? invText.substring(0, maxChars) + '...' : invText;
                        bottomTexts.push({ text: displayInvText, color: "#0F0", priority: 4 });
                    }
                }
            }
            // Sort by priority and render from bottom up
            bottomTexts.sort((a, b) => a.priority - b.priority);
            let currentBottomY = internalDims.height - (bottomTexts.length * (fontMetrics.charHeight + 1));
            bottomTexts.forEach(({ text, color }) => {
                this.renderer.drawText(text, 5, currentBottomY, `${fontMetrics.charHeight}px monospace`, color);
                currentBottomY += fontMetrics.charHeight + 1;
            });
            // Render the internal canvas to the display canvas
            this.renderer.renderToDisplay();
        }
        catch (error) {
            console.error("Error in game engine render:", error);
        }
    }
    getCompactInstructions(internalDims, fontMetrics) {
        const minDimension = Math.min(internalDims.width, internalDims.height);
        if (minDimension <= 160) {
            // Very compact for Game Boy
            return [
                "WASD:Move Space:Jump",
                "P:Menu Dev:`"
            ];
        }
        else if (minDimension <= 256) {
            // Compact for NES/SNES
            return [
                "WASD/Arrows:Move Space:Jump",
                "P:Menu Dev:`=Panel"
            ];
        }
        else {
            // Full instructions for larger screens
            return [
                "WASD/Arrows:Move Space:Jump P:Menu",
                "Dev:F1=Debug C=FreeCam G=GodMode N=NoClip `=Panel"
            ];
        }
    }
    // Public getters for subsystems
    getRenderer() {
        return this.renderer;
    }
    getInput() {
        return this.input;
    }
    getPhysics() {
        return this.physics;
    }
    getCollision() {
        return this.collision;
    }
    getStateMachine() {
        return this.stateMachine;
    }
    getEntities() {
        return this.entities;
    }
    addEntity(entity) {
        if (!entity) {
            console.warn('Attempted to add null/undefined entity');
            return;
        }
        this.entities.push(entity);
    }
    removeEntity(entity) {
        if (!entity) {
            console.warn('Attempted to remove null/undefined entity');
            return;
        }
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    getFPS() {
        return this.loop.getFPS();
    }
    getPauseManager() {
        return this.pauseManager;
    }
    getCheatManager() {
        return this.cheatManager;
    }
    getFreeCamera() {
        return this.freeCamera;
    }
    getDebugOverlay() {
        return this.debugOverlay;
    }
    // Platform management
    setPlatform(platformKey) {
        const success = this.renderer.setPlatform(platformKey);
        if (success) {
            // Update physics floor to match new platform
            const platform = this.renderer.getCurrentPlatform();
            this.physics.setFloorY(platform.resolution.height);
            // Clear existing entities and recreate for new platform
            this.entities = [];
            this.createTestEntities();
            // Update collision system
            this.collision.setPlayerEntityGetter(() => this.entities[0] || null);
            console.log(`Game engine switched to platform: ${platform.name}`);
        }
        return success;
    }
    getCurrentPlatform() {
        return this.renderer.getCurrentPlatform();
    }
    getAllPlatforms() {
        return PlatformManager.getAllPlatforms();
    }
}
//# sourceMappingURL=GameEngine.js.map