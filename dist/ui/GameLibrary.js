export class GameLibrary {
    constructor() {
        this.packs = [
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
        this.currentPack = "packs/example.ptspack.json";
        this.loadManifest();
    }
    async loadManifest() {
        try {
            const response = await fetch("manifest.json");
            if (response.ok) {
                const manifest = await response.json();
                if (manifest.packs && Array.isArray(manifest.packs)) {
                    this.packs = manifest.packs;
                }
            }
        }
        catch (error) {
            console.log("No manifest.json found, using default packs");
        }
    }
    getPacks() {
        return [...this.packs];
    }
    getCurrentPack() {
        return this.currentPack;
    }
    setCurrentPack(packFile) {
        this.currentPack = packFile;
    }
    loadPack(packFile) {
        if (confirm(`Load game pack "${packFile}"? Unsaved progress will be lost.`)) {
            // Reload page with new pack parameter
            const url = new URL(window.location.href);
            url.searchParams.set('pack', packFile);
            window.location.href = url.toString();
        }
    }
    getPackByName(name) {
        return this.packs.find(pack => pack.name === name);
    }
    getPackByFile(file) {
        return this.packs.find(pack => pack.file === file);
    }
    addPack(pack) {
        this.packs.push(pack);
    }
    removePack(file) {
        this.packs = this.packs.filter(pack => pack.file !== file);
    }
    getActivePackInfo() {
        return this.getPackByFile(this.currentPack);
    }
}
//# sourceMappingURL=GameLibrary.js.map