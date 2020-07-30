import React, { Component, HtmlHTMLAttributes } from "react";
import "./Board.css"
import axios from "axios"
import { isNull } from "util";

import SolutionPanel from './SolutionPanel'

import helper from "../helper"

interface ICell {
    x: number
    y: number
    value: number | null
    isGiven: Boolean
    isHighlighted: Boolean
    isWrong: Boolean
}

interface IProblem {
    level: string;
    original: string;
    solved: string;
    steps: IStep[];
}

interface IStep { 
    rule: string; 
    value: string; 
    id: string; 
    position: string; 
    x: number; 
    y: number 
}
class Cell implements ICell {
    x: number
    y: number
    value: number | null
    isGiven: Boolean
    isHighlighted: Boolean
    isWrong: Boolean
    constructor(x: number, y: number, value: number | null) {
        this.x = x
        this.y = y
        this.value = value
        this.isGiven = false
        this.isHighlighted = false
        this.isWrong = false
    }
}

interface IState {
    board: Array<Array<Cell>>,
    selectedCell: Cell | null
    difficulty: string
    problem?: IProblem
    displaySolutionPanel: boolean

}

export default class Board extends Component<{}, IState>{
    state: IState = {
        board: [[new Cell(0, 0, null)]],
        selectedCell: null,
        difficulty: "",
        displaySolutionPanel: false,
    }

    componentDidMount() {
        this.reset()
        document.addEventListener('keydown', this.handleKeyPress)
    }

    getNewProblem = async (e: any) => {

        const difficulty = e.target.textContent
        const problemNumber = Math.floor(Math.random() * 100) + 1   
        const data = await axios.post("/api/java/new", { difficulty, problemNumber })

        const problem = helper.parseData(data.data)
        this.setState({ problem })
    }

    reset = () => {
        
        const board = this.clearBoard()
        this.setState({ board, displaySolutionPanel: false, selectedCell: null, difficulty: "", problem: undefined})
    }

    clearBoard = () => {
        const board = []
        for (let i = 0; i < 9; i++) {
            const row = []
            for (let j = 0; j < 9; j++) {
                let cell = new Cell(j, i, null)
                row.push(cell)
            }
            board.push(row)
        }
        return board
    }

    loadBoard = ( board: Cell[][] ) => {
        const { problem } = this.state

        const original = problem ? problem.original.split("") : []
        for (let i = 0; i < original.length; i++) {
            let value = parseInt(original[i])
            if (value !== 0) {
                let y = Math.floor(i / 9)
                let x = i % 9
                board[y][x].value = value
                board[y][x].isGiven = true
            }
        }
        return board
    }

    handleClickNew = async (e: any) => {
        this.reset()
        await this.getNewProblem(e)
        let { board } = this.state
        board = this.loadBoard(board)
        this.setState({ board })
    }

    selectCell = (x: number, y: number) => {
        const board = this.state.board
        let selectedCell = this.state.selectedCell
        if (selectedCell) {
            board[selectedCell.y][selectedCell.x].isHighlighted = false
            if (selectedCell.x === x && selectedCell.y === y) {
                selectedCell = null
                this.setState({ selectedCell })
                return
            }
        }

        selectedCell = board[y][x]
        board[y][x].isHighlighted = true
        this.setState({ board, selectedCell })
    }

    handleKeyPress = (event: KeyboardEvent) => {

        let { selectedCell } = this.state
        const value = event.key === 'Backspace' || event.key === '0' ? null : Number(event.key)

        if (selectedCell && (isNull(value) || !isNaN(value)) && !selectedCell.isGiven) {
            this.enterValue(value)
        }
    }

    enterValue = (value: number | null) => {

        let { selectedCell, board } = this.state

        if (selectedCell) {
            const { x, y } = selectedCell

            board[y][x].isHighlighted = false
            board[y][x].value = value

            this.validateBoardWithRule(board)

            selectedCell = null
            this.setState({ board, selectedCell })
        }
    }

    validateBoardWithRule = (board: Cell[][]) => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = board[i][j]
                cell.isWrong = this.validateCellWithRule(cell) ? false : true
            }
        }
    }

    validateCellWithRule = (cell: Cell): Boolean => {

        const { board } = this.state
        const { x, y, value } = cell

        if (!value) {
            return true
        }

        // Validate Row
        const row = new Set()
        for (let i = 0; i < 9; i++) {
            if (row.has(value)) {
                return false
            }
            if (i !== x) {
                row.add(board[y][i].value)
            }
        }

        // Validate Col
        const col = new Set()
        for (let i = 0; i < 9; i++) {
            if (col.has(value)) {
                return false
            }
            if (i !== y) {
                col.add(board[i][x].value)
            }
        }

        // Validate Square
        const sqr = new Set()
        let iStart = Math.floor(y / 3) * 3
        let jStart = Math.floor(x / 3) * 3
        for (let i = iStart; i < iStart + 3; i++) {
            for (let j = jStart; j < jStart + 3; j++) {
                if (sqr.has(value)) {
                    return false
                }
                if (i !== y || j !== x) {
                    sqr.add(board[i][j].value)
                }
            }
        }

        return true
    }

    displaySolution = () => {
        this.setState({ displaySolutionPanel : true})
    }

    renderStep = (steps: IStep[], stepId: number) => {
        let board = this.clearBoard()
        board = this.loadBoard(board)

        console.log(stepId)

        for(let i=0; i<stepId; i++){
            const { x , y, value } = steps[i]
            board[y][x].value = parseInt(value)
        }
        
        this.setState({ board }, () => {
            this.selectCell(steps[stepId-1].x, steps[stepId-1].y)
        })
    }

    render() {
        const { board, displaySolutionPanel, problem } = this.state
        let indexToLetterMap: { [key: number]: string} = {
            0 : 'A',
            1 : 'B',
            2 : 'C',
            3 : 'D',
            4 : 'E',
            5 : 'F',
            6 : 'G',
            7 : 'H',
            8 : 'I',
        }
        return (
            <div className="container text-center">
                <div className="row">
                    {displaySolutionPanel && problem ? <SolutionPanel steps={problem.steps} renderStep={this.renderStep}/> : null}
                    <div className={this.state.displaySolutionPanel ? "col-8": "col"}>
                        <table className="board">
                            <tbody>
                                <tr className="row top-header">
                                    <td className="cell"></td>
                                    <td className="cell">1</td>
                                    <td className="cell">2</td>
                                    <td className="cell">3</td>
                                    <td className="cell">4</td>
                                    <td className="cell">5</td>
                                    <td className="cell">6</td>
                                    <td className="cell">7</td>
                                    <td className="cell">8</td>
                                    <td className="cell">9</td>
                                </tr>
                                {board.map((row, rindex) => {
                                    return <tr key={rindex} className="row">
                                        <td className="cell left-header">{indexToLetterMap[rindex]}</td>
                                        {row.map((cell, cindex) => {
                                            return <td key={rindex * 9 + cindex} className={
                                                "cell" +
                                                (this.state.board[rindex][cindex].isHighlighted ? " highlight" : "") +
                                                (this.state.board[rindex][cindex].isWrong ? " wrong" : "") +
                                                (this.state.board[rindex][cindex].isGiven ? "" : " not-given")
                                            } onClick={() => this.selectCell(cindex, rindex)}> {cell.value}</td>
                                        })}
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="btn-group my-3" role="group">
                    <button type="button" className="btn btn-secondary" onClick={this.displaySolution}>Solve</button>
                    <div className="btn-group dropright" role="group">
                        <button id="new-button" type="button" className="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">New</button>
                        <div className="dropdown-menu" aria-labelledby="difficultyDropdown" onClick={(e) => this.handleClickNew(e)}>
                            <a className="dropdown-item">1</a>
                            <a className="dropdown-item">2</a>
                            <a className="dropdown-item">3</a>
                            <a className="dropdown-item">4</a>
                            <a className="dropdown-item">5</a>
                            <a className="dropdown-item">6</a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item">Custom</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
