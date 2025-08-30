import { GameEngine } from "./engine/GameEngine.js";
import { PlayState } from "./states/PlayState.js";
import { PiMenu } from "./ui/PiMenu.js";
import { SaveManager } from "./engine/SaveManager.js";
import { SaveSystem } from "./engine/save/SaveSystem.js";
import { PlatformSelector } from "./ui/PlatformSelector.js";
import { BootConfigManager } from "./engine/BootConfig.js";
import { bootGame, BootContext } from "./engine/boot/boot.js";
import { GamePackLoader } from "./engine/GamePackLoader.js";
import { AudioManager } from "./engine/AudioManager.js";
import { SettingsStore } from "./engine/SettingsStore.js";
import { VFS } from "./engine/assets/VFS.js";
import { LibraryManager } from "./engine/library/LibraryManager.js";
import { CheatManager } from "./dev/CheatManager.js";
import { SecurityManager } from "./engine/SecurityManager.js";

// Global security manager instance
let securityManager: SecurityManager;

window.addEventListener("load", async () => {
    let engine: GameEngine | null = null;
    let piMenu: PiMenu | null = null;
    let platformSelector: PlatformSelector | null = null;
    let audioManager: AudioManager | null = null;
    let libraryManager: LibraryManager | null = null;
    let saveSystem: SaveSystem | null = null;
    let cheatManager: CheatManager | null = null;
    let settingsStore: SettingsStore | null = null;

    // Initialize security manager
    const securityManager = new SecurityManager({
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxUrlLength: 2048,
        maxInputLength: 1000,
        allowedFileTypes: ['.ptspack.json', '.json', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.wav', '.ogg'],
        allowedDomains: ['localhost', '127.0.0.1', 'github.com', 'raw.githubusercontent.com'],
        rateLimits: {
            fileUpload: { maxRequests: 5, windowMs: 60000, blockDurationMs: 300000 },
            urlLoad: { maxRequests: 10, windowMs: 60000, blockDurationMs: 300000 },
            saveOperation: { maxRequests: 20, windowMs: 60000, blockDurationMs: 120000 },
            packSwitch: { maxRequests: 10, windowMs: 60000, blockDurationMs: 180000 },
            inputAction: { maxRequests: 1000, windowMs: 60000, blockDurationMs: 60000 },
            apiCall: { maxRequests: 100, windowMs: 60000, blockDurationMs: 300000 },
        }
    });

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error("Unhandled promise rejection:", event.reason);
        
        // Log security violation if it's a security-related error
        if (event.reason && typeof event.reason === 'string') {
            if (event.reason.includes('security') || event.reason.includes('rate limit')) {
                securityManager.logViolation('rate_limit', 'Unhandled security-related promise rejection', 'main', { reason: event.reason });
            }
        }
        
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
        
        // Log security violation if it's a security-related error
        if (event.error && typeof event.error === 'string') {
            if (event.error.includes('security') || event.error.includes('rate limit')) {
                securityManager.logViolation('rate_limit', 'Global security-related error', 'main', { error: event.error });
            }
        }
        
        // Try to recover from non-critical errors
        if (event.error && typeof event.error === 'string' && event.error.includes('canvas')) {
            console.warn("Canvas-related error detected, attempting recovery");
            event.preventDefault(); // Prevent default handling
        }
    };
    
    // Loading indicator functions
    const showLoadingIndicator = (message: string) => {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.textContent = message;
            loadingDiv.style.display = 'block';
        }
    };
    
    const hideLoadingIndicator = () => {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    };
    
    // Error display function
    const showErrorMessage = (message: string) => {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    };

    try {
        // Add global error handlers
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        window.addEventListener("error", handleGlobalError);
        
        showLoadingIndicator("Initializing game engine...");
        
        // Initialize core components with error handling
        const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        if (!canvas) {
            throw new Error("Canvas element not found!");
        }
        
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get 2D context from canvas!");
        }
        
        // Validate canvas dimensions
        if (canvas.width <= 0 || canvas.height <= 0) {
            console.warn("Invalid canvas dimensions, setting defaults");
            canvas.width = 800;
            canvas.height = 600;
        }
        
        showLoadingIndicator("Creating game engine...");
        
        // Create game engine with error handling
        try {
            engine = new GameEngine(canvas);
        } catch (error) {
            console.error("Failed to create game engine:", error);
            throw new Error(`Game engine creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        showLoadingIndicator("Initializing audio system...");
        
        // Initialize audio manager with error handling
        try {
            audioManager = new AudioManager();
        } catch (error) {
            console.warn("Audio system initialization failed, continuing without audio:", error);
            audioManager = null;
        }
        
        showLoadingIndicator("Setting up save system...");
        
        // Initialize save system with error handling
        try {
            saveSystem = new SaveSystem();
        } catch (error) {
            console.warn("Save system initialization failed, continuing without saves:", error);
            saveSystem = null;
        }
        
        showLoadingIndicator("Loading library manager...");
        
        // Initialize library manager with error handling
        try {
            const vfs = new VFS();
            libraryManager = new LibraryManager(vfs);
            await libraryManager.initialize();
        } catch (error) {
            console.warn("Library manager initialization failed, continuing with defaults:", error);
            libraryManager = null;
        }
        
        showLoadingIndicator("Creating UI components...");
        
        // Create UI components with error handling
        try {
            settingsStore = engine.getSettingsStore();
            piMenu = new PiMenu(engine.getPauseManager(), saveSystem as any, settingsStore);
            platformSelector = new PlatformSelector();
        } catch (error) {
            console.error("Failed to create UI components:", error);
            throw new Error(`UI component creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        showLoadingIndicator("Setting up dev tools...");
        
        // Initialize dev tools with error handling
        try {
            cheatManager = new CheatManager();
        } catch (error) {
            console.warn("Dev tools initialization failed, continuing without cheats:", error);
            cheatManager = null;
        }
        
        showLoadingIndicator("Configuring components...");
        
        // Configure components with error handling
        try {
            if (libraryManager) {
                piMenu.setLibraryManager(libraryManager);
            }
            
            if (saveSystem) {
                piMenu.setSaveSystem(saveSystem as any);
            }
            
            if (cheatManager && engine) {
                piMenu.setDevTools(cheatManager, engine.getFreeCamera(), engine.getDebugOverlay(), engine);
            }
        } catch (error) {
            console.warn("Component configuration failed:", error);
        }
        
        showLoadingIndicator("Booting game...");
        
        // Boot the game with security context and error handling
        try {
            const bootContext = {
                engine,
                audioManager,
                saveSystem,
                libraryManager,
                piMenu,
                platformSelector,
                cheatManager,
                settingsStore,
                securityManager
            };
            
            await bootGame(bootContext);
            console.log('Game booted successfully with security measures');
        } catch (error) {
            console.error('Failed to boot game:', error);
            showErrorMessage(`Failed to start the game: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page.`);
            throw error;
        }
        
        hideLoadingIndicator();
        
        // Set up page unload cleanup with error handling
        window.addEventListener('beforeunload', () => {
            try {
                // Security cleanup
                securityManager.clearViolations();
                
                // Component cleanup
                if (piMenu) piMenu.cleanup();
                if (platformSelector) platformSelector.cleanup();
                if (engine) engine.stop();
                if (audioManager) audioManager.cleanup();
                
                // Remove global error handlers
                window.removeEventListener("unhandledrejection", handleUnhandledRejection);
                window.removeEventListener("error", handleGlobalError);
                
                console.log('Application cleanup completed');
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        });
        
        // Security monitoring: Log suspicious activity
        setInterval(() => {
            try {
                const violations = securityManager.getSecurityStats().violations;
                if (violations.length > 0) {
                    console.warn(`Security violations detected: ${violations.length} violations`);
                }
            } catch (error) {
                console.error('Error during security monitoring:', error);
            }
        }, 60000); // Check every minute
        
    } catch (error) {
        console.error("Critical error during initialization:", error);
        hideLoadingIndicator();
        showErrorMessage(`Failed to initialize the game: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Log security violation for critical errors
        securityManager.logViolation('injection', 'Critical initialization error', 'main', { 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        // Attempt to clean up any partially initialized components
        try {
            if (piMenu) piMenu.cleanup();
            if (platformSelector) platformSelector.cleanup();
            if (engine) engine.stop();
            if (audioManager) audioManager.cleanup();
        } catch (cleanupError) {
            console.error('Error during emergency cleanup:', cleanupError);
        }
    }
});

// Export security manager for use in other modules
export { securityManager }; 