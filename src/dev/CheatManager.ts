export enum CheatFlag {
    God = 'God',
    Noclip = 'Noclip',
    InfTime = 'InfTime',
    GiveSword = 'GiveSword'
}

export interface CheatManagerConfig {
    enabled?: boolean;
    defaultFlags?: Partial<Record<CheatFlag, boolean>>;
}

export class CheatManager {
    private flags: Map<CheatFlag, boolean> = new Map();
    private healthOverride: number | null = null;
    private config: CheatManagerConfig;
    private listeners: Map<CheatFlag, Set<(enabled: boolean) => void>> = new Map();

    constructor(config: CheatManagerConfig = {}) {
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
    set(flag: CheatFlag, value: boolean): void {
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
    on(flag: CheatFlag): boolean {
        return this.flags.get(flag) === true;
    }

    /**
     * Toggle a cheat flag
     */
    toggle(flag: CheatFlag): boolean {
        const current = this.on(flag);
        this.set(flag, !current);
        return !current;
    }

    /**
     * Set health override (null to disable)
     */
    setHealthOverride(health: number | null): void {
        this.healthOverride = health;
    }

    /**
     * Get current health override
     */
    getHealthOverride(): number | null {
        return this.healthOverride;
    }

    /**
     * Check if health override is active
     */
    hasHealthOverride(): boolean {
        return this.healthOverride !== null;
    }

    /**
     * Get all active flags
     */
    getActiveFlags(): CheatFlag[] {
        return Array.from(this.flags.entries())
            .filter(([_, enabled]) => enabled)
            .map(([flag, _]) => flag);
    }

    /**
     * Reset all cheats to default state
     */
    reset(): void {
        Object.values(CheatFlag).forEach(flag => {
            const defaultValue = this.config.defaultFlags?.[flag] || false;
            this.set(flag, defaultValue);
        });
        this.setHealthOverride(null);
    }

    /**
     * Enable/disable all cheats
     */
    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
        if (!enabled) {
            this.reset();
        }
    }

    /**
     * Check if cheat system is enabled
     */
    isEnabled(): boolean {
        return this.config.enabled || false;
    }

    /**
     * Add a listener for flag changes
     */
    addListener(flag: CheatFlag, callback: (enabled: boolean) => void): void {
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
    removeListener(flag: CheatFlag, callback: (enabled: boolean) => void): void {
        const flagListeners = this.listeners.get(flag);
        if (flagListeners) {
            flagListeners.delete(callback);
        }
    }

    /**
     * Notify all listeners for a flag
     */
    private notifyListeners(flag: CheatFlag, enabled: boolean): void {
        const flagListeners = this.listeners.get(flag);
        if (flagListeners) {
            flagListeners.forEach(callback => {
                try {
                    callback(enabled);
                } catch (error) {
                    console.error(`Error in cheat listener for ${flag}:`, error);
                }
            });
        }
    }

    /**
     * Get debug info for overlay
     */
    getDebugInfo(): Record<string, any> {
        return {
            enabled: this.isEnabled(),
            activeFlags: this.getActiveFlags(),
            healthOverride: this.healthOverride,
            totalFlags: Object.values(CheatFlag).length
        };
    }
} 