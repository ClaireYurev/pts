import { InputMap } from "./input/InputMap.js";
import { Gamepad } from "./input/Gamepad.js";
export class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.previousKeys = {};
        this.eventListeners = [];
        this.abortController = new AbortController();
        // Initialize new input system
        this.inputMap = new InputMap();
        this.gamepad = new Gamepad();
        this.setupEventListeners(canvas);
        this.gamepad.start();
    }
    setupEventListeners(canvas) {
        // Keyboard events
        const keydownListener = (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        };
        const keyupListener = (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        };
        // Mouse events
        const mousedownListener = (e) => {
            this.mouse.down = true;
            this.updateMousePosition(e, canvas);
            e.preventDefault();
        };
        const mouseupListener = (e) => {
            this.mouse.down = false;
            this.updateMousePosition(e, canvas);
            e.preventDefault();
        };
        const mousemoveListener = (e) => {
            this.updateMousePosition(e, canvas);
        };
        const contextmenuListener = (e) => {
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
            { element: window, type: "keydown", listener: keydownListener },
            { element: window, type: "keyup", listener: keyupListener },
            { element: canvas, type: "mousedown", listener: mousedownListener },
            { element: canvas, type: "mouseup", listener: mouseupListener },
            { element: canvas, type: "mousemove", listener: mousemoveListener },
            { element: canvas, type: "contextmenu", listener: contextmenuListener },
            { element: window, type: "focus", listener: focusListener },
            { element: window, type: "blur", listener: blurListener }
        ];
    }
    cleanup() {
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
                }
                catch (error) {
                    console.warn(`Failed to remove event listener for ${type}:`, error);
                }
            }
            this.eventListeners = [];
            // Cleanup resize observer
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = undefined;
            }
            console.log("InputHandler cleanup completed successfully");
        }
        catch (error) {
            console.error("Error during InputHandler cleanup:", error);
        }
    }
    updateMousePosition(e, canvas) {
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
        }
        catch (error) {
            console.error("Error updating mouse position:", error);
            this.mouse.x = 0;
            this.mouse.y = 0;
        }
    }
    handleCanvasResize(canvas) {
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
        }
        catch (error) {
            console.error("Error handling canvas resize:", error);
        }
    }
    updateMousePositionFromLastEvent(canvas) {
        // This would need to be called with the last mouse event
        // For now, we'll just log that resize happened
        console.log("Canvas dimensions changed, mouse coordinates may be inaccurate");
    }
    isKeyDown(keyCode) {
        return !!this.keys[keyCode];
    }
    isKeyPressed(keyCode) {
        return this.keys[keyCode] && !this.previousKeys[keyCode];
    }
    isKeyReleased(keyCode) {
        return !this.keys[keyCode] && this.previousKeys[keyCode];
    }
    getMousePosition() {
        return { ...this.mouse };
    }
    getMousePositionInternal(renderer) {
        try {
            // Convert display coordinates to internal game coordinates
            const displayPos = this.getMousePosition();
            const internalPos = renderer.displayToInternal(displayPos.x, displayPos.y);
            return { x: internalPos.x, y: internalPos.y, down: displayPos.down };
        }
        catch (error) {
            console.error("Error converting mouse position to internal coordinates:", error);
            return { x: 0, y: 0, down: false };
        }
    }
    getAxis() {
        let x = 0, y = 0;
        if (this.isKeyDown("KeyA") || this.isKeyDown("ArrowLeft"))
            x--;
        if (this.isKeyDown("KeyD") || this.isKeyDown("ArrowRight"))
            x++;
        if (this.isKeyDown("KeyW") || this.isKeyDown("ArrowUp"))
            y--;
        if (this.isKeyDown("KeyS") || this.isKeyDown("ArrowDown"))
            y++;
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
    debugKeys() {
        console.log("Current keys:", Object.keys(this.keys).filter(key => this.keys[key]));
    }
    update() {
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
    isActionDown(action) {
        return this.inputMap.isDown(action);
    }
    /**
     * Check if an action was just pressed (new action-based API)
     */
    isActionPressed(action) {
        return this.inputMap.isPressed(action);
    }
    /**
     * Get the InputMap for rebinding and configuration
     */
    getInputMap() {
        return this.inputMap;
    }
    /**
     * Get the Gamepad instance for configuration
     */
    getGamepad() {
        return this.gamepad;
    }
    /**
     * Update ground state for late jump buffer
     */
    updateGroundState(isOnGround) {
        this.inputMap.updateGroundState(isOnGround);
    }
    /**
     * Update ledge grab state for sticky grab
     */
    updateLedgeGrabState(isLedgeGrabActive) {
        this.inputMap.updateLedgeGrabState(isLedgeGrabActive);
    }
}
//# sourceMappingURL=InputHandler.js.map