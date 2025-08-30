export interface GamepadConfig {
  deadzonePct: number;
  pollInterval: number;
  maxGamepads: number;
  crossBrowserCompatibility: boolean;
  inputQuirksHandling: boolean;
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
  browser: string;
  quirks: GamepadQuirks;
}

export interface GamepadQuirks {
  needsDeadzoneAdjustment: boolean;
  hasStickDrift: boolean;
  buttonMapping: Record<string, number>;
  axisMapping: Record<string, number>;
  browserSpecific: Record<string, any>;
}

export class Gamepad {
  private config: GamepadConfig;
  private gamepads: Map<number, GamepadData> = new Map();
  private pollInterval: number | null = null;
  private lastPollTime: number = 0;

  // Cross-browser detection
  private isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
  private isFirefox = navigator.userAgent.includes('Firefox');
  private isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
  private isEdge = navigator.userAgent.includes('Edge');

  // Browser-specific quirks
  private chromeQuirks = {
    needsDeadzoneAdjustment: true,
    hasStickDrift: false,
    buttonMapping: {
      'A': 0, 'B': 1, 'X': 2, 'Y': 3,
      'L1': 4, 'R1': 5, 'L2': 6, 'R2': 7,
      'Select': 8, 'Start': 9, 'L3': 10, 'R3': 11,
      'DPadUp': 12, 'DPadDown': 13, 'DPadLeft': 14, 'DPadRight': 15
    },
    axisMapping: {
      'LeftStickX': 0, 'LeftStickY': 1,
      'RightStickX': 2, 'RightStickY': 3
    },
    browserSpecific: {
      chromeSpecific: true,
      requiresUserGesture: true
    }
  };

  private firefoxQuirks = {
    needsDeadzoneAdjustment: true,
    hasStickDrift: true,
    buttonMapping: {
      'A': 0, 'B': 1, 'X': 2, 'Y': 3,
      'L1': 4, 'R1': 5, 'L2': 6, 'R2': 7,
      'Select': 8, 'Start': 9, 'L3': 10, 'R3': 11,
      'DPadUp': 12, 'DPadDown': 13, 'DPadLeft': 14, 'DPadRight': 15
    },
    axisMapping: {
      'LeftStickX': 0, 'LeftStickY': 1,
      'RightStickX': 2, 'RightStickY': 3
    },
    browserSpecific: {
      firefoxSpecific: true,
      requiresPermission: false
    }
  };

  private safariQuirks = {
    needsDeadzoneAdjustment: false,
    hasStickDrift: false,
    buttonMapping: {
      'A': 0, 'B': 1, 'X': 2, 'Y': 3,
      'L1': 4, 'R1': 5, 'L2': 6, 'R2': 7,
      'Select': 8, 'Start': 9, 'L3': 10, 'R3': 11,
      'DPadUp': 12, 'DPadDown': 13, 'DPadLeft': 14, 'DPadRight': 15
    },
    axisMapping: {
      'LeftStickX': 0, 'LeftStickY': 1,
      'RightStickX': 2, 'RightStickY': 3
    },
    browserSpecific: {
      safariSpecific: true,
      limitedSupport: true
    }
  };

  constructor(config: Partial<GamepadConfig> = {}) {
    this.config = {
      deadzonePct: 15,
      pollInterval: 16, // ~60fps
      maxGamepads: 4,
      crossBrowserCompatibility: true,
      inputQuirksHandling: true,
      ...config
    };

    this.setupEventListeners();
    this.detectBrowserQuirks();
  }

  /**
   * Start polling gamepads
   */
  start(): void {
    if (this.pollInterval) return;

    this.pollInterval = window.setInterval(() => {
      this.poll();
    }, this.config.pollInterval);
  }

  /**
   * Stop polling gamepads
   */
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Poll all connected gamepads
   */
  poll(): void {
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
        } else {
          // Gamepad disconnected
          this.gamepads.delete(i);
        }
      }
    } catch (error) {
      console.warn('Error polling gamepads:', error);
    }
  }

  /**
   * Get gamepad data by index
   */
  getGamepad(index: number): GamepadData | undefined {
    return this.gamepads.get(index);
  }

  /**
   * Get all connected gamepads
   */
  getAllGamepads(): GamepadData[] {
    return Array.from(this.gamepads.values());
  }

  /**
   * Check if a button is pressed on any gamepad
   */
  isButtonPressed(buttonIndex: number): boolean {
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
  getAxisValue(axisIndex: number, gamepadIndex: number = 0): number {
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
  getDPadState(gamepadIndex: number = 0): { up: boolean; down: boolean; left: boolean; right: boolean } {
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
  isConnected(): boolean {
    return this.gamepads.size > 0;
  }

  /**
   * Get number of connected gamepads
   */
  getConnectedCount(): number {
    return this.gamepads.size;
  }

  /**
   * Set deadzone percentage
   */
  setDeadzone(deadzonePct: number): void {
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
  getDeadzone(): number {
    return this.config.deadzonePct;
  }

  /**
   * Get button name by index
   */
  getButtonName(index: number): string {
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
  getAxisName(index: number): string {
    const axisNames = [
      'LeftStickX', 'LeftStickY',
      'RightStickX', 'RightStickY'
    ];

    return axisNames[index] || `Axis${index}`;
  }

  /**
   * Setup event listeners for gamepad connection/disconnection
   */
  private setupEventListeners(): void {
    window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
  }

  /**
   * Handle gamepad connection
   */
  private handleGamepadConnected(event: GamepadEvent): void {
    const gamepad = event.gamepad;
    console.log(`Gamepad connected: ${gamepad.id} (index: ${gamepad.index})`);
    
    this.updateGamepadData(gamepad.index, gamepad);
  }

  /**
   * Handle gamepad disconnection
   */
  private handleGamepadDisconnected(event: GamepadEvent): void {
    const gamepad = event.gamepad;
    console.log(`Gamepad disconnected: ${gamepad.id} (index: ${gamepad.index})`);
    
    this.gamepads.delete(gamepad.index);
  }

  /**
   * Update gamepad data
   */
  private updateGamepadData(index: number, gamepad: globalThis.Gamepad): void {
    const deadzone = this.config.deadzonePct / 100;

    // Convert buttons
    const buttons: GamepadButton[] = gamepad.buttons.map(button => ({
      pressed: button.pressed,
      value: button.value,
      touched: button.touched
    }));

    // Convert axes with deadzone
    const axes: GamepadAxis[] = gamepad.axes.map(axis => ({
      value: axis,
      deadzone: deadzone
    }));

    this.gamepads.set(index, {
      id: gamepad.id,
      index: gamepad.index,
      connected: gamepad.connected,
      buttons: buttons,
      axes: axes,
      timestamp: gamepad.timestamp,
      browser: navigator.userAgent,
      quirks: this.getQuirks(gamepad.id) // Pass gamepad ID to get quirks
    });
  }

  /**
   * Apply deadzone to axis value
   */
  private applyDeadzone(value: number, deadzone: number): number {
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
  getRadialDeadzone(x: number, y: number, gamepadIndex: number = 0): { x: number; y: number } {
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
  hasVibration(gamepadIndex: number = 0): boolean {
    const gamepad = this.gamepads.get(gamepadIndex);
    if (!gamepad) return false;

    // Check if the gamepad supports vibration
    const gamepadAPI = navigator.getGamepads()[gamepadIndex];
    return !!(gamepadAPI && 'vibrationActuator' in gamepadAPI);
  }

  /**
   * Vibrate gamepad
   */
  vibrate(duration: number, strongMagnitude: number = 1, weakMagnitude: number = 1, gamepadIndex: number = 0): void {
    const gamepad = this.gamepads.get(gamepadIndex);
    if (!gamepad || !this.hasVibration(gamepadIndex)) return;

    const gamepadAPI = navigator.getGamepads()[gamepadIndex];
    if (!gamepadAPI || !gamepadAPI.vibrationActuator) return;

    try {
      gamepadAPI.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: duration,
        strongMagnitude: strongMagnitude,
        weakMagnitude: weakMagnitude
      });
    } catch (error) {
      console.warn('Failed to vibrate gamepad:', error);
    }
  }

  /**
   * Stop vibration
   */
  stopVibration(gamepadIndex: number = 0): void {
    const gamepad = this.gamepads.get(gamepadIndex);
    if (!gamepad || !this.hasVibration(gamepadIndex)) return;

    const gamepadAPI = navigator.getGamepads()[gamepadIndex];
    if (!gamepadAPI || !gamepadAPI.vibrationActuator) return;

    try {
      gamepadAPI.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 0,
        strongMagnitude: 0,
        weakMagnitude: 0
      });
    } catch (error) {
      console.warn('Failed to stop gamepad vibration:', error);
    }
  }

  /**
   * Get gamepad info for debugging
   */
  getDebugInfo(): string {
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
  cleanup(): void {
    this.stop();
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
  }

  private detectBrowserQuirks(): void {
    console.log(`Gamepad: Browser detected - Chrome: ${this.isChrome}, Firefox: ${this.isFirefox}, Safari: ${this.isSafari}, Edge: ${this.isEdge}`);
    
    if (this.config.crossBrowserCompatibility) {
      // Apply browser-specific optimizations
      if (this.isFirefox) {
        // Firefox has different gamepad API behavior
        this.config.pollInterval = 20; // Slightly slower polling for Firefox
        console.log('Gamepad: Applied Firefox-specific optimizations');
      } else if (this.isSafari) {
        // Safari has limited gamepad support
        this.config.maxGamepads = 1;
        console.log('Gamepad: Applied Safari-specific optimizations');
      }
    }
  }

  private getQuirks(gamepadId: string): GamepadQuirks {
    if (this.isChrome && gamepadId.includes('Chrome')) {
      return this.chromeQuirks;
    } else if (this.isFirefox && gamepadId.includes('Firefox')) {
      return this.firefoxQuirks;
    } else if (this.isSafari && gamepadId.includes('Safari')) {
      return this.safariQuirks;
    } else {
      return {
        needsDeadzoneAdjustment: false,
        hasStickDrift: false,
        buttonMapping: {},
        axisMapping: {},
        browserSpecific: {}
      };
    }
  }
} 