import { Renderer } from "../engine/Renderer.js";
import { InputHandler } from "../engine/InputHandler.js";
export declare class FreeCamera {
    private renderer;
    enabled: boolean;
    private camX;
    private camY;
    private speed;
    private sprintMultiplier;
    constructor(renderer: Renderer);
    update(input: InputHandler, dt: number): void;
    toggle(): void;
    setPosition(x: number, y: number): void;
    getPosition(): {
        x: number;
        y: number;
    };
    resetToPlayer(playerX: number, playerY: number, canvasWidth: number, canvasHeight: number): void;
}
//# sourceMappingURL=FreeCamera.d.ts.map