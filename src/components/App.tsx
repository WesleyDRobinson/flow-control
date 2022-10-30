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
    // { value: "equals", label: "Set equal", to: "", },
]
const findOperation = ({ value }: { value: string }) =>
    operationOptions.find((op: Operation) => op.value === value)

interface DataVar {
    label: string
    value: string
}

const APPLICATION_TIMEOUT_MS = 2000

export const App = () => {
    /**
     *  PRIMARY APPLICATION STATE AND ASSOCIATED METHODS
     */

        // Application State -- probably should be a state machine...
    const [isRunning, setIsRunning] = useState(false)
    const [adjusting, setAdjusting] = useState(false)

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

    const [xVar, setXVar] = useState<DataVar>({
        label: 'x',
        value: '0',
    })
    const xVarInputData = {
        ...xVar,
        bottomHandle: true,
        setValue: (value: string) => setXVar((curr) => ({ ...curr, value }))
    }
    const XInput = makeNumberInput({ id: 'xVar', data: xVarInputData, position: { x: 5, y: 5 } })

    const [yVar, setYVar] = useState<DataVar>({
        label: 'y',
        value: '0',
    })
    const yVarInputData: NumberInputParams = {
        ...yVar,
        topHandle: true,
        bottomHandle: true,
        setValue: (value: string) => setYVar((curr) => ({ ...curr, value }))
    }
    const YInput = makeNumberInput({ id: 'yVar', data: yVarInputData, position: { x: 5, y: 100 } })

    const [primaryOperation, setPrimaryOperation] = useState<Operation>(operationOptions[2])
    const [primaryOperationOutput, setPrimaryOperationOutput] = useState("")
    const primaryOnChange = (event: any) =>
        setPrimaryOperation((curr: Operation) => findOperation({ value: event.target.value }) || curr)
    const primaryOperationData = {
        label: 'Primary Operation',
        operations: operationOptions,
        currentOperation: primaryOperation,
        topHandle: true,
        bottomHandle: true,
        onChange: primaryOnChange,
    }
    const PrimaryOp = makeOperationInput({
        id: 'primaryOperation',
        data: primaryOperationData,
        position: { x: 5, y: 200 }
    })

    const [primaryTest, setPrimaryTest] = useState<DataVar>({ label: "Test", value: "output > 10" })
    const [primaryTestPassed, setPrimaryTestPassed] = useState("")
    const testInput = {
        ...primaryTest,
        setValue: (value: string) => setPrimaryTest((curr) => ({ ...curr, value }))
    }
    const TestInput = makeTestNode({ id: 'testOutput', data: testInput, position: { x: 5, y: 400 } })

    const [xVarAdjustOperation, setAdjustXVarOperation] = useState<Operation>(operationOptions[1])
    const [xVarAdjustFactor, setAdjustXVarFactor] = useState("1")
    const xVarAdjust = {
        label: `adjust ${xVar.label}`,
        currentOperation: xVarAdjustOperation,
        factor: xVarAdjustFactor,
    }
    const xVarAdjustData = {
        ...xVarAdjust,
        operations: operationOptions,
        variables: [xVar, yVar],
        setValue: (value: any) => setAdjustXVarOperation((curr) => ({ ...curr, value })),
        factorOnChange: (value: any) => setAdjustXVarFactor(value),
        topHandle: true,
        bottomHandle: true,
    }
    const XInputAdjust = makeAdjustmentInput({
        id: 'xVar-adjust', data: xVarAdjustData, position: { x: -300, y: 200 }
    })

    const [yVarAdjustOperation, setAdjustYVarOperation] = useState<Operation>(operationOptions[0])
    const [yVarAdjustFactor, setAdjustYVarFactor] = useState("2")
    const yVarAdjust = {
        label: `adjust ${yVar.label}`,
        currentOperation: yVarAdjustOperation,
        factor: yVarAdjustFactor,
    }
    const yVarAdjustData = {
        ...yVarAdjust,
        operations: operationOptions,
        variables: [xVar, yVar,],
        setValue: (value: string) => setAdjustYVarOperation((curr) => ({ ...curr, value })),
        factorOnChange: (value: string) => setAdjustYVarFactor(value),
        topHandle: true,
        bottomHandle: true,
    }
    const YInputAdjust = makeAdjustmentInput({
        id: 'yVar-adjust', data: yVarAdjustData, position: { x: -300, y: 400 }
    })

    const [finalLabel, setFinalLabel] = useState('awaiting final outcome')
    const final = { label: finalLabel, value: 0 }
    const FinalOutput = { id: 'yes-outcome', type: "output", data: final, position: { x: 5, y: 500 } }

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

    // ~2 second timeout for the app anytime it is set to Run
    useEffect(() => {
        if(isRunning) {
            console.log('starting run')
            const timer = setTimeout(() => {
                setIsRunning(false)
                setFinalLabel('calculation timed out...')
                console.log('run over')
            }, APPLICATION_TIMEOUT_MS)

            return () => clearTimeout(timer)
        }

    }, [isRunning])

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    // primary test effect
    useEffect(() => {
        if(isRunning) {
            const test = primaryTest.value
            const parts = test.split(' ')

            const [targetVar, operator, suppliedVar] = parts

            const convenienceMap: { [shortcut: string]: string } = {
                output: primaryOperationOutput,
            }

            const tV = convenienceMap[targetVar]

            const allowedOperators = [
                '==',
                '!=',
                '===',
                '!==',
                '>',
                '<',
                '>=',
                '<='
            ]

            if(tV && allowedOperators.includes(operator)) {
                const test = `${tV}${operator}${+suppliedVar}`
                const passes = eval(test)

                passes ? setPrimaryTestPassed(passes) : setAdjusting(true)
            }
        }
    }, [isRunning, primaryOperationOutput])

    // PASSED!!
    useEffect(() => {
        if(primaryTestPassed) {
            console.log('YAY!!! WE REALLY DID IT')

            setIsRunning(false)
            setFinalLabel(`You did it!\n${primaryOperationOutput} was achieved with x = ${xVar}; y = ${yVar}`)
        }
    }, [primaryTestPassed])

    // ADJUSTMENT EVALUATION HELPER
    function evaluateAdjustment({
                                    operand,
                                    operation,
                                    factor,
                                    allowedOperations = [],
                                    allowedFactors = [],
                                    setter
                                }: any) {
        let validOperation = true
        let validFactor = true

        if(Array.isArray(allowedOperations) && allowedOperations.length > 1) {
            validOperation = allowedOperations.includes(operation)
        }

        if(Array.isArray(allowedFactors) && allowedFactors.length > 1) {
            validFactor = allowedFactors.includes(factor)
        }

        let newValue = operand
        if(validOperation && validFactor) {
            switch (operation) {
                default:
                    console.log('not a valid adjustment Operation')
                    return
                case "increment":
                    newValue = String(+operand + +factor)
                    break
                case "decrement":
                    newValue = String(+operand - +factor)
                    break
                case "multiply":
                    newValue = String(+operand * +factor)
                    break
                case "divide":
                    newValue = String(+operand / +factor)
                    break
            }

            return newValue
            // setter((curr: DataVar) => ({ ...curr, value: newValue }))
        }
    }

    // ADJUSTMENTS
    useEffect(() => {
        if(adjusting) {
            console.log('adjusting')
            //adjust variables according to settings

            const newX = evaluateAdjustment({
                operand: xVar.value,
                operation: xVarAdjustOperation.value,
                factor: xVarAdjustFactor,
                // setter: setXVar
            });

            setXVar((curr: DataVar) => ({ ...curr, value: newX }))

            const newY = evaluateAdjustment({
                operand: yVar.value,
                operation: yVarAdjustOperation.value,
                factor: yVarAdjustFactor,
                // setter: setYVar
            });

            setYVar((curr: DataVar) => ({ ...curr, value: newY }))

            setAdjusting(false)
        }
    }, [adjusting])

    function runPrimaryOperation({ nodes, edges }: any) {
        setIsRunning(true)
        setFinalLabel('running 🏃')

        console.log({
            edges,
            final,
            nodes,
            primaryOperation,
            primaryOperationOutput,
            primaryTest,
            primaryTestPassed,
            xVar,
            xVarAdjust,
            yVar,
            yVarAdjust,
        })

        // Do Calculation
        let output = ''

        switch (primaryOperation.value) {
            default:
                console.log('operation not valid as primary')
                output = ''
                break

            case 'multiply':
                output = String(+xVar.value * +yVar.value)
                break

            case 'divide':
                output = String(+xVar.value / +yVar.value)
                break

            case 'add':
                output = String(+xVar.value + +yVar.value)
                break
        }

        // set primary output
        setPrimaryOperationOutput(output)

        // Test is checked when output changes

        // passes >
        // print Final result

        // fails>
        //   makeAdjustments
        //   runTest

        // recurse
    }

    const Flow = <BasicFlow nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges}/>

    const JSONRenderer = (
        <div className={'vh-75 pre pb2 bg-light-gray overflow-auto'}>
            {JSON.stringify({ nodes, edges }, null, 2)}
        </div>
    )

    const RunButton = (
        <button onClick={() => runPrimaryOperation({ nodes, edges })}>
            Run Operation
        </button>
    )

    return <Layout JSONRenderer={JSONRenderer} FlowBuilder={Flow} RunButton={RunButton}/>
}
