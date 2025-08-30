export interface CameraState {
    x: number;
    y: number;
    zoom: number;
    targetX: number;
    targetY: number;
    isFollowing: boolean;
}
export interface FreeCameraConfig {
    panSpeed: number;
    zoomSpeed: number;
    maxZoom: number;
    minZoom: number;
    smoothFollow: boolean;
    followSpeed: number;
}
export declare class FreeCamera {
    private state;
    private config;
    private _isEnabled;
    private isActive;
    private keys;
    private targetEntity;
    constructor();
    /**
     * Enable/disable free camera
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get enabled state
     */
    isEnabled(): boolean;
    /**
     * Toggle free camera mode
     */
    toggle(): void;
    /**
     * Update camera position and state
     */
    update(deltaTime: number): void;
    /**
     * Set camera position
     */
    setPosition(x: number, y: number): void;
    /**
     * Set camera zoom
     */
    setZoom(zoom: number): void;
    /**
     * Set target entity for following
     */
    setTarget(entity: any): void;
    /**
     * Get current camera state
     */
    getState(): CameraState;
    /**
     * Get camera position
     */
    getPosition(): {
        x: number;
        y: number;
    };
    /**
     * Get camera zoom
     */
    getZoom(): number;
    /**
     * Check if free camera is active
     */
    isFreeCameraActive(): boolean;
    /**
     * Check if camera should follow target
     */
    shouldFollowTarget(): boolean;
    /**
     * Update camera to follow target entity
     */
    updateFollowTarget(deltaTime: number): void;
    /**
     * Handle keyboard input for camera movement
     */
    private handleKeyboardInput;
    /**
     * Handle mouse input for camera movement
     */
    private handleMouseInput;
    /**
     * Setup input handling
     */
    private setupInputHandling;
    /**
     * Check if key is used for camera control
     */
    private isCameraKey;
    /**
     * Reset camera to default position
     */
    private resetCamera;
    /**
     * Center camera on target entity
     */
    private centerOnTarget;
    /**
     * Get camera configuration
     */
    getConfig(): FreeCameraConfig;
    /**
     * Set camera configuration
     */
    setConfig(config: Partial<FreeCameraConfig>): void;
    /**
     * Get camera bounds (useful for UI positioning)
     */
    getCameraBounds(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): {
        x: number;
        y: number;
    };
    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number): {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=FreeCamera.d.ts.map