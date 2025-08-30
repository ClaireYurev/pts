export interface GamepadConfig {
    deadzonePct: number;
    pollInterval: number;
    maxGamepads: number;
}
export interface GamepadButton {
    pressed: boolean;
    value: number;
    touched: boolean;
}
export interface GamepadAxis {
    value: number;
    deadzone: number;
}
export interface GamepadData {
    id: string;
    index: number;
    connected: boolean;
    buttons: GamepadButton[];
    axes: GamepadAxis[];
    timestamp: number;
}
export declare class Gamepad {
    private config;
    private gamepads;
    private pollInterval;
    private lastPollTime;
    constructor(config?: Partial<GamepadConfig>);
    /**
     * Start polling gamepads
     */
    start(): void;
    /**
     * Stop polling gamepads
     */
    stop(): void;
    /**
     * Poll all connected gamepads
     */
    poll(): void;
    /**
     * Get gamepad data by index
     */
    getGamepad(index: number): GamepadData | undefined;
    /**
     * Get all connected gamepads
     */
    getAllGamepads(): GamepadData[];
    /**
     * Check if a button is pressed on any gamepad
     */
    isButtonPressed(buttonIndex: number): boolean;
    /**
     * Get axis value with deadzone applied
     */
    getAxisValue(axisIndex: number, gamepadIndex?: number): number;
    /**
     * Get D-pad state
     */
    getDPadState(gamepadIndex?: number): {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
    };
    /**
     * Check if any gamepad is connected
     */
    isConnected(): boolean;
    /**
     * Get number of connected gamepads
     */
    getConnectedCount(): number;
    /**
     * Set deadzone percentage
     */
    setDeadzone(deadzonePct: number): void;
    /**
     * Get current deadzone percentage
     */
    getDeadzone(): number;
    /**
     * Get button name by index
     */
    getButtonName(index: number): string;
    /**
     * Get axis name by index
     */
    getAxisName(index: number): string;
    /**
     * Setup event listeners for gamepad connection/disconnection
     */
    private setupEventListeners;
    /**
     * Handle gamepad connection
     */
    private handleGamepadConnected;
    /**
     * Handle gamepad disconnection
     */
    private handleGamepadDisconnected;
    /**
     * Update gamepad data
     */
    private updateGamepadData;
    /**
     * Apply deadzone to axis value
     */
    private applyDeadzone;
    /**
     * Get radial deadzone for analog sticks
     */
    getRadialDeadzone(x: number, y: number, gamepadIndex?: number): {
        x: number;
        y: number;
    };
    /**
     * Get vibration support
     */
    hasVibration(gamepadIndex?: number): boolean;
    /**
     * Vibrate gamepad
     */
    vibrate(duration: number, strongMagnitude?: number, weakMagnitude?: number, gamepadIndex?: number): void;
    /**
     * Stop vibration
     */
    stopVibration(gamepadIndex?: number): void;
    /**
     * Get gamepad info for debugging
     */
    getDebugInfo(): string;
    /**
     * Cleanup event listeners
     */
    cleanup(): void;
}
//# sourceMappingURL=Gamepad.d.ts.map