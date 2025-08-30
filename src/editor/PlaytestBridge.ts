import { GamePack } from './EditorApp.js';

export class PlaytestBridge {
    private playtestWindow: Window | null = null;
    private playtestFrame: HTMLIFrameElement | null = null;
    private currentPack: GamePack | null = null;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Listen for messages from playtest window
        window.addEventListener('message', this.handlePlaytestMessage.bind(this));
    }

    public startPlaytest(gamePack: GamePack): void {
        try {
            this.currentPack = gamePack;
            
            // Show playtest overlay
            const overlay = document.getElementById('playtestOverlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }

            // Create or update playtest iframe
            this.createPlaytestFrame();
            
            // Serialize game pack and send to playtest
            this.sendGamePackToPlaytest(gamePack);
            
            console.log('Playtest started with pack:', gamePack.name);
        } catch (error: unknown) {
            console.error('Failed to start playtest:', error);
            throw new Error('Playtest failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public stopPlaytest(): void {
        try {
            // Hide playtest overlay
            const overlay = document.getElementById('playtestOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }

            // Close playtest window if it exists
            if (this.playtestWindow && !this.playtestWindow.closed) {
                this.playtestWindow.close();
            }

            // Clear iframe
            if (this.playtestFrame) {
                this.playtestFrame.src = '';
                this.playtestFrame = null;
            }

            this.currentPack = null;
            
            console.log('Playtest stopped');
        } catch (error) {
            console.error('Failed to stop playtest:', error);
        }
    }

    private createPlaytestFrame(): void {
        const frameContainer = document.getElementById('playtestFrame');
        if (!frameContainer) {
            throw new Error('Playtest frame container not found');
        }

        // Clear existing frame
        frameContainer.innerHTML = '';

        // Create new iframe
        this.playtestFrame = document.createElement('iframe');
        this.playtestFrame.id = 'playtestFrame';
        this.playtestFrame.className = 'playtest-iframe';
        this.playtestFrame.width = '800';
        this.playtestFrame.height = '600';
        this.playtestFrame.style.border = '2px solid #555';
        this.playtestFrame.style.borderRadius = '8px';
        this.playtestFrame.style.backgroundColor = '#000';

        // Set iframe source to the main game
        this.playtestFrame.src = '../index.html?playtest=true';

        frameContainer.appendChild(this.playtestFrame);

        // Wait for iframe to load
        this.playtestFrame.onload = () => {
            console.log('Playtest iframe loaded');
            // Send game pack data once iframe is ready
            if (this.currentPack) {
                this.sendGamePackToPlaytest(this.currentPack);
            }
        };
    }

    private sendGamePackToPlaytest(gamePack: GamePack): void {
        if (!this.playtestFrame || !this.playtestFrame.contentWindow) {
            console.warn('Playtest frame not ready');
            return;
        }

        try {
            // Send game pack data to iframe
            this.playtestFrame.contentWindow.postMessage({
                type: 'PLAYTEST_DATA',
                data: gamePack
            }, '*');

            console.log('Game pack data sent to playtest');
        } catch (error) {
            console.error('Failed to send game pack to playtest:', error);
        }
    }

    private handlePlaytestMessage(event: MessageEvent): void {
        // Only handle messages from our playtest iframe
        if (event.source !== this.playtestFrame?.contentWindow) {
            return;
        }

        try {
            const { type, data } = event.data;

            switch (type) {
                case 'PLAYTEST_READY':
                    console.log('Playtest is ready');
                    if (this.currentPack) {
                        this.sendGamePackToPlaytest(this.currentPack);
                    }
                    break;

                case 'PLAYTEST_ERROR':
                    console.error('Playtest error:', data);
                    this.showPlaytestError(data);
                    break;

                case 'PLAYTEST_CLOSED':
                    console.log('Playtest closed by user');
                    this.stopPlaytest();
                    break;

                case 'PLAYTEST_LEVEL_COMPLETE':
                    console.log('Level completed in playtest:', data);
                    this.handleLevelComplete(data);
                    break;

                case 'PLAYTEST_ENTITY_INTERACTION':
                    console.log('Entity interaction in playtest:', data);
                    this.handleEntityInteraction(data);
                    break;

                default:
                    console.log('Unknown playtest message:', type, data);
            }
        } catch (error) {
            console.error('Failed to handle playtest message:', error);
        }
    }

    private showPlaytestError(error: string): void {
        // Show error in playtest overlay
        const overlay = document.getElementById('playtestOverlay');
        if (overlay) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #f44336;
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                z-index: 10001;
            `;
            errorDiv.innerHTML = `
                <h3>Playtest Error</h3>
                <p>${error}</p>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: #fff; color: #f44336; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            `;
            overlay.appendChild(errorDiv);
        }
    }

    private handleLevelComplete(data: any): void {
        // Handle level completion in playtest
        console.log('Level completed:', data);
        
        // Could show a completion dialog or automatically advance to next level
        if (data.levelIndex !== undefined && this.currentPack) {
            const nextLevelIndex = data.levelIndex + 1;
            if (nextLevelIndex < this.currentPack.levels.length) {
                // Auto-advance to next level
                this.loadLevelInPlaytest(nextLevelIndex);
            } else {
                // Game completed
                this.showGameComplete();
            }
        }
    }

    private handleEntityInteraction(data: any): void {
        // Handle entity interactions in playtest
        console.log('Entity interaction:', data);
        
        // Could log interactions for debugging or trigger editor updates
        if (data.entityId && data.interactionType) {
            console.log(`Entity ${data.entityId} had interaction: ${data.interactionType}`);
        }
    }

    private loadLevelInPlaytest(levelIndex: number): void {
        if (!this.currentPack || !this.playtestFrame?.contentWindow) {
            return;
        }

        try {
            this.playtestFrame.contentWindow.postMessage({
                type: 'LOAD_LEVEL',
                levelIndex: levelIndex
            }, '*');
        } catch (error) {
            console.error('Failed to load level in playtest:', error);
        }
    }

    private showGameComplete(): void {
        // Show game completion dialog
        const overlay = document.getElementById('playtestOverlay');
        if (overlay) {
            const completeDiv = document.createElement('div');
            completeDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #4CAF50;
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                z-index: 10001;
            `;
            completeDiv.innerHTML = `
                <h3>🎉 Game Complete!</h3>
                <p>Congratulations! You've completed all levels.</p>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: #fff; color: #4CAF50; border: none; border-radius: 4px; cursor: pointer;">Continue</button>
            `;
            overlay.appendChild(completeDiv);
        }
    }

    public updateGamePack(gamePack: GamePack): void {
        this.currentPack = gamePack;
        if (this.playtestFrame?.contentWindow) {
            this.sendGamePackToPlaytest(gamePack);
        }
    }

    public isPlaytestActive(): boolean {
        return this.playtestFrame !== null && this.currentPack !== null;
    }

    public getCurrentPack(): GamePack | null {
        return this.currentPack;
    }

    public getPlaytestStats(): { isActive: boolean; packName: string | null; levelCount: number } {
        return {
            isActive: this.isPlaytestActive(),
            packName: this.currentPack?.name || null,
            levelCount: this.currentPack?.levels.length || 0
        };
    }

    public createPlaytestURL(gamePack: GamePack): string {
        // Create a URL that can be used to launch the game with this pack
        const baseURL = window.location.origin + window.location.pathname.replace('editor.html', 'index.html');
        const params = new URLSearchParams();
        params.set('playtest', 'true');
        params.set('pack', gamePack.id);
        
        return `${baseURL}?${params.toString()}`;
    }

    public openPlaytestInNewWindow(gamePack: GamePack): void {
        const url = this.createPlaytestURL(gamePack);
        this.playtestWindow = window.open(url, 'playtest', 'width=1024,height=768,scrollbars=yes,resizable=yes');
        
        if (!this.playtestWindow) {
            throw new Error('Failed to open playtest window (popup blocked?)');
        }
    }
} 