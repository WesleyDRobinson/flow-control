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
import AdjustmentInput, { AdjustmentInputParams } from './customNodes/AdjustmentInput'
import { BasicFlow } from "./Flows/BasicFlow";

interface Operation {
    value: string
    label: string
    by?: string
    factors?: string[]
    divisor?: string
    dividend?: string
    to?: string
}

const operationOptions: Operation[] = [
    { value: "increment", label: "Increment", by: "1", },
    { value: "decrement", label: "Decrement", by: "1", },
    { value: "multiply", label: "Multiply", factors: [], },
    { value: "divide", label: "Divide", divisor: 'x', dividend: 'y', },
    { value: "add", label: "Add" },
    { value: "equals", label: "Set equal", to: "", },
]

interface DataVar {
    label: string
    value: string
}

export const App = () => {

    const [xVar, setXVar] = useState<DataVar>({
        label: 'x',
        value: '0',
    })
    const [yVar, setYVar] = useState<DataVar>({
        label: 'y',
        value: '0',
    })

    const [primaryOperation, setPrimaryOperation] = useState<Operation>(operationOptions[4])
    const [primaryOperationOutput, setPrimaryOperationOutput] = useState("")

    const [primaryTest, setPrimaryTest] = useState<DataVar>({ label: "Test", value: "output > 10" })
    const [primaryTestOutput, setPrimaryTestOutput] = useState("")

    const [xVarAdjustOperation, setAdjustXVarOperation] = useState<Operation>(operationOptions[0])
    const [xVarAdjustFactor, setAdjustXVarFactor] = useState("1")

    const [yVarAdjustOperation, setAdjustYVarOperation] = useState<Operation>(operationOptions[0])
    const [yVarAdjustFactor, setAdjustYVarFactor] = useState("2")

    const findOperation = ({ value }: { value: string }) => operationOptions.find((op: Operation) => op.value === value)
    const primaryOnChange = (event: any) => setPrimaryOperation((curr: Operation) => findOperation({ value: event.target.value }) || curr)
    const primaryOperationData = {
        label: 'Primary Operation',
        operations: operationOptions,
        currentOperation: primaryOperation,
        topHandle: true,
        bottomHandle: true,
        onChange: primaryOnChange,
    }

    const testInput = {
        ...primaryTest,
        setValue: (value: string) => setPrimaryTest((curr) => ({ ...curr, value }))
    }

    const final = { label: 'Final', value: 0 }

    const xVarAdjust = {
        label: `adjust ${xVar.label}`,
        currentOperation: xVarAdjustOperation,
        factor: xVarAdjustFactor,
    }

    const xInpAdjustut = {
        ...xVarAdjust,
        operations: operationOptions,
        variables: [xVar, yVar],
        setValue: (value: any) => setAdjustXVarOperation((curr) => ({ ...curr, value })),
        factorOnChange: (value: any) => setAdjustXVarFactor(value),
        topHandle: true,
        bottomHandle: true,
    }

    const yVarAdjust = {
        label: `adjust ${yVar.label}`,
        currentOperation: yVarAdjustOperation,
        factor: yVarAdjustFactor,
    }
    const adjustYInput = {
        ...yVarAdjust,
        operations: operationOptions,
        variables: [xVar, yVar,],
        setValue: (value: string) => setAdjustYVarOperation((curr) => ({ ...curr, value })),
        factorOnChange: (value: string) => setAdjustYVarFactor(value),
        topHandle: true,
        bottomHandle: true,
    }

    // as functions so we could create "Add Input" buttons
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
    const makeAdjustmentInput = (props: Node): Node => {
        const { id, data, position } = props
        return ({ type: 'adjustmentInput', id, data, position })
    }

    const xVarInputData = {
        ...xVar,
        bottomHandle: true,
        setValue: (value: string) => setXVar((curr) => ({ ...curr, value }))
    }
    const XInput = makeNumberInput({ id: 'xVar', data: xVarInputData, position: { x: 5, y: 5 } })

    const yVarInputData: NumberInputParams = {
        ...yVar,
        topHandle: true,
        bottomHandle: true,
        setValue: (value: string) => setYVar((curr) => ({ ...curr, value }))
    }
    const YInput = makeNumberInput({ id: 'yVar', data: yVarInputData, position: { x: 5, y: 100 } })
    const PrimaryOp = makeOperationInput({
        id: 'primaryOperation',
        data: primaryOperationData,
        position: { x: 5, y: 200 }
    })
    const TestInput = makeTestNode({ id: 'testOutput', data: testInput, position: { x: 5, y: 400 } })
    const FinalOutput = { id: 'yes-outcome', type: "output", data: final, position: { x: 5, y: 500 } }
    const XInputAdjust = makeAdjustmentInput({ id: 'xVar-adjust', data: xInpAdjustut, position: { x: -300, y: 200 } })
    const YInputAdjust = makeAdjustmentInput({ id: 'yVar-adjust', data: adjustYInput, position: { x: -300, y: 400 } })

    const initialNodes: Node[] = [
        XInput,
        YInput,
        PrimaryOp,
        TestInput,
        FinalOutput,
        XInputAdjust,
        YInputAdjust,
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

    function runPrimaryOperation({ nodes, edges }: any) {
        console.log({
            edges,
            final,
            nodes,
            primaryOperation,
            primaryOperationOutput,
            primaryTest,
            primaryTestOutput,
            xVar,
            xVarAdjust,
            yVar,
            yVarAdjust,
        })

        // Do Calculation
        let output = ''

        switch (primaryOperation.value) {
            default:
                console.log('default')
                output = ''
                break

            case 'multiply':
                output = String(+xVar.value * +yVar.value)
                console.log('multiplied', output)
                break
        }

        // set primary output
        setPrimaryOperationOutput(output)

        // check Test!
        //
        // a> print Final result

        // b>
        //      adjust x
        //      adjust y

        // recurse
    }

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const Flow = <BasicFlow nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges}/>

    const JSONRenderer = (
        <div className={'vh-75 pre pb2 bg-light-gray overflow-auto'}>{JSON.stringify({ nodes, edges }, null, 2)}</div>)

    const RunButton = (<button onClick={() => runPrimaryOperation({ nodes, edges })}>Run Operation</button>)

    return <Layout JSONRenderer={JSONRenderer} FlowBuilder={Flow} RunButton={RunButton}/>
}
