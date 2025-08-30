export declare class GameLoop {
    private update;
    private render;
    private lastTime;
    private reqId;
    private running;
    private fps;
    private frameCount;
    private lastFpsUpdate;
    constructor(update: (dt: number) => void, render: () => void);
    start(): void;
    stop(): void;
    getFPS(): number;
    isRunning(): boolean;
}
//# sourceMappingURL=GameLoop.d.ts.map