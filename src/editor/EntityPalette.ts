export interface EntityDefinition {
    id: string;
    name: string;
    icon: string;
    color: string;
    defaultProps: Record<string, any>;
    category: string;
    description?: string;
}

export class EntityPalette {
    private entities: Map<string, EntityDefinition> = new Map();
    private selectedEntity: string = '';

    constructor() {
        this.initializeDefaultEntities();
    }

    private initializeDefaultEntities(): void {
        const defaultEntities: EntityDefinition[] = [
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

    public selectEntity(entityId: string): void {
        if (this.entities.has(entityId)) {
            this.selectedEntity = entityId;
        }
    }

    public getSelectedEntity(): string {
        return this.selectedEntity;
    }

    public getEntityDefinition(entityId: string): EntityDefinition | undefined {
        return this.entities.get(entityId);
    }

    public getAllEntities(): EntityDefinition[] {
        return Array.from(this.entities.values());
    }

    public getEntitiesByCategory(): Record<string, EntityDefinition[]> {
        const categories: Record<string, EntityDefinition[]> = {};

        this.getAllEntities().forEach(entity => {
            if (!categories[entity.category]) {
                categories[entity.category] = [];
            }
            categories[entity.category].push(entity);
        });

        return categories;
    }

    public getEntitiesInCategory(category: string): EntityDefinition[] {
        return this.getAllEntities().filter(entity => entity.category === category);
    }

    public addEntity(entity: EntityDefinition): void {
        this.entities.set(entity.id, entity);
    }

    public removeEntity(entityId: string): boolean {
        return this.entities.delete(entityId);
    }

    public getEntityIcon(entityId: string): string {
        const entity = this.entities.get(entityId);
        return entity?.icon || '?';
    }

    public getEntityColor(entityId: string): string {
        const entity = this.entities.get(entityId);
        return entity?.color || '#999';
    }

    public getEntityName(entityId: string): string {
        const entity = this.entities.get(entityId);
        return entity?.name || entityId;
    }

    public getEntityDescription(entityId: string): string {
        const entity = this.entities.get(entityId);
        return entity?.description || '';
    }

    public getDefaultProps(entityId: string): Record<string, any> {
        const entity = this.entities.get(entityId);
        return entity?.defaultProps || {};
    }

    public setDefaultProps(entityId: string, props: Record<string, any>): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            entity.defaultProps = { ...entity.defaultProps, ...props };
        }
    }

    public createCustomEntity(
        id: string, 
        name: string, 
        icon: string, 
        color: string, 
        category: string, 
        defaultProps: Record<string, any> = {},
        description: string = ''
    ): EntityDefinition {
        const entity: EntityDefinition = {
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

    public searchEntities(query: string): EntityDefinition[] {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllEntities().filter(entity => 
            entity.name.toLowerCase().includes(lowercaseQuery) ||
            entity.id.toLowerCase().includes(lowercaseQuery) ||
            (entity.description && entity.description.toLowerCase().includes(lowercaseQuery))
        );
    }

    public getEntitySuggestions(partialId: string): EntityDefinition[] {
        const lowercasePartial = partialId.toLowerCase();
        return this.getAllEntities().filter(entity => 
            entity.id.toLowerCase().startsWith(lowercasePartial)
        );
    }

    public validateEntityId(entityId: string): boolean {
        // Check if entity ID is valid (alphanumeric and underscores only)
        return /^[a-zA-Z0-9_]+$/.test(entityId) && entityId.length > 0;
    }

    public getEntityCount(): number {
        return this.entities.size;
    }

    public getCategoryCount(): number {
        const categories = new Set(this.getAllEntities().map(entity => entity.category));
        return categories.size;
    }

    public exportEntityDefinitions(): Record<string, EntityDefinition> {
        return Object.fromEntries(this.entities);
    }

    public importEntityDefinitions(definitions: Record<string, EntityDefinition>): void {
        this.entities.clear();
        Object.entries(definitions).forEach(([id, entity]) => {
            this.entities.set(id, entity);
        });
    }

    public getEntityCategories(): string[] {
        const categories = new Set(this.getAllEntities().map(entity => entity.category));
        return Array.from(categories).sort();
    }

    public clear(): void {
        this.entities.clear();
        this.initializeDefaultEntities();
    }
} 