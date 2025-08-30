export class GameLoop {
    constructor(update, render) {
        this.update = update;
        this.render = render;
        this.lastTime = 0;
        this.reqId = 0;
        this.running = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
    }
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        const frame = (time) => {
            if (!this.running)
                return;
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
            const clampedDt = Math.min(dt, 1 / 30);
            this.update(clampedDt);
            this.render();
            this.reqId = window.requestAnimationFrame(frame);
        };
        this.reqId = window.requestAnimationFrame(frame);
    }
    stop() {
        this.running = false;
        if (this.reqId) {
            cancelAnimationFrame(this.reqId);
        }
    }
    getFPS() {
        return this.fps;
    }
    isRunning() {
        return this.running;
    }
}
//# sourceMappingURL=GameLoop.js.map