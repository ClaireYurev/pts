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
export declare class VisualScriptEditor {
    private canvas;
    private ctx;
    private graph;
    private selectedNode;
    private draggingNode;
    private connectingPort;
    private hoveredNode;
    private hoveredPort;
    private nodeDefinitions;
    private isDragging;
    private lastMouseX;
    private lastMouseY;
    private panX;
    private panY;
    private zoom;
    constructor(canvas: HTMLCanvasElement);
    private initializeNodeDefinitions;
    private addNodeDefinition;
    getNodeDefinition(type: string, kind: string): NodeDefinition | undefined;
    getAllNodeDefinitions(): NodeDefinition[];
    private setupEventListeners;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleWheel;
    private handleDoubleClick;
    private getNodeAt;
    private getPortAt;
    private createConnection;
    private openNodeProperties;
    loadGraph(graph: ECAGraph): void;
    createGraph(name: string): ECAGraph;
    addNode(type: string, kind: string, x: number, y: number): ECANode | null;
    removeNode(nodeId: string): void;
    getGraph(): ECAGraph | null;
    exportGraph(): string;
    importGraph(json: string): void;
    private render;
    private drawGrid;
    private drawNodes;
    private drawNode;
    private drawPorts;
    private drawEdges;
    private getPortPosition;
    private drawEdge;
    private drawConnectingLine;
}
//# sourceMappingURL=VisualScriptEditor.d.ts.map