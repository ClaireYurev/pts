import { PlatformConfig } from "./PlatformConfig.js";
import { ScaleMode } from "./types.js";
interface RenderableEntity {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    render: (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) => void;
}
export declare class Renderer {
    private ctx;
    private internalCanvas;
    private internalCtx;
    private cameraX;
    private cameraY;
    private currentPlatform;
    private scaleX;
    private scaleY;
    private offsetX;
    private offsetY;
    private scaleMode;
    private safeAreaPct;
    private isFullscreen;
    private currentFontMetrics;
    private loadedImages;
    private isDisposed;
    private viewport;
    private renderableEntities;
    private batchSize;
    private lastFrameTime;
    private frameTimeThreshold;
    private cullingEnabled;
    private batchingEnabled;
    private renderStats;
    constructor(canvas: HTMLCanvasElement, platformKey?: string);
    private configurePlatformRendering;
    private updateScaling;
    private enablePerformanceOptimizations;
    addRenderableEntity(entity: RenderableEntity): void;
    removeRenderableEntity(entity: RenderableEntity): void;
    clearRenderableEntities(): void;
    private updateViewport;
    private isEntityInViewport;
    private renderBatch;
    render(): void;
    getRenderStats(): typeof this.renderStats;
    setCullingEnabled(enabled: boolean): void;
    setBatchingEnabled(enabled: boolean): void;
    setBatchSize(size: number): void;
    setFrameTimeThreshold(threshold: number): void;
    clear(color?: string): void;
    drawImage(img: HTMLImageElement, x: number, y: number, width?: number, height?: number): void;
    drawText(text: string, x: number, y: number, font?: string, color?: string): void;
    private drawRetroText;
    drawRect(x: number, y: number, w: number, h: number, color: string): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth?: number): void;
    setCamera(x: number, y: number): void;
    getCamera(): {
        x: number;
        y: number;
    };
    getContext(): CanvasRenderingContext2D;
    getInternalContext(): CanvasRenderingContext2D;
    getInternalCanvas(): HTMLCanvasElement;
    getInternalDimensions(): {
        width: number;
        height: number;
    };
    getDisplayDimensions(): {
        width: number;
        height: number;
    };
    getScale(): {
        x: number;
        y: number;
    };
    getOffset(): {
        x: number;
        y: number;
    };
    getFontMetrics(): {
        charWidth: number;
        charHeight: number;
        fontSize: string;
    };
    setScaleMode(mode: ScaleMode): void;
    setSafeArea(pct: number): void;
    resizeToWindow(): void;
    requestFullscreen(): Promise<void>;
    exitFullscreen(): Promise<void>;
    getScaleMode(): ScaleMode;
    getSafeArea(): number;
    isFullscreenMode(): boolean;
    getCanvasSize(): {
        width: number;
        height: number;
    };
    getViewportSize(): {
        width: number;
        height: number;
    };
    renderToDisplay(): void;
    private renderUIElements;
    displayToInternal(displayX: number, displayY: number): {
        x: number;
        y: number;
    };
    internalToDisplay(internalX: number, internalY: number): {
        x: number;
        y: number;
    };
    getCurrentPlatform(): PlatformConfig;
    setPlatform(platformKey: string): boolean;
    getPlatformBackgroundColor(): string;
    getPlatformBorderColor(): string;
    /**
     * Clean up resources to prevent memory leaks
     */
    cleanup(): void;
    /**
     * Load and cache an image with error handling
     */
    loadImage(src: string): Promise<HTMLImageElement>;
    /**
     * Clear cached images for a specific source or all images
     */
    clearImageCache(src?: string): void;
    private handleResize;
    private handleFullscreenChange;
    handleCanvasClick(event: MouseEvent): void;
}
export {};
//# sourceMappingURL=Renderer.d.ts.map