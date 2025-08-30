import { Entity } from '../../engine/Entity';
import { GameEngine } from '../../engine/GameEngine';
export interface ECANode {
    id: string;
    type: 'Event' | 'Condition' | 'Action';
    kind: string;
    x: number;
    y: number;
    props: Record<string, any>;
}
export interface ECAEdge {
    id: string;
    from: string;
    to: string;
}
export interface ECAScript {
    id: string;
    name: string;
    nodes: ECANode[];
    edges: ECAEdge[];
    variables: Record<string, any>;
}
export interface ECAContext {
    entity?: Entity;
    engine: GameEngine;
    variables: Record<string, any>;
    deltaTime: number;
}
export interface ECANodeHandler {
    execute: (node: ECANode, context: ECAContext) => boolean | Promise<boolean>;
    validate?: (node: ECANode) => string | null;
}
export declare class ECAScriptEngine {
    private engine;
    private nodeHandlers;
    private activeScripts;
    private globalVariables;
    constructor(engine: GameEngine);
    private registerDefaultHandlers;
    registerHandler(nodeType: string, nodeKind: string, handler: ECANodeHandler): void;
    createScriptInstance(script: ECAScript, entity?: Entity): ECAScriptInstance;
    removeScriptInstance(scriptId: string): void;
    update(deltaTime: number): void;
    getGlobalVariable(name: string): any;
    setGlobalVariable(name: string, value: any): void;
    getHandler(nodeType: string, nodeKind: string): ECANodeHandler | undefined;
    validateScript(script: ECAScript): string[];
}
export declare class ECAScriptInstance {
    private script;
    private engine;
    private entity?;
    private variables;
    private executionStack;
    private lastExecutionTime;
    constructor(script: ECAScript, engine: ECAScriptEngine, entity?: Entity | undefined);
    update(deltaTime: number): void;
    private executeFromNode;
    getVariable(name: string): any;
    setVariable(name: string, value: any): void;
    getScript(): ECAScript;
}
//# sourceMappingURL=ECA.d.ts.map