import { GamePack } from "./GamePack.js";

export class GamePackLoader {
    private loadedAssets: Map<string, HTMLImageElement> = new Map();

    public async loadPack(url: string): Promise<GamePack> {
        try {
            // Validate URL
            if (!url || typeof url !== 'string') {
                throw new Error("Invalid URL provided to loadPack");
            }
            
            const resp = await fetch(url);
            if (!resp.ok) {
                throw new Error(`Failed to load pack at ${url}: ${resp.status} ${resp.statusText}`);
            }
            
            const pack: GamePack = await resp.json();
            
            // Validate pack structure
            if (!pack || typeof pack !== 'object') {
                throw new Error("Invalid game pack: not an object");
            }
            
            if (!pack.name || typeof pack.name !== 'string') {
                throw new Error("Invalid game pack format: missing or invalid name");
            }
            
            if (!Array.isArray(pack.levels)) {
                throw new Error("Invalid game pack format: missing levels array");
            }
            
            // Load assets if specified
            if (pack.assets && Array.isArray(pack.assets) && pack.assets.length > 0) {
                await this.loadAssets(pack.assets);
            }
            
            return pack;
        } catch (error) {
            console.error("Error loading game pack:", error);
            throw error;
        }
    }

    private async loadAssets(assetUrls: string[]): Promise<void> {
        const loadPromises = assetUrls.map(url => this.loadImage(url));
        await Promise.all(loadPromises);
    }

    private async loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            // Validate URL
            if (!url || typeof url !== 'string') {
                reject(new Error("Invalid image URL provided"));
                return;
            }
            
            // Validate URL format
            try {
                new URL(url, window.location.href);
            } catch (error) {
                reject(new Error(`Invalid URL format: ${url}`));
                return;
            }
            
            const img = new Image();
            
            // Set timeout to prevent hanging
            const timeout = setTimeout(() => {
                reject(new Error(`Image load timeout: ${url}`));
            }, 10000); // 10 second timeout
            
            img.onload = () => {
                clearTimeout(timeout);
                this.loadedAssets.set(url, img);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }

    public getAsset(url: string): HTMLImageElement | undefined {
        return this.loadedAssets.get(url);
    }

    public getAllAssets(): Map<string, HTMLImageElement> {
        return new Map(this.loadedAssets);
    }

    public clearAssets(): void {
        this.loadedAssets.clear();
    }
} 