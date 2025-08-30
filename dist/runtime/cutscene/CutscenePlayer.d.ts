import { GameEngine } from '../../engine/GameEngine';
import { Entity } from '../../engine/Entity';
export interface CutsceneItem {
    id: string;
    time: number;
    track: string;
    action: string;
    args: Record<string, any>;
    duration?: number;
}
export interface CutsceneTrack {
    id: string;
    name: string;
    type: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
    color: string;
    items: CutsceneItem[];
}
export interface CutsceneData {
    id: string;
    name: string;
    duration: number;
    tracks: CutsceneTrack[];
    metadata: {
        created: string;
        editor: string;
        description?: string;
    };
}
export interface CutsceneContext {
    engine: GameEngine;
    camera: {
        x: number;
        y: number;
        zoom: number;
    };
    entities: Map<string, Entity>;
    variables: Record<string, any>;
}
export interface CutsceneActionHandler {
    execute: (item: CutsceneItem, context: CutsceneContext) => void | Promise<void>;
    validate?: (item: CutsceneItem) => string | null;
}
export declare class CutscenePlayer {
    private actionHandlers;
    private isPlaying;
    private startTime;
    private currentTime;
    private executedItems;
    private context;
    private cutscene;
    private onComplete?;
    private onUpdate?;
    constructor(cutscene: CutsceneData, engine: GameEngine, onComplete?: () => void, onUpdate?: (time: number) => void);
    private registerDefaultHandlers;
    private easeInOutQuad;
    registerHandler(trackType: string, action: string, handler: CutsceneActionHandler): void;
    play(): void;
    pause(): void;
    stop(): void;
    seek(time: number): void;
    private update;
    private executeItem;
    private complete;
    private cleanup;
    getCurrentTime(): number;
    getDuration(): number;
    isPlayingState(): boolean;
    getContext(): CutsceneContext;
}
//# sourceMappingURL=CutscenePlayer.d.ts.map