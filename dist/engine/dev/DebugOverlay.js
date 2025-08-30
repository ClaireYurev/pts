export class DebugOverlay {
    constructor(renderer) {
        this.renderer = renderer;
        this.enabled = false;
    }
    render(fps, playerX, playerY, playerVelocityX, playerVelocityY) {
        if (!this.enabled)
            return;
        const fontMetrics = this.renderer.getFontMetrics();
        const internalDims = this.renderer.getInternalDimensions();
        // Use RIGHT side of screen for debug info to avoid conflicts with main text on left
        const rightMargin = 5;
        const lineHeight = fontMetrics.charHeight + 1;
        let currentY = lineHeight;
        // Calculate right-aligned text position
        const getRightAlignedX = (text) => {
            const textWidth = text.length * fontMetrics.charWidth;
            return internalDims.width - textWidth - rightMargin;
        };
        // Only show essential info for very small resolutions
        const minDimension = Math.min(internalDims.width, internalDims.height);
        if (minDimension <= 160) {
            // Very compact for Game Boy - right-aligned to avoid main text
            const fpsText = `FPS:${fps}`;
            const posText = `P:${Math.round(playerX)},${Math.round(playerY)}`;
            this.renderer.drawText(fpsText, getRightAlignedX(fpsText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            this.renderer.drawText(posText, getRightAlignedX(posText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
        }
        else if (minDimension <= 256) {
            // Compact for NES/SNES - right-aligned to avoid main text
            const fpsText = `FPS:${fps}`;
            const posText = `P:${Math.round(playerX)},${Math.round(playerY)}`;
            const velText = `V:${Math.round(playerVelocityX)},${Math.round(playerVelocityY)}`;
            this.renderer.drawText(fpsText, getRightAlignedX(fpsText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            this.renderer.drawText(posText, getRightAlignedX(posText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            this.renderer.drawText(velText, getRightAlignedX(velText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
        }
        else {
            // Full debug info for larger screens - right-aligned to avoid main text
            const fpsText = `FPS: ${fps}`;
            const posText = `P: (${playerX.toFixed(1)}, ${playerY.toFixed(1)})`;
            const velText = `V: (${playerVelocityX.toFixed(1)}, ${playerVelocityY.toFixed(1)})`;
            this.renderer.drawText(fpsText, getRightAlignedX(fpsText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            this.renderer.drawText(posText, getRightAlignedX(posText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            this.renderer.drawText(velText, getRightAlignedX(velText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            // Camera position
            const camera = this.renderer.getCamera();
            const camText = `Cam: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`;
            this.renderer.drawText(camText, getRightAlignedX(camText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            currentY += lineHeight;
            // Memory usage (if available) - only for larger screens
            if ('memory' in performance && internalDims.width > 400) {
                const memory = performance.memory;
                const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
                const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
                const memText = `Mem: ${usedMB}MB/${totalMB}MB`;
                this.renderer.drawText(memText, getRightAlignedX(memText), currentY, `${fontMetrics.charHeight}px monospace`, "#0F0");
            }
        }
    }
    drawBoundingBox(x, y, w, h, color = "#F00") {
        if (!this.enabled)
            return;
        // Draw rectangle outline
        this.renderer.drawLine(x, y, x + w, y, color, 1);
        this.renderer.drawLine(x + w, y, x + w, y + h, color, 1);
        this.renderer.drawLine(x + w, y + h, x, y + h, color, 1);
        this.renderer.drawLine(x, y + h, x, y, color, 1);
    }
    drawEntityBoxes(entities) {
        if (!this.enabled)
            return;
        for (const entity of entities) {
            if (!entity)
                continue;
            const collider = entity.getCollider();
            const color = entity.isStatic ? "#00F" : "#F00"; // Blue for static, red for dynamic
            this.drawBoundingBox(collider.x, collider.y, collider.width, collider.height, color);
        }
    }
    drawGrid(gridSize = 64, color = "#333") {
        if (!this.enabled)
            return;
        const camera = this.renderer.getCamera();
        const internalDims = this.renderer.getInternalDimensions();
        // Adjust grid size based on resolution
        const minDimension = Math.min(internalDims.width, internalDims.height);
        if (minDimension <= 160) {
            gridSize = 16; // Smaller grid for Game Boy
        }
        else if (minDimension <= 256) {
            gridSize = 32; // Medium grid for NES/SNES
        }
        const startX = Math.floor(camera.x / gridSize) * gridSize;
        const startY = Math.floor(camera.y / gridSize) * gridSize;
        const endX = startX + internalDims.width + gridSize;
        const endY = startY + internalDims.height + gridSize;
        // Draw vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.renderer.drawLine(x, startY, x, endY, color, 1);
        }
        // Draw horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.renderer.drawLine(startX, y, endX, y, color, 1);
        }
    }
    toggle() {
        this.enabled = !this.enabled;
        console.log(`Debug overlay ${this.enabled ? 'enabled' : 'disabled'}`);
    }
}
//# sourceMappingURL=DebugOverlay.js.map