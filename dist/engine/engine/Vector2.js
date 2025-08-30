export class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }
    static subtract(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }
    static multiply(v, scalar) {
        return new Vec2(v.x * scalar, v.y * scalar);
    }
    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static normalize(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y);
        // Handle division by zero and very small values
        if (length < 0.0001)
            return new Vec2(0, 0);
        return new Vec2(v.x / length, v.y / length);
    }
}
//# sourceMappingURL=Vector2.js.map