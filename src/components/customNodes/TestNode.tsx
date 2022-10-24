import React, { useCallback, memo } from 'react';
import { Handle, Position } from 'reactflow';

export interface TestNodeParams {
    label?: string
    topHandle?: boolean
    bottomHandle?: boolean
    onChange?: (event: any) => void
    value?: string
}

export default memo(({ data }: { data: TestNodeParams }) => {
        const onChange = useCallback((event: any) => {
            const { onChange: dataOnChange } = data
            typeof dataOnChange === 'function' && dataOnChange(event)
        }, []);

        return (
            <div className={'pa2 ba br2 b--gold bg-white-60'}>
                {<Handle type="target" position={Position.Top}/>}
                <div>
                    <label htmlFor="function-test" className={'mr2'}>{data.label || "Value: "}</label>
                    <input id="function-test"
                           name="function-test"
                           className={'tc pv2'}
                           onChange={onChange}
                           type="text"
                           placeholder={data.value}/>
                </div>
                {<Handle type="source" position={Position.Bottom}/>}
                {<Handle type="source" position={Position.Bottom}/>}
            </div>
        );
    }
)