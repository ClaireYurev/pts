import { EntityData } from './EditorApp.js';

export interface PropertyField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'range';
    label: string;
    defaultValue: any;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}

export class Inspector {
    private currentEntity: EntityData | null = null;
    private propertyFields: Map<string, PropertyField[]> = new Map();

    constructor() {
        this.initializePropertyFields();
    }

    private initializePropertyFields(): void {
        // Guard properties
        this.propertyFields.set('guard', [
            { name: 'ai', type: 'select', label: 'AI Type', defaultValue: 'patrol', options: ['patrol', 'chase', 'idle'] },
            { name: 'speed', type: 'range', label: 'Speed', defaultValue: 50, min: 10, max: 200, step: 5 },
            { name: 'health', type: 'range', label: 'Health', defaultValue: 100, min: 1, max: 500, step: 1 },
            { name: 'damage', type: 'range', label: 'Damage', defaultValue: 20, min: 1, max: 100, step: 1 },
            { name: 'patrolDistance', type: 'range', label: 'Patrol Distance', defaultValue: 100, min: 10, max: 500, step: 10 },
            { name: 'detectionRange', type: 'range', label: 'Detection Range', defaultValue: 150, min: 10, max: 300, step: 10 }
        ]);

        // Potion properties
        this.propertyFields.set('potion', [
            { name: 'type', type: 'select', label: 'Potion Type', defaultValue: 'health', options: ['health', 'mana', 'speed', 'strength'] },
            { name: 'value', type: 'range', label: 'Value', defaultValue: 50, min: 1, max: 200, step: 1 },
            { name: 'respawnTime', type: 'range', label: 'Respawn Time (ms)', defaultValue: 30000, min: 0, max: 120000, step: 1000 }
        ]);

        // Sword properties
        this.propertyFields.set('sword', [
            { name: 'damage', type: 'range', label: 'Damage', defaultValue: 30, min: 1, max: 100, step: 1 },
            { name: 'durability', type: 'range', label: 'Durability', defaultValue: 100, min: 1, max: 1000, step: 1 },
            { name: 'range', type: 'range', label: 'Range', defaultValue: 40, min: 10, max: 100, step: 5 }
        ]);

        // Teleporter properties
        this.propertyFields.set('teleporter', [
            { name: 'targetId', type: 'string', label: 'Target ID', defaultValue: '' },
            { name: 'oneWay', type: 'boolean', label: 'One Way', defaultValue: false },
            { name: 'cooldown', type: 'range', label: 'Cooldown (ms)', defaultValue: 1000, min: 0, max: 10000, step: 100 },
            { name: 'particleEffect', type: 'boolean', label: 'Particle Effect', defaultValue: true }
        ]);

        // Crusher properties
        this.propertyFields.set('crusher', [
            { name: 'speed', type: 'range', label: 'Speed', defaultValue: 1, min: 0.1, max: 5, step: 0.1 },
            { name: 'damage', type: 'range', label: 'Damage', defaultValue: 100, min: 1, max: 200, step: 1 },
            { name: 'delay', type: 'range', label: 'Delay (ms)', defaultValue: 2000, min: 0, max: 10000, step: 100 },
            { name: 'cycleTime', type: 'range', label: 'Cycle Time (ms)', defaultValue: 5000, min: 1000, max: 30000, step: 500 },
            { name: 'direction', type: 'select', label: 'Direction', defaultValue: 'vertical', options: ['vertical', 'horizontal'] }
        ]);

        // Pressure Plate properties
        this.propertyFields.set('pressurePlate', [
            { name: 'targetId', type: 'string', label: 'Target ID', defaultValue: '' },
            { name: 'oneTime', type: 'boolean', label: 'One Time Use', defaultValue: false },
            { name: 'delay', type: 'range', label: 'Delay (ms)', defaultValue: 0, min: 0, max: 5000, step: 100 },
            { name: 'requiresWeight', type: 'boolean', label: 'Requires Weight', defaultValue: true }
        ]);

        // Gate properties
        this.propertyFields.set('gate', [
            { name: 'locked', type: 'boolean', label: 'Locked', defaultValue: false },
            { name: 'keyId', type: 'string', label: 'Key ID', defaultValue: '' },
            { name: 'openTime', type: 'range', label: 'Open Time (ms)', defaultValue: 1000, min: 0, max: 5000, step: 100 },
            { name: 'autoClose', type: 'boolean', label: 'Auto Close', defaultValue: false },
            { name: 'closeDelay', type: 'range', label: 'Close Delay (ms)', defaultValue: 5000, min: 1000, max: 30000, step: 500 }
        ]);

        // Loose Tile properties
        this.propertyFields.set('looseTile', [
            { name: 'fragile', type: 'boolean', label: 'Fragile', defaultValue: true },
            { name: 'fallDelay', type: 'range', label: 'Fall Delay (ms)', defaultValue: 1000, min: 0, max: 5000, step: 100 },
            { name: 'damage', type: 'range', label: 'Damage', defaultValue: 25, min: 0, max: 100, step: 1 },
            { name: 'respawnTime', type: 'range', label: 'Respawn Time (ms)', defaultValue: 10000, min: 0, max: 60000, step: 1000 }
        ]);

        // Chopper properties
        this.propertyFields.set('chopper', [
            { name: 'speed', type: 'range', label: 'Speed', defaultValue: 2, min: 0.1, max: 10, step: 0.1 },
            { name: 'damage', type: 'range', label: 'Damage', defaultValue: 50, min: 1, max: 100, step: 1 },
            { name: 'range', type: 'range', label: 'Range', defaultValue: 32, min: 10, max: 100, step: 1 },
            { name: 'swingAngle', type: 'range', label: 'Swing Angle', defaultValue: 90, min: 45, max: 180, step: 15 },
            { name: 'cycleTime', type: 'range', label: 'Cycle Time (ms)', defaultValue: 3000, min: 1000, max: 10000, step: 500 }
        ]);

        // Region properties
        this.propertyFields.set('region', [
            { name: 'type', type: 'select', label: 'Region Type', defaultValue: 'checkpoint', options: ['checkpoint', 'trigger', 'damage', 'heal'] },
            { name: 'message', type: 'string', label: 'Message', defaultValue: '' },
            { name: 'width', type: 'range', label: 'Width', defaultValue: 32, min: 8, max: 200, step: 8 },
            { name: 'height', type: 'range', label: 'Height', defaultValue: 32, min: 8, max: 200, step: 8 },
            { name: 'oneTime', type: 'boolean', label: 'One Time', defaultValue: true }
        ]);

        // Key properties
        this.propertyFields.set('key', [
            { name: 'keyId', type: 'string', label: 'Key ID', defaultValue: 'key_1' },
            { name: 'reusable', type: 'boolean', label: 'Reusable', defaultValue: false },
            { name: 'glowEffect', type: 'boolean', label: 'Glow Effect', defaultValue: true }
        ]);

        // Checkpoint properties
        this.propertyFields.set('checkpoint', [
            { name: 'respawnPoint', type: 'boolean', label: 'Respawn Point', defaultValue: true },
            { name: 'healPlayer', type: 'boolean', label: 'Heal Player', defaultValue: true },
            { name: 'message', type: 'string', label: 'Message', defaultValue: 'Checkpoint reached!' }
        ]);
    }

    public loadEntity(entity: EntityData): void {
        this.currentEntity = entity;
        this.renderInspector();
    }

    public clear(): void {
        this.currentEntity = null;
        this.renderInspector();
    }

    public getCurrentEntity(): EntityData | null {
        return this.currentEntity;
    }

    public updateEntityProperty(propertyName: string, value: any): void {
        if (this.currentEntity) {
            this.currentEntity.props[propertyName] = value;
        }
    }

    public getPropertyFields(entityType: string): PropertyField[] {
        return this.propertyFields.get(entityType) || [];
    }

    public addPropertyField(entityType: string, field: PropertyField): void {
        if (!this.propertyFields.has(entityType)) {
            this.propertyFields.set(entityType, []);
        }
        this.propertyFields.get(entityType)!.push(field);
    }

    public removePropertyField(entityType: string, fieldName: string): void {
        const fields = this.propertyFields.get(entityType);
        if (fields) {
            const index = fields.findIndex(field => field.name === fieldName);
            if (index !== -1) {
                fields.splice(index, 1);
            }
        }
    }

    private renderInspector(): void {
        const container = document.getElementById('inspectorContent');
        if (!container) return;

        if (!this.currentEntity) {
            container.innerHTML = '<p style="color: #888; font-style: italic;">Select an entity to edit its properties</p>';
            return;
        }

        const entityType = this.currentEntity.type;
        const fields = this.getPropertyFields(entityType);
        
        let html = `
            <div class="inspector-section">
                <h3>Entity: ${this.currentEntity.type}</h3>
                <p style="color: #CCC; font-size: 12px;">ID: ${this.currentEntity.id}</p>
                <p style="color: #CCC; font-size: 12px;">Position: (${this.currentEntity.x}, ${this.currentEntity.y})</p>
            </div>
        `;

        if (fields.length > 0) {
            html += '<div class="inspector-section">';
            html += '<h3>Properties</h3>';
            
            fields.forEach(field => {
                const currentValue = this.currentEntity!.props[field.name] ?? field.defaultValue;
                html += this.renderPropertyField(field, currentValue);
            });
            
            html += '</div>';
        } else {
            html += '<div class="inspector-section">';
            html += '<h3>Properties</h3>';
            html += '<p style="color: #888; font-style: italic;">No properties defined for this entity type</p>';
            html += '</div>';
        }

        // Add custom properties section
        html += this.renderCustomProperties();

        container.innerHTML = html;
        this.setupPropertyEventListeners();
    }

    private renderPropertyField(field: PropertyField, currentValue: any): string {
        let html = `<div class="inspector-field">`;
        html += `<label for="${field.name}">${field.label}:</label>`;

        switch (field.type) {
            case 'string':
                html += `<input type="text" id="${field.name}" value="${currentValue}" placeholder="Enter ${field.label.toLowerCase()}">`;
                break;
            
            case 'number':
                html += `<input type="number" id="${field.name}" value="${currentValue}" step="${field.step || 1}">`;
                break;
            
            case 'boolean':
                html += `<input type="checkbox" id="${field.name}" ${currentValue ? 'checked' : ''}>`;
                break;
            
            case 'select':
                html += `<select id="${field.name}">`;
                field.options?.forEach(option => {
                    html += `<option value="${option}" ${currentValue === option ? 'selected' : ''}>${option}</option>`;
                });
                html += `</select>`;
                break;
            
            case 'range':
                html += `<input type="range" id="${field.name}" value="${currentValue}" min="${field.min || 0}" max="${field.max || 100}" step="${field.step || 1}">`;
                html += `<span class="value-display">${currentValue}</span>`;
                break;
            
            case 'color':
                html += `<input type="color" id="${field.name}" value="${currentValue}">`;
                break;
        }

        if (field.description) {
            html += `<small style="color: #888; display: block; margin-top: 2px;">${field.description}</small>`;
        }

        html += `</div>`;
        return html;
    }

    private renderCustomProperties(): string {
        if (!this.currentEntity) return '';

        const customProps = Object.entries(this.currentEntity.props).filter(([key]) => {
            const fields = this.getPropertyFields(this.currentEntity!.type);
            return !fields.some(field => field.name === key);
        });

        if (customProps.length === 0) return '';

        let html = '<div class="inspector-section">';
        html += '<h3>Custom Properties</h3>';
        
        customProps.forEach(([key, value]) => {
            html += `<div class="inspector-field">`;
            html += `<label>${key}:</label>`;
            html += `<input type="text" value="${value}" readonly style="background-color: #444;">`;
            html += `<button class="tool-button" onclick="removeCustomProperty('${key}')" style="margin-left: 5px; padding: 2px 8px; font-size: 10px;">Remove</button>`;
            html += `</div>`;
        });

        html += '<div class="inspector-field">';
        html += '<label>Add Custom Property:</label>';
        html += '<input type="text" id="customPropName" placeholder="Property name">';
        html += '<input type="text" id="customPropValue" placeholder="Property value">';
        html += '<button class="tool-button" onclick="addCustomProperty()" style="margin-left: 5px; padding: 2px 8px; font-size: 10px;">Add</button>';
        html += '</div>';
        
        html += '</div>';
        return html;
    }

    private setupPropertyEventListeners(): void {
        if (!this.currentEntity) return;

        const fields = this.getPropertyFields(this.currentEntity.type);
        
        fields.forEach(field => {
            const element = document.getElementById(field.name) as HTMLInputElement | HTMLSelectElement;
            if (element) {
                element.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement | HTMLSelectElement;
                    let value: any = target.value;
                    
                    if (field.type === 'number' || field.type === 'range') {
                        value = parseFloat(value);
                    } else if (field.type === 'boolean') {
                        value = (target as HTMLInputElement).checked;
                    }
                    
                    this.updateEntityProperty(field.name, value);
                    
                    // Update range value display
                    if (field.type === 'range') {
                        const displayElement = target.parentElement?.querySelector('.value-display');
                        if (displayElement) {
                            displayElement.textContent = value;
                        }
                    }
                });
            }
        });
    }

    public exportEntityData(): EntityData | null {
        return this.currentEntity;
    }

    public importEntityData(entityData: EntityData): void {
        this.loadEntity(entityData);
    }

    public validateProperties(entityType: string, props: Record<string, any>): string[] {
        const errors: string[] = [];
        const fields = this.getPropertyFields(entityType);

        fields.forEach(field => {
            const value = props[field.name];
            
            if (field.type === 'number' || field.type === 'range') {
                if (typeof value !== 'number' || isNaN(value)) {
                    errors.push(`${field.label} must be a number`);
                } else if (field.min !== undefined && value < field.min) {
                    errors.push(`${field.label} must be at least ${field.min}`);
                } else if (field.max !== undefined && value > field.max) {
                    errors.push(`${field.label} must be at most ${field.max}`);
                }
            } else if (field.type === 'string' && typeof value !== 'string') {
                errors.push(`${field.label} must be a string`);
            } else if (field.type === 'boolean' && typeof value !== 'boolean') {
                errors.push(`${field.label} must be a boolean`);
            } else if (field.type === 'select' && field.options && !field.options.includes(value)) {
                errors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
            }
        });

        return errors;
    }
} 