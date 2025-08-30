import { GameEngine } from "./engine/GameEngine.js";
import { PlayState } from "./states/PlayState.js";
import { PiMenu } from "./ui/PiMenu.js";
import { SaveManager } from "./engine/SaveManager.js";
import { PlatformSelector } from "./ui/PlatformSelector.js";
import { BootConfigManager } from "./engine/BootConfig.js";
import { GamePackLoader } from "./engine/GamePackLoader.js";

window.addEventListener("load", async () => {
    let engine: GameEngine | null = null;
    let piMenu: PiMenu | null = null;
    let platformSelector: PlatformSelector | null = null;
    
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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
    const handleGlobalError = (event: ErrorEvent) => {
        console.error("Global error caught:", event.error);
        
        // Try to recover from non-critical errors
        if (event.error && typeof event.error === 'string' && event.error.includes('canvas')) {
            console.warn("Canvas-related error detected, attempting recovery");
            event.preventDefault(); // Prevent default handling
        }
    };
    
    // Loading indicator functions
    const showLoadingIndicator = (message: string) => {
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
    
    const showErrorMessage = (message: string) => {
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
        const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
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
        canvas.addEventListener("click", () => canvas.focus());

        // Parse and validate boot configuration
        console.log("Parsing boot configuration from URL parameters...");
        const config = BootConfigManager.parse();
        const validation = BootConfigManager.validate(config);
        
        if (!validation.valid) {
            console.warn("Boot configuration validation errors:", validation.errors);
            // Continue with defaults, but log warnings
        }
        
        // Get platform from config or URL parameter or default to SNES
        const platformKey = config.platform || new URLSearchParams(window.location.search).get('platform') || 'snes';
        
        engine = new GameEngine(canvas, platformKey);

        // Load game pack if specified in config
        if (config.packUrl) {
            try {
                // Show loading indicator
                showLoadingIndicator("Loading game pack...");
                
                console.log(`Loading game pack from: ${config.packUrl}`);
                const packLoader = new GamePackLoader();
                const pack = await packLoader.loadPack(config.packUrl);
                console.log("Game pack loaded successfully:", pack.name);
                
                // Hide loading indicator
                hideLoadingIndicator();
            } catch (error) {
                console.error("Failed to load game pack:", error);
                
                // Show user-friendly error message
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.warn(`Continuing with default game state. Pack loading failed: ${errorMessage}`);
                
                // Hide loading indicator
                hideLoadingIndicator();
                
                // Show error message to user
                showErrorMessage(`Failed to load game pack: ${errorMessage}. Continuing with default game.`);
                
                // Continue with default game state
            }
        }

        // Apply boot configuration to engine
        console.log("Applying boot configuration...");
        BootConfigManager.apply(config, engine);

        // Initialize save manager and π menu
        const saveManager = new SaveManager();
        piMenu = new PiMenu(engine.getPauseManager(), saveManager);
        
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
        piMenu.setDevTools(
            engine.getCheatManager(),
            engine.getFreeCamera(),
            engine.getDebugOverlay(),
            engine
        );

        // Initialize with play state
        const playState = new PlayState(engine);
        engine.getStateMachine().changeState(playState);

        // Start the game engine
        engine.start();

        // Update platform info display
        function updatePlatformInfo() {
            if (!engine) return;
            
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
            } catch (error) {
                console.error("Error updating platform info:", error);
            }
        }

        updatePlatformInfo();

        // Handle canvas focus on window focus
        window.addEventListener("focus", () => {
            try {
                if (document.activeElement !== canvas) {
                    canvas.focus();
                }
            } catch (error) {
                console.warn("Failed to focus canvas on window focus:", error);
            }
        });

        // Handle visibility change for better resource management
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // Pause game when tab is not visible
                if (engine) {
                    engine.getPauseManager().pause();
                }
            } else {
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
                
                // Remove global error handlers
                window.removeEventListener("unhandledrejection", handleUnhandledRejection);
                window.removeEventListener("error", handleGlobalError);
                
                console.log("Game cleanup completed successfully");
            } catch (error) {
                console.error("Error during game cleanup:", error);
            }
        });

    } catch (error) {
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