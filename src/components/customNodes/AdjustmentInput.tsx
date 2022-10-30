import React, { useCallback, memo } from 'react';
import { Handle, Position } from 'reactflow';

interface Adjustment {
    value: string;
    label: string
}

export interface AdjustmentInputParams {
    label?: string
    operations: any[]
    currentAdjustment?: Adjustment
    onChange?: (event: any) => void
    variables?: string[]
    factorOnChange?: (event: any) => void
    onChangeSetVariableValue?: (event: any) => void
    topHandle?: boolean
    bottomHandle?: boolean
}

export default memo(({ data }: { data: AdjustmentInputParams }) => {
    const onChange = useCallback((event: any) => {
        const { onChange: dataOnChange } = data
        typeof dataOnChange === 'function' && dataOnChange(event)
    }, []);

    const changeFactor =
        useCallback((event: any) => {
            const { factorOnChange: dataFactorChange } = data
            typeof dataFactorChange === 'function' && dataFactorChange(event)
        }, []);

    const onVariableSelection = useCallback((event: any) => {
        const newVariableValue = event.target.value
        const { onChangeSetVariableValue } = data
        onChangeSetVariableValue && onChangeSetVariableValue(newVariableValue)
    }, [])

    let label
    let input

    // wip -- equals
    // if(data.currentAdjustment?.value === 'equals') {
    //     label = <label htmlFor="variable-list" className={'mr2'}>{"Variable: "}</label>
    //     input = <select id="variable-list"
    //                     name="variable-list"
    //                     className={'tc pv2'}
    //                     defaultValue={data.currentAdjustment?.value}
    //                     onChange={onVariableSelection}>
    //         {Array.isArray(data.variables) && data.variables.map((opt: any) =>
    //             <option value={opt.value} key={opt.value}>{opt.label}</option>)}
    //     </select>
    // } else {
    label = <label htmlFor="factorNumber" className={'mr2'}>{"Factor: "}</label>

    input = <input id="factorNumber"
                   name="factorNumber"
                   className={'tc pv2'}
                   onChange={changeFactor}
                   type={"number"}/>
    // }

    return (
        <div className={'pa2 ba br2 b--gold bg-white-60'}>
            {data.topHandle && <Handle type="target" position={Position.Top}/>}
            <div>
                <label htmlFor="operationSelect" className={'mr2'}>{data.label || "Adjustment: "}</label>
                <select id="operationSelect"
                        name="operationSelect"
                        className={'tc pv2'}
                        onChange={onChange}>
                    {data.operations.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            {data.factorOnChange && <div className={'mt2'}>
                {label}
                {input}
            </div>
            }

            {data.bottomHandle && <Handle type="source" position={Position.Bottom}/>}
        </div>
    )
})
