import { Entity } from "./Entity.js";
export declare class PhysicsEngine {
    private gravity;
    private static readonly DEFAULT_FLOOR_Y;
    private static readonly DEFAULT_MAX_VELOCITY;
    private static readonly DEFAULT_FRICTION;
    private floorY;
    private maxVelocity;
    private friction;
    constructor(gravity?: number);
    update(entities: Entity[], dt: number): void;
    setGravity(gravity: number): void;
    getGravity(): number;
    setFloorY(floorY: number): void;
    getFloorY(): number;
    setMaxVelocity(maxVelocity: number): void;
    getMaxVelocity(): number;
    setFriction(friction: number): void;
    getFriction(): number;
    configureForLevel(levelConfig: {
        gravity?: number;
        maxVelocity?: number;
        friction?: number;
        floorY?: number;
    }): void;
    applyForce(entity: Entity, forceX: number, forceY: number): void;
    setVelocity(entity: Entity, velocityX: number, velocityY: number): void;
}
//# sourceMappingURL=PhysicsEngine.d.ts.map