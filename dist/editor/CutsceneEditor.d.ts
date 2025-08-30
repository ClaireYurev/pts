export interface CutsceneItem {
    id: string;
    time: number;
    track: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
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
export interface Cutscene {
    id: string;
    name: string;
    duration: number;
    tracks: CutsceneTrack[];
    metadata: Record<string, any>;
}
export interface TrackDefinition {
    type: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
    name: string;
    color: string;
    actions: ActionDefinition[];
}
export interface ActionDefinition {
    name: string;
    description: string;
    properties: PropertyField[];
}
export interface PropertyField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'position' | 'color';
    label: string;
    defaultValue: any;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}
export declare class CutsceneEditor {
    private canvas;
    private ctx;
    private cutscene;
    private selectedItem;
    private draggingItem;
    private resizingItem;
    private hoveredItem;
    private trackDefinitions;
    private isDragging;
    private lastMouseX;
    private lastMouseY;
    private panX;
    private panY;
    private zoom;
    private timelineWidth;
    private trackHeight;
    private headerHeight;
    private rulerHeight;
    private trackHeaderWidth;
    constructor(canvas: HTMLCanvasElement);
    private initializeTrackDefinitions;
    private addTrackDefinition;
    getTrackDefinition(type: string): TrackDefinition | undefined;
    getAllTrackDefinitions(): TrackDefinition[];
    private setupEventListeners;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleWheel;
    private handleDoubleClick;
    private getItemAt;
    private createItemAt;
    private openItemProperties;
    loadCutscene(cutscene: Cutscene): void;
    createCutscene(name: string, duration?: number): Cutscene;
    addTrack(type: string): CutsceneTrack | null;
    removeTrack(trackId: string): void;
    addItem(trackId: string, time: number, action: string): CutsceneItem | null;
    removeItem(itemId: string): void;
    getCutscene(): Cutscene | null;
    exportCutscene(): string;
    importCutscene(json: string): void;
    private render;
    private drawTimeline;
    private drawTracks;
    private drawItems;
    private drawItem;
}
//# sourceMappingURL=CutsceneEditor.d.ts.map