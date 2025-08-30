export interface Vector2 {
    x: number;
    y: number;
}

export class Vec2 implements Vector2 {
    constructor(public x: number = 0, public y: number = 0) {}

    static add(a: Vector2, b: Vector2): Vec2 {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    static subtract(a: Vector2, b: Vector2): Vec2 {
        return new Vec2(a.x - b.x, a.y - b.y);
    }

    static multiply(v: Vector2, scalar: number): Vec2 {
        return new Vec2(v.x * scalar, v.y * scalar);
    }

    static distance(a: Vector2, b: Vector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static normalize(v: Vector2): Vec2 {
        const length = Math.sqrt(v.x * v.x + v.y * v.y);
        // Handle division by zero and very small values
        if (length < 0.0001) return new Vec2(0, 0);
        return new Vec2(v.x / length, v.y / length);
    }
} 