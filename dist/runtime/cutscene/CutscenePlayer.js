export class CutscenePlayer {
    constructor(engine) {
        this.cutscenes = new Map();
        this.activeCutscene = null;
        this.actionHandlers = new Map();
        this.isPlaying = false;
        this.engine = engine;
        this.initializeActionHandlers();
    }
    initializeActionHandlers() {
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
    registerAction(action) {
        this.actionHandlers.set(action.name, action);
    }
    loadCutscene(cutscene) {
        this.cutscenes.set(cutscene.id, cutscene);
    }
    loadCutscenes(cutscenes) {
        cutscenes.forEach(cutscene => this.loadCutscene(cutscene));
    }
    async playCutscene(cutsceneId) {
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
    async stopCutscene() {
        if (!this.activeCutscene)
            return;
        this.isPlaying = false;
        this.activeCutscene = null;
        // Resume gameplay
        if (this.engine.resumeGameplay) {
            this.engine.resumeGameplay();
        }
        console.log('Cutscene stopped');
    }
    pauseCutscene() {
        if (this.activeCutscene) {
            this.activeCutscene.paused = true;
            console.log('Cutscene paused');
        }
    }
    resumeCutscene() {
        if (this.activeCutscene) {
            this.activeCutscene.paused = false;
            console.log('Cutscene resumed');
        }
    }
    skipCutscene() {
        if (this.activeCutscene) {
            this.stopCutscene();
        }
    }
    async executeCutscene() {
        if (!this.activeCutscene)
            return;
        const { cutscene, startTime } = this.activeCutscene;
        const context = {
            engine: this.engine,
            currentTime: 0,
            variables: {}
        };
        // Sort all items by time
        const allItems = [];
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
    async executeItem(context, item, track) {
        try {
            const handler = this.actionHandlers.get(item.action);
            if (handler) {
                await handler.execute(context, item);
            }
            else {
                console.warn(`No action handler found for: ${item.action} in track: ${track}`);
            }
        }
        catch (error) {
            console.error(`Error executing cutscene item ${item.id}:`, error);
        }
    }
    async wait(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    async waitForInput(key) {
        return new Promise(resolve => {
            const handleKeyDown = (event) => {
                if (key === 'any' || event.code === key) {
                    document.removeEventListener('keydown', handleKeyDown);
                    resolve();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        });
    }
    isPlayingCutscene() {
        return this.isPlaying && this.activeCutscene !== null;
    }
    getCurrentCutscene() {
        return this.activeCutscene?.cutscene || null;
    }
    getCutsceneProgress() {
        if (!this.activeCutscene)
            return 0;
        const elapsed = Date.now() - this.activeCutscene.startTime;
        return Math.min(elapsed / this.activeCutscene.cutscene.duration, 1);
    }
    getCutscene(cutsceneId) {
        return this.cutscenes.get(cutsceneId);
    }
    getAllCutscenes() {
        return Array.from(this.cutscenes.values());
    }
    removeCutscene(cutsceneId) {
        return this.cutscenes.delete(cutsceneId);
    }
    clearCutscenes() {
        this.cutscenes.clear();
    }
    exportCutscene(cutsceneId) {
        const cutscene = this.cutscenes.get(cutsceneId);
        return cutscene ? JSON.stringify(cutscene, null, 2) : '';
    }
    importCutscene(json) {
        try {
            const cutscene = JSON.parse(json);
            this.loadCutscene(cutscene);
        }
        catch (error) {
            console.error('Failed to import cutscene:', error);
        }
    }
}
//# sourceMappingURL=CutscenePlayer.js.map