export interface PlatformConfig {
    name: string;
    year: number;
    category: 'computer' | 'console' | 'handheld';
    resolution: {
        width: number;
        height: number;
    };
    aspectRatio: number;
    colors: number;
    description: string;
    features: string[];
    scalingMode: 'pixel-perfect' | 'smooth' | 'crt';
    backgroundColor: string;
    borderColor: string;
}
export declare class PlatformManager {
    private static platforms;
    private static currentPlatform;
    static getPlatform(key: string): PlatformConfig | null;
    static getAllPlatforms(): PlatformConfig[];
    static getPlatformsByCategory(category: 'computer' | 'console' | 'handheld'): PlatformConfig[];
    static getCurrentPlatform(): PlatformConfig;
    static setCurrentPlatform(key: string): boolean;
    static getPlatformKeys(): string[];
    static getPlatformNames(): string[];
    static getPlatformByName(name: string): PlatformConfig | null;
    static getPlatformsByYear(year: number): PlatformConfig[];
    static getPlatformsByResolution(width: number, height: number): PlatformConfig[];
    static getUniqueResolutions(): Array<{
        width: number;
        height: number;
        platforms: PlatformConfig[];
    }>;
}
//# sourceMappingURL=PlatformConfig.d.ts.map