export class LinkTool {
    constructor() {
        this.links = new Map();
        this.isLinking = false;
        this.linkingFrom = null;
        this.linkingType = null;
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Global click handler for entity selection during linking
        document.addEventListener('click', this.handleGlobalClick.bind(this));
    }
    startLink(fromEntityId, linkType) {
        this.isLinking = true;
        this.linkingFrom = fromEntityId;
        this.linkingType = linkType;
        // Update UI to show linking mode
        this.updateLinkingUI();
        console.log(`Started linking from ${fromEntityId} with type ${linkType}`);
    }
    cancelLink() {
        this.isLinking = false;
        this.linkingFrom = null;
        this.linkingType = null;
        // Reset UI
        this.updateLinkingUI();
        console.log('Linking cancelled');
    }
    completeLink(toEntityId) {
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
        const link = {
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
    handleGlobalClick(event) {
        if (!this.isLinking)
            return;
        const target = event.target;
        const entityId = target.getAttribute('data-entity-id');
        if (entityId && entityId !== this.linkingFrom) {
            this.completeLink(entityId);
        }
    }
    validateLink(fromId, toId, linkType) {
        // Prevent self-linking
        if (fromId === toId) {
            return false;
        }
        // Check for existing links
        const existingLink = Array.from(this.links.values()).find(link => link.from === fromId && link.to === toId && link.type === linkType);
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
    getDefaultLinkProperties(linkType) {
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
    generateLinkId() {
        return 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    updateLinkingUI() {
        // Update cursor
        document.body.style.cursor = this.isLinking ? 'crosshair' : 'default';
        // Update status message
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            if (this.isLinking) {
                statusElement.textContent = `Linking: Click on target entity (${this.linkingType})`;
            }
            else {
                statusElement.textContent = 'Ready';
            }
        }
        // Update entity highlighting
        this.updateEntityHighlighting();
    }
    updateEntityHighlighting() {
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
    getValidTargets() {
        if (!this.linkingType)
            return [];
        // This would be implemented based on the current level's entities
        // For now, return empty array
        return [];
    }
    getLinks() {
        return Array.from(this.links.values());
    }
    getLinksFrom(entityId) {
        return Array.from(this.links.values()).filter(link => link.from === entityId);
    }
    getLinksTo(entityId) {
        return Array.from(this.links.values()).filter(link => link.to === entityId);
    }
    getLink(linkId) {
        return this.links.get(linkId);
    }
    removeLink(linkId) {
        return this.links.delete(linkId);
    }
    removeLinksFrom(entityId) {
        const linksToRemove = Array.from(this.links.values()).filter(link => link.from === entityId);
        linksToRemove.forEach(link => this.links.delete(link.id));
        return linksToRemove.length;
    }
    removeLinksTo(entityId) {
        const linksToRemove = Array.from(this.links.values()).filter(link => link.to === entityId);
        linksToRemove.forEach(link => this.links.delete(link.id));
        return linksToRemove.length;
    }
    updateLinkProperties(linkId, properties) {
        const link = this.links.get(linkId);
        if (link) {
            link.properties = { ...link.properties, ...properties };
        }
    }
    getLinkProperties(linkId) {
        const link = this.links.get(linkId);
        return link?.properties;
    }
    isLinkingActive() {
        return this.isLinking;
    }
    getLinkingInfo() {
        return {
            from: this.linkingFrom,
            type: this.linkingType
        };
    }
    exportLinks() {
        return Object.fromEntries(this.links);
    }
    importLinks(links) {
        this.links.clear();
        Object.entries(links).forEach(([id, link]) => {
            this.links.set(id, link);
        });
    }
    clear() {
        this.links.clear();
        this.cancelLink();
    }
    getLinkCount() {
        return this.links.size;
    }
    getLinksByType(linkType) {
        return Array.from(this.links.values()).filter(link => link.type === linkType);
    }
    validateAllLinks() {
        const valid = [];
        const invalid = [];
        this.links.forEach(link => {
            if (this.validateLink(link.from, link.to, link.type)) {
                valid.push(link);
            }
            else {
                invalid.push(link);
            }
        });
        return { valid, invalid };
    }
    getLinkTypes() {
        const types = new Set(Array.from(this.links.values()).map(link => link.type));
        return Array.from(types);
    }
    getSupportedLinkTypes() {
        return [
            'pressurePlate-gate',
            'teleporter-pair',
            'key-gate',
            'trigger-region',
            'switch-door'
        ];
    }
    getLinkTypeDescription(linkType) {
        const descriptions = {
            'pressurePlate-gate': 'Pressure plate activates a gate',
            'teleporter-pair': 'Two teleporters that connect to each other',
            'key-gate': 'Key unlocks a gate',
            'trigger-region': 'Trigger activates a region effect',
            'switch-door': 'Switch controls a door'
        };
        return descriptions[linkType] || 'Unknown link type';
    }
}
//# sourceMappingURL=LinkTool.js.map