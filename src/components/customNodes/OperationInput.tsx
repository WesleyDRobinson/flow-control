import React, { useCallback, memo } from 'react';
import { Handle, Position } from 'reactflow';

interface Operation {
    value: string;
    label: string
}

export interface OperationInputParams {
    label?: string
    operations: any[]
    currentOperation?: Operation
    onChange?: (event: any) => void
    runOperation?: ({ currentOperation }: { currentOperation: Operation }) => void
    variables?: string[]
    factorOnChange?: (event: any) => void
    onChangeSetVariableValue?: (event: any) => void
    topHandle?: boolean
    bottomHandle?: boolean
}

export default memo(({ data }: { data: OperationInputParams }) => {
    const onChange = useCallback((event: any) => {
        const { onChange: dataOnChange } = data
        typeof dataOnChange === 'function' && dataOnChange(event)
    }, []);

    const changeFactor =
        useCallback((event: any) => {
            const { factorOnChange: dataFactorChange } = data
            typeof dataFactorChange === 'function' && dataFactorChange(event)
        }, []);

    const onClickRun = useCallback(() => {
        const { currentOperation, runOperation } = data
        typeof runOperation === 'function' && currentOperation && runOperation({ currentOperation })
    }, [])

    const onVariableSelection = useCallback((event: any) => {
        const newVariableValue = event.target.value
        data.onChangeSetVariableValue(newVariableValue)
    }, [])

    let label
    let input

    if(data.currentOperation?.value === 'equals') {
        label = <label htmlFor="variable-list" className={'mr2'}>{"Variable: "}</label>
        input = <select id="variable-list"
                        name="variable-list"
                        className={'tc pv2'}
                        defaultValue={data.currentVariable?.value}
                        onChange={onVariableSelection}>
            {Array.isArray(data.variables) && data.variables.map((opt: any) =>
                <option value={opt.value} key={opt.value}>{opt.label}</option>)}
        </select>
    } else {
        label = <label htmlFor="factorNumber" className={'mr2'}>{"Factor: "}</label>

        input = <input id="factorNumber"
                       name="factorNumber"
                       className={'tc pv2'}
                       onChange={changeFactor}
                       type={"number"}/>
    }

    return (
        <div className={'pa2 ba br2 b--gold bg-white-60'}>
            {data.topHandle && <Handle type="target" position={Position.Top}/>}
            <div>
                <label htmlFor="operationSelect" className={'mr2'}>{data.label || "Operation: "}</label>
                <select id="operationSelect" name="operationSelect" className={'tc pv2'} onChange={onChange}                         defaultValue={data.currentOperation?.value}
                defaultValue={data.currentOperation?.value} >
                    {data.operations.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            {data.factorOnChange && <div className={'mt2'}>
                {label}
                {input}
            </div>
            }

            {data.runOperation && <div>
              <button className={'tc pv2'} onClick={onClickRun} type={"button"}>Run operation</button>
            </div>}

            {data.bottomHandle && <Handle type="source" position={Position.Bottom}/>}
        </div>
    )
}, (prev, next) => prev.data.currentOperation === next.data.currentOperation)
