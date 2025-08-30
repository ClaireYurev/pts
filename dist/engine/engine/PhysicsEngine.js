export class PhysicsEngine {
    constructor(gravity = 9.8) {
        this.gravity = gravity;
        this.floorY = PhysicsEngine.DEFAULT_FLOOR_Y;
        this.maxVelocity = PhysicsEngine.DEFAULT_MAX_VELOCITY;
        this.friction = PhysicsEngine.DEFAULT_FRICTION;
        // Validate gravity value
        if (!isFinite(gravity) || gravity < 0) {
            console.warn("Invalid gravity value provided, using default");
            this.gravity = 9.8;
        }
    }
    update(entities, dt) {
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
        const clampedDt = Math.max(0, Math.min(dt, 1 / 30)); // Cap at 30 FPS equivalent
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
    setGravity(gravity) {
        this.gravity = gravity;
    }
    getGravity() {
        return this.gravity;
    }
    setFloorY(floorY) {
        if (isFinite(floorY) && floorY > 0) {
            this.floorY = floorY;
        }
        else {
            console.warn("Invalid floor Y value provided");
        }
    }
    getFloorY() {
        return this.floorY;
    }
    setMaxVelocity(maxVelocity) {
        if (isFinite(maxVelocity) && maxVelocity > 0) {
            this.maxVelocity = maxVelocity;
        }
        else {
            console.warn("Invalid max velocity value provided");
        }
    }
    getMaxVelocity() {
        return this.maxVelocity;
    }
    setFriction(friction) {
        if (isFinite(friction) && friction >= 0 && friction <= 1) {
            this.friction = friction;
        }
        else {
            console.warn("Invalid friction value provided (must be between 0 and 1)");
        }
    }
    getFriction() {
        return this.friction;
    }
    configureForLevel(levelConfig) {
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
    applyForce(entity, forceX, forceY) {
        if (!entity.isStatic) {
            entity.velocity.x += forceX;
            entity.velocity.y += forceY;
        }
    }
    setVelocity(entity, velocityX, velocityY) {
        if (!entity.isStatic) {
            entity.velocity.x = velocityX;
            entity.velocity.y = velocityY;
        }
    }
}
// Configurable physics constants
PhysicsEngine.DEFAULT_FLOOR_Y = 30000;
PhysicsEngine.DEFAULT_MAX_VELOCITY = 2000;
PhysicsEngine.DEFAULT_FRICTION = 0.99;
//# sourceMappingURL=PhysicsEngine.js.map