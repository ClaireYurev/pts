import { Cutscene, CutsceneItem } from '../../editor/CutsceneEditor.js';
export interface CutsceneContext {
    engine: any;
    currentTime: number;
    variables: Record<string, any>;
}
export interface CutsceneAction {
    name: string;
    execute: (context: CutsceneContext, item: CutsceneItem) => Promise<void>;
}
export declare class CutscenePlayer {
    private cutscenes;
    private activeCutscene;
    private actionHandlers;
    private engine;
    private isPlaying;
    constructor(engine: any);
    private initializeActionHandlers;
    registerAction(action: CutsceneAction): void;
    loadCutscene(cutscene: Cutscene): void;
    loadCutscenes(cutscenes: Cutscene[]): void;
    playCutscene(cutsceneId: string): Promise<void>;
    stopCutscene(): Promise<void>;
    pauseCutscene(): void;
    resumeCutscene(): void;
    skipCutscene(): void;
    private executeCutscene;
    private executeItem;
    private wait;
    private waitForInput;
    isPlayingCutscene(): boolean;
    getCurrentCutscene(): Cutscene | null;
    getCutsceneProgress(): number;
    getCutscene(cutsceneId: string): Cutscene | undefined;
    getAllCutscenes(): Cutscene[];
    removeCutscene(cutsceneId: string): boolean;
    clearCutscenes(): void;
    exportCutscene(cutsceneId: string): string;
    importCutscene(json: string): void;
}
//# sourceMappingURL=CutscenePlayer.d.ts.map