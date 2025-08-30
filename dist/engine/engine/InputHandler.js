export class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.previousKeys = {};
        this.eventListeners = [];
        this.setupEventListeners(canvas);
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
        // Add event listeners
        window.addEventListener("keydown", keydownListener);
        window.addEventListener("keyup", keyupListener);
        canvas.addEventListener("mousedown", mousedownListener);
        canvas.addEventListener("mouseup", mouseupListener);
        canvas.addEventListener("mousemove", mousemoveListener);
        canvas.addEventListener("contextmenu", contextmenuListener);
        window.addEventListener("focus", focusListener);
        window.addEventListener("blur", blurListener);
        // Store references for cleanup
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
        // Remove all event listeners
        for (const { element, type, listener } of this.eventListeners) {
            element.removeEventListener(type, listener);
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
    }
    updateMousePosition(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    }
    handleCanvasResize(canvas) {
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
        // Convert display coordinates to internal game coordinates
        const displayPos = this.getMousePosition();
        const internalPos = renderer.displayToInternal(displayPos.x, displayPos.y);
        return { x: internalPos.x, y: internalPos.y, down: displayPos.down };
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
    }
}
//# sourceMappingURL=InputHandler.js.map