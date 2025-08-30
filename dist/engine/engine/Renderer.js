import { PlatformManager } from "./PlatformConfig.js";
// Retro font system for small resolutions
class RetroFont {
    static getFontSize(resolution) {
        const minDimension = Math.min(resolution.width, resolution.height);
        if (minDimension <= 160) {
            return '6x8'; // Game Boy, very small screens
        }
        else if (minDimension <= 256) {
            return '8x12'; // NES, SNES, medium screens
        }
        else {
            return '8x12'; // Default for larger screens
        }
    }
    static getFontMetrics(resolution) {
        const fontSize = this.getFontSize(resolution);
        const fontData = this.FONT_DATA[fontSize];
        return {
            charWidth: fontData.charWidth,
            charHeight: fontData.charHeight,
            fontSize
        };
    }
}
RetroFont.FONT_DATA = {
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
export class Renderer {
    constructor(canvas, platformKey) {
        this.cameraX = 0;
        this.cameraY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetX = 0;
        this.offsetY = 0;
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
        window.addEventListener('resize', () => {
            this.updateScaling(canvas);
        });
    }
    configurePlatformRendering() {
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
    updateScaling(canvas) {
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
    clear(color = "#000") {
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
    drawImage(img, x, y, width, height) {
        if (!img || !img.complete || img.naturalWidth === 0) {
            console.warn('Attempted to draw invalid image');
            return;
        }
        if (!isFinite(x) || !isFinite(y)) {
            console.warn('Invalid image position provided');
            return;
        }
        // Draw to internal canvas
        this.internalCtx.drawImage(img, x - this.cameraX, y - this.cameraY, width ?? img.width, height ?? img.height);
    }
    drawText(text, x, y, font = "16px Arial", color = "#FFF") {
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
    drawRetroText(text, x, y, color) {
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
    drawRect(x, y, w, h, color) {
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
    drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
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
    setCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }
    getCamera() {
        return { x: this.cameraX, y: this.cameraY };
    }
    getContext() {
        return this.ctx;
    }
    getInternalContext() {
        return this.internalCtx;
    }
    getInternalCanvas() {
        return this.internalCanvas;
    }
    getInternalDimensions() {
        return { width: this.currentPlatform.resolution.width, height: this.currentPlatform.resolution.height };
    }
    getDisplayDimensions() {
        return { width: this.ctx.canvas.width, height: this.ctx.canvas.height };
    }
    getScale() {
        return { x: this.scaleX, y: this.scaleY };
    }
    getOffset() {
        return { x: this.offsetX, y: this.offsetY };
    }
    // Get current font metrics for UI calculations
    getFontMetrics() {
        return { ...this.currentFontMetrics };
    }
    // Render the internal canvas to the display canvas
    renderToDisplay() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.internalCanvas, this.offsetX, this.offsetY, this.currentPlatform.resolution.width * this.scaleX, this.currentPlatform.resolution.height * this.scaleY);
        this.ctx.restore();
    }
    // Convert display coordinates to internal coordinates
    displayToInternal(displayX, displayY) {
        const x = (displayX - this.offsetX) / this.scaleX;
        const y = (displayY - this.offsetY) / this.scaleY;
        return { x, y };
    }
    // Convert internal coordinates to display coordinates
    internalToDisplay(internalX, internalY) {
        const x = internalX * this.scaleX + this.offsetX;
        const y = internalY * this.scaleY + this.offsetY;
        return { x, y };
    }
    // Platform management methods
    getCurrentPlatform() {
        return this.currentPlatform;
    }
    setPlatform(platformKey) {
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
    getPlatformBackgroundColor() {
        return this.currentPlatform.backgroundColor;
    }
    getPlatformBorderColor() {
        return this.currentPlatform.borderColor;
    }
}
//# sourceMappingURL=Renderer.js.map