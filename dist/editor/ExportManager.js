import JSZip from 'jszip';
import Ajv from 'ajv';
// Define schemas inline
const scriptSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "ECA Script Schema",
    "type": "object",
    "required": ["id", "name", "nodes", "edges", "variables"],
    "properties": {
        "id": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_-]+$",
            "minLength": 1,
            "maxLength": 50
        },
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "nodes": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "type", "kind", "x", "y", "props"],
                "properties": {
                    "id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z0-9_-]+$"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["Event", "Condition", "Action"]
                    },
                    "kind": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 50
                    },
                    "x": {
                        "type": "number",
                        "minimum": -10000,
                        "maximum": 10000
                    },
                    "y": {
                        "type": "number",
                        "minimum": -10000,
                        "maximum": 10000
                    },
                    "props": {
                        "type": "object",
                        "additionalProperties": true
                    }
                }
            }
        },
        "edges": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "from", "to"],
                "properties": {
                    "id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z0-9_-]+$"
                    },
                    "from": {
                        "type": "string",
                        "pattern": "^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$"
                    },
                    "to": {
                        "type": "string",
                        "pattern": "^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$"
                    }
                }
            }
        },
        "variables": {
            "type": "object",
            "additionalProperties": true
        }
    }
};
const cutsceneSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Cutscene Schema",
    "type": "object",
    "required": ["id", "name", "duration", "tracks", "metadata"],
    "properties": {
        "id": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_-]+$",
            "minLength": 1,
            "maxLength": 50
        },
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "duration": {
            "type": "integer",
            "minimum": 100,
            "maximum": 300000
        },
        "tracks": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "type", "color", "items"],
                "properties": {
                    "id": {
                        "type": "string",
                        "pattern": "^[a-zA-Z0-9_-]+$"
                    },
                    "name": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 50
                    },
                    "type": {
                        "type": "string",
                        "enum": ["camera", "text", "sprite", "music", "wait"]
                    },
                    "color": {
                        "type": "string",
                        "pattern": "^#[0-9A-Fa-f]{6}$"
                    },
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["id", "time", "track", "action", "args"],
                            "properties": {
                                "id": {
                                    "type": "string",
                                    "pattern": "^[a-zA-Z0-9_-]+$"
                                },
                                "time": {
                                    "type": "integer",
                                    "minimum": 0
                                },
                                "track": {
                                    "type": "string",
                                    "enum": ["camera", "text", "sprite", "music", "wait"]
                                },
                                "action": {
                                    "type": "string",
                                    "minLength": 1,
                                    "maxLength": 50
                                },
                                "args": {
                                    "type": "object",
                                    "additionalProperties": true
                                },
                                "duration": {
                                    "type": "integer",
                                    "minimum": 0
                                }
                            }
                        }
                    }
                }
            }
        },
        "metadata": {
            "type": "object",
            "required": ["created", "editor"],
            "properties": {
                "created": {
                    "type": "string",
                    "format": "date-time"
                },
                "editor": {
                    "type": "string",
                    "const": "PrinceTS Cutscene Editor"
                },
                "description": {
                    "type": "string",
                    "maxLength": 500
                }
            },
            "additionalProperties": true
        }
    }
};
const gamepackSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Game Pack Schema",
    "type": "object",
    "required": ["name"],
    "properties": {
        "id": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_-]+$"
        },
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "version": {
            "type": "string",
            "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
        },
        "description": {
            "type": "string",
            "maxLength": 500
        },
        "author": {
            "type": "string",
            "maxLength": 100
        },
        "created": {
            "type": "string",
            "format": "date-time"
        },
        "engine": {
            "type": "string",
            "const": "PrinceTS"
        },
        "schema": {
            "type": "string",
            "const": "1.0"
        }
    }
};
const levelSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Level Schema",
    "type": "object",
    "required": ["id", "name", "tileMap", "entities"],
    "properties": {
        "id": {
            "type": "integer",
            "minimum": 0
        },
        "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100
        },
        "tileMap": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "integer"
                }
            }
        },
        "entities": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["type", "x", "y"],
                "properties": {
                    "type": {
                        "type": "string"
                    },
                    "x": {
                        "type": "number"
                    },
                    "y": {
                        "type": "number"
                    }
                },
                "additionalProperties": true
            }
        },
        "background": {
            "type": "string"
        },
        "music": {
            "type": "string"
        }
    }
};
export class ExportManager {
    constructor() {
        this.validators = new Map();
        this.ajv = new Ajv({
            allErrors: true,
            verbose: true,
            strict: false
        });
        this.initializeValidators();
    }
    initializeValidators() {
        // Add JSON schemas to Ajv
        this.ajv.addSchema(scriptSchema, 'script');
        this.ajv.addSchema(cutsceneSchema, 'cutscene');
        this.ajv.addSchema(gamepackSchema, 'gamepack');
        this.ajv.addSchema(levelSchema, 'level');
        // Create validators
        this.validators.set('script', this.ajv.getSchema('script'));
        this.validators.set('cutscene', this.ajv.getSchema('cutscene'));
        this.validators.set('gamepack', this.ajv.getSchema('gamepack'));
        this.validators.set('level', this.ajv.getSchema('level'));
    }
    async exportGamePack(gamePack, options = {
        includeAssets: true,
        includeScripts: true,
        includeCutscenes: true,
        includeLevels: true,
        validateSchema: true,
        compress: true
    }) {
        const zip = new JSZip();
        const errors = [];
        const warnings = [];
        try {
            // Create pack.json
            const packData = {
                id: gamePack.id || 'unknown',
                name: gamePack.name,
                version: gamePack.version || '1.0.0',
                description: gamePack.description || '',
                author: gamePack.author || 'Unknown',
                created: new Date().toISOString(),
                engine: 'PrinceTS',
                schema: '1.0'
            };
            // Validate pack.json
            if (options.validateSchema) {
                const packValidator = this.validators.get('gamepack');
                if (packValidator) {
                    const valid = packValidator(packData);
                    if (!valid) {
                        errors.push('Pack validation failed: ' + JSON.stringify(packValidator.errors));
                    }
                }
            }
            zip.file('pack.json', JSON.stringify(packData, null, 2));
            // Export levels
            if (options.includeLevels && gamePack.levels) {
                const levelsFolder = zip.folder('levels');
                if (levelsFolder) {
                    for (const [levelId, level] of Object.entries(gamePack.levels)) {
                        try {
                            const levelData = JSON.stringify(level, null, 2);
                            if (options.validateSchema) {
                                const levelValidator = this.validators.get('level');
                                if (levelValidator) {
                                    const valid = levelValidator(level);
                                    if (!valid) {
                                        errors.push(`Level ${levelId} validation failed: ` + JSON.stringify(levelValidator.errors));
                                    }
                                }
                            }
                            levelsFolder.file(`${levelId}.json`, levelData);
                        }
                        catch (error) {
                            errors.push(`Failed to export level ${levelId}: ${error}`);
                        }
                    }
                }
            }
            // Export scripts
            if (options.includeScripts && gamePack.scripts) {
                const scriptsFolder = zip.folder('scripts');
                if (scriptsFolder) {
                    for (const [scriptId, script] of Object.entries(gamePack.scripts)) {
                        try {
                            const scriptData = JSON.stringify(script, null, 2);
                            if (options.validateSchema) {
                                const scriptValidator = this.validators.get('script');
                                if (scriptValidator) {
                                    const valid = scriptValidator(script);
                                    if (!valid) {
                                        errors.push(`Script ${scriptId} validation failed: ` + JSON.stringify(scriptValidator.errors));
                                    }
                                }
                            }
                            scriptsFolder.file(`${scriptId}.json`, scriptData);
                        }
                        catch (error) {
                            errors.push(`Failed to export script ${scriptId}: ${error}`);
                        }
                    }
                }
            }
            // Export cutscenes
            if (options.includeCutscenes && gamePack.cutscenes) {
                const cutscenesFolder = zip.folder('cutscenes');
                if (cutscenesFolder) {
                    for (const [cutsceneId, cutscene] of Object.entries(gamePack.cutscenes)) {
                        try {
                            const cutsceneData = JSON.stringify(cutscene, null, 2);
                            if (options.validateSchema) {
                                const cutsceneValidator = this.validators.get('cutscene');
                                if (cutsceneValidator) {
                                    const valid = cutsceneValidator(cutscene);
                                    if (!valid) {
                                        errors.push(`Cutscene ${cutsceneId} validation failed: ` + JSON.stringify(cutsceneValidator.errors));
                                    }
                                }
                            }
                            cutscenesFolder.file(`${cutsceneId}.json`, cutsceneData);
                        }
                        catch (error) {
                            errors.push(`Failed to export cutscene ${cutsceneId}: ${error}`);
                        }
                    }
                }
            }
            // Export assets
            if (options.includeAssets && gamePack.assets) {
                const assetsFolder = zip.folder('assets');
                if (assetsFolder) {
                    for (const [assetId, asset] of Object.entries(gamePack.assets)) {
                        try {
                            if (asset.type === 'image') {
                                // Convert base64 to blob
                                const base64Data = asset.data.split(',')[1];
                                const binaryData = atob(base64Data);
                                const bytes = new Uint8Array(binaryData.length);
                                for (let i = 0; i < binaryData.length; i++) {
                                    bytes[i] = binaryData.charCodeAt(i);
                                }
                                assetsFolder.file(`${assetId}.png`, bytes);
                            }
                            else if (asset.type === 'audio') {
                                // Handle audio files
                                const base64Data = asset.data.split(',')[1];
                                const binaryData = atob(base64Data);
                                const bytes = new Uint8Array(binaryData.length);
                                for (let i = 0; i < binaryData.length; i++) {
                                    bytes[i] = binaryData.charCodeAt(i);
                                }
                                assetsFolder.file(`${assetId}.mp3`, bytes);
                            }
                            else if (asset.type === 'json') {
                                assetsFolder.file(`${assetId}.json`, asset.data);
                            }
                        }
                        catch (error) {
                            errors.push(`Failed to export asset ${assetId}: ${error}`);
                        }
                    }
                }
            }
            // Generate zip file
            const zipOptions = {
                type: 'blob',
                compression: options.compress ? 'DEFLATE' : 'STORE',
                compressionOptions: {
                    level: 6
                }
            };
            const blob = await zip.generateAsync(zipOptions);
            // Create download
            const filename = `${gamePack.id || 'pack'}_${gamePack.version || '1.0.0'}.ptspack`;
            this.downloadFile(blob, filename);
            return {
                success: errors.length === 0,
                filename,
                errors: errors.length > 0 ? errors : undefined,
                warnings: warnings.length > 0 ? warnings : undefined,
                size: blob.size
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [`Export failed: ${error}`]
            };
        }
    }
    async importGamePack(file) {
        const errors = [];
        try {
            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);
            // Read pack.json
            const packFile = zipData.file('pack.json');
            if (!packFile) {
                return { success: false, errors: ['No pack.json found in the file'] };
            }
            const packData = JSON.parse(await packFile.async('text'));
            // Validate pack.json
            const packValidator = this.validators.get('gamepack');
            if (packValidator) {
                const valid = packValidator(packData);
                if (!valid) {
                    errors.push('Pack validation failed: ' + JSON.stringify(packValidator.errors));
                }
            }
            const gamePack = {
                id: packData.id,
                name: packData.name,
                version: packData.version,
                description: packData.description,
                author: packData.author,
                levels: {},
                scripts: {},
                cutscenes: {},
                assets: {}
            };
            // Import levels
            const levelsFolder = zipData.folder('levels');
            if (levelsFolder) {
                for (const [filename, file] of Object.entries(levelsFolder.files)) {
                    if (!file.dir) {
                        try {
                            const levelData = JSON.parse(await file.async('text'));
                            const levelId = filename.replace('.json', '');
                            // Validate level
                            const levelValidator = this.validators.get('level');
                            if (levelValidator) {
                                const valid = levelValidator(levelData);
                                if (!valid) {
                                    errors.push(`Level ${levelId} validation failed: ` + JSON.stringify(levelValidator.errors));
                                }
                            }
                            gamePack.levels[levelId] = levelData;
                        }
                        catch (error) {
                            errors.push(`Failed to import level ${filename}: ${error}`);
                        }
                    }
                }
            }
            // Import scripts
            const scriptsFolder = zipData.folder('scripts');
            if (scriptsFolder) {
                for (const [filename, file] of Object.entries(scriptsFolder.files)) {
                    if (!file.dir) {
                        try {
                            const scriptData = JSON.parse(await file.async('text'));
                            const scriptId = filename.replace('.json', '');
                            // Validate script
                            const scriptValidator = this.validators.get('script');
                            if (scriptValidator) {
                                const valid = scriptValidator(scriptData);
                                if (!valid) {
                                    errors.push(`Script ${scriptId} validation failed: ` + JSON.stringify(scriptValidator.errors));
                                }
                            }
                            gamePack.scripts[scriptId] = scriptData;
                        }
                        catch (error) {
                            errors.push(`Failed to import script ${filename}: ${error}`);
                        }
                    }
                }
            }
            // Import cutscenes
            const cutscenesFolder = zipData.folder('cutscenes');
            if (cutscenesFolder) {
                for (const [filename, file] of Object.entries(cutscenesFolder.files)) {
                    if (!file.dir) {
                        try {
                            const cutsceneData = JSON.parse(await file.async('text'));
                            const cutsceneId = filename.replace('.json', '');
                            // Validate cutscene
                            const cutsceneValidator = this.validators.get('cutscene');
                            if (cutsceneValidator) {
                                const valid = cutsceneValidator(cutsceneData);
                                if (!valid) {
                                    errors.push(`Cutscene ${cutsceneId} validation failed: ` + JSON.stringify(cutsceneValidator.errors));
                                }
                            }
                            gamePack.cutscenes[cutsceneId] = cutsceneData;
                        }
                        catch (error) {
                            errors.push(`Failed to import cutscene ${filename}: ${error}`);
                        }
                    }
                }
            }
            // Import assets
            const assetsFolder = zipData.folder('assets');
            if (assetsFolder) {
                for (const [filename, file] of Object.entries(assetsFolder.files)) {
                    if (!file.dir) {
                        try {
                            const assetId = filename.split('.')[0];
                            const extension = filename.split('.').pop()?.toLowerCase();
                            if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
                                const blob = await file.async('blob');
                                const base64 = await this.blobToBase64(blob);
                                gamePack.assets[assetId] = {
                                    type: 'image',
                                    data: base64,
                                    format: extension
                                };
                            }
                            else if (extension === 'mp3' || extension === 'wav') {
                                const blob = await file.async('blob');
                                const base64 = await this.blobToBase64(blob);
                                gamePack.assets[assetId] = {
                                    type: 'audio',
                                    data: base64,
                                    format: extension
                                };
                            }
                            else if (extension === 'json') {
                                const data = await file.async('text');
                                gamePack.assets[assetId] = {
                                    type: 'json',
                                    data: data,
                                    format: 'json'
                                };
                            }
                        }
                        catch (error) {
                            errors.push(`Failed to import asset ${filename}: ${error}`);
                        }
                    }
                }
            }
            return {
                success: errors.length === 0,
                gamePack,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [`Import failed: ${error}`]
            };
        }
    }
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    validateScript(script) {
        const errors = [];
        const validator = this.validators.get('script');
        if (validator) {
            const valid = validator(script);
            if (!valid) {
                errors.push(...validator.errors?.map((e) => `${e.instancePath}: ${e.message}`) || []);
            }
        }
        return errors;
    }
    validateCutscene(cutscene) {
        const errors = [];
        const validator = this.validators.get('cutscene');
        if (validator) {
            const valid = validator(cutscene);
            if (!valid) {
                errors.push(...validator.errors?.map((e) => `${e.instancePath}: ${e.message}`) || []);
            }
        }
        return errors;
    }
    getSchemaErrors(schemaType, data) {
        const errors = [];
        const validator = this.validators.get(schemaType);
        if (validator) {
            const valid = validator(data);
            if (!valid) {
                errors.push(...validator.errors?.map((e) => `${e.instancePath}: ${e.message}`) || []);
            }
        }
        return errors;
    }
}
//# sourceMappingURL=ExportManager.js.map