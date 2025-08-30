export class ECAScriptEngine {
    constructor(engine) {
        this.engine = engine;
        this.nodeHandlers = new Map();
        this.activeScripts = new Map();
        this.globalVariables = {};
        this.registerDefaultHandlers();
    }
    registerDefaultHandlers() {
        // Event Handlers
        this.registerHandler('Event', 'OnStart', {
            execute: (node, context) => {
                return true; // Always triggers on script start
            }
        });
        this.registerHandler('Event', 'OnCollision', {
            execute: (node, context) => {
                const targetTag = node.props.targetTag;
                if (context.entity && context.entity.collisionTags?.includes(targetTag)) {
                    return true;
                }
                return false;
            }
        });
        this.registerHandler('Event', 'OnKeyPress', {
            execute: (node, context) => {
                const key = node.props.key;
                return context.engine.inputHandler.isKeyPressed(key);
            }
        });
        this.registerHandler('Event', 'OnTimer', {
            execute: (node, context) => {
                const interval = node.props.interval || 1000;
                const lastTime = context.variables[`timer_${node.id}`] || 0;
                const currentTime = Date.now();
                if (currentTime - lastTime >= interval) {
                    context.variables[`timer_${node.id}`] = currentTime;
                    return true;
                }
                return false;
            }
        });
        // Condition Handlers
        this.registerHandler('Condition', 'IsAlive', {
            execute: (node, context) => {
                return context.entity?.isAlive ?? false;
            }
        });
        this.registerHandler('Condition', 'HasItem', {
            execute: (node, context) => {
                const itemId = node.props.itemId;
                return context.variables[`item_${itemId}`] === true;
            }
        });
        this.registerHandler('Condition', 'IsOnGround', {
            execute: (node, context) => {
                return context.entity?.isOnGround ?? false;
            }
        });
        this.registerHandler('Condition', 'IsMoving', {
            execute: (node, context) => {
                return context.entity?.velocity &&
                    (Math.abs(context.entity.velocity.x) > 0.1 || Math.abs(context.entity.velocity.y) > 0.1);
            }
        });
        // Action Handlers
        this.registerHandler('Action', 'Move', {
            execute: (node, context) => {
                if (!context.entity)
                    return false;
                const direction = node.props.direction || 'right';
                const speed = node.props.speed || 100;
                switch (direction) {
                    case 'left':
                        context.entity.velocity.x = -speed;
                        break;
                    case 'right':
                        context.entity.velocity.x = speed;
                        break;
                    case 'up':
                        context.entity.velocity.y = -speed;
                        break;
                    case 'down':
                        context.entity.velocity.y = speed;
                        break;
                }
                return true;
            }
        });
        this.registerHandler('Action', 'Jump', {
            execute: (node, context) => {
                if (!context.entity || !context.entity.isOnGround)
                    return false;
                const force = node.props.force || 300;
                context.entity.velocity.y = -force;
                return true;
            }
        });
        this.registerHandler('Action', 'PlayAnimation', {
            execute: (node, context) => {
                if (!context.entity)
                    return false;
                const animationName = node.props.animation;
                context.entity.playAnimation(animationName);
                return true;
            }
        });
        this.registerHandler('Action', 'SetVariable', {
            execute: (node, context) => {
                const varName = node.props.variable;
                const value = node.props.value;
                context.variables[varName] = value;
                return true;
            }
        });
        this.registerHandler('Action', 'SpawnEntity', {
            execute: (node, context) => {
                const entityType = node.props.entityType;
                const x = node.props.x || (context.entity?.position.x || 0);
                const y = node.props.y || (context.entity?.position.y || 0);
                const entity = context.engine.createEntity(entityType, x, y);
                return entity !== null;
            }
        });
        this.registerHandler('Action', 'PlaySound', {
            execute: (node, context) => {
                const soundId = node.props.soundId;
                context.engine.audioManager?.playSound(soundId);
                return true;
            }
        });
        this.registerHandler('Action', 'Wait', {
            execute: (node, context) => {
                const duration = node.props.duration || 1000;
                const startTime = context.variables[`wait_${node.id}`] || Date.now();
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    context.variables[`wait_${node.id}`] = startTime;
                    return false; // Still waiting
                }
                delete context.variables[`wait_${node.id}`];
                return true; // Wait complete
            }
        });
    }
    registerHandler(nodeType, nodeKind, handler) {
        const key = `${nodeType}:${nodeKind}`;
        this.nodeHandlers.set(key, handler);
    }
    createScriptInstance(script, entity) {
        const instance = new ECAScriptInstance(script, this, entity);
        this.activeScripts.set(script.id, instance);
        return instance;
    }
    removeScriptInstance(scriptId) {
        this.activeScripts.delete(scriptId);
    }
    update(deltaTime) {
        for (const instance of this.activeScripts.values()) {
            instance.update(deltaTime);
        }
    }
    getGlobalVariable(name) {
        return this.globalVariables[name];
    }
    setGlobalVariable(name, value) {
        this.globalVariables[name] = value;
    }
    getHandler(nodeType, nodeKind) {
        const key = `${nodeType}:${nodeKind}`;
        return this.nodeHandlers.get(key);
    }
    validateScript(script) {
        const errors = [];
        // Validate nodes
        for (const node of script.nodes) {
            const handler = this.getHandler(node.type, node.kind);
            if (!handler) {
                errors.push(`Unknown node type: ${node.type}:${node.kind}`);
                continue;
            }
            if (handler.validate) {
                const error = handler.validate(node);
                if (error) {
                    errors.push(`Node ${node.id}: ${error}`);
                }
            }
        }
        // Validate edges
        const nodeIds = new Set(script.nodes.map(n => n.id));
        for (const edge of script.edges) {
            const [fromNode] = edge.from.split(':');
            const [toNode] = edge.to.split(':');
            if (!nodeIds.has(fromNode)) {
                errors.push(`Edge ${edge.id}: from node ${fromNode} does not exist`);
            }
            if (!nodeIds.has(toNode)) {
                errors.push(`Edge ${edge.id}: to node ${toNode} does not exist`);
            }
        }
        return errors;
    }
}
export class ECAScriptInstance {
    constructor(script, engine, entity) {
        this.script = script;
        this.engine = engine;
        this.entity = entity;
        this.variables = {};
        this.executionStack = [];
        this.lastExecutionTime = 0;
        // Initialize variables
        this.variables = { ...script.variables };
    }
    update(deltaTime) {
        const context = {
            entity: this.entity,
            engine: this.engine.engine,
            variables: this.variables,
            deltaTime
        };
        // Find all event nodes and execute them
        const eventNodes = this.script.nodes.filter(n => n.type === 'Event');
        for (const eventNode of eventNodes) {
            const handler = this.engine.getHandler(eventNode.type, eventNode.kind);
            if (!handler)
                continue;
            try {
                const result = handler.execute(eventNode, context);
                if (result) {
                    // Event triggered, follow edges to conditions
                    this.executeFromNode(eventNode.id, context);
                }
            }
            catch (error) {
                console.error(`Error executing event node ${eventNode.id}:`, error);
            }
        }
    }
    async executeFromNode(nodeId, context) {
        if (this.executionStack.includes(nodeId)) {
            console.warn(`Circular execution detected for node ${nodeId}`);
            return;
        }
        this.executionStack.push(nodeId);
        try {
            const node = this.script.nodes.find(n => n.id === nodeId);
            if (!node)
                return;
            const handler = this.engine.getHandler(node.type, node.kind);
            if (!handler)
                return;
            let shouldContinue = false;
            if (node.type === 'Event') {
                shouldContinue = true;
            }
            else if (node.type === 'Condition') {
                shouldContinue = await handler.execute(node, context);
            }
            else if (node.type === 'Action') {
                await handler.execute(node, context);
                shouldContinue = true;
            }
            if (shouldContinue) {
                // Find outgoing edges and continue execution
                const outgoingEdges = this.script.edges.filter(e => e.from.startsWith(nodeId + ':'));
                for (const edge of outgoingEdges) {
                    const targetNodeId = edge.to.split(':')[0];
                    await this.executeFromNode(targetNodeId, context);
                }
            }
        }
        finally {
            this.executionStack.pop();
        }
    }
    getVariable(name) {
        return this.variables[name];
    }
    setVariable(name, value) {
        this.variables[name] = value;
    }
    getScript() {
        return this.script;
    }
}
//# sourceMappingURL=ECA.js.map