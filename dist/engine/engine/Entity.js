import { Vec2 } from "./Vector2.js";
import { AnimationController } from "./AnimationController.js";
export class Entity {
    constructor(x = 0, y = 0) {
        this.isStatic = false;
        this.width = 32;
        this.height = 32;
        this.health = 100;
        this.inventory = [];
        this.position = new Vec2(x, y);
        this.velocity = new Vec2(0, 0);
        this.animationController = new AnimationController();
    }
    getCollider() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }
    update(dt) {
        // Validate delta time
        if (!isFinite(dt) || dt < 0) {
            console.warn("Invalid delta time provided to entity update");
            return;
        }
        const clampedDt = Math.max(0, Math.min(dt, 1 / 30)); // Cap at 30 FPS equivalent
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
    takeDamage(damage) {
        // This will be overridden by game-specific logic that checks for GodMode
        this.health = Math.max(0, this.health - damage);
    }
    heal(amount) {
        this.health = Math.min(100, this.health + amount);
    }
    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
        }
    }
    hasItem(item) {
        return this.inventory.includes(item);
    }
}
//# sourceMappingURL=Entity.js.map