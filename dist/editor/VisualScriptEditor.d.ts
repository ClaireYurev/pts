export interface EcaRule {
    id: string;
    event: string;
    condition: string;
    action: string;
    enabled: boolean;
    description?: string;
}
export interface EventType {
    name: string;
    description: string;
    parameters?: string[];
}
export interface ActionType {
    name: string;
    description: string;
    parameters?: string[];
}
export declare class VisualScriptEditor {
    private rules;
    private container;
    private nextId;
    private eventTypes;
    private actionTypes;
    constructor(container: HTMLElement);
    private render;
    private renderRule;
    private setupRuleEventListeners;
    private setupEventListeners;
    addRule(): void;
    deleteRule(ruleId: string): void;
    editRule(rule: EcaRule): void;
    getRules(): EcaRule[];
    exportRules(): EcaRule[];
    loadRules(rules: EcaRule[]): void;
    addEventType(eventType: EventType): void;
    addActionType(actionType: ActionType): void;
    getEventTypes(): EventType[];
    getActionTypes(): ActionType[];
    validateRule(rule: EcaRule): {
        valid: boolean;
        errors: string[];
    };
    validateAllRules(): {
        valid: boolean;
        errors: {
            ruleId: string;
            errors: string[];
        }[];
    };
    clearAllRules(): void;
    getRuleCount(): number;
    getEnabledRules(): EcaRule[];
    duplicateRule(ruleId: string): void;
    moveRule(ruleId: string, direction: 'up' | 'down'): void;
}
//# sourceMappingURL=VisualScriptEditor.d.ts.map