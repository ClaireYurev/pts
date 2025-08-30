import { Renderer } from "./Renderer.js";
import { InputMap, Action } from "./input/InputMap.js";
import { Gamepad } from "./input/Gamepad.js";

export class InputHandler {
    private keys: Record<string, boolean> = {};
    private mouse = { x: 0, y: 0, down: false };
    private previousKeys: Record<string, boolean> = {};
    private eventListeners: Array<{ element: EventTarget; type: string; listener: (e: Event) => void }> = [];
    private resizeObserver?: ResizeObserver;
    private abortController: AbortController;
    
    // New input system components
    private inputMap: InputMap;
    private gamepad: Gamepad;

    constructor(canvas: HTMLCanvasElement) {
        this.abortController = new AbortController();
        
        // Initialize new input system
        this.inputMap = new InputMap();
        this.gamepad = new Gamepad();
        
        this.setupEventListeners(canvas);
        this.gamepad.start();
    }

    private setupEventListeners(canvas: HTMLCanvasElement): void {
        // Keyboard events with proper cleanup tracking
        const keydownListener = (e: KeyboardEvent) => {
            if (this.abortController.signal.aborted) return;
            this.keys[e.code] = true;
        };
        
        const keyupListener = (e: KeyboardEvent) => {
            if (this.abortController.signal.aborted) return;
            this.keys[e.code] = false;
        };
        
        // Mouse events with proper cleanup tracking
        const mousedownListener = (e: MouseEvent) => {
            if (this.abortController.signal.aborted) return;
            this.mouse.down = true;
            this.updateMousePosition(e, canvas);
        };
        
        const mouseupListener = (e: MouseEvent) => {
            if (this.abortController.signal.aborted) return;
            this.mouse.down = false;
            this.updateMousePosition(e, canvas);
        };
        
        const mousemoveListener = (e: MouseEvent) => {
            if (this.abortController.signal.aborted) return;
            this.updateMousePosition(e, canvas);
        };
        
        // Touch events for mobile support
        const touchstartListener = (e: TouchEvent) => {
            if (this.abortController.signal.aborted) return;
            e.preventDefault();
            if (e.touches.length > 0) {
                this.mouse.down = true;
                this.updateTouchPosition(e, canvas);
            }
        };
        
        const touchendListener = (e: TouchEvent) => {
            if (this.abortController.signal.aborted) return;
            e.preventDefault();
            this.mouse.down = false;
        };
        
        const touchmoveListener = (e: TouchEvent) => {
            if (this.abortController.signal.aborted) return;
            e.preventDefault();
            this.updateTouchPosition(e, canvas);
        };

        // Add event listeners with proper tracking
        const events = [
            { element: document, type: 'keydown', listener: keydownListener },
            { element: document, type: 'keyup', listener: keyupListener },
            { element: canvas, type: 'mousedown', listener: mousedownListener },
            { element: canvas, type: 'mouseup', listener: mouseupListener },
            { element: canvas, type: 'mousemove', listener: mousemoveListener },
            { element: canvas, type: 'touchstart', listener: touchstartListener },
            { element: canvas, type: 'touchend', listener: touchendListener },
            { element: canvas, type: 'touchmove', listener: touchmoveListener }
        ];

        // Add all event listeners and track them for cleanup
        events.forEach(({ element, type, listener }) => {
            element.addEventListener(type, listener as EventListener, { signal: this.abortController.signal });
            this.eventListeners.push({ element, type, listener: listener as (e: Event) => void });
        });

        // Setup resize observer with proper cleanup
        this.setupResizeObserver(canvas);
    }

    private setupResizeObserver(canvas: HTMLCanvasElement): void {
        try {
            this.resizeObserver = new ResizeObserver((entries) => {
                if (this.abortController.signal.aborted) return;
                
                for (const entry of entries) {
                    if (entry.target === canvas) {
                        // Handle canvas resize
                        this.handleCanvasResize(canvas);
                    }
                }
            });
            
            this.resizeObserver.observe(canvas);
        } catch (error) {
            console.warn('ResizeObserver not supported, falling back to window resize event');
            const resizeListener = () => {
                if (this.abortController.signal.aborted) return;
                this.handleCanvasResize(canvas);
            };
            
            window.addEventListener('resize', resizeListener, { signal: this.abortController.signal });
            this.eventListeners.push({ element: window, type: 'resize', listener: resizeListener });
        }
    }

    private handleCanvasResize(canvas: HTMLCanvasElement): void {
        try {
            // Update canvas size if needed
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        } catch (error) {
            console.warn('Error handling canvas resize:', error);
        }
    }

    public cleanup(): void {
        try {
            // Stop gamepad polling
            this.gamepad.stop();
            
            // Cleanup InputMap
            this.inputMap.cleanup();
            
            // Cleanup gamepad
            this.gamepad.cleanup();
            
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
            
            // Cleanup resize observer
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

    private updateTouchPosition(e: TouchEvent, canvas: HTMLCanvasElement): void {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();

            if (rect.width <= 0 || rect.height <= 0) {
                console.warn("Invalid canvas dimensions for touch position calculation");
                return;
            }

            if (!isFinite(touch.clientX) || !isFinite(touch.clientY)) {
                console.warn("Invalid client coordinates for touch position calculation");
                return;
            }

            this.mouse.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
            this.mouse.y = (touch.clientY - rect.top) * (canvas.height / rect.height);

            if (!isFinite(this.mouse.x) || !isFinite(this.mouse.y)) {
                console.warn("Non-finite touch coordinates calculated, resetting to zero");
                this.mouse.x = 0;
                this.mouse.y = 0;
            }
        }
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
        
        // Update gamepad state
        this.gamepad.poll();
        
        // Update InputMap with gamepad state
        this.inputMap.updateGamepadState();
    }

    /**
     * Check if an action is currently pressed (new action-based API)
     */
    isActionDown(action: Action): boolean {
        return this.inputMap.isDown(action);
    }

    /**
     * Check if an action was just pressed (new action-based API)
     */
    isActionPressed(action: Action): boolean {
        return this.inputMap.isPressed(action);
    }

    /**
     * Get the InputMap for rebinding and configuration
     */
    getInputMap(): InputMap {
        return this.inputMap;
    }

    /**
     * Get the Gamepad instance for configuration
     */
    getGamepad(): Gamepad {
        return this.gamepad;
    }

    /**
     * Update ground state for late jump buffer
     */
    updateGroundState(isOnGround: boolean): void {
        this.inputMap.updateGroundState(isOnGround);
    }

    /**
     * Update ledge grab state for sticky grab
     */
    updateLedgeGrabState(isLedgeGrabActive: boolean): void {
        this.inputMap.updateLedgeGrabState(isLedgeGrabActive);
    }
} 