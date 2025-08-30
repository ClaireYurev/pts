export type BootConfig = {
  // Game Pack & Level
  pack?: string; 
  packUrl?: string;
  level?: number; 
  room?: number; 
  x?: number; 
  y?: number;
  
  // Player State
  health?: number; 
  maxhealth?: number; 
  sword?: boolean;
  
  // Game Settings
  time?: number; 
  seed?: number; 
  difficulty?: 'normal'|'hard'|'custom';
  
  // Cheats
  noclip?: boolean; 
  god?: boolean; 
  infTime?: boolean; 
  reveal?: boolean; 
  givesword?: boolean; 
  setguards?: number;
  
  // Performance
  speed?: number; 
  fps?: number; 
  vsync?: boolean;
  
  // Display
  scale?: 'integer'|'fit'|'stretch'; 
  zoom?: number; 
  fullscreen?: boolean;
  
  // Audio
  mute?: boolean; 
  music?: boolean; 
  sfx?: boolean; 
  vol?: number; 
  latency?: 'auto'|'low'|'compat';
  
  // Input
  keys?: string; 
  deadzone?: number; 
  jumpbuf?: number; 
  sticky?: boolean;
  
  // UI & Accessibility
  hud?: boolean; 
  cutscenes?: boolean; 
  lang?: string; 
  slot?: 1|2|3|'Q';
  
  // Development
  editor?: boolean;
};

export function parseBootConfig(): {config: BootConfig; warnings: string[]} {
  const params = new URLSearchParams(window.location.search);
  const config: BootConfig = {};
  const warnings: string[] = [];
  
  // Helper functions
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
  
  const safeParseBool = (value: string | null): boolean | undefined => {
    if (!value) return undefined;
    return value === '1' || value === 'true';
  };
  
  const sanitizeString = (value: string | null, maxLength: number = 100): string | undefined => {
    if (!value) return undefined;
    const sanitized = value.replace(/[<>\"'&]/g, '').substring(0, maxLength);
    return sanitized.length > 0 ? sanitized : undefined;
  };
  
  // Game Pack & Level
  if (params.has("pack")) {
    const pack = sanitizeString(params.get("pack"), 50);
    if (pack) config.pack = pack;
  }
  
  if (params.has("packUrl")) {
    const packUrl = sanitizeString(params.get("packUrl"), 500);
    if (packUrl && isValidUrl(packUrl)) {
      config.packUrl = packUrl;
    } else {
      warnings.push("Invalid packUrl parameter");
    }
  }
  
  if (params.has("level")) {
    const level = safeParseInt(params.get("level"), 1, 999);
    if (level !== undefined) config.level = level;
    else warnings.push("Invalid level parameter");
  }
  
  if (params.has("room")) {
    const room = safeParseInt(params.get("room"), 1, 999);
    if (room !== undefined) config.room = room;
    else warnings.push("Invalid room parameter");
  }
  
  if (params.has("x")) {
    const x = safeParseFloat(params.get("x"), -10000, 10000);
    if (x !== undefined) config.x = x;
    else warnings.push("Invalid x parameter");
  }
  
  if (params.has("y")) {
    const y = safeParseFloat(params.get("y"), -10000, 10000);
    if (y !== undefined) config.y = y;
    else warnings.push("Invalid y parameter");
  }
  
  // Player State
  if (params.has("health")) {
    const health = safeParseInt(params.get("health"), 0, 9999);
    if (health !== undefined) config.health = health;
    else warnings.push("Invalid health parameter");
  }
  
  if (params.has("maxhealth")) {
    const maxhealth = safeParseInt(params.get("maxhealth"), 1, 9999);
    if (maxhealth !== undefined) config.maxhealth = maxhealth;
    else warnings.push("Invalid maxhealth parameter");
  }
  
  if (params.has("sword")) {
    config.sword = safeParseBool(params.get("sword"));
  }
  
  // Game Settings
  if (params.has("time")) {
    const time = safeParseInt(params.get("time"), 0, 999999);
    if (time !== undefined) config.time = time;
    else warnings.push("Invalid time parameter");
  }
  
  if (params.has("seed")) {
    const seed = safeParseInt(params.get("seed"), 0, 999999);
    if (seed !== undefined) config.seed = seed;
    else warnings.push("Invalid seed parameter");
  }
  
  if (params.has("difficulty")) {
    const difficulty = sanitizeString(params.get("difficulty"), 20);
    if (difficulty && ['normal', 'hard', 'custom'].includes(difficulty)) {
      config.difficulty = difficulty as 'normal'|'hard'|'custom';
    } else {
      warnings.push("Invalid difficulty parameter");
    }
  }
  
  // Cheats
  if (params.has("noclip")) config.noclip = safeParseBool(params.get("noclip"));
  if (params.has("god")) config.god = safeParseBool(params.get("god"));
  if (params.has("infTime")) config.infTime = safeParseBool(params.get("infTime"));
  if (params.has("reveal")) config.reveal = safeParseBool(params.get("reveal"));
  if (params.has("givesword")) config.givesword = safeParseBool(params.get("givesword"));
  
  if (params.has("setguards")) {
    const setguards = safeParseInt(params.get("setguards"), 0, 100);
    if (setguards !== undefined) config.setguards = setguards;
    else warnings.push("Invalid setguards parameter");
  }
  
  // Performance
  if (params.has("speed")) {
    const speed = safeParseFloat(params.get("speed"), 0.1, 10.0);
    if (speed !== undefined) config.speed = speed;
    else warnings.push("Invalid speed parameter");
  }
  
  if (params.has("fps")) {
    const fps = safeParseInt(params.get("fps"), 30, 240);
    if (fps !== undefined) config.fps = fps;
    else warnings.push("Invalid fps parameter");
  }
  
  if (params.has("vsync")) config.vsync = safeParseBool(params.get("vsync"));
  
  // Display
  if (params.has("scale")) {
    const scale = sanitizeString(params.get("scale"), 20);
    if (scale && ['integer', 'fit', 'stretch'].includes(scale)) {
      config.scale = scale as 'integer'|'fit'|'stretch';
    } else {
      warnings.push("Invalid scale parameter");
    }
  }
  
  if (params.has("zoom")) {
    const zoom = safeParseFloat(params.get("zoom"), 0.1, 10.0);
    if (zoom !== undefined) config.zoom = zoom;
    else warnings.push("Invalid zoom parameter");
  }
  
  if (params.has("fullscreen")) config.fullscreen = safeParseBool(params.get("fullscreen"));
  
  // Audio
  if (params.has("mute")) config.mute = safeParseBool(params.get("mute"));
  if (params.has("music")) config.music = safeParseBool(params.get("music"));
  if (params.has("sfx")) config.sfx = safeParseBool(params.get("sfx"));
  
  if (params.has("vol")) {
    const vol = safeParseFloat(params.get("vol"), 0.0, 1.0);
    if (vol !== undefined) config.vol = vol;
    else warnings.push("Invalid vol parameter");
  }
  
  if (params.has("latency")) {
    const latency = sanitizeString(params.get("latency"), 20);
    if (latency && ['auto', 'low', 'compat'].includes(latency)) {
      config.latency = latency as 'auto'|'low'|'compat';
    } else {
      warnings.push("Invalid latency parameter");
    }
  }
  
  // Input
  if (params.has("keys")) {
    const keys = sanitizeString(params.get("keys"), 200);
    if (keys) config.keys = keys;
  }
  
  if (params.has("deadzone")) {
    const deadzone = safeParseFloat(params.get("deadzone"), 0.0, 1.0);
    if (deadzone !== undefined) config.deadzone = deadzone;
    else warnings.push("Invalid deadzone parameter");
  }
  
  if (params.has("jumpbuf")) {
    const jumpbuf = safeParseInt(params.get("jumpbuf"), 0, 200);
    if (jumpbuf !== undefined) config.jumpbuf = jumpbuf;
    else warnings.push("Invalid jumpbuf parameter");
  }
  
  if (params.has("sticky")) config.sticky = safeParseBool(params.get("sticky"));
  
  // UI & Accessibility
  if (params.has("hud")) config.hud = safeParseBool(params.get("hud"));
  if (params.has("cutscenes")) config.cutscenes = safeParseBool(params.get("cutscenes"));
  
  if (params.has("lang")) {
    const lang = sanitizeString(params.get("lang"), 10);
    if (lang) config.lang = lang;
  }
  
  if (params.has("slot")) {
    const slot = sanitizeString(params.get("slot"), 10);
    if (slot && ['1', '2', '3', 'Q'].includes(slot)) {
      config.slot = slot === 'Q' ? 'Q' : parseInt(slot) as 1|2|3;
    } else {
      warnings.push("Invalid slot parameter");
    }
  }
  
  // Development
  if (params.has("editor")) config.editor = safeParseBool(params.get("editor"));
  
  return { config, warnings };
}

export function validateBootConfig(cfg: BootConfig): string[] {
  const warnings: string[] = [];
  
  // Validate level
  if (cfg.level !== undefined && (cfg.level < 1 || cfg.level > 999)) {
    warnings.push("Level must be between 1 and 999");
  }
  
  // Validate room
  if (cfg.room !== undefined && (cfg.room < 1 || cfg.room > 999)) {
    warnings.push("Room must be between 1 and 999");
  }
  
  // Validate health
  if (cfg.health !== undefined && (cfg.health < 0 || cfg.health > 9999)) {
    warnings.push("Health must be between 0 and 9999");
  }
  
  // Validate maxhealth
  if (cfg.maxhealth !== undefined && (cfg.maxhealth < 1 || cfg.maxhealth > 9999)) {
    warnings.push("Max health must be between 1 and 9999");
  }
  
  // Validate time
  if (cfg.time !== undefined && (cfg.time < 0 || cfg.time > 999999)) {
    warnings.push("Time must be between 0 and 999999");
  }
  
  // Validate seed
  if (cfg.seed !== undefined && (cfg.seed < 0 || cfg.seed > 999999)) {
    warnings.push("Seed must be between 0 and 999999");
  }
  
  // Validate setguards
  if (cfg.setguards !== undefined && (cfg.setguards < 0 || cfg.setguards > 100)) {
    warnings.push("Setguards must be between 0 and 100");
  }
  
  // Validate speed
  if (cfg.speed !== undefined && (cfg.speed < 0.1 || cfg.speed > 10.0)) {
    warnings.push("Speed must be between 0.1 and 10.0");
  }
  
  // Validate fps
  if (cfg.fps !== undefined && (cfg.fps < 30 || cfg.fps > 240)) {
    warnings.push("FPS must be between 30 and 240");
  }
  
  // Validate zoom
  if (cfg.zoom !== undefined && (cfg.zoom < 0.1 || cfg.zoom > 10.0)) {
    warnings.push("Zoom must be between 0.1 and 10.0");
  }
  
  // Validate volume
  if (cfg.vol !== undefined && (cfg.vol < 0.0 || cfg.vol > 1.0)) {
    warnings.push("Volume must be between 0.0 and 1.0");
  }
  
  // Validate deadzone
  if (cfg.deadzone !== undefined && (cfg.deadzone < 0.0 || cfg.deadzone > 1.0)) {
    warnings.push("Deadzone must be between 0.0 and 1.0");
  }
  
  // Validate jumpbuf
  if (cfg.jumpbuf !== undefined && (cfg.jumpbuf < 0 || cfg.jumpbuf > 200)) {
    warnings.push("Jump buffer must be between 0 and 200");
  }
  
  // Validate coordinates
  if (cfg.x !== undefined && (cfg.x < -10000 || cfg.x > 10000)) {
    warnings.push("X coordinate must be between -10000 and 10000");
  }
  
  if (cfg.y !== undefined && (cfg.y < -10000 || cfg.y > 10000)) {
    warnings.push("Y coordinate must be between -10000 and 10000");
  }
  
  return warnings;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 