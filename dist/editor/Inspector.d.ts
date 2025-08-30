import { EntityData } from './EditorApp.js';
export interface PropertyField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'range';
    label: string;
    defaultValue: any;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}
export declare class Inspector {
    private currentEntity;
    private propertyFields;
    constructor();
    private initializePropertyFields;
    loadEntity(entity: EntityData): void;
    clear(): void;
    getCurrentEntity(): EntityData | null;
    updateEntityProperty(propertyName: string, value: any): void;
    getPropertyFields(entityType: string): PropertyField[];
    addPropertyField(entityType: string, field: PropertyField): void;
    removePropertyField(entityType: string, fieldName: string): void;
    private renderInspector;
    private renderPropertyField;
    private renderCustomProperties;
    private setupPropertyEventListeners;
    exportEntityData(): EntityData | null;
    importEntityData(entityData: EntityData): void;
    validateProperties(entityType: string, props: Record<string, any>): string[];
}
//# sourceMappingURL=Inspector.d.ts.map