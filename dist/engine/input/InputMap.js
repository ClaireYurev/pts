export class InputMap {
    constructor(initialProfile) {
        this.keyboardState = {};
        this.gamepadState = { buttons: [], axes: [], connected: false };
        this.isRebinding = false;
        this.rebindAction = null;
        this.rebindDevice = null;
        this.rebindPromise = null;
        this.rebindResolve = null;
        this.rebindReject = null;
        this.lastJumpPress = 0;
        this.isOnGround = false;
        this.wasOnGround = false;
        this.actionHeld = false;
        this.ledgeGrabActive = false;
        this.profile = {
            keyboard: {
                Left: 'KeyA',
                Right: 'KeyD',
                Up: 'KeyW',
                Down: 'KeyS',
                Jump: 'Space',
                Action: 'KeyE',
                Block: 'KeyQ',
                Pause: 'Escape'
            },
            gamepad: {
                Left: 'DPadLeft',
                Right: 'DPadRight',
                Up: 'DPadUp',
                Down: 'DPadDown',
                Jump: 'ButtonA',
                Action: 'ButtonB',
                Block: 'ButtonX',
                Pause: 'ButtonStart'
            },
            deadzonePct: 15,
            lateJumpMs: 80,
            stickyGrab: true,
            ...initialProfile
        };
        this.setupEventListeners();
    }
    /**
     * Check if an action is currently pressed
     */
    isDown(action) {
        // Check keyboard
        const keyboardKey = this.profile.keyboard[action];
        if (keyboardKey && this.keyboardState[keyboardKey]) {
            return true;
        }
        // Check gamepad
        if (this.gamepadState.connected) {
            return this.isGamepadActionDown(action);
        }
        return false;
    }
    /**
     * Check if an action was just pressed (not held)
     */
    isPressed(action) {
        // This would need to track previous frame state
        // For now, return isDown for simplicity
        return this.isDown(action);
    }
    /**
     * Start rebinding process for an action
     */
    startRebind(action, device) {
        if (this.isRebinding) {
            return Promise.reject(new Error('Rebinding already in progress'));
        }
        this.isRebinding = true;
        this.rebindAction = action;
        this.rebindDevice = device;
        this.rebindPromise = new Promise((resolve, reject) => {
            this.rebindResolve = resolve;
            this.rebindReject = reject;
        });
        // Set timeout for rebinding
        setTimeout(() => {
            if (this.isRebinding) {
                this.cancelRebind();
                this.rebindReject?.(new Error('Rebinding timeout'));
            }
        }, 10000); // 10 second timeout
        return this.rebindPromise;
    }
    /**
     * Cancel current rebinding
     */
    cancelRebind() {
        this.isRebinding = false;
        this.rebindAction = null;
        this.rebindDevice = null;
        this.rebindResolve = null;
        this.rebindReject = null;
        this.rebindPromise = null;
    }
    /**
     * Set deadzone percentage for gamepad
     */
    setDeadzone(pct) {
        this.profile.deadzonePct = Math.max(0, Math.min(100, pct));
    }
    /**
     * Set late jump buffer time in milliseconds
     */
    setLateJumpMs(ms) {
        this.profile.lateJumpMs = Math.max(0, Math.min(500, ms));
    }
    /**
     * Set sticky grab toggle
     */
    setStickyGrab(enabled) {
        this.profile.stickyGrab = enabled;
    }
    /**
     * Update ground state for late jump buffer
     */
    updateGroundState(isOnGround) {
        this.wasOnGround = this.isOnGround;
        this.isOnGround = isOnGround;
        // Check for late jump buffer
        if (!this.wasOnGround && this.isOnGround) {
            const timeSinceJumpPress = Date.now() - this.lastJumpPress;
            if (timeSinceJumpPress <= this.profile.lateJumpMs) {
                // Trigger late jump
                console.log(`Late jump triggered! Time since press: ${timeSinceJumpPress}ms`);
                // This would trigger a jump in the player controller
            }
        }
    }
    /**
     * Update ledge grab state for sticky grab
     */
    updateLedgeGrabState(isLedgeGrabActive) {
        this.ledgeGrabActive = isLedgeGrabActive;
    }
    /**
     * Get current profile
     */
    getProfile() {
        return { ...this.profile };
    }
    /**
     * Set entire profile
     */
    setProfile(profile) {
        this.profile = { ...profile };
    }
    /**
     * Get rebinding state
     */
    getRebindingState() {
        return {
            isRebinding: this.isRebinding,
            action: this.rebindAction,
            device: this.rebindDevice
        };
    }
    /**
     * Check for input conflicts
     */
    checkConflicts(newBinding, device) {
        const conflicts = [];
        const bindings = device === 'keyboard' ? this.profile.keyboard : this.profile.gamepad;
        for (const [action, binding] of Object.entries(bindings)) {
            if (binding === newBinding) {
                conflicts.push(action);
            }
        }
        return conflicts;
    }
    /**
     * Setup event listeners for keyboard and gamepad
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        // Gamepad events
        window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
        window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
    /**
     * Handle keyboard key down
     */
    handleKeyDown(event) {
        const key = event.code;
        this.keyboardState[key] = true;
        // Handle rebinding
        if (this.isRebinding && this.rebindDevice === 'keyboard') {
            event.preventDefault();
            this.handleRebind(key);
            return;
        }
        // Track jump press for late jump buffer
        if (key === this.profile.keyboard.Jump) {
            this.lastJumpPress = Date.now();
        }
    }
    /**
     * Handle keyboard key up
     */
    handleKeyUp(event) {
        const key = event.code;
        this.keyboardState[key] = false;
    }
    /**
     * Handle gamepad connection
     */
    handleGamepadConnected(event) {
        console.log('Gamepad connected:', event.gamepad);
        this.gamepadState.connected = true;
    }
    /**
     * Handle gamepad disconnection
     */
    handleGamepadDisconnected(event) {
        console.log('Gamepad disconnected:', event.gamepad);
        this.gamepadState.connected = false;
        this.gamepadState.buttons = [];
        this.gamepadState.axes = [];
    }
    /**
     * Update gamepad state (called each frame)
     */
    updateGamepadState() {
        if (!this.gamepadState.connected)
            return;
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0]; // Use first gamepad
        if (gamepad) {
            this.gamepadState.buttons = Array.from(gamepad.buttons).map(button => button.pressed);
            this.gamepadState.axes = Array.from(gamepad.axes);
            // Handle rebinding
            if (this.isRebinding && this.rebindDevice === 'gamepad') {
                this.handleGamepadRebind();
            }
            // Track jump press for late jump buffer
            if (this.isGamepadButtonPressed('ButtonA')) {
                this.lastJumpPress = Date.now();
            }
        }
    }
    /**
     * Handle rebinding for keyboard
     */
    handleRebind(key) {
        if (!this.rebindAction || !this.rebindDevice)
            return;
        // Check for conflicts
        const conflicts = this.checkConflicts(key, 'keyboard');
        if (conflicts.length > 0) {
            console.warn(`Binding conflict: ${key} is already bound to ${conflicts.join(', ')}`);
            // Clear conflicting bindings
            for (const conflict of conflicts) {
                this.profile.keyboard[conflict] = '';
            }
        }
        // Set new binding
        this.profile.keyboard[this.rebindAction] = key;
        console.log(`Rebound ${this.rebindAction} to ${key}`);
        this.completeRebind();
    }
    /**
     * Handle rebinding for gamepad
     */
    handleGamepadRebind() {
        if (!this.rebindAction || !this.rebindDevice)
            return;
        // Check for button presses
        for (let i = 0; i < this.gamepadState.buttons.length; i++) {
            if (this.gamepadState.buttons[i]) {
                const buttonName = this.getGamepadButtonName(i);
                this.handleGamepadButtonRebind(buttonName);
                return;
            }
        }
        // Check for D-pad presses (using axes)
        const deadzone = this.profile.deadzonePct / 100;
        if (Math.abs(this.gamepadState.axes[0]) > deadzone || Math.abs(this.gamepadState.axes[1]) > deadzone) {
            const dpadDirection = this.getDPadDirection(this.gamepadState.axes[0], this.gamepadState.axes[1]);
            if (dpadDirection) {
                this.handleGamepadButtonRebind(dpadDirection);
                return;
            }
        }
    }
    /**
     * Handle gamepad button rebinding
     */
    handleGamepadButtonRebind(buttonName) {
        if (!this.rebindAction)
            return;
        // Check for conflicts
        const conflicts = this.checkConflicts(buttonName, 'gamepad');
        if (conflicts.length > 0) {
            console.warn(`Binding conflict: ${buttonName} is already bound to ${conflicts.join(', ')}`);
            // Clear conflicting bindings
            for (const conflict of conflicts) {
                this.profile.gamepad[conflict] = '';
            }
        }
        // Set new binding
        this.profile.gamepad[this.rebindAction] = buttonName;
        console.log(`Rebound ${this.rebindAction} to ${buttonName}`);
        this.completeRebind();
    }
    /**
     * Complete rebinding process
     */
    completeRebind() {
        this.isRebinding = false;
        this.rebindAction = null;
        this.rebindDevice = null;
        this.rebindResolve?.();
        this.rebindResolve = null;
        this.rebindReject = null;
        this.rebindPromise = null;
    }
    /**
     * Check if gamepad action is down
     */
    isGamepadActionDown(action) {
        const binding = this.profile.gamepad[action];
        if (!binding)
            return false;
        // Handle D-pad
        if (binding.startsWith('DPad')) {
            return this.isDPadPressed(binding);
        }
        // Handle buttons
        return this.isGamepadButtonPressed(binding);
    }
    /**
     * Check if D-pad direction is pressed
     */
    isDPadPressed(direction) {
        const deadzone = this.profile.deadzonePct / 100;
        switch (direction) {
            case 'DPadLeft':
                return this.gamepadState.axes[0] < -deadzone;
            case 'DPadRight':
                return this.gamepadState.axes[0] > deadzone;
            case 'DPadUp':
                return this.gamepadState.axes[1] < -deadzone;
            case 'DPadDown':
                return this.gamepadState.axes[1] > deadzone;
            default:
                return false;
        }
    }
    /**
     * Check if gamepad button is pressed
     */
    isGamepadButtonPressed(buttonName) {
        const buttonIndex = this.getGamepadButtonIndex(buttonName);
        return buttonIndex >= 0 && this.gamepadState.buttons[buttonIndex];
    }
    /**
     * Get gamepad button index by name
     */
    getGamepadButtonIndex(buttonName) {
        const buttonMap = {
            'ButtonA': 0,
            'ButtonB': 1,
            'ButtonX': 2,
            'ButtonY': 3,
            'ButtonL1': 4,
            'ButtonR1': 5,
            'ButtonL2': 6,
            'ButtonR2': 7,
            'ButtonSelect': 8,
            'ButtonStart': 9,
            'ButtonL3': 10,
            'ButtonR3': 11,
            'ButtonHome': 12,
            'ButtonTouchpad': 13
        };
        return buttonMap[buttonName] ?? -1;
    }
    /**
     * Get gamepad button name by index
     */
    getGamepadButtonName(index) {
        const buttonNames = [
            'ButtonA', 'ButtonB', 'ButtonX', 'ButtonY',
            'ButtonL1', 'ButtonR1', 'ButtonL2', 'ButtonR2',
            'ButtonSelect', 'ButtonStart', 'ButtonL3', 'ButtonR3',
            'ButtonHome', 'ButtonTouchpad'
        ];
        return buttonNames[index] || `Button${index}`;
    }
    /**
     * Get D-pad direction from axes
     */
    getDPadDirection(x, y) {
        const deadzone = this.profile.deadzonePct / 100;
        if (Math.abs(x) < deadzone && Math.abs(y) < deadzone) {
            return null;
        }
        // Determine primary direction
        if (Math.abs(x) > Math.abs(y)) {
            return x < 0 ? 'DPadLeft' : 'DPadRight';
        }
        else {
            return y < 0 ? 'DPadUp' : 'DPadDown';
        }
    }
    /**
     * Cleanup event listeners
     */
    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
        window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
}
//# sourceMappingURL=InputMap.js.map