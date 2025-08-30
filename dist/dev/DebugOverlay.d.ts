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
    fps: number;
    frameTime: number;
    entities: number;
    playerPosition: {
        x: number;
        y: number;
    };
    playerVelocity: {
        x: number;
        y: number;
    };
    playerHealth: number;
    gameTime: number;
    memoryUsage?: number;
    renderStats?: {
        drawCalls: number;
        triangles: number;
        culledObjects: number;
    };
}
export interface AABB {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    label?: string;
}
export declare class DebugOverlay {
    private canvas;
    private ctx;
    private _isEnabled;
    private isVisible;
    private debugInfo;
    private aabbs;
    private fpsHistory;
    private frameTimeHistory;
    private maxHistoryLength;
    constructor();
    /**
     * Initialize debug overlay with canvas
     */
    initialize(canvas: HTMLCanvasElement): void;
    /**
     * Enable/disable debug overlay
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get enabled state
     */
    isEnabled(): boolean;
    /**
     * Toggle visibility
     */
    toggle(): void;
    /**
     * Update debug information
     */
    update(info: DebugInfo): void;
    /**
     * Add AABB for rendering
     */
    addAABB(aabb: AABB): void;
    /**
     * Clear AABBs
     */
    clearAABBs(): void;
    /**
     * Render debug overlay
     */
    render(): void;
    /**
     * Render AABBs (Axis-Aligned Bounding Boxes)
     */
    private renderAABBs;
    /**
     * Render debug information panel
     */
    private renderDebugPanel;
    /**
     * Render FPS graph
     */
    private renderFPSGraph;
    /**
     * Setup keyboard bindings
     */
    private setupKeyBindings;
    /**
     * Get debug overlay state
     */
    isDebugEnabled(): boolean;
    isDebugVisible(): boolean;
    /**
     * Get current debug info
     */
    getDebugInfo(): DebugInfo | null;
    /**
     * Get FPS statistics
     */
    getFPSStats(): {
        current: number;
        average: number;
        min: number;
        max: number;
    };
    /**
     * Get frame time statistics
     */
    getFrameTimeStats(): {
        current: number;
        average: number;
        min: number;
        max: number;
    };
}
//# sourceMappingURL=DebugOverlay.d.ts.map