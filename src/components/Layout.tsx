import React from 'react'

interface LayoutElements {
    FlowBuilder: JSX.Element
    JSONRenderer: JSX.Element
}

export const Layout = ({ FlowBuilder, JSONRenderer }: LayoutElements): JSX.Element => (
    <div className={'avenir'}>
        <div className={'vh-100 flex justify-content'}>
            <div className={'w-20 flex flex-column justify-between bg-light-blue'}>
                <div className={'pa3'}>

                <h1 className={'ma0 fw3'}>Flow Chart Builder</h1>
                <p>by Wesley Robinson</p>
                </div>

                <div>{JSONRenderer}</div>
            </div>
            <div className={'flex-grow-1'}>{FlowBuilder}</div>
        </div>
    </div>
)