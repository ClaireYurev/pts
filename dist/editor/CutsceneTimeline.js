export class CutsceneTimeline {
    constructor(container) {
        this.events = [];
        this.nextId = 1;
        this.duration = 60; // Default 60 seconds
        this.isPlaying = false;
        this.currentTime = 0;
        // Predefined cutscene actions
        this.actions = [
            {
                name: 'showMessage',
                description: 'Display a message',
                parameters: ['text', 'duration'],
                defaultValues: { text: 'Hello!', duration: 3 }
            },
            {
                name: 'moveCamera',
                description: 'Move camera to position',
                parameters: ['x', 'y', 'duration'],
                defaultValues: { x: 0, y: 0, duration: 2 }
            },
            {
                name: 'fadeIn',
                description: 'Fade in from black',
                parameters: ['duration'],
                defaultValues: { duration: 1 }
            },
            {
                name: 'fadeOut',
                description: 'Fade out to black',
                parameters: ['duration'],
                defaultValues: { duration: 1 }
            },
            {
                name: 'playSound',
                description: 'Play a sound effect',
                parameters: ['soundFile', 'volume'],
                defaultValues: { soundFile: '', volume: 1.0 }
            },
            {
                name: 'spawnEntity',
                description: 'Spawn an entity',
                parameters: ['type', 'x', 'y'],
                defaultValues: { type: 'NPC', x: 0, y: 0 }
            },
            {
                name: 'teleportPlayer',
                description: 'Teleport player',
                parameters: ['x', 'y'],
                defaultValues: { x: 0, y: 0 }
            },
            {
                name: 'wait',
                description: 'Wait for specified time',
                parameters: ['duration'],
                defaultValues: { duration: 1 }
            }
        ];
        this.container = container;
        this.render();
    }
    render() {
        this.container.innerHTML = '';
        this.container.className = 'cutscene-editor';
        // Add header
        const header = document.createElement('div');
        header.className = 'cutscene-header';
        header.innerHTML = `
      <h3>Cutscene Timeline</h3>
      <div class="timeline-controls">
        <button id="playBtn" class="play-btn">▶️</button>
        <button id="pauseBtn" class="pause-btn">⏸️</button>
        <button id="stopBtn" class="stop-btn">⏹️</button>
        <span class="time-display">${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}</span>
      </div>
      <button id="addEventBtn" class="add-event-btn">+ Add Event</button>
    `;
        this.container.appendChild(header);
        // Add timeline
        const timeline = document.createElement('div');
        timeline.className = 'timeline';
        timeline.innerHTML = `
      <div class="timeline-ruler">
        ${this.createTimelineRuler()}
      </div>
      <div class="timeline-track">
        ${this.createTimelineTrack()}
      </div>
    `;
        this.container.appendChild(timeline);
        // Add events list
        const eventsList = document.createElement('div');
        eventsList.className = 'events-list';
        eventsList.innerHTML = '<h4>Events</h4>';
        this.container.appendChild(eventsList);
        // Render events
        this.events.forEach(event => {
            this.renderEvent(event, eventsList);
        });
        // Add event listeners
        this.setupEventListeners();
    }
    createTimelineRuler() {
        const ruler = [];
        for (let i = 0; i <= this.duration; i += 5) {
            ruler.push(`<div class="ruler-mark" style="left: ${(i / this.duration) * 100}%">${i}s</div>`);
        }
        return ruler.join('');
    }
    createTimelineTrack() {
        const track = [];
        this.events.forEach(event => {
            const left = (event.time / this.duration) * 100;
            track.push(`
        <div class="timeline-event" 
             data-event-id="${event.id}" 
             style="left: ${left}%"
             title="${event.action} at ${this.formatTime(event.time)}">
          <div class="event-marker"></div>
        </div>
      `);
        });
        return track.join('');
    }
    renderEvent(event, container) {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.dataset.eventId = event.id;
        eventElement.innerHTML = `
      <div class="event-header">
        <span class="event-time">${this.formatTime(event.time)}</span>
        <div class="event-actions">
          <button class="edit-event-btn" title="Edit Event">✏️</button>
          <button class="delete-event-btn" title="Delete Event">🗑️</button>
        </div>
      </div>
      <div class="event-content">
        <div class="event-action">${event.action}</div>
        <div class="event-description">${event.description || 'No description'}</div>
      </div>
    `;
        // Add event listeners
        const editBtn = eventElement.querySelector('.edit-event-btn');
        const deleteBtn = eventElement.querySelector('.delete-event-btn');
        editBtn.addEventListener('click', () => {
            this.editEvent(event);
        });
        deleteBtn.addEventListener('click', () => {
            this.deleteEvent(event.id);
        });
        container.appendChild(eventElement);
    }
    setupEventListeners() {
        // Play button
        const playBtn = this.container.querySelector('#playBtn');
        playBtn.addEventListener('click', () => {
            this.play();
        });
        // Pause button
        const pauseBtn = this.container.querySelector('#pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.pause();
        });
        // Stop button
        const stopBtn = this.container.querySelector('#stopBtn');
        stopBtn.addEventListener('click', () => {
            this.stop();
        });
        // Add event button
        const addEventBtn = this.container.querySelector('#addEventBtn');
        addEventBtn.addEventListener('click', () => {
            this.addEvent();
        });
        // Timeline click to seek
        const timeline = this.container.querySelector('.timeline-track');
        timeline.addEventListener('click', (e) => {
            const rect = timeline.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            this.seekTo(percentage * this.duration);
        });
    }
    addEvent() {
        const newEvent = {
            id: `event_${this.nextId++}`,
            time: this.currentTime,
            action: 'showMessage',
            parameters: { text: 'New event!', duration: 3 },
            description: 'New cutscene event'
        };
        this.events.push(newEvent);
        this.sortEvents();
        this.render();
    }
    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(event => event.id !== eventId);
            this.render();
        }
    }
    editEvent(event) {
        const action = this.actions.find(a => a.name === event.action);
        if (!action)
            return;
        // Create modal for editing
        const modal = document.createElement('div');
        modal.className = 'event-edit-modal';
        modal.innerHTML = `
      <div class="modal-content">
        <h3>Edit Event</h3>
        <div class="form-group">
          <label>Time (seconds):</label>
          <input type="number" id="editTime" value="${event.time}" min="0" max="${this.duration}" step="0.1">
        </div>
        <div class="form-group">
          <label>Action:</label>
          <select id="editAction">
            ${this.actions.map(a => `<option value="${a.name}" ${event.action === a.name ? 'selected' : ''}>${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Description:</label>
          <input type="text" id="editDescription" value="${event.description || ''}" placeholder="Optional description">
        </div>
        <div id="parametersContainer">
          ${this.createParameterInputs(action, event.parameters)}
        </div>
        <div class="modal-actions">
          <button id="saveEvent">Save</button>
          <button id="cancelEdit">Cancel</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        // Add event listeners
        const saveBtn = modal.querySelector('#saveEvent');
        const cancelBtn = modal.querySelector('#cancelEdit');
        const actionSelect = modal.querySelector('#editAction');
        // Update parameters when action changes
        actionSelect.addEventListener('change', () => {
            const selectedAction = this.actions.find(a => a.name === actionSelect.value);
            if (selectedAction) {
                const paramsContainer = modal.querySelector('#parametersContainer');
                paramsContainer.innerHTML = this.createParameterInputs(selectedAction, {});
            }
        });
        saveBtn.addEventListener('click', () => {
            const time = parseFloat(modal.querySelector('#editTime').value);
            const action = modal.querySelector('#editAction').value;
            const description = modal.querySelector('#editDescription').value;
            // Collect parameters
            const parameters = {};
            const selectedAction = this.actions.find(a => a.name === action);
            if (selectedAction) {
                selectedAction.parameters.forEach(param => {
                    const input = modal.querySelector(`#param_${param}`);
                    if (input) {
                        const value = input.type === 'number' ? parseFloat(input.value) : input.value;
                        parameters[param] = value;
                    }
                });
            }
            event.time = time;
            event.action = action;
            event.description = description;
            event.parameters = parameters;
            document.body.removeChild(modal);
            this.sortEvents();
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
    createParameterInputs(action, currentParams) {
        return action.parameters.map(param => {
            const value = currentParams[param] ?? action.defaultValues[param] ?? '';
            return `
        <div class="form-group">
          <label>${param}:</label>
          <input type="text" id="param_${param}" value="${value}" placeholder="${param}">
        </div>
      `;
        }).join('');
    }
    play() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        this.playbackInterval = window.setInterval(() => {
            this.currentTime += 0.1;
            if (this.currentTime >= this.duration) {
                this.stop();
            }
            else {
                this.updateTimeDisplay();
                this.checkEvents();
            }
        }, 100);
        // Update UI
        const playBtn = this.container.querySelector('#playBtn');
        playBtn.textContent = '⏸️';
    }
    pause() {
        if (!this.isPlaying)
            return;
        this.isPlaying = false;
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = undefined;
        }
        // Update UI
        const playBtn = this.container.querySelector('#playBtn');
        playBtn.textContent = '▶️';
    }
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = undefined;
        }
        this.updateTimeDisplay();
        // Update UI
        const playBtn = this.container.querySelector('#playBtn');
        playBtn.textContent = '▶️';
    }
    seekTo(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.updateTimeDisplay();
    }
    updateTimeDisplay() {
        const timeDisplay = this.container.querySelector('.time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}`;
        }
    }
    checkEvents() {
        this.events.forEach(event => {
            if (Math.abs(event.time - this.currentTime) < 0.1) {
                this.executeEvent(event);
            }
        });
    }
    executeEvent(event) {
        console.log(`Executing event: ${event.action}`, event.parameters);
        // In a real implementation, this would execute the actual cutscene action
    }
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    sortEvents() {
        this.events.sort((a, b) => a.time - b.time);
    }
    getEvents() {
        return this.events.map(event => ({ ...event }));
    }
    exportTimeline() {
        return this.events.map(event => ({ ...event }));
    }
    loadTimeline(events) {
        this.events = events.map(event => ({ ...event }));
        this.sortEvents();
        this.render();
    }
    setDuration(duration) {
        this.duration = duration;
        this.render();
    }
    getDuration() {
        return this.duration;
    }
    clearAllEvents() {
        this.events = [];
        this.render();
    }
    getEventCount() {
        return this.events.length;
    }
    duplicateEvent(eventId) {
        const original = this.events.find(event => event.id === eventId);
        if (original) {
            const duplicate = {
                ...original,
                id: `event_${this.nextId++}`,
                time: original.time + 1,
                description: `${original.description || 'Event'} (Copy)`
            };
            this.events.push(duplicate);
            this.sortEvents();
            this.render();
        }
    }
    addAction(action) {
        this.actions.push(action);
        this.render();
    }
    getActions() {
        return this.actions.map(action => ({ ...action }));
    }
}
//# sourceMappingURL=CutsceneTimeline.js.map