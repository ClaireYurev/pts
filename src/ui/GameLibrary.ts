export interface GamePackInfo {
    name: string;
    file: string;
    description?: string;
    version?: string;
}

export class GameLibrary {
    private packs: GamePackInfo[] = [
        {
            name: "Example Pack",
            file: "packs/example.ptspack.json",
            description: "Basic example game pack",
            version: "1.0"
        },
        {
            name: "Adventure Pack",
            file: "packs/adventure.ptspack.json",
            description: "Epic adventure with multiple levels",
            version: "1.0"
        },
        {
            name: "Dungeon Pack",
            file: "packs/dungeon.ptspack.json",
            description: "Dark dungeon exploration",
            version: "1.0"
        }
    ];

    private currentPack: string = "packs/example.ptspack.json";

    constructor() {
        this.loadManifest();
    }

    private async loadManifest(): Promise<void> {
        try {
            const response = await fetch("manifest.json");
            if (response.ok) {
                const manifest = await response.json();
                if (manifest.packs && Array.isArray(manifest.packs)) {
                    this.packs = manifest.packs;
                }
            }
        } catch (error) {
            console.log("No manifest.json found, using default packs");
        }
    }

    public getPacks(): GamePackInfo[] {
        return [...this.packs];
    }

    public getCurrentPack(): string {
        return this.currentPack;
    }

    public setCurrentPack(packFile: string): void {
        this.currentPack = packFile;
    }

    public loadPack(packFile: string): void {
        if (confirm(`Load game pack "${packFile}"? Unsaved progress will be lost.`)) {
            // Reload page with new pack parameter
            const url = new URL(window.location.href);
            url.searchParams.set('pack', packFile);
            window.location.href = url.toString();
        }
    }

    public getPackByName(name: string): GamePackInfo | undefined {
        return this.packs.find(pack => pack.name === name);
    }

    public getPackByFile(file: string): GamePackInfo | undefined {
        return this.packs.find(pack => pack.file === file);
    }

    public addPack(pack: GamePackInfo): void {
        this.packs.push(pack);
    }

    public removePack(file: string): void {
        this.packs = this.packs.filter(pack => pack.file !== file);
    }

    public getActivePackInfo(): GamePackInfo | undefined {
        return this.getPackByFile(this.currentPack);
    }
} 