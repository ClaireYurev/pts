export class DebugOverlay {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this._isEnabled = false;
        this.isVisible = false;
        this.debugInfo = null;
        this.aabbs = [];
        this.fpsHistory = [];
        this.frameTimeHistory = [];
        this.maxHistoryLength = 60; // 1 second at 60fps
        this.setupKeyBindings();
    }
    /**
     * Initialize debug overlay with canvas
     */
    initialize(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.font = '12px monospace';
            this.ctx.textBaseline = 'top';
        }
    }
    /**
     * Enable/disable debug overlay
     */
    setEnabled(enabled) {
        this._isEnabled = enabled;
        if (!enabled) {
            this.isVisible = false;
        }
    }
    /**
     * Get enabled state
     */
    isEnabled() {
        return this._isEnabled;
    }
    /**
     * Toggle visibility
     */
    toggle() {
        if (this._isEnabled) {
            this.isVisible = !this.isVisible;
        }
    }
    /**
     * Update debug information
     */
    update(info) {
        this.debugInfo = info;
        // Update FPS history
        this.fpsHistory.push(info.fps);
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }
        // Update frame time history
        this.frameTimeHistory.push(info.frameTime);
        if (this.frameTimeHistory.length > this.maxHistoryLength) {
            this.frameTimeHistory.shift();
        }
    }
    /**
     * Add AABB for rendering
     */
    addAABB(aabb) {
        this.aabbs.push(aabb);
    }
    /**
     * Clear AABBs
     */
    clearAABBs() {
        this.aabbs = [];
    }
    /**
     * Render debug overlay
     */
    render() {
        if (!this.isEnabled || !this.isVisible || !this.ctx || !this.canvas) {
            return;
        }
        const ctx = this.ctx;
        const canvas = this.canvas;
        // Clear previous debug rendering
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        // Render AABBs
        this.renderAABBs();
        // Render debug info panel
        this.renderDebugPanel();
        // Render FPS graph
        this.renderFPSGraph();
        ctx.restore();
    }
    /**
     * Render AABBs (Axis-Aligned Bounding Boxes)
     */
    renderAABBs() {
        if (!this.ctx)
            return;
        const ctx = this.ctx;
        this.aabbs.forEach(aabb => {
            ctx.save();
            // Set color
            ctx.strokeStyle = aabb.color;
            ctx.lineWidth = 2;
            // Draw rectangle
            ctx.strokeRect(aabb.x, aabb.y, aabb.width, aabb.height);
            // Draw label if provided
            if (aabb.label) {
                ctx.fillStyle = aabb.color;
                ctx.font = '10px monospace';
                ctx.fillText(aabb.label, aabb.x, aabb.y - 15);
            }
            ctx.restore();
        });
    }
    /**
     * Render debug information panel
     */
    renderDebugPanel() {
        if (!this.ctx || !this.debugInfo)
            return;
        const ctx = this.ctx;
        const info = this.debugInfo;
        const panelWidth = 300;
        const panelHeight = 200;
        const margin = 10;
        const x = margin;
        const y = margin;
        // Draw background
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        // Draw text
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        let lineY = y + 10;
        const lineHeight = 16;
        // FPS and performance
        ctx.fillText(`FPS: ${info.fps.toFixed(1)}`, x + 10, lineY);
        lineY += lineHeight;
        ctx.fillText(`Frame Time: ${info.frameTime.toFixed(2)}ms`, x + 10, lineY);
        lineY += lineHeight;
        // Game state
        ctx.fillText(`Entities: ${info.entities}`, x + 10, lineY);
        lineY += lineHeight;
        ctx.fillText(`Game Time: ${info.gameTime.toFixed(1)}s`, x + 10, lineY);
        lineY += lineHeight;
        // Player position
        ctx.fillText(`Player Pos: (${info.playerPosition.x.toFixed(1)}, ${info.playerPosition.y.toFixed(1)})`, x + 10, lineY);
        lineY += lineHeight;
        ctx.fillText(`Player Vel: (${info.playerVelocity.x.toFixed(1)}, ${info.playerVelocity.y.toFixed(1)})`, x + 10, lineY);
        lineY += lineHeight;
        // Player health
        ctx.fillText(`Health: ${info.playerHealth}`, x + 10, lineY);
        lineY += lineHeight;
        // Memory usage if available
        if (info.memoryUsage) {
            ctx.fillText(`Memory: ${(info.memoryUsage / 1024 / 1024).toFixed(1)}MB`, x + 10, lineY);
            lineY += lineHeight;
        }
        // Render stats if available
        if (info.renderStats) {
            ctx.fillText(`Draw Calls: ${info.renderStats.drawCalls}`, x + 10, lineY);
            lineY += lineHeight;
            ctx.fillText(`Triangles: ${info.renderStats.triangles}`, x + 10, lineY);
            lineY += lineHeight;
            ctx.fillText(`Culled: ${info.renderStats.culledObjects}`, x + 10, lineY);
        }
        ctx.restore();
    }
    /**
     * Render FPS graph
     */
    renderFPSGraph() {
        if (!this.ctx || this.fpsHistory.length === 0)
            return;
        const ctx = this.ctx;
        const graphWidth = 200;
        const graphHeight = 60;
        if (!this.canvas)
            return;
        const x = this.canvas.width - graphWidth - 10;
        const y = 10;
        // Draw background
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, graphWidth, graphHeight);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, graphWidth, graphHeight);
        // Find min/max values
        const maxFPS = Math.max(...this.fpsHistory);
        const minFPS = Math.min(...this.fpsHistory);
        const range = maxFPS - minFPS || 1;
        // Draw FPS line
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.fpsHistory.forEach((fps, index) => {
            const graphX = x + (index / this.fpsHistory.length) * graphWidth;
            const graphY = y + graphHeight - ((fps - minFPS) / range) * graphHeight;
            if (index === 0) {
                ctx.moveTo(graphX, graphY);
            }
            else {
                ctx.lineTo(graphX, graphY);
            }
        });
        ctx.stroke();
        // Draw target FPS line (60 FPS)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const targetY = y + graphHeight - ((60 - minFPS) / range) * graphHeight;
        ctx.moveTo(x, targetY);
        ctx.lineTo(x + graphWidth, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        // Draw labels
        ctx.fillStyle = '#00ff00';
        ctx.font = '10px monospace';
        ctx.fillText(`FPS: ${this.fpsHistory[this.fpsHistory.length - 1]?.toFixed(0) || 0}`, x + 5, y + 5);
        ctx.fillStyle = '#ff0000';
        ctx.fillText('60', x + graphWidth - 20, targetY - 10);
        ctx.restore();
    }
    /**
     * Setup keyboard bindings
     */
    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    /**
     * Get debug overlay state
     */
    isDebugEnabled() {
        return this._isEnabled;
    }
    isDebugVisible() {
        return this.isVisible;
    }
    /**
     * Get current debug info
     */
    getDebugInfo() {
        return this.debugInfo;
    }
    /**
     * Get FPS statistics
     */
    getFPSStats() {
        if (this.fpsHistory.length === 0) {
            return { current: 0, average: 0, min: 0, max: 0 };
        }
        const current = this.fpsHistory[this.fpsHistory.length - 1] || 0;
        const average = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
        const min = Math.min(...this.fpsHistory);
        const max = Math.max(...this.fpsHistory);
        return { current, average, min, max };
    }
    /**
     * Get frame time statistics
     */
    getFrameTimeStats() {
        if (this.frameTimeHistory.length === 0) {
            return { current: 0, average: 0, min: 0, max: 0 };
        }
        const current = this.frameTimeHistory[this.frameTimeHistory.length - 1] || 0;
        const average = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
        const min = Math.min(...this.frameTimeHistory);
        const max = Math.max(...this.frameTimeHistory);
        return { current, average, min, max };
    }
}
//# sourceMappingURL=DebugOverlay.js.map