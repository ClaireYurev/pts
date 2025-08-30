import { Entity } from "./Entity.js";

export class PhysicsEngine {
    // Configurable physics constants
    private static readonly DEFAULT_FLOOR_Y = 30000;
    private static readonly DEFAULT_MAX_VELOCITY = 2000;
    private static readonly DEFAULT_FRICTION = 0.99;
    
    private floorY: number = PhysicsEngine.DEFAULT_FLOOR_Y;
    private maxVelocity: number = PhysicsEngine.DEFAULT_MAX_VELOCITY;
    private friction: number = PhysicsEngine.DEFAULT_FRICTION;
    
    constructor(private gravity: number = 9.8) {
        // Validate gravity value
        if (!isFinite(gravity) || gravity < 0) {
            console.warn("Invalid gravity value provided, using default");
            this.gravity = 9.8;
        }
    }

        public update(entities: Entity[], dt: number): void {
        // Validate input parameters
        if (!entities || !Array.isArray(entities)) {
            console.warn("Invalid entities array provided to physics update");
            return;
        }
        
        // Validate delta time to prevent spiral of death
        if (!isFinite(dt) || dt < 0) {
            console.warn("Invalid delta time provided to physics update");
            return;
        }
        
        const clampedDt = Math.max(0, Math.min(dt, 1/30)); // Cap at 30 FPS equivalent
        
        for (const entity of entities) {
            if (!entity || !entity.isStatic) {
                // Apply gravity
                entity.velocity.y += this.gravity * clampedDt;
                
                // Apply friction
                entity.velocity.x *= this.friction;
                
                // Update position
                entity.position.x += entity.velocity.x * clampedDt;
                entity.position.y += entity.velocity.y * clampedDt;
                
                // Prevent infinite falling
                if (entity.position.y > this.floorY) {
                    entity.position.y = this.floorY;
                    entity.velocity.y = 0; // Stop falling
                }
                
                // Prevent NaN values and extreme values
                if (isNaN(entity.position.x) || isNaN(entity.position.y) ||
                    !isFinite(entity.position.x) || !isFinite(entity.position.y)) {
                    console.warn("Invalid position detected, resetting entity");
                    entity.position.x = 0;
                    entity.position.y = 0;
                    entity.velocity.x = 0;
                    entity.velocity.y = 0;
                }
                
                        // Prevent runaway velocity values
        if (Math.abs(entity.velocity.x) > this.maxVelocity) {
            entity.velocity.x = Math.sign(entity.velocity.x) * this.maxVelocity;
        }
        if (Math.abs(entity.velocity.y) > this.maxVelocity) {
            entity.velocity.y = Math.sign(entity.velocity.y) * this.maxVelocity;
        }
        
        // Ensure velocity values are finite
        if (!isFinite(entity.velocity.x) || !isFinite(entity.velocity.y)) {
            console.warn("Non-finite velocity detected, resetting to zero");
            entity.velocity.x = 0;
            entity.velocity.y = 0;
        }
            }
        }
    }

    public setGravity(gravity: number): void {
        this.gravity = gravity;
    }

    public getGravity(): number {
        return this.gravity;
    }

    public setFloorY(floorY: number): void {
        if (isFinite(floorY) && floorY > 0) {
            this.floorY = floorY;
        } else {
            console.warn("Invalid floor Y value provided");
        }
    }

    public getFloorY(): number {
        return this.floorY;
    }

    public setMaxVelocity(maxVelocity: number): void {
        if (isFinite(maxVelocity) && maxVelocity > 0) {
            this.maxVelocity = maxVelocity;
        } else {
            console.warn("Invalid max velocity value provided");
        }
    }

    public getMaxVelocity(): number {
        return this.maxVelocity;
    }

    public setFriction(friction: number): void {
        if (isFinite(friction) && friction >= 0 && friction <= 1) {
            this.friction = friction;
        } else {
            console.warn("Invalid friction value provided (must be between 0 and 1)");
        }
    }

    public getFriction(): number {
        return this.friction;
    }

    public configureForLevel(levelConfig: { gravity?: number; maxVelocity?: number; friction?: number; floorY?: number }): void {
        if (levelConfig.gravity !== undefined) {
            this.setGravity(levelConfig.gravity);
        }
        if (levelConfig.maxVelocity !== undefined) {
            this.setMaxVelocity(levelConfig.maxVelocity);
        }
        if (levelConfig.friction !== undefined) {
            this.setFriction(levelConfig.friction);
        }
        if (levelConfig.floorY !== undefined) {
            this.setFloorY(levelConfig.floorY);
        }
    }

    public applyForce(entity: Entity, forceX: number, forceY: number): void {
        if (!entity.isStatic) {
            entity.velocity.x += forceX;
            entity.velocity.y += forceY;
        }
    }

    public setVelocity(entity: Entity, velocityX: number, velocityY: number): void {
        if (!entity.isStatic) {
            entity.velocity.x = velocityX;
            entity.velocity.y = velocityY;
        }
    }
} 