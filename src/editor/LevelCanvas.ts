import { EntityData, LevelData } from './EditorApp.js';

export class LevelCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private level: LevelData | null = null;
    
    private gridSize: number = 32;
    private zoom: number = 1;
    private panX: number = 0;
    private panY: number = 0;
    private isDragging: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    
    private currentTool: string = 'select';
    private selectedTile: string = 'ground';
    private selectedEntity: string = '';
    
    // Event callbacks
    public onTileClick: ((x: number, y: number) => void) | null = null;
    public onEntityClick: ((entity: EntityData) => void) | null = null;
    public onEntityPlace: ((x: number, y: number) => void) | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }

    private setupCanvas(): void {
        // Set canvas size to fill container
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
        
        // Set up rendering context
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
    }

    private setupEventListeners(): void {
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

    private handleMouseDown(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.lastMouseX = x;
        this.lastMouseY = y;
        
        if (e.button === 0) { // Left click
            this.handleLeftClick(x, y);
        } else if (e.button === 1) { // Middle click
            this.isDragging = true;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    private handleMouseMove(e: MouseEvent): void {
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
        } else {
            // Update cursor based on tool and position
            this.updateCursor(x, y);
        }
    }

    private handleMouseUp(e: MouseEvent): void {
        e.preventDefault();
        
        if (e.button === 1) { // Middle click
            this.isDragging = false;
            this.canvas.style.cursor = 'crosshair';
        }
    }

    private handleWheel(e: WheelEvent): void {
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

    private handleTouchStart(e: TouchEvent): void {
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

    private handleTouchMove(e: TouchEvent): void {
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

    private handleTouchEnd(e: TouchEvent): void {
        e.preventDefault();
    }

    private handleResize(): void {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.render();
        }
    }

    private handleLeftClick(x: number, y: number): void {
        const gridPos = this.screenToGrid(x, y);
        
        if (gridPos) {
            if (this.currentTool === 'entity' && this.selectedEntity) {
                this.onEntityPlace?.(gridPos.x, gridPos.y);
            } else {
                this.onTileClick?.(gridPos.x, gridPos.y);
            }
        }
    }

    private updateCursor(x: number, y: number): void {
        const gridPos = this.screenToGrid(x, y);
        
        if (gridPos) {
            if (this.currentTool === 'entity') {
                this.canvas.style.cursor = 'crosshair';
            } else if (this.currentTool === 'paint') {
                this.canvas.style.cursor = 'crosshair';
            } else if (this.currentTool === 'erase') {
                this.canvas.style.cursor = 'crosshair';
            } else {
                this.canvas.style.cursor = 'default';
            }
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    private screenToGrid(screenX: number, screenY: number): { x: number; y: number } | null {
        if (!this.level) return null;
        
        const gridX = Math.floor((screenX - this.panX) / (this.gridSize * this.zoom));
        const gridY = Math.floor((screenY - this.panY) / (this.gridSize * this.zoom));
        
        if (gridX >= 0 && gridX < this.level.width && gridY >= 0 && gridY < this.level.height) {
            return { x: gridX, y: gridY };
        }
        
        return null;
    }

    private gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * this.gridSize * this.zoom + this.panX,
            y: gridY * this.gridSize * this.zoom + this.panY
        };
    }

    public render(): void {
        if (!this.level) return;
        
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

    private drawTile(x: number, y: number): void {
        if (!this.level) return;
        
        const tile = this.level.tiles[y][x];
        if (!tile || tile === 'empty') return;
        
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

    private drawEntity(entity: EntityData): void {
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
        this.ctx.fillText(
            this.getEntityIcon(entity.type),
            screenPos.x + size / 2,
            screenPos.y + size / 2
        );
        
        // Draw entity border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenPos.x, screenPos.y, size, size);
    }

    private drawGrid(startX: number, endX: number, startY: number, endY: number): void {
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

    private drawSelectionOverlay(): void {
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

    private getMousePosition(): { x: number; y: number } | null {
        // This would be updated by mouse move events
        return null;
    }

    private getTileColor(tile: string): string {
        const colors: Record<string, string> = {
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

    private getEntityColor(entityType: string): string {
        const colors: Record<string, string> = {
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

    private getEntityIcon(entityType: string): string {
        const icons: Record<string, string> = {
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

    public loadLevel(level: LevelData): void {
        this.level = level;
        this.render();
    }

    public setTile(x: number, y: number, tile: string): void {
        if (this.level && x >= 0 && x < this.level.width && y >= 0 && y < this.level.height) {
            this.level.tiles[y][x] = tile;
            this.render();
        }
    }

    public addEntity(entity: EntityData): void {
        if (this.level) {
            this.level.entities.push(entity);
            this.render();
        }
    }

    public updateEntity(entity: EntityData): void {
        if (this.level) {
            const index = this.level.entities.findIndex(e => e.id === entity.id);
            if (index !== -1) {
                this.level.entities[index] = entity;
                this.render();
            }
        }
    }

    public removeEntity(entityId: string): void {
        if (this.level) {
            this.level.entities = this.level.entities.filter(e => e.id !== entityId);
            this.render();
        }
    }

    public setTool(tool: string): void {
        this.currentTool = tool;
    }

    public setSelectedTile(tile: string): void {
        this.selectedTile = tile;
    }

    public setSelectedEntity(entity: string): void {
        this.selectedEntity = entity;
    }

    public zoomIn(): void {
        this.zoom = Math.min(4, this.zoom * 1.2);
        this.render();
    }

    public zoomOut(): void {
        this.zoom = Math.max(0.25, this.zoom / 1.2);
        this.render();
    }

    public zoomReset(): void {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.render();
    }

    public getZoom(): number {
        return this.zoom;
    }

    public getGridSize(): number {
        return this.gridSize;
    }
} 