import { LevelCanvas } from './LevelCanvas.js';
import { TilePalette } from './TilePalette.js';
import { EntityPalette } from './EntityPalette.js';
import { Inspector } from './Inspector.js';
import { LinkTool } from './LinkTool.js';
import { ExportManager } from './ExportManager.js';
import { ImportManager } from './ImportManager.js';
import { PlaytestBridge } from './PlaytestBridge.js';
export class EditorApp {
    constructor() {
        this.selectedTool = 'select';
        this.selectedEntity = null;
        this.isInitialized = false;
        this.initializeComponents();
        this.setupEventListeners();
        this.createDefaultLevel();
        this.isInitialized = true;
    }
    initializeComponents() {
        // Initialize canvas
        const canvasElement = document.getElementById('editorCanvas');
        if (!canvasElement) {
            throw new Error('Editor canvas not found');
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
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('[data-tool]').forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = e.target.getAttribute('data-tool');
                if (tool) {
                    this.selectTool(tool);
                }
            });
        });
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
        // Tile palette
        document.querySelectorAll('[data-tile]').forEach(item => {
            item.addEventListener('click', (e) => {
                const tile = e.target.getAttribute('data-tile');
                if (tile) {
                    this.selectTile(tile);
                }
            });
        });
        // Entity palette
        document.querySelectorAll('[data-entity]').forEach(item => {
            item.addEventListener('click', (e) => {
                const entity = e.target.getAttribute('data-entity');
                if (entity) {
                    this.selectEntity(entity);
                }
            });
        });
        // Toolbar buttons
        document.getElementById('importBtn')?.addEventListener('click', () => this.importLevel());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportLevel());
        document.getElementById('playtestBtn')?.addEventListener('click', () => this.playtest());
        // Zoom controls
        document.getElementById('zoomIn')?.addEventListener('click', () => this.canvas.zoomIn());
        document.getElementById('zoomOut')?.addEventListener('click', () => this.canvas.zoomOut());
        document.getElementById('zoomReset')?.addEventListener('click', () => this.canvas.zoomReset());
        // Playtest controls
        document.getElementById('closePlaytest')?.addEventListener('click', () => this.closePlaytest());
        // Import file input
        document.getElementById('importFile')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) {
                this.importManager.importFile(file).then((levelData) => {
                    this.loadLevel(levelData);
                }).catch((error) => {
                    console.error('Import failed:', error);
                    this.updateStatus('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                });
            }
        });
        // Canvas events
        this.canvas.onTileClick = (x, y) => this.handleTileClick(x, y);
        this.canvas.onEntityClick = (entity) => this.handleEntityClick(entity);
        this.canvas.onEntityPlace = (x, y) => this.handleEntityPlace(x, y);
    }
    createDefaultLevel() {
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
    selectTool(tool) {
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
    switchTab(tabName) {
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
    selectTile(tile) {
        this.tilePalette.selectTile(tile);
        this.selectTool('paint');
        // Update UI
        document.querySelectorAll('[data-tile]').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-tile="${tile}"]`)?.classList.add('selected');
        this.updateStatus(`Tile selected: ${tile}`);
    }
    selectEntity(entity) {
        this.entityPalette.selectEntity(entity);
        this.selectTool('entity');
        // Update UI
        document.querySelectorAll('[data-entity]').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-entity="${entity}"]`)?.classList.add('selected');
        this.updateStatus(`Entity selected: ${entity}`);
    }
    handleTileClick(x, y) {
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
    handleEntityClick(entity) {
        this.selectedEntity = entity;
        this.inspector.loadEntity(entity);
        this.switchTab('inspector');
        this.updateStatus(`Entity selected: ${entity.type}`);
    }
    handleEntityPlace(x, y) {
        if (this.selectedTool === 'entity' && this.entityPalette.getSelectedEntity()) {
            const entityType = this.entityPalette.getSelectedEntity();
            const entity = {
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
    paintTile(x, y) {
        const selectedTile = this.tilePalette.getSelectedTile();
        if (selectedTile && selectedTile !== 'empty') {
            this.currentLevel.tiles[y][x] = selectedTile;
            this.canvas.setTile(x, y, selectedTile);
            this.updateStatus(`Tile painted: ${selectedTile} at (${x}, ${y})`);
        }
    }
    eraseTile(x, y) {
        this.currentLevel.tiles[y][x] = 'empty';
        this.canvas.setTile(x, y, 'empty');
        this.updateStatus(`Tile erased at (${x}, ${y})`);
    }
    selectTileAt(x, y) {
        const tile = this.currentLevel.tiles[y][x];
        if (tile && tile !== 'empty') {
            this.selectTile(tile);
        }
    }
    getDefaultProps(entityType) {
        const defaults = {
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
    generateId() {
        return 'entity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    importLevel() {
        const fileInput = document.getElementById('importFile');
        fileInput.click();
    }
    exportLevel() {
        try {
            const gamePack = {
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
        }
        catch (error) {
            console.error('Export failed:', error);
            this.updateStatus('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    playtest() {
        try {
            const gamePack = {
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
        }
        catch (error) {
            console.error('Playtest failed:', error);
            this.updateStatus('Playtest failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    closePlaytest() {
        this.playtestBridge.stopPlaytest();
        this.updateStatus('Playtest closed');
    }
    loadLevel(levelData) {
        this.currentLevel = levelData;
        this.canvas.loadLevel(levelData);
        this.updateStatus(`Level loaded: ${levelData.name}`);
    }
    updateStatus(message) {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Editor Status:', message);
    }
    getCurrentLevel() {
        return this.currentLevel;
    }
    getSelectedEntity() {
        return this.selectedEntity;
    }
    updateEntity(entity) {
        const index = this.currentLevel.entities.findIndex(e => e.id === entity.id);
        if (index !== -1) {
            this.currentLevel.entities[index] = entity;
            this.canvas.updateEntity(entity);
            this.updateStatus(`Entity updated: ${entity.type}`);
        }
    }
    deleteEntity(entityId) {
        this.currentLevel.entities = this.currentLevel.entities.filter(e => e.id !== entityId);
        this.canvas.removeEntity(entityId);
        if (this.selectedEntity?.id === entityId) {
            this.selectedEntity = null;
            this.inspector.clear();
        }
        this.updateStatus('Entity deleted');
    }
}
//# sourceMappingURL=EditorApp.js.map