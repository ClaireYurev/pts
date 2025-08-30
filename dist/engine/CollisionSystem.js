// Simple spatial partitioning using a grid system
class SpatialGrid {
    constructor(cellSize = 64) {
        this.grid = new Map();
        this.cellSize = cellSize;
    }
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }
    getCellsForEntity(entity) {
        const collider = entity.getCollider();
        const startX = Math.floor(collider.x / this.cellSize);
        const endX = Math.floor((collider.x + collider.width) / this.cellSize);
        const startY = Math.floor(collider.y / this.cellSize);
        const endY = Math.floor((collider.y + collider.height) / this.cellSize);
        const cells = [];
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                cells.push(`${x},${y}`);
            }
        }
        return cells;
    }
    clear() {
        this.grid.clear();
    }
    insert(entity) {
        const cells = this.getCellsForEntity(entity);
        for (const cellKey of cells) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, []);
            }
            const cellEntities = this.grid.get(cellKey);
            if (cellEntities) {
                cellEntities.push(entity);
            }
        }
    }
    getNearbyEntities(entity) {
        const cells = this.getCellsForEntity(entity);
        const nearby = new Set();
        for (const cellKey of cells) {
            const cellEntities = this.grid.get(cellKey);
            if (cellEntities) {
                for (const cellEntity of cellEntities) {
                    if (cellEntity !== entity) {
                        nearby.add(cellEntity);
                    }
                }
            }
        }
        return Array.from(nearby);
    }
}
export class CollisionSystem {
    constructor() {
        this.lastEntityCount = 0;
        this.spatialGrid = new SpatialGrid(64); // 64x64 pixel cells
    }
    checkCollision(a, b) {
        // Validate input parameters
        if (!a || !b) {
            console.warn("Invalid collider provided to checkCollision");
            return false;
        }
        // Check for invalid dimensions
        if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) {
            console.warn("Invalid collider dimensions detected");
            return false;
        }
        return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
    }
    resolveCollision(a, b, cheatManager) {
        if (this.checkCollision(a.getCollider(), b.getCollider())) {
            // Check for NoClip cheat - only skip collision if the player entity is involved
            if (cheatManager && cheatManager.isActive && cheatManager.isActive('NoClip')) {
                // Assume first entity in the game is the player (this should be improved with proper player identification)
                // For now, we'll skip collision if either entity is the first one (player)
                const isPlayerInvolved = (a === this.getPlayerEntity?.() || b === this.getPlayerEntity?.());
                if (isPlayerInvolved) {
                    // Skip collision resolution for NoClip when player is involved
                    return;
                }
            }
            // Simple collision response - stop vertical movement
            if (!a.isStatic) {
                a.velocity.y = 0;
            }
            if (!b.isStatic) {
                b.velocity.y = 0;
            }
            // Adjust positions to prevent overlap
            this.separateEntities(a, b);
        }
    }
    setPlayerEntityGetter(getter) {
        this.getPlayerEntity = getter;
    }
    separateEntities(a, b) {
        const colliderA = a.getCollider();
        const colliderB = b.getCollider();
        // Calculate overlap
        const overlapX = Math.min(colliderA.x + colliderA.width - colliderB.x, colliderB.x + colliderB.width - colliderA.x);
        const overlapY = Math.min(colliderA.y + colliderA.height - colliderB.y, colliderB.y + colliderB.height - colliderA.y);
        // Separate along the axis with less overlap
        if (overlapX < overlapY) {
            if (colliderA.x < colliderB.x) {
                if (!a.isStatic)
                    a.position.x -= overlapX;
                if (!b.isStatic)
                    b.position.x += overlapX;
            }
            else {
                if (!a.isStatic)
                    a.position.x += overlapX;
                if (!b.isStatic)
                    b.position.x -= overlapX;
            }
        }
        else {
            if (colliderA.y < colliderB.y) {
                if (!a.isStatic)
                    a.position.y -= overlapY;
                if (!b.isStatic)
                    b.position.y += overlapY;
            }
            else {
                if (!a.isStatic)
                    a.position.y += overlapY;
                if (!b.isStatic)
                    b.position.y -= overlapY;
            }
        }
    }
    checkCollisions(entities) {
        // Validate input
        if (!entities || entities.length === 0) {
            return;
        }
        // Use spatial partitioning for collision detection
        this.spatialGrid.clear();
        for (const entity of entities) {
            if (entity) {
                this.spatialGrid.insert(entity);
            }
        }
        // Check collisions using spatial partitioning
        for (const entity of entities) {
            if (!entity)
                continue;
            const nearbyEntities = this.spatialGrid.getNearbyEntities(entity);
            for (const other of nearbyEntities) {
                if (!other || entity === other)
                    continue;
                this.resolveCollision(entity, other);
            }
        }
    }
    isOnGround(entity, groundEntities) {
        // Validate input parameters
        if (!entity) {
            console.warn("Invalid entity provided to isOnGround");
            return false;
        }
        if (!groundEntities || groundEntities.length === 0) {
            return false;
        }
        const entityCollider = entity.getCollider();
        for (const ground of groundEntities) {
            if (!ground || !ground.isStatic)
                continue;
            const groundCollider = ground.getCollider();
            // Check if entity is horizontally overlapping with ground
            const horizontalOverlap = (entityCollider.x < groundCollider.x + groundCollider.width &&
                entityCollider.x + entityCollider.width > groundCollider.x);
            if (horizontalOverlap) {
                const entityBottom = entityCollider.y + entityCollider.height;
                const groundTop = groundCollider.y;
                const distance = entityBottom - groundTop;
                // If entity bottom is close to or slightly below ground top, consider it on ground
                if (distance >= -5 && distance <= 10) {
                    return true;
                }
            }
        }
        return false;
    }
}
//# sourceMappingURL=CollisionSystem.js.map