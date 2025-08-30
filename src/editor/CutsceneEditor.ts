export interface CutsceneItem {
    id: string;
    time: number;
    track: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
    action: string;
    args: Record<string, any>;
    duration?: number;
}

export interface CutsceneTrack {
    id: string;
    name: string;
    type: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
    color: string;
    items: CutsceneItem[];
}

export interface Cutscene {
    id: string;
    name: string;
    duration: number;
    tracks: CutsceneTrack[];
    metadata: Record<string, any>;
}

export interface TrackDefinition {
    type: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
    name: string;
    color: string;
    actions: ActionDefinition[];
}

export interface ActionDefinition {
    name: string;
    description: string;
    properties: PropertyField[];
}

export interface PropertyField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'position' | 'color';
    label: string;
    defaultValue: any;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}

export class CutsceneEditor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cutscene: Cutscene | null = null;
    
    private selectedItem: CutsceneItem | null = null;
    private draggingItem: CutsceneItem | null = null;
    private resizingItem: CutsceneItem | null = null;
    private hoveredItem: CutsceneItem | null = null;
    
    private trackDefinitions: Map<string, TrackDefinition> = new Map();
    private isDragging: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private panX: number = 0;
    private panY: number = 0;
    private zoom: number = 1;
    
    private timelineWidth: number = 800;
    private trackHeight: number = 60;
    private headerHeight: number = 40;
    private rulerHeight: number = 30;
    private trackHeaderWidth: number = 150;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        this.initializeTrackDefinitions();
        this.setupEventListeners();
        this.render();
    }

    private initializeTrackDefinitions(): void {
        // Camera track
        this.addTrackDefinition({
            type: 'camera',
            name: 'Camera',
            color: '#4CAF50',
            actions: [
                {
                    name: 'pan',
                    description: 'Pan camera to position',
                    properties: [
                        { name: 'x', type: 'number', label: 'X Position', defaultValue: 0, min: -1000, max: 1000 },
                        { name: 'y', type: 'number', label: 'Y Position', defaultValue: 0, min: -1000, max: 1000 },
                        { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 1000, min: 100, max: 10000 }
                    ]
                },
                {
                    name: 'zoom',
                    description: 'Zoom camera',
                    properties: [
                        { name: 'scale', type: 'number', label: 'Zoom Scale', defaultValue: 1, min: 0.1, max: 5, step: 0.1 },
                        { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 1000, min: 100, max: 10000 }
                    ]
                },
                {
                    name: 'shake',
                    description: 'Camera shake effect',
                    properties: [
                        { name: 'intensity', type: 'number', label: 'Intensity', defaultValue: 5, min: 1, max: 20 },
                        { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 500, min: 100, max: 3000 }
                    ]
                }
            ]
        });

        // Text track
        this.addTrackDefinition({
            type: 'text',
            name: 'Text',
            color: '#2196F3',
            actions: [
                {
                    name: 'show',
                    description: 'Show text dialog',
                    properties: [
                        { name: 'text', type: 'string', label: 'Text Content', defaultValue: '' },
                        { name: 'speaker', type: 'string', label: 'Speaker Name', defaultValue: '' },
                        { name: 'style', type: 'select', label: 'Text Style', defaultValue: 'normal', options: ['normal', 'bold', 'italic', 'title'] }
                    ]
                },
                {
                    name: 'hide',
                    description: 'Hide text dialog',
                    properties: []
                },
                {
                    name: 'typewriter',
                    description: 'Typewriter text effect',
                    properties: [
                        { name: 'text', type: 'string', label: 'Text Content', defaultValue: '' },
                        { name: 'speed', type: 'number', label: 'Type Speed (ms)', defaultValue: 50, min: 10, max: 200 }
                    ]
                }
            ]
        });

        // Sprite track
        this.addTrackDefinition({
            type: 'sprite',
            name: 'Sprite',
            color: '#FF9800',
            actions: [
                {
                    name: 'show',
                    description: 'Show sprite',
                    properties: [
                        { name: 'spriteId', type: 'string', label: 'Sprite ID', defaultValue: '' },
                        { name: 'x', type: 'number', label: 'X Position', defaultValue: 0, min: -1000, max: 1000 },
                        { name: 'y', type: 'number', label: 'Y Position', defaultValue: 0, min: -1000, max: 1000 },
                        { name: 'scale', type: 'number', label: 'Scale', defaultValue: 1, min: 0.1, max: 5, step: 0.1 }
                    ]
                },
                {
                    name: 'hide',
                    description: 'Hide sprite',
                    properties: []
                },
                {
                    name: 'move',
                    description: 'Move sprite',
                    properties: [
                        { name: 'x', type: 'number', label: 'X Position', defaultValue: 0, min: -1000, max: 1000 },
                        { name: 'y', type: 'number', label: 'Y Position', defaultValue: 0, min: -1000, max: 1000 },
                        { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 1000, min: 100, max: 10000 }
                    ]
                },
                {
                    name: 'animate',
                    description: 'Play sprite animation',
                    properties: [
                        { name: 'animationId', type: 'string', label: 'Animation ID', defaultValue: '' },
                        { name: 'loop', type: 'boolean', label: 'Loop Animation', defaultValue: false }
                    ]
                }
            ]
        });

        // Music track
        this.addTrackDefinition({
            type: 'music',
            name: 'Music',
            color: '#9C27B0',
            actions: [
                {
                    name: 'play',
                    description: 'Play music',
                    properties: [
                        { name: 'musicId', type: 'string', label: 'Music ID', defaultValue: '' },
                        { name: 'volume', type: 'number', label: 'Volume', defaultValue: 1, min: 0, max: 1, step: 0.1 },
                        { name: 'fadeIn', type: 'number', label: 'Fade In (ms)', defaultValue: 1000, min: 0, max: 5000 }
                    ]
                },
                {
                    name: 'stop',
                    description: 'Stop music',
                    properties: [
                        { name: 'fadeOut', type: 'number', label: 'Fade Out (ms)', defaultValue: 1000, min: 0, max: 5000 }
                    ]
                },
                {
                    name: 'crossfade',
                    description: 'Crossfade to new music',
                    properties: [
                        { name: 'musicId', type: 'string', label: 'Music ID', defaultValue: '' },
                        { name: 'duration', type: 'number', label: 'Crossfade Duration (ms)', defaultValue: 2000, min: 500, max: 10000 }
                    ]
                }
            ]
        });

        // Wait track
        this.addTrackDefinition({
            type: 'wait',
            name: 'Wait',
            color: '#607D8B',
            actions: [
                {
                    name: 'wait',
                    description: 'Wait for specified time',
                    properties: [
                        { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 1000, min: 100, max: 30000 }
                    ]
                },
                {
                    name: 'waitForInput',
                    description: 'Wait for player input',
                    properties: [
                        { name: 'key', type: 'select', label: 'Wait For Key', defaultValue: 'any', options: ['any', 'space', 'enter', 'escape'] }
                    ]
                }
            ]
        });
    }

    private addTrackDefinition(definition: TrackDefinition): void {
        this.trackDefinitions.set(definition.type, definition);
    }

    public getTrackDefinition(type: string): TrackDefinition | undefined {
        return this.trackDefinitions.get(type);
    }

    public getAllTrackDefinitions(): TrackDefinition[] {
        return Array.from(this.trackDefinitions.values());
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    }

    private handleMouseDown(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (e.button === 0) { // Left click
            const clickedItem = this.getItemAt(x, y);
            
            if (clickedItem) {
                this.selectedItem = clickedItem;
                this.draggingItem = clickedItem;
                this.isDragging = true;
            } else {
                this.selectedItem = null;
            }
        } else if (e.button === 1) { // Middle click
            this.isDragging = true;
        }
        
        this.render();
    }

    private handleMouseMove(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        
        if (this.isDragging && this.draggingItem) {
            const deltaX = (e.clientX - this.lastMouseX) / this.zoom;
            const deltaY = (e.clientY - this.lastMouseY) / this.zoom;
            
            // Update item time based on horizontal movement
            const timeDelta = deltaX / (this.timelineWidth / this.cutscene!.duration);
            this.draggingItem.time = Math.max(0, this.draggingItem.time + timeDelta);
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        } else if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            this.panX += deltaX;
            this.panY += deltaY;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
        
        // Update hover states
        this.hoveredItem = this.getItemAt(x, y);
        
        this.render();
    }

    private handleMouseUp(e: MouseEvent): void {
        e.preventDefault();
        
        if (e.button === 0 || e.button === 1) {
            this.isDragging = false;
            this.draggingItem = null;
        }
        
        this.render();
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.25, Math.min(4, this.zoom * zoomFactor));
        
        const zoomRatio = newZoom / this.zoom;
        this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
        this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
        
        this.zoom = newZoom;
        this.render();
    }

    private handleDoubleClick(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        
        // Open item properties dialog
        const clickedItem = this.getItemAt(x, y);
        if (clickedItem) {
            this.openItemProperties(clickedItem);
        } else {
            // Create new item at click position
            this.createItemAt(x, y);
        }
    }

    private getItemAt(x: number, y: number): CutsceneItem | null {
        if (!this.cutscene) return null;
        
        const trackIndex = Math.floor((y - this.headerHeight - this.rulerHeight) / this.trackHeight);
        if (trackIndex < 0 || trackIndex >= this.cutscene.tracks.length) return null;
        
        const track = this.cutscene.tracks[trackIndex];
        const trackY = this.headerHeight + this.rulerHeight + trackIndex * this.trackHeight;
        
        if (y < trackY || y > trackY + this.trackHeight) return null;
        if (x < this.trackHeaderWidth) return null;
        
        const timeX = x - this.trackHeaderWidth;
        const time = (timeX / (this.timelineWidth / this.cutscene.duration)) * this.cutscene.duration;
        
        // Find item at this time
        for (const item of track.items) {
            const itemX = this.trackHeaderWidth + (item.time / this.cutscene.duration) * this.timelineWidth;
            const itemWidth = item.duration ? (item.duration / this.cutscene.duration) * this.timelineWidth : 50;
            
            if (timeX >= itemX - this.trackHeaderWidth && timeX <= itemX - this.trackHeaderWidth + itemWidth) {
                return item;
            }
        }
        
        return null;
    }

    private createItemAt(x: number, y: number): void {
        if (!this.cutscene) return;
        
        const trackIndex = Math.floor((y - this.headerHeight - this.rulerHeight) / this.trackHeight);
        if (trackIndex < 0 || trackIndex >= this.cutscene.tracks.length) return;
        
        const track = this.cutscene.tracks[trackIndex];
        const timeX = x - this.trackHeaderWidth;
        const time = (timeX / (this.timelineWidth / this.cutscene.duration)) * this.cutscene.duration;
        
        const definition = this.getTrackDefinition(track.type);
        if (!definition || definition.actions.length === 0) return;
        
        const item: CutsceneItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            time: Math.max(0, time),
            track: track.type,
            action: definition.actions[0].name,
            args: {}
        };
        
        // Set default properties
        definition.actions[0].properties.forEach(prop => {
            item.args[prop.name] = prop.defaultValue;
        });
        
        track.items.push(item);
        this.render();
    }

    private openItemProperties(item: CutsceneItem): void {
        // This would open a properties dialog
        console.log('Opening properties for item:', item.id);
    }

    public loadCutscene(cutscene: Cutscene): void {
        this.cutscene = cutscene;
        this.render();
    }

    public createCutscene(name: string, duration: number = 10000): Cutscene {
        const cutscene: Cutscene = {
            id: `cutscene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            duration: duration,
            tracks: [],
            metadata: {
                created: new Date().toISOString(),
                editor: 'PrinceTS Cutscene Editor'
            }
        };
        
        // Create default tracks
        this.getAllTrackDefinitions().forEach(definition => {
            cutscene.tracks.push({
                id: `track_${definition.type}`,
                name: definition.name,
                type: definition.type,
                color: definition.color,
                items: []
            });
        });
        
        this.cutscene = cutscene;
        this.render();
        return cutscene;
    }

    public addTrack(type: string): CutsceneTrack | null {
        if (!this.cutscene) return null;
        
        const definition = this.getTrackDefinition(type);
        if (!definition) return null;
        
        const track: CutsceneTrack = {
            id: `track_${type}_${Date.now()}`,
            name: definition.name,
            type: definition.type,
            color: definition.color,
            items: []
        };
        
        this.cutscene.tracks.push(track);
        this.render();
        return track;
    }

    public removeTrack(trackId: string): void {
        if (!this.cutscene) return;
        
        this.cutscene.tracks = this.cutscene.tracks.filter(track => track.id !== trackId);
        this.render();
    }

    public addItem(trackId: string, time: number, action: string): CutsceneItem | null {
        if (!this.cutscene) return null;
        
        const track = this.cutscene.tracks.find(t => t.id === trackId);
        if (!track) return null;
        
        const definition = this.getTrackDefinition(track.type);
        if (!definition) return null;
        
        const actionDef = definition.actions.find(a => a.name === action);
        if (!actionDef) return null;
        
        const item: CutsceneItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            time: time,
            track: track.type,
            action: action,
            args: {}
        };
        
        // Set default properties
        actionDef.properties.forEach(prop => {
            item.args[prop.name] = prop.defaultValue;
        });
        
        track.items.push(item);
        this.render();
        return item;
    }

    public removeItem(itemId: string): void {
        if (!this.cutscene) return;
        
        for (const track of this.cutscene.tracks) {
            track.items = track.items.filter(item => item.id !== itemId);
        }
        
        if (this.selectedItem?.id === itemId) {
            this.selectedItem = null;
        }
        
        this.render();
    }

    public getCutscene(): Cutscene | null {
        return this.cutscene;
    }

    public exportCutscene(): string {
        if (!this.cutscene) return '';
        return JSON.stringify(this.cutscene, null, 2);
    }

    public importCutscene(json: string): void {
        try {
            const cutscene = JSON.parse(json) as Cutscene;
            this.loadCutscene(cutscene);
        } catch (error) {
            console.error('Failed to import cutscene:', error);
        }
    }

    private render(): void {
        if (!this.canvas) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply zoom and pan
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);
        
        if (this.cutscene) {
            this.drawTimeline();
            this.drawTracks();
            this.drawItems();
        }
        
        this.ctx.restore();
    }

    private drawTimeline(): void {
        // Draw header
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width / this.zoom, this.headerHeight);
        
        // Draw ruler
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, this.headerHeight, this.canvas.width / this.zoom, this.rulerHeight);
        
        // Draw time markers
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        const timeStep = this.cutscene!.duration / 10;
        for (let i = 0; i <= 10; i++) {
            const time = i * timeStep;
            const x = this.trackHeaderWidth + (time / this.cutscene!.duration) * this.timelineWidth;
            
            this.ctx.fillText(`${(time / 1000).toFixed(1)}s`, x, this.headerHeight + 20);
            
            // Draw tick mark
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.headerHeight + this.rulerHeight);
            this.ctx.lineTo(x, this.headerHeight + this.rulerHeight + 10);
            this.ctx.stroke();
        }
    }

    private drawTracks(): void {
        if (!this.cutscene) return;
        
        for (let i = 0; i < this.cutscene.tracks.length; i++) {
            const track = this.cutscene.tracks[i];
            const y = this.headerHeight + this.rulerHeight + i * this.trackHeight;
            
            // Draw track header
            this.ctx.fillStyle = track.color;
            this.ctx.fillRect(0, y, this.trackHeaderWidth, this.trackHeight);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(track.name, this.trackHeaderWidth / 2, y + this.trackHeight / 2 + 4);
            
            // Draw track background
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(this.trackHeaderWidth, y, this.timelineWidth, this.trackHeight);
            
            // Draw track border
            this.ctx.strokeStyle = '#444';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(this.trackHeaderWidth, y, this.timelineWidth, this.trackHeight);
        }
    }

    private drawItems(): void {
        if (!this.cutscene) return;
        
        for (let i = 0; i < this.cutscene.tracks.length; i++) {
            const track = this.cutscene.tracks[i];
            const trackY = this.headerHeight + this.rulerHeight + i * this.trackHeight;
            
            for (const item of track.items) {
                this.drawItem(item, track, trackY);
            }
        }
    }

    private drawItem(item: CutsceneItem, track: CutsceneTrack, trackY: number): void {
        const itemX = this.trackHeaderWidth + (item.time / this.cutscene!.duration) * this.timelineWidth;
        const itemWidth = item.duration ? (item.duration / this.cutscene!.duration) * this.timelineWidth : 50;
        
        const isSelected = this.selectedItem?.id === item.id;
        const isHovered = this.hoveredItem?.id === item.id;
        
        // Draw item background
        this.ctx.fillStyle = isSelected ? '#666' : track.color;
        this.ctx.strokeStyle = isHovered ? '#fff' : '#333';
        this.ctx.lineWidth = isSelected ? 3 : 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(itemX, trackY + 5, itemWidth, this.trackHeight - 10, 4);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw item text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(item.action, itemX + itemWidth / 2, trackY + this.trackHeight / 2 + 3);
    }
} 