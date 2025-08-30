export interface EntityDefinition {
    id: string;
    name: string;
    icon: string;
    color: string;
    defaultProps: Record<string, any>;
    category: string;
    description?: string;
}
export declare class EntityPalette {
    private entities;
    private selectedEntity;
    constructor();
    private initializeDefaultEntities;
    selectEntity(entityId: string): void;
    getSelectedEntity(): string;
    getEntityDefinition(entityId: string): EntityDefinition | undefined;
    getAllEntities(): EntityDefinition[];
    getEntitiesByCategory(): Record<string, EntityDefinition[]>;
    getEntitiesInCategory(category: string): EntityDefinition[];
    addEntity(entity: EntityDefinition): void;
    removeEntity(entityId: string): boolean;
    getEntityIcon(entityId: string): string;
    getEntityColor(entityId: string): string;
    getEntityName(entityId: string): string;
    getEntityDescription(entityId: string): string;
    getDefaultProps(entityId: string): Record<string, any>;
    setDefaultProps(entityId: string, props: Record<string, any>): void;
    createCustomEntity(id: string, name: string, icon: string, color: string, category: string, defaultProps?: Record<string, any>, description?: string): EntityDefinition;
    searchEntities(query: string): EntityDefinition[];
    getEntitySuggestions(partialId: string): EntityDefinition[];
    validateEntityId(entityId: string): boolean;
    getEntityCount(): number;
    getCategoryCount(): number;
    exportEntityDefinitions(): Record<string, EntityDefinition>;
    importEntityDefinitions(definitions: Record<string, EntityDefinition>): void;
    getEntityCategories(): string[];
    clear(): void;
}
//# sourceMappingURL=EntityPalette.d.ts.map