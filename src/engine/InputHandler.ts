import { Renderer } from "./Renderer.js";

export class InputHandler {
    private keys: Record<string, boolean> = {};
    private mouse = { x: 0, y: 0, down: false };
    private previousKeys: Record<string, boolean> = {};
    private eventListeners: Array<{ element: EventTarget; type: string; listener: (e: Event) => void }> = [];
    private resizeObserver?: ResizeObserver;
    private abortController: AbortController;

    constructor(canvas: HTMLCanvasElement) {
        this.abortController = new AbortController();
        this.setupEventListeners(canvas);
    }

    private setupEventListeners(canvas: HTMLCanvasElement): void {
        // Keyboard events
        const keydownListener = (e: KeyboardEvent) => {
            this.keys[e.code] = true;
            e.preventDefault();
        };
        
        const keyupListener = (e: KeyboardEvent) => {
            this.keys[e.code] = false;
            e.preventDefault();
        };

        // Mouse events
        const mousedownListener = (e: MouseEvent) => {
            this.mouse.down = true;
            this.updateMousePosition(e, canvas);
            e.preventDefault();
        };
        
        const mouseupListener = (e: MouseEvent) => {
            this.mouse.down = false;
            this.updateMousePosition(e, canvas);
            e.preventDefault();
        };
        
        const mousemoveListener = (e: MouseEvent) => {
            this.updateMousePosition(e, canvas);
        };

        const contextmenuListener = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Window focus/blur events for key state cleanup
        const focusListener = () => {
            // Reset all keys when window gains focus
            this.keys = {};
            this.previousKeys = {};
        };

        const blurListener = () => {
            // Reset all keys when window loses focus
            this.keys = {};
            this.previousKeys = {};
        };

        // Add event listeners with AbortController for better cleanup
        const signal = this.abortController.signal;
        
        window.addEventListener("keydown", keydownListener, { signal });
        window.addEventListener("keyup", keyupListener, { signal });
        canvas.addEventListener("mousedown", mousedownListener, { signal });
        canvas.addEventListener("mouseup", mouseupListener, { signal });
        canvas.addEventListener("mousemove", mousemoveListener, { signal });
        canvas.addEventListener("contextmenu", contextmenuListener, { signal });
        window.addEventListener("focus", focusListener, { signal });
        window.addEventListener("blur", blurListener, { signal });

        // Store references for manual cleanup if needed
        this.eventListeners = [
            { element: window, type: "keydown", listener: keydownListener as (e: Event) => void },
            { element: window, type: "keyup", listener: keyupListener as (e: Event) => void },
            { element: canvas, type: "mousedown", listener: mousedownListener as (e: Event) => void },
            { element: canvas, type: "mouseup", listener: mouseupListener as (e: Event) => void },
            { element: canvas, type: "mousemove", listener: mousemoveListener as (e: Event) => void },
            { element: canvas, type: "contextmenu", listener: contextmenuListener as (e: Event) => void },
            { element: window, type: "focus", listener: focusListener as (e: Event) => void },
            { element: window, type: "blur", listener: blurListener as (e: Event) => void }
        ];
    }

    public cleanup(): void {
        try {
            // Abort all event listeners using AbortController
            this.abortController.abort();
            
            // Fallback: manually remove all event listeners
            for (const { element, type, listener } of this.eventListeners) {
                try {
                    element.removeEventListener(type, listener);
                } catch (error) {
                    console.warn(`Failed to remove event listener for ${type}:`, error);
                }
            }
            this.eventListeners = [];
            
            // Disconnect resize observer if it exists
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = undefined;
            }
            
            // Reset all key states
            this.keys = {};
            this.previousKeys = {};
            this.mouse = { x: 0, y: 0, down: false };
            
            console.log("InputHandler cleanup completed successfully");
        } catch (error) {
            console.error("Error during InputHandler cleanup:", error);
        }
    }

    private updateMousePosition(e: MouseEvent, canvas: HTMLCanvasElement): void {
        try {
            const rect = canvas.getBoundingClientRect();
            
            // Validate canvas dimensions
            if (rect.width <= 0 || rect.height <= 0) {
                console.warn("Invalid canvas dimensions for mouse position calculation");
                return;
            }
            
            // Validate client coordinates
            if (!isFinite(e.clientX) || !isFinite(e.clientY)) {
                console.warn("Invalid client coordinates for mouse position calculation");
                return;
            }
            
            this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
            this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
            
            // Ensure mouse coordinates are finite
            if (!isFinite(this.mouse.x) || !isFinite(this.mouse.y)) {
                console.warn("Non-finite mouse coordinates calculated, resetting to zero");
                this.mouse.x = 0;
                this.mouse.y = 0;
            }
        } catch (error) {
            console.error("Error updating mouse position:", error);
            this.mouse.x = 0;
            this.mouse.y = 0;
        }
    }

    public handleCanvasResize(canvas: HTMLCanvasElement): void {
        try {
            // Recalculate mouse position when canvas is resized
            if (this.mouse.down) {
                // If mouse is down, we need to update the position
                // This is a simplified approach - in a real app you might want to track the resize event
                console.log("Canvas resized, mouse position may need recalculation");
            }
            
            // Add resize observer for automatic handling
            if (!this.resizeObserver) {
                this.resizeObserver = new ResizeObserver(() => {
                    this.updateMousePositionFromLastEvent(canvas);
                });
                this.resizeObserver.observe(canvas);
            }
        } catch (error) {
            console.error("Error handling canvas resize:", error);
        }
    }

    private updateMousePositionFromLastEvent(canvas: HTMLCanvasElement): void {
        // This would need to be called with the last mouse event
        // For now, we'll just log that resize happened
        console.log("Canvas dimensions changed, mouse coordinates may be inaccurate");
    }

    public isKeyDown(keyCode: string): boolean {
        return !!this.keys[keyCode];
    }

    public isKeyPressed(keyCode: string): boolean {
        return this.keys[keyCode] && !this.previousKeys[keyCode];
    }

    public isKeyReleased(keyCode: string): boolean {
        return !this.keys[keyCode] && this.previousKeys[keyCode];
    }

    public getMousePosition(): { x: number; y: number; down: boolean } {
        return { ...this.mouse };
    }

    public getMousePositionInternal(renderer: Renderer): { x: number; y: number; down: boolean } {
        try {
            // Convert display coordinates to internal game coordinates
            const displayPos = this.getMousePosition();
            const internalPos = renderer.displayToInternal(displayPos.x, displayPos.y);
            return { x: internalPos.x, y: internalPos.y, down: displayPos.down };
        } catch (error) {
            console.error("Error converting mouse position to internal coordinates:", error);
            return { x: 0, y: 0, down: false };
        }
    }

    public getAxis(): { x: number; y: number } {
        let x = 0, y = 0;
        
        if (this.isKeyDown("KeyA") || this.isKeyDown("ArrowLeft")) x--;
        if (this.isKeyDown("KeyD") || this.isKeyDown("ArrowRight")) x++;
        if (this.isKeyDown("KeyW") || this.isKeyDown("ArrowUp")) y--;
        if (this.isKeyDown("KeyS") || this.isKeyDown("ArrowDown")) y++;
        
        // Clamp values to prevent diagonal movement from being faster
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude > 0.0001) { // Avoid division by zero
            x /= magnitude;
            y /= magnitude;
        }
        
        // Ensure values are finite
        if (!isFinite(x) || !isFinite(y)) {
            console.warn("Non-finite axis values detected, resetting to zero");
            return { x: 0, y: 0 };
        }
        
        return { x, y };
    }

    public debugKeys(): void {
        console.log("Current keys:", Object.keys(this.keys).filter(key => this.keys[key]));
    }

    public update(): void {
        // Store previous frame's key states
        this.previousKeys = { ...this.keys };
    }
} 