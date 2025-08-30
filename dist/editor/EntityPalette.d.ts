export interface EntityType {
    name: string;
    icon?: string;
    color: string;
    properties?: Record<string, any>;
}
export declare class EntityPalette {
    private entities;
    private selectedEntity;
    private container;
    private onEntitySelected?;
    constructor(container: HTMLElement, entityTypes: string[]);
    private getDefaultColor;
    private getDefaultProperties;
    private render;
    private getEntityDescription;
    selectEntity(entityType: string): void;
    getSelectedEntity(): string;
    getEntityType(entityType: string): EntityType | undefined;
    addEntityType(entityType: EntityType): void;
    removeEntityType(entityType: string): void;
    updateEntityType(entityType: string, updates: Partial<EntityType>): void;
    getAllEntityTypes(): EntityType[];
    setOnEntitySelected(callback: (entityType: string) => void): void;
    clearSelection(): void;
    private addNewEntityType;
    private editEntityProperties;
    exportEntityTypes(): EntityType[];
    importEntityTypes(entityTypes: EntityType[]): void;
    getEntityCount(): number;
    isEmpty(): boolean;
}
//# sourceMappingURL=EntityPalette.d.ts.map