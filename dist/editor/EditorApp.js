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
        // Initialize canvas - try both possible IDs
        let canvasElement = document.getElementById('editorCanvas');
        if (!canvasElement) {
            canvasElement = document.getElementById('levelCanvas');
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
    setupEventListeners() {
        // Tool selection - handle both data-tool and class-based selectors
        document.querySelectorAll('[data-tool], .tool-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = e.target.getAttribute('data-tool') ||
                    e.target.getAttribute('data-mode');
                if (tool) {
                    this.selectTool(tool);
                }
            });
        });
        // Sidebar tabs - handle multiple tab systems
        document.querySelectorAll('.sidebar-tab, .tab-btn, .mode-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab') ||
                    e.target.getAttribute('data-mode');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
        // Tile palette - handle both data-tile and palette-item selectors
        document.querySelectorAll('[data-tile], .palette-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tile = e.target.getAttribute('data-tile') ||
                    e.target.textContent?.trim().toLowerCase();
                if (tile) {
                    this.selectTile(tile);
                }
            });
        });
        // Entity palette - handle both data-entity and entity-item selectors
        document.querySelectorAll('[data-entity], .entity-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const entity = e.target.getAttribute('data-entity') ||
                    e.target.textContent?.trim().toLowerCase();
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
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
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
        }
        // Canvas events
        this.canvas.onTileClick = (x, y) => this.handleTileClick(x, y);
        this.canvas.onEntityClick = (entity) => this.handleEntityClick(entity);
        this.canvas.onEntityPlace = (x, y) => this.handleEntityPlace(x, y);
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        // Window resize
        window.addEventListener('resize', () => this.handleWindowResize());
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
    saveLevel() {
        try {
            const dataStr = JSON.stringify(this.currentLevel, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${this.currentLevel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
            this.updateStatus('Level saved successfully');
        }
        catch (error) {
            console.error('Failed to save level:', error);
            this.updateStatus('Save failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    loadLevelFromFile() {
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.click();
        }
    }
    handleKeyboardShortcuts(e) {
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
    handleWindowResize() {
        // Update canvas size if needed
        if (this.canvas) {
            this.canvas.render();
        }
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