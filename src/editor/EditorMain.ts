import { EditorApp } from './EditorApp.js';

// Editor main entry point
class EditorMain {
    private editorApp: EditorApp | null = null;

    constructor() {
        this.initializeEditor();
    }

    private initializeEditor(): void {
        try {
            console.log('Initializing PrinceTS Visual Game Maker Editor...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.createEditorApp();
                });
            } else {
                this.createEditorApp();
            }
        } catch (error) {
            console.error('Failed to initialize editor:', error);
            this.showError('Editor initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private createEditorApp(): void {
        try {
            // Check if we're in editor mode
            const urlParams = new URLSearchParams(window.location.search);
            const isEditorMode = urlParams.get('editor') === 'true' || 
                                window.location.pathname.includes('editor.html');

            if (!isEditorMode) {
                console.log('Not in editor mode, skipping editor initialization');
                return;
            }

            // Initialize the editor application
            this.editorApp = new EditorApp();
            
            // Set up global error handling for editor
            this.setupEditorErrorHandling();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            console.log('Editor initialized successfully');
            this.updateStatus('Editor ready');
            
        } catch (error) {
            console.error('Failed to create editor app:', error);
            this.showError('Failed to create editor app: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private setupEditorErrorHandling(): void {
        // Handle unhandled promise rejections in editor context
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection in editor:', event.reason);
            this.updateStatus('Error: ' + (event.reason?.message || 'Unknown error'));
            event.preventDefault();
        });

        // Handle global errors in editor context
        window.addEventListener('error', (event) => {
            console.error('Global error in editor:', event.error);
            this.updateStatus('Error: ' + (event.error?.message || 'Unknown error'));
        });
    }

    private setupPerformanceMonitoring(): void {
        // Monitor editor performance
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.updateFPS(fps);
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitorPerformance);
        };
        
        requestAnimationFrame(monitorPerformance);
    }

    private updateStatus(message: string): void {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Editor Status:', message);
    }

    private updateFPS(fps: number): void {
        const fpsElement = document.getElementById('fps');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${fps}`;
        }
    }

    private showError(message: string): void {
        console.error(message);
        
        // Create error overlay
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        errorOverlay.innerHTML = `
            <div style="
                background: #f44336;
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                max-width: 500px;
            ">
                <h2>Editor Error</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: white;
                    color: #f44336;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Reload Editor</button>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
    }

    public getEditorApp(): EditorApp | null {
        return this.editorApp;
    }
}

// Initialize editor when script loads
const editorMain = new EditorMain();

// Export for potential external access
export { editorMain, EditorMain }; 