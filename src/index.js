import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => this.props.onClick()}
      >
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(square_num) {
    return (
      <Square
        value={this.props.squares[square_num]}
        onClick={()=> {this.props.onClick(this.props.board_num,square_num)}}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      history: [{
        board_restriction: null,
        boards: Array(9).fill({
          squares: Array(9).fill(null),
        }),
      }],
      xIsNext:true,
      stepNumber: 0,
    }
  }

  runAI(){
    const current_state = this.state.history[this.state.stepNumber]
    if(this.props.o_ai && !this.state.xIsNext){
      const move = this.props.o_ai(current_state)
      this.handleClick(...move)
    }
    if(this.props.x_ai && this.state.xIsNext){
      const move = this.props.x_ai(current_state)
      this.handleClick(...move)
    }
  }

  componentDidMount(){
    this.runAI()
  }

  componentDidUpdate(){
    this.runAI()
  }

  handleClick(board, square){
    if(this.state.board_restriction && this.state.board_restriction !== board) {return}
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const boards = current.boards
    const current_board = boards[board]
    const squares = current_board.squares.slice();

    if (calculateGameWinner(boards) || squares[square]) {
      return;
    }
    squares[square] = this.state.xIsNext ? 'X' : 'O';
    const next_state = boards.map((other_board,index)=>index===board ? { squares: squares } : other_board)
    this.setState({
      history: history.concat([ {
        board_restriction: square,
        boards:next_state,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  renderBoard(state, board_num) {
    const current = state.history[state.stepNumber]
    const board = current.boards[board_num];
    const highlighted = current.board_restriction === board_num
    return (
      <div className={highlighted ? "highlighted-game-board" : "game-board"}>
        <Board
          board_num = {board_num}
          squares={board.squares}
          onClick={(board, square) => this.handleClick(board, square)}
        />
      </div>
    );
  }

  render() {
    const history = this.state.history;
    const boards = history[this.state.stepNumber].boards;
    const winner = calculateGameWinner(boards)

    const moves = history.map((step, move)=> {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return(
        <li key={move}>
          <button onClick={ () => this.jumpTo(move) }>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div>
          <div className="game-row">
            {this.renderBoard(this.state, 0)}
            {this.renderBoard(this.state, 1)}
            {this.renderBoard(this.state, 2)}
          </div>
          <div className="game-row">
            {this.renderBoard(this.state, 3)}
            {this.renderBoard(this.state, 4)}
            {this.renderBoard(this.state, 5)}
          </div>
          <div className="game-row">
            {this.renderBoard(this.state, 6)}
            {this.renderBoard(this.state, 7)}
            {this.renderBoard(this.state, 8)}
          </div>
        </div>

        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game o_ai={randomAI}/>,
  document.getElementById('root')
);

function randomMove(){
  return Math.floor(Math.random()*9)
}

function randomAI(gameState){
  const boardChoice = gameState.board_restriction || randomMove()
  const boards = gameState.boards
  const current_board = boards[boardChoice]
  const squares = current_board.squares.slice();

  let squareChoice = randomMove()
  while(squares[squareChoice] !== null){
    squareChoice = randomMove()
  }

  return [
    boardChoice,
    squareChoice,
  ]
}

function calculateGameWinner(boards){
  var winner = null
  boards.forEach(function(board) {
    winner = winner || calculateBoardWinner(board.squares)
  });
  return winner
}

function calculateBoardWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
