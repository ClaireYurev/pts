export class TriggerManager {
    constructor() {
        this.triggers = [];
        this.triggerTypes = [];
        this.nextId = 1;
        this.initializeDefaultTriggerTypes();
    }
    initializeDefaultTriggerTypes() {
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
    addTrigger(trigger) {
        const newTrigger = {
            ...trigger,
            id: `trigger_${this.nextId++}`,
            activated: false
        };
        this.triggers.push(newTrigger);
        return newTrigger.id;
    }
    removeTrigger(triggerId) {
        const index = this.triggers.findIndex(t => t.id === triggerId);
        if (index !== -1) {
            this.triggers.splice(index, 1);
            return true;
        }
        return false;
    }
    getTrigger(triggerId) {
        return this.triggers.find(t => t.id === triggerId);
    }
    getTriggers() {
        return this.triggers.map(t => ({ ...t }));
    }
    setTriggers(triggers) {
        this.triggers = triggers.map(t => ({ ...t }));
    }
    updateTrigger(triggerId, updates) {
        const trigger = this.getTrigger(triggerId);
        if (trigger) {
            Object.assign(trigger, updates);
            return true;
        }
        return false;
    }
    getTriggersAtPosition(x, y) {
        return this.triggers.filter(trigger => x >= trigger.x && x < trigger.x + trigger.width &&
            y >= trigger.y && y < trigger.y + trigger.height);
    }
    getTriggersInArea(x, y, width, height) {
        return this.triggers.filter(trigger => trigger.x < x + width && trigger.x + trigger.width > x &&
            trigger.y < y + height && trigger.y + trigger.height > y);
    }
    getTriggerTypes() {
        return this.triggerTypes.map(t => ({ ...t }));
    }
    addTriggerType(triggerType) {
        this.triggerTypes.push(triggerType);
    }
    removeTriggerType(typeName) {
        const index = this.triggerTypes.findIndex(t => t.name === typeName);
        if (index !== -1) {
            this.triggerTypes.splice(index, 1);
            return true;
        }
        return false;
    }
    getTriggerType(typeName) {
        return this.triggerTypes.find(t => t.name === typeName);
    }
    createTriggerFromType(typeName, x, y, width = 32, height = 32) {
        const triggerType = this.getTriggerType(typeName);
        if (!triggerType)
            return null;
        const trigger = {
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
    validateTrigger(trigger) {
        const errors = [];
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
                }
                else {
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
    exportTriggers() {
        return this.triggers.map(trigger => ({
            ...trigger,
            params: { ...trigger.params }
        }));
    }
    importTriggers(triggers) {
        this.triggers = triggers.map(trigger => ({
            ...trigger,
            params: { ...trigger.params }
        }));
    }
    clearAllTriggers() {
        this.triggers = [];
    }
    getTriggerCount() {
        return this.triggers.length;
    }
    getTriggersByType(typeName) {
        return this.triggers.filter(t => t.type === typeName);
    }
    activateTrigger(triggerId) {
        const trigger = this.getTrigger(triggerId);
        if (trigger) {
            trigger.activated = true;
            return true;
        }
        return false;
    }
    deactivateTrigger(triggerId) {
        const trigger = this.getTrigger(triggerId);
        if (trigger) {
            trigger.activated = false;
            return true;
        }
        return false;
    }
    resetAllTriggers() {
        this.triggers.forEach(trigger => {
            trigger.activated = false;
        });
    }
    duplicateTrigger(triggerId, offsetX = 32, offsetY = 0) {
        const original = this.getTrigger(triggerId);
        if (!original)
            return null;
        const duplicate = {
            ...original,
            x: original.x + offsetX,
            y: original.y + offsetY,
            name: `${original.name} (Copy)`,
            activated: false
        };
        return this.addTrigger(duplicate);
    }
    moveTrigger(triggerId, newX, newY) {
        return this.updateTrigger(triggerId, { x: newX, y: newY });
    }
    resizeTrigger(triggerId, newWidth, newHeight) {
        return this.updateTrigger(triggerId, { width: newWidth, height: newHeight });
    }
}
//# sourceMappingURL=TriggerManager.js.map