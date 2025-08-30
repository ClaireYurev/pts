export class Gamepad {
    constructor(config = {}) {
        this.gamepads = new Map();
        this.pollInterval = null;
        this.lastPollTime = 0;
        this.config = {
            deadzonePct: 15,
            pollInterval: 16, // ~60fps
            maxGamepads: 4,
            ...config
        };
        this.setupEventListeners();
    }
    /**
     * Start polling gamepads
     */
    start() {
        if (this.pollInterval)
            return;
        this.pollInterval = window.setInterval(() => {
            this.poll();
        }, this.config.pollInterval);
    }
    /**
     * Stop polling gamepads
     */
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
    /**
     * Poll all connected gamepads
     */
    poll() {
        const now = Date.now();
        if (now - this.lastPollTime < this.config.pollInterval) {
            return; // Don't poll too frequently
        }
        this.lastPollTime = now;
        try {
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < Math.min(gamepads.length, this.config.maxGamepads); i++) {
                const gamepad = gamepads[i];
                if (gamepad) {
                    this.updateGamepadData(i, gamepad);
                }
                else {
                    // Gamepad disconnected
                    this.gamepads.delete(i);
                }
            }
        }
        catch (error) {
            console.warn('Error polling gamepads:', error);
        }
    }
    /**
     * Get gamepad data by index
     */
    getGamepad(index) {
        return this.gamepads.get(index);
    }
    /**
     * Get all connected gamepads
     */
    getAllGamepads() {
        return Array.from(this.gamepads.values());
    }
    /**
     * Check if a button is pressed on any gamepad
     */
    isButtonPressed(buttonIndex) {
        for (const gamepad of this.gamepads.values()) {
            if (gamepad.connected && gamepad.buttons[buttonIndex]?.pressed) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get axis value with deadzone applied
     */
    getAxisValue(axisIndex, gamepadIndex = 0) {
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad || !gamepad.connected) {
            return 0;
        }
        const axis = gamepad.axes[axisIndex];
        if (!axis) {
            return 0;
        }
        return this.applyDeadzone(axis.value, axis.deadzone);
    }
    /**
     * Get D-pad state
     */
    getDPadState(gamepadIndex = 0) {
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad || !gamepad.connected) {
            return { up: false, down: false, left: false, right: false };
        }
        const x = this.getAxisValue(0, gamepadIndex);
        const y = this.getAxisValue(1, gamepadIndex);
        return {
            up: y < -0.5,
            down: y > 0.5,
            left: x < -0.5,
            right: x > 0.5
        };
    }
    /**
     * Check if any gamepad is connected
     */
    isConnected() {
        return this.gamepads.size > 0;
    }
    /**
     * Get number of connected gamepads
     */
    getConnectedCount() {
        return this.gamepads.size;
    }
    /**
     * Set deadzone percentage
     */
    setDeadzone(deadzonePct) {
        this.config.deadzonePct = Math.max(0, Math.min(100, deadzonePct));
        // Update deadzone for all axes
        for (const gamepad of this.gamepads.values()) {
            for (const axis of gamepad.axes) {
                axis.deadzone = this.config.deadzonePct / 100;
            }
        }
    }
    /**
     * Get current deadzone percentage
     */
    getDeadzone() {
        return this.config.deadzonePct;
    }
    /**
     * Get button name by index
     */
    getButtonName(index) {
        const buttonNames = [
            'A', 'B', 'X', 'Y',
            'L1', 'R1', 'L2', 'R2',
            'Select', 'Start', 'L3', 'R3',
            'Home', 'Touchpad'
        ];
        return buttonNames[index] || `Button${index}`;
    }
    /**
     * Get axis name by index
     */
    getAxisName(index) {
        const axisNames = [
            'LeftStickX', 'LeftStickY',
            'RightStickX', 'RightStickY'
        ];
        return axisNames[index] || `Axis${index}`;
    }
    /**
     * Setup event listeners for gamepad connection/disconnection
     */
    setupEventListeners() {
        window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
        window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
    /**
     * Handle gamepad connection
     */
    handleGamepadConnected(event) {
        const gamepad = event.gamepad;
        console.log(`Gamepad connected: ${gamepad.id} (index: ${gamepad.index})`);
        this.updateGamepadData(gamepad.index, gamepad);
    }
    /**
     * Handle gamepad disconnection
     */
    handleGamepadDisconnected(event) {
        const gamepad = event.gamepad;
        console.log(`Gamepad disconnected: ${gamepad.id} (index: ${gamepad.index})`);
        this.gamepads.delete(gamepad.index);
    }
    /**
     * Update gamepad data
     */
    updateGamepadData(index, gamepad) {
        const deadzone = this.config.deadzonePct / 100;
        // Convert buttons
        const buttons = gamepad.buttons.map(button => ({
            pressed: button.pressed,
            value: button.value,
            touched: button.touched
        }));
        // Convert axes with deadzone
        const axes = gamepad.axes.map(axis => ({
            value: axis,
            deadzone: deadzone
        }));
        this.gamepads.set(index, {
            id: gamepad.id,
            index: gamepad.index,
            connected: gamepad.connected,
            buttons: buttons,
            axes: axes,
            timestamp: gamepad.timestamp
        });
    }
    /**
     * Apply deadzone to axis value
     */
    applyDeadzone(value, deadzone) {
        if (Math.abs(value) < deadzone) {
            return 0;
        }
        // Normalize the value outside the deadzone
        const sign = value > 0 ? 1 : -1;
        const normalizedValue = (Math.abs(value) - deadzone) / (1 - deadzone);
        return sign * Math.min(1, normalizedValue);
    }
    /**
     * Get radial deadzone for analog sticks
     */
    getRadialDeadzone(x, y, gamepadIndex = 0) {
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad || !gamepad.connected) {
            return { x: 0, y: 0 };
        }
        const deadzone = this.config.deadzonePct / 100;
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude < deadzone) {
            return { x: 0, y: 0 };
        }
        // Normalize the vector outside the deadzone
        const normalizedMagnitude = (magnitude - deadzone) / (1 - deadzone);
        const scale = Math.min(1, normalizedMagnitude) / magnitude;
        return {
            x: x * scale,
            y: y * scale
        };
    }
    /**
     * Get vibration support
     */
    hasVibration(gamepadIndex = 0) {
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad)
            return false;
        // Check if the gamepad supports vibration
        const gamepadAPI = navigator.getGamepads()[gamepadIndex];
        return !!(gamepadAPI && 'vibrationActuator' in gamepadAPI);
    }
    /**
     * Vibrate gamepad
     */
    vibrate(duration, strongMagnitude = 1, weakMagnitude = 1, gamepadIndex = 0) {
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad || !this.hasVibration(gamepadIndex))
            return;
        const gamepadAPI = navigator.getGamepads()[gamepadIndex];
        if (!gamepadAPI || !gamepadAPI.vibrationActuator)
            return;
        try {
            gamepadAPI.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: duration,
                strongMagnitude: strongMagnitude,
                weakMagnitude: weakMagnitude
            });
        }
        catch (error) {
            console.warn('Failed to vibrate gamepad:', error);
        }
    }
    /**
     * Stop vibration
     */
    stopVibration(gamepadIndex = 0) {
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad || !this.hasVibration(gamepadIndex))
            return;
        const gamepadAPI = navigator.getGamepads()[gamepadIndex];
        if (!gamepadAPI || !gamepadAPI.vibrationActuator)
            return;
        try {
            gamepadAPI.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: 0,
                strongMagnitude: 0,
                weakMagnitude: 0
            });
        }
        catch (error) {
            console.warn('Failed to stop gamepad vibration:', error);
        }
    }
    /**
     * Get gamepad info for debugging
     */
    getDebugInfo() {
        const connected = this.getConnectedCount();
        const gamepads = this.getAllGamepads();
        let info = `Connected gamepads: ${connected}\n`;
        for (const gamepad of gamepads) {
            info += `\nGamepad ${gamepad.index}: ${gamepad.id}\n`;
            info += `  Buttons: ${gamepad.buttons.length}\n`;
            info += `  Axes: ${gamepad.axes.length}\n`;
            info += `  Deadzone: ${this.config.deadzonePct}%\n`;
        }
        return info;
    }
    /**
     * Cleanup event listeners
     */
    cleanup() {
        this.stop();
        window.removeEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
        window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
}
//# sourceMappingURL=Gamepad.js.map