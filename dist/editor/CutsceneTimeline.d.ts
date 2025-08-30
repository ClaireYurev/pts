export interface CutsceneEvent {
    id: string;
    time: number;
    action: string;
    parameters: Record<string, any>;
    description?: string;
}
export interface CutsceneAction {
    name: string;
    description: string;
    parameters: string[];
    defaultValues: Record<string, any>;
}
export declare class CutsceneTimeline {
    private events;
    private container;
    private nextId;
    private duration;
    private isPlaying;
    private currentTime;
    private playbackInterval?;
    private actions;
    constructor(container: HTMLElement);
    private render;
    private createTimelineRuler;
    private createTimelineTrack;
    private renderEvent;
    private setupEventListeners;
    addEvent(): void;
    deleteEvent(eventId: string): void;
    editEvent(event: CutsceneEvent): void;
    private createParameterInputs;
    play(): void;
    pause(): void;
    stop(): void;
    seekTo(time: number): void;
    private updateTimeDisplay;
    private checkEvents;
    private executeEvent;
    private formatTime;
    private sortEvents;
    getEvents(): CutsceneEvent[];
    exportTimeline(): CutsceneEvent[];
    loadTimeline(events: CutsceneEvent[]): void;
    setDuration(duration: number): void;
    getDuration(): number;
    clearAllEvents(): void;
    getEventCount(): number;
    duplicateEvent(eventId: string): void;
    addAction(action: CutsceneAction): void;
    getActions(): CutsceneAction[];
}
//# sourceMappingURL=CutsceneTimeline.d.ts.map