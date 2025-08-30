import { VFS } from '../assets/VFS.js';

export interface GamePack {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    thumbnail?: string;
    manifest: string;
    type: 'built-in' | 'installed' | 'url' | 'file';
    source: string; // URL or file path
    installedAt?: number;
    size?: number;
}

export interface LibraryItem {
    pack: GamePack;
    isInstalled: boolean;
    canInstall: boolean;
    isBuiltIn: boolean;
}

export interface InstallResult {
    success: boolean;
    packId: string;
    error?: string;
    size?: number;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export class LibraryManager {
    private vfs: VFS;
    private builtInPacks: GamePack[] = [];
    private installedPacks: GamePack[] = [];
    private urlPacks: GamePack[] = [];
    private filePacks: GamePack[] = [];
    private currentPack: GamePack | null = null;
    private onPackSwitch?: (pack: GamePack) => void;

    constructor(vfs?: VFS) {
        this.vfs = vfs || new VFS();
        this.loadBuiltInPacks();
    }

    /**
     * Initialize the library manager
     */
    async initialize(): Promise<void> {
        await this.loadBuiltInPacks();
    }

    /**
     * Load built-in packs from manifest.json
     */
    private async loadBuiltInPacks(): Promise<void> {
        try {
            const manifest = await this.vfs.readJson('manifest.json');
            this.builtInPacks = manifest.packs?.map((pack: any) => ({
                ...pack,
                type: 'built-in' as const,
                source: pack.manifest || `packs/${pack.id}/pack.json`
            })) || [];
        } catch (error) {
            console.warn('Failed to load built-in packs manifest:', error);
            // Fallback to default packs
            this.builtInPacks = [
                {
                    id: 'example',
                    name: 'Example Game',
                    description: 'A sample game pack',
                    version: '1.0.0',
                    author: 'PTS Engine',
                    manifest: 'packs/example/pack.json',
                    type: 'built-in',
                    source: 'packs/example/pack.json'
                }
            ];
        }
    }

    /**
     * Get all available packs
     */
    async getAllPacks(): Promise<LibraryItem[]> {
        const items: LibraryItem[] = [];

        // Built-in packs
        this.builtInPacks.forEach(pack => {
            items.push({
                pack,
                isInstalled: true,
                canInstall: false,
                isBuiltIn: true
            });
        });

        // Installed packs
        this.installedPacks.forEach(pack => {
            items.push({
                pack,
                isInstalled: true,
                canInstall: false,
                isBuiltIn: false
            });
        });

        // URL packs
        this.urlPacks.forEach(pack => {
            const isInstalled = this.installedPacks.some(p => p.id === pack.id);
            items.push({
                pack,
                isInstalled,
                canInstall: !isInstalled,
                isBuiltIn: false
            });
        });

        // File packs
        this.filePacks.forEach(pack => {
            const isInstalled = this.installedPacks.some(p => p.id === pack.id);
            items.push({
                pack,
                isInstalled,
                canInstall: !isInstalled,
                isBuiltIn: false
            });
        });

        return items;
    }

    /**
     * Add pack from URL
     */
    async addFromUrl(url: string): Promise<GamePack | null> {
        try {
            // Security check: Rate limit URL loads
            const rateLimitCheck = (window as any).ptsCore?.securityManager?.checkRateLimit('urlLoad', 'user');
            if (rateLimitCheck && !rateLimitCheck.allowed) {
                throw new Error(`Too many URL loads. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`);
            }

            // Security check: Validate URL
            const securityManager = (window as any).ptsCore?.securityManager;
            if (securityManager) {
                const urlValidation = securityManager.validateUrl(url);
                if (!urlValidation.valid) {
                    throw new Error(`URL validation failed: ${urlValidation.error}`);
                }
            }

            // Validate URL format
            if (!this.isValidUrl(url)) {
                throw new Error('Invalid URL format');
            }

            // Try to load pack manifest
            const manifest = await this.vfs.readJson(url);
            
            // Security check: Validate pack manifest
            if (securityManager) {
                const manifestValidation = securityManager.validatePackManifest(manifest);
                if (!manifestValidation.valid) {
                    throw new Error(`Pack manifest validation failed: ${manifestValidation.error}`);
                }
            }

            // Validate pack manifest
            const validation = this.validatePackManifest(manifest);
            if (!validation.valid) {
                throw new Error(`Invalid pack manifest: ${validation.errors.join(', ')}`);
            }

            const pack: GamePack = {
                id: manifest.id,
                name: manifest.name,
                description: manifest.description || '',
                version: manifest.version,
                author: manifest.author || 'Unknown',
                thumbnail: manifest.thumbnail,
                manifest: url,
                type: 'url',
                source: url,
                size: 0 // Will be calculated below
            };

            // Calculate pack size
            pack.size = await this.calculatePackSize(pack);

            // Check if already exists
            const existingIndex = this.urlPacks.findIndex(p => p.id === pack.id);
            if (existingIndex >= 0) {
                this.urlPacks[existingIndex] = pack;
            } else {
                this.urlPacks.push(pack);
            }

            return pack;
        } catch (error) {
            console.error('Failed to add pack from URL:', error);
            throw error;
        }
    }

    /**
     * Add pack from file
     */
    async addFromFile(file: File): Promise<GamePack | null> {
        try {
            // Security check: Rate limit file uploads
            const rateLimitCheck = (window as any).ptsCore?.securityManager?.checkRateLimit('fileUpload', 'user');
            if (rateLimitCheck && !rateLimitCheck.allowed) {
                throw new Error(`Too many file uploads. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`);
            }

            // Security check: Validate file
            const securityManager = (window as any).ptsCore?.securityManager;
            if (securityManager) {
                const fileValidation = securityManager.validateFileUpload(file);
                if (!fileValidation.valid) {
                    throw new Error(`File validation failed: ${fileValidation.error}`);
                }
            }

            // Validate file type
            if (!this.isValidPackFile(file)) {
                throw new Error('Invalid file type. Expected .ptspack or .json file');
            }

            let manifest: any;
            
            if (file.name.endsWith('.ptspack')) {
                // Handle zip file
                manifest = await this.extractPackFromZip(file);
            } else {
                // Handle JSON file
                const text = await file.text();
                manifest = JSON.parse(text);
            }

            // Security check: Validate pack manifest
            if (securityManager) {
                const manifestValidation = securityManager.validatePackManifest(manifest);
                if (!manifestValidation.valid) {
                    throw new Error(`Pack manifest validation failed: ${manifestValidation.error}`);
                }
            }

            // Validate pack manifest
            const validation = this.validatePackManifest(manifest);
            if (!validation.valid) {
                throw new Error(`Invalid pack manifest: ${validation.errors.join(', ')}`);
            }

            const pack: GamePack = {
                id: manifest.id,
                name: manifest.name,
                description: manifest.description || '',
                version: manifest.version,
                author: manifest.author || 'Unknown',
                thumbnail: manifest.thumbnail,
                manifest: file.name,
                type: 'file',
                source: file.name,
                size: file.size
            };

            // Check if already exists
            const existingIndex = this.filePacks.findIndex(p => p.id === pack.id);
            if (existingIndex >= 0) {
                this.filePacks[existingIndex] = pack;
            } else {
                this.filePacks.push(pack);
            }

            return pack;
        } catch (error) {
            console.error('Failed to add pack from file:', error);
            throw error;
        }
    }

    /**
     * Install a pack (cache it locally)
     */
    async installPack(packId: string): Promise<InstallResult> {
        try {
            const pack = await this.findPack(packId);
            if (!pack) {
                return { success: false, packId, error: 'Pack not found' };
            }

            if (pack.type === 'built-in') {
                return { success: false, packId, error: 'Built-in packs are already installed' };
            }

            // Check if already installed
            if (this.installedPacks.some(p => p.id === packId)) {
                return { success: false, packId, error: 'Pack already installed' };
            }

            // Download and cache the pack
            const manifest = await this.vfs.readJson(pack.manifest);
            
            const installedPack: GamePack = {
                ...pack,
                type: 'installed',
                installedAt: Date.now(),
                size: await this.calculatePackSize(pack)
            };

            this.installedPacks.push(installedPack);

            // Remove from URL/File lists if present
            this.urlPacks = this.urlPacks.filter(p => p.id !== packId);
            this.filePacks = this.filePacks.filter(p => p.id !== packId);

            return {
                success: true,
                packId,
                size: installedPack.size
            };
        } catch (error) {
            console.error('Failed to install pack:', error);
            return {
                success: false,
                packId,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Uninstall a pack
     */
    async uninstallPack(packId: string): Promise<boolean> {
        const index = this.installedPacks.findIndex(p => p.id === packId);
        if (index >= 0) {
            this.installedPacks.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Switch to a different pack
     */
    async switchPack(packId: string): Promise<boolean> {
        try {
            const pack = await this.findPack(packId);
            if (!pack) {
                console.error('Pack not found:', packId);
                return false;
            }

            // Validate the pack before switching
            const validation = await this.validatePack(pack);
            if (!validation.valid) {
                console.error('Pack validation failed:', validation.errors);
                return false;
            }

            // Notify about pack switch
            if (this.onPackSwitch) {
                this.onPackSwitch(pack);
            }

            this.currentPack = pack;
            console.log(`Switched to pack: ${pack.name} (${pack.id})`);
            return true;
        } catch (error) {
            console.error('Failed to switch pack:', error);
            return false;
        }
    }

    /**
     * Get current pack
     */
    getCurrentPack(): GamePack | null {
        return this.currentPack;
    }

    /**
     * Set pack switch callback
     */
    setPackSwitchCallback(callback: (pack: GamePack) => void): void {
        this.onPackSwitch = callback;
    }

    /**
     * Find a pack by ID
     */
    private async findPack(packId: string): Promise<GamePack | null> {
        const allPacks = [
            ...this.builtInPacks,
            ...this.installedPacks,
            ...this.urlPacks,
            ...this.filePacks
        ];
        return allPacks.find(p => p.id === packId) || null;
    }

    /**
     * Validate pack manifest
     */
    private validatePackManifest(manifest: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!manifest.id || typeof manifest.id !== 'string') {
            errors.push('Missing or invalid id field');
        }
        if (!manifest.name || typeof manifest.name !== 'string') {
            errors.push('Missing or invalid name field');
        }
        if (!manifest.version || typeof manifest.version !== 'string') {
            errors.push('Missing or invalid version field');
        }

        // Optional but recommended fields
        if (!manifest.description) {
            warnings.push('Missing description field');
        }
        if (!manifest.author) {
            warnings.push('Missing author field');
        }

        // Validate version format
        if (manifest.version && !this.isValidVersion(manifest.version)) {
            warnings.push('Version format should be semantic (e.g., 1.0.0)');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate a complete pack
     */
    private async validatePack(pack: GamePack): Promise<ValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Load and validate manifest
            const manifest = await this.vfs.readJson(pack.manifest);
            const manifestValidation = this.validatePackManifest(manifest);
            errors.push(...manifestValidation.errors);
            warnings.push(...manifestValidation.warnings);

            // Check for required assets
            if (manifest.levels && Array.isArray(manifest.levels)) {
                for (const level of manifest.levels) {
                    if (level.file) {
                        const levelExists = await this.vfs.validatePath(level.file);
                        if (!levelExists) {
                            errors.push(`Level file not found: ${level.file}`);
                        }
                    }
                }
            }

            // Check for required scripts
            if (manifest.scripts && Array.isArray(manifest.scripts)) {
                for (const script of manifest.scripts) {
                    if (script.file) {
                        const scriptExists = await this.vfs.validatePath(script.file);
                        if (!scriptExists) {
                            errors.push(`Script file not found: ${script.file}`);
                        }
                    }
                }
            }

        } catch (error) {
            errors.push(`Failed to load pack manifest: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Extract pack from zip file
     */
    private async extractPackFromZip(file: File): Promise<any> {
        // This would require JSZip library
        // For now, we'll throw an error
        throw new Error('Zip file support not implemented. Please use JSON format.');
    }

    /**
     * Calculate pack size
     */
    private async calculatePackSize(pack: GamePack): Promise<number> {
        // This would calculate the total size of all pack assets
        // For now, return a default size
        return 1024 * 1024; // 1MB default
    }

    /**
     * Validate URL format
     */
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate file type
     */
    private isValidPackFile(file: File): boolean {
        const validExtensions = ['.ptspack', '.json'];
        return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    /**
     * Validate version format
     */
    private isValidVersion(version: string): boolean {
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
        return semverRegex.test(version);
    }

    /**
     * Get VFS instance
     */
    getVFS(): VFS {
        return this.vfs;
    }

    /**
     * Clear all non-built-in packs
     */
    clearAllPacks(): void {
        this.installedPacks = [];
        this.urlPacks = [];
        this.filePacks = [];
    }

    /**
     * Get library statistics
     */
    getStats(): {
        totalPacks: number;
        builtInPacks: number;
        installedPacks: number;
        urlPacks: number;
        filePacks: number;
    } {
        return {
            totalPacks: this.builtInPacks.length + this.installedPacks.length + this.urlPacks.length + this.filePacks.length,
            builtInPacks: this.builtInPacks.length,
            installedPacks: this.installedPacks.length,
            urlPacks: this.urlPacks.length,
            filePacks: this.filePacks.length
        };
    }

    /**
     * Load pack from URL
     */
    async loadPackFromUrl(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch pack from URL: ${response.statusText}`);
            }
            
            const packData = await response.json();
            const pack: GamePack = {
                ...packData,
                type: 'url',
                source: url,
                installedAt: Date.now()
            };
            
            this.urlPacks.push(pack);
        } catch (error) {
            console.error('Failed to load pack from URL:', error);
            throw error;
        }
    }

    /**
     * Load pack from file
     */
    async loadPackFromFile(file: File): Promise<void> {
        try {
            const text = await file.text();
            const packData = JSON.parse(text);
            const pack: GamePack = {
                ...packData,
                type: 'file',
                source: file.name,
                installedAt: Date.now()
            };
            
            this.filePacks.push(pack);
        } catch (error) {
            console.error('Failed to load pack from file:', error);
            throw error;
        }
    }

    /**
     * Get library items
     */
    async getLibraryItems(): Promise<LibraryItem[]> {
        return this.getAllPacks();
    }

    /**
     * Remove pack
     */
    async removePack(packId: string): Promise<void> {
        this.installedPacks = this.installedPacks.filter(pack => pack.id !== packId);
        this.urlPacks = this.urlPacks.filter(pack => pack.id !== packId);
        this.filePacks = this.filePacks.filter(pack => pack.id !== packId);
    }

    /**
     * Clear cache
     */
    async clearCache(): Promise<void> {
        this.vfs.clearCache();
    }
} 