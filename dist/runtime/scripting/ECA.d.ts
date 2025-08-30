import { ECAGraph, ECANode } from '../../editor/VisualScriptEditor.js';
export interface ECAState {
    variables: Record<string, any>;
    completedEvents: Set<string>;
    activeTimers: Map<string, number>;
    flags: Set<string>;
    entityPositions: Map<string, {
        x: number;
        y: number;
    }>;
}
export interface ECAContext {
    engine: any;
    state: ECAState;
    currentTime: number;
    deltaTime: number;
}
export interface ActionHandler {
    name: string;
    execute: (context: ECAContext, node: ECANode) => Promise<void>;
}
export interface ConditionHandler {
    name: string;
    evaluate: (context: ECAContext, node: ECANode) => boolean;
}
export declare class ECAInterpreter {
    private graphs;
    private state;
    private actionHandlers;
    private conditionHandlers;
    private engine;
    private isRunning;
    constructor(engine: any);
    private initializeHandlers;
    registerActionHandler(handler: ActionHandler): void;
    registerConditionHandler(handler: ConditionHandler): void;
    loadGraph(graph: ECAGraph): void;
    loadGraphs(graphs: ECAGraph[]): void;
    start(): void;
    stop(): void;
    update(deltaTime: number): void;
    private processGraph;
    private processEventNode;
    private shouldTriggerEvent;
    private executeNodeChain;
    private executeNode;
    private executeAction;
    private evaluateCondition;
    private findNextNode;
    private updateTimers;
    triggerEvent(eventType: string, data?: any): void;
    setVariable(name: string, value: any): void;
    getVariable(name: string): any;
    setFlag(flagId: string, value?: boolean): void;
    hasFlag(flagId: string): boolean;
    setEntityPosition(entityId: string, x: number, y: number): void;
    getEntityPosition(entityId: string): {
        x: number;
        y: number;
    } | undefined;
    setTimer(timerId: string, duration: number): void;
    isTimerActive(timerId: string): boolean;
    reset(): void;
    getState(): ECAState;
    exportState(): string;
    importState(json: string): void;
}
//# sourceMappingURL=ECA.d.ts.map