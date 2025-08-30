export class GamePackLoader {
    constructor() {
        this.loadedAssets = new Map();
    }
    async loadPack(url) {
        try {
            // Validate URL
            if (!url || typeof url !== 'string') {
                throw new Error("Invalid URL provided to loadPack");
            }
            const resp = await fetch(url);
            if (!resp.ok) {
                throw new Error(`Failed to load pack at ${url}: ${resp.status} ${resp.statusText}`);
            }
            const pack = await resp.json();
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
        }
        catch (error) {
            console.error("Error loading game pack:", error);
            throw error;
        }
    }
    async loadAssets(assetUrls) {
        const loadPromises = assetUrls.map(url => this.loadImage(url));
        await Promise.all(loadPromises);
    }
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            // Validate URL
            if (!url || typeof url !== 'string') {
                reject(new Error("Invalid image URL provided"));
                return;
            }
            // Validate URL format
            try {
                new URL(url, window.location.href);
            }
            catch (error) {
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
    getAsset(url) {
        return this.loadedAssets.get(url);
    }
    getAllAssets() {
        return new Map(this.loadedAssets);
    }
    clearAssets() {
        this.loadedAssets.clear();
    }
}
//# sourceMappingURL=GamePackLoader.js.map