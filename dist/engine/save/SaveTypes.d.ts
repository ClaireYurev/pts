/**
 * Save system types and interfaces
 */
export interface Vector2 {
    x: number;
    y: number;
}
export interface PlayerState {
    position: Vector2;
    velocity: Vector2;
    health: number;
    maxHealth: number;
    hasSword: boolean;
    isOnGround: boolean;
    facingDirection: 'left' | 'right';
    animationState: string;
    invulnerable: boolean;
    invulnerabilityTimer: number;
    x?: number;
    y?: number;
    inventory?: Record<string, number>;
}
export interface Enemy {
    id: string;
    type: string;
    position: Vector2;
    health: number;
    state: string;
    data?: any;
}
export interface GameFlags {
    [key: string]: boolean | number | string;
}
export interface SaveGameV1 {
    version: '1.0';
    slot: number;
    timestamp: number;
    level: number;
    room: number;
    player: PlayerState;
    timer: number;
    flags: GameFlags;
    rngSeed: number;
    enemies: Enemy[];
    thumbnail: string;
    packId: string;
    packVersion: string;
}
export interface SaveSlot {
    slot: number;
    saveData: SaveGameV1 | null;
    isEmpty: boolean;
    timestamp: number;
    level: number;
    thumbnail: string;
}
export interface SaveMetadata {
    slot: number;
    timestamp: number;
    level: number;
    room: number;
    playerHealth: number;
    playerMaxHealth: number;
    hasSword: boolean;
    packId: string;
    packVersion: string;
}
export interface SaveResult {
    success: boolean;
    slot: number;
    error?: string;
    metadata?: SaveMetadata;
}
export interface LoadResult {
    success: boolean;
    saveData?: SaveGameV1;
    error?: string;
}
export interface SaveSystemStats {
    totalSlots: number;
    usedSlots: number;
    totalSize: number;
    lastSaveTime: number;
}
export interface SaveSystemConfig {
    packId: string;
    canvas: HTMLCanvasElement;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    engineVersion?: string;
}
//# sourceMappingURL=SaveTypes.d.ts.map