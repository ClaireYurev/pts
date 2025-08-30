export type BootConfig = {
    pack?: string;
    packUrl?: string;
    level?: number;
    room?: number;
    x?: number;
    y?: number;
    health?: number;
    maxhealth?: number;
    sword?: boolean;
    time?: number;
    seed?: number;
    difficulty?: 'easy' | 'normal' | 'hard' | 'extreme';
    noclip?: boolean;
    god?: boolean;
    infTime?: boolean;
    reveal?: boolean;
    givesword?: boolean;
    setguards?: number;
    speed?: number;
    fps?: number;
    vsync?: boolean;
    scale?: 'integer' | 'fit' | 'stretch';
    zoom?: number;
    fullscreen?: boolean;
    mute?: boolean;
    music?: boolean;
    sfx?: boolean;
    vol?: number;
    latency?: 'auto' | 'low' | 'compat';
    keys?: string;
    deadzone?: number;
    jumpbuf?: number;
    sticky?: boolean;
    hud?: boolean;
    cutscenes?: boolean;
    lang?: string;
    slot?: 1 | 2 | 3 | 'Q';
    editor?: boolean;
};
export interface PackDefaults {
    level?: number;
    health?: number;
    maxhealth?: number;
    difficulty?: string;
    cutscenes?: boolean;
    [key: string]: any;
}
export declare function parseBootConfig(): {
    config: BootConfig;
    warnings: string[];
};
export declare function validateBootConfig(cfg: BootConfig): string[];
/**
 * Resolve boot configuration with proper precedence:
 * Engine defaults → Pack defaults → SettingsStore → URL (wins for session)
 */
export declare function resolveBootConfig(urlConfig: BootConfig, packDefaults?: PackDefaults): BootConfig;
/**
 * Generate a boot link with non-default values
 */
export declare function generateBootLink(currentConfig: BootConfig, packDefaults?: PackDefaults): string;
/**
 * Copy boot link to clipboard
 */
export declare function copyBootLink(currentConfig: BootConfig, packDefaults?: PackDefaults): Promise<boolean>;
//# sourceMappingURL=BootConfig.d.ts.map