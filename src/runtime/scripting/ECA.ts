import { ECAGraph, ECANode, ECAEdge } from '../../editor/VisualScriptEditor.js';

export interface ECAState {
    variables: Record<string, any>;
    completedEvents: Set<string>;
    activeTimers: Map<string, number>;
    flags: Set<string>;
    entityPositions: Map<string, { x: number; y: number }>;
}

export interface ECAContext {
    engine: any; // GameEngine reference
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

export class ECAInterpreter {
    private graphs: Map<string, ECAGraph> = new Map();
    private state: ECAState;
    private actionHandlers: Map<string, ActionHandler> = new Map();
    private conditionHandlers: Map<string, ConditionHandler> = new Map();
    private engine: any;
    private isRunning: boolean = false;

    constructor(engine: any) {
        this.engine = engine;
        this.state = {
            variables: {},
            completedEvents: new Set(),
            activeTimers: new Map(),
            flags: new Set(),
            entityPositions: new Map()
        };
        
        this.initializeHandlers();
    }

    private initializeHandlers(): void {
        // Action handlers
        this.registerActionHandler({
            name: 'openGate',
            execute: async (context, node) => {
                const gateId = node.props.gateId;
                if (gateId && this.engine.openGate) {
                    await this.engine.openGate(gateId);
                }
            }
        });

        this.registerActionHandler({
            name: 'playCutscene',
            execute: async (context, node) => {
                const cutsceneId = node.props.cutsceneId;
                if (cutsceneId && this.engine.playCutscene) {
                    await this.engine.playCutscene(cutsceneId);
                }
            }
        });

        this.registerActionHandler({
            name: 'teleport',
            execute: async (context, node) => {
                const entityId = node.props.entityId;
                const position = node.props.position;
                if (entityId && position && this.engine.teleportEntity) {
                    await this.engine.teleportEntity(entityId, position.x, position.y);
                }
            }
        });

        this.registerActionHandler({
            name: 'setFlag',
            execute: async (context, node) => {
                const flagId = node.props.flagId;
                const value = node.props.value;
                if (flagId !== undefined) {
                    if (value) {
                        context.state.flags.add(flagId);
                    } else {
                        context.state.flags.delete(flagId);
                    }
                }
            }
        });

        this.registerActionHandler({
            name: 'spawnEnemy',
            execute: async (context, node) => {
                const enemyType = node.props.enemyType;
                const position = node.props.position;
                if (enemyType && position && this.engine.spawnEnemy) {
                    await this.engine.spawnEnemy(enemyType, position.x, position.y);
                }
            }
        });

        this.registerActionHandler({
            name: 'setTimer',
            execute: async (context, node) => {
                const timerId = node.props.timerId;
                const duration = node.props.duration;
                if (timerId && duration) {
                    context.state.activeTimers.set(timerId, context.currentTime + duration);
                }
            }
        });

        this.registerActionHandler({
            name: 'showText',
            execute: async (context, node) => {
                const text = node.props.text;
                const duration = node.props.duration;
                if (text && this.engine.showText) {
                    await this.engine.showText(text, duration);
                }
            }
        });

        this.registerActionHandler({
            name: 'musicSwitch',
            execute: async (context, node) => {
                const musicId = node.props.musicId;
                const fadeTime = node.props.fadeTime;
                if (musicId && this.engine.switchMusic) {
                    await this.engine.switchMusic(musicId, fadeTime);
                }
            }
        });

        // Condition handlers
        this.registerConditionHandler({
            name: 'HasFlag',
            evaluate: (context, node) => {
                const flagId = node.props.flagId;
                return flagId ? context.state.flags.has(flagId) : false;
            }
        });

        this.registerConditionHandler({
            name: 'IsEntityNear',
            evaluate: (context, node) => {
                const entityId = node.props.entityId;
                const position = node.props.position;
                const distance = node.props.distance;
                
                if (!entityId || !position || !distance) return false;
                
                const entityPos = context.state.entityPositions.get(entityId);
                if (!entityPos) return false;
                
                const dx = entityPos.x - position.x;
                const dy = entityPos.y - position.y;
                const actualDistance = Math.sqrt(dx * dx + dy * dy);
                
                return actualDistance <= distance;
            }
        });

        this.registerConditionHandler({
            name: 'TimerActive',
            evaluate: (context, node) => {
                const timerId = node.props.timerId;
                if (!timerId) return false;
                
                const endTime = context.state.activeTimers.get(timerId);
                return endTime ? context.currentTime < endTime : false;
            }
        });
    }

    public registerActionHandler(handler: ActionHandler): void {
        this.actionHandlers.set(handler.name, handler);
    }

    public registerConditionHandler(handler: ConditionHandler): void {
        this.conditionHandlers.set(handler.name, handler);
    }

    public loadGraph(graph: ECAGraph): void {
        this.graphs.set(graph.id, graph);
        
        // Initialize graph variables
        if (graph.variables) {
            Object.assign(this.state.variables, graph.variables);
        }
    }

    public loadGraphs(graphs: ECAGraph[]): void {
        graphs.forEach(graph => this.loadGraph(graph));
    }

    public start(): void {
        this.isRunning = true;
        console.log('ECA Interpreter started');
    }

    public stop(): void {
        this.isRunning = false;
        console.log('ECA Interpreter stopped');
    }

    public update(deltaTime: number): void {
        if (!this.isRunning) return;

        const context: ECAContext = {
            engine: this.engine,
            state: this.state,
            currentTime: Date.now(),
            deltaTime: deltaTime
        };

        // Process all graphs
        for (const graph of this.graphs.values()) {
            this.processGraph(context, graph);
        }

        // Update timers
        this.updateTimers(context);
    }

    private processGraph(context: ECAContext, graph: ECAGraph): void {
        // Find all event nodes
        const eventNodes = graph.nodes.filter(node => node.type === 'Event');
        
        for (const eventNode of eventNodes) {
            this.processEventNode(context, graph, eventNode);
        }
    }

    private processEventNode(context: ECAContext, graph: ECAGraph, eventNode: ECANode): void {
        // Check if event has already been processed
        if (context.state.completedEvents.has(eventNode.id)) {
            return;
        }

        // Check if event should trigger
        if (this.shouldTriggerEvent(context, eventNode)) {
            // Mark event as completed
            context.state.completedEvents.add(eventNode.id);
            
            // Execute the event chain
            this.executeNodeChain(context, graph, eventNode);
        }
    }

    private shouldTriggerEvent(context: ECAContext, eventNode: ECANode): boolean {
        switch (eventNode.kind) {
            case 'OnStart':
                return true; // Always trigger on start
                
            case 'OnEnterRoom':
                const roomId = eventNode.props.roomId;
                return roomId ? this.engine.isPlayerInRoom?.(roomId) : false;
                
            case 'OnPlate':
                const plateId = eventNode.props.plateId;
                return plateId ? this.engine.isPressurePlateActive?.(plateId) : false;
                
            case 'OnTimer':
                const timerId = eventNode.props.timerId;
                if (!timerId) return false;
                const endTime = context.state.activeTimers.get(timerId);
                return endTime ? context.currentTime >= endTime : false;
                
            case 'OnEnemyDefeated':
                const enemyId = eventNode.props.enemyId;
                return enemyId ? this.engine.isEnemyDefeated?.(enemyId) : false;
                
            case 'OnCutsceneEnd':
                const cutsceneId = eventNode.props.cutsceneId;
                return cutsceneId ? this.engine.isCutsceneEnded?.(cutsceneId) : false;
                
            case 'OnNoclipExit':
                return this.engine.isNoclipExited?.() || false;
                
            default:
                return false;
        }
    }

    private async executeNodeChain(context: ECAContext, graph: ECAGraph, startNode: ECANode): Promise<void> {
        const visited = new Set<string>();
        await this.executeNode(context, graph, startNode, visited);
    }

    private async executeNode(context: ECAContext, graph: ECAGraph, node: ECANode, visited: Set<string>): Promise<void> {
        if (visited.has(node.id)) return; // Prevent infinite loops
        visited.add(node.id);

        try {
            if (node.type === 'Action') {
                await this.executeAction(context, node);
            } else if (node.type === 'Condition') {
                const result = this.evaluateCondition(context, node);
                const outputPort = result ? 'flow_true' : 'flow_false';
                
                // Find next node based on condition result
                const nextNode = this.findNextNode(graph, node, outputPort);
                if (nextNode) {
                    await this.executeNode(context, graph, nextNode, visited);
                }
                return;
            }

            // Find next node
            const nextNode = this.findNextNode(graph, node, 'flow');
            if (nextNode) {
                await this.executeNode(context, graph, nextNode, visited);
            }
        } catch (error) {
            console.error(`Error executing node ${node.id}:`, error);
        }
    }

    private async executeAction(context: ECAContext, node: ECANode): Promise<void> {
        const handler = this.actionHandlers.get(node.kind);
        if (handler) {
            await handler.execute(context, node);
        } else {
            console.warn(`No action handler found for: ${node.kind}`);
        }
    }

    private evaluateCondition(context: ECAContext, node: ECANode): boolean {
        const handler = this.conditionHandlers.get(node.kind);
        if (handler) {
            return handler.evaluate(context, node);
        } else {
            console.warn(`No condition handler found for: ${node.kind}`);
            return false;
        }
    }

    private findNextNode(graph: ECAGraph, currentNode: ECANode, outputPort: string): ECANode | null {
        const edge = graph.edges.find(e => e.from === `${currentNode.id}:${outputPort}`);
        if (!edge) return null;

        const [nextNodeId] = edge.to.split(':');
        return graph.nodes.find(n => n.id === nextNodeId) || null;
    }

    private updateTimers(context: ECAContext): void {
        const expiredTimers: string[] = [];
        
        for (const [timerId, endTime] of context.state.activeTimers) {
            if (context.currentTime >= endTime) {
                expiredTimers.push(timerId);
            }
        }
        
        // Remove expired timers
        expiredTimers.forEach(timerId => {
            context.state.activeTimers.delete(timerId);
        });
    }

    public triggerEvent(eventType: string, data?: any): void {
        // Manually trigger an event
        console.log(`Manually triggered event: ${eventType}`, data);
        
        // Find all event nodes of this type and mark them as not completed
        for (const graph of this.graphs.values()) {
            const eventNodes = graph.nodes.filter(node => 
                node.type === 'Event' && node.kind === eventType
            );
            
            eventNodes.forEach(node => {
                this.state.completedEvents.delete(node.id);
            });
        }
    }

    public setVariable(name: string, value: any): void {
        this.state.variables[name] = value;
    }

    public getVariable(name: string): any {
        return this.state.variables[name];
    }

    public setFlag(flagId: string, value: boolean = true): void {
        if (value) {
            this.state.flags.add(flagId);
        } else {
            this.state.flags.delete(flagId);
        }
    }

    public hasFlag(flagId: string): boolean {
        return this.state.flags.has(flagId);
    }

    public setEntityPosition(entityId: string, x: number, y: number): void {
        this.state.entityPositions.set(entityId, { x, y });
    }

    public getEntityPosition(entityId: string): { x: number; y: number } | undefined {
        return this.state.entityPositions.get(entityId);
    }

    public setTimer(timerId: string, duration: number): void {
        this.state.activeTimers.set(timerId, Date.now() + duration);
    }

    public isTimerActive(timerId: string): boolean {
        return this.state.activeTimers.has(timerId);
    }

    public reset(): void {
        this.state = {
            variables: {},
            completedEvents: new Set(),
            activeTimers: new Map(),
            flags: new Set(),
            entityPositions: new Map()
        };
    }

    public getState(): ECAState {
        return { ...this.state };
    }

    public exportState(): string {
        return JSON.stringify(this.state, null, 2);
    }

    public importState(json: string): void {
        try {
            const state = JSON.parse(json);
            this.state = {
                variables: state.variables || {},
                completedEvents: new Set(state.completedEvents || []),
                activeTimers: new Map(Object.entries(state.activeTimers || {})),
                flags: new Set(state.flags || []),
                entityPositions: new Map(Object.entries(state.entityPositions || {}))
            };
        } catch (error) {
            console.error('Failed to import ECA state:', error);
        }
    }
} 