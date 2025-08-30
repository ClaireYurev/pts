export class GameLoop {
    private lastTime = 0;
    private reqId = 0;
    private running = false;
    private fps = 0;
    private frameCount = 0;
    private lastFpsUpdate = 0;

    constructor(
        private update: (dt: number) => void,
        private render: () => void
    ) {}

    public start(): void {
        this.running = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        
        const frame = (time: number) => {
            if (!this.running) return;
            
            // Handle first frame
            if (this.lastTime === 0) {
                this.lastTime = time;
                this.lastFpsUpdate = time;
                this.reqId = window.requestAnimationFrame(frame);
                return;
            }
            
            const dt = (time - this.lastTime) / 1000;
            this.lastTime = time;
            
            // Validate delta time
            if (dt < 0 || dt > 1) {
                console.warn(`Invalid delta time detected: ${dt}s, clamping to 1/30s`);
                this.reqId = window.requestAnimationFrame(frame);
                return;
            }
            
            // Update FPS counter
            this.frameCount++;
            if (time - this.lastFpsUpdate >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsUpdate = time;
            }
            
            // Cap delta time to prevent spiral of death
            const clampedDt = Math.min(dt, 1/30);
            
            this.update(clampedDt);
            this.render();
            
            this.reqId = window.requestAnimationFrame(frame);
        };
        
        this.reqId = window.requestAnimationFrame(frame);
    }

    public stop(): void {
        this.running = false;
        if (this.reqId) {
            cancelAnimationFrame(this.reqId);
        }
    }

    public getFPS(): number {
        return this.fps;
    }

    public isRunning(): boolean {
        return this.running;
    }
} 