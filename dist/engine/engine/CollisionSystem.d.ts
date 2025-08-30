import { Entity, Collider } from "./Entity.js";
export declare class CollisionSystem {
    checkCollision(a: Collider, b: Collider): boolean;
    resolveCollision(a: Entity, b: Entity, cheatManager?: {
        isActive: (flag: string) => boolean;
    }): void;
    private getPlayerEntity?;
    setPlayerEntityGetter(getter: () => Entity | null): void;
    private separateEntities;
    checkCollisions(entities: Entity[]): void;
    isOnGround(entity: Entity, groundEntities: Entity[]): boolean;
}
