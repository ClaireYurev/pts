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
    from: string;
    to: string;
}

export interface ECAGraph {
    id: string;
    name: string;
    nodes: ECANode[];
    edges: ECAEdge[];
    variables: Record<string, any>;
}

export interface NodeDefinition {
    type: 'Event' | 'Condition' | 'Action';
    kind: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    inputs: NodePort[];
    outputs: NodePort[];
    properties: PropertyField[];
}

export interface NodePort {
    id: string;
    name: string;
    type: 'flow' | 'data';
    dataType?: 'string' | 'number' | 'boolean' | 'entity' | 'position';
}

export interface PropertyField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'entity' | 'position';
    label: string;
    defaultValue: any;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}

export class VisualScriptEditor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private graph: ECAGraph | null = null;
    
    private selectedNode: ECANode | null = null;
    private draggingNode: ECANode | null = null;
    private connectingPort: { nodeId: string; portId: string } | null = null;
    private hoveredNode: ECANode | null = null;
    private hoveredPort: { nodeId: string; portId: string } | null = null;
    
    private nodeDefinitions: Map<string, NodeDefinition> = new Map();
    private isDragging: boolean = false;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private panX: number = 0;
    private panY: number = 0;
    private zoom: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        
        this.initializeNodeDefinitions();
        this.setupEventListeners();
        this.render();
    }

    private initializeNodeDefinitions(): void {
        // Event nodes
        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnStart',
            name: 'On Start',
            description: 'Triggers when the level starts',
            icon: '▶️',
            color: '#4CAF50',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: []
        });

        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnEnterRoom',
            name: 'On Enter Room',
            description: 'Triggers when player enters a room',
            icon: '🚪',
            color: '#2196F3',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'roomId', type: 'string', label: 'Room ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnPlate',
            name: 'On Pressure Plate',
            description: 'Triggers when pressure plate is activated',
            icon: '⚡',
            color: '#FF9800',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'plateId', type: 'string', label: 'Plate ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnTimer',
            name: 'On Timer',
            description: 'Triggers when timer expires',
            icon: '⏰',
            color: '#9C27B0',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'timerId', type: 'string', label: 'Timer ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnEnemyDefeated',
            name: 'On Enemy Defeated',
            description: 'Triggers when an enemy is defeated',
            icon: '💀',
            color: '#F44336',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'enemyId', type: 'string', label: 'Enemy ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnCutsceneEnd',
            name: 'On Cutscene End',
            description: 'Triggers when a cutscene ends',
            icon: '🎬',
            color: '#E91E63',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'cutsceneId', type: 'string', label: 'Cutscene ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Event',
            kind: 'OnNoclipExit',
            name: 'On Noclip Exit',
            description: 'Triggers when player exits noclip mode',
            icon: '👻',
            color: '#607D8B',
            inputs: [],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: []
        });

        // Condition nodes
        this.addNodeDefinition({
            type: 'Condition',
            kind: 'HasFlag',
            name: 'Has Flag',
            description: 'Checks if a flag is set',
            icon: '🏁',
            color: '#FFC107',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [
                { id: 'flow_true', name: 'True', type: 'flow' },
                { id: 'flow_false', name: 'False', type: 'flow' }
            ],
            properties: [
                { name: 'flagId', type: 'string', label: 'Flag ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Condition',
            kind: 'IsEntityNear',
            name: 'Is Entity Near',
            description: 'Checks if an entity is near a position',
            icon: '📍',
            color: '#00BCD4',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [
                { id: 'flow_true', name: 'True', type: 'flow' },
                { id: 'flow_false', name: 'False', type: 'flow' }
            ],
            properties: [
                { name: 'entityId', type: 'string', label: 'Entity ID', defaultValue: '' },
                { name: 'position', type: 'position', label: 'Position', defaultValue: { x: 0, y: 0 } },
                { name: 'distance', type: 'number', label: 'Distance', defaultValue: 50, min: 1, max: 500 }
            ]
        });

        this.addNodeDefinition({
            type: 'Condition',
            kind: 'TimerActive',
            name: 'Timer Active',
            description: 'Checks if a timer is currently active',
            icon: '⏱️',
            color: '#795548',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [
                { id: 'flow_true', name: 'True', type: 'flow' },
                { id: 'flow_false', name: 'False', type: 'flow' }
            ],
            properties: [
                { name: 'timerId', type: 'string', label: 'Timer ID', defaultValue: '' }
            ]
        });

        // Action nodes
        this.addNodeDefinition({
            type: 'Action',
            kind: 'openGate',
            name: 'Open Gate',
            description: 'Opens a gate',
            icon: '🚪',
            color: '#8BC34A',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'gateId', type: 'string', label: 'Gate ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'playCutscene',
            name: 'Play Cutscene',
            description: 'Plays a cutscene',
            icon: '🎬',
            color: '#E91E63',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'cutsceneId', type: 'string', label: 'Cutscene ID', defaultValue: '' }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'teleport',
            name: 'Teleport',
            description: 'Teleports an entity to a position',
            icon: '🌀',
            color: '#9C27B0',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'entityId', type: 'string', label: 'Entity ID', defaultValue: '' },
                { name: 'position', type: 'position', label: 'Position', defaultValue: { x: 0, y: 0 } }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'setFlag',
            name: 'Set Flag',
            description: 'Sets a flag',
            icon: '🏁',
            color: '#FFC107',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'flagId', type: 'string', label: 'Flag ID', defaultValue: '' },
                { name: 'value', type: 'boolean', label: 'Value', defaultValue: true }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'spawnEnemy',
            name: 'Spawn Enemy',
            description: 'Spawns an enemy at a position',
            icon: '👹',
            color: '#F44336',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'enemyType', type: 'select', label: 'Enemy Type', defaultValue: 'guard', options: ['guard', 'chopper', 'crusher'] },
                { name: 'position', type: 'position', label: 'Position', defaultValue: { x: 0, y: 0 } }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'setTimer',
            name: 'Set Timer',
            description: 'Sets a timer',
            icon: '⏰',
            color: '#9C27B0',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'timerId', type: 'string', label: 'Timer ID', defaultValue: '' },
                { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 5000, min: 100, max: 60000 }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'showText',
            name: 'Show Text',
            description: 'Shows text to the player',
            icon: '💬',
            color: '#2196F3',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'text', type: 'string', label: 'Text', defaultValue: '' },
                { name: 'duration', type: 'number', label: 'Duration (ms)', defaultValue: 3000, min: 500, max: 10000 }
            ]
        });

        this.addNodeDefinition({
            type: 'Action',
            kind: 'musicSwitch',
            name: 'Music Switch',
            description: 'Changes the background music',
            icon: '🎵',
            color: '#FF9800',
            inputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            outputs: [{ id: 'flow', name: 'Flow', type: 'flow' }],
            properties: [
                { name: 'musicId', type: 'string', label: 'Music ID', defaultValue: '' },
                { name: 'fadeTime', type: 'number', label: 'Fade Time (ms)', defaultValue: 1000, min: 0, max: 5000 }
            ]
        });
    }

    private addNodeDefinition(definition: NodeDefinition): void {
        const key = `${definition.type}_${definition.kind}`;
        this.nodeDefinitions.set(key, definition);
    }

    public getNodeDefinition(type: string, kind: string): NodeDefinition | undefined {
        const key = `${type}_${kind}`;
        return this.nodeDefinitions.get(key);
    }

    public getAllNodeDefinitions(): NodeDefinition[] {
        return Array.from(this.nodeDefinitions.values());
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    }

    private handleMouseDown(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (e.button === 0) { // Left click
            const clickedNode = this.getNodeAt(x, y);
            const clickedPort = this.getPortAt(x, y);
            
            if (clickedNode) {
                this.selectedNode = clickedNode;
                this.draggingNode = clickedNode;
                this.isDragging = true;
            } else if (clickedPort && !this.connectingPort) {
                this.connectingPort = clickedPort;
            } else if (this.connectingPort && clickedPort && clickedPort.nodeId !== this.connectingPort.nodeId) {
                this.createConnection(this.connectingPort, clickedPort);
                this.connectingPort = null;
            } else {
                this.selectedNode = null;
                this.connectingPort = null;
            }
        } else if (e.button === 1) { // Middle click
            this.isDragging = true;
        }
        
        this.render();
    }

    private handleMouseMove(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        
        if (this.isDragging && this.draggingNode) {
            const deltaX = (e.clientX - this.lastMouseX) / this.zoom;
            const deltaY = (e.clientY - this.lastMouseY) / this.zoom;
            
            this.draggingNode.x += deltaX;
            this.draggingNode.y += deltaY;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        } else if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            this.panX += deltaX;
            this.panY += deltaY;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
        
        // Update hover states
        this.hoveredNode = this.getNodeAt(x, y);
        this.hoveredPort = this.getPortAt(x, y);
        
        this.render();
    }

    private handleMouseUp(e: MouseEvent): void {
        e.preventDefault();
        
        if (e.button === 0 || e.button === 1) {
            this.isDragging = false;
            this.draggingNode = null;
        }
        
        this.render();
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.25, Math.min(4, this.zoom * zoomFactor));
        
        const zoomRatio = newZoom / this.zoom;
        this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
        this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
        
        this.zoom = newZoom;
        this.render();
    }

    private handleDoubleClick(e: MouseEvent): void {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;
        
        // Open node properties dialog
        const clickedNode = this.getNodeAt(x, y);
        if (clickedNode) {
            this.openNodeProperties(clickedNode);
        }
    }

    private getNodeAt(x: number, y: number): ECANode | null {
        if (!this.graph) return null;
        
        for (let i = this.graph.nodes.length - 1; i >= 0; i--) {
            const node = this.graph.nodes[i];
            if (x >= node.x && x <= node.x + 120 && y >= node.y && y <= node.y + 80) {
                return node;
            }
        }
        
        return null;
    }

    private getPortAt(x: number, y: number): { nodeId: string; portId: string } | null {
        if (!this.graph) return null;
        
        for (const node of this.graph.nodes) {
            const definition = this.getNodeDefinition(node.type, node.kind);
            if (!definition) continue;
            
            // Check input ports
            for (const port of definition.inputs) {
                const portX = node.x + 5;
                const portY = node.y + 20 + definition.inputs.indexOf(port) * 15;
                if (Math.abs(x - portX) < 5 && Math.abs(y - portY) < 5) {
                    return { nodeId: node.id, portId: port.id };
                }
            }
            
            // Check output ports
            for (const port of definition.outputs) {
                const portX = node.x + 115;
                const portY = node.y + 20 + definition.outputs.indexOf(port) * 15;
                if (Math.abs(x - portX) < 5 && Math.abs(y - portY) < 5) {
                    return { nodeId: node.id, portId: port.id };
                }
            }
        }
        
        return null;
    }

    private createConnection(from: { nodeId: string; portId: string }, to: { nodeId: string; portId: string }): void {
        if (!this.graph) return;
        
        const edge: ECAEdge = {
            id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            from: `${from.nodeId}:${from.portId}`,
            to: `${to.nodeId}:${to.portId}`
        };
        
        this.graph.edges.push(edge);
    }

    private openNodeProperties(node: ECANode): void {
        // This would open a properties dialog
        console.log('Opening properties for node:', node.id);
    }

    public loadGraph(graph: ECAGraph): void {
        this.graph = graph;
        this.render();
    }

    public createGraph(name: string): ECAGraph {
        const graph: ECAGraph = {
            id: `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            nodes: [],
            edges: [],
            variables: {}
        };
        
        this.graph = graph;
        this.render();
        return graph;
    }

    public addNode(type: string, kind: string, x: number, y: number): ECANode | null {
        if (!this.graph) return null;
        
        const definition = this.getNodeDefinition(type, kind);
        if (!definition) return null;
        
        const node: ECANode = {
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: definition.type as 'Event' | 'Condition' | 'Action',
            kind: definition.kind,
            x: x,
            y: y,
            props: {}
        };
        
        // Set default properties
        definition.properties.forEach(prop => {
            node.props[prop.name] = prop.defaultValue;
        });
        
        this.graph.nodes.push(node);
        this.render();
        return node;
    }

    public removeNode(nodeId: string): void {
        if (!this.graph) return;
        
        this.graph.nodes = this.graph.nodes.filter(node => node.id !== nodeId);
        this.graph.edges = this.graph.edges.filter(edge => 
            !edge.from.startsWith(nodeId + ':') && !edge.to.startsWith(nodeId + ':')
        );
        
        if (this.selectedNode?.id === nodeId) {
            this.selectedNode = null;
        }
        
        this.render();
    }

    public getGraph(): ECAGraph | null {
        return this.graph;
    }

    public exportGraph(): string {
        if (!this.graph) return '';
        return JSON.stringify(this.graph, null, 2);
    }

    public importGraph(json: string): void {
        try {
            const graph = JSON.parse(json) as ECAGraph;
            this.loadGraph(graph);
        } catch (error) {
            console.error('Failed to import graph:', error);
        }
    }

    private render(): void {
        if (!this.canvas) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply zoom and pan
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw grid
        this.drawGrid();
        
        // Draw edges
        if (this.graph) {
            this.drawEdges();
        }
        
        // Draw nodes
        if (this.graph) {
            this.drawNodes();
        }
        
        // Draw connecting line
        if (this.connectingPort) {
            this.drawConnectingLine();
        }
        
        this.ctx.restore();
    }

    private drawGrid(): void {
        const gridSize = 20;
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    private drawNodes(): void {
        if (!this.graph) return;
        
        for (const node of this.graph.nodes) {
            this.drawNode(node);
        }
    }

    private drawNode(node: ECANode): void {
        const definition = this.getNodeDefinition(node.type, node.kind);
        if (!definition) return;
        
        const isSelected = this.selectedNode?.id === node.id;
        const isHovered = this.hoveredNode?.id === node.id;
        
        // Draw node background
        this.ctx.fillStyle = isSelected ? '#666' : definition.color;
        this.ctx.strokeStyle = isHovered ? '#fff' : '#333';
        this.ctx.lineWidth = isSelected ? 3 : 2;
        
        this.ctx.beginPath();
        this.ctx.roundRect(node.x, node.y, 120, 80, 8);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw node title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(definition.name, node.x + 60, node.y + 15);
        
        // Draw node icon
        this.ctx.font = '16px Arial';
        this.ctx.fillText(definition.icon, node.x + 15, node.y + 25);
        
        // Draw ports
        this.drawPorts(node, definition);
    }

    private drawPorts(node: ECANode, definition: NodeDefinition): void {
        // Draw input ports
        definition.inputs.forEach((port, index) => {
            const x = node.x + 5;
            const y = node.y + 20 + index * 15;
            
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ccc';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(port.name, x + 8, y + 3);
        });
        
        // Draw output ports
        definition.outputs.forEach((port, index) => {
            const x = node.x + 115;
            const y = node.y + 20 + index * 15;
            
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ccc';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(port.name, x - 8, y + 3);
        });
    }

    private drawEdges(): void {
        if (!this.graph) return;
        
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        
        for (const edge of this.graph.edges) {
            const [fromNodeId, fromPortId] = edge.from.split(':');
            const [toNodeId, toPortId] = edge.to.split(':');
            
            const fromNode = this.graph.nodes.find(n => n.id === fromNodeId);
            const toNode = this.graph.nodes.find(n => n.id === toNodeId);
            
            if (fromNode && toNode) {
                const fromPos = this.getPortPosition(fromNode, fromPortId, 'output');
                const toPos = this.getPortPosition(toNode, toPortId, 'input');
                
                if (fromPos && toPos) {
                    this.drawEdge(fromPos, toPos);
                }
            }
        }
    }

    private getPortPosition(node: ECANode, portId: string, type: 'input' | 'output'): { x: number; y: number } | null {
        const definition = this.getNodeDefinition(node.type, node.kind);
        if (!definition) return null;
        
        const ports = type === 'input' ? definition.inputs : definition.outputs;
        const index = ports.findIndex(p => p.id === portId);
        
        if (index === -1) return null;
        
        const x = type === 'input' ? node.x + 5 : node.x + 115;
        const y = node.y + 20 + index * 15;
        
        return { x, y };
    }

    private drawEdge(from: { x: number; y: number }, to: { x: number; y: number }): void {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    }

    private drawConnectingLine(): void {
        if (!this.connectingPort || !this.graph) return;
        
        const node = this.graph.nodes.find(n => n.id === this.connectingPort!.nodeId);
        if (!node) return;
        
        const portPos = this.getPortPosition(node, this.connectingPort.portId, 'output');
        if (!portPos) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (this.lastMouseX - rect.left - this.panX) / this.zoom;
        const mouseY = (this.lastMouseY - rect.top - this.panY) / this.zoom;
        
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(portPos.x, portPos.y);
        this.ctx.lineTo(mouseX, mouseY);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
} 