import { PlatformManager } from "./PlatformConfig.js";
import { RENDERER } from "./Constants.js";
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
        // Core rendering settings
        this.scaleMode = 'integer';
        this.safeAreaPct = RENDERER.DEFAULT_SAFE_AREA;
        this.isFullscreen = false;
        // Resource management
        this.loadedImages = new Map();
        this.isDisposed = false;
        // Performance optimizations
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
        this.renderableEntities = [];
        this.batchSize = 100; // Number of entities to render in a batch
        this.lastFrameTime = 0;
        this.frameTimeThreshold = 16.67; // 60 FPS threshold
        this.cullingEnabled = true;
        this.batchingEnabled = true;
        this.renderStats = {
            totalEntities: 0,
            culledEntities: 0,
            renderedEntities: 0,
            batches: 0,
            frameTime: 0
        };
        this.handleResize = () => {
            if (!this.isDisposed) {
                this.updateScaling(this.ctx.canvas);
            }
        };
        this.handleFullscreenChange = () => {
            if (!this.isDisposed) {
                this.isFullscreen = !!document.fullscreenElement;
                this.updateScaling(this.ctx.canvas);
                console.log(`Renderer: Fullscreen state changed to ${this.isFullscreen}`);
            }
        };
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
        this.updateScaling(this.ctx.canvas);
        // Initialize viewport
        this.updateViewport();
        // Enable performance optimizations
        this.enablePerformanceOptimizations();
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
        // Apply safe area
        const safeAreaX = containerWidth * this.safeAreaPct;
        const safeAreaY = containerHeight * this.safeAreaPct;
        const availableWidth = containerWidth - (safeAreaX * 2);
        const availableHeight = containerHeight - (safeAreaY * 2);
        // Calculate scale based on mode
        let scale;
        switch (this.scaleMode) {
            case 'integer':
                // Calculate integer scale that fits within available space
                const scaleX = availableWidth / this.currentPlatform.resolution.width;
                const scaleY = availableHeight / this.currentPlatform.resolution.height;
                scale = Math.floor(Math.min(scaleX, scaleY));
                scale = Math.max(RENDERER.MIN_SCALE, Math.min(RENDERER.MAX_SCALE, scale));
                break;
            case 'fit':
                // Fit to available space while maintaining aspect ratio
                const fitScaleX = availableWidth / this.currentPlatform.resolution.width;
                const fitScaleY = availableHeight / this.currentPlatform.resolution.height;
                scale = Math.min(fitScaleX, fitScaleY);
                break;
            case 'stretch':
                // Stretch to fill available space
                scale = Math.min(availableWidth / this.currentPlatform.resolution.width, availableHeight / this.currentPlatform.resolution.height);
                break;
            default:
                scale = 1;
        }
        this.scaleX = scale;
        this.scaleY = scale;
        // Calculate centering offsets (including safe area)
        this.offsetX = safeAreaX + (availableWidth - this.currentPlatform.resolution.width * scale) / 2;
        this.offsetY = safeAreaY + (availableHeight - this.currentPlatform.resolution.height * scale) / 2;
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
        // Configure image smoothing based on scale mode
        this.ctx.imageSmoothingEnabled = this.scaleMode !== 'integer';
        this.internalCtx.imageSmoothingEnabled = this.scaleMode !== 'integer';
        console.log(`Renderer scaling: ${this.currentPlatform.name} (${this.currentPlatform.resolution.width}x${this.currentPlatform.resolution.height}), Mode=${this.scaleMode}, Display=${containerWidth}x${containerHeight}, Scale=${scale.toFixed(2)}, DPR=${devicePixelRatio}, SafeArea=${(this.safeAreaPct * 100).toFixed(1)}%`);
    }
    enablePerformanceOptimizations() {
        // Enable hardware acceleration where possible
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
        this.internalCtx.imageSmoothingEnabled = false;
        // Set composite operation for better performance
        this.ctx.globalCompositeOperation = 'source-over';
        this.internalCtx.globalCompositeOperation = 'source-over';
        // Pre-allocate commonly used objects
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
        this.renderStats = {
            totalEntities: 0,
            culledEntities: 0,
            renderedEntities: 0,
            batches: 0,
            frameTime: 0
        };
    }
    addRenderableEntity(entity) {
        this.renderableEntities.push(entity);
    }
    removeRenderableEntity(entity) {
        const index = this.renderableEntities.indexOf(entity);
        if (index > -1) {
            this.renderableEntities.splice(index, 1);
        }
    }
    clearRenderableEntities() {
        this.renderableEntities.length = 0;
    }
    updateViewport() {
        const internalDims = this.getInternalDimensions();
        const margin = 64; // Extra margin for smooth scrolling
        this.viewport = {
            x: this.cameraX - margin,
            y: this.cameraY - margin,
            width: internalDims.width + margin * 2,
            height: internalDims.height + margin * 2
        };
    }
    isEntityInViewport(entity) {
        if (!this.cullingEnabled)
            return true;
        const entityRight = entity.x + entity.width;
        const entityBottom = entity.y + entity.height;
        const viewportRight = this.viewport.x + this.viewport.width;
        const viewportBottom = this.viewport.y + this.viewport.height;
        return !(entity.x > viewportRight ||
            entityRight < this.viewport.x ||
            entity.y > viewportBottom ||
            entityBottom < this.viewport.y);
    }
    renderBatch(entities, startIndex, endIndex) {
        for (let i = startIndex; i < endIndex && i < entities.length; i++) {
            const entity = entities[i];
            if (entity.visible && this.isEntityInViewport(entity)) {
                entity.render(this.internalCtx, this.cameraX, this.cameraY);
                this.renderStats.renderedEntities++;
            }
            else {
                this.renderStats.culledEntities++;
            }
        }
    }
    render() {
        const startTime = performance.now();
        // Clear the internal canvas
        this.internalCtx.clearRect(0, 0, this.internalCanvas.width, this.internalCanvas.height);
        // Update viewport for culling
        this.updateViewport();
        // Reset render stats
        this.renderStats = {
            totalEntities: this.renderableEntities.length,
            culledEntities: 0,
            renderedEntities: 0,
            batches: 0,
            frameTime: 0
        };
        if (this.batchingEnabled && this.renderableEntities.length > this.batchSize) {
            // Render in batches for better performance
            for (let i = 0; i < this.renderableEntities.length; i += this.batchSize) {
                const endIndex = Math.min(i + this.batchSize, this.renderableEntities.length);
                this.renderBatch(this.renderableEntities, i, endIndex);
                this.renderStats.batches++;
                // Yield to main thread if taking too long
                if (performance.now() - startTime > this.frameTimeThreshold) {
                    setTimeout(() => {
                        this.renderBatch(this.renderableEntities, endIndex, this.renderableEntities.length);
                    }, 0);
                    break;
                }
            }
        }
        else {
            // Render all entities at once for small counts
            this.renderBatch(this.renderableEntities, 0, this.renderableEntities.length);
        }
        // Draw internal canvas to main canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.internalCanvas, this.offsetX, this.offsetY, this.ctx.canvas.width, this.ctx.canvas.height);
        this.renderStats.frameTime = performance.now() - startTime;
    }
    getRenderStats() {
        return { ...this.renderStats };
    }
    setCullingEnabled(enabled) {
        this.cullingEnabled = enabled;
    }
    setBatchingEnabled(enabled) {
        this.batchingEnabled = enabled;
    }
    setBatchSize(size) {
        this.batchSize = Math.max(1, Math.min(1000, size));
    }
    setFrameTimeThreshold(threshold) {
        this.frameTimeThreshold = Math.max(1, Math.min(100, threshold));
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
    // Core rendering methods
    setScaleMode(mode) {
        this.scaleMode = mode;
        this.updateScaling(this.ctx.canvas);
        console.log(`Renderer: Scale mode set to ${mode}`);
    }
    setSafeArea(pct) {
        this.safeAreaPct = Math.max(0, Math.min(0.1, pct)); // Clamp between 0% and 10%
        this.updateScaling(this.ctx.canvas);
        console.log(`Renderer: Safe area set to ${(this.safeAreaPct * 100).toFixed(1)}%`);
    }
    resizeToWindow() {
        this.updateScaling(this.ctx.canvas);
    }
    async requestFullscreen() {
        try {
            if (!this.isFullscreen) {
                // Create a fullscreen container that includes UI elements
                const fullscreenContainer = document.createElement('div');
                fullscreenContainer.id = 'fullscreenContainer';
                fullscreenContainer.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #000;
                    z-index: 9998;
                    display: flex;
                    flex-direction: column;
                `;
                // Move canvas to fullscreen container
                const canvas = this.ctx.canvas;
                if (canvas.parentNode) {
                    canvas.parentNode.insertBefore(fullscreenContainer, canvas);
                }
                fullscreenContainer.appendChild(canvas);
                // Add UI elements to fullscreen container
                const piButton = document.getElementById('piMenuButton');
                if (piButton) {
                    fullscreenContainer.appendChild(piButton);
                }
                const piMenuOverlay = document.getElementById('piMenuOverlay');
                if (piMenuOverlay) {
                    fullscreenContainer.appendChild(piMenuOverlay);
                }
                const platformSelectorOverlay = document.getElementById('platformSelectorOverlay');
                if (platformSelectorOverlay) {
                    fullscreenContainer.appendChild(platformSelectorOverlay);
                }
                // Hide dev controls in fullscreen by default
                const devControls = document.getElementById('devControls');
                if (devControls) {
                    devControls.style.display = 'none';
                }
                // Request fullscreen on the container
                await fullscreenContainer.requestFullscreen();
                this.isFullscreen = true;
                console.log('Renderer: Entered fullscreen mode with UI elements');
            }
        }
        catch (error) {
            console.error('Renderer: Failed to enter fullscreen:', error);
            throw error;
        }
    }
    async exitFullscreen() {
        try {
            if (this.isFullscreen && document.fullscreenElement) {
                await document.exitFullscreen();
                // Restore elements to their original positions
                const fullscreenContainer = document.getElementById('fullscreenContainer');
                if (fullscreenContainer) {
                    const canvas = this.ctx.canvas;
                    const piButton = document.getElementById('piMenuButton');
                    const piMenuOverlay = document.getElementById('piMenuOverlay');
                    const platformSelectorOverlay = document.getElementById('platformSelectorOverlay');
                    // Move canvas back to body
                    document.body.appendChild(canvas);
                    // Move UI elements back to body
                    if (piButton) {
                        document.body.appendChild(piButton);
                    }
                    if (piMenuOverlay) {
                        document.body.appendChild(piMenuOverlay);
                    }
                    if (platformSelectorOverlay) {
                        document.body.appendChild(platformSelectorOverlay);
                    }
                    // Show dev controls when exiting fullscreen
                    const devControls = document.getElementById('devControls');
                    if (devControls) {
                        devControls.style.display = 'block';
                    }
                    // Remove fullscreen container
                    fullscreenContainer.remove();
                }
                this.isFullscreen = false;
                console.log('Renderer: Exited fullscreen mode and restored elements');
            }
        }
        catch (error) {
            console.error('Renderer: Failed to exit fullscreen:', error);
            throw error;
        }
    }
    getScaleMode() {
        return this.scaleMode;
    }
    getSafeArea() {
        return this.safeAreaPct;
    }
    isFullscreenMode() {
        return this.isFullscreen;
    }
    getCanvasSize() {
        return { width: this.ctx.canvas.width, height: this.ctx.canvas.height };
    }
    getViewportSize() {
        return {
            width: this.currentPlatform.resolution.width * this.scaleX,
            height: this.currentPlatform.resolution.height * this.scaleY
        };
    }
    // Render the internal canvas to the display canvas
    renderToDisplay() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.internalCanvas, this.offsetX, this.offsetY, this.currentPlatform.resolution.width * this.scaleX, this.currentPlatform.resolution.height * this.scaleY);
        // Render UI elements directly on canvas in fullscreen mode (only if container approach failed)
        if (this.isFullscreen && !document.getElementById('fullscreenContainer')) {
            this.renderUIElements();
        }
        this.ctx.restore();
    }
    // Render UI elements directly on the canvas
    renderUIElements() {
        const canvas = this.ctx.canvas;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const displayWidth = canvas.width / devicePixelRatio;
        const displayHeight = canvas.height / devicePixelRatio;
        // Render Pi button
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '32px "Times New Roman", serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const piButtonX = displayWidth - 40;
        const piButtonY = displayHeight - 40;
        // Draw Pi button background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(piButtonX - 20, piButtonY - 20, 40, 40);
        // Draw Pi symbol
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('π', piButtonX, piButtonY);
        this.ctx.restore();
        console.log('UI elements rendered directly on canvas in fullscreen mode');
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
    /**
     * Clean up resources to prevent memory leaks
     */
    cleanup() {
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
            // Remove event listeners
            window.removeEventListener('resize', this.handleResize);
            document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
            this.isDisposed = true;
            console.log("Renderer cleanup completed successfully");
        }
        catch (error) {
            console.error("Error during renderer cleanup:", error);
        }
    }
    /**
     * Load and cache an image with error handling
     */
    async loadImage(src) {
        if (this.isDisposed) {
            throw new Error("Renderer has been disposed");
        }
        // Return cached image if available
        if (this.loadedImages.has(src)) {
            const cachedImage = this.loadedImages.get(src);
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
    clearImageCache(src) {
        if (src) {
            this.loadedImages.delete(src);
        }
        else {
            this.loadedImages.clear();
        }
    }
    // Handle mouse clicks on canvas-rendered UI elements
    handleCanvasClick(event) {
        if (!this.isFullscreen)
            return;
        const canvas = this.ctx.canvas;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const displayWidth = canvas.width / devicePixelRatio;
        const displayHeight = canvas.height / devicePixelRatio;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Check if Pi button was clicked
        const piButtonX = displayWidth - 40;
        const piButtonY = displayHeight - 40;
        const distance = Math.sqrt((x - piButtonX) ** 2 + (y - piButtonY) ** 2);
        if (distance <= 20) {
            console.log('Pi button clicked on canvas');
            // Trigger Pi menu toggle
            const piMenuButton = document.getElementById('piMenuButton');
            if (piMenuButton) {
                piMenuButton.click();
            }
        }
    }
}
//# sourceMappingURL=Renderer.js.map