import { LevelCanvas } from './LevelCanvas.js';
import { TilePalette } from './TilePalette.js';
import { EntityPalette } from './EntityPalette.js';
import { Inspector } from './Inspector.js';
import { LinkTool } from './LinkTool.js';
import { ExportManager } from './ExportManager.js';
import { ImportManager } from './ImportManager.js';
import { PlaytestBridge } from './PlaytestBridge.js';

export interface EntityData {
    id: string;
    type: string;
    x: number;
    y: number;
    props: Record<string, any>;
}

export interface LevelData {
    id: string;
    name: string;
    width: number;
    height: number;
    tiles: string[][];
    entities: EntityData[];
    links: Array<{ from: string; to: string; type: string }>;
}

export interface GamePack {
    id: string;
    name: string;
    version: string;
    levels: LevelData[];
    metadata: Record<string, any>;
}

export class EditorApp {
    private canvas!: LevelCanvas;
    private tilePalette!: TilePalette;
    private entityPalette!: EntityPalette;
    private inspector!: Inspector;
    private linkTool!: LinkTool;
    private exportManager!: ExportManager;
    private importManager!: ImportManager;
    private playtestBridge!: PlaytestBridge;
    
    private currentLevel!: LevelData;
    private selectedTool: string = 'select';
    private selectedEntity: EntityData | null = null;
    private isInitialized: boolean = false;

    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.createDefaultLevel();
        this.isInitialized = true;
    }

    private initializeComponents(): void {
        // Initialize canvas - try both possible IDs
        let canvasElement = document.getElementById('editorCanvas') as HTMLCanvasElement;
        if (!canvasElement) {
            canvasElement = document.getElementById('levelCanvas') as HTMLCanvasElement;
        }
        if (!canvasElement) {
            throw new Error('Editor canvas not found. Expected element with ID "editorCanvas" or "levelCanvas"');
        }
        this.canvas = new LevelCanvas(canvasElement);

        // Initialize palettes
        this.tilePalette = new TilePalette();
        this.entityPalette = new EntityPalette();

        // Initialize tools
        this.inspector = new Inspector();
        this.linkTool = new LinkTool();
        this.exportManager = new ExportManager();
        this.importManager = new ImportManager();
        this.playtestBridge = new PlaytestBridge();
    }

    private setupEventListeners(): void {
        // Tool selection - handle both data-tool and class-based selectors
        document.querySelectorAll('[data-tool], .tool-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = (e.target as HTMLElement).getAttribute('data-tool') || 
                            (e.target as HTMLElement).getAttribute('data-mode');
                if (tool) {
                    this.selectTool(tool);
                }
            });
        });

        // Sidebar tabs - handle multiple tab systems
        document.querySelectorAll('.sidebar-tab, .tab-btn, .mode-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = (e.target as HTMLElement).getAttribute('data-tab') ||
                               (e.target as HTMLElement).getAttribute('data-mode');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Tile palette - handle both data-tile and palette-item selectors
        document.querySelectorAll('[data-tile], .palette-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tile = (e.target as HTMLElement).getAttribute('data-tile') ||
                            (e.target as HTMLElement).textContent?.trim().toLowerCase();
                if (tile) {
                    this.selectTile(tile);
                }
            });
        });

        // Entity palette - handle both data-entity and entity-item selectors
        document.querySelectorAll('[data-entity], .entity-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const entity = (e.target as HTMLElement).getAttribute('data-entity') ||
                              (e.target as HTMLElement).textContent?.trim().toLowerCase();
                if (entity) {
                    this.selectEntity(entity);
                }
            });
        });

        // Toolbar buttons - handle multiple button selectors
        const importBtn = document.getElementById('importBtn');
        const exportBtn = document.getElementById('exportBtn');
        const playtestBtn = document.getElementById('playtestBtn');
        const saveBtn = document.getElementById('saveBtn');
        const loadBtn = document.getElementById('loadBtn');

        importBtn?.addEventListener('click', () => this.importLevel());
        exportBtn?.addEventListener('click', () => this.exportLevel());
        playtestBtn?.addEventListener('click', () => this.playtest());
        saveBtn?.addEventListener('click', () => this.saveLevel());
        loadBtn?.addEventListener('click', () => this.loadLevelFromFile());

        // Zoom controls - handle multiple zoom button selectors
        const zoomInBtn = document.getElementById('zoomIn') || document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOut') || document.getElementById('zoomOutBtn');
        const zoomResetBtn = document.getElementById('zoomReset') || document.getElementById('zoomResetBtn');
        const resetCameraBtn = document.getElementById('resetCameraBtn');

        zoomInBtn?.addEventListener('click', () => this.canvas.zoomIn());
        zoomOutBtn?.addEventListener('click', () => this.canvas.zoomOut());
        zoomResetBtn?.addEventListener('click', () => this.canvas.zoomReset());
        resetCameraBtn?.addEventListener('click', () => this.canvas.zoomReset());

        // Playtest controls
        document.getElementById('closePlaytest')?.addEventListener('click', () => this.closePlaytest());

        // Import file input
        const importFile = document.getElementById('importFile') as HTMLInputElement;
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    this.importManager.importFile(file).then((levelData: LevelData) => {
                        this.loadLevel(levelData);
                    }).catch((error: unknown) => {
                        console.error('Import failed:', error);
                        this.updateStatus('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    });
                }
            });
        }

        // Canvas events
        this.canvas.onTileClick = (x: number, y: number) => this.handleTileClick(x, y);
        this.canvas.onEntityClick = (entity: EntityData) => this.handleEntityClick(entity);
        this.canvas.onEntityPlace = (x: number, y: number) => this.handleEntityPlace(x, y);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window resize
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    private createDefaultLevel(): void {
        this.currentLevel = {
            id: 'level-1',
            name: 'Level 1',
            width: 50,
            height: 30,
            tiles: Array(30).fill(null).map(() => Array(50).fill('empty')),
            entities: [],
            links: []
        };

        // Add some default ground tiles
        for (let x = 0; x < 50; x++) {
            this.currentLevel.tiles[29][x] = 'ground';
        }

        this.canvas.loadLevel(this.currentLevel);
        this.updateStatus('Default level created');
    }

    private selectTool(tool: string): void {
        this.selectedTool = tool;
        
        // Update UI
        document.querySelectorAll('[data-tool]').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');

        // Update canvas cursor
        this.canvas.setTool(tool);

        this.updateStatus(`Tool selected: ${tool}`);
    }

    private switchTab(tabName: string): void {
        // Update tab buttons
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`)?.classList.add('active');
    }

    private selectTile(tile: string): void {
        this.tilePalette.selectTile(tile);
        this.selectTool('paint');
        
        // Update UI
        document.querySelectorAll('[data-tile]').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-tile="${tile}"]`)?.classList.add('selected');

        this.updateStatus(`Tile selected: ${tile}`);
    }

    private selectEntity(entity: string): void {
        this.entityPalette.selectEntity(entity);
        this.selectTool('entity');
        
        // Update UI
        document.querySelectorAll('[data-entity]').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-entity="${entity}"]`)?.classList.add('selected');

        this.updateStatus(`Entity selected: ${entity}`);
    }

    private handleTileClick(x: number, y: number): void {
        switch (this.selectedTool) {
            case 'paint':
                this.paintTile(x, y);
                break;
            case 'erase':
                this.eraseTile(x, y);
                break;
            case 'select':
                this.selectTileAt(x, y);
                break;
        }
    }

    private handleEntityClick(entity: EntityData): void {
        this.selectedEntity = entity;
        this.inspector.loadEntity(entity);
        this.switchTab('inspector');
        this.updateStatus(`Entity selected: ${entity.type}`);
    }

    private handleEntityPlace(x: number, y: number): void {
        if (this.selectedTool === 'entity' && this.entityPalette.getSelectedEntity()) {
            const entityType = this.entityPalette.getSelectedEntity();
            const entity: EntityData = {
                id: this.generateId(),
                type: entityType,
                x: x,
                y: y,
                props: this.getDefaultProps(entityType)
            };

            this.currentLevel.entities.push(entity);
            this.canvas.addEntity(entity);
            this.updateStatus(`Entity placed: ${entityType}`);
        }
    }

    private paintTile(x: number, y: number): void {
        const selectedTile = this.tilePalette.getSelectedTile();
        if (selectedTile && selectedTile !== 'empty') {
            this.currentLevel.tiles[y][x] = selectedTile;
            this.canvas.setTile(x, y, selectedTile);
            this.updateStatus(`Tile painted: ${selectedTile} at (${x}, ${y})`);
        }
    }

    private eraseTile(x: number, y: number): void {
        this.currentLevel.tiles[y][x] = 'empty';
        this.canvas.setTile(x, y, 'empty');
        this.updateStatus(`Tile erased at (${x}, ${y})`);
    }

    private selectTileAt(x: number, y: number): void {
        const tile = this.currentLevel.tiles[y][x];
        if (tile && tile !== 'empty') {
            this.selectTile(tile);
        }
    }

    private getDefaultProps(entityType: string): Record<string, any> {
        const defaults: Record<string, Record<string, any>> = {
            guard: {
                ai: 'patrol',
                speed: 50,
                health: 100,
                damage: 20
            },
            potion: {
                type: 'health',
                value: 50
            },
            sword: {
                damage: 30,
                durability: 100
            },
            teleporter: {
                targetId: '',
                oneWay: false
            },
            crusher: {
                speed: 1,
                damage: 100,
                delay: 2000
            },
            pressurePlate: {
                targetId: '',
                oneTime: false
            },
            gate: {
                locked: false,
                keyId: ''
            },
            looseTile: {
                fragile: true,
                fallDelay: 1000
            },
            chopper: {
                speed: 2,
                damage: 50,
                range: 32
            },
            region: {
                type: 'checkpoint',
                message: ''
            }
        };

        return defaults[entityType] || {};
    }

    private generateId(): string {
        return 'entity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private importLevel(): void {
        const fileInput = document.getElementById('importFile') as HTMLInputElement;
        fileInput.click();
    }

    private exportLevel(): void {
        try {
            const gamePack: GamePack = {
                id: 'editor-pack',
                name: 'Editor Created Pack',
                version: '1.0.0',
                levels: [this.currentLevel],
                metadata: {
                    created: new Date().toISOString(),
                    editor: 'PrinceTS Visual Game Maker'
                }
            };

            this.exportManager.exportPack(gamePack);
            this.updateStatus('Level exported successfully');
        } catch (error: unknown) {
            console.error('Export failed:', error);
            this.updateStatus('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private playtest(): void {
        try {
            const gamePack: GamePack = {
                id: 'playtest-pack',
                name: 'Playtest Pack',
                version: '1.0.0',
                levels: [this.currentLevel],
                metadata: {
                    created: new Date().toISOString(),
                    editor: 'PrinceTS Visual Game Maker'
                }
            };

            this.playtestBridge.startPlaytest(gamePack);
            this.updateStatus('Playtest started');
        } catch (error: unknown) {
            console.error('Playtest failed:', error);
            this.updateStatus('Playtest failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private closePlaytest(): void {
        this.playtestBridge.stopPlaytest();
        this.updateStatus('Playtest closed');
    }

    private loadLevel(levelData: LevelData): void {
        this.currentLevel = levelData;
        this.canvas.loadLevel(levelData);
        this.updateStatus(`Level loaded: ${levelData.name}`);
    }

    private updateStatus(message: string): void {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Editor Status:', message);
    }

    private saveLevel(): void {
        try {
            const dataStr = JSON.stringify(this.currentLevel, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${this.currentLevel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.updateStatus('Level saved successfully');
        } catch (error: unknown) {
            console.error('Failed to save level:', error);
            this.updateStatus('Save failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private loadLevelFromFile(): void {
        const fileInput = document.getElementById('importFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    private handleKeyboardShortcuts(e: KeyboardEvent): void {
        // Prevent default behavior for editor shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.saveLevel();
                    break;
                case 'o':
                    e.preventDefault();
                    this.loadLevelFromFile();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportLevel();
                    break;
                case 'p':
                    e.preventDefault();
                    this.playtest();
                    break;
            }
        }

        // Tool shortcuts
        switch (e.key.toLowerCase()) {
            case '1':
                this.selectTool('select');
                break;
            case '2':
                this.selectTool('paint');
                break;
            case '3':
                this.selectTool('entity');
                break;
            case '4':
                this.selectTool('link');
                break;
            case '5':
                this.selectTool('erase');
                break;
            case 'escape':
                this.selectTool('select');
                break;
        }
    }

    private handleWindowResize(): void {
        // Update canvas size if needed
        if (this.canvas) {
            this.canvas.render();
        }
    }

    public getCurrentLevel(): LevelData {
        return this.currentLevel;
    }

    public getSelectedEntity(): EntityData | null {
        return this.selectedEntity;
    }

    public updateEntity(entity: EntityData): void {
        const index = this.currentLevel.entities.findIndex(e => e.id === entity.id);
        if (index !== -1) {
            this.currentLevel.entities[index] = entity;
            this.canvas.updateEntity(entity);
            this.updateStatus(`Entity updated: ${entity.type}`);
        }
    }

    public deleteEntity(entityId: string): void {
        this.currentLevel.entities = this.currentLevel.entities.filter(e => e.id !== entityId);
        this.canvas.removeEntity(entityId);
        if (this.selectedEntity?.id === entityId) {
            this.selectedEntity = null;
            this.inspector.clear();
        }
        this.updateStatus('Entity deleted');
    }
} 