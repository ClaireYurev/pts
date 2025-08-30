import { Vector2, Vec2 } from "./Vector2.js";
import { AnimationController } from "./AnimationController.js";

export interface Collider {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Entity {
    public position: Vector2;
    public velocity: Vector2;
    public isStatic: boolean = false;
    public animationController: AnimationController;
    public width: number = 32;
    public height: number = 32;
    public health: number = 100;
    public inventory: string[] = [];

    constructor(x: number = 0, y: number = 0) {
        this.position = new Vec2(x, y);
        this.velocity = new Vec2(0, 0);
        this.animationController = new AnimationController();
    }

    public getCollider(): Collider {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }

    public update(dt: number): void {
        // Validate delta time
        if (!isFinite(dt) || dt < 0) {
            console.warn("Invalid delta time provided to entity update");
            return;
        }
        
        const clampedDt = Math.max(0, Math.min(dt, 1/30)); // Cap at 30 FPS equivalent
        
        if (!this.isStatic) {
            this.position.x += this.velocity.x * clampedDt;
            this.position.y += this.velocity.y * clampedDt;
            
            // Validate position values
            if (!isFinite(this.position.x) || !isFinite(this.position.y)) {
                console.warn("Invalid position values detected, resetting entity");
                this.position.x = 0;
                this.position.y = 0;
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
        
        if (this.animationController) {
            this.animationController.update(clampedDt);
        }
    }

    public takeDamage(damage: number): void {
        // This will be overridden by game-specific logic that checks for GodMode
        this.health = Math.max(0, this.health - damage);
    }

    public heal(amount: number): void {
        this.health = Math.min(100, this.health + amount);
    }

    public addToInventory(item: string): void {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
        }
    }

    public hasItem(item: string): boolean {
        return this.inventory.includes(item);
    }
} 