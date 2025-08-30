export class TilePalette {
  private tiles: HTMLImageElement[];
  private selectedTileId = 0;
  private container: HTMLElement;
  private onTileSelected?: (tileId: number) => void;

  constructor(container: HTMLElement, tiles: HTMLImageElement[]) {
    this.container = container;
    this.tiles = tiles;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'tile-palette';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'palette-header';
    header.textContent = 'Tiles';
    this.container.appendChild(header);

    // Create tile grid
    const tileGrid = document.createElement('div');
    tileGrid.className = 'tile-grid';
    
    this.tiles.forEach((img, id) => {
      const tileContainer = document.createElement('div');
      tileContainer.className = 'tile-item';
      tileContainer.dataset.tileId = id.toString();
      
      const thumb = document.createElement('img');
      thumb.src = img.src;
      thumb.className = 'tile-thumbnail';
      thumb.alt = `Tile ${id}`;
      
      const label = document.createElement('div');
      label.className = 'tile-label';
      label.textContent = `Tile ${id}`;
      
      tileContainer.appendChild(thumb);
      tileContainer.appendChild(label);
      
      // Add click handler
      tileContainer.addEventListener('click', () => {
        this.selectTile(id);
      });
      
      tileGrid.appendChild(tileContainer);
    });
    
    this.container.appendChild(tileGrid);
    
    // Select first tile by default
    if (this.tiles.length > 0) {
      this.selectTile(0);
    }
  }

  public selectTile(tileId: number): void {
    if (tileId < 0 || tileId >= this.tiles.length) return;
    
    // Remove previous selection
    const prevSelected = this.container.querySelector('.tile-item.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }
    
    // Add selection to new tile
    const newSelected = this.container.querySelector(`[data-tile-id="${tileId}"]`);
    if (newSelected) {
      newSelected.classList.add('selected');
    }
    
    this.selectedTileId = tileId;
    
    // Call callback if provided
    if (this.onTileSelected) {
      this.onTileSelected(tileId);
    }
  }

  public getSelectedTile(): number {
    return this.selectedTileId;
  }

  public setTiles(tiles: HTMLImageElement[]): void {
    this.tiles = tiles;
    this.render();
  }

  public addTile(image: HTMLImageElement): void {
    this.tiles.push(image);
    this.render();
  }

  public removeTile(tileId: number): void {
    if (tileId >= 0 && tileId < this.tiles.length) {
      this.tiles.splice(tileId, 1);
      this.render();
    }
  }

  public getTileImage(tileId: number): HTMLImageElement | undefined {
    return this.tiles[tileId];
  }

  public getAllTiles(): HTMLImageElement[] {
    return [...this.tiles];
  }

  public setOnTileSelected(callback: (tileId: number) => void): void {
    this.onTileSelected = callback;
  }

  public clearSelection(): void {
    const selected = this.container.querySelector('.tile-item.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    this.selectedTileId = -1;
  }

  public getTileCount(): number {
    return this.tiles.length;
  }

  public isEmpty(): boolean {
    return this.tiles.length === 0;
  }

  public loadTilesetFromImage(image: HTMLImageElement, tileWidth: number, tileHeight: number): void {
    // Create a canvas to extract tiles from the tileset image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = tileWidth;
    canvas.height = tileHeight;
    
    const tiles: HTMLImageElement[] = [];
    const tilesPerRow = Math.floor(image.width / tileWidth);
    const tilesPerCol = Math.floor(image.height / tileHeight);
    
    for (let row = 0; row < tilesPerCol; row++) {
      for (let col = 0; col < tilesPerRow; col++) {
        // Clear canvas
        ctx.clearRect(0, 0, tileWidth, tileHeight);
        
        // Draw tile from tileset
        ctx.drawImage(
          image,
          col * tileWidth, row * tileHeight, tileWidth, tileHeight,
          0, 0, tileWidth, tileHeight
        );
        
        // Create image from canvas
        const tileImage = new Image();
        tileImage.src = canvas.toDataURL();
        tiles.push(tileImage);
      }
    }
    
    this.setTiles(tiles);
  }

  public exportTileset(): { tiles: string[], tileWidth: number, tileHeight: number } {
    const tileDataUrls = this.tiles.map(img => img.src);
    const firstTile = this.tiles[0];
    const tileWidth = firstTile ? firstTile.width : 32;
    const tileHeight = firstTile ? firstTile.height : 32;
    
    return {
      tiles: tileDataUrls,
      tileWidth,
      tileHeight
    };
  }

  public importTileset(tilesetData: { tiles: string[], tileWidth: number, tileHeight: number }): void {
    const tiles = tilesetData.tiles.map(dataUrl => {
      const img = new Image();
      img.src = dataUrl;
      return img;
    });
    
    this.setTiles(tiles);
  }
} 