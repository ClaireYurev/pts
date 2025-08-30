export interface EntityData {
    type: string;
    x: number;
    y: number;
    [prop: string]: any;
}

export interface LevelConfig {
    id: number;
    name: string;
    tileMap: number[][];
    entities: EntityData[];
    background?: string;
    music?: string;
}

export interface GamePack {
    name: string;
    version?: string;
    assets: string[];
    levels: LevelConfig[];
    tileSize?: number;
    defaultGravity?: number;
} 