import { LevelCanvas } from "./LevelCanvas";
import { TilePalette } from "./TilePalette";
import { EntityPalette } from "./EntityPalette";
import { TriggerManager } from "./TriggerManager";
import { VisualScriptEditor } from "./VisualScriptEditor";
import { CutsceneTimeline } from "./CutsceneTimeline";
import { ExportManager } from "./ExportManager";
import { ImportManager } from "./ImportManager";

export class EditorApp {
  private levelCanvas: LevelCanvas;
  private tilePalette: TilePalette;
  private entityPalette: EntityPalette;
  private triggerManager: TriggerManager;
  private scriptEditor!: VisualScriptEditor;
  private cutsceneEditor!: CutsceneTimeline;
  private exportManager: ExportManager;
  private importManager: ImportManager;

  // Editor state
  private currentMode: 'tile' | 'entity' | 'trigger' = 'tile';
  private selectedTileId: number = 0;
  private selectedEntity: string = '';
  private selectedTrigger: string = '';

  constructor() {
    // Initialize canvas
    const canvas = document.getElementById("levelCanvas") as HTMLCanvasElement;
    if (!canvas) {
      throw new Error("Level canvas not found");
    }
    
    this.levelCanvas = new LevelCanvas(canvas, 800, 600);

    // Initialize palettes
    const tilePaletteContainer = document.getElementById("tilePalette");
    const entityPaletteContainer = document.getElementById("entityPalette");
    const triggerPaletteContainer = document.getElementById("triggerPalette");
    
    if (!tilePaletteContainer || !entityPaletteContainer || !triggerPaletteContainer) {
      throw new Error("Palette containers not found");
    }

    // Create sample tile images (in a real app, these would be loaded from assets)
    const tileImages = this.createSampleTileImages();
    this.tilePalette = new TilePalette(tilePaletteContainer, tileImages);
    
    this.entityPalette = new EntityPalette(entityPaletteContainer, [
      "Player", "Enemy", "Trap", "Collectible", "NPC"
    ]);

    // Initialize trigger manager
    this.triggerManager = new TriggerManager();

            // Initialize script editor
        const scriptContainer = document.getElementById("scriptEditor");
        if (scriptContainer) {
            this.scriptEditor = new VisualScriptEditor(scriptContainer);
        }

        // Initialize cutscene editor
        const cutsceneContainer = document.getElementById("cutsceneEditor");
        if (cutsceneContainer) {
            this.cutsceneEditor = new CutsceneTimeline(cutsceneContainer);
        }

        // Setup tab switching
        this.setupTabSwitching();

    // Initialize export/import managers
    this.exportManager = new ExportManager();
    this.importManager = new ImportManager(this);

    // Setup event listeners
    this.setupEventListeners();
    this.setupModeSwitching();
  }

  private createSampleTileImages(): HTMLImageElement[] {
    // Create sample tile images for demonstration
    // In a real implementation, these would be loaded from actual tile assets
    const images: HTMLImageElement[] = [];
    
    // Create 8 sample tiles with different colors
    for (let i = 0; i < 8; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      
      // Different colors for different tile types
      const colors = ['#8B4513', '#228B22', '#4169E1', '#FFD700', '#DC143C', '#9932CC', '#FF6347', '#20B2AA'];
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, 0, 32, 32);
      
      // Add some texture
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 32, 32);
      
      const img = new Image();
      img.src = canvas.toDataURL();
      images.push(img);
    }
    
    return images;
  }

  private setupEventListeners(): void {
    const canvas = this.levelCanvas.getCanvas();
    
    // Handle canvas clicks for placing tiles/entities/triggers
    canvas.addEventListener("click", (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      switch (this.currentMode) {
        case 'tile':
          const tileId = this.tilePalette.getSelectedTile();
          this.levelCanvas.placeTile(x, y, tileId);
          break;
        case 'entity':
          const entityType = this.entityPalette.getSelectedEntity();
          if (entityType) {
            this.levelCanvas.placeEntity(x, y, entityType);
          }
          break;
        case 'trigger':
          const triggerType = this.selectedTrigger;
          if (triggerType) {
            this.triggerManager.addTrigger({
              x: Math.floor(x / 32) * 32,
              y: Math.floor(y / 32) * 32,
              width: 32,
              height: 32,
              type: triggerType,
              params: { amount: 10 }
            });
            this.levelCanvas.redraw(); // Redraw to show trigger
          }
          break;
      }
    });

    // Handle right-click for context menu
    canvas.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      this.showContextMenu(e);
    });

    // Setup export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCurrentPack());
    }

    // Setup import button
    const importBtn = document.getElementById("importBtn");
    if (importBtn) {
      importBtn.addEventListener("click", () => this.importPack());
    }
  }

  private setupModeSwitching(): void {
    // Setup mode switching buttons
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const mode = target.dataset.mode as 'tile' | 'entity' | 'trigger';
        if (mode) {
          this.setMode(mode);
        }
      });
    });
  }

  private setupTabSwitching(): void {
    // Setup tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });
  }

  private switchTab(tabName: string): void {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}Tab`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
  }

  private setMode(mode: 'tile' | 'entity' | 'trigger'): void {
    this.currentMode = mode;
    
    // Update UI to show current mode
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
    
    // Update cursor
    const canvas = this.levelCanvas.getCanvas();
    switch (mode) {
      case 'tile':
        canvas.style.cursor = 'crosshair';
        break;
      case 'entity':
        canvas.style.cursor = 'pointer';
        break;
      case 'trigger':
        canvas.style.cursor = 'grab';
        break;
    }
  }

  private showContextMenu(e: MouseEvent): void {
    // Create context menu for editing placed objects
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
      <div class="context-item" data-action="edit">Edit</div>
      <div class="context-item" data-action="delete">Delete</div>
    `;
    
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    
    document.body.appendChild(contextMenu);
    
    // Handle context menu clicks
    contextMenu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;
      
      if (action === 'edit') {
        this.editSelectedObject(e.clientX, e.clientY);
      } else if (action === 'delete') {
        this.deleteSelectedObject(e.clientX, e.clientY);
      }
      
      document.body.removeChild(contextMenu);
    });
    
    // Remove context menu when clicking elsewhere
    setTimeout(() => {
      document.addEventListener('click', () => {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu);
        }
      }, { once: true });
    }, 0);
  }

  private editSelectedObject(x: number, y: number): void {
    // TODO: Implement object editing
    console.log('Edit object at', x, y);
  }

  private deleteSelectedObject(x: number, y: number): void {
    // TODO: Implement object deletion
    console.log('Delete object at', x, y);
  }

  private async exportCurrentPack(): Promise<void> {
    const packData = {
      meta: {
        name: "My Custom Pack",
        version: "1.0.0",
        description: "Created with PrinceTS Editor",
        author: "Unknown",
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      tileMap: this.levelCanvas.getGrid(),
      entities: this.levelCanvas.getEntities(),
      triggers: this.triggerManager.getTriggers(),
      scripts: this.scriptEditor?.exportRules() || [],
      cutscenes: this.cutsceneEditor?.exportTimeline() || []
    };

    await this.exportManager.exportPack(packData);
  }

  private importPack(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.ptspack';
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.importManager.loadFile(file);
      }
    });
    fileInput.click();
  }

  public loadPackData(packData: any): void {
    // Load pack data into editor
    if (packData.tileMap) {
      this.levelCanvas.setGrid(packData.tileMap);
    }
    if (packData.entities) {
      this.levelCanvas.setEntities(packData.entities);
    }
    if (packData.triggers) {
      this.triggerManager.setTriggers(packData.triggers);
    }
    if (packData.scripts) {
      this.scriptEditor?.loadRules(packData.scripts);
    }
    if (packData.cutscenes) {
      this.cutsceneEditor?.loadTimeline(packData.cutscenes);
    }
    
    this.levelCanvas.redraw();
  }

  public getLevelCanvas(): LevelCanvas {
    return this.levelCanvas;
  }

  public getTriggerManager(): TriggerManager {
    return this.triggerManager;
  }
}

// Initialize editor when page loads
window.addEventListener("load", () => {
  try {
    new EditorApp();
    console.log("PrinceTS Editor initialized successfully");
  } catch (error) {
    console.error("Failed to initialize editor:", error);
  }
}); 