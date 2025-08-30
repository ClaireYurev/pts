export class LevelCanvas {
    constructor(canvas) {
        this.level = null;
        this.gridSize = 32;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.currentTool = 'select';
        this.selectedTile = 'ground';
        this.selectedEntity = '';
        // Event callbacks
        this.onTileClick = null;
        this.onEntityClick = null;
        this.onEntityPlace = null;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }
    setupCanvas() {
        // Set canvas size to fill container
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
        // Set up rendering context
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
    }
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    handleMouseDown(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.lastMouseX = x;
        this.lastMouseY = y;
        if (e.button === 0) { // Left click
            this.handleLeftClick(x, y);
        }
        else if (e.button === 1) { // Middle click
            this.isDragging = true;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    handleMouseMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.isDragging) {
            const deltaX = x - this.lastMouseX;
            const deltaY = y - this.lastMouseY;
            this.panX += deltaX;
            this.panY += deltaY;
            this.lastMouseX = x;
            this.lastMouseY = y;
            this.render();
        }
        else {
            // Update cursor based on tool and position
            this.updateCursor(x, y);
        }
    }
    handleMouseUp(e) {
        e.preventDefault();
        if (e.button === 1) { // Middle click
            this.isDragging = false;
            this.canvas.style.cursor = 'crosshair';
        }
    }
    handleWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.25, Math.min(4, this.zoom * zoomFactor));
        // Zoom towards mouse position
        const zoomRatio = newZoom / this.zoom;
        this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
        this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
        this.zoom = newZoom;
        this.render();
    }
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.lastMouseX = x;
            this.lastMouseY = y;
            this.handleLeftClick(x, y);
        }
    }
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const deltaX = x - this.lastMouseX;
            const deltaY = y - this.lastMouseY;
            this.panX += deltaX;
            this.panY += deltaY;
            this.lastMouseX = x;
            this.lastMouseY = y;
            this.render();
        }
    }
    handleTouchEnd(e) {
        e.preventDefault();
    }
    handleResize() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.render();
        }
    }
    handleLeftClick(x, y) {
        const gridPos = this.screenToGrid(x, y);
        if (gridPos) {
            if (this.currentTool === 'entity' && this.selectedEntity) {
                this.onEntityPlace?.(gridPos.x, gridPos.y);
            }
            else {
                this.onTileClick?.(gridPos.x, gridPos.y);
            }
        }
    }
    updateCursor(x, y) {
        const gridPos = this.screenToGrid(x, y);
        if (gridPos) {
            if (this.currentTool === 'entity') {
                this.canvas.style.cursor = 'crosshair';
            }
            else if (this.currentTool === 'paint') {
                this.canvas.style.cursor = 'crosshair';
            }
            else if (this.currentTool === 'erase') {
                this.canvas.style.cursor = 'crosshair';
            }
            else {
                this.canvas.style.cursor = 'default';
            }
        }
        else {
            this.canvas.style.cursor = 'default';
        }
    }
    screenToGrid(screenX, screenY) {
        if (!this.level)
            return null;
        const gridX = Math.floor((screenX - this.panX) / (this.gridSize * this.zoom));
        const gridY = Math.floor((screenY - this.panY) / (this.gridSize * this.zoom));
        if (gridX >= 0 && gridX < this.level.width && gridY >= 0 && gridY < this.level.height) {
            return { x: gridX, y: gridY };
        }
        return null;
    }
    gridToScreen(gridX, gridY) {
        return {
            x: gridX * this.gridSize * this.zoom + this.panX,
            y: gridY * this.gridSize * this.zoom + this.panY
        };
    }
    render() {
        if (!this.level)
            return;
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Calculate visible grid range
        const startX = Math.max(0, Math.floor(-this.panX / (this.gridSize * this.zoom)));
        const endX = Math.min(this.level.width, Math.ceil((this.canvas.width - this.panX) / (this.gridSize * this.zoom)));
        const startY = Math.max(0, Math.floor(-this.panY / (this.gridSize * this.zoom)));
        const endY = Math.min(this.level.height, Math.ceil((this.canvas.height - this.panY) / (this.gridSize * this.zoom)));
        // Draw tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                this.drawTile(x, y);
            }
        }
        // Draw entities
        this.level.entities.forEach(entity => {
            this.drawEntity(entity);
        });
        // Draw grid
        this.drawGrid(startX, endX, startY, endY);
        // Draw selection overlay
        this.drawSelectionOverlay();
    }
    drawTile(x, y) {
        if (!this.level)
            return;
        const tile = this.level.tiles[y][x];
        if (!tile || tile === 'empty')
            return;
        const screenPos = this.gridToScreen(x, y);
        const size = this.gridSize * this.zoom;
        // Draw tile background
        this.ctx.fillStyle = this.getTileColor(tile);
        this.ctx.fillRect(screenPos.x, screenPos.y, size, size);
        // Draw tile border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenPos.x, screenPos.y, size, size);
    }
    drawEntity(entity) {
        const screenPos = this.gridToScreen(entity.x, entity.y);
        const size = this.gridSize * this.zoom;
        // Draw entity background
        this.ctx.fillStyle = this.getEntityColor(entity.type);
        this.ctx.fillRect(screenPos.x, screenPos.y, size, size);
        // Draw entity icon/text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${Math.max(8, size * 0.4)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.getEntityIcon(entity.type), screenPos.x + size / 2, screenPos.y + size / 2);
        // Draw entity border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenPos.x, screenPos.y, size, size);
    }
    drawGrid(startX, endX, startY, endY) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        // Draw vertical lines
        for (let x = startX; x <= endX; x++) {
            const screenX = x * this.gridSize * this.zoom + this.panX;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, 0);
            this.ctx.lineTo(screenX, this.canvas.height);
            this.ctx.stroke();
        }
        // Draw horizontal lines
        for (let y = startY; y <= endY; y++) {
            const screenY = y * this.gridSize * this.zoom + this.panY;
            this.ctx.beginPath();
            this.ctx.moveTo(0, screenY);
            this.ctx.lineTo(this.canvas.width, screenY);
            this.ctx.stroke();
        }
    }
    drawSelectionOverlay() {
        // Draw tool preview
        if (this.currentTool === 'entity' && this.selectedEntity) {
            const mousePos = this.getMousePosition();
            if (mousePos) {
                const gridPos = this.screenToGrid(mousePos.x, mousePos.y);
                if (gridPos) {
                    const screenPos = this.gridToScreen(gridPos.x, gridPos.y);
                    const size = this.gridSize * this.zoom;
                    // Draw preview
                    this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
                    this.ctx.fillRect(screenPos.x, screenPos.y, size, size);
                    this.ctx.strokeStyle = '#4CAF50';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(screenPos.x, screenPos.y, size, size);
                }
            }
        }
    }
    getMousePosition() {
        // This would be updated by mouse move events
        return null;
    }
    getTileColor(tile) {
        const colors = {
            ground: '#8B4513',
            wall: '#696969',
            platform: '#A0522D',
            spike: '#FF4500',
            water: '#4169E1',
            lava: '#DC143C',
            ice: '#87CEEB',
            grass: '#228B22'
        };
        return colors[tile] || '#666';
    }
    getEntityColor(entityType) {
        const colors = {
            guard: '#FF6B6B',
            potion: '#4ECDC4',
            sword: '#45B7D1',
            teleporter: '#96CEB4',
            crusher: '#FFEAA7',
            pressurePlate: '#DDA0DD',
            gate: '#98D8C8',
            looseTile: '#F7DC6F',
            chopper: '#BB8FCE',
            region: '#85C1E9'
        };
        return colors[entityType] || '#999';
    }
    getEntityIcon(entityType) {
        const icons = {
            guard: '🛡️',
            potion: '🧪',
            sword: '⚔️',
            teleporter: '🌀',
            crusher: '🪨',
            pressurePlate: '⚡',
            gate: '🚪',
            looseTile: '🧱',
            chopper: '🪓',
            region: '📍'
        };
        return icons[entityType] || '?';
    }
    loadLevel(level) {
        this.level = level;
        this.render();
    }
    setTile(x, y, tile) {
        if (this.level && x >= 0 && x < this.level.width && y >= 0 && y < this.level.height) {
            this.level.tiles[y][x] = tile;
            this.render();
        }
    }
    addEntity(entity) {
        if (this.level) {
            this.level.entities.push(entity);
            this.render();
        }
    }
    updateEntity(entity) {
        if (this.level) {
            const index = this.level.entities.findIndex(e => e.id === entity.id);
            if (index !== -1) {
                this.level.entities[index] = entity;
                this.render();
            }
        }
    }
    removeEntity(entityId) {
        if (this.level) {
            this.level.entities = this.level.entities.filter(e => e.id !== entityId);
            this.render();
        }
    }
    setTool(tool) {
        this.currentTool = tool;
    }
    setSelectedTile(tile) {
        this.selectedTile = tile;
    }
    setSelectedEntity(entity) {
        this.selectedEntity = entity;
    }
    zoomIn() {
        this.zoom = Math.min(4, this.zoom * 1.2);
        this.render();
    }
    zoomOut() {
        this.zoom = Math.max(0.25, this.zoom / 1.2);
        this.render();
    }
    zoomReset() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.render();
    }
    getZoom() {
        return this.zoom;
    }
    getGridSize() {
        return this.gridSize;
    }
}
//# sourceMappingURL=LevelCanvas.js.map