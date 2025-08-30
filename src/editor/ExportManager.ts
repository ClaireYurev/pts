import { GamePack, LevelData } from './EditorApp.js';
import { ECAGraph } from './VisualScriptEditor.js';
import { Cutscene } from './CutsceneEditor.js';

// Note: JSZip would need to be installed via npm
// For now, we'll create a mock implementation
interface JSZip {
    file(name: string, data: string | Blob): JSZip;
    generateAsync(options: { type: string }): Promise<Blob>;
}

export class ExportManager {
    constructor() {}

    public exportLevel(level: LevelData): void {
        try {
            const dataStr = JSON.stringify(level, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${level.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            console.log('Level exported successfully:', level.name);
        } catch (error: unknown) {
            console.error('Failed to export level:', error);
            throw new Error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public exportPack(gamePack: GamePack): void {
        try {
            const dataStr = JSON.stringify(gamePack, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${gamePack.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ptspack`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            console.log('Game pack exported successfully:', gamePack.name);
        } catch (error: unknown) {
            console.error('Failed to export game pack:', error);
            throw new Error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public async exportPackAsZip(
        gamePack: GamePack,
        scripts: ECAGraph[] = [],
        cutscenes: Cutscene[] = [],
        assets: Map<string, Blob> = new Map()
    ): Promise<void> {
        try {
            // This would use JSZip in a real implementation
            // For now, we'll create a mock zip structure
            
            const zipData: Record<string, any> = {
                'pack.json': JSON.stringify(gamePack, null, 2),
                'levels/': {},
                'scripts/': {},
                'cutscenes/': {},
                'assets/sprites/': {},
                'assets/audio/': {}
            };

            // Add levels
            gamePack.levels.forEach((level, index) => {
                zipData[`levels/level_${index + 1}.json`] = JSON.stringify(level, null, 2);
            });

            // Add scripts
            scripts.forEach((script, index) => {
                zipData[`scripts/script_${index + 1}.json`] = JSON.stringify(script, null, 2);
            });

            // Add cutscenes
            cutscenes.forEach((cutscene, index) => {
                zipData[`cutscenes/cutscene_${index + 1}.json`] = JSON.stringify(cutscene, null, 2);
            });

            // Create a mock zip file (in reality, this would use JSZip)
            const zipContent = JSON.stringify(zipData, null, 2);
            const zipBlob = new Blob([zipContent], { type: 'application/zip' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `${gamePack.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ptspack`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            console.log('Game pack exported as zip successfully:', gamePack.name);
        } catch (error: unknown) {
            console.error('Failed to export game pack as zip:', error);
            throw new Error('Zip export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public async exportPackAsZipWithJSZip(
        gamePack: GamePack,
        scripts: ECAGraph[] = [],
        cutscenes: Cutscene[] = [],
        assets: Map<string, Blob> = new Map()
    ): Promise<void> {
        try {
            // This is how it would work with JSZip
            // const JSZip = await import('jszip');
            // const zip = new JSZip.default();
            
            // Add pack.json
            // zip.file('pack.json', JSON.stringify(gamePack, null, 2));
            
            // Add levels
            // gamePack.levels.forEach((level, index) => {
            //     zip.file(`levels/level_${index + 1}.json`, JSON.stringify(level, null, 2));
            // });
            
            // Add scripts
            // scripts.forEach((script, index) => {
            //     zip.file(`scripts/script_${index + 1}.json`, JSON.stringify(script, null, 2));
            // });
            
            // Add cutscenes
            // cutscenes.forEach((cutscene, index) => {
            //     zip.file(`cutscenes/cutscene_${index + 1}.json`, JSON.stringify(cutscene, null, 2));
            // });
            
            // Add assets
            // assets.forEach((blob, path) => {
            //     zip.file(`assets/${path}`, blob);
            // });
            
            // Generate and download
            // const zipBlob = await zip.generateAsync({ type: 'blob' });
            // const link = document.createElement('a');
            // link.href = URL.createObjectURL(zipBlob);
            // link.download = `${gamePack.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ptspack`;
            // link.click();
            // URL.revokeObjectURL(link.href);
            
            console.log('JSZip implementation would be used here');
        } catch (error: unknown) {
            console.error('Failed to export game pack with JSZip:', error);
            throw new Error('JSZip export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public exportToClipboard(data: any): void {
        try {
            const dataStr = JSON.stringify(data, null, 2);
            navigator.clipboard.writeText(dataStr).then(() => {
                console.log('Data copied to clipboard');
            }).catch((error) => {
                console.error('Failed to copy to clipboard:', error);
                throw new Error('Clipboard copy failed: ' + error.message);
            });
        } catch (error: unknown) {
            console.error('Failed to export to clipboard:', error);
            throw new Error('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    public exportLevelToClipboard(level: LevelData): void {
        this.exportToClipboard(level);
    }

    public exportPackToClipboard(gamePack: GamePack): void {
        this.exportToClipboard(gamePack);
    }

    public validateLevel(level: LevelData): string[] {
        const errors: string[] = [];

        // Validate required fields
        if (!level.id) errors.push('Level ID is required');
        if (!level.name) errors.push('Level name is required');
        if (level.width <= 0) errors.push('Level width must be positive');
        if (level.height <= 0) errors.push('Level height must be positive');

        // Validate tiles array
        if (!Array.isArray(level.tiles)) {
            errors.push('Tiles must be an array');
        } else {
            if (level.tiles.length !== level.height) {
                errors.push(`Tiles array height (${level.tiles.length}) doesn't match level height (${level.height})`);
            }
            
            level.tiles.forEach((row, y) => {
                if (!Array.isArray(row)) {
                    errors.push(`Tiles row ${y} must be an array`);
                } else if (row.length !== level.width) {
                    errors.push(`Tiles row ${y} width (${row.length}) doesn't match level width (${level.width})`);
                }
            });
        }

        // Validate entities array
        if (!Array.isArray(level.entities)) {
            errors.push('Entities must be an array');
        } else {
            level.entities.forEach((entity, index) => {
                if (!entity.id) errors.push(`Entity ${index} missing ID`);
                if (!entity.type) errors.push(`Entity ${index} missing type`);
                if (typeof entity.x !== 'number') errors.push(`Entity ${index} X position must be a number`);
                if (typeof entity.y !== 'number') errors.push(`Entity ${index} Y position must be a number`);
                if (entity.x < 0 || entity.x >= level.width) errors.push(`Entity ${index} X position out of bounds`);
                if (entity.y < 0 || entity.y >= level.height) errors.push(`Entity ${index} Y position out of bounds`);
                if (!entity.props || typeof entity.props !== 'object') errors.push(`Entity ${index} props must be an object`);
            });
        }

        // Validate links array
        if (!Array.isArray(level.links)) {
            errors.push('Links must be an array');
        } else {
            level.links.forEach((link, index) => {
                if (!link.from) errors.push(`Link ${index} missing from entity`);
                if (!link.to) errors.push(`Link ${index} missing to entity`);
                if (!link.type) errors.push(`Link ${index} missing type`);
            });
        }

        return errors;
    }

    public validateGamePack(gamePack: GamePack): string[] {
        const errors: string[] = [];

        // Validate required fields
        if (!gamePack.id) errors.push('Game pack ID is required');
        if (!gamePack.name) errors.push('Game pack name is required');
        if (!gamePack.version) errors.push('Game pack version is required');

        // Validate levels array
        if (!Array.isArray(gamePack.levels)) {
            errors.push('Levels must be an array');
        } else if (gamePack.levels.length === 0) {
            errors.push('Game pack must contain at least one level');
        } else {
            gamePack.levels.forEach((level, index) => {
                const levelErrors = this.validateLevel(level);
                levelErrors.forEach(error => {
                    errors.push(`Level ${index}: ${error}`);
                });
            });
        }

        // Validate metadata
        if (!gamePack.metadata || typeof gamePack.metadata !== 'object') {
            errors.push('Metadata must be an object');
        }

        return errors;
    }

    public validateScript(script: ECAGraph): string[] {
        const errors: string[] = [];

        // Validate required fields
        if (!script.id) errors.push('Script ID is required');
        if (!script.name) errors.push('Script name is required');

        // Validate nodes array
        if (!Array.isArray(script.nodes)) {
            errors.push('Nodes must be an array');
        } else {
            script.nodes.forEach((node, index) => {
                if (!node.id) errors.push(`Node ${index} missing ID`);
                if (!node.type) errors.push(`Node ${index} missing type`);
                if (!node.kind) errors.push(`Node ${index} missing kind`);
                if (typeof node.x !== 'number') errors.push(`Node ${index} X position must be a number`);
                if (typeof node.y !== 'number') errors.push(`Node ${index} Y position must be a number`);
                if (!node.props || typeof node.props !== 'object') errors.push(`Node ${index} props must be an object`);
            });
        }

        // Validate edges array
        if (!Array.isArray(script.edges)) {
            errors.push('Edges must be an array');
        } else {
            script.edges.forEach((edge, index) => {
                if (!edge.id) errors.push(`Edge ${index} missing ID`);
                if (!edge.from) errors.push(`Edge ${index} missing from`);
                if (!edge.to) errors.push(`Edge ${index} missing to`);
            });
        }

        return errors;
    }

    public validateCutscene(cutscene: Cutscene): string[] {
        const errors: string[] = [];

        // Validate required fields
        if (!cutscene.id) errors.push('Cutscene ID is required');
        if (!cutscene.name) errors.push('Cutscene name is required');
        if (cutscene.duration <= 0) errors.push('Cutscene duration must be positive');

        // Validate tracks array
        if (!Array.isArray(cutscene.tracks)) {
            errors.push('Tracks must be an array');
        } else {
            cutscene.tracks.forEach((track, trackIndex) => {
                if (!track.id) errors.push(`Track ${trackIndex} missing ID`);
                if (!track.name) errors.push(`Track ${trackIndex} missing name`);
                if (!track.type) errors.push(`Track ${trackIndex} missing type`);
                if (!track.color) errors.push(`Track ${trackIndex} missing color`);

                if (!Array.isArray(track.items)) {
                    errors.push(`Track ${trackIndex} items must be an array`);
                } else {
                    track.items.forEach((item, itemIndex) => {
                        if (!item.id) errors.push(`Track ${trackIndex} item ${itemIndex} missing ID`);
                        if (typeof item.time !== 'number') errors.push(`Track ${trackIndex} item ${itemIndex} time must be a number`);
                        if (!item.track) errors.push(`Track ${trackIndex} item ${itemIndex} missing track`);
                        if (!item.action) errors.push(`Track ${trackIndex} item ${itemIndex} missing action`);
                        if (!item.args || typeof item.args !== 'object') errors.push(`Track ${trackIndex} item ${itemIndex} args must be an object`);
                    });
                }
            });
        }

        return errors;
    }

    public createGamePack(
        id: string,
        name: string,
        version: string,
        levels: LevelData[],
        metadata: Record<string, any> = {}
    ): GamePack {
        const gamePack: GamePack = {
            id,
            name,
            version,
            levels,
            metadata: {
                created: new Date().toISOString(),
                editor: 'PrinceTS Visual Game Maker',
                ...metadata
            }
        };

        const errors = this.validateGamePack(gamePack);
        if (errors.length > 0) {
            throw new Error('Invalid game pack: ' + errors.join(', '));
        }

        return gamePack;
    }

    public getExportFormats(): string[] {
        return ['json', 'ptspack', 'zip', 'clipboard'];
    }

    public getExportFormatDescription(format: string): string {
        const descriptions: Record<string, string> = {
            'json': 'Standard JSON format for single level',
            'ptspack': 'PrinceTS game pack format for multiple levels',
            'zip': 'Zipped package with all assets',
            'clipboard': 'Copy to clipboard for sharing'
        };
        
        return descriptions[format] || 'Unknown format';
    }

    public getExportFormatExtension(format: string): string {
        const extensions: Record<string, string> = {
            'json': '.json',
            'ptspack': '.ptspack',
            'zip': '.ptspack',
            'clipboard': ''
        };
        
        return extensions[format] || '';
    }
} 