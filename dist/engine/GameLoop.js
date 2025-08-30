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
        // Fixed timestep and throttling
        this.fixedTimestep = 1 / 60; // 60 FPS fixed timestep
        this.accumulator = 0;
        this.maxFrameTime = 1 / 30; // Cap at 30 FPS minimum
        this.useFixedTimestep = false;
        this.throttleUpdates = false;
        this.updateThrottle = 1 / 30; // Update at most 30 times per second
        this.lastUpdateTime = 0;
        // Cross-browser optimizations
        this.isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
        this.isFirefox = navigator.userAgent.includes('Firefox');
        this.isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
        this.isEdge = navigator.userAgent.includes('Edge');
        this.detectBrowserOptimizations();
    }
    detectBrowserOptimizations() {
        // Browser-specific optimizations
        if (this.isChrome) {
            // Chrome has good performance with requestAnimationFrame
            this.maxFrameTime = 1 / 60;
        }
        else if (this.isFirefox) {
            // Firefox can benefit from slightly lower frame rates
            this.maxFrameTime = 1 / 30;
        }
        else if (this.isSafari) {
            // Safari on mobile can be slower
            this.maxFrameTime = 1 / 30;
        }
        else if (this.isEdge) {
            // Edge (Chromium) similar to Chrome
            this.maxFrameTime = 1 / 60;
        }
        console.log(`GameLoop: Browser detected - Chrome: ${this.isChrome}, Firefox: ${this.isFirefox}, Safari: ${this.isSafari}, Edge: ${this.isEdge}`);
    }
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        this.lastUpdateTime = this.lastTime;
        this.accumulator = 0;
        const frame = (time) => {
            if (!this.running)
                return;
            // Handle first frame
            if (this.lastTime === 0) {
                this.lastTime = time;
                this.lastFpsUpdate = time;
                this.lastUpdateTime = time;
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
            // Cap delta time to prevent spiral of death
            const clampedDt = Math.min(dt, this.maxFrameTime);
            // Update FPS counter
            this.frameCount++;
            if (time - this.lastFpsUpdate >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsUpdate = time;
            }
            if (this.useFixedTimestep) {
                // Fixed timestep for deterministic updates
                this.accumulator += clampedDt;
                while (this.accumulator >= this.fixedTimestep) {
                    this.update(this.fixedTimestep);
                    this.accumulator -= this.fixedTimestep;
                }
            }
            else {
                // Variable timestep with throttling
                if (this.throttleUpdates) {
                    if (time - this.lastUpdateTime >= this.updateThrottle) {
                        this.update(clampedDt);
                        this.lastUpdateTime = time;
                    }
                }
                else {
                    this.update(clampedDt);
                }
            }
            // Always render
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
    // Fixed timestep controls
    setFixedTimestep(enabled) {
        this.useFixedTimestep = enabled;
        if (enabled) {
            this.accumulator = 0;
        }
    }
    setFixedTimestepRate(rate) {
        this.fixedTimestep = Math.max(1 / 120, Math.min(1 / 30, rate)); // Between 30-120 FPS
    }
    isFixedTimestepEnabled() {
        return this.useFixedTimestep;
    }
    // Throttling controls
    setUpdateThrottling(enabled) {
        this.throttleUpdates = enabled;
    }
    setUpdateThrottleRate(rate) {
        this.updateThrottle = Math.max(1 / 60, Math.min(1 / 10, rate)); // Between 10-60 updates per second
    }
    isUpdateThrottlingEnabled() {
        return this.throttleUpdates;
    }
    // Performance monitoring
    getPerformanceStats() {
        return {
            fps: this.fps,
            fixedTimestep: this.useFixedTimestep,
            throttling: this.throttleUpdates,
            accumulator: this.accumulator,
            browser: this.isChrome ? 'Chrome' :
                this.isFirefox ? 'Firefox' :
                    this.isSafari ? 'Safari' :
                        this.isEdge ? 'Edge' : 'Unknown'
        };
    }
    // Cross-browser compatibility
    getOptimalSettings() {
        if (this.isChrome || this.isEdge) {
            return {
                fixedTimestep: true,
                throttleUpdates: false,
                maxFrameTime: 1 / 60
            };
        }
        else if (this.isFirefox) {
            return {
                fixedTimestep: true,
                throttleUpdates: false,
                maxFrameTime: 1 / 30
            };
        }
        else if (this.isSafari) {
            return {
                fixedTimestep: false,
                throttleUpdates: true,
                maxFrameTime: 1 / 30
            };
        }
        else {
            return {
                fixedTimestep: false,
                throttleUpdates: true,
                maxFrameTime: 1 / 30
            };
        }
    }
    applyOptimalSettings() {
        const settings = this.getOptimalSettings();
        this.setFixedTimestep(settings.fixedTimestep);
        this.setUpdateThrottling(settings.throttleUpdates);
        this.maxFrameTime = settings.maxFrameTime;
        const browserName = this.isChrome ? 'Chrome' :
            this.isFirefox ? 'Firefox' :
                this.isSafari ? 'Safari' :
                    this.isEdge ? 'Edge' : 'Unknown';
        console.log(`GameLoop: Applied optimal settings for ${browserName}`);
    }
}
//# sourceMappingURL=GameLoop.js.map