export interface Link {
    id: string;
    from: string;
    to: string;
    type: string;
    properties: Record<string, any>;
}

export class LinkTool {
    private links: Map<string, Link> = new Map();
    private isLinking: boolean = false;
    private linkingFrom: string | null = null;
    private linkingType: string | null = null;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Global click handler for entity selection during linking
        document.addEventListener('click', this.handleGlobalClick.bind(this));
    }

    public startLink(fromEntityId: string, linkType: string): void {
        this.isLinking = true;
        this.linkingFrom = fromEntityId;
        this.linkingType = linkType;
        
        // Update UI to show linking mode
        this.updateLinkingUI();
        
        console.log(`Started linking from ${fromEntityId} with type ${linkType}`);
    }

    public cancelLink(): void {
        this.isLinking = false;
        this.linkingFrom = null;
        this.linkingType = null;
        
        // Reset UI
        this.updateLinkingUI();
        
        console.log('Linking cancelled');
    }

    public completeLink(toEntityId: string): boolean {
        if (!this.isLinking || !this.linkingFrom || !this.linkingType) {
            return false;
        }

        // Validate link
        if (!this.validateLink(this.linkingFrom, toEntityId, this.linkingType)) {
            console.warn('Invalid link attempted');
            return false;
        }

        // Create link
        const linkId = this.generateLinkId();
        const link: Link = {
            id: linkId,
            from: this.linkingFrom,
            to: toEntityId,
            type: this.linkingType,
            properties: this.getDefaultLinkProperties(this.linkingType)
        };

        this.links.set(linkId, link);
        
        // Reset linking state
        this.isLinking = false;
        this.linkingFrom = null;
        this.linkingType = null;
        
        // Update UI
        this.updateLinkingUI();
        
        console.log(`Link created: ${linkId} from ${link.from} to ${link.to}`);
        return true;
    }

    private handleGlobalClick(event: Event): void {
        if (!this.isLinking) return;

        const target = event.target as HTMLElement;
        const entityId = target.getAttribute('data-entity-id');
        
        if (entityId && entityId !== this.linkingFrom) {
            this.completeLink(entityId);
        }
    }

    private validateLink(fromId: string, toId: string, linkType: string): boolean {
        // Prevent self-linking
        if (fromId === toId) {
            return false;
        }

        // Check for existing links
        const existingLink = Array.from(this.links.values()).find(link => 
            link.from === fromId && link.to === toId && link.type === linkType
        );
        
        if (existingLink) {
            return false;
        }

        // Type-specific validation
        switch (linkType) {
            case 'pressurePlate-gate':
                // Pressure plate can only link to gates
                return true; // Add entity type validation here
            case 'teleporter-pair':
                // Teleporters can only link to other teleporters
                return true; // Add entity type validation here
            case 'key-gate':
                // Keys can only link to gates
                return true; // Add entity type validation here
            default:
                return true;
        }
    }

    private getDefaultLinkProperties(linkType: string): Record<string, any> {
        switch (linkType) {
            case 'pressurePlate-gate':
                return {
                    delay: 0,
                    oneTime: false,
                    requiresWeight: true
                };
            case 'teleporter-pair':
                return {
                    oneWay: false,
                    cooldown: 1000,
                    particleEffect: true
                };
            case 'key-gate':
                return {
                    consumeKey: false,
                    unlockMessage: 'Gate unlocked!'
                };
            default:
                return {};
        }
    }

    private generateLinkId(): string {
        return 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private updateLinkingUI(): void {
        // Update cursor
        document.body.style.cursor = this.isLinking ? 'crosshair' : 'default';
        
        // Update status message
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            if (this.isLinking) {
                statusElement.textContent = `Linking: Click on target entity (${this.linkingType})`;
            } else {
                statusElement.textContent = 'Ready';
            }
        }

        // Update entity highlighting
        this.updateEntityHighlighting();
    }

    private updateEntityHighlighting(): void {
        // Remove existing highlighting
        document.querySelectorAll('.entity-highlight').forEach(el => {
            el.classList.remove('entity-highlight');
        });

        if (this.isLinking) {
            // Highlight valid target entities
            const validTargets = this.getValidTargets();
            validTargets.forEach(entityId => {
                const element = document.querySelector(`[data-entity-id="${entityId}"]`);
                if (element) {
                    element.classList.add('entity-highlight');
                }
            });
        }
    }

    private getValidTargets(): string[] {
        if (!this.linkingType) return [];

        // This would be implemented based on the current level's entities
        // For now, return empty array
        return [];
    }

    public getLinks(): Link[] {
        return Array.from(this.links.values());
    }

    public getLinksFrom(entityId: string): Link[] {
        return Array.from(this.links.values()).filter(link => link.from === entityId);
    }

    public getLinksTo(entityId: string): Link[] {
        return Array.from(this.links.values()).filter(link => link.to === entityId);
    }

    public getLink(linkId: string): Link | undefined {
        return this.links.get(linkId);
    }

    public removeLink(linkId: string): boolean {
        return this.links.delete(linkId);
    }

    public removeLinksFrom(entityId: string): number {
        const linksToRemove = Array.from(this.links.values()).filter(link => link.from === entityId);
        linksToRemove.forEach(link => this.links.delete(link.id));
        return linksToRemove.length;
    }

    public removeLinksTo(entityId: string): number {
        const linksToRemove = Array.from(this.links.values()).filter(link => link.to === entityId);
        linksToRemove.forEach(link => this.links.delete(link.id));
        return linksToRemove.length;
    }

    public updateLinkProperties(linkId: string, properties: Record<string, any>): void {
        const link = this.links.get(linkId);
        if (link) {
            link.properties = { ...link.properties, ...properties };
        }
    }

    public getLinkProperties(linkId: string): Record<string, any> | undefined {
        const link = this.links.get(linkId);
        return link?.properties;
    }

    public isLinkingActive(): boolean {
        return this.isLinking;
    }

    public getLinkingInfo(): { from: string | null; type: string | null } {
        return {
            from: this.linkingFrom,
            type: this.linkingType
        };
    }

    public exportLinks(): Record<string, Link> {
        return Object.fromEntries(this.links);
    }

    public importLinks(links: Record<string, Link>): void {
        this.links.clear();
        Object.entries(links).forEach(([id, link]) => {
            this.links.set(id, link);
        });
    }

    public clear(): void {
        this.links.clear();
        this.cancelLink();
    }

    public getLinkCount(): number {
        return this.links.size;
    }

    public getLinksByType(linkType: string): Link[] {
        return Array.from(this.links.values()).filter(link => link.type === linkType);
    }

    public validateAllLinks(): { valid: Link[]; invalid: Link[] } {
        const valid: Link[] = [];
        const invalid: Link[] = [];

        this.links.forEach(link => {
            if (this.validateLink(link.from, link.to, link.type)) {
                valid.push(link);
            } else {
                invalid.push(link);
            }
        });

        return { valid, invalid };
    }

    public getLinkTypes(): string[] {
        const types = new Set(Array.from(this.links.values()).map(link => link.type));
        return Array.from(types);
    }

    public getSupportedLinkTypes(): string[] {
        return [
            'pressurePlate-gate',
            'teleporter-pair',
            'key-gate',
            'trigger-region',
            'switch-door'
        ];
    }

    public getLinkTypeDescription(linkType: string): string {
        const descriptions: Record<string, string> = {
            'pressurePlate-gate': 'Pressure plate activates a gate',
            'teleporter-pair': 'Two teleporters that connect to each other',
            'key-gate': 'Key unlocks a gate',
            'trigger-region': 'Trigger activates a region effect',
            'switch-door': 'Switch controls a door'
        };
        
        return descriptions[linkType] || 'Unknown link type';
    }
} 