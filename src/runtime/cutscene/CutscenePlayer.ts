import { Cutscene, CutsceneItem } from '../../editor/CutsceneEditor.js';

export interface CutsceneContext {
    engine: any; // GameEngine reference
    currentTime: number;
    variables: Record<string, any>;
}

export interface CutsceneAction {
    name: string;
    execute: (context: CutsceneContext, item: CutsceneItem) => Promise<void>;
}

export class CutscenePlayer {
    private cutscenes: Map<string, Cutscene> = new Map();
    private activeCutscene: { cutscene: Cutscene; startTime: number; paused: boolean } | null = null;
    private actionHandlers: Map<string, CutsceneAction> = new Map();
    private engine: any;
    private isPlaying: boolean = false;

    constructor(engine: any) {
        this.engine = engine;
        this.initializeActionHandlers();
    }

    private initializeActionHandlers(): void {
        // Camera actions
        this.registerAction({
            name: 'pan',
            execute: async (context, item) => {
                const x = item.args.x || 0;
                const y = item.args.y || 0;
                const duration = item.args.duration || 1000;
                
                if (this.engine.panCamera) {
                    await this.engine.panCamera(x, y, duration);
                }
            }
        });

        this.registerAction({
            name: 'zoom',
            execute: async (context, item) => {
                const scale = item.args.scale || 1;
                const duration = item.args.duration || 1000;
                
                if (this.engine.zoomCamera) {
                    await this.engine.zoomCamera(scale, duration);
                }
            }
        });

        this.registerAction({
            name: 'shake',
            execute: async (context, item) => {
                const intensity = item.args.intensity || 5;
                const duration = item.args.duration || 500;
                
                if (this.engine.shakeCamera) {
                    await this.engine.shakeCamera(intensity, duration);
                }
            }
        });

        // Text actions
        this.registerAction({
            name: 'show',
            execute: async (context, item) => {
                const text = item.args.text || '';
                const speaker = item.args.speaker || '';
                const style = item.args.style || 'normal';
                
                if (this.engine.showText) {
                    await this.engine.showText(text, speaker, style);
                }
            }
        });

        this.registerAction({
            name: 'hide',
            execute: async (context, item) => {
                if (this.engine.hideText) {
                    await this.engine.hideText();
                }
            }
        });

        this.registerAction({
            name: 'typewriter',
            execute: async (context, item) => {
                const text = item.args.text || '';
                const speed = item.args.speed || 50;
                
                if (this.engine.typewriterText) {
                    await this.engine.typewriterText(text, speed);
                }
            }
        });

        // Sprite actions
        this.registerAction({
            name: 'show',
            execute: async (context, item) => {
                const spriteId = item.args.spriteId || '';
                const x = item.args.x || 0;
                const y = item.args.y || 0;
                const scale = item.args.scale || 1;
                
                if (this.engine.showSprite) {
                    await this.engine.showSprite(spriteId, x, y, scale);
                }
            }
        });

        this.registerAction({
            name: 'hide',
            execute: async (context, item) => {
                if (this.engine.hideSprite) {
                    await this.engine.hideSprite();
                }
            }
        });

        this.registerAction({
            name: 'move',
            execute: async (context, item) => {
                const x = item.args.x || 0;
                const y = item.args.y || 0;
                const duration = item.args.duration || 1000;
                
                if (this.engine.moveSprite) {
                    await this.engine.moveSprite(x, y, duration);
                }
            }
        });

        this.registerAction({
            name: 'animate',
            execute: async (context, item) => {
                const animationId = item.args.animationId || '';
                const loop = item.args.loop || false;
                
                if (this.engine.animateSprite) {
                    await this.engine.animateSprite(animationId, loop);
                }
            }
        });

        // Music actions
        this.registerAction({
            name: 'play',
            execute: async (context, item) => {
                const musicId = item.args.musicId || '';
                const volume = item.args.volume || 1;
                const fadeIn = item.args.fadeIn || 1000;
                
                if (this.engine.playMusic) {
                    await this.engine.playMusic(musicId, volume, fadeIn);
                }
            }
        });

        this.registerAction({
            name: 'stop',
            execute: async (context, item) => {
                const fadeOut = item.args.fadeOut || 1000;
                
                if (this.engine.stopMusic) {
                    await this.engine.stopMusic(fadeOut);
                }
            }
        });

        this.registerAction({
            name: 'crossfade',
            execute: async (context, item) => {
                const musicId = item.args.musicId || '';
                const duration = item.args.duration || 2000;
                
                if (this.engine.crossfadeMusic) {
                    await this.engine.crossfadeMusic(musicId, duration);
                }
            }
        });

        // Wait actions
        this.registerAction({
            name: 'wait',
            execute: async (context, item) => {
                const duration = item.args.duration || 1000;
                await this.wait(duration);
            }
        });

        this.registerAction({
            name: 'waitForInput',
            execute: async (context, item) => {
                const key = item.args.key || 'any';
                await this.waitForInput(key);
            }
        });
    }

    public registerAction(action: CutsceneAction): void {
        this.actionHandlers.set(action.name, action);
    }

    public loadCutscene(cutscene: Cutscene): void {
        this.cutscenes.set(cutscene.id, cutscene);
    }

    public loadCutscenes(cutscenes: Cutscene[]): void {
        cutscenes.forEach(cutscene => this.loadCutscene(cutscene));
    }

    public async playCutscene(cutsceneId: string): Promise<void> {
        const cutscene = this.cutscenes.get(cutsceneId);
        if (!cutscene) {
            console.warn(`Cutscene not found: ${cutsceneId}`);
            return;
        }

        if (this.activeCutscene) {
            await this.stopCutscene();
        }

        this.activeCutscene = {
            cutscene: cutscene,
            startTime: Date.now(),
            paused: false
        };

        this.isPlaying = true;
        console.log(`Playing cutscene: ${cutscene.name}`);

        // Pause gameplay
        if (this.engine.pauseGameplay) {
            this.engine.pauseGameplay();
        }

        // Execute cutscene
        await this.executeCutscene();
    }

    public async stopCutscene(): Promise<void> {
        if (!this.activeCutscene) return;

        this.isPlaying = false;
        this.activeCutscene = null;

        // Resume gameplay
        if (this.engine.resumeGameplay) {
            this.engine.resumeGameplay();
        }

        console.log('Cutscene stopped');
    }

    public pauseCutscene(): void {
        if (this.activeCutscene) {
            this.activeCutscene.paused = true;
            console.log('Cutscene paused');
        }
    }

    public resumeCutscene(): void {
        if (this.activeCutscene) {
            this.activeCutscene.paused = false;
            console.log('Cutscene resumed');
        }
    }

    public skipCutscene(): void {
        if (this.activeCutscene) {
            this.stopCutscene();
        }
    }

    private async executeCutscene(): Promise<void> {
        if (!this.activeCutscene) return;

        const { cutscene, startTime } = this.activeCutscene;
        const context: CutsceneContext = {
            engine: this.engine,
            currentTime: 0,
            variables: {}
        };

        // Sort all items by time
        const allItems: Array<{ item: CutsceneItem; track: string }> = [];
        for (const track of cutscene.tracks) {
            for (const item of track.items) {
                allItems.push({ item, track: track.type });
            }
        }
        allItems.sort((a, b) => a.item.time - b.item.time);

        // Execute items in order
        for (const { item, track } of allItems) {
            if (!this.isPlaying || this.activeCutscene?.paused) {
                break;
            }

            // Wait until item's time
            const waitTime = item.time - context.currentTime;
            if (waitTime > 0) {
                await this.wait(waitTime);
                context.currentTime = item.time;
            }

            if (!this.isPlaying || this.activeCutscene?.paused) {
                break;
            }

            // Execute item
            await this.executeItem(context, item, track);
        }

        // Cutscene completed
        await this.stopCutscene();
    }

    private async executeItem(context: CutsceneContext, item: CutsceneItem, track: string): Promise<void> {
        try {
            const handler = this.actionHandlers.get(item.action);
            if (handler) {
                await handler.execute(context, item);
            } else {
                console.warn(`No action handler found for: ${item.action} in track: ${track}`);
            }
        } catch (error) {
            console.error(`Error executing cutscene item ${item.id}:`, error);
        }
    }

    private async wait(duration: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    private async waitForInput(key: string): Promise<void> {
        return new Promise(resolve => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (key === 'any' || event.code === key) {
                    document.removeEventListener('keydown', handleKeyDown);
                    resolve();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        });
    }

    public isPlayingCutscene(): boolean {
        return this.isPlaying && this.activeCutscene !== null;
    }

    public getCurrentCutscene(): Cutscene | null {
        return this.activeCutscene?.cutscene || null;
    }

    public getCutsceneProgress(): number {
        if (!this.activeCutscene) return 0;
        
        const elapsed = Date.now() - this.activeCutscene.startTime;
        return Math.min(elapsed / this.activeCutscene.cutscene.duration, 1);
    }

    public getCutscene(cutsceneId: string): Cutscene | undefined {
        return this.cutscenes.get(cutsceneId);
    }

    public getAllCutscenes(): Cutscene[] {
        return Array.from(this.cutscenes.values());
    }

    public removeCutscene(cutsceneId: string): boolean {
        return this.cutscenes.delete(cutsceneId);
    }

    public clearCutscenes(): void {
        this.cutscenes.clear();
    }

    public exportCutscene(cutsceneId: string): string {
        const cutscene = this.cutscenes.get(cutsceneId);
        return cutscene ? JSON.stringify(cutscene, null, 2) : '';
    }

    public importCutscene(json: string): void {
        try {
            const cutscene = JSON.parse(json) as Cutscene;
            this.loadCutscene(cutscene);
        } catch (error) {
            console.error('Failed to import cutscene:', error);
        }
    }
} 