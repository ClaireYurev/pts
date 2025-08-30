export declare class GameLoop {
    private update;
    private render;
    private lastTime;
    private reqId;
    private running;
    private fps;
    private frameCount;
    private lastFpsUpdate;
    private fixedTimestep;
    private accumulator;
    private maxFrameTime;
    private useFixedTimestep;
    private throttleUpdates;
    private updateThrottle;
    private lastUpdateTime;
    private isChrome;
    private isFirefox;
    private isSafari;
    private isEdge;
    constructor(update: (dt: number) => void, render: () => void);
    private detectBrowserOptimizations;
    start(): void;
    stop(): void;
    getFPS(): number;
    isRunning(): boolean;
    setFixedTimestep(enabled: boolean): void;
    setFixedTimestepRate(rate: number): void;
    isFixedTimestepEnabled(): boolean;
    setUpdateThrottling(enabled: boolean): void;
    setUpdateThrottleRate(rate: number): void;
    isUpdateThrottlingEnabled(): boolean;
    getPerformanceStats(): {
        fps: number;
        fixedTimestep: boolean;
        throttling: boolean;
        accumulator: number;
        browser: string;
    };
    getOptimalSettings(): {
        fixedTimestep: boolean;
        throttleUpdates: boolean;
        maxFrameTime: number;
    };
    applyOptimalSettings(): void;
}
//# sourceMappingURL=GameLoop.d.ts.map