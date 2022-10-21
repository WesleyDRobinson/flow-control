import React, { useCallback, memo } from 'react';
import { Handle, Position } from 'reactflow';

export interface NumberInputParams {
    label?: string
    topHandle?: boolean
    bottomHandle?: boolean
    setValue?: (value: any) => void
    value?: string
}

export default memo(({ data }: {data: NumberInputParams}) => {
    const onChange = useCallback((event: any) => {
        const { setValue } = data
        if (typeof setValue === 'function') setValue(event.target.value)
    }, []);

    return (
        <div className={'pa2 ba br2 b--gold bg-white-60'}>
            {data.topHandle && <Handle type="target" position={Position.Top}/>}
            <div>
                <label htmlFor="number" className={'mr2'}>{data.label || "Value: "}</label>
                <input id="number" name="number" className={'tc pv2'} onChange={onChange} type="number"/>
            </div>
            {data.bottomHandle && <Handle type="source" position={Position.Bottom}/>}
        </div>
    );
}, (prev, next) => prev.data.value === next.data.value)
