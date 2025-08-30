export class ECAInterpreter {
    constructor(engine) {
        this.graphs = new Map();
        this.actionHandlers = new Map();
        this.conditionHandlers = new Map();
        this.isRunning = false;
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
    initializeHandlers() {
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
                    }
                    else {
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
                if (!entityId || !position || !distance)
                    return false;
                const entityPos = context.state.entityPositions.get(entityId);
                if (!entityPos)
                    return false;
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
                if (!timerId)
                    return false;
                const endTime = context.state.activeTimers.get(timerId);
                return endTime ? context.currentTime < endTime : false;
            }
        });
    }
    registerActionHandler(handler) {
        this.actionHandlers.set(handler.name, handler);
    }
    registerConditionHandler(handler) {
        this.conditionHandlers.set(handler.name, handler);
    }
    loadGraph(graph) {
        this.graphs.set(graph.id, graph);
        // Initialize graph variables
        if (graph.variables) {
            Object.assign(this.state.variables, graph.variables);
        }
    }
    loadGraphs(graphs) {
        graphs.forEach(graph => this.loadGraph(graph));
    }
    start() {
        this.isRunning = true;
        console.log('ECA Interpreter started');
    }
    stop() {
        this.isRunning = false;
        console.log('ECA Interpreter stopped');
    }
    update(deltaTime) {
        if (!this.isRunning)
            return;
        const context = {
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
    processGraph(context, graph) {
        // Find all event nodes
        const eventNodes = graph.nodes.filter(node => node.type === 'Event');
        for (const eventNode of eventNodes) {
            this.processEventNode(context, graph, eventNode);
        }
    }
    processEventNode(context, graph, eventNode) {
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
    shouldTriggerEvent(context, eventNode) {
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
                if (!timerId)
                    return false;
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
    async executeNodeChain(context, graph, startNode) {
        const visited = new Set();
        await this.executeNode(context, graph, startNode, visited);
    }
    async executeNode(context, graph, node, visited) {
        if (visited.has(node.id))
            return; // Prevent infinite loops
        visited.add(node.id);
        try {
            if (node.type === 'Action') {
                await this.executeAction(context, node);
            }
            else if (node.type === 'Condition') {
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
        }
        catch (error) {
            console.error(`Error executing node ${node.id}:`, error);
        }
    }
    async executeAction(context, node) {
        const handler = this.actionHandlers.get(node.kind);
        if (handler) {
            await handler.execute(context, node);
        }
        else {
            console.warn(`No action handler found for: ${node.kind}`);
        }
    }
    evaluateCondition(context, node) {
        const handler = this.conditionHandlers.get(node.kind);
        if (handler) {
            return handler.evaluate(context, node);
        }
        else {
            console.warn(`No condition handler found for: ${node.kind}`);
            return false;
        }
    }
    findNextNode(graph, currentNode, outputPort) {
        const edge = graph.edges.find(e => e.from === `${currentNode.id}:${outputPort}`);
        if (!edge)
            return null;
        const [nextNodeId] = edge.to.split(':');
        return graph.nodes.find(n => n.id === nextNodeId) || null;
    }
    updateTimers(context) {
        const expiredTimers = [];
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
    triggerEvent(eventType, data) {
        // Manually trigger an event
        console.log(`Manually triggered event: ${eventType}`, data);
        // Find all event nodes of this type and mark them as not completed
        for (const graph of this.graphs.values()) {
            const eventNodes = graph.nodes.filter(node => node.type === 'Event' && node.kind === eventType);
            eventNodes.forEach(node => {
                this.state.completedEvents.delete(node.id);
            });
        }
    }
    setVariable(name, value) {
        this.state.variables[name] = value;
    }
    getVariable(name) {
        return this.state.variables[name];
    }
    setFlag(flagId, value = true) {
        if (value) {
            this.state.flags.add(flagId);
        }
        else {
            this.state.flags.delete(flagId);
        }
    }
    hasFlag(flagId) {
        return this.state.flags.has(flagId);
    }
    setEntityPosition(entityId, x, y) {
        this.state.entityPositions.set(entityId, { x, y });
    }
    getEntityPosition(entityId) {
        return this.state.entityPositions.get(entityId);
    }
    setTimer(timerId, duration) {
        this.state.activeTimers.set(timerId, Date.now() + duration);
    }
    isTimerActive(timerId) {
        return this.state.activeTimers.has(timerId);
    }
    reset() {
        this.state = {
            variables: {},
            completedEvents: new Set(),
            activeTimers: new Map(),
            flags: new Set(),
            entityPositions: new Map()
        };
    }
    getState() {
        return { ...this.state };
    }
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
    importState(json) {
        try {
            const state = JSON.parse(json);
            this.state = {
                variables: state.variables || {},
                completedEvents: new Set(state.completedEvents || []),
                activeTimers: new Map(Object.entries(state.activeTimers || {})),
                flags: new Set(state.flags || []),
                entityPositions: new Map(Object.entries(state.entityPositions || {}))
            };
        }
        catch (error) {
            console.error('Failed to import ECA state:', error);
        }
    }
}
//# sourceMappingURL=ECA.js.map