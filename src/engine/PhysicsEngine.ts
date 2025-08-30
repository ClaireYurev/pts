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
            if (!entity) {
                console.warn("Null entity encountered in physics update, skipping");
                continue;
            }
            
            if (!entity.isStatic) {
                // Validate entity properties before physics calculations
                if (!this.validateEntity(entity)) {
                    console.warn("Invalid entity detected, resetting to safe values");
                    this.resetEntityToSafeState(entity);
                    continue;
                }
                
                // Apply gravity with bounds checking
                const gravityForce = this.gravity * clampedDt;
                if (isFinite(gravityForce)) {
                    entity.velocity.y += gravityForce;
                }
                
                // Apply friction with bounds checking
                const frictionFactor = Math.max(0, Math.min(1, this.friction));
                entity.velocity.x *= frictionFactor;
                
                // Update position with bounds checking
                const deltaX = entity.velocity.x * clampedDt;
                const deltaY = entity.velocity.y * clampedDt;
                
                if (isFinite(deltaX) && isFinite(deltaY)) {
                    entity.position.x += deltaX;
                    entity.position.y += deltaY;
                }
                
                // Prevent infinite falling
                if (entity.position.y > this.floorY) {
                    entity.position.y = this.floorY;
                    entity.velocity.y = 0; // Stop falling
                }
                
                // Prevent NaN values and extreme values
                if (!this.validateEntityPosition(entity)) {
                    console.warn("Invalid position detected, resetting entity");
                    this.resetEntityToSafeState(entity);
                    continue;
                }
                
                // Prevent runaway velocity values
                if (Math.abs(entity.velocity.x) > this.maxVelocity) {
                    entity.velocity.x = Math.sign(entity.velocity.x) * this.maxVelocity;
                }
                if (Math.abs(entity.velocity.y) > this.maxVelocity) {
                    entity.velocity.y = Math.sign(entity.velocity.y) * this.maxVelocity;
                }
                
                // Validate final state
                if (!this.validateEntity(entity)) {
                    console.warn("Entity became invalid after physics update, resetting");
                    this.resetEntityToSafeState(entity);
                }
            }
        }
    }

    /**
     * Validate entity properties
     */
    private validateEntity(entity: Entity): boolean {
        if (!entity || typeof entity !== 'object') {
            return false;
        }
        
        // Check if entity has required properties
        if (!entity.position || !entity.velocity) {
            return false;
        }
        
        // Validate position
        if (!this.validateEntityPosition(entity)) {
            return false;
        }
        
        // Validate velocity
        if (!this.validateEntityVelocity(entity)) {
            return false;
        }
        
        return true;
    }

    /**
     * Validate entity position
     */
    private validateEntityPosition(entity: Entity): boolean {
        if (!entity.position) {
            return false;
        }
        
        const { x, y } = entity.position;
        
        // Check for NaN or infinite values
        if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
            return false;
        }
        
        // Check for extreme values (prevent entities from going too far)
        const maxPosition = 1000000; // 1 million units
        if (Math.abs(x) > maxPosition || Math.abs(y) > maxPosition) {
            return false;
        }
        
        return true;
    }

    /**
     * Validate entity velocity
     */
    private validateEntityVelocity(entity: Entity): boolean {
        if (!entity.velocity) {
            return false;
        }
        
        const { x, y } = entity.velocity;
        
        // Check for NaN or infinite values
        if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
            return false;
        }
        
        // Check for extreme values
        const maxVelocity = 10000; // 10,000 units per second
        if (Math.abs(x) > maxVelocity || Math.abs(y) > maxVelocity) {
            return false;
        }
        
        return true;
    }

    /**
     * Reset entity to safe state
     */
    private resetEntityToSafeState(entity: Entity): void {
        if (!entity) {
            return;
        }
        
        try {
            // Reset position to origin
            if (entity.position) {
                entity.position.x = 0;
                entity.position.y = 0;
            }
            
            // Reset velocity to zero
            if (entity.velocity) {
                entity.velocity.x = 0;
                entity.velocity.y = 0;
            }
            
            // Reset other properties if they exist
            if ('health' in entity && typeof entity.health === 'number') {
                entity.health = Math.max(0, Math.min(9999, entity.health || 100));
            }
            
            console.log("Entity reset to safe state");
        } catch (error) {
            console.error("Error resetting entity to safe state:", error);
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