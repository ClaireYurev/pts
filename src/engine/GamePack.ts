import { ECAScript } from '../runtime/scripting/ECA';
import { CutsceneData } from '../runtime/cutscene/CutscenePlayer';

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

export interface AssetData {
    type: 'image' | 'audio' | 'json';
    data: string;
    format?: string;
}

export interface GamePack {
    id?: string;
    name: string;
    version?: string;
    description?: string;
    author?: string;
    assets: Record<string, AssetData>;
    levels: Record<string, LevelConfig>;
    scripts: Record<string, ECAScript>;
    cutscenes: Record<string, CutsceneData>;
    tileSize?: number;
    defaultGravity?: number;
    metadata?: {
        created?: string;
        engine?: string;
        schema?: string;
    };
} 