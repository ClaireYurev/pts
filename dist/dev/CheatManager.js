export var CheatFlag;
(function (CheatFlag) {
    CheatFlag["God"] = "God";
    CheatFlag["Noclip"] = "Noclip";
    CheatFlag["InfTime"] = "InfTime";
    CheatFlag["GiveSword"] = "GiveSword";
})(CheatFlag || (CheatFlag = {}));
export class CheatManager {
    constructor(config = {}) {
        this.flags = new Map();
        this.healthOverride = null;
        this.listeners = new Map();
        this.config = {
            enabled: false,
            defaultFlags: {},
            ...config
        };
        // Initialize flags with defaults
        Object.values(CheatFlag).forEach(flag => {
            const defaultValue = this.config.defaultFlags?.[flag] || false;
            this.flags.set(flag, defaultValue);
        });
    }
    /**
     * Set a cheat flag
     */
    set(flag, value) {
        const oldValue = this.flags.get(flag);
        this.flags.set(flag, value);
        // Notify listeners if value changed
        if (oldValue !== value) {
            this.notifyListeners(flag, value);
        }
    }
    /**
     * Check if a cheat flag is enabled
     */
    on(flag) {
        return this.flags.get(flag) === true;
    }
    /**
     * Toggle a cheat flag
     */
    toggle(flag) {
        const current = this.on(flag);
        this.set(flag, !current);
        return !current;
    }
    /**
     * Set health override (null to disable)
     */
    setHealthOverride(health) {
        this.healthOverride = health;
    }
    /**
     * Get current health override
     */
    getHealthOverride() {
        return this.healthOverride;
    }
    /**
     * Check if health override is active
     */
    hasHealthOverride() {
        return this.healthOverride !== null;
    }
    /**
     * Get all active flags
     */
    getActiveFlags() {
        return Array.from(this.flags.entries())
            .filter(([_, enabled]) => enabled)
            .map(([flag, _]) => flag);
    }
    /**
     * Reset all cheats to default state
     */
    reset() {
        Object.values(CheatFlag).forEach(flag => {
            const defaultValue = this.config.defaultFlags?.[flag] || false;
            this.set(flag, defaultValue);
        });
        this.setHealthOverride(null);
    }
    /**
     * Enable/disable all cheats
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        if (!enabled) {
            this.reset();
        }
    }
    /**
     * Check if cheat system is enabled
     */
    isEnabled() {
        return this.config.enabled || false;
    }
    /**
     * Add a listener for flag changes
     */
    addListener(flag, callback) {
        if (!this.listeners.has(flag)) {
            this.listeners.set(flag, new Set());
        }
        const flagListeners = this.listeners.get(flag);
        if (flagListeners) {
            flagListeners.add(callback);
        }
    }
    /**
     * Remove a listener
     */
    removeListener(flag, callback) {
        const flagListeners = this.listeners.get(flag);
        if (flagListeners) {
            flagListeners.delete(callback);
        }
    }
    /**
     * Notify all listeners for a flag
     */
    notifyListeners(flag, enabled) {
        const flagListeners = this.listeners.get(flag);
        if (flagListeners) {
            flagListeners.forEach(callback => {
                try {
                    callback(enabled);
                }
                catch (error) {
                    console.error(`Error in cheat listener for ${flag}:`, error);
                }
            });
        }
    }
    /**
     * Get debug info for overlay
     */
    getDebugInfo() {
        return {
            enabled: this.isEnabled(),
            activeFlags: this.getActiveFlags(),
            healthOverride: this.healthOverride,
            totalFlags: Object.values(CheatFlag).length
        };
    }
}
//# sourceMappingURL=CheatManager.js.map