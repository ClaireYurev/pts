export class ImportManager {
    constructor(editor) {
        this.supportedFormats = ['.json', '.ptspack.json', '.ptspack'];
        this.editor = editor;
    }
    async loadFile(file) {
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }
            // Read file content
            const content = await this.readFileContent(file);
            // Parse JSON
            const packData = this.parsePackData(content);
            // Validate pack structure
            const structureValidation = this.validatePackStructure(packData);
            if (!structureValidation.valid) {
                return {
                    success: false,
                    errors: structureValidation.errors
                };
            }
            // Load pack into editor
            this.loadPackIntoEditor(packData);
            return {
                success: true,
                data: packData,
                warnings: structureValidation.warnings
            };
        }
        catch (error) {
            console.error('Import failed:', error);
            return {
                success: false,
                errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
            };
        }
    }
    validateFile(file) {
        const errors = [];
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            errors.push('File size must be less than 10MB');
        }
        // Check file extension
        const extension = this.getFileExtension(file.name);
        if (!this.supportedFormats.includes(extension)) {
            errors.push(`Unsupported file format. Supported formats: ${this.supportedFormats.join(', ')}`);
        }
        // Check if file is empty
        if (file.size === 0) {
            errors.push('File is empty');
        }
        return { valid: errors.length === 0, errors };
    }
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1)
            return '';
        const extension = filename.substring(lastDot).toLowerCase();
        // Handle double extensions like .ptspack.json
        if (extension === '.json' && filename.toLowerCase().includes('.ptspack.json')) {
            return '.ptspack.json';
        }
        return extension;
    }
    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    parsePackData(content) {
        try {
            const data = JSON.parse(content);
            return data;
        }
        catch (error) {
            throw new Error('Invalid JSON format');
        }
    }
    validatePackStructure(packData) {
        const errors = [];
        const warnings = [];
        // Check for required fields
        if (!packData.meta) {
            errors.push('Missing meta information');
        }
        else {
            if (!packData.meta.name) {
                errors.push('Missing pack name in meta');
            }
            if (!packData.meta.version) {
                errors.push('Missing pack version in meta');
            }
        }
        // Check for level data
        if (!packData.level) {
            errors.push('Missing level data');
        }
        else {
            if (!packData.level.tileMap) {
                errors.push('Missing tile map in level data');
            }
            if (!Array.isArray(packData.level.entities)) {
                warnings.push('Entities array is missing or invalid');
            }
            if (!Array.isArray(packData.level.triggers)) {
                warnings.push('Triggers array is missing or invalid');
            }
        }
        // Check for scripts
        if (!packData.scripts) {
            warnings.push('Scripts section is missing');
        }
        else {
            if (!Array.isArray(packData.scripts.rules)) {
                warnings.push('Script rules array is missing or invalid');
            }
            if (!Array.isArray(packData.scripts.cutscenes)) {
                warnings.push('Cutscenes array is missing or invalid');
            }
        }
        // Check for assets
        if (!packData.assets) {
            warnings.push('Assets section is missing');
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    loadPackIntoEditor(packData) {
        try {
            // Load level data
            if (packData.level) {
                if (packData.level.tileMap) {
                    this.editor.getLevelCanvas().setGrid(packData.level.tileMap);
                }
                if (Array.isArray(packData.level.entities)) {
                    this.editor.getLevelCanvas().setEntities(packData.level.entities);
                }
                if (Array.isArray(packData.level.triggers)) {
                    this.editor.getTriggerManager().setTriggers(packData.level.triggers);
                }
            }
            // Load scripts
            if (packData.scripts) {
                if (Array.isArray(packData.scripts.rules)) {
                    // Load into script editor if available
                    const scriptEditor = this.editor.scriptEditor;
                    if (scriptEditor && typeof scriptEditor.loadRules === 'function') {
                        scriptEditor.loadRules(packData.scripts.rules);
                    }
                }
                if (Array.isArray(packData.scripts.cutscenes)) {
                    // Load into cutscene editor if available
                    const cutsceneEditor = this.editor.cutsceneEditor;
                    if (cutsceneEditor && typeof cutsceneEditor.loadTimeline === 'function') {
                        cutsceneEditor.loadTimeline(packData.scripts.cutscenes);
                    }
                }
            }
            // Load assets if present
            if (packData.assets && Array.isArray(packData.assets)) {
                this.loadAssets(packData.assets);
            }
            // Redraw the level canvas
            this.editor.getLevelCanvas().redraw();
            console.log('Pack loaded successfully:', packData.meta?.name || 'Unknown pack');
        }
        catch (error) {
            console.error('Failed to load pack into editor:', error);
            throw new Error(`Failed to load pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async loadAssets(assetUrls) {
        // Load assets from data URLs or file paths
        for (const assetUrl of assetUrls) {
            try {
                if (assetUrl.startsWith('data:')) {
                    // Handle data URL
                    await this.loadDataUrlAsset(assetUrl);
                }
                else {
                    // Handle file path (would need to be implemented based on your asset loading system)
                    console.warn('File path assets not yet implemented:', assetUrl);
                }
            }
            catch (error) {
                console.warn('Failed to load asset:', assetUrl, error);
            }
        }
    }
    async loadDataUrlAsset(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Add to tile palette if it's a tileset
                const tilePalette = this.editor.tilePalette;
                if (tilePalette && typeof tilePalette.addTile === 'function') {
                    tilePalette.addTile(img);
                }
                resolve();
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }
    async loadFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const content = await response.text();
            const packData = this.parsePackData(content);
            const structureValidation = this.validatePackStructure(packData);
            if (!structureValidation.valid) {
                return {
                    success: false,
                    errors: structureValidation.errors
                };
            }
            this.loadPackIntoEditor(packData);
            return {
                success: true,
                data: packData,
                warnings: structureValidation.warnings
            };
        }
        catch (error) {
            console.error('Failed to load from URL:', error);
            return {
                success: false,
                errors: [`Failed to load from URL: ${error instanceof Error ? error.message : 'Unknown error'}`]
            };
        }
    }
    getSupportedFormats() {
        return [...this.supportedFormats];
    }
    validatePackCompatibility(packData) {
        const issues = [];
        // Check format version
        if (packData.meta?.formatVersion) {
            const version = packData.meta.formatVersion;
            if (version !== '1.0.0') {
                issues.push(`Format version ${version} may not be fully compatible`);
            }
        }
        // Check for unsupported features
        if (packData.advancedFeatures) {
            issues.push('Pack contains advanced features that may not be supported');
        }
        // Check for missing required assets
        if (packData.assets && Array.isArray(packData.assets)) {
            const missingAssets = this.checkMissingAssets(packData.assets);
            if (missingAssets.length > 0) {
                issues.push(`Missing assets: ${missingAssets.join(', ')}`);
            }
        }
        return {
            compatible: issues.length === 0,
            issues
        };
    }
    checkMissingAssets(assets) {
        const missing = [];
        for (const asset of assets) {
            if (!asset.startsWith('data:') && !this.assetExists(asset)) {
                missing.push(asset);
            }
        }
        return missing;
    }
    assetExists(assetPath) {
        // This would check if the asset file exists in your asset system
        // For now, we'll assume all non-data URL assets are missing
        return false;
    }
    createImportPreview(packData) {
        const preview = {
            name: packData.meta?.name || 'Unknown Pack',
            version: packData.meta?.version || 'Unknown Version',
            description: packData.meta?.description || 'No description',
            stats: {
                tiles: this.countTiles(packData.level?.tileMap),
                entities: packData.level?.entities?.length || 0,
                triggers: packData.level?.triggers?.length || 0,
                scripts: packData.scripts?.rules?.length || 0,
                cutscenes: packData.scripts?.cutscenes?.length || 0,
                assets: packData.assets?.length || 0
            },
            compatibility: this.validatePackCompatibility(packData)
        };
        return JSON.stringify(preview, null, 2);
    }
    countTiles(tileMap) {
        if (!tileMap || !Array.isArray(tileMap))
            return 0;
        let count = 0;
        for (const row of tileMap) {
            if (Array.isArray(row)) {
                for (const tile of row) {
                    if (tile > 0)
                        count++;
                }
            }
        }
        return count;
    }
}
//# sourceMappingURL=ImportManager.js.map