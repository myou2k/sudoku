import React, { Component, HtmlHTMLAttributes } from "react";
import "./Board.css"
import axios from "axios"
import { isNull } from "util";

interface ICell {
    x: number
    y: number
    value: number | null
    isGiven: Boolean
    isHighlighted: Boolean
    isWrong: Boolean
}

class Cell implements ICell{
    x: number
    y: number
    value: number | null
    isGiven: Boolean
    isHighlighted: Boolean
    isWrong: Boolean
    constructor(x: number, y: number, value: number | null){
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
    selectedCell: Cell| null
    mistakes: number
    invalid: Boolean

}

export default class Board extends Component<{}, IState>{
    state: IState = {
        board: [[new Cell(0, 0, null)]],
        selectedCell: null,
        mistakes: 0,
        invalid: false
    }

    componentDidMount() {
        this.resetBoard()
        console.log("mounted")
        document.addEventListener('keydown', this.handleKeyPress)
    }

    getNewBoard = async () => {
        const data = await axios.get("https://cors-anywhere.herokuapp.com/http://www.cs.utep.edu/cheon/ws/sudoku/new/?size=9&level=1")
        const squares = data.data.squares
        const board: Cell[][] = []
        for (let i = 0; i < 9; i++) {
            const row = []
            for (let j = 0; j < 9; j++) {
                let cell = new Cell(j,i, null)
                row.push(cell)
            }
            board.push(row)
        }
        squares.forEach((square: any) => {
            let cell = new Cell(square.x, square.y, square.value)
            cell.isGiven = true
            board[square.y][square.x] = cell
        })
        this.setState({ board })
    }

    resetBoard = () => {
        const board = []
        for (let i = 0; i < 9; i++) {
            const row = []
            for (let j = 0; j < 9; j++) {
                let cell = new Cell(j,i, null)
                row.push(cell)
            }
            board.push(row)
        }
        this.setState({ board })
    }

    selectCell = (x: number, y: number) => {
        const board = this.state.board
        let selectedCell = this.state.selectedCell

        if(selectedCell){
            board[selectedCell.y][selectedCell.x].isHighlighted = false
            if(selectedCell.x === x && selectedCell.y === y){
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

        let { board, selectedCell } = this.state
        const value = event.key === 'Backspace' || event.key === '0' ? null : Number(event.key)

        if(selectedCell && (isNull(value) || !isNaN(value)) && !selectedCell.isGiven){
            this.enterValue(value)
        }
    }

    enterValue = (value: number | null) => {

        let { selectedCell, board } = this.state
        
        if(selectedCell){
            const { x, y } = selectedCell

            board[y][x].isHighlighted = false
            board[y][x].value = value

            this.validateBoardWithRule(board)

            selectedCell = null
            this.setState({ board, selectedCell })
        }
    }

    validateBoardWithRule = (board: Cell[][]) => {
        for(let i=0; i<9; i++){
            for(let j=0; j<9; j++){
                let cell = board[i][j]
                cell.isWrong = this.validateCellWithRule(cell) ? false : true
            }
        }
    }

    validateCellWithRule = (cell: Cell): Boolean => {

        const { board } = this.state
        const { x, y, value } = cell

        if(!value){
            return true
        }
        
        // Validate Row
        const row = new Set()
        for(let i=0; i < 9; i++){
            if(row.has(value)){
                console.log("row", i, x, value)
                return false
            }
            if(i !== x){
                row.add(board[y][i].value)
            }
        }

        // Validate Col
        const col = new Set()
        for(let i=0; i < 9; i++){
            if(col.has(value)){
                console.log("col", i, y, value)
                return false
            }
            if(i !== y){
                col.add(board[i][x].value)
            }
        }

        // Validate Square
        const sqr = new Set()
        let iStart = Math.floor(y/3) * 3
        let jStart = Math.floor(x/3) * 3
        for(let i=iStart; i<iStart + 3; i++){
            for(let j=jStart; j<jStart+3; j++){
                if(sqr.has(value)){
                    console.log("sqr", j, y,  x, value)
                    return false
                }
                if(i !== y || j !== x){
                    sqr.add(board[i][j].value)
                }
            }
        }

        return true
    }

    render() {
        const { board } = this.state
        return (
            <div className="container text-center">
                <h1>Mistakes: {this.state.mistakes} </h1>
                <table className="board">
                    <tbody>
                        {board.map((row, rindex) => {
                            return <tr key={rindex} className="row">
                                {row.map((cell, cindex) => {
                                    return <td key={rindex * 9 + cindex} className={
                                        "cell" + 
                                        (this.state.board[rindex][cindex].isHighlighted ? " highlight": "") +
                                        (this.state.board[rindex][cindex].isWrong ? " wrong": "") + 
                                        (this.state.board[rindex][cindex].isGiven ? "": " not-given")
                                    } onClick={() => this.selectCell(cindex, rindex)}> {cell.value}</td>
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
                <div className="btn-group mt-3" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-secondary">Solve</button>
                    <button type="button" className="btn btn-secondary">Submit</button>
                    <button type="button" className="btn btn-secondary" onClick={this.getNewBoard}>New</button>
                </div>
            </div>
        )
    }
}
