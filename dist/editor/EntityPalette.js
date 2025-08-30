export class EntityPalette {
    constructor(container, entityTypes) {
        this.selectedEntity = "";
        this.container = container;
        // Convert string array to EntityType array with default properties
        this.entities = entityTypes.map(type => ({
            name: type,
            color: this.getDefaultColor(type),
            properties: this.getDefaultProperties(type)
        }));
        this.render();
    }
    getDefaultColor(entityType) {
        const colors = {
            'Player': '#00FF00',
            'Enemy': '#FF0000',
            'Trap': '#FFA500',
            'Collectible': '#FFFF00',
            'NPC': '#0000FF',
            'Door': '#8B4513',
            'Switch': '#FF69B4',
            'Platform': '#808080',
            'Checkpoint': '#00FFFF',
            'Exit': '#32CD32'
        };
        return colors[entityType] || '#888888';
    }
    getDefaultProperties(entityType) {
        const properties = {
            'Player': { health: 100, speed: 5 },
            'Enemy': { health: 50, damage: 10, speed: 2 },
            'Trap': { damage: 20, triggerType: 'touch' },
            'Collectible': { points: 100, type: 'coin' },
            'NPC': { dialogue: 'Hello there!', quest: null },
            'Door': { locked: false, keyRequired: null },
            'Switch': { activated: false, target: null },
            'Platform': { moving: false, speed: 1 },
            'Checkpoint': { respawnPoint: true },
            'Exit': { nextLevel: null }
        };
        return properties[entityType] || {};
    }
    render() {
        this.container.innerHTML = '';
        this.container.className = 'entity-palette';
        // Add header
        const header = document.createElement('div');
        header.className = 'palette-header';
        header.textContent = 'Entities';
        this.container.appendChild(header);
        // Create entity list
        const entityList = document.createElement('div');
        entityList.className = 'entity-list';
        this.entities.forEach(entity => {
            const entityItem = document.createElement('div');
            entityItem.className = 'entity-item';
            entityItem.dataset.entityType = entity.name;
            // Create color indicator
            const colorIndicator = document.createElement('div');
            colorIndicator.className = 'entity-color';
            colorIndicator.style.backgroundColor = entity.color;
            // Create entity info
            const entityInfo = document.createElement('div');
            entityInfo.className = 'entity-info';
            const entityName = document.createElement('div');
            entityName.className = 'entity-name';
            entityName.textContent = entity.name;
            const entityDesc = document.createElement('div');
            entityDesc.className = 'entity-description';
            entityDesc.textContent = this.getEntityDescription(entity);
            entityInfo.appendChild(entityName);
            entityInfo.appendChild(entityDesc);
            entityItem.appendChild(colorIndicator);
            entityItem.appendChild(entityInfo);
            // Add click handler
            entityItem.addEventListener('click', () => {
                this.selectEntity(entity.name);
            });
            // Add double-click for properties
            entityItem.addEventListener('dblclick', () => {
                this.editEntityProperties(entity.name);
            });
            entityList.appendChild(entityItem);
        });
        this.container.appendChild(entityList);
        // Add "Add Entity" button
        const addButton = document.createElement('button');
        addButton.className = 'add-entity-btn';
        addButton.textContent = '+ Add Entity Type';
        addButton.addEventListener('click', () => {
            this.addNewEntityType();
        });
        this.container.appendChild(addButton);
    }
    getEntityDescription(entity) {
        const descriptions = {
            'Player': 'Main character',
            'Enemy': 'Hostile entity',
            'Trap': 'Harmful obstacle',
            'Collectible': 'Item to collect',
            'NPC': 'Non-player character',
            'Door': 'Passage between areas',
            'Switch': 'Activates mechanisms',
            'Platform': 'Moving surface',
            'Checkpoint': 'Respawn location',
            'Exit': 'Level completion'
        };
        return descriptions[entity.name] || 'Custom entity';
    }
    selectEntity(entityType) {
        // Remove previous selection
        const prevSelected = this.container.querySelector('.entity-item.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        // Add selection to new entity
        const newSelected = this.container.querySelector(`[data-entity-type="${entityType}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
        }
        this.selectedEntity = entityType;
        // Call callback if provided
        if (this.onEntitySelected) {
            this.onEntitySelected(entityType);
        }
    }
    getSelectedEntity() {
        return this.selectedEntity;
    }
    getEntityType(entityType) {
        return this.entities.find(e => e.name === entityType);
    }
    addEntityType(entityType) {
        this.entities.push(entityType);
        this.render();
    }
    removeEntityType(entityType) {
        this.entities = this.entities.filter(e => e.name !== entityType);
        if (this.selectedEntity === entityType) {
            this.selectedEntity = "";
        }
        this.render();
    }
    updateEntityType(entityType, updates) {
        const entity = this.entities.find(e => e.name === entityType);
        if (entity) {
            Object.assign(entity, updates);
            this.render();
        }
    }
    getAllEntityTypes() {
        return [...this.entities];
    }
    setOnEntitySelected(callback) {
        this.onEntitySelected = callback;
    }
    clearSelection() {
        const selected = this.container.querySelector('.entity-item.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        this.selectedEntity = "";
    }
    addNewEntityType() {
        const name = prompt('Enter entity type name:');
        if (name && name.trim()) {
            const entityType = {
                name: name.trim(),
                color: '#888888',
                properties: {}
            };
            this.addEntityType(entityType);
        }
    }
    editEntityProperties(entityType) {
        const entity = this.getEntityType(entityType);
        if (!entity)
            return;
        // Create a simple properties editor
        const properties = entity.properties || {};
        const propertyNames = Object.keys(properties);
        let propertiesText = propertyNames.map(key => `${key}: ${properties[key]}`).join('\n');
        const newPropertiesText = prompt('Edit properties (one per line, format: key: value):', propertiesText);
        if (newPropertiesText !== null) {
            const newProperties = {};
            newPropertiesText.split('\n').forEach(line => {
                const [key, value] = line.split(':').map(s => s.trim());
                if (key && value !== undefined) {
                    // Try to parse value as number, boolean, or keep as string
                    if (value === 'true')
                        newProperties[key] = true;
                    else if (value === 'false')
                        newProperties[key] = false;
                    else if (!isNaN(Number(value)))
                        newProperties[key] = Number(value);
                    else
                        newProperties[key] = value;
                }
            });
            this.updateEntityType(entityType, { properties: newProperties });
        }
    }
    exportEntityTypes() {
        return this.entities.map(entity => ({ ...entity }));
    }
    importEntityTypes(entityTypes) {
        this.entities = entityTypes.map(entity => ({ ...entity }));
        this.render();
    }
    getEntityCount() {
        return this.entities.length;
    }
    isEmpty() {
        return this.entities.length === 0;
    }
}
//# sourceMappingURL=EntityPalette.js.map