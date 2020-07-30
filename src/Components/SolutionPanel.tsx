import React, { Component } from 'react'

import './SolutionPanel.css'
import { setgroups } from 'process'

interface IStep {
    rule: string;
    value: string;
    id: string;
    position: string;
    x: number;
    y: number
}
interface IProps {
    steps: IStep[]
    renderStep: (steps: IStep[], stepId: number) => void
}

class SolutionPanel extends Component<IProps, any>{
    state = {
        selectedRow : ""
    }

    selectRow = (id:string) => {
        let { selectedRow } = this.state
        selectedRow = selectedRow === id ? "" : id
        this.setState({ selectedRow })
    }

    handleRowClick = (id: string) => {
        const { steps, renderStep } = this.props
        this.selectRow(id)
        renderStep(steps, parseInt(id))
    }

    render(){
        return (
        <div className="col panel">
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Cell</th>
                        <th scope="col">Value</th>
                        <th scope="col">Rule</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.steps.map(step => {
                        return (<tr key={step.id} onClick={() => this.handleRowClick(step.id)} className={this.state.selectedRow === step.id ? "highlight" : ""}>
                            <th scope="row">{step.id}</th>
                            <td>{step.position}</td>
                            <td>{step.value}</td>
                            <td>{step.rule}</td>
                        </tr>)
                    })}
                </tbody>
            </table>
        </div>
    )}
}

export default SolutionPanel