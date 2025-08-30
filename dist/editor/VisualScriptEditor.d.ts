import { ECAScript } from '../runtime/scripting/ECA';
export interface NodeTemplate {
    type: 'Event' | 'Condition' | 'Action';
    kind: string;
    name: string;
    description: string;
    color: string;
    inputs: NodePort[];
    outputs: NodePort[];
    defaultProps: Record<string, any>;
}
export interface NodePort {
    id: string;
    name: string;
    type: 'flow' | 'data';
    dataType?: string;
}
export declare class VisualScriptEditor {
    private canvas;
    private ctx;
    private script;
    private selectedNode;
    private draggingNode;
    private connectingFrom;
    private panOffset;
    private zoom;
    private nodeTemplates;
    constructor(canvas: HTMLCanvasElement, script?: ECAScript);
    private createEmptyScript;
    private initializeNodeTemplates;
    private setupEventListeners;
    private resize;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private onWheel;
    private getNodeAt;
    private showContextMenu;
    private addNode;
    render(): void;
    private drawGrid;
    private drawEdges;
    private drawNodes;
    getScript(): ECAScript;
    setScript(script: ECAScript): void;
    addEdge(fromNodeId: string, fromPort: string, toNodeId: string, toPort: string): void;
    removeNode(nodeId: string): void;
    removeEdge(edgeId: string): void;
}
//# sourceMappingURL=VisualScriptEditor.d.ts.map