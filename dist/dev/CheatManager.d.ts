export declare enum CheatFlag {
    God = "God",
    Noclip = "Noclip",
    InfTime = "InfTime",
    GiveSword = "GiveSword"
}
export interface CheatManagerConfig {
    enabled?: boolean;
    defaultFlags?: Partial<Record<CheatFlag, boolean>>;
}
export declare class CheatManager {
    private flags;
    private healthOverride;
    private config;
    private listeners;
    constructor(config?: CheatManagerConfig);
    /**
     * Set a cheat flag
     */
    set(flag: CheatFlag, value: boolean): void;
    /**
     * Check if a cheat flag is enabled
     */
    on(flag: CheatFlag): boolean;
    /**
     * Toggle a cheat flag
     */
    toggle(flag: CheatFlag): boolean;
    /**
     * Set health override (null to disable)
     */
    setHealthOverride(health: number | null): void;
    /**
     * Get current health override
     */
    getHealthOverride(): number | null;
    /**
     * Check if health override is active
     */
    hasHealthOverride(): boolean;
    /**
     * Get all active flags
     */
    getActiveFlags(): CheatFlag[];
    /**
     * Reset all cheats to default state
     */
    reset(): void;
    /**
     * Enable/disable all cheats
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if cheat system is enabled
     */
    isEnabled(): boolean;
    /**
     * Add a listener for flag changes
     */
    addListener(flag: CheatFlag, callback: (enabled: boolean) => void): void;
    /**
     * Remove a listener
     */
    removeListener(flag: CheatFlag, callback: (enabled: boolean) => void): void;
    /**
     * Notify all listeners for a flag
     */
    private notifyListeners;
    /**
     * Get debug info for overlay
     */
    getDebugInfo(): Record<string, any>;
}
//# sourceMappingURL=CheatManager.d.ts.map