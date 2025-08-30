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

export class TriggerManager {
  private triggers: Trigger[] = [];
  private triggerTypes: TriggerType[] = [];
  private nextId = 1;

  constructor() {
    this.initializeDefaultTriggerTypes();
  }

  private initializeDefaultTriggerTypes(): void {
    this.triggerTypes = [
      {
        name: 'Damage',
        description: 'Deals damage when triggered',
        defaultParams: { amount: 10, oneTime: true },
        paramTypes: { amount: 'number', oneTime: 'boolean' }
      },
      {
        name: 'Teleport',
        description: 'Teleports player to new location',
        defaultParams: { targetX: 0, targetY: 0, targetLevel: null },
        paramTypes: { targetX: 'number', targetY: 'number', targetLevel: 'string' }
      },
      {
        name: 'Spawn',
        description: 'Spawns an entity when triggered',
        defaultParams: { entityType: 'Enemy', count: 1, delay: 0 },
        paramTypes: { entityType: 'select', count: 'number', delay: 'number' },
        paramOptions: { entityType: ['Enemy', 'Collectible', 'NPC'] }
      },
      {
        name: 'Message',
        description: 'Displays a message to the player',
        defaultParams: { text: 'Hello World!', duration: 3 },
        paramTypes: { text: 'string', duration: 'number' }
      },
      {
        name: 'Checkpoint',
        description: 'Sets a respawn point',
        defaultParams: { saveProgress: true },
        paramTypes: { saveProgress: 'boolean' }
      },
      {
        name: 'Door',
        description: 'Opens or closes a door',
        defaultParams: { locked: false, keyRequired: null },
        paramTypes: { locked: 'boolean', keyRequired: 'string' }
      },
      {
        name: 'Platform',
        description: 'Moves a platform',
        defaultParams: { speed: 2, path: 'horizontal', distance: 100 },
        paramTypes: { speed: 'number', path: 'select', distance: 'number' },
        paramOptions: { path: ['horizontal', 'vertical', 'circular'] }
      },
      {
        name: 'Sound',
        description: 'Plays a sound effect',
        defaultParams: { soundFile: '', volume: 1.0, loop: false },
        paramTypes: { soundFile: 'string', volume: 'number', loop: 'boolean' }
      }
    ];
  }

  public addTrigger(trigger: Omit<Trigger, 'id'>): string {
    const newTrigger: Trigger = {
      ...trigger,
      id: `trigger_${this.nextId++}`,
      activated: false
    };
    
    this.triggers.push(newTrigger);
    return newTrigger.id;
  }

  public removeTrigger(triggerId: string): boolean {
    const index = this.triggers.findIndex(t => t.id === triggerId);
    if (index !== -1) {
      this.triggers.splice(index, 1);
      return true;
    }
    return false;
  }

  public getTrigger(triggerId: string): Trigger | undefined {
    return this.triggers.find(t => t.id === triggerId);
  }

  public getTriggers(): Trigger[] {
    return this.triggers.map(t => ({ ...t }));
  }

  public setTriggers(triggers: Trigger[]): void {
    this.triggers = triggers.map(t => ({ ...t }));
  }

  public updateTrigger(triggerId: string, updates: Partial<Trigger>): boolean {
    const trigger = this.getTrigger(triggerId);
    if (trigger) {
      Object.assign(trigger, updates);
      return true;
    }
    return false;
  }

  public getTriggersAtPosition(x: number, y: number): Trigger[] {
    return this.triggers.filter(trigger => 
      x >= trigger.x && x < trigger.x + trigger.width &&
      y >= trigger.y && y < trigger.y + trigger.height
    );
  }

  public getTriggersInArea(x: number, y: number, width: number, height: number): Trigger[] {
    return this.triggers.filter(trigger => 
      trigger.x < x + width && trigger.x + trigger.width > x &&
      trigger.y < y + height && trigger.y + trigger.height > y
    );
  }

  public getTriggerTypes(): TriggerType[] {
    return this.triggerTypes.map(t => ({ ...t }));
  }

  public addTriggerType(triggerType: TriggerType): void {
    this.triggerTypes.push(triggerType);
  }

  public removeTriggerType(typeName: string): boolean {
    const index = this.triggerTypes.findIndex(t => t.name === typeName);
    if (index !== -1) {
      this.triggerTypes.splice(index, 1);
      return true;
    }
    return false;
  }

  public getTriggerType(typeName: string): TriggerType | undefined {
    return this.triggerTypes.find(t => t.name === typeName);
  }

  public createTriggerFromType(typeName: string, x: number, y: number, width: number = 32, height: number = 32): string | null {
    const triggerType = this.getTriggerType(typeName);
    if (!triggerType) return null;

    const trigger: Omit<Trigger, 'id'> = {
      x,
      y,
      width,
      height,
      type: typeName,
      params: { ...triggerType.defaultParams },
      name: `${typeName} ${this.nextId}`,
      description: triggerType.description
    };

    return this.addTrigger(trigger);
  }

  public validateTrigger(trigger: Trigger): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!trigger.type) {
      errors.push('Trigger type is required');
    }
    
    if (trigger.width <= 0 || trigger.height <= 0) {
      errors.push('Trigger dimensions must be positive');
    }
    
    const triggerType = this.getTriggerType(trigger.type);
    if (triggerType) {
      // Validate parameters
      Object.keys(triggerType.paramTypes).forEach(paramName => {
        const paramType = triggerType.paramTypes[paramName];
        const paramValue = trigger.params[paramName];
        
        if (paramValue === undefined) {
          errors.push(`Parameter '${paramName}' is required`);
        } else {
          switch (paramType) {
            case 'number':
              if (typeof paramValue !== 'number' || isNaN(paramValue)) {
                errors.push(`Parameter '${paramName}' must be a number`);
              }
              break;
            case 'boolean':
              if (typeof paramValue !== 'boolean') {
                errors.push(`Parameter '${paramName}' must be a boolean`);
              }
              break;
            case 'select':
              const options = triggerType.paramOptions?.[paramName] || [];
              if (!options.includes(paramValue)) {
                errors.push(`Parameter '${paramName}' must be one of: ${options.join(', ')}`);
              }
              break;
          }
        }
      });
    }
    
    return { valid: errors.length === 0, errors };
  }

  public exportTriggers(): any[] {
    return this.triggers.map(trigger => ({
      ...trigger,
      params: { ...trigger.params }
    }));
  }

  public importTriggers(triggers: any[]): void {
    this.triggers = triggers.map(trigger => ({
      ...trigger,
      params: { ...trigger.params }
    }));
  }

  public clearAllTriggers(): void {
    this.triggers = [];
  }

  public getTriggerCount(): number {
    return this.triggers.length;
  }

  public getTriggersByType(typeName: string): Trigger[] {
    return this.triggers.filter(t => t.type === typeName);
  }

  public activateTrigger(triggerId: string): boolean {
    const trigger = this.getTrigger(triggerId);
    if (trigger) {
      trigger.activated = true;
      return true;
    }
    return false;
  }

  public deactivateTrigger(triggerId: string): boolean {
    const trigger = this.getTrigger(triggerId);
    if (trigger) {
      trigger.activated = false;
      return true;
    }
    return false;
  }

  public resetAllTriggers(): void {
    this.triggers.forEach(trigger => {
      trigger.activated = false;
    });
  }

  public duplicateTrigger(triggerId: string, offsetX: number = 32, offsetY: number = 0): string | null {
    const original = this.getTrigger(triggerId);
    if (!original) return null;

    const duplicate: Omit<Trigger, 'id'> = {
      ...original,
      x: original.x + offsetX,
      y: original.y + offsetY,
      name: `${original.name} (Copy)`,
      activated: false
    };

    return this.addTrigger(duplicate);
  }

  public moveTrigger(triggerId: string, newX: number, newY: number): boolean {
    return this.updateTrigger(triggerId, { x: newX, y: newY });
  }

  public resizeTrigger(triggerId: string, newWidth: number, newHeight: number): boolean {
    return this.updateTrigger(triggerId, { width: newWidth, height: newHeight });
  }
} 