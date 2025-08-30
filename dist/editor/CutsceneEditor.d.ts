import { CutsceneTrack, CutsceneItem } from '../runtime/cutscene/CutscenePlayer';
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
export interface TrackTemplate {
    type: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
    name: string;
    color: string;
    defaultItems: CutsceneItem[];
}
export declare class CutsceneEditor {
    private canvas;
    private ctx;
    private cutscene;
    private selectedItem;
    private draggingItem;
    private selectedTrack;
    private timelineScale;
    private scrollX;
    private scrollY;
    private trackHeight;
    private headerHeight;
    private timeRulerHeight;
    private isPlaying;
    private currentTime;
    private playStartTime;
    constructor(canvas: HTMLCanvasElement, cutscene?: CutsceneData);
    private createEmptyCutscene;
    private setupEventListeners;
    private resize;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private onWheel;
    private getItemAt;
    private getTrackAt;
    private showContextMenu;
    private addTrack;
    render(): void;
    private drawTimeRuler;
    private drawTracks;
    private drawPlayhead;
    play(): void;
    pause(): void;
    stop(): void;
    private updatePlayhead;
    addItem(trackId: string, item: CutsceneItem): void;
    removeItem(trackId: string, itemId: string): void;
    removeTrack(trackId: string): void;
    getCutscene(): CutsceneData;
    setCutscene(cutscene: CutsceneData): void;
    setDuration(duration: number): void;
}
//# sourceMappingURL=CutsceneEditor.d.ts.map