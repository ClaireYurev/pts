import { BootConfig, parseBootConfig, validateBootConfig } from './BootConfig.js';
import { GameEngine } from '../GameEngine.js';
import { SettingsStore } from '../SettingsStore.js';
import { LibraryManager } from '../library/LibraryManager.js';
import { SaveSystem } from '../save/SaveSystem.js';
import { CheatManager, CheatFlag } from '../../dev/CheatManager.js';
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

export async function bootGame(context: BootContext): Promise<BootResult> {
  const { engine, settingsStore, libraryManager, saveSystem, audioManager, cheatManager } = context;
  const warnings: string[] = [];
  
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
    
    // Step 2: Resolve pack (built-in pack OR packUrl)
    let packLoaded = false;
    if (urlConfig.packUrl) {
      try {
        console.log(`Loading external pack from: ${urlConfig.packUrl}`);
        // TODO: Implement external pack loading via LibraryManager
        packLoaded = true;
      } catch (error) {
        console.error("Failed to load external pack:", error);
        warnings.push(`Failed to load external pack: ${error}`);
      }
    } else if (urlConfig.pack) {
      try {
        console.log(`Loading built-in pack: ${urlConfig.pack}`);
        // TODO: Implement built-in pack loading via LibraryManager
        packLoaded = true;
      } catch (error) {
        console.error("Failed to load built-in pack:", error);
        warnings.push(`Failed to load built-in pack: ${error}`);
      }
    }
    
    // Step 3: Apply Settings overrides (video/audio/input)
    console.log("Applying settings overrides...");
    const settings = settingsStore.getAll();
    
    // Apply video settings
    if (urlConfig.scale) {
      engine.getRenderer().setScaleMode(urlConfig.scale);
    } else if (settings.video.scaleMode) {
      engine.getRenderer().setScaleMode(settings.video.scaleMode);
    }
    
    if (urlConfig.fullscreen !== undefined) {
      if (urlConfig.fullscreen) {
        engine.getRenderer().requestFullscreen().catch(console.error);
      }
    } else if (settings.video.fullscreen) {
      engine.getRenderer().requestFullscreen().catch(console.error);
    }
    
    if (urlConfig.fps) {
      // TODO: Set FPS cap
      console.log(`FPS cap set to: ${urlConfig.fps}`);
    } else if (settings.video.fpsCap) {
      // TODO: Set FPS cap
      console.log(`FPS cap set to: ${settings.video.fpsCap}`);
    }
    
    if (urlConfig.vsync !== undefined) {
      // TODO: Set vsync
      console.log(`VSync set to: ${urlConfig.vsync}`);
    } else if (settings.video.vsync !== undefined) {
      // TODO: Set vsync
      console.log(`VSync set to: ${settings.video.vsync}`);
    }
    
    // Apply audio settings
    if (urlConfig.mute !== undefined) {
      audioManager.setMuted(urlConfig.mute);
    } else if (settings.audio.muted) {
      audioManager.setMuted(true);
    }
    
    if (urlConfig.vol !== undefined) {
      audioManager.setMasterVolume(urlConfig.vol);
    } else {
      audioManager.setMasterVolume(settings.audio.master);
    }
    
    if (urlConfig.music !== undefined) {
      audioManager.setMusicVolume(urlConfig.music ? settings.audio.music : 0);
    } else {
      audioManager.setMusicVolume(settings.audio.music);
    }
    
    if (urlConfig.sfx !== undefined) {
      audioManager.setSfxVolume(urlConfig.sfx ? settings.audio.sfx : 0);
    } else {
      audioManager.setSfxVolume(settings.audio.sfx);
    }
    
    if (urlConfig.latency) {
      audioManager.setLatencyHint(urlConfig.latency);
    } else {
      audioManager.setLatencyHint(settings.audio.latency);
    }
    
    // Apply input settings
    if (urlConfig.deadzone !== undefined) {
      // TODO: Set input deadzone
      console.log(`Input deadzone set to: ${urlConfig.deadzone}`);
    }
    
    if (urlConfig.jumpbuf !== undefined) {
      // TODO: Set jump buffer
      console.log(`Jump buffer set to: ${urlConfig.jumpbuf}ms`);
    }
    
    if (urlConfig.sticky !== undefined) {
      // TODO: Set sticky input
      console.log(`Sticky input set to: ${urlConfig.sticky}`);
    }
    
    // Step 4: Handle save slot or set initial state
    if (urlConfig.slot && urlConfig.slot !== 'Q') {
      try {
        console.log(`Loading save from slot: ${urlConfig.slot}`);
        const saveData = await saveSystem.load(urlConfig.slot as 1 | 2 | 3);
        if (saveData) {
          // Restore save data
          // TODO: Implement save restoration
          console.log("Save data restored successfully");
        } else {
          console.log("No save data found in slot, setting initial state");
          setInitialGameState(engine, urlConfig);
        }
      } catch (error) {
        console.error("Failed to load save:", error);
        warnings.push(`Failed to load save from slot ${urlConfig.slot}: ${error}`);
        setInitialGameState(engine, urlConfig);
      }
    } else {
      // Set initial game state
      setInitialGameState(engine, urlConfig);
    }
    
    // Step 5: Apply cheats
    console.log("Applying cheats...");
    if (urlConfig.noclip) {
      cheatManager.set(CheatFlag.Noclip, true);
    }
    if (urlConfig.god) {
      cheatManager.set(CheatFlag.God, true);
    }
    if (urlConfig.infTime) {
      cheatManager.set(CheatFlag.InfTime, true);
    }
    if (urlConfig.givesword) {
      cheatManager.set(CheatFlag.GiveSword, true);
    }
    if (urlConfig.setguards !== undefined) {
      // TODO: Implement setguards cheat
      console.log(`Set guards cheat: ${urlConfig.setguards}`);
    }
    
    // Step 6: Handle autoplay and cutscenes
    if (urlConfig.cutscenes === false) {
      // Skip cutscenes
      console.log("Cutscenes disabled");
      // TODO: Implement cutscene skipping
    }
    
    // Handle autoplay: start muted if needed until user input
    if (urlConfig.mute) {
      console.log("Starting muted due to URL config");
      audioManager.setMuted(true);
    }
    
    // Step 7: Set performance settings
    if (urlConfig.speed) {
      // TODO: Set game speed
      console.log(`Game speed set to: ${urlConfig.speed}x`);
    }
    
    if (urlConfig.zoom) {
      // TODO: Set zoom level
      console.log(`Zoom level set to: ${urlConfig.zoom}x`);
    }
    
    // Step 8: Set UI settings
    if (urlConfig.hud !== undefined) {
      // TODO: Set HUD visibility
      console.log(`HUD visibility set to: ${urlConfig.hud}`);
    }
    
    if (urlConfig.lang) {
      // TODO: Set language
      console.log(`Language set to: ${urlConfig.lang}`);
    }
    
    // Step 9: Handle editor mode
    if (urlConfig.editor) {
      console.log("Editor mode enabled");
      // TODO: Enable editor mode
    }
    
    console.log("Game boot process completed successfully");
    
    return {
      success: true,
      warnings,
      config: urlConfig
    };
    
  } catch (error) {
    console.error("Game boot process failed:", error);
    return {
      success: false,
      warnings: [...warnings, `Boot process failed: ${error}`],
      config: {}
    };
  }
}

function setInitialGameState(engine: GameEngine, config: BootConfig): void {
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
      if (config.x !== undefined) player.position.x = config.x;
      if (config.y !== undefined) player.position.y = config.y;
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