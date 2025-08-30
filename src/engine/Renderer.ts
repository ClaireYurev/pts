import { PlatformConfig, PlatformManager } from "./PlatformConfig.js";

// Retro font system for small resolutions
class RetroFont {
    private static readonly FONT_DATA = {
        // 6x8 pixel font (good for very small resolutions like Game Boy)
        '6x8': {
            charWidth: 6,
            charHeight: 8,
            chars: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
            // Simplified font data - in a real implementation, this would be actual pixel data
            // For now, we'll use canvas-based font rendering with proper scaling
        },
        // 8x12 pixel font (good for medium resolutions like NES/SNES)
        '8x12': {
            charWidth: 8,
            charHeight: 12,
            chars: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
        }
    };

    private static getFontSize(resolution: { width: number; height: number }): string {
        const minDimension = Math.min(resolution.width, resolution.height);
        
        if (minDimension <= 160) {
            return '6x8'; // Game Boy, very small screens
        } else if (minDimension <= 256) {
            return '8x12'; // NES, SNES, medium screens
        } else {
            return '8x12'; // Default for larger screens
        }
    }

    public static getFontMetrics(resolution: { width: number; height: number }): { charWidth: number; charHeight: number; fontSize: string } {
        const fontSize = this.getFontSize(resolution);
        const fontData = this.FONT_DATA[fontSize as keyof typeof this.FONT_DATA];
        return {
            charWidth: fontData.charWidth,
            charHeight: fontData.charHeight,
            fontSize
        };
    }
}

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private internalCanvas: HTMLCanvasElement;
    private internalCtx: CanvasRenderingContext2D;
    private cameraX = 0;
    private cameraY = 0;
    
    // Multi-platform scaling settings
    private currentPlatform: PlatformConfig;
    private scaleX = 1;
    private scaleY = 1;
    private offsetX = 0;
    private offsetY = 0;

    // Font system
    private currentFontMetrics: { charWidth: number; charHeight: number; fontSize: string };
    
    // Resource management
    private loadedImages: Map<string, HTMLImageElement> = new Map();
    private isDisposed = false;

    constructor(canvas: HTMLCanvasElement, platformKey?: string) {
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get 2D context from canvas");
        }
        this.ctx = context;
        
        // Initialize with current platform or specified platform
        this.currentPlatform = PlatformManager.getPlatform(platformKey || PlatformManager.getCurrentPlatform().name) || PlatformManager.getCurrentPlatform();
        
        // Initialize font metrics for current platform
        this.currentFontMetrics = RetroFont.getFontMetrics(this.currentPlatform.resolution);
        
        // Create internal canvas with platform resolution
        this.internalCanvas = document.createElement('canvas');
        this.internalCanvas.width = this.currentPlatform.resolution.width;
        this.internalCanvas.height = this.currentPlatform.resolution.height;
        
        const internalContext = this.internalCanvas.getContext("2d");
        if (!internalContext) {
            throw new Error("Failed to get 2D context from internal canvas");
        }
        this.internalCtx = internalContext;
        
        // Configure rendering based on platform
        this.configurePlatformRendering();
        
        // Setup scaling
        this.updateScaling(canvas);
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize);
    }

    private configurePlatformRendering(): void {
        // Configure rendering based on platform scaling mode
        switch (this.currentPlatform.scalingMode) {
            case 'pixel-perfect':
                this.ctx.imageSmoothingEnabled = false;
                this.internalCtx.imageSmoothingEnabled = false;
                break;
            case 'smooth':
                this.ctx.imageSmoothingEnabled = true;
                this.internalCtx.imageSmoothingEnabled = true;
                break;
            case 'crt':
                this.ctx.imageSmoothingEnabled = false;
                this.internalCtx.imageSmoothingEnabled = false;
                // Could add CRT scanline effects here
                break;
        }
        
        // Update font metrics for new platform
        this.currentFontMetrics = RetroFont.getFontMetrics(this.currentPlatform.resolution);
    }

    private updateScaling(canvas: HTMLCanvasElement): void {
        const containerWidth = canvas.clientWidth || canvas.width;
        const containerHeight = canvas.clientHeight || canvas.height;
        
        // Validate container dimensions
        if (!containerWidth || !containerHeight || containerWidth <= 0 || containerHeight <= 0) {
            console.warn("Invalid container dimensions for scaling");
            return;
        }
        
        // Validate platform configuration
        if (!this.currentPlatform || !this.currentPlatform.resolution) {
            console.warn("Invalid platform configuration for scaling");
            return;
        }
        
        // Calculate scale to fit the platform resolution within the container
        this.scaleX = containerWidth / this.currentPlatform.resolution.width;
        this.scaleY = containerHeight / this.currentPlatform.resolution.height;
        
        // Use the smaller scale to maintain aspect ratio
        const scale = Math.min(this.scaleX, this.scaleY);
        this.scaleX = scale;
        this.scaleY = scale;
        
        // Calculate centering offsets
        this.offsetX = (containerWidth - this.currentPlatform.resolution.width * scale) / 2;
        this.offsetY = (containerHeight - this.currentPlatform.resolution.height * scale) / 2;
        
        // Handle high-DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        const displayWidth = Math.floor(containerWidth * devicePixelRatio);
        const displayHeight = Math.floor(containerHeight * devicePixelRatio);
        
        // Update canvas size to match container (with high-DPI support)
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            canvas.style.width = containerWidth + 'px';
            canvas.style.height = containerHeight + 'px';
            
            // Scale the context to account for device pixel ratio
            this.ctx.scale(devicePixelRatio, devicePixelRatio);
        }
        
        console.log(`Platform scaling: ${this.currentPlatform.name} (${this.currentPlatform.resolution.width}x${this.currentPlatform.resolution.height}), Display=${containerWidth}x${containerHeight}, Scale=${scale.toFixed(2)}, DPR=${devicePixelRatio}, Font=${this.currentFontMetrics.fontSize}`);
    }

    public clear(color: string = "#000"): void {
        // Clear internal canvas
        this.internalCtx.save();
        this.internalCtx.fillStyle = color;
        this.internalCtx.fillRect(0, 0, this.currentPlatform.resolution.width, this.currentPlatform.resolution.height);
        this.internalCtx.restore();
        
        // Clear display canvas
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore();
    }

    public drawImage(img: HTMLImageElement, x: number, y: number, width?: number, height?: number): void {
        if (!img || !img.complete || img.naturalWidth === 0) {
            console.warn('Attempted to draw invalid image');
            return;
        }
        
        if (!isFinite(x) || !isFinite(y)) {
            console.warn('Invalid image position provided');
            return;
        }
        
        // Draw to internal canvas
        this.internalCtx.drawImage(
            img, 
            x - this.cameraX, 
            y - this.cameraY, 
            width ?? img.width, 
            height ?? img.height
        );
    }

    public drawText(text: string, x: number, y: number, font: string = "16px Arial", color: string = "#FFF"): void {
        if (!text || typeof text !== 'string') {
            console.warn('Invalid text provided to drawText');
            return;
        }
        
        if (!isFinite(x) || !isFinite(y)) {
            console.warn('Invalid text position provided');
            return;
        }
        
        // Draw to internal canvas with retro font system
        this.drawRetroText(text, x - this.cameraX, y - this.cameraY, color);
    }

    private drawRetroText(text: string, x: number, y: number, color: string): void {
        this.internalCtx.save();
        
        // Use monospace font for consistent character spacing
        const fontSize = this.currentFontMetrics.charHeight;
        const fontFamily = 'Courier New, monospace';
        
        this.internalCtx.font = `${fontSize}px ${fontFamily}`;
        this.internalCtx.fillStyle = color;
        this.internalCtx.textBaseline = 'top';
        
        // Disable anti-aliasing for pixel-perfect rendering
        this.internalCtx.imageSmoothingEnabled = false;
        
        // Draw text with proper character spacing
        let currentX = x;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            this.internalCtx.fillText(char, currentX, y);
            currentX += this.currentFontMetrics.charWidth;
        }
        
        this.internalCtx.restore();
    }

    public drawRect(x: number, y: number, w: number, h: number, color: string): void {
        if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h)) {
            console.warn('Invalid rectangle parameters provided');
            return;
        }
        
        if (w <= 0 || h <= 0) {
            console.warn('Invalid rectangle dimensions provided');
            return;
        }
        
        // Draw to internal canvas
        this.internalCtx.save();
        this.internalCtx.fillStyle = color;
        this.internalCtx.fillRect(x - this.cameraX, y - this.cameraY, w, h);
        this.internalCtx.restore();
    }

    public drawLine(x1: number, y1: number, x2: number, y2: number, color: string, lineWidth: number = 1): void {
        // Draw to internal canvas
        this.internalCtx.save();
        this.internalCtx.strokeStyle = color;
        this.internalCtx.lineWidth = lineWidth;
        this.internalCtx.beginPath();
        this.internalCtx.moveTo(x1 - this.cameraX, y1 - this.cameraY);
        this.internalCtx.lineTo(x2 - this.cameraX, y2 - this.cameraY);
        this.internalCtx.stroke();
        this.internalCtx.restore();
    }

    public setCamera(x: number, y: number): void {
        this.cameraX = x;
        this.cameraY = y;
    }

    public getCamera(): { x: number; y: number } {
        return { x: this.cameraX, y: this.cameraY };
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public getInternalContext(): CanvasRenderingContext2D {
        return this.internalCtx;
    }

    public getInternalCanvas(): HTMLCanvasElement {
        return this.internalCanvas;
    }

    public getInternalDimensions(): { width: number; height: number } {
        return { width: this.currentPlatform.resolution.width, height: this.currentPlatform.resolution.height };
    }

    public getDisplayDimensions(): { width: number; height: number } {
        return { width: this.ctx.canvas.width, height: this.ctx.canvas.height };
    }

    public getScale(): { x: number; y: number } {
        return { x: this.scaleX, y: this.scaleY };
    }

    public getOffset(): { x: number; y: number } {
        return { x: this.offsetX, y: this.offsetY };
    }

    // Get current font metrics for UI calculations
    public getFontMetrics(): { charWidth: number; charHeight: number; fontSize: string } {
        return { ...this.currentFontMetrics };
    }

    // Render the internal canvas to the display canvas
    public renderToDisplay(): void {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(
            this.internalCanvas,
            this.offsetX,
            this.offsetY,
            this.currentPlatform.resolution.width * this.scaleX,
            this.currentPlatform.resolution.height * this.scaleY
        );
        this.ctx.restore();
    }

    // Convert display coordinates to internal coordinates
    public displayToInternal(displayX: number, displayY: number): { x: number; y: number } {
        const x = (displayX - this.offsetX) / this.scaleX;
        const y = (displayY - this.offsetY) / this.scaleY;
        return { x, y };
    }

    // Convert internal coordinates to display coordinates
    public internalToDisplay(internalX: number, internalY: number): { x: number; y: number } {
        const x = internalX * this.scaleX + this.offsetX;
        const y = internalY * this.scaleY + this.offsetY;
        return { x, y };
    }

    // Platform management methods
    public getCurrentPlatform(): PlatformConfig {
        return this.currentPlatform;
    }

    public setPlatform(platformKey: string): boolean {
        const platform = PlatformManager.getPlatform(platformKey);
        if (platform) {
            this.currentPlatform = platform;
            
            // Resize internal canvas to new platform resolution
            this.internalCanvas.width = platform.resolution.width;
            this.internalCanvas.height = platform.resolution.height;
            
            // Reconfigure rendering
            this.configurePlatformRendering();
            
            // Update scaling
            this.updateScaling(this.ctx.canvas);
            
            console.log(`Switched to platform: ${platform.name} (${platform.resolution.width}x${platform.resolution.height})`);
            return true;
        }
        return false;
    }

    public getPlatformBackgroundColor(): string {
        return this.currentPlatform.backgroundColor;
    }

    public getPlatformBorderColor(): string {
        return this.currentPlatform.borderColor;
    }

    /**
     * Clean up resources to prevent memory leaks
     */
    public cleanup(): void {
        if (this.isDisposed) {
            return;
        }
        
        try {
            // Clear loaded images
            this.loadedImages.clear();
            
            // Clear canvas contexts
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
            if (this.internalCtx) {
                this.internalCtx.clearRect(0, 0, this.internalCanvas.width, this.internalCanvas.height);
            }
            
            // Remove resize event listener
            window.removeEventListener('resize', this.handleResize);
            
            this.isDisposed = true;
            console.log("Renderer cleanup completed successfully");
        } catch (error) {
            console.error("Error during renderer cleanup:", error);
        }
    }

    /**
     * Load and cache an image with error handling
     */
    public async loadImage(src: string): Promise<HTMLImageElement> {
        if (this.isDisposed) {
            throw new Error("Renderer has been disposed");
        }
        
        // Return cached image if available
        if (this.loadedImages.has(src)) {
            const cachedImage = this.loadedImages.get(src)!;
            if (cachedImage.complete && cachedImage.naturalWidth > 0) {
                return cachedImage;
            }
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.loadedImages.set(src, img);
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            img.src = src;
        });
    }

    /**
     * Clear cached images for a specific source or all images
     */
    public clearImageCache(src?: string): void {
        if (src) {
            this.loadedImages.delete(src);
        } else {
            this.loadedImages.clear();
        }
    }

    private handleResize = (): void => {
        if (!this.isDisposed) {
            this.updateScaling(this.ctx.canvas);
        }
    };
} 