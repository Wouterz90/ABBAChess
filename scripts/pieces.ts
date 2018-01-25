// When clicked will show the possible moves
class Piece {
  readonly white: boolean
  readonly points:number
  readonly pieceName: string
  private square: Square
  private object: JQuery<HTMLElement>
  doubleMoved:number
  hasMoved:boolean = false

  constructor(white:boolean,position:{x:number,y:number}) {
    this.white = white
    this.square = gameBoard.board[position.x][position.y]
    gameBoard.board[position.x][position.y].SetPiece(this)
  }

  IsWhite() { 
    return this.white
  }
  GetSquare():Square {
    return this.square
  }

  SetSquare(x:number,y:number) {
    this.square.SetPiece(null)
    this.square = gameBoard.board[x][y]
    this.square.SetPiece(this)
  }    

  GetPosition() {
    return this.square.GetPosition()
  }

  GetPoints() {
    return this.points
  }

  GetName() { 
    return this.pieceName
  }

  GetObject() {
    return this.object
  }

  SetObject(obj:JQuery<HTMLElement>) {
    this.object = obj
  }
  GetAllowedMovement():Square[] {
    let moves:Square[] = []
    return moves
  }

  GetAllowedMovementAfterCheckingCheck():Square[] {
    let moves = this.GetAllowedMovement()
    let newMoves:Square[] =[]
    let color:"white"|"black" = this.IsWhite() ? "white" : "black"
    let otherColor:"white"|"black" = !this.IsWhite() ? "white" : "black"
    let kingColor:0|1 = this.IsWhite() ? 0:1
    let checkingPieces = gameBoard.IsPlayerChecked(this.IsWhite())[1]

    for (let i=moves.length-1;i>=0;i--) {
      let move = moves[i]
      // Store the old situation
      let oldPiece = gameBoard.board[move.GetPosition().x][move.GetPosition().y].GetPiece()
      let oldPosition = this.GetPosition()
      if (oldPiece) {
        // Find the old piece in the list
        for (let j=gameBoard.pieces[otherColor].length-1;j>= 0;j--) {
          if (oldPiece == gameBoard.pieces[otherColor][j]) {
            gameBoard.pieces[otherColor].splice(j)
          }
        }
      }
      // Create the new situation 
      this.SetSquare(move.GetPosition().x,move.GetPosition().y)
      if (this.GetName() == "King") {
        gameBoard.kings[kingColor].SetSquare(move.GetPosition().x,move.GetPosition().y)
      }
      // Test for check  
      if (!gameBoard.IsPlayerChecked(this.IsWhite())[0]) {
        newMoves.push(move)
      }

      // Restore the old situation
      if (move.GetPosition().x == 4 && move.GetPosition().y == 5) { console.log(oldPiece)}
      this.SetSquare(oldPosition.x,oldPosition.y)
      gameBoard.board[move.GetPosition().x][move.GetPosition().y].SetPiece(oldPiece)
      if (oldPiece) {
        gameBoard.pieces[otherColor].push(oldPiece)
      }
      
      // Save the kings position
      if (this.GetName() == "King") {
        gameBoard.kings[kingColor].SetSquare(oldPosition.x,oldPosition.y)
      }
    }
    return newMoves
  }

  OnPieceClicked() {
    this.GetSquare().OnSquareClicked()
  }

  OnDragged(x:number,y:number) {
    // If legel move do it, else set it back
    if (this.CanMoveToPosition({x:x,y:y},true) && this.IsWhite() == ui.whiteToMove) {
      this.MoveToPosition({x:x,y:y})
    } else {
      gameBoard.DrawAllPieces()
    }
  }
 
  CanMoveToPosition(position:{x:number,y:number},checkCheck:boolean):boolean {
    let moves = checkCheck ? this.GetAllowedMovementAfterCheckingCheck() : this.GetAllowedMovement()
    let allowed = false

    for (let tile of moves) {
      if (tile.GetPosition().x == position.x && tile.GetPosition().y == position.y) {
        allowed = true
        return true
      }
    }
    return false
  }

  MoveToPosition(position:{x:number,y:number}):void {
    if (this.CanMoveToPosition(position,true)) {
      let x = this.GetPosition().x
      let y = this.GetPosition().y

      let oldPosition = this.GetPosition()
      let oldPiece = gameBoard.board[position.x][position.y].GetPiece()
      let color = this.IsWhite() ? "White" : "Black"
      let otherColor:"white"|"black" = !this.IsWhite() ? "white" : "black"
      
      gameBoard.board[position.x][position.y].SetPiece(this)
      
      // Castling
      if (this.GetName() == "King") {
        // Short
        if (oldPosition.y == 4 && position.y == 6) {
          gameBoard.specialMove = "0-0"
          // Move the rook too
          let rook = gameBoard.board[position.x][7].GetPiece()
          if (rook) {
            rook.SetSquare(position.x,5)
          }
        // Long  
        } else if (oldPosition.y == 4 && position.y == 2) {
          gameBoard.specialMove = "0-0-0"
          // Move the rook too
          let rook = gameBoard.board[position.x][0].GetPiece()
          if (rook) {
            rook.SetSquare(position.x,3)
          }
        }
      }

      this.SetSquare(position.x,position.y)
      // Write the move  
      let beginString = "<div class='WrittenMove"+color +"'>"
      let moveString:string|null
      if (!gameBoard.specialMove) {
        moveString = this.GetName() + " " + String.fromCharCode(oldPosition.y+97) +""+ (oldPosition.x+1) + " => " + String.fromCharCode(position.y+97) + (position.x+1)
      } else if (gameBoard.specialMove == "0-0") {
        moveString = "Castling (short)"
      } else if (gameBoard.specialMove == "0-0-0") {
        moveString = "Castling (long)"
      } else {
        moveString = this.GetName() + " " + String.fromCharCode(oldPosition.y+97) +""+ (oldPosition.x+1) + " => " + String.fromCharCode(position.y+97) + (position.x+1)
      }

      let endString = "</div>"
      $('#MoveListBox').append(beginString+moveString+endString);
      
      if (oldPiece) {
        for (let i=gameBoard.pieces[otherColor].length-1;i>= 0;i--) {
          let piece = gameBoard.pieces[otherColor][i]
          if (piece == oldPiece) {
            gameBoard.pieces[otherColor].splice(i)
          }
        }
      }
      this.hasMoved = true
      ui.nextTurn()
    }
  }
}

class Bishop extends Piece {
  readonly points = 3
  readonly pieceName = "Bishop"

  GetAllowedMovement():Square[] {
    let moves:Square[] = []
    moves = this.GetAllowedMovementDirection(true,true,moves)
    moves = this.GetAllowedMovementDirection(true,false,moves)
    moves = this.GetAllowedMovementDirection(false,true,moves)
    moves = this.GetAllowedMovementDirection(false,false,moves)
    
    return moves
  }

  GetAllowedMovementDirection(increasingX:boolean,increasingY:boolean,moves:Square[]) {
    let tile = this.GetPosition()
    let i: number = increasingX ? 1 : -1
    let j: number = increasingY ? 1 : -1
    if (tile.x+i >= 0 && tile.x+i <= 7 && tile.y+j >= 0 && tile.y+j <= 7) {
      let canMoveTo = gameBoard.board[tile.x+i][tile.y+j].CanTileBePassed(this)
      while (tile.x+i >= 0 && tile.x+i <= 7 && tile.y+j >= 0 && tile.y+j <= 7 && canMoveTo != 2) {
        moves.push(gameBoard.board[tile.x+i][tile.y+j])
        if (canMoveTo == 1) {
          break
        }
        i = increasingX ? i+1 : i-1
        j = increasingY ? j+1 : j-1
        if (tile.x+i >= 0 && tile.x+i <= 7 && tile.y+j >= 0 && tile.y+j <= 7) {
          canMoveTo = gameBoard.board[tile.x+i][tile.y+j].CanTileBePassed(this)
        } else {
          break
        }
        
      }
    }
    return moves
  }

}

class Rook extends Piece {
  readonly points = 5
  readonly pieceName = "Rook"
  GetAllowedMovement():Square[] {
    let moves:Square[] = []
    moves = this.GetAllowedMovementDirection(true,true,moves)
    moves = this.GetAllowedMovementDirection(true,false,moves)
    moves = this.GetAllowedMovementDirection(false,true,moves)
    moves = this.GetAllowedMovementDirection(false,false,moves)
    
    return moves
  }

  GetAllowedMovementDirection(x:boolean,increment:boolean,moves:Square[]) {
    let tile = this.GetPosition()
    let mult = increment ? 1 : -1
    
    let direction: "x"|"y" = x ? "x" : "y"
    let i: number = x ? 1 : 0
    let j: number = x ? 0 : 1
    
    if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {

      let canMoveTo = gameBoard.board[tile.x+(i*mult)][tile.y+(j*mult)].CanTileBePassed(this)
      while (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7 && canMoveTo != 2) {
        moves.push(gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)])
        if (canMoveTo == 1) {
          break
        }
        i = x ? i + 1 : i
        j = x ? j : j + 1
        if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {
          canMoveTo = gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)].CanTileBePassed(this);
        } else {
          break
        }
        
      }
    }
    return moves
  }
}

class Queen extends Piece {
  readonly points = 9
  readonly pieceName = "Queen"
   GetAllowedMovement():Square[] {
    let moves:Square[] = []

    moves = this.GetAllowedMovementStraightDirection(true,true,moves)
    moves = this.GetAllowedMovementStraightDirection(true,false,moves)
    moves = this.GetAllowedMovementStraightDirection(false,true,moves)
    moves = this.GetAllowedMovementStraightDirection(false,false,moves)

    moves = this.GetAllowedMovementDiagonalDirection(true,true,moves)
    moves = this.GetAllowedMovementDiagonalDirection(true,false,moves)
    moves = this.GetAllowedMovementDiagonalDirection(false,true,moves)
    moves = this.GetAllowedMovementDiagonalDirection(false,false,moves)
    return moves
  }

  GetAllowedMovementStraightDirection(x:boolean,increment:boolean,moves:Square[]) {
    let tile = this.GetPosition()
    let mult = increment ? 1 : -1
    
    let direction: "x"|"y" = x ? "x" : "y"
    let i: number = x ? 1 : 0
    let j: number = x ? 0 : 1
    
    if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {

      let canMoveTo = gameBoard.board[tile.x+(i*mult)][tile.y+(j*mult)].CanTileBePassed(this)
      while (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7 && canMoveTo != 2) {
        moves.push(gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)])
        if (canMoveTo == 1) {
          break
        }
        i = x ? i + 1 : i
        j = x ? j : j + 1
        if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {
          canMoveTo = gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)].CanTileBePassed(this);
        } else {
          break
        }
        
      }
    }
    return moves
  }

  GetAllowedMovementDiagonalDirection(increasingX:boolean,increasingY:boolean,moves:Square[]) {
    let tile = this.GetPosition()
    let i: number = increasingX ? 1 : -1
    let j: number = increasingY ? 1 : -1
    if (tile.x+i >= 0 && tile.x+i <= 7 && tile.y+j >= 0 && tile.y+j <= 7) {
      let canMoveTo = gameBoard.board[tile.x+i][tile.y+j].CanTileBePassed(this)
      while (tile.x+i >= 0 && tile.x+i <= 7 && tile.y+j >= 0 && tile.y+j <= 7 && canMoveTo != 2) {
        moves.push(gameBoard.board[tile.x+i][tile.y+j])
        if (canMoveTo == 1) {
          break
        }
        i = increasingX ? i+1 : i-1
        j = increasingY ? j+1 : j-1
        if (tile.x+i >= 0 && tile.x+i <= 7 && tile.y+j >= 0 && tile.y+j <= 7) {
          canMoveTo = gameBoard.board[tile.x+i][tile.y+j].CanTileBePassed(this)
        } else {
          break
        }
        
      }
    }
    return moves
  }
}

class Knight extends Piece {
  readonly points = 3
  readonly pieceName = "Knight"

  GetAllowedMovement():Square[] {
    let moves:Square[] = []
    let patterns = [
    [-2,-1],
    [-2,1],
    [2,-1],
    [2,1],
    [-1,2],
    [-1,-2],
    [1,2],
    [1,-2],
    ]
    let tile = this.GetPosition()
    for (let i=0;i<=7;i++) {
      let a = patterns[i][0]
      let b = patterns[i][1]
      if (tile.x + a >= 0 && tile.y + b >= 0 && tile.x + a <= 7 && tile.y + b <= 7
        && gameBoard.board[tile.x+patterns[i][0]][tile.y+patterns[i][1]].CanTileBePassed(this) != 2) { 
        moves.push(gameBoard.board[tile.x+patterns[i][0]][tile.y+patterns[i][1]])
      } 
    }
    return moves
  }
}

class King extends Piece {
  readonly points = 100
  readonly pieceName = "King"
  GetAllowedMovement():Square[] {
    let moves:Square[] = []
    let tile = this.GetPosition()
    let patterns = [
    [1,1],
    [1,0],
    [1,-1],
    [0,1],
    [0,-1],
    [-1,1],
    [-1,0],
    [-1,-1],
    ]
    
    for (let i=0;i<=7;i++) {
      if (tile.x + patterns[i][0] >= 0 && tile.x + patterns[i][0] <= 7 
        && tile.y + patterns[i][1] >= 0 && tile.y + patterns[i][1] <= 7 
        && gameBoard.board[tile.x+patterns[i][0]][tile.y+patterns[i][1]].CanTileBePassed(this) != 2) { 

        moves.push(gameBoard.board[tile.x+patterns[i][0]][tile.y+patterns[i][1]])
      }
    }

    // Castling
    let number = this.white ? 0 : 7 
    if (!this.hasMoved) {
      let rook = gameBoard.board[number][0].GetPiece()
      if (rook) {
        if (!rook.hasMoved) {
        // Check if there are no pieces in between
          if (!gameBoard.board[number][1].GetPiece() && !gameBoard.board[number][2].GetPiece() && !gameBoard.board[number][3].GetPiece()) {
            // Check if the kings positions aren't attacked
            if (!gameBoard.board[number][4].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][3].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][2].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][1].CanSquareBeAttacked(this.white)[0]) {
              moves.push(gameBoard.board[number][2])
            }
          }
        }
      } 
      rook = gameBoard.board[number][7].GetPiece() || null
      if (rook) {
        if (!rook.hasMoved) {
        // Check if there are no pieces in between
          if (!gameBoard.board[number][5].GetPiece() && !gameBoard.board[number][6].GetPiece()) {
            // Check if the kings positions aren't attacked
            if (!gameBoard.board[number][4].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][5].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][6].CanSquareBeAttacked(this.white)[0]) {
              moves.push(gameBoard.board[number][6])
            }
          }
        }
      } 
    }
    return moves
  }
}

class Pawn extends Piece {
  readonly points = 1
  readonly pieceName = "Pawn"
  doubleMoved = 0
  GetAllowedMovement():Square[] {
    let moves:Square[] = []
    let tile = this.GetPosition()
    let inc = this.white ? 1 : -1

    // Check for first row movement
    if (tile.x == 1 && this.white && gameBoard.board[tile.x+1][tile.y].GetPiece() == null && gameBoard.board[tile.x+2][tile.y].GetPiece() == null) {
      moves.push(gameBoard.board[tile.x+2][tile.y])
      this.doubleMoved = ui.turn
    }
    if (tile.x == 6 && !this.white && gameBoard.board[tile.x-1][tile.y].GetPiece() == null && gameBoard.board[tile.x-2][tile.y].GetPiece() == null) {
      moves.push(gameBoard.board[tile.x-2][tile.y])
      // Register for en passant
      this.doubleMoved = ui.turn+1
    }

    // Check if it can hit something
    if (tile.y + 1 <=7 && gameBoard.board[tile.x+inc][tile.y+1].CanTileBePassed(this) == 1) { 
      moves.push(gameBoard.board[tile.x+inc][tile.y+1])
    }
    if (tile.y - 1 >=0 &&  gameBoard.board[tile.x+inc][tile.y-1].CanTileBePassed(this) == 1) {
      moves.push(gameBoard.board[tile.x+inc][tile.y-1])
    }

    // Check for en passant captures
    if (tile.y == 4 && this.white) {
      if (tile.y + 1 <=7 && gameBoard.board[tile.x][tile.y+1].GetPiece()) {
        let piece = <Piece>gameBoard.board[tile.x][tile.y+1].GetPiece()
        if (gameBoard.board[tile.x][tile.y+1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
          moves.push(gameBoard.board[tile.x+1][tile.y+1])
        }
      }
      if (tile.y - 1 >=0 && gameBoard.board[tile.x][tile.y-1].GetPiece()) {
        let piece = <Piece>gameBoard.board[tile.x][tile.y-1].GetPiece()
        if (gameBoard.board[tile.x][tile.y-1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
          moves.push(gameBoard.board[tile.x+1][tile.y-1])
        }
      }
    }
    if (tile.x == 3 && !this.white) {
      if (tile.y + 1 <=7 && gameBoard.board[tile.x][tile.y+1].GetPiece()) {
        let piece = <Piece>gameBoard.board[tile.x][tile.y+1].GetPiece()
        if (gameBoard.board[tile.x][tile.y+1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
          moves.push(gameBoard.board[tile.x+1][tile.y+1])
        }
      }
      if (tile.y - 1 >=0 && gameBoard.board[tile.x][tile.y-1].GetPiece()) {
        let piece = <Piece>gameBoard.board[tile.x][tile.y-1].GetPiece()
        if (gameBoard.board[tile.x][tile.y-1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
          moves.push(gameBoard.board[tile.x-1][tile.y-1])
        }
      }
    }
  
    // Normal move
    if (gameBoard.board[tile.x+inc][tile.y].CanTileBePassed(this) == 0) {
      moves.push(gameBoard.board[tile.x+inc][tile.y])
    }

    return moves
  }
}