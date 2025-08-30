export interface Trigger {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    params: Record<string, any>;
    activated?: boolean;
    name?: string;
    description?: string;
}
export interface TriggerType {
    name: string;
    description: string;
    defaultParams: Record<string, any>;
    paramTypes: Record<string, 'number' | 'string' | 'boolean' | 'select'>;
    paramOptions?: Record<string, string[]>;
}
export declare class TriggerManager {
    private triggers;
    private triggerTypes;
    private nextId;
    constructor();
    private initializeDefaultTriggerTypes;
    addTrigger(trigger: Omit<Trigger, 'id'>): string;
    removeTrigger(triggerId: string): boolean;
    getTrigger(triggerId: string): Trigger | undefined;
    getTriggers(): Trigger[];
    setTriggers(triggers: Trigger[]): void;
    updateTrigger(triggerId: string, updates: Partial<Trigger>): boolean;
    getTriggersAtPosition(x: number, y: number): Trigger[];
    getTriggersInArea(x: number, y: number, width: number, height: number): Trigger[];
    getTriggerTypes(): TriggerType[];
    addTriggerType(triggerType: TriggerType): void;
    removeTriggerType(typeName: string): boolean;
    getTriggerType(typeName: string): TriggerType | undefined;
    createTriggerFromType(typeName: string, x: number, y: number, width?: number, height?: number): string | null;
    validateTrigger(trigger: Trigger): {
        valid: boolean;
        errors: string[];
    };
    exportTriggers(): any[];
    importTriggers(triggers: any[]): void;
    clearAllTriggers(): void;
    getTriggerCount(): number;
    getTriggersByType(typeName: string): Trigger[];
    activateTrigger(triggerId: string): boolean;
    deactivateTrigger(triggerId: string): boolean;
    resetAllTriggers(): void;
    duplicateTrigger(triggerId: string, offsetX?: number, offsetY?: number): string | null;
    moveTrigger(triggerId: string, newX: number, newY: number): boolean;
    resizeTrigger(triggerId: string, newWidth: number, newHeight: number): boolean;
}
//# sourceMappingURL=TriggerManager.d.ts.map