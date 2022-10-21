import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
    Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Layout } from './Layout'
import NumberInput, { NumberInputParams } from './customNodes/NumberInput'
import OperationInput, { OperationInputParams } from './customNodes/OperationInput'
import TestNode, { TestNodeParams } from './customNodes/TestNode'

const nodeTypes = {
    numberInput: NumberInput,
    operationInput: OperationInput,
    testNode: TestNode,
}

interface Operation {
    value: string
    label: string
}

export const App = () => {
    const operationOptions: Operation[] = [
        { value: "increment", label: "Increment" },
        { value: "decrement", label: "Decrement" },
        { value: "multiply", label: "Multiply" },
        { value: "divide", label: "Divide" },
        { value: "add", label: "Add" },
        { value: "equals", label: "Set equal" },
    ]

    const [xVar, setXVar] = useState<NumberInputParams>({
        label: 'x',
        value: "0",
    })
    const [yVarValue, setYVar] = useState("0")

    const [primaryOperation, setPrimaryOperation] = useState<Operation>(operationOptions[4])
    const [primaryOperationOutput, setPrimaryOperationOutput] = useState("")

    const [adjustXVarOperation, setAdjustXVarOperation] = useState<Operation>(operationOptions[0])
    const [adjustXVarFactor, setAdjustXVarFactor] = useState("1")

    const [adjustYVarOperation, setAdjustYVarOperation] = useState<Operation>(operationOptions[0])
    const [adjustYVarFactor, setAdjustYVarFactor] = useState("2")

    const yVar: NumberInputParams = {
        label: 'y',
        value: yVarValue,
        topHandle: true,
        bottomHandle: true,
        setValue: (value: any) => setYVar(value)
    }

    const primaryOperationData = {
        label: 'Primary Operation',
        operations: operationOptions,
        currentOperation: primaryOperation,
        topHandle: true,
        bottomHandle: true,
        setValue: (value: any) => setPrimaryOperation(value),
        runOperation: runPrimaryOperation,
    }

    const test = { label: 'Test', test: {} }

    const final = { label: 'Final', value: 0 }

    const adjustXVar = {
        label: `adjust ${xVar.label}`,
        operations: operationOptions,
        currentOperation: adjustXVarOperation,
        variables: [xVar, yVar],
        adjustXVarFactor,
        setValue: (value: any) => setAdjustXVarOperation(value),
        factorOnChange: (value: any) => setAdjustXVarFactor(value),
        // onChangeSetVariableValue: (value: string) => (value),
        topHandle: true,
        bottomHandle: true,
    }

    const adjustYVar = {
        label: `adjust ${yVar.label}`,
        operations: operationOptions,
        currentOperation: adjustYVarOperation,
        setValue: (value: any) => setAdjustYVarOperation(value),
        adjustYVarFactor,
        factorOnChange: (value: any) => setAdjustYVarFactor(value),
        variables: [xVar, yVar,],
        onChangeSetVariableValue: (value: any) => setYVar(value),
        topHandle: true,
        bottomHandle: true,
    }

    const makeNumberInput = ({ id, data, position }: Node): Node => {
        return ({ type: 'numberInput', id, data, position })
    }
    const makeOperationInput = ({ id, data, position }: Node): Node => {
        return ({ type: 'operationInput', id, data, position })
    }
    const makeTestNode = (props: Node): Node => {
        const { id, data, position } = props
        return ({ type: 'testNode', id, data, position })
    }

    function runPrimaryOperation() {
        console.log({
            xVar,
            yVar,
            primaryOperation,
            primaryOperationOutput,
            adjustXVar,
            adjustYVar,
            test,
            final,
        })

        // Do Calculation
        let output = ''
        switch (primaryOperation.value) {
            default:
                console.log('default')
                output = ''
                break

            case 'multiply':
                output = String(+xVar.value * +yVarValue)
                break
        }

        setPrimaryOperationOutput(output)

        // check Test!
        // adjustX
        // adjustY

        // recurse
    }

    const xVarData = {
        ...xVar,
        bottomHandle: true,
        setValue: (value: any) => setXVar(value)
    }

    const initialNodes: Node[] = [
        makeNumberInput({ id: 'xVar', data: xVarData, position: { x: 5, y: 5 } }),
        makeNumberInput({ id: 'yVar', data: yVar, position: { x: 5, y: 100 } }),
        makeOperationInput({ id: 'primaryOperation', data: primaryOperationData, position: { x: 5, y: 200 } }),
        makeTestNode({ id: 'testOutput', data: test, position: { x: 5, y: 400 } }),
        { id: 'yes-outcome', type: "output", data: final, position: { x: 5, y: 500 } },
        makeOperationInput({ id: 'xVar-adjust', data: adjustYVar, position: { x: -300, y: 200 } }),
        makeOperationInput({ id: 'yVar-adjust', data: adjustXVar, position: { x: -300, y: 400 } }),
    ];

    const initialEdges: Edge[] = [
        { id: 'xVar-yVar', source: 'xVar', target: 'yVar' },
        { id: 'xVar-primaryOperation', source: 'yVar', target: 'primaryOperation' },
        { id: 'primaryOperation-test', source: 'primaryOperation', target: 'testOutput' },
        { id: 'test-yes', source: 'testOutput', target: 'yes-outcome' },
        { id: 'test-no', source: 'testOutput', target: 'xVar-adjust' },
        { id: 'adjust-yVar', source: 'xVar-adjust', target: 'yVar-adjust' },
        { id: 're-run', source: 'yVar-adjust', target: 'primaryOperation' },
    ];

    const fitViewOptions: FitViewOptions = {
        padding: 0.2,
    };

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds))
        },
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
            nodeTypes={nodeTypes}
        >
            <Background/>
            <Controls/>
        </ReactFlow>
    );

    const JSONRenderer = (
        <div className={'vh-75 pre pb2 bg-light-gray overflow-auto'}>{JSON.stringify({ nodes, edges }, null, 2)}</div>)

    return <Layout JSONRenderer={JSONRenderer} FlowBuilder={Flow}/>
}
