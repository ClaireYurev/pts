import { Vector2 } from "./Vector2.js";
import { AnimationController } from "./AnimationController.js";
export interface Collider {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class Entity {
    position: Vector2;
    velocity: Vector2;
    isStatic: boolean;
    animationController: AnimationController;
    width: number;
    height: number;
    health: number;
    inventory: string[];
    id: string;
    previousPosition: Vector2;
    constructor(x?: number, y?: number);
    getCollider(): Collider;
    update(dt: number): void;
    takeDamage(damage: number): void;
    heal(amount: number): void;
    addToInventory(item: string): void;
    hasItem(item: string): boolean;
}
//# sourceMappingURL=Entity.d.ts.map