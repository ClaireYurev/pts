export class ExportManager {
    constructor() {
        this.packData = null;
    }
    async exportPack(packData) {
        this.packData = packData;
        try {
            // Validate pack data
            const validation = this.validatePackData(packData);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            // Create pack JSON
            const packJson = this.createPackJson(packData);
            // Generate filename
            const filename = this.generateFilename(packData.meta.name);
            // Export as JSON file
            await this.exportAsJson(packJson, filename);
            console.log('Pack exported successfully:', filename);
        }
        catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }
    validatePackData(packData) {
        const errors = [];
        // Validate meta
        if (!packData.meta.name || packData.meta.name.trim() === '') {
            errors.push('Pack name is required');
        }
        if (!packData.meta.version || packData.meta.version.trim() === '') {
            errors.push('Pack version is required');
        }
        // Validate tileMap
        if (!packData.tileMap || !Array.isArray(packData.tileMap) || packData.tileMap.length === 0) {
            errors.push('Tile map is required and must be a non-empty array');
        }
        // Validate entities
        if (!Array.isArray(packData.entities)) {
            errors.push('Entities must be an array');
        }
        // Validate triggers
        if (!Array.isArray(packData.triggers)) {
            errors.push('Triggers must be an array');
        }
        // Validate scripts
        if (!Array.isArray(packData.scripts)) {
            errors.push('Scripts must be an array');
        }
        // Validate cutscenes
        if (!Array.isArray(packData.cutscenes)) {
            errors.push('Cutscenes must be an array');
        }
        return { valid: errors.length === 0, errors };
    }
    createPackJson(packData) {
        const now = new Date().toISOString();
        return {
            meta: {
                ...packData.meta,
                created: packData.meta.created || now,
                modified: now,
                format: 'ptspack',
                formatVersion: '1.0.0'
            },
            level: {
                tileMap: packData.tileMap,
                entities: packData.entities,
                triggers: packData.triggers,
                settings: {
                    tileSize: 32,
                    gravity: 9.8,
                    maxVelocity: 2000,
                    ...packData.settings
                }
            },
            scripts: {
                rules: packData.scripts,
                cutscenes: packData.cutscenes
            },
            assets: packData.assets || [],
            version: packData.meta.version
        };
    }
    generateFilename(packName) {
        // Sanitize filename
        const sanitizedName = packName
            .replace(/[^a-zA-Z0-9\s-_]/g, '')
            .replace(/\s+/g, '_')
            .toLowerCase();
        return `${sanitizedName}.ptspack.json`;
    }
    async exportAsJson(packJson, filename) {
        const jsonString = JSON.stringify(packJson, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    async exportAsZip(packData) {
        // This would require JSZip library
        // For now, we'll just export as JSON
        await this.exportPack(packData);
    }
    async exportAssets(assets) {
        const assetUrls = [];
        for (const asset of assets) {
            try {
                const dataUrl = await this.fileToDataUrl(asset);
                assetUrls.push(dataUrl);
            }
            catch (error) {
                console.warn(`Failed to export asset ${asset.name}:`, error);
            }
        }
        return assetUrls;
    }
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    generatePackPreview(packData) {
        const preview = {
            name: packData.meta.name,
            version: packData.meta.version,
            description: packData.meta.description,
            stats: {
                tiles: this.countTiles(packData.tileMap),
                entities: packData.entities.length,
                triggers: packData.triggers.length,
                scripts: packData.scripts.length,
                cutscenes: packData.cutscenes.length
            },
            size: this.estimatePackSize(packData)
        };
        return JSON.stringify(preview, null, 2);
    }
    countTiles(tileMap) {
        if (!tileMap || tileMap.length === 0)
            return 0;
        let count = 0;
        for (const row of tileMap) {
            for (const tile of row) {
                if (tile > 0)
                    count++;
            }
        }
        return count;
    }
    estimatePackSize(packData) {
        const jsonString = JSON.stringify(packData);
        const sizeInBytes = new Blob([jsonString]).size;
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} B`;
        }
        else if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        }
        else {
            return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        }
    }
    validatePackName(name) {
        const errors = [];
        if (!name || name.trim() === '') {
            errors.push('Pack name cannot be empty');
        }
        if (name.length > 50) {
            errors.push('Pack name must be 50 characters or less');
        }
        if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
            errors.push('Pack name can only contain letters, numbers, spaces, hyphens, and underscores');
        }
        return { valid: errors.length === 0, errors };
    }
    createDefaultPackMeta() {
        return {
            name: 'My Custom Pack',
            version: '1.0.0',
            description: 'A custom game pack created with PrinceTS Editor',
            author: 'Unknown',
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
    }
    async exportPackWithAssets(packData, assetFiles) {
        try {
            // Export assets first
            const assetUrls = await this.exportAssets(assetFiles);
            // Add asset URLs to pack data
            const packWithAssets = {
                ...packData,
                assets: assetUrls
            };
            // Export the pack
            await this.exportPack(packWithAssets);
        }
        catch (error) {
            console.error('Failed to export pack with assets:', error);
            throw error;
        }
    }
    getExportFormats() {
        return [
            {
                name: 'PrinceTS Pack (JSON)',
                extension: '.ptspack.json',
                description: 'Standard PrinceTS pack format'
            },
            {
                name: 'PrinceTS Pack (ZIP)',
                extension: '.ptspack.zip',
                description: 'Compressed pack with assets'
            },
            {
                name: 'Raw JSON',
                extension: '.json',
                description: 'Plain JSON format'
            }
        ];
    }
    async exportInFormat(packData, format) {
        switch (format) {
            case 'json':
                await this.exportPack(packData);
                break;
            case 'zip':
                await this.exportAsZip(packData);
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}
//# sourceMappingURL=ExportManager.js.map