import { ExportManager } from './ExportManager';
export class ImportManager {
    constructor() {
        this.exportManager = new ExportManager();
    }
    async importFromFile(file, options = {
        validateSchema: true,
        mergeWithExisting: false,
        overwriteConflicts: true,
        importAssets: true,
        importScripts: true,
        importCutscenes: true,
        importLevels: true
    }, onProgress) {
        const errors = [];
        const warnings = [];
        const importedCount = { levels: 0, scripts: 0, cutscenes: 0, assets: 0 };
        try {
            // Validate file type
            if (!file.name.endsWith('.ptspack')) {
                return {
                    success: false,
                    errors: ['File must be a .ptspack file'],
                    importedCount
                };
            }
            onProgress?.({
                stage: 'validating',
                progress: 0,
                message: 'Validating file format...'
            });
            // Import using ExportManager
            const result = await this.exportManager.importGamePack(file);
            if (!result.success || !result.gamePack) {
                return {
                    success: false,
                    errors: result.errors || ['Failed to import game pack'],
                    importedCount
                };
            }
            onProgress?.({
                stage: 'importing',
                progress: 50,
                message: 'Processing imported data...'
            });
            const gamePack = result.gamePack;
            // Count imported items
            if (gamePack.levels) {
                importedCount.levels = Object.keys(gamePack.levels).length;
            }
            if (gamePack.scripts) {
                importedCount.scripts = Object.keys(gamePack.scripts).length;
            }
            if (gamePack.cutscenes) {
                importedCount.cutscenes = Object.keys(gamePack.cutscenes).length;
            }
            if (gamePack.assets) {
                importedCount.assets = Object.keys(gamePack.assets).length;
            }
            // Validate individual components if requested
            if (options.validateSchema) {
                onProgress?.({
                    stage: 'processing',
                    progress: 75,
                    message: 'Validating imported content...'
                });
                // Validate scripts
                if (gamePack.scripts) {
                    for (const [scriptId, script] of Object.entries(gamePack.scripts)) {
                        const scriptErrors = this.exportManager.validateScript(script);
                        if (scriptErrors.length > 0) {
                            errors.push(`Script ${scriptId}: ${scriptErrors.join(', ')}`);
                        }
                    }
                }
                // Validate cutscenes
                if (gamePack.cutscenes) {
                    for (const [cutsceneId, cutscene] of Object.entries(gamePack.cutscenes)) {
                        const cutsceneErrors = this.exportManager.validateCutscene(cutscene);
                        if (cutsceneErrors.length > 0) {
                            errors.push(`Cutscene ${cutsceneId}: ${cutsceneErrors.join(', ')}`);
                        }
                    }
                }
            }
            onProgress?.({
                stage: 'complete',
                progress: 100,
                message: 'Import completed successfully'
            });
            return {
                success: errors.length === 0,
                gamePack,
                errors: errors.length > 0 ? errors : undefined,
                warnings: warnings.length > 0 ? warnings : undefined,
                importedCount
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [`Import failed: ${error}`],
                importedCount
            };
        }
    }
    async importFromURL(url, options = {
        validateSchema: true,
        mergeWithExisting: false,
        overwriteConflicts: true,
        importAssets: true,
        importScripts: true,
        importCutscenes: true,
        importLevels: true
    }, onProgress) {
        try {
            onProgress?.({
                stage: 'validating',
                progress: 0,
                message: 'Downloading file...'
            });
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const blob = await response.blob();
            const file = new File([blob], 'imported.ptspack', { type: 'application/zip' });
            return await this.importFromFile(file, options, onProgress);
        }
        catch (error) {
            return {
                success: false,
                errors: [`Failed to download from URL: ${error}`],
                importedCount: { levels: 0, scripts: 0, cutscenes: 0, assets: 0 }
            };
        }
    }
    async importFromData(data, options = {
        validateSchema: true,
        mergeWithExisting: false,
        overwriteConflicts: true,
        importAssets: true,
        importScripts: true,
        importCutscenes: true,
        importLevels: true
    }) {
        const errors = [];
        const warnings = [];
        const importedCount = { levels: 0, scripts: 0, cutscenes: 0, assets: 0 };
        try {
            const gamePack = {
                id: 'imported_' + Date.now(),
                name: 'Imported Game Pack',
                version: '1.0.0',
                description: 'Imported from data',
                author: 'Unknown',
                levels: {},
                scripts: {},
                cutscenes: {},
                assets: {}
            };
            // Import levels
            if (options.importLevels && data.levels) {
                for (const [levelId, levelData] of Object.entries(data.levels)) {
                    if (options.validateSchema) {
                        const levelErrors = this.exportManager.getSchemaErrors('level', levelData);
                        if (levelErrors.length > 0) {
                            errors.push(`Level ${levelId}: ${levelErrors.join(', ')}`);
                        }
                    }
                    gamePack.levels[levelId] = levelData;
                    importedCount.levels++;
                }
            }
            // Import scripts
            if (options.importScripts && data.scripts) {
                for (const [scriptId, scriptData] of Object.entries(data.scripts)) {
                    if (options.validateSchema) {
                        const scriptErrors = this.exportManager.validateScript(scriptData);
                        if (scriptErrors.length > 0) {
                            errors.push(`Script ${scriptId}: ${scriptErrors.join(', ')}`);
                        }
                    }
                    gamePack.scripts[scriptId] = scriptData;
                    importedCount.scripts++;
                }
            }
            // Import cutscenes
            if (options.importCutscenes && data.cutscenes) {
                for (const [cutsceneId, cutsceneData] of Object.entries(data.cutscenes)) {
                    if (options.validateSchema) {
                        const cutsceneErrors = this.exportManager.validateCutscene(cutsceneData);
                        if (cutsceneErrors.length > 0) {
                            errors.push(`Cutscene ${cutsceneId}: ${cutsceneErrors.join(', ')}`);
                        }
                    }
                    gamePack.cutscenes[cutsceneId] = cutsceneData;
                    importedCount.cutscenes++;
                }
            }
            // Import assets
            if (options.importAssets && data.assets) {
                for (const [assetId, assetData] of Object.entries(data.assets)) {
                    gamePack.assets[assetId] = assetData;
                    importedCount.assets++;
                }
            }
            return {
                success: errors.length === 0,
                gamePack,
                errors: errors.length > 0 ? errors : undefined,
                warnings: warnings.length > 0 ? warnings : undefined,
                importedCount
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [`Import from data failed: ${error}`],
                importedCount
            };
        }
    }
    mergeGamePacks(target, source, options) {
        const conflicts = [];
        const merged = { ...target };
        // Merge levels
        if (options.mergeLevels && source.levels) {
            for (const [levelId, levelData] of Object.entries(source.levels)) {
                if (merged.levels[levelId] && !options.overwriteConflicts) {
                    conflicts.push(`Level: ${levelId}`);
                }
                else {
                    merged.levels[levelId] = levelData;
                }
            }
        }
        // Merge scripts
        if (options.mergeScripts && source.scripts) {
            for (const [scriptId, scriptData] of Object.entries(source.scripts)) {
                if (merged.scripts[scriptId] && !options.overwriteConflicts) {
                    conflicts.push(`Script: ${scriptId}`);
                }
                else {
                    merged.scripts[scriptId] = scriptData;
                }
            }
        }
        // Merge cutscenes
        if (options.mergeCutscenes && source.cutscenes) {
            for (const [cutsceneId, cutsceneData] of Object.entries(source.cutscenes)) {
                if (merged.cutscenes[cutsceneId] && !options.overwriteConflicts) {
                    conflicts.push(`Cutscene: ${cutsceneId}`);
                }
                else {
                    merged.cutscenes[cutsceneId] = cutsceneData;
                }
            }
        }
        // Merge assets
        if (options.mergeAssets && source.assets) {
            for (const [assetId, assetData] of Object.entries(source.assets)) {
                if (merged.assets[assetId] && !options.overwriteConflicts) {
                    conflicts.push(`Asset: ${assetId}`);
                }
                else {
                    merged.assets[assetId] = assetData;
                }
            }
        }
        return {
            success: conflicts.length === 0,
            conflicts,
            merged
        };
    }
    validateGamePack(gamePack) {
        const errors = [];
        // Validate pack structure
        if (!gamePack.id || !gamePack.name) {
            errors.push('Game pack must have id and name');
        }
        // Validate scripts
        if (gamePack.scripts) {
            for (const [scriptId, script] of Object.entries(gamePack.scripts)) {
                const scriptErrors = this.exportManager.validateScript(script);
                if (scriptErrors.length > 0) {
                    errors.push(`Script ${scriptId}: ${scriptErrors.join(', ')}`);
                }
            }
        }
        // Validate cutscenes
        if (gamePack.cutscenes) {
            for (const [cutsceneId, cutscene] of Object.entries(gamePack.cutscenes)) {
                const cutsceneErrors = this.exportManager.validateCutscene(cutscene);
                if (cutsceneErrors.length > 0) {
                    errors.push(`Cutscene ${cutsceneId}: ${cutsceneErrors.join(', ')}`);
                }
            }
        }
        // Validate levels
        if (gamePack.levels) {
            for (const [levelId, level] of Object.entries(gamePack.levels)) {
                const levelErrors = this.exportManager.getSchemaErrors('level', level);
                if (levelErrors.length > 0) {
                    errors.push(`Level ${levelId}: ${levelErrors.join(', ')}`);
                }
            }
        }
        return errors;
    }
    getImportPreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const zip = new JSZip();
                    const zipData = await zip.loadAsync(e.target?.result);
                    const packFile = zipData.file('pack.json');
                    if (!packFile) {
                        resolve({ success: false, errors: ['No pack.json found'] });
                        return;
                    }
                    const packInfo = JSON.parse(await packFile.async('text'));
                    const levelsFolder = zipData.folder('levels');
                    const scriptsFolder = zipData.folder('scripts');
                    const cutscenesFolder = zipData.folder('cutscenes');
                    const assetsFolder = zipData.folder('assets');
                    const preview = {
                        packInfo,
                        levelCount: levelsFolder ? Object.keys(levelsFolder.files).filter(f => !f.endsWith('/')).length : 0,
                        scriptCount: scriptsFolder ? Object.keys(scriptsFolder.files).filter(f => !f.endsWith('/')).length : 0,
                        cutsceneCount: cutscenesFolder ? Object.keys(cutscenesFolder.files).filter(f => !f.endsWith('/')).length : 0,
                        assetCount: assetsFolder ? Object.keys(assetsFolder.files).filter(f => !f.endsWith('/')).length : 0
                    };
                    resolve({ success: true, preview });
                }
                catch (error) {
                    resolve({ success: false, errors: [`Preview failed: ${error}`] });
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }
}
//# sourceMappingURL=ImportManager.js.map