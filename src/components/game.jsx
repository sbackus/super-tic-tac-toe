import React from 'react'
import Board from './board'
// ========================================

class Game extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      x_ai: this.props.x_ai,
      o_ai: this.props.o_ai,
      history: [{
        xIsNext:true,
        board_restriction: null,
        boards: Array(9).fill({
          squares: Array(9).fill(null),
        }),
      }],
      stepNumber: 0,
    }
  }

  runAI(){
    const current_state = this.state.history[this.state.stepNumber]
    if(this.state.o_ai && !current_state.xIsNext){
      const move = this.state.o_ai(current_state)
      this.handleClick(...move)
    }
    if(this.state.x_ai && current_state.xIsNext){
      const move = this.state.x_ai(current_state)
      this.handleClick(...move)
    }
  }

  componentDidMount(){
    this.runAI()
  }

  componentDidUpdate(){
    if(this.state.x_ai && this.state.o_ai){ return }
    this.runAI()
  }

  handleClick(board, square){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const nextState = nextGameState(current, board, square)

    if (nextState.invalid) {return}

    this.setState((state)=>{
      return (
        {
          history: state.history.concat([nextState]),
          stepNumber: state.history.length,
        }
      )
    })
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
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

  setXAI(ai){
    this.setState({
      x_ai: ai
    })
  }

  setOAI(ai){
    this.setState({
      o_ai: ai
    })
  }

  render() {
    const history = this.state.history;
    const boards = history[this.state.stepNumber].boards;
    const winner = calculateGameWinner(boards)

    const moves = history.map((step, move)=> {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      if( this.state.x_ai && history[move].xIsNext ){return(<div> </div>)}
      if( this.state.o_ai && !history[move].xIsNext ){return(<div> </div>)}
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

    const makeNextMove = (this.state.x_ai && this.state._o_ai)
      ? <button onClick={ () => this.runAI() }>Next</button>
      : <div> </div>

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
        <div className="ai-picker">
          <div>
            <div>X AI </div>
            <button onClick={ () => this.setXAI() }>None: click to play</button>
            <button onClick={ () => this.setXAI(randomAI) }>Random: pick a move at random</button>
            <button onClick={ () => this.setXAI(alphaBetaAI) }>AlphaBeta: look ahead 5 moves</button>
          </div>
          <div>
            <div>O AI</div>
            <button onClick={ () => this.setOAI() }>None: click to play</button>
            <button onClick={ () => this.setOAI(randomAI) }>Random: pick a move at random</button>
            <button onClick={ () => this.setOAI(alphaBetaAI) }>AlphaBeta: look ahead 5 moves</button>
            {makeNextMove}
          </div>

        </div>
      </div>
    );
  }
}

function randomMove(){
  return Math.floor(Math.random()*9)
}

function alphaBeta(node, depth, alpha, beta, maximizingPlayer){
  if (depth === 0 || isTerminal(node)){
    return heuristicValue(node)
  }
  if(maximizingPlayer){
    let value = -100000
    for( let move of validMoves(node) ){
      const childNode = nextState(node, move)
      value = Math.max(value, alphaBeta(childNode, depth - 1, alpha, beta, false))
      alpha = Math.max(alpha, value)
      if (alpha >= beta) {
        break
      }
    }
    return value
  }
  else{
    let value = 100000
    for( let move of validMoves(node)){
      const childNode = nextState(node, move)
      value = Math.min(value, alphaBeta(childNode, depth - 1, alpha, beta, true))
      beta = Math.min(beta, value)
      if (alpha >= beta) {
        break
      }
    }
    return value
  }
}

function isTerminal(node){
  return node.winner || validMoves(node).length === 0
}


function heuristicValue(node){
  if(node.winner === 'X'){ return 10 }
  else if (node.winner === 'O') { return -10 }
  else { return 0 }
}

function invalidMove(current, board, square){
  const squares = current.boards[board].squares.slice();
  return (
    (current.board_restriction && current.board_restriction !== board) ||
    squares[square] ||
    current.winner ||
    square > 8 ||
    square < 0
  )
}

function nextState(current, square){
  return nextGameState(current, nextBoardChoice(current.board_restriction), square)
}

function nextGameState(current, board, square){
  const boards = current.boards
  const current_board = boards[board]
  const squares = current_board.squares.slice();

  if(invalidMove(current, board, square)) {return {invalid: true} }
  squares[square] = current.xIsNext ? 'X' : 'O';

  const nextBoardState = boards.map((other_board,index)=>index===board ? { squares: squares } : other_board)
  return {
    board_restriction: square,
    boards: nextBoardState,
    xIsNext: !current.xIsNext,
    winner: calculateGameWinner(nextBoardState)
  }
}

function validMoves(state){
  const possibleMoves = Array(9).fill().map((x,i)=>i)
  return possibleMoves.filter((i)=>!nextState(state, i).invalid)
}

function nextBoardChoice(board_restriction){
  return (board_restriction === null ? randomMove() : board_restriction)
}

function alphaBetaAI(gameState){
  const boardChoice = nextBoardChoice(gameState.board_restriction)
  const depth =  5
  const movesWithValues = validMoves(gameState).map((move)=>[move,alphaBeta(nextState(gameState, move), depth, -100000, 100000, !gameState.xIsNext)])
  const sortedMoves = movesWithValues.sort((move)=>move[1])

  //TODO: can this be done in a functional style instead of a loop?
  let bestOMove = [randomMove(), 99999999]
  for(let move of movesWithValues){
    if(move[1]<bestOMove[1]){
      bestOMove = move
    }
  }

  //TODO: can this be done in a functional style instead of a loop?
  let bestXMove = [randomMove(), -99999999]
  for(let move of movesWithValues){
    if(move[1]>bestXMove[1]){
      bestXMove = move
    }
  }

  return [
    boardChoice,
    gameState.xIsNext ? bestXMove[0] : bestOMove[0],
  ]
}

function randomAI(gameState){
  const boardChoice = nextBoardChoice(gameState.board_restriction)
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

export default Game
