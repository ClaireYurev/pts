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
export declare class FreeCamera {
    private enabled;
    private position;
    private velocity;
    private target;
    private config;
    private keys;
    constructor(config?: FreeCameraConfig);
    /**
     * Enable/disable free camera
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if free camera is enabled
     */
    isEnabled(): boolean;
    /**
     * Set camera position
     */
    setPosition(x: number, y: number): void;
    /**
     * Get current camera position
     */
    getPosition(): Vec2;
    /**
     * Set camera target (for smooth movement)
     */
    setTarget(x: number, y: number): void;
    /**
     * Get camera target
     */
    getTarget(): Vec2;
    /**
     * Handle key press
     */
    onKeyDown(key: string): void;
    /**
     * Handle key release
     */
    onKeyUp(key: string): void;
    /**
     * Update camera movement
     */
    update(deltaTime: number): void;
    /**
     * Linear interpolation helper
     */
    private lerp;
    /**
     * Set camera bounds
     */
    setBounds(bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }): void;
    /**
     * Clear camera bounds
     */
    clearBounds(): void;
    /**
     * Set camera speed
     */
    setSpeed(speed: number): void;
    /**
     * Set camera acceleration
     */
    setAcceleration(acceleration: number): void;
    /**
     * Set max speed
     */
    setMaxSpeed(maxSpeed: number): void;
    /**
     * Get debug info
     */
    getDebugInfo(): Record<string, any>;
    /**
     * Reset camera to origin
     */
    reset(): void;
}
//# sourceMappingURL=FreeCamera.d.ts.map