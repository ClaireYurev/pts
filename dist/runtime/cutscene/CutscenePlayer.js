export class CutscenePlayer {
    constructor(cutscene, engine, onComplete, onUpdate) {
        this.actionHandlers = new Map();
        this.isPlaying = false;
        this.startTime = 0;
        this.currentTime = 0;
        this.executedItems = new Set();
        this.cutscene = cutscene;
        this.onComplete = onComplete;
        this.onUpdate = onUpdate;
        this.context = {
            engine,
            camera: { x: 0, y: 0, zoom: 1 },
            entities: new Map(),
            variables: {}
        };
        this.registerDefaultHandlers();
    }
    registerDefaultHandlers() {
        // Camera actions
        this.registerHandler('camera', 'move', {
            execute: (item, context) => {
                const { x, y, duration = 1000 } = item.args;
                const startX = context.camera.x;
                const startY = context.camera.y;
                const startTime = this.currentTime;
                const animate = () => {
                    const elapsed = this.currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = this.easeInOutQuad(progress);
                    context.camera.x = startX + (x - startX) * easeProgress;
                    context.camera.y = startY + (y - startY) * easeProgress;
                    if (progress < 1 && this.isPlaying) {
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        });
        this.registerHandler('camera', 'zoom', {
            execute: (item, context) => {
                const { zoom, duration = 1000 } = item.args;
                const startZoom = context.camera.zoom;
                const startTime = this.currentTime;
                const animate = () => {
                    const elapsed = this.currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = this.easeInOutQuad(progress);
                    context.camera.zoom = startZoom + (zoom - startZoom) * easeProgress;
                    if (progress < 1 && this.isPlaying) {
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        });
        this.registerHandler('camera', 'shake', {
            execute: (item, context) => {
                const { intensity = 10, duration = 500 } = item.args;
                const startTime = this.currentTime;
                const originalX = context.camera.x;
                const originalY = context.camera.y;
                const shake = () => {
                    const elapsed = this.currentTime - startTime;
                    if (elapsed < duration && this.isPlaying) {
                        const progress = elapsed / duration;
                        const currentIntensity = intensity * (1 - progress);
                        context.camera.x = originalX + (Math.random() - 0.5) * currentIntensity;
                        context.camera.y = originalY + (Math.random() - 0.5) * currentIntensity;
                        requestAnimationFrame(shake);
                    }
                    else {
                        context.camera.x = originalX;
                        context.camera.y = originalY;
                    }
                };
                shake();
            }
        });
        // Text actions
        this.registerHandler('text', 'show', {
            execute: (item, context) => {
                const { text, x = 400, y = 300, fontSize = 24, color = '#ffffff', duration = 3000 } = item.args;
                // Create text overlay
                const textElement = document.createElement('div');
                textElement.style.position = 'absolute';
                textElement.style.left = x + 'px';
                textElement.style.top = y + 'px';
                textElement.style.fontSize = fontSize + 'px';
                textElement.style.color = color;
                textElement.style.fontFamily = 'Arial, sans-serif';
                textElement.style.textAlign = 'center';
                textElement.style.pointerEvents = 'none';
                textElement.style.zIndex = '1000';
                textElement.textContent = text;
                document.body.appendChild(textElement);
                // Fade in
                textElement.style.opacity = '0';
                textElement.style.transition = 'opacity 0.5s ease-in';
                setTimeout(() => {
                    textElement.style.opacity = '1';
                }, 50);
                // Remove after duration
                setTimeout(() => {
                    textElement.style.transition = 'opacity 0.5s ease-out';
                    textElement.style.opacity = '0';
                    setTimeout(() => {
                        if (textElement.parentNode) {
                            textElement.parentNode.removeChild(textElement);
                        }
                    }, 500);
                }, duration);
            }
        });
        this.registerHandler('text', 'hide', {
            execute: (item, context) => {
                // Hide all text elements
                const textElements = document.querySelectorAll('[data-cutscene-text]');
                textElements.forEach(element => {
                    element.style.transition = 'opacity 0.5s ease-out';
                    element.style.opacity = '0';
                    setTimeout(() => {
                        if (element.parentNode) {
                            element.parentNode.removeChild(element);
                        }
                    }, 500);
                });
            }
        });
        // Sprite actions
        this.registerHandler('sprite', 'show', {
            execute: (item, context) => {
                const { spriteId, x, y, scale = 1, rotation = 0 } = item.args;
                // Create sprite element
                const spriteElement = document.createElement('img');
                spriteElement.style.position = 'absolute';
                spriteElement.style.left = x + 'px';
                spriteElement.style.top = y + 'px';
                spriteElement.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                spriteElement.style.pointerEvents = 'none';
                spriteElement.style.zIndex = '999';
                spriteElement.src = spriteId; // Assuming spriteId is a URL
                document.body.appendChild(spriteElement);
                // Store reference for later manipulation
                context.variables[`sprite_${item.id}`] = spriteElement;
            }
        });
        this.registerHandler('sprite', 'move', {
            execute: (item, context) => {
                const { spriteId, x, y, duration = 1000 } = item.args;
                const spriteElement = context.variables[`sprite_${spriteId}`];
                if (spriteElement) {
                    const startX = parseInt(spriteElement.style.left) || 0;
                    const startY = parseInt(spriteElement.style.top) || 0;
                    const startTime = this.currentTime;
                    const animate = () => {
                        const elapsed = this.currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeProgress = this.easeInOutQuad(progress);
                        spriteElement.style.left = (startX + (x - startX) * easeProgress) + 'px';
                        spriteElement.style.top = (startY + (y - startY) * easeProgress) + 'px';
                        if (progress < 1 && this.isPlaying) {
                            requestAnimationFrame(animate);
                        }
                    };
                    animate();
                }
            }
        });
        this.registerHandler('sprite', 'hide', {
            execute: (item, context) => {
                const { spriteId } = item.args;
                const spriteElement = context.variables[`sprite_${spriteId}`];
                if (spriteElement) {
                    spriteElement.style.transition = 'opacity 0.5s ease-out';
                    spriteElement.style.opacity = '0';
                    setTimeout(() => {
                        if (spriteElement.parentNode) {
                            spriteElement.parentNode.removeChild(spriteElement);
                        }
                        delete context.variables[`sprite_${spriteId}`];
                    }, 500);
                }
            }
        });
        // Music actions
        this.registerHandler('music', 'play', {
            execute: (item, context) => {
                const { musicId, volume = 1, loop = false } = item.args;
                context.engine.audioManager?.playMusic(musicId, { volume, loop });
            }
        });
        this.registerHandler('music', 'stop', {
            execute: (item, context) => {
                context.engine.audioManager?.stopMusic();
            }
        });
        this.registerHandler('music', 'fadeIn', {
            execute: (item, context) => {
                const { musicId, duration = 2000, volume = 1 } = item.args;
                context.engine.audioManager?.fadeInMusic(musicId, duration, volume);
            }
        });
        this.registerHandler('music', 'fadeOut', {
            execute: (item, context) => {
                const { duration = 2000 } = item.args;
                context.engine.audioManager?.fadeOutMusic(duration);
            }
        });
        // Wait action
        this.registerHandler('wait', 'wait', {
            execute: (item, context) => {
                // Wait actions are handled by the timeline system
                // This handler is just a placeholder
            }
        });
    }
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    registerHandler(trackType, action, handler) {
        const key = `${trackType}:${action}`;
        this.actionHandlers.set(key, handler);
    }
    play() {
        this.isPlaying = true;
        this.startTime = Date.now() - this.currentTime;
        this.executedItems.clear();
        this.update();
    }
    pause() {
        this.isPlaying = false;
    }
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.executedItems.clear();
        this.cleanup();
    }
    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.cutscene.duration));
        this.executedItems.clear();
        this.update();
    }
    update() {
        if (!this.isPlaying)
            return;
        this.currentTime = Date.now() - this.startTime;
        if (this.onUpdate) {
            this.onUpdate(this.currentTime);
        }
        // Execute items that should trigger at this time
        for (const track of this.cutscene.tracks) {
            for (const item of track.items) {
                if (item.time <= this.currentTime && !this.executedItems.has(item.id)) {
                    this.executeItem(item);
                    this.executedItems.add(item.id);
                }
            }
        }
        if (this.currentTime >= this.cutscene.duration) {
            this.complete();
        }
        else {
            requestAnimationFrame(() => this.update());
        }
    }
    executeItem(item) {
        const handler = this.actionHandlers.get(`${item.track}:${item.action}`);
        if (handler) {
            try {
                handler.execute(item, this.context);
            }
            catch (error) {
                console.error(`Error executing cutscene item ${item.id}:`, error);
            }
        }
        else {
            console.warn(`No handler found for action: ${item.track}:${item.action}`);
        }
    }
    complete() {
        this.isPlaying = false;
        this.cleanup();
        if (this.onComplete) {
            this.onComplete();
        }
    }
    cleanup() {
        // Remove all cutscene elements
        const cutsceneElements = document.querySelectorAll('[data-cutscene-text], [data-cutscene-sprite]');
        cutsceneElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        // Clear variables
        this.context.variables = {};
    }
    getCurrentTime() {
        return this.currentTime;
    }
    getDuration() {
        return this.cutscene.duration;
    }
    isPlayingState() {
        return this.isPlaying;
    }
    getContext() {
        return this.context;
    }
}
//# sourceMappingURL=CutscenePlayer.js.map