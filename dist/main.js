import { GameEngine } from "./engine/GameEngine.js";
import { PlayState } from "./states/PlayState.js";
import { PiMenu } from "./ui/PiMenu.js";
import { SaveManager } from "./engine/SaveManager.js";
import { SaveSystem } from "./engine/save/SaveSystem.js";
import { PlatformSelector } from "./ui/PlatformSelector.js";
import { bootGame } from "./engine/boot/boot.js";
import { AudioManager } from "./engine/AudioManager.js";
import { SettingsStore } from "./engine/SettingsStore.js";
import { VFS } from "./engine/assets/VFS.js";
import { LibraryManager } from "./engine/library/LibraryManager.js";
window.addEventListener("load", async () => {
    let engine = null;
    let piMenu = null;
    let platformSelector = null;
    let audioManager = null;
    let settingsStore = null;
    let vfs = null;
    let libraryManager = null;
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
        console.error("Unhandled promise rejection:", event.reason);
        // Try to recover from non-critical promise rejections
        if (event.reason && typeof event.reason === 'string') {
            if (event.reason.includes('asset') || event.reason.includes('load')) {
                console.warn("Asset loading error detected, continuing with defaults");
                event.preventDefault(); // Prevent default handling
            }
        }
    };
    // Global error handler for runtime errors
    const handleGlobalError = (event) => {
        console.error("Global error caught:", event.error);
        // Try to recover from non-critical errors
        if (event.error && typeof event.error === 'string' && event.error.includes('canvas')) {
            console.warn("Canvas-related error detected, attempting recovery");
            event.preventDefault(); // Prevent default handling
        }
    };
    // Loading indicator functions
    const showLoadingIndicator = (message) => {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingIndicator';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        loadingDiv.innerHTML = `
            <div style="margin-bottom: 10px;">⏳</div>
            <div>${message}</div>
        `;
        document.body.appendChild(loadingDiv);
    };
    const hideLoadingIndicator = () => {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    };
    const showErrorMessage = (message) => {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <div style="margin-bottom: 10px;">⚠️</div>
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">
                OK
            </button>
        `;
        document.body.appendChild(errorDiv);
    };
    // Register global error handlers
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);
    try {
        const canvas = document.getElementById("gameCanvas");
        if (!canvas) {
            throw new Error("Canvas element not found!");
        }
        // Validate canvas context
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get 2D context from canvas!");
        }
        // Validate canvas dimensions
        if (canvas.width <= 0 || canvas.height <= 0) {
            throw new Error("Invalid canvas dimensions!");
        }
        canvas.tabIndex = 0;
        canvas.focus();
        // Handle canvas focus for keyboard input
        canvas.addEventListener("click", (e) => {
            canvas.focus();
            // Handle canvas-rendered UI clicks in fullscreen
            if (engine) {
                engine.getRenderer().handleCanvasClick(e);
            }
        });
        // Initialize core components
        engine = new GameEngine(canvas, 'snes'); // Default platform, will be overridden by boot config
        audioManager = new AudioManager();
        settingsStore = new SettingsStore();
        // Initialize VFS and LibraryManager
        vfs = new VFS({
            cacheExpiryHours: 24,
            maxCacheSize: 100 * 1024 * 1024 // 100MB
        });
        libraryManager = new LibraryManager({
            vfs: vfs,
            builtinPacksPath: 'packs/manifest.json'
        });
        // Initialize library manager
        try {
            await libraryManager.initialize();
            console.log('Library manager initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize library manager:', error);
        }
        // Initialize save manager and save system
        const saveManager = new SaveManager();
        const saveSystem = new SaveSystem({
            packId: 'default',
            canvas: canvas,
            thumbnailWidth: 160,
            thumbnailHeight: 90,
            engineVersion: '1.0.0'
        });
        // Expose core components globally for dev controls
        window.ptsCore = {
            audioManager,
            settingsStore,
            engine
        };
        // Add debug function to check UI elements
        window.debugUI = () => {
            console.log('=== UI Debug Info ===');
            console.log('Pi button:', document.getElementById('piMenuButton'));
            console.log('Pi menu overlay:', document.getElementById('piMenuOverlay'));
            console.log('Platform selector overlay:', document.getElementById('platformSelectorOverlay'));
            console.log('Dev controls:', document.getElementById('devControls'));
            console.log('Retro info:', document.querySelector('.retro-info'));
            console.log('Fullscreen element:', document.fullscreenElement);
            console.log('Is fullscreen:', !!document.fullscreenElement);
            // Force Pi button to be visible
            const piButton = document.getElementById('piMenuButton');
            if (piButton) {
                piButton.style.display = 'block';
                piButton.style.visibility = 'visible';
                piButton.style.opacity = '1';
                piButton.style.zIndex = '9999';
                console.log('Pi button forced to be visible');
            }
            else {
                console.error('Pi button not found!');
            }
        };
        // Setup settings change handlers
        settingsStore.onChange((newSettings) => {
            if (engine) {
                const renderer = engine.getRenderer();
                if (renderer) {
                    renderer.setScaleMode(newSettings.video.scaleMode);
                    renderer.setSafeArea(newSettings.video.safeAreaPct);
                }
            }
            if (audioManager) {
                audioManager.setMasterVolume(newSettings.audio.master);
                audioManager.setMusicVolume(newSettings.audio.music);
                audioManager.setSfxVolume(newSettings.audio.sfx);
                audioManager.setMuted(newSettings.audio.muted);
                audioManager.setLatencyHint(newSettings.audio.latency);
            }
        });
        // Run the new boot orchestrator
        console.log("Starting new boot process...");
        const bootContext = {
            engine: engine,
            settingsStore,
            libraryManager,
            saveSystem,
            audioManager,
            cheatManager: engine.getCheatManager()
        };
        const bootResult = await bootGame(bootContext);
        if (!bootResult.success) {
            console.error("Boot process failed:", bootResult.warnings);
            showErrorMessage(`Boot process failed: ${bootResult.warnings.join(', ')}`);
        }
        else if (bootResult.warnings.length > 0) {
            console.warn("Boot process completed with warnings:", bootResult.warnings);
        }
        // Initialize π menu
        piMenu = new PiMenu(engine.getPauseManager(), saveManager, settingsStore);
        piMenu.setSaveSystem(saveSystem);
        piMenu.setLibraryManager(libraryManager);
        // Initialize platform selector
        platformSelector = new PlatformSelector();
        platformSelector.setPlatformChangeCallback((platformKey) => {
            if (engine) {
                engine.setPlatform(platformKey);
                updatePlatformInfo();
            }
        });
        platformSelector.setPauseManager(engine.getPauseManager());
        platformSelector.setPiMenu(piMenu);
        // Pass dev tools to PiMenu
        piMenu.setDevTools(engine.getCheatManager(), engine.getFreeCamera(), engine.getDebugOverlay(), engine);
        // Initialize with play state
        const playState = new PlayState(engine);
        engine.getStateMachine().changeState(playState);
        // Start the game engine
        engine.start();
        // Update platform info display
        function updatePlatformInfo() {
            if (!engine)
                return;
            try {
                const platform = engine.getCurrentPlatform();
                const platformInfo = document.getElementById("platformInfo");
                if (platformInfo) {
                    platformInfo.innerHTML = `
                        <h3>${platform.name} (${platform.year})</h3>
                        <p>Resolution: ${platform.resolution.width}×${platform.resolution.height}</p>
                        <p>Colors: ${platform.colors}</p>
                        <p>Category: ${platform.category}</p>
                    `;
                }
                const displayRes = document.getElementById("displayRes");
                if (displayRes) {
                    displayRes.textContent = `${canvas.width}×${canvas.height}`;
                }
                const scale = document.getElementById("scale");
                if (scale) {
                    const renderer = engine.getRenderer();
                    const scaleInfo = renderer.getScale();
                    scale.textContent = `${scaleInfo.x.toFixed(2)}×${scaleInfo.y.toFixed(2)}`;
                }
            }
            catch (error) {
                console.error("Error updating platform info:", error);
            }
        }
        // Update UI visibility based on fullscreen state
        function updateUIVisibility(isFullscreen) {
            console.log(`updateUIVisibility called with isFullscreen: ${isFullscreen}`);
            // Update dev controls visibility
            const devControls = document.getElementById('devControls');
            if (devControls) {
                devControls.style.display = isFullscreen ? 'none' : 'block';
                console.log(`Dev controls ${isFullscreen ? 'hidden' : 'shown'}`);
            }
            else {
                console.warn('Dev controls element not found');
            }
            // Update retro info visibility
            const retroInfo = document.querySelector('.retro-info');
            if (retroInfo) {
                retroInfo.style.display = isFullscreen ? 'none' : 'block';
                console.log(`Retro info ${isFullscreen ? 'hidden' : 'shown'}`);
            }
            else {
                console.warn('Retro info element not found');
            }
            // Update Pi menu button visibility (should always be visible)
            const piButton = document.getElementById('piMenuButton');
            if (piButton) {
                piButton.style.display = 'block';
                piButton.style.zIndex = isFullscreen ? '9999' : '999';
                console.log(`Pi button z-index set to ${isFullscreen ? '9999' : '999'}`);
            }
            else {
                console.warn('Pi button element not found');
            }
            // Update platform selector overlay z-index
            const platformSelectorOverlay = document.getElementById('platformSelectorOverlay');
            if (platformSelectorOverlay) {
                platformSelectorOverlay.style.zIndex = isFullscreen ? '9999' : '2000';
                console.log(`Platform selector z-index set to ${isFullscreen ? '9999' : '2000'}`);
            }
            else {
                console.warn('Platform selector overlay not found');
            }
            // Update Pi menu overlay z-index
            const piMenuOverlayElement = document.getElementById('piMenuOverlay');
            if (piMenuOverlayElement) {
                piMenuOverlayElement.style.zIndex = isFullscreen ? '9999' : '1000';
                console.log(`Pi menu overlay z-index set to ${isFullscreen ? '9999' : '1000'}`);
            }
            else {
                console.warn('Pi menu overlay not found');
            }
            // Update PiMenu and PlatformSelector z-index using their methods
            if (piMenu) {
                piMenu.updateZIndexForFullscreen(isFullscreen);
            }
            if (platformSelector) {
                platformSelector.updateZIndexForFullscreen(isFullscreen);
            }
            console.log(`UI visibility updated for fullscreen: ${isFullscreen}`);
        }
        updatePlatformInfo();
        // Handle canvas focus on window focus
        window.addEventListener("focus", () => {
            try {
                if (document.activeElement !== canvas) {
                    canvas.focus();
                }
            }
            catch (error) {
                console.warn("Failed to focus canvas on window focus:", error);
            }
        });
        // Handle window resize
        window.addEventListener("resize", () => {
            if (engine) {
                engine.getRenderer().resizeToWindow();
            }
        });
        // Handle fullscreen toggle and mute
        document.addEventListener("keydown", (e) => {
            if (e.key === 'f' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                if (engine && settingsStore) {
                    const renderer = engine.getRenderer();
                    if (renderer.isFullscreenMode()) {
                        renderer.exitFullscreen().then(() => {
                            settingsStore.set('video.fullscreen', false);
                        }).catch(console.error);
                    }
                    else {
                        renderer.requestFullscreen().then(() => {
                            settingsStore.set('video.fullscreen', true);
                        }).catch(console.error);
                    }
                }
            }
            // Mute toggle
            if (e.key === 'm' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                if (audioManager && settingsStore) {
                    const currentMuted = audioManager.isMuted();
                    audioManager.setMuted(!currentMuted);
                    settingsStore.set('audio.muted', !currentMuted);
                }
            }
        });
        // Handle fullscreen change events to manage UI visibility
        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = !!document.fullscreenElement;
            console.log(`Fullscreen state changed: ${isFullscreen}`);
            // Check if fullscreen container exists
            const fullscreenContainer = document.getElementById('fullscreenContainer');
            if (isFullscreen && fullscreenContainer) {
                console.log('Fullscreen container detected, UI elements should be visible');
            }
        });
        // Also listen for webkit fullscreen changes (Safari)
        document.addEventListener('webkitfullscreenchange', () => {
            const isFullscreen = !!document.webkitFullscreenElement;
            console.log(`Webkit fullscreen state changed: ${isFullscreen}`);
            // Check if fullscreen container exists
            const fullscreenContainer = document.getElementById('fullscreenContainer');
            if (isFullscreen && fullscreenContainer) {
                console.log('Fullscreen container detected, UI elements should be visible');
            }
        });
        // Also listen for moz fullscreen changes (Firefox)
        document.addEventListener('mozfullscreenchange', () => {
            const isFullscreen = !!document.mozFullScreenElement;
            console.log(`Moz fullscreen state changed: ${isFullscreen}`);
            // Check if fullscreen container exists
            const fullscreenContainer = document.getElementById('fullscreenContainer');
            if (isFullscreen && fullscreenContainer) {
                console.log('Fullscreen container detected, UI elements should be visible');
            }
        });
        // Handle visibility change for better resource management
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // Pause game when tab is not visible
                if (engine) {
                    engine.getPauseManager().pause();
                }
            }
            else {
                // Resume game when tab becomes visible
                if (engine) {
                    engine.getPauseManager().resume();
                }
            }
        });
        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // Platform selector (P key)
            if (e.key === 'p' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                if (platformSelector && !platformSelector.isPlatformSelectorVisible()) {
                    platformSelector.show();
                }
            }
            // Dev panel toggle (backtick/tilde key)
            if (e.key === '`' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                const devControls = document.getElementById('devControls');
                if (devControls) {
                    const isVisible = devControls.style.display !== 'none';
                    devControls.style.display = isVisible ? 'none' : 'block';
                    console.log(`Dev panel ${isVisible ? 'hidden' : 'shown'}`);
                }
            }
            // Pi menu (Escape key)
            if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                if (piMenu) {
                    piMenu.toggle();
                }
            }
            // Debug UI (D key)
            if (e.key === 'd' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                if (window.debugUI) {
                    window.debugUI();
                }
            }
        });
        // Handle errors and provide recovery options
        window.addEventListener("error", (event) => {
            console.error("Global error caught:", event.error);
            // Try to recover from non-critical errors
            if (event.error && typeof event.error === 'string' && event.error.includes('canvas')) {
                console.warn("Canvas-related error detected, attempting recovery");
                // Could implement canvas recovery here
            }
        });
        window.addEventListener("unhandledrejection", (event) => {
            console.error("Unhandled promise rejection:", event.reason);
        });
        // Handle page unload for cleanup
        window.addEventListener("beforeunload", () => {
            try {
                if (engine) {
                    engine.stop();
                }
                if (piMenu) {
                    piMenu.cleanup();
                }
                if (platformSelector) {
                    platformSelector.cleanup();
                }
                if (audioManager) {
                    audioManager.cleanup();
                }
                if (settingsStore) {
                    settingsStore.clearChangeCallbacks();
                }
                // Remove global error handlers
                window.removeEventListener("unhandledrejection", handleUnhandledRejection);
                window.removeEventListener("error", handleGlobalError);
                console.log("Game cleanup completed successfully");
            }
            catch (error) {
                console.error("Error during game cleanup:", error);
            }
        });
    }
    catch (error) {
        console.error("Failed to initialize game:", error);
        // Display user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>Game Initialization Failed</h3>
            <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
            <p>Please refresh the page to try again.</p>
            <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">
                Refresh Page
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
});
//# sourceMappingURL=main.js.map