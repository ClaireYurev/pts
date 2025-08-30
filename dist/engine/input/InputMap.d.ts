export type Action = 'Left' | 'Right' | 'Up' | 'Down' | 'Jump' | 'Action' | 'Block' | 'Pause';
export interface InputProfile {
    keyboard: Record<Action, string>;
    gamepad: Record<Action, string>;
    deadzonePct: number;
    lateJumpMs: number;
    stickyGrab: boolean;
}
export interface InputState {
    [key: string]: boolean;
}
export interface GamepadState {
    buttons: boolean[];
    axes: number[];
    connected: boolean;
}
export declare class InputMap {
    private keyboardState;
    private gamepadState;
    private profile;
    private isRebinding;
    private rebindAction;
    private rebindDevice;
    private rebindPromise;
    private rebindResolve;
    private rebindReject;
    private lastJumpPress;
    private isOnGround;
    private wasOnGround;
    private actionHeld;
    private ledgeGrabActive;
    constructor(initialProfile?: Partial<InputProfile>);
    /**
     * Check if an action is currently pressed
     */
    isDown(action: Action): boolean;
    /**
     * Check if an action was just pressed (not held)
     */
    isPressed(action: Action): boolean;
    /**
     * Start rebinding process for an action
     */
    startRebind(action: Action, device: 'keyboard' | 'gamepad'): Promise<void>;
    /**
     * Cancel current rebinding
     */
    cancelRebind(): void;
    /**
     * Set deadzone percentage for gamepad
     */
    setDeadzone(pct: number): void;
    /**
     * Set late jump buffer time in milliseconds
     */
    setLateJumpMs(ms: number): void;
    /**
     * Set sticky grab toggle
     */
    setStickyGrab(enabled: boolean): void;
    /**
     * Update ground state for late jump buffer
     */
    updateGroundState(isOnGround: boolean): void;
    /**
     * Update ledge grab state for sticky grab
     */
    updateLedgeGrabState(isLedgeGrabActive: boolean): void;
    /**
     * Get current profile
     */
    getProfile(): InputProfile;
    /**
     * Set entire profile
     */
    setProfile(profile: InputProfile): void;
    /**
     * Get rebinding state
     */
    getRebindingState(): {
        isRebinding: boolean;
        action: Action | null;
        device: 'keyboard' | 'gamepad' | null;
    };
    /**
     * Check for input conflicts
     */
    checkConflicts(newBinding: string, device: 'keyboard' | 'gamepad'): Action[];
    /**
     * Setup event listeners for keyboard and gamepad
     */
    private setupEventListeners;
    /**
     * Handle keyboard key down
     */
    private handleKeyDown;
    /**
     * Handle keyboard key up
     */
    private handleKeyUp;
    /**
     * Handle gamepad connection
     */
    private handleGamepadConnected;
    /**
     * Handle gamepad disconnection
     */
    private handleGamepadDisconnected;
    /**
     * Update gamepad state (called each frame)
     */
    updateGamepadState(): void;
    /**
     * Handle rebinding for keyboard
     */
    private handleRebind;
    /**
     * Handle rebinding for gamepad
     */
    private handleGamepadRebind;
    /**
     * Handle gamepad button rebinding
     */
    private handleGamepadButtonRebind;
    /**
     * Complete rebinding process
     */
    private completeRebind;
    /**
     * Check if gamepad action is down
     */
    private isGamepadActionDown;
    /**
     * Check if D-pad direction is pressed
     */
    private isDPadPressed;
    /**
     * Check if gamepad button is pressed
     */
    private isGamepadButtonPressed;
    /**
     * Get gamepad button index by name
     */
    private getGamepadButtonIndex;
    /**
     * Get gamepad button name by index
     */
    private getGamepadButtonName;
    /**
     * Get D-pad direction from axes
     */
    private getDPadDirection;
    /**
     * Cleanup event listeners
     */
    cleanup(): void;
}
//# sourceMappingURL=InputMap.d.ts.map