/**
 * Save system types and interfaces
 */
export interface SaveGameV1 {
    engineVersion: string;
    packId: string;
    timestamp: number;
    playtimeSec: number;
    rngSeed: number;
    levelIndex: number;
    player: {
        x: number;
        y: number;
        state: string;
        facing: 'L' | 'R';
        health: number;
        maxHealth: number;
        hasSword: boolean;
        inventory: Record<string, number>;
    };
    world: {
        timerSecRemaining: number;
        flags: Record<string, boolean>;
        looseTilesGone: string[];
        enemies: Array<{
            id: string;
            alive: boolean;
        }>;
    };
    scripting: {
        variables: Record<string, number | string | boolean>;
        completedEvents: string[];
    };
    thumbnail?: string;
}
export type SaveSlot = 1 | 2 | 3;
export interface SaveMetadata {
    slot: SaveSlot;
    timestamp: number;
    levelIndex: number;
    playtimeSec: number;
    hasThumbnail: boolean;
}
export interface SaveSystemConfig {
    packId: string;
    canvas: HTMLCanvasElement;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    engineVersion?: string;
}
//# sourceMappingURL=SaveTypes.d.ts.map