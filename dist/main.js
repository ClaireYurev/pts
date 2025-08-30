import { GameEngine } from "./engine/GameEngine.js";
import { PiMenu } from "./ui/PiMenu.js";
import { SaveManager } from "./engine/SaveManager.js";
import { SaveSystem } from "./engine/save/SaveSystem.js";
import { PlatformSelector } from "./ui/PlatformSelector.js";
import { bootGame } from "./engine/boot/boot.js";
import { AudioManager } from "./engine/AudioManager.js";
import { SettingsStore } from "./engine/SettingsStore.js";
import { VFS } from "./engine/assets/VFS.js";
import { LibraryManager } from "./engine/library/LibraryManager.js";
import { CheatManager } from "./dev/CheatManager.js";
import { SecurityManager } from "./engine/SecurityManager.js";
// Global security manager instance
let securityManager;
window.addEventListener("load", async () => {
    let engine = null;
    let piMenu = null;
    let platformSelector = null;
    let audioManager = null;
    let settingsStore = null;
    let vfs = null;
    let libraryManager = null;
    // Initialize security manager
    securityManager = new SecurityManager({
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
    const handleUnhandledRejection = (event) => {
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
    const handleGlobalError = (event) => {
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
        // Security check: Validate URL parameters before processing
        const urlParams = new URLSearchParams(window.location.search);
        const urlValidation = securityManager.validateUrl(window.location.href);
        if (!urlValidation.valid) {
            console.warn("URL validation failed:", urlValidation.error);
            // Continue but log the violation
        }
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
        let settingsStore = null;
        try {
            settingsStore = SettingsStore.getInstance();
        }
        catch (error) {
            console.warn('SettingsStore not available:', error);
        }
        engine = new GameEngine(canvas, 'snes'); // Default platform, will be overridden by boot config
        audioManager = new AudioManager();
        // Initialize VFS and LibraryManager
        const vfs = new VFS({
            builtInPath: '/assets/',
            cacheEnabled: true,
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            cacheExpiryHours: 24
        });
        // Initialize library manager
        const libraryManager = new LibraryManager(vfs);
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
            thumbnailHeight: 120,
            engineVersion: '1.0.0'
        });
        // Initialize cheat manager
        const cheatManager = new CheatManager();
        // Initialize boot context
        const bootContext = {
            engine,
            audioManager,
            settingsStore: settingsStore,
            libraryManager,
            saveSystem,
            cheatManager,
            securityManager
        };
        // Expose core components globally for dev controls
        window.ptsCore = {
            audioManager,
            settingsStore,
            engine,
            securityManager
        };
        // Add debug function to check UI elements
        window.debugUI = () => {
            console.log('=== UI Debug Info ===');
            console.log('Pi button:', document.getElementById('piMenuButton'));
            console.log('Pi menu overlay:', document.getElementById('piMenuOverlay'));
            console.log('Platform selector:', document.getElementById('platformSelectorOverlay'));
            console.log('Canvas:', canvas);
        };
        // Add security debug function
        window.debugSecurity = () => {
            console.log('=== Security Debug Info ===');
            const stats = securityManager.getSecurityStats();
            console.log('Security violations:', stats.violations);
            console.log('Rate limit stats:', stats.rateLimitStats);
            console.log('Security enabled:', stats.isEnabled);
        };
        // Initialize UI components
        piMenu = new PiMenu(engine.getPauseManager(), saveManager, settingsStore || undefined);
        platformSelector = new PlatformSelector();
        // Set up platform selector callbacks
        platformSelector.setPlatformChangeCallback(async (platformKey) => {
            // Security check: Rate limit platform switches
            const rateLimitCheck = securityManager.checkRateLimit('packSwitch', 'user');
            if (!rateLimitCheck.allowed) {
                showErrorMessage(`Too many platform switches. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`);
                return;
            }
            try {
                await engine?.setPlatform(platformKey);
                console.log(`Switched to platform: ${platformKey}`);
            }
            catch (error) {
                console.error('Failed to switch platform:', error);
                showErrorMessage('Failed to switch platform. Please try again.');
            }
        });
        platformSelector.setPauseManager(engine.getPauseManager());
        platformSelector.setPiMenu(piMenu);
        // Initialize save system
        if (saveSystem && saveManager && engine) {
            // Note: These methods may not exist on SaveSystem, but we'll try to set them up
            // The actual integration should be handled by the SaveSystem itself
        }
        // Set up library manager
        if (libraryManager) {
            piMenu.setLibraryManager(libraryManager);
        }
        // Set up save system
        piMenu.setSaveSystem(saveSystem);
        // Set up dev tools if in development mode
        if (cheatManager && engine) {
            piMenu.setDevTools(cheatManager, engine.getFreeCamera(), engine.getDebugOverlay(), engine);
        }
        // Boot the game with security context
        try {
            await bootGame(bootContext);
            console.log('Game booted successfully with security measures');
        }
        catch (error) {
            console.error('Failed to boot game:', error);
            showErrorMessage('Failed to start the game. Please refresh the page.');
        }
        // Set up page unload cleanup
        window.addEventListener('beforeunload', () => {
            try {
                // Security cleanup
                securityManager.clearViolations();
                // Component cleanup
                if (piMenu)
                    piMenu.cleanup();
                if (platformSelector)
                    platformSelector.cleanup();
                if (engine)
                    engine.stop();
                if (audioManager)
                    audioManager.cleanup();
                // Remove global error handlers
                window.removeEventListener("unhandledrejection", handleUnhandledRejection);
                window.removeEventListener("error", handleGlobalError);
                console.log('Application cleanup completed');
            }
            catch (error) {
                console.error('Error during cleanup:', error);
            }
        });
        // Security monitoring: Log suspicious activity
        setInterval(() => {
            const stats = securityManager.getSecurityStats();
            if (stats.violations.length > 0) {
                const recentViolations = stats.violations.filter(v => Date.now() - v.timestamp < 60000 // Last minute
                );
                if (recentViolations.length > 10) {
                    console.warn('High number of security violations detected:', recentViolations.length);
                }
            }
        }, 60000); // Check every minute
    }
    catch (error) {
        console.error("Critical error during initialization:", error);
        showErrorMessage(`Failed to initialize the game: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Log security violation for critical errors
        securityManager.logViolation('injection', 'Critical initialization error', 'main', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Export security manager for use in other modules
export { securityManager };
//# sourceMappingURL=main.js.map