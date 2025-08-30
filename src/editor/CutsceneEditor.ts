import { CutsceneTrack, CutsceneItem } from '../runtime/cutscene/CutscenePlayer';

export interface CutsceneData {
  id: string;
  name: string;
  duration: number;
  tracks: CutsceneTrack[];
  metadata: {
    created: string;
    editor: string;
    description?: string;
  };
}

export interface TrackTemplate {
  type: 'camera' | 'text' | 'sprite' | 'music' | 'wait';
  name: string;
  color: string;
  defaultItems: CutsceneItem[];
}

export class CutsceneEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cutscene: CutsceneData;
  private selectedItem: CutsceneItem | null = null;
  private draggingItem: CutsceneItem | null = null;
  private selectedTrack: CutsceneTrack | null = null;
  private timelineScale = 1; // pixels per millisecond
  private scrollX = 0;
  private scrollY = 0;
  private trackHeight = 60;
  private headerHeight = 40;
  private timeRulerHeight = 30;
  private isPlaying = false;
  private currentTime = 0;
  private playStartTime = 0;

  constructor(canvas: HTMLCanvasElement, cutscene?: CutsceneData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.cutscene = cutscene || this.createEmptyCutscene();
    this.setupEventListeners();
    this.resize();
  }

  private createEmptyCutscene(): CutsceneData {
    return {
      id: 'cutscene_' + Date.now(),
      name: 'New Cutscene',
      duration: 10000, // 10 seconds
      tracks: [],
      metadata: {
        created: new Date().toISOString(),
        editor: 'PrinceTS Cutscene Editor'
      }
    };
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onWheel.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', this.resize.bind(this));
  }

  private resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.render();
  }

  private onMouseDown(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.button === 0) { // Left click
      const item = this.getItemAt(x, y);
      if (item) {
        this.selectedItem = item;
        this.draggingItem = item;
      } else {
        this.selectedItem = null;
      }

      const track = this.getTrackAt(y);
      if (track) {
        this.selectedTrack = track;
      }
    } else if (e.button === 2) { // Right click
      this.showContextMenu(e.clientX, e.clientY, x, y);
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.draggingItem) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = (x - this.headerHeight - this.scrollX) / this.timelineScale;
      
      if (newTime >= 0 && newTime + (this.draggingItem.duration || 0) <= this.cutscene.duration) {
        this.draggingItem.time = Math.max(0, newTime);
        this.render();
      }
    }
  }

  private onMouseUp(e: MouseEvent) {
    this.draggingItem = null;
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    
    if (e.ctrlKey) {
      // Zoom timeline
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.timelineScale = Math.max(0.1, Math.min(10, this.timelineScale * delta));
    } else {
      // Scroll horizontally
      this.scrollX += e.deltaY;
      this.scrollX = Math.max(0, Math.min(this.scrollX, this.cutscene.duration * this.timelineScale - this.canvas.width + this.headerHeight));
    }
    
    this.render();
  }

  private getItemAt(x: number, y: number): CutsceneItem | null {
    const trackIndex = Math.floor((y - this.timeRulerHeight - this.headerHeight - this.scrollY) / this.trackHeight);
    const track = this.cutscene.tracks[trackIndex];
    
    if (!track) return null;
    
    const itemX = x - this.headerHeight - this.scrollX;
    const itemTime = itemX / this.timelineScale;
    
    for (const item of track.items) {
      const itemStartX = item.time * this.timelineScale;
      const itemEndX = itemStartX + (item.duration || 1000) * this.timelineScale;
      
      if (itemTime >= itemStartX && itemTime <= itemEndX) {
        return item;
      }
    }
    
    return null;
  }

  private getTrackAt(y: number): CutsceneTrack | null {
    const trackIndex = Math.floor((y - this.timeRulerHeight - this.headerHeight - this.scrollY) / this.trackHeight);
    return this.cutscene.tracks[trackIndex] || null;
  }

  private showContextMenu(x: number, y: number, canvasX: number, canvasY: number) {
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.background = '#2c3e50';
    menu.style.border = '1px solid #34495e';
    menu.style.borderRadius = '4px';
    menu.style.padding = '8px 0';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '200px';

    const trackTemplates: TrackTemplate[] = [
      { type: 'camera', name: 'Camera', color: '#e74c3c', defaultItems: [] },
      { type: 'text', name: 'Text', color: '#3498db', defaultItems: [] },
      { type: 'sprite', name: 'Sprite', color: '#2ecc71', defaultItems: [] },
      { type: 'music', name: 'Music', color: '#9b59b6', defaultItems: [] },
      { type: 'wait', name: 'Wait', color: '#f39c12', defaultItems: [] }
    ];

    const addTrackItem = document.createElement('div');
    addTrackItem.style.padding = '8px 16px';
    addTrackItem.style.color = '#bdc3c7';
    addTrackItem.style.cursor = 'pointer';
    addTrackItem.style.borderBottom = '1px solid #34495e';
    addTrackItem.textContent = 'Add Track';
    menu.appendChild(addTrackItem);

    trackTemplates.forEach(template => {
      const item = document.createElement('div');
      item.style.padding = '8px 16px';
      item.style.color = '#bdc3c7';
      item.style.cursor = 'pointer';
      item.textContent = template.name;
      
      item.addEventListener('mouseenter', () => {
        item.style.background = '#34495e';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });
      
      item.addEventListener('click', () => {
        this.addTrack(template);
        document.body.removeChild(menu);
      });
      
      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        document.body.removeChild(menu);
        document.removeEventListener('click', closeMenu);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 100);
  }

  private addTrack(template: TrackTemplate) {
    const track: CutsceneTrack = {
      id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: template.name,
      type: template.type,
      color: template.color,
      items: [...template.defaultItems]
    };
    
    this.cutscene.tracks.push(track);
    this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw time ruler
    this.drawTimeRuler();
    
    // Draw tracks
    this.drawTracks();
    
    // Draw playhead
    if (this.isPlaying) {
      this.drawPlayhead();
    }
  }

  private drawTimeRuler() {
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.timeRulerHeight);
    
    this.ctx.fillStyle = '#ecf0f1';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    const step = Math.max(1000, Math.floor(5000 / this.timelineScale));
    for (let time = 0; time <= this.cutscene.duration; time += step) {
      const x = this.headerHeight + time * this.timelineScale - this.scrollX;
      if (x >= this.headerHeight && x <= this.canvas.width) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.timeRulerHeight);
        this.ctx.lineTo(x, this.timeRulerHeight - 10);
        this.ctx.stroke();
        
        const seconds = Math.floor(time / 1000);
        this.ctx.fillText(`${seconds}s`, x, this.timeRulerHeight - 15);
      }
    }
  }

  private drawTracks() {
    let trackY = this.timeRulerHeight + this.headerHeight;
    
    for (const track of this.cutscene.tracks) {
      // Draw track header
      this.ctx.fillStyle = track.color;
      this.ctx.fillRect(0, trackY, this.headerHeight, this.trackHeight);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(track.name, this.headerHeight / 2, trackY + this.trackHeight / 2 + 4);
      
      // Draw track background
      this.ctx.fillStyle = '#34495e';
      this.ctx.fillRect(this.headerHeight, trackY, this.canvas.width - this.headerHeight, this.trackHeight);
      
      // Draw track grid
      this.ctx.strokeStyle = '#2c3e50';
      this.ctx.lineWidth = 1;
      const step = Math.max(1000, Math.floor(5000 / this.timelineScale));
      for (let time = 0; time <= this.cutscene.duration; time += step) {
        const x = this.headerHeight + time * this.timelineScale - this.scrollX;
        if (x >= this.headerHeight && x <= this.canvas.width) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, trackY);
          this.ctx.lineTo(x, trackY + this.trackHeight);
          this.ctx.stroke();
        }
      }
      
      // Draw track items
      for (const item of track.items) {
        const itemX = this.headerHeight + item.time * this.timelineScale - this.scrollX;
        const itemWidth = (item.duration || 1000) * this.timelineScale;
        
        if (itemX + itemWidth >= this.headerHeight && itemX <= this.canvas.width) {
          const isSelected = this.selectedItem === item;
          
          this.ctx.fillStyle = track.color;
          this.ctx.strokeStyle = isSelected ? '#f39c12' : '#2c3e50';
          this.ctx.lineWidth = isSelected ? 3 : 2;
          
          this.ctx.beginPath();
          this.ctx.roundRect(itemX, trackY + 5, itemWidth, this.trackHeight - 10, 4);
          this.ctx.fill();
          this.ctx.stroke();
          
          // Draw item text
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = '10px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(item.action, itemX + itemWidth / 2, trackY + this.trackHeight / 2 + 3);
        }
      }
      
      trackY += this.trackHeight;
    }
  }

  private drawPlayhead() {
    const playheadX = this.headerHeight + this.currentTime * this.timelineScale - this.scrollX;
    
    if (playheadX >= this.headerHeight && playheadX <= this.canvas.width) {
      this.ctx.strokeStyle = '#e74c3c';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(playheadX, this.timeRulerHeight);
      this.ctx.lineTo(playheadX, this.canvas.height);
      this.ctx.stroke();
      
      // Draw playhead triangle
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.beginPath();
      this.ctx.moveTo(playheadX - 5, this.timeRulerHeight);
      this.ctx.lineTo(playheadX + 5, this.timeRulerHeight);
      this.ctx.lineTo(playheadX, this.timeRulerHeight + 10);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  play() {
    this.isPlaying = true;
    this.playStartTime = Date.now() - this.currentTime;
    this.updatePlayhead();
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    this.render();
  }

  private updatePlayhead() {
    if (this.isPlaying) {
      this.currentTime = Date.now() - this.playStartTime;
      
      if (this.currentTime >= this.cutscene.duration) {
        this.stop();
      } else {
        this.render();
        requestAnimationFrame(() => this.updatePlayhead());
      }
    }
  }

  addItem(trackId: string, item: CutsceneItem) {
    const track = this.cutscene.tracks.find(t => t.id === trackId);
    if (track) {
      track.items.push(item);
      this.render();
    }
  }

  removeItem(trackId: string, itemId: string) {
    const track = this.cutscene.tracks.find(t => t.id === trackId);
    if (track) {
      track.items = track.items.filter(item => item.id !== itemId);
      this.render();
    }
  }

  removeTrack(trackId: string) {
    this.cutscene.tracks = this.cutscene.tracks.filter(t => t.id !== trackId);
    this.render();
  }

  getCutscene(): CutsceneData {
    return this.cutscene;
  }

  setCutscene(cutscene: CutsceneData) {
    this.cutscene = cutscene;
    this.render();
  }

  setDuration(duration: number) {
    this.cutscene.duration = Math.max(1000, duration);
    this.render();
  }
} 