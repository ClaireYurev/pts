export interface Vector2 {
    x: number;
    y: number;
}
export declare class Vec2 implements Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    static add(a: Vector2, b: Vector2): Vec2;
    static subtract(a: Vector2, b: Vector2): Vec2;
    static multiply(v: Vector2, scalar: number): Vec2;
    static distance(a: Vector2, b: Vector2): number;
    static normalize(v: Vector2): Vec2;
}
//# sourceMappingURL=Vector2.d.ts.map