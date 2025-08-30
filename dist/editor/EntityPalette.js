export class EntityPalette {
    constructor() {
        this.entities = new Map();
        this.selectedEntity = '';
        this.initializeDefaultEntities();
    }
    initializeDefaultEntities() {
        const defaultEntities = [
            {
                id: 'guard',
                name: 'Guard',
                icon: '🛡️',
                color: '#FF6B6B',
                category: 'enemies',
                description: 'Patrolling enemy that attacks the player',
                defaultProps: {
                    ai: 'patrol',
                    speed: 50,
                    health: 100,
                    damage: 20,
                    patrolDistance: 100,
                    detectionRange: 150
                }
            },
            {
                id: 'potion',
                name: 'Potion',
                icon: '🧪',
                color: '#4ECDC4',
                category: 'items',
                description: 'Restorative item that heals the player',
                defaultProps: {
                    type: 'health',
                    value: 50,
                    respawnTime: 30000
                }
            },
            {
                id: 'sword',
                name: 'Sword',
                icon: '⚔️',
                color: '#45B7D1',
                category: 'items',
                description: 'Weapon that increases player damage',
                defaultProps: {
                    damage: 30,
                    durability: 100,
                    range: 40
                }
            },
            {
                id: 'teleporter',
                name: 'Teleporter',
                icon: '🌀',
                color: '#96CEB4',
                category: 'mechanics',
                description: 'Transports player to another location',
                defaultProps: {
                    targetId: '',
                    oneWay: false,
                    cooldown: 1000,
                    particleEffect: true
                }
            },
            {
                id: 'crusher',
                name: 'Crusher',
                icon: '🪨',
                color: '#FFEAA7',
                category: 'traps',
                description: 'Moving hazard that crushes the player',
                defaultProps: {
                    speed: 1,
                    damage: 100,
                    delay: 2000,
                    cycleTime: 5000,
                    direction: 'vertical'
                }
            },
            {
                id: 'pressurePlate',
                name: 'Pressure Plate',
                icon: '⚡',
                color: '#DDA0DD',
                category: 'triggers',
                description: 'Activates when player steps on it',
                defaultProps: {
                    targetId: '',
                    oneTime: false,
                    delay: 0,
                    requiresWeight: true
                }
            },
            {
                id: 'gate',
                name: 'Gate',
                icon: '🚪',
                color: '#98D8C8',
                category: 'mechanics',
                description: 'Barrier that can be opened/closed',
                defaultProps: {
                    locked: false,
                    keyId: '',
                    openTime: 1000,
                    autoClose: false,
                    closeDelay: 5000
                }
            },
            {
                id: 'looseTile',
                name: 'Loose Tile',
                icon: '🧱',
                color: '#F7DC6F',
                category: 'traps',
                description: 'Tile that falls when player steps on it',
                defaultProps: {
                    fragile: true,
                    fallDelay: 1000,
                    damage: 25,
                    respawnTime: 10000
                }
            },
            {
                id: 'chopper',
                name: 'Chopper',
                icon: '🪓',
                color: '#BB8FCE',
                category: 'traps',
                description: 'Swinging blade that damages the player',
                defaultProps: {
                    speed: 2,
                    damage: 50,
                    range: 32,
                    swingAngle: 90,
                    cycleTime: 3000
                }
            },
            {
                id: 'region',
                name: 'Region',
                icon: '📍',
                color: '#85C1E9',
                category: 'triggers',
                description: 'Area that triggers events when entered',
                defaultProps: {
                    type: 'checkpoint',
                    message: '',
                    width: 32,
                    height: 32,
                    oneTime: true
                }
            },
            {
                id: 'key',
                name: 'Key',
                icon: '🔑',
                color: '#F4D03F',
                category: 'items',
                description: 'Opens locked gates and doors',
                defaultProps: {
                    keyId: 'key_1',
                    reusable: false,
                    glowEffect: true
                }
            },
            {
                id: 'checkpoint',
                name: 'Checkpoint',
                icon: '🏁',
                color: '#58D68D',
                category: 'mechanics',
                description: 'Saves player progress when touched',
                defaultProps: {
                    respawnPoint: true,
                    healPlayer: true,
                    message: 'Checkpoint reached!'
                }
            }
        ];
        defaultEntities.forEach(entity => {
            this.entities.set(entity.id, entity);
        });
    }
    selectEntity(entityId) {
        if (this.entities.has(entityId)) {
            this.selectedEntity = entityId;
        }
    }
    getSelectedEntity() {
        return this.selectedEntity;
    }
    getEntityDefinition(entityId) {
        return this.entities.get(entityId);
    }
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    getEntitiesByCategory() {
        const categories = {};
        this.getAllEntities().forEach(entity => {
            if (!categories[entity.category]) {
                categories[entity.category] = [];
            }
            categories[entity.category].push(entity);
        });
        return categories;
    }
    getEntitiesInCategory(category) {
        return this.getAllEntities().filter(entity => entity.category === category);
    }
    addEntity(entity) {
        this.entities.set(entity.id, entity);
    }
    removeEntity(entityId) {
        return this.entities.delete(entityId);
    }
    getEntityIcon(entityId) {
        const entity = this.entities.get(entityId);
        return entity?.icon || '?';
    }
    getEntityColor(entityId) {
        const entity = this.entities.get(entityId);
        return entity?.color || '#999';
    }
    getEntityName(entityId) {
        const entity = this.entities.get(entityId);
        return entity?.name || entityId;
    }
    getEntityDescription(entityId) {
        const entity = this.entities.get(entityId);
        return entity?.description || '';
    }
    getDefaultProps(entityId) {
        const entity = this.entities.get(entityId);
        return entity?.defaultProps || {};
    }
    setDefaultProps(entityId, props) {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.defaultProps = { ...entity.defaultProps, ...props };
        }
    }
    createCustomEntity(id, name, icon, color, category, defaultProps = {}, description = '') {
        const entity = {
            id,
            name,
            icon,
            color,
            category,
            description,
            defaultProps
        };
        this.addEntity(entity);
        return entity;
    }
    searchEntities(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllEntities().filter(entity => entity.name.toLowerCase().includes(lowercaseQuery) ||
            entity.id.toLowerCase().includes(lowercaseQuery) ||
            (entity.description && entity.description.toLowerCase().includes(lowercaseQuery)));
    }
    getEntitySuggestions(partialId) {
        const lowercasePartial = partialId.toLowerCase();
        return this.getAllEntities().filter(entity => entity.id.toLowerCase().startsWith(lowercasePartial));
    }
    validateEntityId(entityId) {
        // Check if entity ID is valid (alphanumeric and underscores only)
        return /^[a-zA-Z0-9_]+$/.test(entityId) && entityId.length > 0;
    }
    getEntityCount() {
        return this.entities.size;
    }
    getCategoryCount() {
        const categories = new Set(this.getAllEntities().map(entity => entity.category));
        return categories.size;
    }
    exportEntityDefinitions() {
        return Object.fromEntries(this.entities);
    }
    importEntityDefinitions(definitions) {
        this.entities.clear();
        Object.entries(definitions).forEach(([id, entity]) => {
            this.entities.set(id, entity);
        });
    }
    getEntityCategories() {
        const categories = new Set(this.getAllEntities().map(entity => entity.category));
        return Array.from(categories).sort();
    }
    clear() {
        this.entities.clear();
        this.initializeDefaultEntities();
    }
}
//# sourceMappingURL=EntityPalette.js.map