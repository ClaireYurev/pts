import { GameEngine } from "./GameEngine.js";
import { CheatFlag } from "../dev/CheatManager.js";
import { PlatformManager } from "./PlatformConfig.js";

export interface BootConfig {
  // Game Pack & Level
  packUrl?: string;
  level?: number;
  
  // Player State
  playerX?: number;
  playerY?: number;
  health?: number;
  lives?: number;
  score?: number;
  
  // Game Settings
  time?: number;
  difficulty?: string;
  skipCutscene?: boolean;
  
  // Audio Settings
  musicVolume?: number;
  sfxVolume?: number;
  mute?: boolean;
  
  // Display Settings
  resolution?: { width: number; height: number };
  fullscreen?: boolean;
  platform?: string;
  
  // Input Settings
  inputMethod?: string;
  
  // Accessibility
  subtitles?: boolean;
  highContrast?: boolean;
  lang?: string;
  
  // Debug & Development
  debug?: boolean;
  cheats?: string[];
  
  // Custom parameters
  [key: string]: any;
}

export class BootConfigManager {
  private static readonly KNOWN_CHEATS = Object.values(CheatFlag);
  private static readonly DIFFICULTY_LEVELS = ['easy', 'normal', 'hard', 'extreme'];
  private static readonly INPUT_METHODS = ['keyboard', 'gamepad', 'touch'];
  private static readonly SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'zh'];
  
  /**
   * Parse URL parameters into a BootConfig object with validation and sanitization
   */
  static parse(): BootConfig {
    const params = new URLSearchParams(window.location.search);
    const cfg: BootConfig = {};
    
    // Helper function to safely parse and validate numeric parameters
    const safeParseInt = (value: string | null, min: number = -Infinity, max: number = Infinity): number | undefined => {
      if (!value) return undefined;
      const parsed = parseInt(value);
      return !isNaN(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
    };
    
    const safeParseFloat = (value: string | null, min: number = -Infinity, max: number = Infinity): number | undefined => {
      if (!value) return undefined;
      const parsed = parseFloat(value);
      return !isNaN(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
    };
    
    // Helper function to sanitize string parameters
    const sanitizeString = (value: string | null, maxLength: number = 100): string | undefined => {
      if (!value) return undefined;
      // Remove any potentially dangerous characters and limit length
      const sanitized = value.replace(/[<>\"'&]/g, '').substring(0, maxLength);
      return sanitized.length > 0 ? sanitized : undefined;
    };
    
    // Game Pack & Level
    if (params.has("pack")) {
      const packUrl = sanitizeString(params.get("pack"), 500);
      if (packUrl && this.isValidUrl(packUrl)) {
        cfg.packUrl = packUrl;
      }
    }
    if (params.has("level")) cfg.level = safeParseInt(params.get("level"), 1, 999);
    
    // Player State
    if (params.has("playerX")) cfg.playerX = safeParseFloat(params.get("playerX"), -10000, 10000);
    if (params.has("playerY")) cfg.playerY = safeParseFloat(params.get("playerY"), -10000, 10000);
    if (params.has("health")) cfg.health = safeParseInt(params.get("health"), 0, 9999);
    if (params.has("lives")) cfg.lives = safeParseInt(params.get("lives"), 0, 99);
    if (params.has("score")) cfg.score = safeParseInt(params.get("score"), 0, 999999);
    
    // Game Settings
    if (params.has("time")) cfg.time = safeParseInt(params.get("time"), 0, 999999);
    if (params.has("difficulty")) {
      const difficulty = sanitizeString(params.get("difficulty"), 20);
      if (difficulty && this.DIFFICULTY_LEVELS.includes(difficulty)) {
        cfg.difficulty = difficulty;
      }
    }
    if (params.has("skipCutscene")) cfg.skipCutscene = params.get("skipCutscene") === "1";
    
    // Audio Settings
    if (params.has("musicVolume")) cfg.musicVolume = safeParseFloat(params.get("musicVolume"), 0, 1);
    if (params.has("sfxVolume")) cfg.sfxVolume = safeParseFloat(params.get("sfxVolume"), 0, 1);
    if (params.has("mute")) cfg.mute = params.get("mute") === "true";
    
    // Display Settings
    if (params.has("resolution")) {
      const res = sanitizeString(params.get("resolution"), 20);
      if (res && res.includes("x")) {
        const [w, h] = res.split("x").map(n => parseInt(n));
        if (!isNaN(w) && !isNaN(h) && w >= 160 && h >= 144 && w <= 4096 && h <= 4096) {
          cfg.resolution = { width: w, height: h };
        }
      }
    }
    if (params.has("fullscreen")) cfg.fullscreen = params.get("fullscreen") === "true";
    if (params.has("platform")) {
      const platform = sanitizeString(params.get("platform"), 50);
      if (platform && PlatformManager.getPlatform(platform)) {
        cfg.platform = platform;
      }
    }
    
    // Input Settings
    if (params.has("inputMethod")) {
      const inputMethod = sanitizeString(params.get("inputMethod"), 20);
      if (inputMethod && this.INPUT_METHODS.includes(inputMethod)) {
        cfg.inputMethod = inputMethod;
      }
    }
    
    // Accessibility
    if (params.has("subtitles")) cfg.subtitles = params.get("subtitles") === "true";
    if (params.has("highContrast")) cfg.highContrast = params.get("highContrast") === "true";
    if (params.has("lang")) {
      const lang = sanitizeString(params.get("lang"), 10);
      if (lang && this.SUPPORTED_LANGUAGES.includes(lang)) {
        cfg.lang = lang;
      }
    }
    
    // Debug & Development
    if (params.has("debug")) cfg.debug = params.get("debug") === "true";
    if (params.has("cheats")) {
      const cheatsParam = sanitizeString(params.get("cheats"), 200);
      if (cheatsParam) {
        cfg.cheats = cheatsParam.split(",")
          .map(c => c.trim())
          .filter(c => c.length > 0 && c.length <= 50)
          .filter(cheat => this.KNOWN_CHEATS.includes(cheat as CheatFlag));
      }
    }
    
    // Handle preset configurations
    if (params.has("preset")) {
      const preset = sanitizeString(params.get("preset"), 50);
      if (preset) {
        const presetConfig = this.getPresetConfig(preset);
        if (presetConfig) {
          Object.assign(cfg, presetConfig);
        }
      }
    }
    
    return cfg;
  }
  
  /**
   * Validate the boot configuration
   */
  static validate(cfg: BootConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate level
    if (cfg.level !== undefined && (isNaN(cfg.level) || cfg.level < 1)) {
      errors.push("Invalid level parameter: must be a positive integer");
    }
    
    // Validate player position
    if (cfg.playerX !== undefined && isNaN(cfg.playerX)) {
      errors.push("Invalid playerX parameter: must be a number");
    }
    if (cfg.playerY !== undefined && isNaN(cfg.playerY)) {
      errors.push("Invalid playerY parameter: must be a number");
    }
    
    // Validate health and lives
    if (cfg.health !== undefined && (isNaN(cfg.health) || cfg.health < 0 || cfg.health > 9999)) {
      errors.push("Invalid health parameter: must be between 0 and 9999");
    }
    if (cfg.lives !== undefined && (isNaN(cfg.lives) || cfg.lives < 0 || cfg.lives > 99)) {
      errors.push("Invalid lives parameter: must be between 0 and 99");
    }
    
    // Validate score
    if (cfg.score !== undefined && (isNaN(cfg.score) || cfg.score < 0)) {
      errors.push("Invalid score parameter: must be a non-negative number");
    }
    
    // Validate time
    if (cfg.time !== undefined && (isNaN(cfg.time) || cfg.time < 0)) {
      errors.push("Invalid time parameter: must be a non-negative number");
    }
    
    // Validate difficulty
    if (cfg.difficulty && !this.DIFFICULTY_LEVELS.includes(cfg.difficulty)) {
      errors.push(`Invalid difficulty parameter: must be one of ${this.DIFFICULTY_LEVELS.join(", ")}`);
    }
    
    // Validate audio volumes
    if (cfg.musicVolume !== undefined && (isNaN(cfg.musicVolume) || cfg.musicVolume < 0 || cfg.musicVolume > 1)) {
      errors.push("Invalid musicVolume parameter: must be between 0 and 1");
    }
    if (cfg.sfxVolume !== undefined && (isNaN(cfg.sfxVolume) || cfg.sfxVolume < 0 || cfg.sfxVolume > 1)) {
      errors.push("Invalid sfxVolume parameter: must be between 0 and 1");
    }
    
    // Validate resolution
    if (cfg.resolution) {
      if (isNaN(cfg.resolution.width) || isNaN(cfg.resolution.height) || 
          cfg.resolution.width < 160 || cfg.resolution.height < 144) {
        errors.push("Invalid resolution parameter: minimum 160x144");
      }
    }
    
    // Validate platform
    if (cfg.platform && !PlatformManager.getPlatform(cfg.platform)) {
      errors.push(`Invalid platform parameter: ${cfg.platform} is not supported`);
    }
    
    // Validate input method
    if (cfg.inputMethod && !this.INPUT_METHODS.includes(cfg.inputMethod)) {
      errors.push(`Invalid inputMethod parameter: must be one of ${this.INPUT_METHODS.join(", ")}`);
    }
    
    // Validate language
    if (cfg.lang && !this.SUPPORTED_LANGUAGES.includes(cfg.lang)) {
      errors.push(`Invalid lang parameter: must be one of ${this.SUPPORTED_LANGUAGES.join(", ")}`);
    }
    
    // Validate cheats
    if (cfg.cheats) {
      const invalidCheats = cfg.cheats.filter(cheat => !this.KNOWN_CHEATS.includes(cheat as CheatFlag));
      if (invalidCheats.length > 0) {
        errors.push(`Invalid cheats: ${invalidCheats.join(", ")}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Apply the boot configuration to the game engine
   */
  static apply(cfg: BootConfig, engine: GameEngine): void {
    try {
      // Apply platform first (affects rendering)
      if (cfg.platform) {
        engine.setPlatform(cfg.platform);
      }
      
      // Apply display settings
      if (cfg.resolution) {
        engine.canvas.width = cfg.resolution.width;
        engine.canvas.height = cfg.resolution.height;
        // Trigger canvas resize event to update scaling
        engine.canvas.dispatchEvent(new Event('resize'));
      }
      
      if (cfg.fullscreen) {
        engine.canvas.requestFullscreen().catch(err => {
          console.warn("Failed to enter fullscreen:", err);
        });
      }
      
      // Apply audio settings (if audio manager exists)
      if (cfg.musicVolume !== undefined) {
        // engine.audioManager?.setMusicVolume(cfg.musicVolume);
        console.log("Music volume set to:", cfg.musicVolume);
      }
      if (cfg.sfxVolume !== undefined) {
        // engine.audioManager?.setSfxVolume(cfg.sfxVolume);
        console.log("SFX volume set to:", cfg.sfxVolume);
      }
      if (cfg.mute) {
        // engine.audioManager?.setMute(true);
        console.log("Audio muted");
      }
      
      // Apply player state
      const player = engine.getEntities()[0]; // Assume first entity is player
      if (player) {
        if (cfg.playerX !== undefined) player.position.x = cfg.playerX;
        if (cfg.playerY !== undefined) player.position.y = cfg.playerY;
        if (cfg.health !== undefined) player.health = Math.max(0, Math.min(9999, cfg.health));
        if (cfg.lives !== undefined) {
          // player.lives = Math.max(0, Math.min(99, cfg.lives));
          console.log("Lives set to:", cfg.lives);
        }
      }
      
      // Apply game state
      if (cfg.score !== undefined) {
        // engine.score = cfg.score;
        console.log("Score set to:", cfg.score);
      }
      if (cfg.time !== undefined) {
        // engine.timer = cfg.time;
        console.log("Time set to:", cfg.time);
      }
      if (cfg.difficulty) {
        // engine.setDifficulty(cfg.difficulty);
        console.log("Difficulty set to:", cfg.difficulty);
      }
      
      // Apply accessibility settings
      if (cfg.highContrast !== undefined) {
        document.body.classList.toggle("high-contrast", cfg.highContrast);
      }
      if (cfg.subtitles !== undefined) {
        // engine.settings.subtitles = cfg.subtitles;
        console.log("Subtitles:", cfg.subtitles);
      }
      if (cfg.lang) {
        // engine.setLanguage(cfg.lang);
        console.log("Language set to:", cfg.lang);
      }
      
      // Apply debug settings
      if (cfg.debug) {
        engine.getDebugOverlay().setEnabled(true);
        console.log("Debug mode enabled");
      }
      
      // Apply cheats
      if (cfg.cheats && cfg.cheats.length > 0) {
        cfg.cheats.forEach(cheatFlag => {
          if (this.KNOWN_CHEATS.includes(cheatFlag as CheatFlag)) {
            engine.getCheatManager().set(cheatFlag as CheatFlag, true);
            console.log(`Cheat enabled: ${cheatFlag}`);
          }
        });
      }
      
      // Apply input method
      if (cfg.inputMethod) {
        // engine.getInput().setMode(cfg.inputMethod);
        console.log("Input method set to:", cfg.inputMethod);
      }
      
      console.log("Boot configuration applied successfully");
      
    } catch (error) {
      console.error("Error applying boot configuration:", error);
    }
  }
  
  /**
   * Generate a shareable URL with current game state
   */
  static generateShareUrl(engine: GameEngine): string {
    const params = new URLSearchParams();
    
    // Add current game state
    const player = engine.getEntities()[0];
    if (player) {
      params.set("playerX", Math.floor(player.position.x).toString());
      params.set("playerY", Math.floor(player.position.y).toString());
      params.set("health", player.health.toString());
    }
    
    // Add current level (if available)
    // if (engine.currentLevel) {
    //   params.set("level", engine.currentLevel.toString());
    // }
    
    // Add active cheats
    const activeCheats = engine.getCheatManager().getActiveFlags();
    if (activeCheats.length > 0) {
      params.set("cheats", activeCheats.join(","));
    }
    
    // Add debug state
    if (engine.getDebugOverlay().isEnabled()) {
      params.set("debug", "true");
    }
    
    // Add platform
    const currentPlatform = engine.getCurrentPlatform();
    if (currentPlatform) {
      params.set("platform", currentPlatform.name.toLowerCase().replace(/\s+/g, "-"));
    }
    
    // Add display settings
    if (document.fullscreenElement) {
      params.set("fullscreen", "true");
    }
    
    // Add accessibility settings
    if (document.body.classList.contains("high-contrast")) {
      params.set("highContrast", "true");
    }
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }
  
  /**
   * Copy the current game state URL to clipboard
   */
  static async copyShareUrl(engine: GameEngine): Promise<boolean> {
    try {
      const shareUrl = this.generateShareUrl(engine);
      await navigator.clipboard.writeText(shareUrl);
      console.log("Share URL copied to clipboard:", shareUrl);
      return true;
    } catch (error) {
      console.error("Failed to copy share URL:", error);
      return false;
    }
  }
  
  /**
   * Get preset configuration by name
   */
  private static getPresetConfig(presetName: string): BootConfig | null {
    const presets: Record<string, BootConfig> = {
      "easy": {
        difficulty: "easy",
        health: 100,
        lives: 5,
        cheats: [CheatFlag.God]
      },
      "hard": {
        difficulty: "hard",
        health: 50,
        lives: 1,
        debug: true
      },
      "speedrun": {
        difficulty: "hard",
        skipCutscene: true,
        debug: true,
        cheats: [CheatFlag.Noclip]
      },
      "debug": {
        debug: true,
        cheats: [CheatFlag.God, CheatFlag.Noclip, CheatFlag.InfTime],
        highContrast: true
      },
      "accessibility": {
        highContrast: true,
        subtitles: true,
        musicVolume: 0.3,
        sfxVolume: 0.8
      }
    };
    
    return presets[presetName.toLowerCase()] || null;
  }
  
  /**
   * Get all available preset names
   */
  static getAvailablePresets(): string[] {
    return ["easy", "hard", "speedrun", "debug", "accessibility"];
  }
  
  /**
   * Clear all URL parameters (useful for resetting to defaults)
   */
  static clearUrlParams(): void {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());
  }
  
  /**
   * Validate if a string is a valid URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
} 