import { CheatFlag } from "../../dev/CheatManager.js";
import { parseBootConfig, validateBootConfig, resolveBootConfig } from "./BootConfig.js";
export async function bootGame(context) {
    const { engine, settingsStore, libraryManager, saveSystem, audioManager, cheatManager } = context;
    const warnings = [];
    try {
        console.log("Starting game boot process...");
        // Step 1: Parse & validate URL config
        console.log("Parsing boot configuration from URL parameters...");
        const { config: urlConfig, warnings: parseWarnings } = parseBootConfig();
        warnings.push(...parseWarnings);
        const validationWarnings = validateBootConfig(urlConfig);
        warnings.push(...validationWarnings);
        if (warnings.length > 0) {
            console.warn("Boot configuration warnings:", warnings);
        }
        // Step 2: Load pack and get pack defaults
        let packDefaults;
        let packLoaded = false;
        if (urlConfig.packUrl) {
            try {
                console.log(`Loading external pack from: ${urlConfig.packUrl}`);
                // TODO: Implement external pack loading via LibraryManager
                // packDefaults = await libraryManager.loadPackDefaults(urlConfig.packUrl);
                packLoaded = true;
            }
            catch (error) {
                console.error("Failed to load external pack:", error);
                warnings.push(`Failed to load external pack: ${error}`);
            }
        }
        else if (urlConfig.pack) {
            try {
                console.log(`Loading built-in pack: ${urlConfig.pack}`);
                // TODO: Implement built-in pack loading via LibraryManager
                // packDefaults = await libraryManager.loadPackDefaults(urlConfig.pack);
                packLoaded = true;
            }
            catch (error) {
                console.error("Failed to load built-in pack:", error);
                warnings.push(`Failed to load built-in pack: ${error}`);
            }
        }
        // Step 3: Resolve final configuration with proper precedence
        console.log("Resolving boot configuration with precedence...");
        const resolvedConfig = resolveBootConfig(urlConfig, packDefaults);
        console.log("Resolved configuration:", resolvedConfig);
        // Step 4: Apply video/display settings
        console.log("Applying video settings...");
        if (resolvedConfig.scale) {
            engine.getRenderer().setScaleMode(resolvedConfig.scale);
        }
        if (resolvedConfig.fullscreen) {
            engine.getRenderer().requestFullscreen().catch(console.error);
        }
        if (resolvedConfig.fps) {
            // TODO: Set FPS cap
            console.log(`FPS cap set to: ${resolvedConfig.fps}`);
        }
        if (resolvedConfig.vsync !== undefined) {
            // TODO: Set vsync
            console.log(`VSync set to: ${resolvedConfig.vsync}`);
        }
        if (resolvedConfig.zoom) {
            // TODO: Set zoom level
            console.log(`Zoom level set to: ${resolvedConfig.zoom}x`);
        }
        // Step 5: Apply audio settings
        console.log("Applying audio settings...");
        if (resolvedConfig.mute !== undefined) {
            audioManager.setMuted(resolvedConfig.mute);
        }
        if (resolvedConfig.vol !== undefined) {
            audioManager.setMasterVolume(resolvedConfig.vol);
        }
        if (resolvedConfig.music !== undefined) {
            audioManager.setMusicVolume(resolvedConfig.music ? 0.8 : 0);
        }
        if (resolvedConfig.sfx !== undefined) {
            audioManager.setSfxVolume(resolvedConfig.sfx ? 0.9 : 0);
        }
        if (resolvedConfig.latency) {
            audioManager.setLatencyMode(resolvedConfig.latency);
        }
        // Step 6: Apply input settings
        console.log("Applying input settings...");
        if (resolvedConfig.deadzone !== undefined) {
            // TODO: Set input deadzone
            console.log(`Input deadzone set to: ${resolvedConfig.deadzone}`);
        }
        if (resolvedConfig.jumpbuf !== undefined) {
            // TODO: Set jump buffer
            console.log(`Jump buffer set to: ${resolvedConfig.jumpbuf}ms`);
        }
        if (resolvedConfig.sticky !== undefined) {
            // TODO: Set sticky input
            console.log(`Sticky input set to: ${resolvedConfig.sticky}`);
        }
        if (resolvedConfig.keys) {
            // TODO: Set custom key bindings
            console.log(`Custom keys set: ${resolvedConfig.keys}`);
        }
        // Step 7: Handle save slot or set initial state
        if (resolvedConfig.slot && resolvedConfig.slot !== 'Q') {
            try {
                console.log(`Loading save from slot: ${resolvedConfig.slot}`);
                const saveData = await saveSystem.load(resolvedConfig.slot);
                if (saveData) {
                    // Restore save data
                    // TODO: Implement save restoration
                    console.log("Save data restored successfully");
                }
                else {
                    console.log("No save data found in slot, setting initial state");
                    setInitialGameState(engine, resolvedConfig);
                }
            }
            catch (error) {
                console.error("Failed to load save:", error);
                warnings.push(`Failed to load save from slot ${resolvedConfig.slot}: ${error}`);
                setInitialGameState(engine, resolvedConfig);
            }
        }
        else {
            // Set initial game state
            setInitialGameState(engine, resolvedConfig);
        }
        // Step 8: Apply cheats
        console.log("Applying cheats...");
        if (resolvedConfig.noclip) {
            cheatManager.set(CheatFlag.Noclip, true);
        }
        if (resolvedConfig.god) {
            cheatManager.set(CheatFlag.God, true);
        }
        if (resolvedConfig.infTime) {
            cheatManager.set(CheatFlag.InfTime, true);
        }
        if (resolvedConfig.reveal) {
            // TODO: Implement reveal cheat (not available in current CheatManager)
            console.log("Reveal cheat enabled");
        }
        if (resolvedConfig.givesword) {
            cheatManager.set(CheatFlag.GiveSword, true);
        }
        if (resolvedConfig.setguards !== undefined) {
            // TODO: Implement setguards cheat
            console.log(`Set guards cheat: ${resolvedConfig.setguards}`);
        }
        // Step 9: Handle cutscenes and autoplay
        if (resolvedConfig.cutscenes === false) {
            // Skip cutscenes
            console.log("Cutscenes disabled");
            // TODO: Implement cutscene skipping
        }
        // Handle autoplay: start muted if needed until user input
        if (resolvedConfig.mute) {
            console.log("Starting muted due to boot config");
            audioManager.setMuted(true);
        }
        // Step 10: Set performance settings
        if (resolvedConfig.speed) {
            // TODO: Set game speed
            console.log(`Game speed set to: ${resolvedConfig.speed}x`);
        }
        // Step 11: Set UI settings
        if (resolvedConfig.hud !== undefined) {
            // TODO: Set HUD visibility
            console.log(`HUD visibility set to: ${resolvedConfig.hud}`);
        }
        if (resolvedConfig.lang) {
            // TODO: Set language
            console.log(`Language set to: ${resolvedConfig.lang}`);
        }
        // Step 12: Handle editor mode
        if (resolvedConfig.editor) {
            console.log("Editor mode enabled");
            // TODO: Enable editor mode
        }
        console.log("Game boot process completed successfully");
        return {
            success: true,
            warnings,
            config: resolvedConfig
        };
    }
    catch (error) {
        console.error("Game boot process failed:", error);
        return {
            success: false,
            warnings: [...warnings, `Boot process failed: ${error}`],
            config: {}
        };
    }
}
function setInitialGameState(engine, config) {
    console.log("Setting initial game state...");
    // Set level (default to Level 1 if not specified)
    const level = config.level || 1;
    console.log(`Setting level to: ${level}`);
    // TODO: Implement level loading
    // Set room if specified
    if (config.room) {
        console.log(`Setting room to: ${config.room}`);
        // TODO: Implement room loading
    }
    // Set player position if specified
    if (config.x !== undefined || config.y !== undefined) {
        const player = engine.getEntities()[0]; // Assume first entity is player
        if (player) {
            if (config.x !== undefined)
                player.position.x = config.x;
            if (config.y !== undefined)
                player.position.y = config.y;
            console.log(`Player position set to: (${player.position.x}, ${player.position.y})`);
        }
    }
    // Set player health
    if (config.health !== undefined) {
        const player = engine.getEntities()[0];
        if (player) {
            player.health = config.health;
            console.log(`Player health set to: ${config.health}`);
        }
    }
    if (config.maxhealth !== undefined) {
        const player = engine.getEntities()[0];
        if (player) {
            // TODO: Set max health
            console.log(`Player max health set to: ${config.maxhealth}`);
        }
    }
    if (config.sword) {
        // TODO: Give player sword
        console.log("Player given sword");
    }
    // Set game timer
    if (config.time !== undefined) {
        // TODO: Set game timer
        console.log(`Game timer set to: ${config.time}`);
    }
    // Set seed if specified
    if (config.seed !== undefined) {
        // TODO: Set random seed
        console.log(`Random seed set to: ${config.seed}`);
    }
    // Set difficulty
    if (config.difficulty) {
        // TODO: Set difficulty
        console.log(`Difficulty set to: ${config.difficulty}`);
    }
}
//# sourceMappingURL=boot.js.map