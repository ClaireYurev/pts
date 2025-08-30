import { Renderer } from "./Renderer.js";
export declare class InputHandler {
    private keys;
    private mouse;
    private previousKeys;
    private eventListeners;
    private resizeObserver?;
    private abortController;
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
}
//# sourceMappingURL=InputHandler.d.ts.map