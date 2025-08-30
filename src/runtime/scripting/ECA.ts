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
  from: string; // nodeId:portId
  to: string;   // nodeId:portId
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

export class ECAScriptEngine {
  private nodeHandlers: Map<string, ECANodeHandler> = new Map();
  private activeScripts: Map<string, ECAScriptInstance> = new Map();
  private globalVariables: Record<string, any> = {};

  constructor(private engine: GameEngine) {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
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
        if (!context.entity) return false;
        
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
        if (!context.entity || !context.entity.isOnGround) return false;
        
        const force = node.props.force || 300;
        context.entity.velocity.y = -force;
        return true;
      }
    });

    this.registerHandler('Action', 'PlayAnimation', {
      execute: (node, context) => {
        if (!context.entity) return false;
        
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

  registerHandler(nodeType: string, nodeKind: string, handler: ECANodeHandler) {
    const key = `${nodeType}:${nodeKind}`;
    this.nodeHandlers.set(key, handler);
  }

  createScriptInstance(script: ECAScript, entity?: Entity): ECAScriptInstance {
    const instance = new ECAScriptInstance(script, this, entity);
    this.activeScripts.set(script.id, instance);
    return instance;
  }

  removeScriptInstance(scriptId: string) {
    this.activeScripts.delete(scriptId);
  }

  update(deltaTime: number) {
    for (const instance of this.activeScripts.values()) {
      instance.update(deltaTime);
    }
  }

  getGlobalVariable(name: string): any {
    return this.globalVariables[name];
  }

  setGlobalVariable(name: string, value: any) {
    this.globalVariables[name] = value;
  }

  getHandler(nodeType: string, nodeKind: string): ECANodeHandler | undefined {
    const key = `${nodeType}:${nodeKind}`;
    return this.nodeHandlers.get(key);
  }

  validateScript(script: ECAScript): string[] {
    const errors: string[] = [];
    
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
  private variables: Record<string, any> = {};
  private executionStack: string[] = [];
  private lastExecutionTime: number = 0;

  constructor(
    private script: ECAScript,
    private engine: ECAScriptEngine,
    private entity?: Entity
  ) {
    // Initialize variables
    this.variables = { ...script.variables };
  }

  update(deltaTime: number) {
    const context: ECAContext = {
      entity: this.entity,
      engine: this.engine.engine,
      variables: this.variables,
      deltaTime
    };

    // Find all event nodes and execute them
    const eventNodes = this.script.nodes.filter(n => n.type === 'Event');
    
    for (const eventNode of eventNodes) {
      const handler = this.engine.getHandler(eventNode.type, eventNode.kind);
      if (!handler) continue;

      try {
        const result = handler.execute(eventNode, context);
        if (result) {
          // Event triggered, follow edges to conditions
          this.executeFromNode(eventNode.id, context);
        }
      } catch (error) {
        console.error(`Error executing event node ${eventNode.id}:`, error);
      }
    }
  }

  private async executeFromNode(nodeId: string, context: ECAContext): Promise<void> {
    if (this.executionStack.includes(nodeId)) {
      console.warn(`Circular execution detected for node ${nodeId}`);
      return;
    }

    this.executionStack.push(nodeId);
    
    try {
      const node = this.script.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const handler = this.engine.getHandler(node.type, node.kind);
      if (!handler) return;

      let shouldContinue = false;
      
      if (node.type === 'Event') {
        shouldContinue = true;
      } else if (node.type === 'Condition') {
        shouldContinue = await handler.execute(node, context);
      } else if (node.type === 'Action') {
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
    } finally {
      this.executionStack.pop();
    }
  }

  getVariable(name: string): any {
    return this.variables[name];
  }

  setVariable(name: string, value: any) {
    this.variables[name] = value;
  }

  getScript(): ECAScript {
    return this.script;
  }
} 