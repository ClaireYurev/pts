import { Vec2 } from '../engine/Vector2.js';

export interface DebugOverlayConfig {
    enabled?: boolean;
    showFPS?: boolean;
    showPosition?: boolean;
    showState?: boolean;
    showFlags?: boolean;
    showColliders?: boolean;
    fontSize?: number;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    colliderColor?: string;
}

export interface DebugInfo {
    fps?: number;
    playerPosition?: Vec2;
    playerState?: string;
    flags?: Record<string, boolean>;
    entities?: Array<{
        id: string;
        position: Vec2;
        bounds?: { x: number; y: number; width: number; height: number };
    }>;
    camera?: Vec2;
    memory?: {
        entities: number;
        sprites: number;
        audio: number;
    };
}

export class DebugOverlay {
    private enabled: boolean = false;
    private config: DebugOverlayConfig;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private lastFrameTime: number = 0;
    private fpsHistory: number[] = [];
    private debugInfo: DebugInfo = {};

    constructor(config: DebugOverlayConfig = {}) {
        this.config = {
            enabled: false,
            showFPS: true,
            showPosition: true,
            showState: true,
            showFlags: true,
            showColliders: false,
            fontSize: 12,
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            textColor: '#00FF00',
            colliderColor: '#FF0000',
            ...config
        };
    }

    /**
     * Initialize the debug overlay
     */
    initialize(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('Failed to get 2D context for debug overlay');
            return;
        }
    }

    /**
     * Enable/disable debug overlay
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Check if debug overlay is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Update debug information
     */
    update(info: DebugInfo, deltaTime: number): void {
        if (!this.enabled) return;

        // Calculate FPS
        if (deltaTime > 0) {
            const fps = 1 / deltaTime;
            this.fpsHistory.push(fps);
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }
        }

        this.debugInfo = info;
    }

    /**
     * Render the debug overlay
     */
    render(): void {
        if (!this.enabled || !this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const canvas = this.canvas;

        // Clear the overlay area
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        if (this.config.backgroundColor) {
            ctx.fillStyle = this.config.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Set text style
        ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.textColor || '#00FF00';
        ctx.textBaseline = 'top';

        let y = 10;
        const lineHeight = this.config.fontSize! + 2;

        // Draw FPS
        if (this.config.showFPS && this.fpsHistory.length > 0) {
            const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
            ctx.fillText(`FPS: ${avgFPS.toFixed(1)}`, 10, y);
            y += lineHeight;
        }

        // Draw player position
        if (this.config.showPosition && this.debugInfo.playerPosition) {
            const pos = this.debugInfo.playerPosition;
            ctx.fillText(`Player: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`, 10, y);
            y += lineHeight;
        }

        // Draw player state
        if (this.config.showState && this.debugInfo.playerState) {
            ctx.fillText(`State: ${this.debugInfo.playerState}`, 10, y);
            y += lineHeight;
        }

        // Draw camera position
        if (this.debugInfo.camera) {
            const cam = this.debugInfo.camera;
            ctx.fillText(`Camera: (${cam.x.toFixed(1)}, ${cam.y.toFixed(1)})`, 10, y);
            y += lineHeight;
        }

        // Draw flags
        if (this.config.showFlags && this.debugInfo.flags) {
            ctx.fillText('Flags:', 10, y);
            y += lineHeight;
            Object.entries(this.debugInfo.flags).forEach(([key, value]) => {
                const color = value ? '#00FF00' : '#FF0000';
                ctx.fillStyle = color;
                ctx.fillText(`  ${key}: ${value}`, 20, y);
                y += lineHeight;
            });
            ctx.fillStyle = this.config.textColor || '#00FF00';
        }

        // Draw memory info
        if (this.debugInfo.memory) {
            const mem = this.debugInfo.memory;
            ctx.fillText(`Memory: E:${mem.entities} S:${mem.sprites} A:${mem.audio}`, 10, y);
            y += lineHeight;
        }

        // Draw colliders
        if (this.config.showColliders && this.debugInfo.entities) {
            this.renderColliders();
        }
    }

    /**
     * Render collider boxes for entities
     */
    private renderColliders(): void {
        if (!this.ctx || !this.debugInfo.entities) return;

        const ctx = this.ctx;
        ctx.strokeStyle = this.config.colliderColor || '#FF0000';
        ctx.lineWidth = 1;

        this.debugInfo.entities.forEach(entity => {
            if (entity.bounds) {
                const bounds = entity.bounds;
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                
                // Draw entity ID
                ctx.fillStyle = this.config.colliderColor || '#FF0000';
                ctx.fillText(entity.id, bounds.x, bounds.y - 15);
            }
        });
    }

    /**
     * Set debug configuration
     */
    setConfig(config: Partial<DebugOverlayConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Toggle a specific debug feature
     */
    toggleFeature(feature: keyof DebugOverlayConfig): void {
        if (feature in this.config && typeof this.config[feature] === 'boolean') {
            (this.config as any)[feature] = !(this.config as any)[feature];
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): DebugOverlayConfig {
        return { ...this.config };
    }

    /**
     * Get debug info for the overlay itself
     */
    getDebugInfo(): Record<string, any> {
        return {
            enabled: this.enabled,
            config: this.config,
            fpsHistory: this.fpsHistory.length,
            canvas: !!this.canvas,
            context: !!this.ctx
        };
    }
} 