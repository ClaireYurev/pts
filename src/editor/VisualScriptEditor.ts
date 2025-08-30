export interface EcaRule {
  id: string;
  event: string;
  condition: string;
  action: string;
  enabled: boolean;
  description?: string;
}

export interface EventType {
  name: string;
  description: string;
  parameters?: string[];
}

export interface ActionType {
  name: string;
  description: string;
  parameters?: string[];
}

export class VisualScriptEditor {
  private rules: EcaRule[] = [];
  private container: HTMLElement;
  private nextId = 1;

  // Predefined events and actions
  private eventTypes: EventType[] = [
    { name: 'onEnterRoom', description: 'When player enters a room' },
    { name: 'onExitRoom', description: 'When player exits a room' },
    { name: 'onPlayerDeath', description: 'When player dies' },
    { name: 'onCollectItem', description: 'When player collects an item' },
    { name: 'onEnemyDeath', description: 'When an enemy dies' },
    { name: 'onTriggerActivated', description: 'When a trigger is activated' },
    { name: 'onLevelStart', description: 'When level starts' },
    { name: 'onLevelComplete', description: 'When level is completed' },
    { name: 'onTimeElapsed', description: 'After a certain time has passed' },
    { name: 'onButtonPressed', description: 'When a button is pressed' }
  ];

  private actionTypes: ActionType[] = [
    { name: 'spawnEnemy', description: 'Spawn an enemy', parameters: ['type', 'x', 'y'] },
    { name: 'spawnItem', description: 'Spawn an item', parameters: ['type', 'x', 'y'] },
    { name: 'teleportPlayer', description: 'Teleport player', parameters: ['x', 'y'] },
    { name: 'showMessage', description: 'Show a message', parameters: ['text', 'duration'] },
    { name: 'playSound', description: 'Play a sound', parameters: ['soundFile', 'volume'] },
    { name: 'changeLevel', description: 'Change to another level', parameters: ['levelName'] },
    { name: 'setVariable', description: 'Set a variable', parameters: ['name', 'value'] },
    { name: 'activateTrigger', description: 'Activate a trigger', parameters: ['triggerId'] },
    { name: 'deactivateTrigger', description: 'Deactivate a trigger', parameters: ['triggerId'] },
    { name: 'giveItem', description: 'Give item to player', parameters: ['itemType', 'quantity'] }
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'script-editor';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'script-header';
    header.innerHTML = `
      <h3>Visual Script Editor</h3>
      <button id="addRuleBtn" class="add-rule-btn">+ Add Rule</button>
    `;
    this.container.appendChild(header);

    // Add rules container
    const rulesContainer = document.createElement('div');
    rulesContainer.className = 'rules-container';
    this.container.appendChild(rulesContainer);

    // Render existing rules
    this.rules.forEach(rule => {
      this.renderRule(rule, rulesContainer);
    });

    // Add event listeners
    this.setupEventListeners();
  }

  private renderRule(rule: EcaRule, container: HTMLElement): void {
    const ruleElement = document.createElement('div');
    ruleElement.className = 'rule-item';
    ruleElement.dataset.ruleId = rule.id;
    
    ruleElement.innerHTML = `
      <div class="rule-header">
        <label class="rule-enabled">
          <input type="checkbox" ${rule.enabled ? 'checked' : ''}>
          <span>Enabled</span>
        </label>
        <div class="rule-actions">
          <button class="edit-rule-btn" title="Edit Rule">✏️</button>
          <button class="delete-rule-btn" title="Delete Rule">🗑️</button>
        </div>
      </div>
      <div class="rule-content">
        <div class="rule-section">
          <label>Event:</label>
          <select class="event-select">
            ${this.eventTypes.map(event => 
              `<option value="${event.name}" ${rule.event === event.name ? 'selected' : ''}>${event.name}</option>`
            ).join('')}
        </div>
        <div class="rule-section">
          <label>Condition:</label>
          <input type="text" class="condition-input" value="${rule.condition}" placeholder="e.g., player.health > 50">
        </div>
        <div class="rule-section">
          <label>Action:</label>
          <select class="action-select">
            ${this.actionTypes.map(action => 
              `<option value="${action.name}" ${rule.action === action.name ? 'selected' : ''}>${action.name}</option>`
            ).join('')}
        </div>
        <div class="rule-section">
          <label>Description:</label>
          <input type="text" class="description-input" value="${rule.description || ''}" placeholder="Optional description">
        </div>
      </div>
    `;

    // Add event listeners for this rule
    this.setupRuleEventListeners(ruleElement, rule);
    
    container.appendChild(ruleElement);
  }

  private setupRuleEventListeners(ruleElement: HTMLElement, rule: EcaRule): void {
    // Enable/disable checkbox
    const enabledCheckbox = ruleElement.querySelector('.rule-enabled input') as HTMLInputElement;
    enabledCheckbox.addEventListener('change', (e) => {
      rule.enabled = (e.target as HTMLInputElement).checked;
    });

    // Event select
    const eventSelect = ruleElement.querySelector('.event-select') as HTMLSelectElement;
    eventSelect.addEventListener('change', (e) => {
      rule.event = (e.target as HTMLSelectElement).value;
    });

    // Condition input
    const conditionInput = ruleElement.querySelector('.condition-input') as HTMLInputElement;
    conditionInput.addEventListener('input', (e) => {
      rule.condition = (e.target as HTMLInputElement).value;
    });

    // Action select
    const actionSelect = ruleElement.querySelector('.action-select') as HTMLSelectElement;
    actionSelect.addEventListener('change', (e) => {
      rule.action = (e.target as HTMLSelectElement).value;
    });

    // Description input
    const descriptionInput = ruleElement.querySelector('.description-input') as HTMLInputElement;
    descriptionInput.addEventListener('input', (e) => {
      rule.description = (e.target as HTMLInputElement).value;
    });

    // Edit button
    const editBtn = ruleElement.querySelector('.edit-rule-btn') as HTMLButtonElement;
    editBtn.addEventListener('click', () => {
      this.editRule(rule);
    });

    // Delete button
    const deleteBtn = ruleElement.querySelector('.delete-rule-btn') as HTMLButtonElement;
    deleteBtn.addEventListener('click', () => {
      this.deleteRule(rule.id);
    });
  }

  private setupEventListeners(): void {
    // Add rule button
    const addRuleBtn = this.container.querySelector('#addRuleBtn') as HTMLButtonElement;
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        this.addRule();
      });
    }
  }

  public addRule(): void {
    const newRule: EcaRule = {
      id: `rule_${this.nextId++}`,
      event: 'onEnterRoom',
      condition: '',
      action: 'showMessage',
      enabled: true,
      description: ''
    };

    this.rules.push(newRule);
    this.render();
  }

  public deleteRule(ruleId: string): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.rules = this.rules.filter(rule => rule.id !== ruleId);
      this.render();
    }
  }

  public editRule(rule: EcaRule): void {
    // Create a modal for editing the rule
    const modal = document.createElement('div');
    modal.className = 'rule-edit-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Edit Rule</h3>
        <div class="form-group">
          <label>Event:</label>
          <select id="editEvent">
            ${this.eventTypes.map(event => 
              `<option value="${event.name}" ${rule.event === event.name ? 'selected' : ''}>${event.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Condition:</label>
          <textarea id="editCondition" placeholder="Enter condition (e.g., player.health > 50)">${rule.condition}</textarea>
        </div>
        <div class="form-group">
          <label>Action:</label>
          <select id="editAction">
            ${this.actionTypes.map(action => 
              `<option value="${action.name}" ${rule.action === action.name ? 'selected' : ''}>${action.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Description:</label>
          <input type="text" id="editDescription" value="${rule.description || ''}" placeholder="Optional description">
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="editEnabled" ${rule.enabled ? 'checked' : ''}>
            Enabled
          </label>
        </div>
        <div class="modal-actions">
          <button id="saveRule">Save</button>
          <button id="cancelEdit">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const saveBtn = modal.querySelector('#saveRule') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('#cancelEdit') as HTMLButtonElement;

    saveBtn.addEventListener('click', () => {
      rule.event = (modal.querySelector('#editEvent') as HTMLSelectElement).value;
      rule.condition = (modal.querySelector('#editCondition') as HTMLTextAreaElement).value;
      rule.action = (modal.querySelector('#editAction') as HTMLSelectElement).value;
      rule.description = (modal.querySelector('#editDescription') as HTMLInputElement).value;
      rule.enabled = (modal.querySelector('#editEnabled') as HTMLInputElement).checked;
      
      document.body.removeChild(modal);
      this.render();
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  public getRules(): EcaRule[] {
    return this.rules.map(rule => ({ ...rule }));
  }

  public exportRules(): EcaRule[] {
    return this.rules.map(rule => ({ ...rule }));
  }

  public loadRules(rules: EcaRule[]): void {
    this.rules = rules.map(rule => ({ ...rule }));
    this.render();
  }

  public addEventType(eventType: EventType): void {
    this.eventTypes.push(eventType);
    this.render();
  }

  public addActionType(actionType: ActionType): void {
    this.actionTypes.push(actionType);
    this.render();
  }

  public getEventTypes(): EventType[] {
    return this.eventTypes.map(event => ({ ...event }));
  }

  public getActionTypes(): ActionType[] {
    return this.actionTypes.map(action => ({ ...action }));
  }

  public validateRule(rule: EcaRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.event) {
      errors.push('Event is required');
    }

    if (!rule.action) {
      errors.push('Action is required');
    }

    // Check if event exists
    if (!this.eventTypes.find(e => e.name === rule.event)) {
      errors.push(`Unknown event: ${rule.event}`);
    }

    // Check if action exists
    if (!this.actionTypes.find(a => a.name === rule.action)) {
      errors.push(`Unknown action: ${rule.action}`);
    }

    return { valid: errors.length === 0, errors };
  }

  public validateAllRules(): { valid: boolean; errors: { ruleId: string; errors: string[] }[] } {
    const results: { ruleId: string; errors: string[] }[] = [];
    let allValid = true;

    this.rules.forEach(rule => {
      const validation = this.validateRule(rule);
      if (!validation.valid) {
        results.push({ ruleId: rule.id, errors: validation.errors });
        allValid = false;
      }
    });

    return { valid: allValid, errors: results };
  }

  public clearAllRules(): void {
    this.rules = [];
    this.render();
  }

  public getRuleCount(): number {
    return this.rules.length;
  }

  public getEnabledRules(): EcaRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  public duplicateRule(ruleId: string): void {
    const original = this.rules.find(rule => rule.id === ruleId);
    if (original) {
      const duplicate: EcaRule = {
        ...original,
        id: `rule_${this.nextId++}`,
        description: `${original.description || 'Rule'} (Copy)`
      };
      this.rules.push(duplicate);
      this.render();
    }
  }

  public moveRule(ruleId: string, direction: 'up' | 'down'): void {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [this.rules[index], this.rules[index - 1]] = [this.rules[index - 1], this.rules[index]];
    } else if (direction === 'down' && index < this.rules.length - 1) {
      [this.rules[index], this.rules[index + 1]] = [this.rules[index + 1], this.rules[index]];
    }

    this.render();
  }
} 