export class GameLoop {
    private lastTime = 0;
    private reqId = 0;
    private running = false;
    private fps = 0;
    private frameCount = 0;
    private lastFpsUpdate = 0;

    // Enhanced Fixed timestep and throttling
    private fixedTimestep = 1/60; // 60 FPS fixed timestep
    private accumulator = 0;
    private maxFrameTime = 1/30; // Cap at 30 FPS minimum
    private useFixedTimestep = false;
    private throttleUpdates = false;
    private updateThrottle = 1/30; // Update at most 30 times per second
    private lastUpdateTime = 0;

    // Trap/Timer system for deterministic updates
    private trapTimers: Map<string, { time: number; interval: number; callback: () => void; active: boolean }> = new Map();
    private trapAccumulator = 0;
    private trapTimestep = 1/120; // 120 FPS for precise timing
    private trapEnabled = false;

    // Performance monitoring
    private performanceHistory: number[] = [];
    private maxHistorySize = 60;
    private adaptiveTimestep = true;
    private spiralOfDeathProtection = true;
    private maxAccumulator = 1/10; // Cap accumulator to prevent spiral of death

    // Cross-browser optimizations
    private isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
    private isFirefox = navigator.userAgent.includes('Firefox');
    private isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    private isEdge = navigator.userAgent.includes('Edge');
    private isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    constructor(
        private update: (dt: number) => void,
        private render: () => void
    ) {
        this.detectBrowserOptimizations();
    }

    private detectBrowserOptimizations(): void {
        // Browser-specific optimizations
        if (this.isChrome || this.isEdge) {
            // Chrome/Edge has good performance with requestAnimationFrame
            this.maxFrameTime = 1/60;
            this.useFixedTimestep = true;
            this.trapEnabled = true;
        } else if (this.isFirefox) {
            // Firefox can benefit from slightly lower frame rates
            this.maxFrameTime = 1/30;
            this.useFixedTimestep = true;
            this.trapEnabled = true;
        } else if (this.isSafari) {
            // Safari on mobile can be slower
            this.maxFrameTime = this.isMobile ? 1/20 : 1/30;
            this.useFixedTimestep = false;
            this.throttleUpdates = true;
            this.trapEnabled = false;
        } else {
            // Fallback for unknown browsers
            this.maxFrameTime = 1/30;
            this.useFixedTimestep = false;
            this.throttleUpdates = true;
            this.trapEnabled = false;
        }

        console.log(`GameLoop: Browser detected - Chrome: ${this.isChrome}, Firefox: ${this.isFirefox}, Safari: ${this.isSafari}, Edge: ${this.isEdge}, Mobile: ${this.isMobile}`);
    }

    public start(): void {
        this.running = true;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
        this.lastUpdateTime = this.lastTime;
        this.accumulator = 0;
        this.trapAccumulator = 0;
        
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
            
            // Update trap timers for deterministic timing
            this.updateTrapTimers(clampedDt);
            
            if (this.useFixedTimestep) {
                // Fixed timestep for deterministic updates
                this.accumulator += clampedDt;
                
                // Spiral of death protection
                if (this.spiralOfDeathProtection && this.accumulator > this.maxAccumulator) {
                    console.warn(`GameLoop: Spiral of death detected, capping accumulator at ${this.maxAccumulator}s`);
                    this.accumulator = this.maxAccumulator;
                }
                
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
            
            // Update performance monitoring
            this.updatePerformanceHistory(clampedDt * 1000); // Convert to milliseconds
            this.adaptiveTimestepAdjustment();
            
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

    // Trap/Timer system for deterministic updates
    public addTrapTimer(id: string, interval: number, callback: () => void): void {
        if (!this.trapEnabled) {
            console.warn('GameLoop: Trap timers not enabled for this browser');
            return;
        }

        this.trapTimers.set(id, {
            time: 0,
            interval: Math.max(this.trapTimestep, interval),
            callback,
            active: true
        });
        console.log(`GameLoop: Added trap timer '${id}' with interval ${interval}s`);
    }

    public removeTrapTimer(id: string): void {
        if (this.trapTimers.delete(id)) {
            console.log(`GameLoop: Removed trap timer '${id}'`);
        }
    }

    public setTrapTimerActive(id: string, active: boolean): void {
        const timer = this.trapTimers.get(id);
        if (timer) {
            timer.active = active;
        }
    }

    public setTrapEnabled(enabled: boolean): void {
        this.trapEnabled = enabled;
        if (!enabled) {
            this.trapTimers.clear();
        }
        console.log(`GameLoop: Trap system ${enabled ? 'enabled' : 'disabled'}`);
    }

    private updateTrapTimers(dt: number): void {
        if (!this.trapEnabled) return;

        this.trapAccumulator += dt;
        
        while (this.trapAccumulator >= this.trapTimestep) {
            this.trapTimers.forEach((timer, id) => {
                if (timer.active) {
                    timer.time += this.trapTimestep;
                    if (timer.time >= timer.interval) {
                        try {
                            timer.callback();
                            timer.time = 0; // Reset timer
                        } catch (error) {
                            console.error(`GameLoop: Error in trap timer '${id}':`, error);
                        }
                    }
                }
            });
            this.trapAccumulator -= this.trapTimestep;
        }
    }

    // Performance monitoring
    private updatePerformanceHistory(frameTime: number): void {
        this.performanceHistory.push(frameTime);
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory.shift();
        }
    }

    private getAverageFrameTime(): number {
        if (this.performanceHistory.length === 0) return 0;
        return this.performanceHistory.reduce((sum, time) => sum + time, 0) / this.performanceHistory.length;
    }

    private adaptiveTimestepAdjustment(): void {
        if (!this.adaptiveTimestep) return;

        const avgFrameTime = this.getAverageFrameTime();
        
        if (avgFrameTime > 20) { // Poor performance
            if (this.useFixedTimestep && this.fixedTimestep > 1/30) {
                this.fixedTimestep = Math.max(1/30, this.fixedTimestep - 1/120);
                console.log(`GameLoop: Reduced fixed timestep to ${this.fixedTimestep}s due to poor performance`);
            }
        } else if (avgFrameTime < 10) { // Good performance
            if (this.useFixedTimestep && this.fixedTimestep < 1/60) {
                this.fixedTimestep = Math.min(1/60, this.fixedTimestep + 1/120);
                console.log(`GameLoop: Increased fixed timestep to ${this.fixedTimestep}s due to good performance`);
            }
        }
    }

    // Enhanced Performance monitoring
    public getPerformanceStats(): {
        fps: number;
        fixedTimestep: boolean;
        throttling: boolean;
        accumulator: number;
        browser: string;
        averageFrameTime: number;
        trapEnabled: boolean;
        trapTimerCount: number;
        adaptiveTimestep: boolean;
        spiralOfDeathProtection: boolean;
    } {
        return {
            fps: this.fps,
            fixedTimestep: this.useFixedTimestep,
            throttling: this.throttleUpdates,
            accumulator: this.accumulator,
            browser: this.isChrome ? 'Chrome' : 
                    this.isFirefox ? 'Firefox' : 
                    this.isSafari ? 'Safari' : 
                    this.isEdge ? 'Edge' : 'Unknown',
            averageFrameTime: this.getAverageFrameTime(),
            trapEnabled: this.trapEnabled,
            trapTimerCount: this.trapTimers.size,
            adaptiveTimestep: this.adaptiveTimestep,
            spiralOfDeathProtection: this.spiralOfDeathProtection
        };
    }

    public getPerformanceHistory(): number[] {
        return [...this.performanceHistory];
    }

    public setAdaptiveTimestep(enabled: boolean): void {
        this.adaptiveTimestep = enabled;
        console.log(`GameLoop: Adaptive timestep ${enabled ? 'enabled' : 'disabled'}`);
    }

    public setSpiralOfDeathProtection(enabled: boolean): void {
        this.spiralOfDeathProtection = enabled;
        console.log(`GameLoop: Spiral of death protection ${enabled ? 'enabled' : 'disabled'}`);
    }

    public setMaxAccumulator(maxAccumulator: number): void {
        this.maxAccumulator = Math.max(1/60, Math.min(1/5, maxAccumulator));
        console.log(`GameLoop: Max accumulator set to ${this.maxAccumulator}s`);
    }

    // Trap timer controls
    public getTrapTimers(): Map<string, { time: number; interval: number; active: boolean }> {
        const timers = new Map();
        this.trapTimers.forEach((timer, id) => {
            timers.set(id, {
                time: timer.time,
                interval: timer.interval,
                active: timer.active
            });
        });
        return timers;
    }

    public resetTrapTimers(): void {
        this.trapTimers.forEach(timer => {
            timer.time = 0;
        });
        this.trapAccumulator = 0;
        console.log('GameLoop: Reset all trap timers');
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