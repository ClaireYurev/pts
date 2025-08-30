import { Renderer } from "./Renderer.js";
import { InputMap, Action } from "./input/InputMap.js";
import { Gamepad } from "./input/Gamepad.js";
export declare class InputHandler {
    private keys;
    private mouse;
    private previousKeys;
    private eventListeners;
    private resizeObserver?;
    private abortController;
    private inputMap;
    private gamepad;
    constructor(canvas: HTMLCanvasElement);
    private setupEventListeners;
    cleanup(): void;
    private updateMousePosition;
    handleCanvasResize(canvas: HTMLCanvasElement): void;
    private updateMousePositionFromLastEvent;
    isKeyDown(keyCode: string): boolean;
    isKeyPressed(keyCode: string): boolean;
    isKeyReleased(keyCode: string): boolean;
    getMousePosition(): {
        x: number;
        y: number;
        down: boolean;
    };
    getMousePositionInternal(renderer: Renderer): {
        x: number;
        y: number;
        down: boolean;
    };
    getAxis(): {
        x: number;
        y: number;
    };
    debugKeys(): void;
    update(): void;
    /**
     * Check if an action is currently pressed (new action-based API)
     */
    isActionDown(action: Action): boolean;
    /**
     * Check if an action was just pressed (new action-based API)
     */
    isActionPressed(action: Action): boolean;
    /**
     * Get the InputMap for rebinding and configuration
     */
    getInputMap(): InputMap;
    /**
     * Get the Gamepad instance for configuration
     */
    getGamepad(): Gamepad;
    /**
     * Update ground state for late jump buffer
     */
    updateGroundState(isOnGround: boolean): void;
    /**
     * Update ledge grab state for sticky grab
     */
    updateLedgeGrabState(isLedgeGrabActive: boolean): void;
}
//# sourceMappingURL=InputHandler.d.ts.map