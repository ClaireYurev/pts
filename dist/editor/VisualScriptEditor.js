export class VisualScriptEditor {
    constructor(canvas, script) {
        this.selectedNode = null;
        this.draggingNode = null;
        this.connectingFrom = null;
        this.panOffset = { x: 0, y: 0 };
        this.zoom = 1;
        this.nodeTemplates = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.script = script || this.createEmptyScript();
        this.initializeNodeTemplates();
        this.setupEventListeners();
        this.resize();
    }
    createEmptyScript() {
        return {
            id: 'script_' + Date.now(),
            name: 'New Script',
            nodes: [],
            edges: [],
            variables: {}
        };
    }
    initializeNodeTemplates() {
        this.nodeTemplates = [
            // Event Templates
            {
                type: 'Event',
                kind: 'OnStart',
                name: 'On Start',
                description: 'Triggers when the script starts',
                color: '#4CAF50',
                inputs: [],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: {}
            },
            {
                type: 'Event',
                kind: 'OnCollision',
                name: 'On Collision',
                description: 'Triggers when entity collides with target',
                color: '#FF9800',
                inputs: [],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { targetTag: 'player' }
            },
            {
                type: 'Event',
                kind: 'OnKeyPress',
                name: 'On Key Press',
                description: 'Triggers when a key is pressed',
                color: '#2196F3',
                inputs: [],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { key: 'Space' }
            },
            {
                type: 'Event',
                kind: 'OnTimer',
                name: 'On Timer',
                description: 'Triggers at regular intervals',
                color: '#9C27B0',
                inputs: [],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { interval: 1000 }
            },
            // Condition Templates
            {
                type: 'Condition',
                kind: 'IsAlive',
                name: 'Is Alive',
                description: 'Checks if entity is alive',
                color: '#F44336',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'true', name: 'True', type: 'flow' }, { id: 'false', name: 'False', type: 'flow' }],
                defaultProps: {}
            },
            {
                type: 'Condition',
                kind: 'HasItem',
                name: 'Has Item',
                description: 'Checks if entity has an item',
                color: '#795548',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'true', name: 'True', type: 'flow' }, { id: 'false', name: 'False', type: 'flow' }],
                defaultProps: { itemId: 'key' }
            },
            {
                type: 'Condition',
                kind: 'IsOnGround',
                name: 'Is On Ground',
                description: 'Checks if entity is on ground',
                color: '#607D8B',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'true', name: 'True', type: 'flow' }, { id: 'false', name: 'False', type: 'flow' }],
                defaultProps: {}
            },
            // Action Templates
            {
                type: 'Action',
                kind: 'Move',
                name: 'Move',
                description: 'Moves the entity in a direction',
                color: '#00BCD4',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { direction: 'right', speed: 100 }
            },
            {
                type: 'Action',
                kind: 'Jump',
                name: 'Jump',
                description: 'Makes the entity jump',
                color: '#8BC34A',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { force: 300 }
            },
            {
                type: 'Action',
                kind: 'PlayAnimation',
                name: 'Play Animation',
                description: 'Plays an animation',
                color: '#E91E63',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { animation: 'idle' }
            },
            {
                type: 'Action',
                kind: 'SetVariable',
                name: 'Set Variable',
                description: 'Sets a variable value',
                color: '#FF5722',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { variable: 'score', value: 0 }
            },
            {
                type: 'Action',
                kind: 'Wait',
                name: 'Wait',
                description: 'Waits for a specified duration',
                color: '#673AB7',
                inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
                defaultProps: { duration: 1000 }
            }
        ];
    }
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('resize', this.resize.bind(this));
    }
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.render();
    }
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panOffset.x) / this.zoom;
        const y = (e.clientY - rect.top - this.panOffset.y) / this.zoom;
        if (e.button === 0) { // Left click
            const node = this.getNodeAt(x, y);
            if (node) {
                this.selectedNode = node;
                this.draggingNode = node;
            }
            else {
                this.selectedNode = null;
            }
        }
        else if (e.button === 2) { // Right click
            this.showContextMenu(e.clientX, e.clientY, x, y);
        }
    }
    onMouseMove(e) {
        if (this.draggingNode) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panOffset.x) / this.zoom;
            const y = (e.clientY - rect.top - this.panOffset.y) / this.zoom;
            this.draggingNode.x = x;
            this.draggingNode.y = y;
            this.render();
        }
    }
    onMouseUp(e) {
        this.draggingNode = null;
    }
    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.1, Math.min(3, this.zoom * delta));
        this.render();
    }
    getNodeAt(x, y) {
        for (let i = this.script.nodes.length - 1; i >= 0; i--) {
            const node = this.script.nodes[i];
            if (x >= node.x && x <= node.x + 150 && y >= node.y && y <= node.y + 80) {
                return node;
            }
        }
        return null;
    }
    showContextMenu(x, y, canvasX, canvasY) {
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.background = '#2c3e50';
        menu.style.border = '1px solid #34495e';
        menu.style.borderRadius = '4px';
        menu.style.padding = '8px 0';
        menu.style.zIndex = '1000';
        menu.style.minWidth = '200px';
        const categories = ['Event', 'Condition', 'Action'];
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.padding = '4px 16px';
            categoryDiv.style.fontWeight = 'bold';
            categoryDiv.style.color = '#ecf0f1';
            categoryDiv.style.borderBottom = '1px solid #34495e';
            categoryDiv.textContent = category;
            menu.appendChild(categoryDiv);
            const templates = this.nodeTemplates.filter(t => t.type === category);
            templates.forEach(template => {
                const item = document.createElement('div');
                item.style.padding = '8px 16px';
                item.style.color = '#bdc3c7';
                item.style.cursor = 'pointer';
                item.textContent = template.name;
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#34495e';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'transparent';
                });
                item.addEventListener('click', () => {
                    this.addNode(template, canvasX, canvasY);
                    document.body.removeChild(menu);
                });
                menu.appendChild(item);
            });
        });
        document.body.appendChild(menu);
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    addNode(template, x, y) {
        const node = {
            id: 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: template.type,
            kind: template.kind,
            x: x,
            y: y,
            props: { ...template.defaultProps }
        };
        this.script.nodes.push(node);
        this.render();
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Apply zoom and pan
        this.ctx.save();
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        this.ctx.scale(this.zoom, this.zoom);
        // Draw grid
        this.drawGrid();
        // Draw edges
        this.drawEdges();
        // Draw nodes
        this.drawNodes();
        this.ctx.restore();
    }
    drawGrid() {
        const gridSize = 20;
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }
    drawEdges() {
        this.ctx.strokeStyle = '#95a5a6';
        this.ctx.lineWidth = 2;
        for (const edge of this.script.edges) {
            const fromNode = this.script.nodes.find(n => n.id === edge.from.split(':')[0]);
            const toNode = this.script.nodes.find(n => n.id === edge.to.split(':')[0]);
            if (fromNode && toNode) {
                const fromX = fromNode.x + 150;
                const fromY = fromNode.y + 40;
                const toX = toNode.x;
                const toY = toNode.y + 40;
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(toX, toY);
                this.ctx.stroke();
                // Draw arrow
                const angle = Math.atan2(toY - fromY, toX - fromX);
                const arrowLength = 10;
                const arrowAngle = Math.PI / 6;
                this.ctx.beginPath();
                this.ctx.moveTo(toX, toY);
                this.ctx.lineTo(toX - arrowLength * Math.cos(angle - arrowAngle), toY - arrowLength * Math.sin(angle - arrowAngle));
                this.ctx.moveTo(toX, toY);
                this.ctx.lineTo(toX - arrowLength * Math.cos(angle + arrowAngle), toY - arrowLength * Math.sin(angle + arrowAngle));
                this.ctx.stroke();
            }
        }
    }
    drawNodes() {
        for (const node of this.script.nodes) {
            const template = this.nodeTemplates.find(t => t.type === node.type && t.kind === node.kind);
            if (!template)
                continue;
            const isSelected = this.selectedNode === node;
            // Draw node background
            this.ctx.fillStyle = template.color;
            this.ctx.strokeStyle = isSelected ? '#f39c12' : '#2c3e50';
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.beginPath();
            this.ctx.roundRect(node.x, node.y, 150, 80, 8);
            this.ctx.fill();
            this.ctx.stroke();
            // Draw node title
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(template.name, node.x + 75, node.y + 20);
            // Draw node description
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(template.description, node.x + 75, node.y + 35);
            // Draw input ports
            template.inputs.forEach((port, index) => {
                const portY = node.y + 50 + index * 15;
                this.ctx.fillStyle = port.type === 'flow' ? '#e74c3c' : '#3498db';
                this.ctx.beginPath();
                this.ctx.arc(node.x - 5, portY, 4, 0, Math.PI * 2);
                this.ctx.fill();
            });
            // Draw output ports
            template.outputs.forEach((port, index) => {
                const portY = node.y + 50 + index * 15;
                this.ctx.fillStyle = port.type === 'flow' ? '#e74c3c' : '#3498db';
                this.ctx.beginPath();
                this.ctx.arc(node.x + 155, portY, 4, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
    }
    getScript() {
        return this.script;
    }
    setScript(script) {
        this.script = script;
        this.render();
    }
    addEdge(fromNodeId, fromPort, toNodeId, toPort) {
        const edge = {
            id: 'edge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            from: `${fromNodeId}:${fromPort}`,
            to: `${toNodeId}:${toPort}`
        };
        this.script.edges.push(edge);
        this.render();
    }
    removeNode(nodeId) {
        this.script.nodes = this.script.nodes.filter(n => n.id !== nodeId);
        this.script.edges = this.script.edges.filter(e => !e.from.startsWith(nodeId + ':') && !e.to.startsWith(nodeId + ':'));
        if (this.selectedNode?.id === nodeId) {
            this.selectedNode = null;
        }
        this.render();
    }
    removeEdge(edgeId) {
        this.script.edges = this.script.edges.filter(e => e.id !== edgeId);
        this.render();
    }
}
//# sourceMappingURL=VisualScriptEditor.js.map