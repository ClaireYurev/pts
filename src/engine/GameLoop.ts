export class GameLoop {
    private lastTime = 0;
    private reqId = 0;
    private running = false;
    private fps = 0;
    private frameCount = 0;
    private lastFpsUpdate = 0;

    // Fixed timestep and throttling
    private fixedTimestep = 1/60; // 60 FPS fixed timestep
    private accumulator = 0;
    private maxFrameTime = 1/30; // Cap at 30 FPS minimum
    private useFixedTimestep = false;
    private throttleUpdates = false;
    private updateThrottle = 1/30; // Update at most 30 times per second
    private lastUpdateTime = 0;

    // Cross-browser optimizations
    private isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
    private isFirefox = navigator.userAgent.includes('Firefox');
    private isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    private isEdge = navigator.userAgent.includes('Edge');

    constructor(
        private update: (dt: number) => void,
        private render: () => void
    ) {
        this.detectBrowserOptimizations();
    }

    private detectBrowserOptimizations(): void {
        // Browser-specific optimizations
        if (this.isChrome) {
            // Chrome has good performance with requestAnimationFrame
            this.maxFrameTime = 1/60;
        } else if (this.isFirefox) {
            // Firefox can benefit from slightly lower frame rates
            this.maxFrameTime = 1/30;
        } else if (this.isSafari) {
            // Safari on mobile can be slower
            this.maxFrameTime = 1/30;
        } else if (this.isEdge) {
            // Edge (Chromium) similar to Chrome
            this.maxFrameTime = 1/60;
        }

        console.log(`GameLoop: Browser detected - Chrome: ${this.isChrome}, Firefox: ${this.isFirefox}, Safari: ${this.isSafari}, Edge: ${this.isEdge}`);
    }

    public start(): void {
        this.running = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        this.lastUpdateTime = this.lastTime;
        this.accumulator = 0;
        
        const frame = (time: number) => {
            if (!this.running) return;
            
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
            } else {
                // Variable timestep with throttling
                if (this.throttleUpdates) {
                    if (time - this.lastUpdateTime >= this.updateThrottle) {
                        this.update(clampedDt);
                        this.lastUpdateTime = time;
                    }
                } else {
                    this.update(clampedDt);
                }
            }
            
            // Always render
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

    // Fixed timestep controls
    public setFixedTimestep(enabled: boolean): void {
        this.useFixedTimestep = enabled;
        if (enabled) {
            this.accumulator = 0;
        }
    }

    public setFixedTimestepRate(rate: number): void {
        this.fixedTimestep = Math.max(1/120, Math.min(1/30, rate)); // Between 30-120 FPS
    }

    public isFixedTimestepEnabled(): boolean {
        return this.useFixedTimestep;
    }

    // Throttling controls
    public setUpdateThrottling(enabled: boolean): void {
        this.throttleUpdates = enabled;
    }

    public setUpdateThrottleRate(rate: number): void {
        this.updateThrottle = Math.max(1/60, Math.min(1/10, rate)); // Between 10-60 updates per second
    }

    public isUpdateThrottlingEnabled(): boolean {
        return this.throttleUpdates;
    }

    // Performance monitoring
    public getPerformanceStats(): {
        fps: number;
        fixedTimestep: boolean;
        throttling: boolean;
        accumulator: number;
        browser: string;
    } {
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
    public getOptimalSettings(): {
        fixedTimestep: boolean;
        throttleUpdates: boolean;
        maxFrameTime: number;
    } {
        if (this.isChrome || this.isEdge) {
            return {
                fixedTimestep: true,
                throttleUpdates: false,
                maxFrameTime: 1/60
            };
        } else if (this.isFirefox) {
            return {
                fixedTimestep: true,
                throttleUpdates: false,
                maxFrameTime: 1/30
            };
        } else if (this.isSafari) {
            return {
                fixedTimestep: false,
                throttleUpdates: true,
                maxFrameTime: 1/30
            };
        } else {
            return {
                fixedTimestep: false,
                throttleUpdates: true,
                maxFrameTime: 1/30
            };
        }
    }

    public applyOptimalSettings(): void {
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