class Square {
  private white:boolean
  private x:number
  private y:number
  private piece:Piece|null
  private object:JQuery<HTMLElement>

  constructor(i:number,j:number,white:boolean) {
    this.x = i
    this.y = j
    this.white = white
  }

  GetPiece():Piece|null {
    return this.piece
  }

  SetPiece(piece:Piece|null) {
    this.piece = piece 
  }
  GetPosition():{x:number,y:number} {
    return {x:this.x,y:this.y}
  }
  GetObject():JQuery<HTMLElement> {
    return this.object
  }
  SetObject() {
    this.object = $("#"+((this.x).toString()+(this.y).toString()))
  }


  // 0 means free
  // 1 means can capture but not move further
  // 2 means blocked
  CanTileBePassed(piece:Piece):0|1|2 {
    if (!this.piece) {
      return 0
    } else if (piece.white != this.piece.white) {
      return 1
    } else {
      return 2
    }
  }

  CanSquareBeAttacked(white:boolean):[boolean,Piece[]] {
    let color:0|1 = white ? 0 : 1
    let opposingColor:"white"|"black" = !white ? "white" : "black"
    let pieces = []
    for (let piece of gameBoard.pieces[opposingColor]) {
      if (piece.CanMoveToPosition({x:this.x,y:this.y},false)) {
        pieces.push(piece)
      }
    }
    return [pieces.length > 0, pieces]
  }

  IsLegalMove(piece:Piece,newPosition:{x:number,y:number}):boolean {
    // Check if move is in the allowed moves for the piece
    let moves = piece.GetAllowedMovementAfterCheckingCheck()
    let allowed = false
    for (let tile of moves) {
      if (tile.x == newPosition.x && tile.y == newPosition.y) {
        allowed = true
      }
    }
    return allowed
  }

  DrawPiece() {
    let s = this.x.toString()+(this.y).toString()
    // Delete first
    if ("#"+s+"Img") {
      $("#"+s+"Img").remove()
    }

    if (this.piece) {
      let color = this.piece.white ? "white" : "black"
      this.piece.SetObject($('<img />', { 
        id: (this.x).toString()+(this.y).toString()+"Img",
        class: "PieceImage",
        src: "./images/" + color + "_" + this.piece.GetName() + ".png",
        alt: color + "_" + this.piece.GetName()
      }));
      this.piece.GetObject().appendTo("#"+s);
      this.piece.GetObject().draggable({
        //start:this.piece.OnPieceClicked,
      })
    } 
  }
  

  OnSquareClicked() {
    for (let square of gameBoard.highlightedSquares) {
      square.object.removeClass("Highlighted")
    }
    gameBoard.highlightedSquares = []
    if (gameBoard.selectedSquare) {
      gameBoard.selectedSquare.object.removeClass("Selected")
    }
    this.object.addClass("Selected")
    gameBoard.selectedSquare = this
    if (this.piece) {
      let moves = this.piece.GetAllowedMovementAfterCheckingCheck()
      for (let square of moves) {
        square.object.addClass("Highlighted")
        gameBoard.highlightedSquares.push(square)
      }
    }
  }

  OnPieceDropped(event:any,ui:any) {
    let id:string = ui.draggable[0].id
    let x:number = Number(id.substr(0,1))
    let y:number = Number(id.substr(1,1))
    let piece = <Piece> gameBoard.board[x][y].piece
    let s:string = event.target.id
    let newX:number = Number(s.substr(0,1))
    let newY:number = Number(s.substr(1,1))
    piece.OnDragged(newX,newY)
  }

}

// Handles the board, whose turn it, list with moves and undo button
class UI {
  states: Board[]
  turn = 0
  whiteToMove = true
  changeTurns = true
  moveList:JQuery<HTMLElement>

  constructor() {
    $("#TurnText").text("White to move")
  }

  nextTurn(): void {
    this.moveList = $("#MoveListBox")

    gameBoard.DrawAllPieces()
    gameBoard.specialMove = null

    //if (!this.whiteToMove) this.turn++
    console.log(gameBoard.IsPlayerChecked(!this.whiteToMove)[0])
    if (this.changeTurns || gameBoard.IsPlayerChecked(!this.whiteToMove)[0]) {
      this.whiteToMove = !this.whiteToMove
      this.changeTurns = false
    } else {

      this.changeTurns = true
    }
    

    // Remove all highlights
    for (let square of gameBoard.highlightedSquares) {
      square.GetObject().removeClass("Highlighted")
    }
    gameBoard.highlightedSquares = []
    for (let square of gameBoard.checkingSquares) {
      square.GetObject().removeClass("Checking")
    }
    gameBoard.checkingSquares = []

    if (gameBoard.selectedSquare) {
      gameBoard.selectedSquare.GetObject().removeClass("Selected")
    }
    // Display whose turn it is
    let color:"white"|"black" = this.whiteToMove ? "white" : "black"
    $("#TurnText").text(color +" to move")
    // Mark pieces checking the new player
    if (gameBoard.IsPlayerChecked(this.whiteToMove)[0]) {
      for (let piece of gameBoard.IsPlayerChecked(this.whiteToMove)[1]) {
        piece.GetSquare().GetObject().addClass("Checking")
        gameBoard.checkingSquares.push(piece.GetSquare())
      }
    }
    
    // Check if the next player has a possible move.
    let movesPossible = false
    for (let piece of gameBoard.pieces[color]) {
      if (piece.GetAllowedMovementAfterCheckingCheck().length > 0) {
        movesPossible = true
        break
      }
    }

    // Handle ending the game
    if (!movesPossible) {
      if (gameBoard.IsPlayerChecked(this.whiteToMove)[0]) {
        $("#TurnText").text(color +" loses")
      } else {
        $("#TurnText").text("Draw")
      }
    }
  }

}
// Handles all the squares and the pieces
class Board {
  board: Square[][] = []
  kings: King[] = []
  pieces:{white:Piece[],black:Piece[]} = {white:[],black:[]}
  highlightedSquares:Square[] = []
  checkingSquares:Square[] = []
  selectedSquare: Square
  specialMove: "0-0" | "0-0-0" | "EnPassant"| null = null
  constructor () {
    for (let i=0;i<=7;i++) {
      this.board[i] = []
      for (let j=0;j<=7;j++) {
        this.board[i][j] = new Square(i,j,(i + j) % 2 == 0)
      }
    }
  }  
  CreatePieces() {
    // White pieces
    this.pieces.white.push(new Rook(true,{x:0,y:0}))
    this.pieces.white.push(new Rook(true,{x:0,y:7}))
    this.pieces.white.push(new Knight(true,{x:0,y:6}))
    this.pieces.white.push(new Knight(true,{x:0,y:1}))
    this.pieces.white.push(new Bishop(true,{x:0,y:5}))
    this.pieces.white.push(new Bishop(true,{x:0,y:2}))
    this.pieces.white.push(new Queen(true,{x:0,y:3}))
    let king = new King(true,{x:0,y:4})
    this.pieces.white.push(king)
     this.kings[0] = king

    for (let i=0;i<=7;i++) {
      this.pieces.white.push(new Pawn(true,{x:1,y:i}))
    }

    // Black pieces
    this.pieces.black.push(new Rook(false,{x:7,y:0}))
    this.pieces.black.push(new Rook(false,{x:7,y:7}))
    this.pieces.black.push(new Knight(false,{x:7,y:6}))
    this.pieces.black.push(new Knight(false,{x:7,y:1}))
    this.pieces.black.push(new Bishop(false,{x:7,y:5}))
    this.pieces.black.push(new Bishop(false,{x:7,y:2}))
    this.pieces.black.push(new Queen(false,{x:7,y:3}))
    king = new King(false,{x:7,y:4})
    this.pieces.black.push(king)
    this.kings[1] = king

    for (let i=0;i<=7;i++) {
      this.pieces.black.push(new Pawn(false,{x:6,y:i}))
    }
  }

  IsPlayerChecked(white:boolean):[boolean,Piece[]] {
    let color:0|1 = white ? 0 : 1
    return gameBoard.kings[color].GetSquare().CanSquareBeAttacked(white)
  }

  SetObjects() {
    for (let i=0;i<=7;i++) {
      for (let j=0;j<=7;j++) {
        this.board[i][j].SetObject()
        this.board[i][j].GetObject().click(() => this.board[i][j].OnSquareClicked())
        this.board[i][j].GetObject().droppable({
          drop: this.board[i][j].OnPieceDropped,

        })
      }
    }
  }

  DrawAllPieces() {
    for (let i=0;i<=7;i++) {
      for (let j=0;j<=7;j++) {
        this.board[i][j].DrawPiece()
      }
    }
  }
}

const gameBoard = new Board()
let testBoard:Board
$( document).ready(function() {
  gameBoard.CreatePieces()
  gameBoard.DrawAllPieces()
  gameBoard.SetObjects()
  
});

const ui = new UI()




