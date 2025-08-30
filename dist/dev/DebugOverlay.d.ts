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
        bounds?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    camera?: Vec2;
    memory?: {
        entities: number;
        sprites: number;
        audio: number;
    };
}
export declare class DebugOverlay {
    private enabled;
    private config;
    private canvas;
    private ctx;
    private lastFrameTime;
    private fpsHistory;
    private debugInfo;
    constructor(config?: DebugOverlayConfig);
    /**
     * Initialize the debug overlay
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * Enable/disable debug overlay
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if debug overlay is enabled
     */
    isEnabled(): boolean;
    /**
     * Update debug information
     */
    update(info: DebugInfo, deltaTime: number): void;
    /**
     * Render the debug overlay
     */
    render(): void;
    /**
     * Render collider boxes for entities
     */
    private renderColliders;
    /**
     * Set debug configuration
     */
    setConfig(config: Partial<DebugOverlayConfig>): void;
    /**
     * Toggle a specific debug feature
     */
    toggleFeature(feature: keyof DebugOverlayConfig): void;
    /**
     * Get current configuration
     */
    getConfig(): DebugOverlayConfig;
    /**
     * Get debug info for the overlay itself
     */
    getDebugInfo(): Record<string, any>;
}
//# sourceMappingURL=DebugOverlay.d.ts.map