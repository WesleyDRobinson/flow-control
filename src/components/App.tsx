import React, { useState, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    FitViewOptions,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection,
    Background,
    Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Layout } from './Layout'

export const App = () => {
    const operations = ['increment', 'decrement', 'multiply', 'divide']

    const variable1 = { label: 'N_K', value: 1 }

    const variable2 = { label: 'x', value: 0 }

    const operation = { label: 'Select Operation', current: operations[0] }

    const test = { label: 'Test', test: {} }

    const final = { label: 'Final', value: 0 }

    const adjustVar1 = { label: `adjust ${variable1.label}`, value: operations[1] }

    const adjustVar2 = { label: `adjust ${variable2.label}`, value: operations[0] }

    const initialNodes: Node[] = [
        { id: 'variable1', data: variable1, position: { x: 5, y: 5 } },
        { id: 'variable2', data: variable2, position: { x: 5, y: 100 } },
        { id: 'operation', data: operation, position: { x: 5, y: 200 } },
        { id: 'test', data: test, position: { x: 5, y: 300 } },
        { id: 'yes-outcome', data: final, position: { x: 5, y: 400 } },
        { id: 'var2-adjust', data: adjustVar2, position: { x: -200, y: 200 } },
        { id: 'var1-adjust', data: adjustVar1, position: { x: -200, y: 300 } },
    ];

    const initialEdges: Edge[] = [
        { id: 'v1-v2', source: 'variable1', target: 'variable2' },
        { id: 'v2-op', source: 'variable2', target: 'operation' },
        { id: 'opt-test', source: 'operation', target: 'test' },
        { id: 'test-yes', source: 'test', target: 'yes-outcome' },
        { id: 'test-no', source: 'test', target: 'var2-adjust' },
        { id: 'adjust-var1', source: 'var2-adjust', target: 'var1-adjust' },
        { id: 're-run', source: 'var1-adjust', target: 'operation' },
    ];

    const fitViewOptions: FitViewOptions = {
        padding: 0.2,
    };

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );
    const onConnect = useCallback(
        (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    const Flow = (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={fitViewOptions}
        >
            <Background/>
            <Controls/>
        </ReactFlow>
    );

    const JSONRenderer = (
        <div className={'vh-75 pre pb2 bg-light-gray overflow-auto'}>{JSON.stringify({ nodes, edges }, null, 2)}</div>)

    return <Layout JSONRenderer={JSONRenderer} FlowBuilder={Flow}/>
}
