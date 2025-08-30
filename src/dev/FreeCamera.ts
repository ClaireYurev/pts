import { Vec2 } from '../engine/Vector2.js';

export interface FreeCameraConfig {
    enabled?: boolean;
    speed?: number;
    acceleration?: number;
    maxSpeed?: number;
    bounds?: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
}

export class FreeCamera {
    private enabled: boolean = false;
    private position: Vec2 = new Vec2(0, 0);
    private velocity: Vec2 = new Vec2(0, 0);
    private target: Vec2 = new Vec2(0, 0);
    private config: FreeCameraConfig;
    private keys: Set<string> = new Set();

    constructor(config: FreeCameraConfig = {}) {
        this.config = {
            enabled: false,
            speed: 200,
            acceleration: 800,
            maxSpeed: 400,
            ...config
        };
    }

    /**
     * Enable/disable free camera
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            // Reset velocity when disabling
            this.velocity = new Vec2(0, 0);
        }
    }

    /**
     * Check if free camera is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Set camera position
     */
    setPosition(x: number, y: number): void {
        this.position = new Vec2(x, y);
        this.target = new Vec2(x, y);
    }

    /**
     * Get current camera position
     */
    getPosition(): Vec2 {
        return new Vec2(this.position.x, this.position.y);
    }

    /**
     * Set camera target (for smooth movement)
     */
    setTarget(x: number, y: number): void {
        this.target = new Vec2(x, y);
    }

    /**
     * Get camera target
     */
    getTarget(): Vec2 {
        return new Vec2(this.target.x, this.target.y);
    }

    /**
     * Handle key press
     */
    onKeyDown(key: string): void {
        if (!this.enabled) return;
        this.keys.add(key.toLowerCase());
    }

    /**
     * Handle key release
     */
    onKeyUp(key: string): void {
        if (!this.enabled) return;
        this.keys.delete(key.toLowerCase());
    }

    /**
     * Update camera movement
     */
    update(deltaTime: number): void {
        if (!this.enabled) return;

        const speed = this.config.speed || 200;
        const acceleration = this.config.acceleration || 800;
        const maxSpeed = this.config.maxSpeed || 400;

        // Calculate input direction
        let inputX = 0;
        let inputY = 0;

        if (this.keys.has('w') || this.keys.has('arrowup')) {
            inputY -= 1;
        }
        if (this.keys.has('s') || this.keys.has('arrowdown')) {
            inputY += 1;
        }
        if (this.keys.has('a') || this.keys.has('arrowleft')) {
            inputX -= 1;
        }
        if (this.keys.has('d') || this.keys.has('arrowright')) {
            inputX += 1;
        }

        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
            inputX *= 0.707; // 1/√2
            inputY *= 0.707;
        }

        // Calculate target velocity
        const targetVelocity = new Vec2(
            inputX * speed,
            inputY * speed
        );

        // Smooth acceleration towards target velocity
        const accelerationStep = acceleration * deltaTime;
        
        if (targetVelocity.x !== 0) {
            this.velocity.x = this.lerp(this.velocity.x, targetVelocity.x, accelerationStep);
        } else {
            this.velocity.x = this.lerp(this.velocity.x, 0, accelerationStep * 2); // Faster deceleration
        }

        if (targetVelocity.y !== 0) {
            this.velocity.y = this.lerp(this.velocity.y, targetVelocity.y, accelerationStep);
        } else {
            this.velocity.y = this.lerp(this.velocity.y, 0, accelerationStep * 2); // Faster deceleration
        }

        // Clamp velocity to max speed
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Apply bounds if configured
        if (this.config.bounds) {
            const bounds = this.config.bounds;
            this.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, this.position.x));
            this.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, this.position.y));
        }

        // Update target to match position
        this.target = new Vec2(this.position.x, this.position.y);
    }

    /**
     * Linear interpolation helper
     */
    private lerp(start: number, end: number, factor: number): number {
        return start + (end - start) * Math.min(1, factor);
    }

    /**
     * Set camera bounds
     */
    setBounds(bounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
        this.config.bounds = bounds;
    }

    /**
     * Clear camera bounds
     */
    clearBounds(): void {
        this.config.bounds = undefined;
    }

    /**
     * Set camera speed
     */
    setSpeed(speed: number): void {
        this.config.speed = speed;
    }

    /**
     * Set camera acceleration
     */
    setAcceleration(acceleration: number): void {
        this.config.acceleration = acceleration;
    }

    /**
     * Set max speed
     */
    setMaxSpeed(maxSpeed: number): void {
        this.config.maxSpeed = maxSpeed;
    }

    /**
     * Get debug info
     */
    getDebugInfo(): Record<string, any> {
        return {
            enabled: this.enabled,
            position: { x: this.position.x, y: this.position.y },
            velocity: { x: this.velocity.x, y: this.velocity.y },
            target: { x: this.target.x, y: this.target.y },
            keys: Array.from(this.keys),
            config: this.config
        };
    }

    /**
     * Reset camera to origin
     */
    reset(): void {
        this.position = new Vec2(0, 0);
        this.target = new Vec2(0, 0);
        this.velocity = new Vec2(0, 0);
        this.keys.clear();
    }
} 