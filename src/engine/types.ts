/**
 * Shared types for core engine components
 */

// Core game types
export interface Vector2 {
    x: number;
    y: number;
}

export interface AnimationController {
    update(dt: number): void;
    play(animationName: string): void;
    stop(): void;
    isPlaying(): boolean;
}

export interface Entity {
    id: string;
    position: Vector2;
    velocity: Vector2;
    size: Vector2;
    isStatic: boolean;
    health?: number;
    maxHealth?: number;
    animationController?: AnimationController;
    sprite?: HTMLImageElement;
    visible?: boolean;
    priority?: number;
    layer?: number;
}

export interface RenderableEntity {
    id: string;
    position: Vector2;
    size: Vector2;
    sprite?: HTMLImageElement;
    visible?: boolean;
    priority?: number;
    layer?: number;
}

// Input types
export interface InputState {
    [key: string]: boolean;
}

export interface MouseState {
    x: number;
    y: number;
    down: boolean;
}

export interface GamepadButton {
    pressed: boolean;
    value: number;
    touched: boolean;
}

export interface GamepadAxis {
    value: number;
    deadzone: number;
}

export interface GamepadData {
    id: string;
    index: number;
    connected: boolean;
    buttons: GamepadButton[];
    axes: GamepadAxis[];
    timestamp: number;
    browser: string;
    quirks: GamepadQuirks;
}

export interface GamepadQuirks {
    needsDeadzoneAdjustment: boolean;
    hasStickDrift: boolean;
    buttonMapping: Record<string, number>;
    axisMapping: Record<string, number>;
    browserSpecific: Record<string, any>;
}

// Save system types
export interface SaveData {
    level: number;
    playerX: number;
    playerY: number;
    health: number;
    inventory: string[];
    timestamp: number;
    version?: string;
    checksum?: string;
}

export interface SaveSystemStats {
    totalSaves: number;
    totalSize: number;
    lastSaveTime: number;
    corruptedSaves: number;
}

// Platform types
export interface PlatformConfig {
    name: string;
    resolution: {
        width: number;
        height: number;
    };
    aspectRatio: number;
    colorPalette: string[];
    borderColor: string;
    scaleMode: 'integer' | 'fit' | 'stretch';
}

// Renderer types
export interface Viewport {
    x: number;
    y: number;
    width: number;
    height: number;
    margin: number;
}

export interface RenderStats {
    totalEntities: number;
    culledEntities: number;
    renderedEntities: number;
    batches: number;
    frameTime: number;
    cullingEfficiency: number;
    batchEfficiency: number;
    memoryUsage: number;
}

// Game loop types
export interface PerformanceStats {
    fps: number;
    frameTime: number;
    averageFrameTime: number;
    useFixedTimestep: boolean;
    fixedTimestep: number;
    throttleUpdates: boolean;
    updateThrottle: number;
    trapEnabled: boolean;
    trapTimerCount: number;
    adaptiveTimestep: boolean;
    spiralOfDeathProtection: boolean;
}

export interface TrapTimer {
    id: string;
    interval: number;
    accumulator: number;
    callback: () => void;
    active: boolean;
}

// Security types
export interface SecurityConfig {
    maxFileSize: number;
    maxUrlLength: number;
    maxInputLength: number;
    allowedFileTypes: string[];
    allowedDomains: string[];
    rateLimits: Record<string, RateLimitConfig>;
}

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    blockDurationMs: number;
}

export interface SecurityViolation {
    type: string;
    message: string;
    source: string;
    timestamp: number;
    details: Record<string, any>;
}

export interface SecurityStats {
    violations: SecurityViolation[];
    rateLimitStats: Record<string, any>;
    isEnabled: boolean;
}

// Audio types
export interface AudioConfig {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
}

export interface AudioTrack {
    id: string;
    src: string;
    volume: number;
    loop: boolean;
    playing: boolean;
}

// Settings types
export interface GameSettings {
    audio: AudioConfig;
    graphics: {
        scaleMode: 'integer' | 'fit' | 'stretch';
        safeArea: number;
        fps: number;
    };
    controls: {
        deadzone: number;
        sensitivity: number;
    };
    accessibility: {
        highContrast: boolean;
        largeText: boolean;
        reducedMotion: boolean;
    };
}

// Editor types
export interface EntityData {
    id: string;
    type: string;
    position: Vector2;
    size: Vector2;
    properties: Record<string, any>;
}

export interface Trigger {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    params: Record<string, any>;
}

export interface TriggerType {
    name: string;
    label: string;
    paramTypes: Record<string, 'number' | 'boolean' | 'string' | 'select'>;
    paramOptions?: Record<string, string[]>;
}

// Boot configuration types
export interface BootConfig {
    level?: number;
    room?: number;
    playerX?: number;
    playerY?: number;
    health?: number;
    maxhealth?: number;
    lives?: number;
    score?: number;
    time?: number;
    seed?: number;
    setguards?: number;
    speed?: number;
    fps?: number;
    zoom?: number;
    vol?: number;
    deadzone?: number;
    difficulty?: string;
    musicVolume?: number;
    sfxVolume?: number;
    platform?: string;
    cheats?: string[];
}

// Game pack types
export interface GamePack {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    platform: string;
    assets: Record<string, string>;
    levels: LevelData[];
    scripts: ScriptData[];
    cutscenes: CutsceneData[];
}

export interface LevelData {
    id: string;
    name: string;
    entities: EntityData[];
    triggers: Trigger[];
    background: string;
    music: string;
}

export interface ScriptData {
    id: string;
    name: string;
    nodes: ScriptNode[];
    edges: ScriptEdge[];
}

export interface ScriptNode {
    id: string;
    type: 'Event' | 'Condition' | 'Action';
    kind: string;
    x: number;
    y: number;
    params: Record<string, any>;
}

export interface ScriptEdge {
    id: string;
    from: string;
    to: string;
}

export interface CutsceneData {
    id: string;
    name: string;
    frames: CutsceneFrame[];
    duration: number;
}

export interface CutsceneFrame {
    timestamp: number;
    entities: EntityData[];
    camera: Vector2;
    effects: Record<string, any>;
}

// ECA (Event-Condition-Action) types
export interface ECAContext {
    entity: Entity;
    deltaTime: number;
    variables: Record<string, any>;
}

export interface ECAHandler {
    execute(node: ScriptNode, context: ECAContext): Promise<boolean>;
}

// Service Worker types
export interface ServiceWorkerConfig {
    enabled: boolean;
    cacheBuiltIns: boolean;
    cacheInstalledPacks: boolean;
    cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    maxCacheSize: number;
    cacheExpiration: number;
}

// Utility types
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 