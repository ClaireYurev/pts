export class LevelCanvas {
    constructor(canvas, width, height) {
        this.tileWidth = 32;
        this.tileHeight = 32;
        this.entities = [];
        this.cameraX = 0;
        this.cameraY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        // Calculate grid dimensions
        const cols = Math.floor(width / this.tileWidth);
        const rows = Math.floor(height / this.tileHeight);
        this.grid = Array(rows).fill(0).map(() => Array(cols).fill(0));
        this.setupEventListeners();
        this.drawGrid();
    }
    setupEventListeners() {
        // Camera panning with middle mouse button
        this.canvas.addEventListener("mousedown", (e) => {
            if (e.button === 1) { // Middle mouse button
                e.preventDefault();
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            }
        });
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                this.cameraX += deltaX;
                this.cameraY += deltaY;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.redraw();
            }
        });
        this.canvas.addEventListener("mouseup", (e) => {
            if (e.button === 1) {
                this.isDragging = false;
                this.canvas.style.cursor = 'default';
            }
        });
        // Zoom with mouse wheel
        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoomFactor, e.offsetX, e.offsetY);
        });
    }
    zoom(factor, centerX, centerY) {
        // TODO: Implement zoom functionality
        console.log('Zoom:', factor, 'at', centerX, centerY);
    }
    drawGrid() {
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        const cols = this.grid[0].length;
        const rows = this.grid.length;
        // Draw grid lines
        this.ctx.strokeStyle = "#ccc";
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.tileWidth, 0);
            this.ctx.lineTo(x * this.tileWidth, rows * this.tileHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.tileHeight);
            this.ctx.lineTo(cols * this.tileWidth, y * this.tileHeight);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    drawTiles() {
        if (!this.tilesetImage)
            return;
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        const cols = this.grid[0].length;
        const rows = this.grid.length;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tileId = this.grid[y][x];
                if (tileId > 0) {
                    // Calculate source rectangle in tileset
                    const tilesPerRow = Math.floor(this.tilesetImage.width / this.tileWidth);
                    const sourceX = (tileId - 1) % tilesPerRow * this.tileWidth;
                    const sourceY = Math.floor((tileId - 1) / tilesPerRow) * this.tileHeight;
                    this.ctx.drawImage(this.tilesetImage, sourceX, sourceY, this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
                }
            }
        }
        this.ctx.restore();
    }
    drawEntities() {
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        this.entities.forEach(entity => {
            // Draw entity placeholder (colored rectangle)
            const colors = {
                'Player': '#00FF00',
                'Enemy': '#FF0000',
                'Trap': '#FFA500',
                'Collectible': '#FFFF00',
                'NPC': '#0000FF'
            };
            this.ctx.fillStyle = colors[entity.type] || '#888888';
            this.ctx.fillRect(entity.x, entity.y, this.tileWidth, this.tileHeight);
            // Draw entity label
            this.ctx.fillStyle = '#000';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(entity.type, entity.x + this.tileWidth / 2, entity.y + this.tileHeight / 2 + 3);
        });
        this.ctx.restore();
    }
    drawTriggers(triggers) {
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        triggers.forEach(trigger => {
            // Draw trigger as semi-transparent overlay
            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
            this.ctx.fillRect(trigger.x, trigger.y, trigger.width, trigger.height);
            // Draw trigger border
            this.ctx.strokeStyle = '#FF00FF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(trigger.x, trigger.y, trigger.width, trigger.height);
            // Draw trigger label
            this.ctx.fillStyle = '#FF00FF';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(trigger.type, trigger.x + trigger.width / 2, trigger.y + trigger.height / 2 + 3);
        });
        this.ctx.restore();
    }
    placeTile(x, y, tileId) {
        const tx = Math.floor((x + this.cameraX) / this.tileWidth);
        const ty = Math.floor((y + this.cameraY) / this.tileHeight);
        if (ty >= 0 && ty < this.grid.length && tx >= 0 && tx < this.grid[0].length) {
            this.grid[ty][tx] = tileId;
            this.redraw();
        }
    }
    placeEntity(x, y, entityType) {
        const gridX = Math.floor((x + this.cameraX) / this.tileWidth) * this.tileWidth;
        const gridY = Math.floor((y + this.cameraY) / this.tileHeight) * this.tileHeight;
        const entity = {
            x: gridX,
            y: gridY,
            type: entityType
        };
        this.entities.push(entity);
        this.redraw();
    }
    removeEntity(x, y) {
        const gridX = Math.floor((x + this.cameraX) / this.tileWidth) * this.tileWidth;
        const gridY = Math.floor((y + this.cameraY) / this.tileHeight) * this.tileHeight;
        this.entities = this.entities.filter(entity => entity.x !== gridX || entity.y !== gridY);
        this.redraw();
    }
    redraw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw in order: tiles, entities, triggers, grid
        this.drawTiles();
        this.drawEntities();
        this.drawGrid();
    }
    setTileset(image) {
        this.tilesetImage = image;
        this.redraw();
    }
    getGrid() {
        return this.grid.map(row => [...row]); // Return copy
    }
    setGrid(grid) {
        this.grid = grid.map(row => [...row]); // Store copy
        this.redraw();
    }
    getEntities() {
        return this.entities.map(entity => ({ ...entity })); // Return copy
    }
    setEntities(entities) {
        this.entities = entities.map(entity => ({ ...entity })); // Store copy
    }
    getCanvas() {
        return this.canvas;
    }
    getTileSize() {
        return { width: this.tileWidth, height: this.tileHeight };
    }
    setTileSize(width, height) {
        this.tileWidth = width;
        this.tileHeight = height;
        this.redraw();
    }
    getCamera() {
        return { x: this.cameraX, y: this.cameraY };
    }
    setCamera(x, y) {
        this.cameraX = x;
        this.cameraY = y;
        this.redraw();
    }
    resetCamera() {
        this.cameraX = 0;
        this.cameraY = 0;
        this.redraw();
    }
}
//# sourceMappingURL=LevelCanvas.js.map