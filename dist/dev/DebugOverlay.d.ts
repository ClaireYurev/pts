import { Renderer } from "../engine/Renderer.js";
import { Entity } from "../engine/Entity.js";
export declare class DebugOverlay {
    private renderer;
    enabled: boolean;
    constructor(renderer: Renderer);
    render(fps: number, playerX: number, playerY: number, playerVelocityX: number, playerVelocityY: number): void;
    drawBoundingBox(x: number, y: number, w: number, h: number, color?: string): void;
    drawEntityBoxes(entities: Entity[]): void;
    drawGrid(gridSize?: number, color?: string): void;
    toggle(): void;
}
//# sourceMappingURL=DebugOverlay.d.ts.map