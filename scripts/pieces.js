"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// When clicked will show the possible moves
var Piece = /** @class */ (function () {
    function Piece(white, position) {
        this.hasMoved = false;
        this.white = white;
        this.square = gameBoard.board[position.x][position.y];
        gameBoard.board[position.x][position.y].SetPiece(this);
    }
    Piece.prototype.IsWhite = function () {
        return this.white;
    };
    Piece.prototype.GetSquare = function () {
        return this.square;
    };
    Piece.prototype.SetSquare = function (x, y) {
        this.square.SetPiece(null);
        this.square = gameBoard.board[x][y];
        this.square.SetPiece(this);
    };
    Piece.prototype.GetPosition = function () {
        return this.square.GetPosition();
    };
    Piece.prototype.GetPoints = function () {
        return this.points;
    };
    Piece.prototype.GetName = function () {
        return this.pieceName;
    };
    Piece.prototype.GetObject = function () {
        return this.object;
    };
    Piece.prototype.SetObject = function (obj) {
        this.object = obj;
    };
    Piece.prototype.GetAllowedMovement = function () {
        var moves = [];
        return moves;
    };
    Piece.prototype.GetAllowedMovementAfterCheckingCheck = function () {
        var moves = this.GetAllowedMovement();
        var newMoves = [];
        var color = this.IsWhite() ? "white" : "black";
        var otherColor = !this.IsWhite() ? "white" : "black";
        var kingColor = this.IsWhite() ? 0 : 1;
        var checkingPieces = gameBoard.IsPlayerChecked(this.IsWhite())[1];
        for (var i = moves.length - 1; i >= 0; i--) {
            var move = moves[i];
            // Store the old situation
            var oldPiece = gameBoard.board[move.GetPosition().x][move.GetPosition().y].GetPiece();
            var oldPosition = this.GetPosition();
            if (oldPiece) {
                // Find the old piece in the list
                for (var j = gameBoard.pieces[otherColor].length - 1; j >= 0; j--) {
                    if (oldPiece == gameBoard.pieces[otherColor][j]) {
                        gameBoard.pieces[otherColor].splice(j);
                    }
                }
            }
            // Create the new situation 
            this.SetSquare(move.GetPosition().x, move.GetPosition().y);
            if (this.GetName() == "King") {
                gameBoard.kings[kingColor].SetSquare(move.GetPosition().x, move.GetPosition().y);
            }
            // Test for check  
            if (!gameBoard.IsPlayerChecked(this.IsWhite())[0]) {
                newMoves.push(move);
            }
            // Restore the old situation
            if (move.GetPosition().x == 4 && move.GetPosition().y == 5) {
                console.log(oldPiece);
            }
            this.SetSquare(oldPosition.x, oldPosition.y);
            gameBoard.board[move.GetPosition().x][move.GetPosition().y].SetPiece(oldPiece);
            if (oldPiece) {
                gameBoard.pieces[otherColor].push(oldPiece);
            }
            // Save the kings position
            if (this.GetName() == "King") {
                gameBoard.kings[kingColor].SetSquare(oldPosition.x, oldPosition.y);
            }
        }
        return newMoves;
    };
    Piece.prototype.OnPieceClicked = function () {
        this.GetSquare().OnSquareClicked();
    };
    Piece.prototype.OnDragged = function (x, y) {
        // If legel move do it, else set it back
        if (this.CanMoveToPosition({ x: x, y: y }, true) && this.IsWhite() == ui.whiteToMove) {
            this.MoveToPosition({ x: x, y: y });
        }
        else {
            gameBoard.DrawAllPieces();
        }
    };
    Piece.prototype.CanMoveToPosition = function (position, checkCheck) {
        var moves = checkCheck ? this.GetAllowedMovementAfterCheckingCheck() : this.GetAllowedMovement();
        var allowed = false;
        for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
            var tile = moves_1[_i];
            if (tile.GetPosition().x == position.x && tile.GetPosition().y == position.y) {
                allowed = true;
                return true;
            }
        }
        return false;
    };
    Piece.prototype.MoveToPosition = function (position) {
        if (this.CanMoveToPosition(position, true)) {
            var x = this.GetPosition().x;
            var y = this.GetPosition().y;
            var oldPosition = this.GetPosition();
            var oldPiece = gameBoard.board[position.x][position.y].GetPiece();
            var color = this.IsWhite() ? "White" : "Black";
            var otherColor = !this.IsWhite() ? "white" : "black";
            gameBoard.board[position.x][position.y].SetPiece(this);
            // Castling
            if (this.GetName() == "King") {
                // Short
                if (oldPosition.y == 4 && position.y == 6) {
                    gameBoard.specialMove = "0-0";
                    // Move the rook too
                    var rook = gameBoard.board[position.x][7].GetPiece();
                    if (rook) {
                        rook.SetSquare(position.x, 5);
                    }
                    // Long  
                }
                else if (oldPosition.y == 4 && position.y == 2) {
                    gameBoard.specialMove = "0-0-0";
                    // Move the rook too
                    var rook = gameBoard.board[position.x][0].GetPiece();
                    if (rook) {
                        rook.SetSquare(position.x, 3);
                    }
                }
            }
            this.SetSquare(position.x, position.y);
            // Write the move  
            var beginString = "<div class='WrittenMove" + color + "'>";
            var moveString = void 0;
            if (!gameBoard.specialMove) {
                moveString = this.GetName() + " " + String.fromCharCode(oldPosition.y + 97) + "" + (oldPosition.x + 1) + " => " + String.fromCharCode(position.y + 97) + (position.x + 1);
            }
            else if (gameBoard.specialMove == "0-0") {
                moveString = "Castling (short)";
            }
            else if (gameBoard.specialMove == "0-0-0") {
                moveString = "Castling (long)";
            }
            else {
                moveString = this.GetName() + " " + String.fromCharCode(oldPosition.y + 97) + "" + (oldPosition.x + 1) + " => " + String.fromCharCode(position.y + 97) + (position.x + 1);
            }
            var endString = "</div>";
            $('#MoveListBox').append(beginString + moveString + endString);
            if (oldPiece) {
                for (var i = gameBoard.pieces[otherColor].length - 1; i >= 0; i--) {
                    var piece = gameBoard.pieces[otherColor][i];
                    if (piece == oldPiece) {
                        gameBoard.pieces[otherColor].splice(i);
                    }
                }
            }
            this.hasMoved = true;
            ui.nextTurn();
        }
    };
    return Piece;
}());
var Bishop = /** @class */ (function (_super) {
    __extends(Bishop, _super);
    function Bishop() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.points = 3;
        _this.pieceName = "Bishop";
        return _this;
    }
    Bishop.prototype.GetAllowedMovement = function () {
        var moves = [];
        moves = this.GetAllowedMovementDirection(true, true, moves);
        moves = this.GetAllowedMovementDirection(true, false, moves);
        moves = this.GetAllowedMovementDirection(false, true, moves);
        moves = this.GetAllowedMovementDirection(false, false, moves);
        return moves;
    };
    Bishop.prototype.GetAllowedMovementDirection = function (increasingX, increasingY, moves) {
        var tile = this.GetPosition();
        var i = increasingX ? 1 : -1;
        var j = increasingY ? 1 : -1;
        if (tile.x + i >= 0 && tile.x + i <= 7 && tile.y + j >= 0 && tile.y + j <= 7) {
            var canMoveTo = gameBoard.board[tile.x + i][tile.y + j].CanTileBePassed(this);
            while (tile.x + i >= 0 && tile.x + i <= 7 && tile.y + j >= 0 && tile.y + j <= 7 && canMoveTo != 2) {
                moves.push(gameBoard.board[tile.x + i][tile.y + j]);
                if (canMoveTo == 1) {
                    break;
                }
                i = increasingX ? i + 1 : i - 1;
                j = increasingY ? j + 1 : j - 1;
                if (tile.x + i >= 0 && tile.x + i <= 7 && tile.y + j >= 0 && tile.y + j <= 7) {
                    canMoveTo = gameBoard.board[tile.x + i][tile.y + j].CanTileBePassed(this);
                }
                else {
                    break;
                }
            }
        }
        return moves;
    };
    return Bishop;
}(Piece));
var Rook = /** @class */ (function (_super) {
    __extends(Rook, _super);
    function Rook() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.points = 5;
        _this.pieceName = "Rook";
        return _this;
    }
    Rook.prototype.GetAllowedMovement = function () {
        var moves = [];
        moves = this.GetAllowedMovementDirection(true, true, moves);
        moves = this.GetAllowedMovementDirection(true, false, moves);
        moves = this.GetAllowedMovementDirection(false, true, moves);
        moves = this.GetAllowedMovementDirection(false, false, moves);
        return moves;
    };
    Rook.prototype.GetAllowedMovementDirection = function (x, increment, moves) {
        var tile = this.GetPosition();
        var mult = increment ? 1 : -1;
        var direction = x ? "x" : "y";
        var i = x ? 1 : 0;
        var j = x ? 0 : 1;
        if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {
            var canMoveTo = gameBoard.board[tile.x + (i * mult)][tile.y + (j * mult)].CanTileBePassed(this);
            while (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7 && canMoveTo != 2) {
                moves.push(gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)]);
                if (canMoveTo == 1) {
                    break;
                }
                i = x ? i + 1 : i;
                j = x ? j : j + 1;
                if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {
                    canMoveTo = gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)].CanTileBePassed(this);
                }
                else {
                    break;
                }
            }
        }
        return moves;
    };
    return Rook;
}(Piece));
var Queen = /** @class */ (function (_super) {
    __extends(Queen, _super);
    function Queen() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.points = 9;
        _this.pieceName = "Queen";
        return _this;
    }
    Queen.prototype.GetAllowedMovement = function () {
        var moves = [];
        moves = this.GetAllowedMovementStraightDirection(true, true, moves);
        moves = this.GetAllowedMovementStraightDirection(true, false, moves);
        moves = this.GetAllowedMovementStraightDirection(false, true, moves);
        moves = this.GetAllowedMovementStraightDirection(false, false, moves);
        moves = this.GetAllowedMovementDiagonalDirection(true, true, moves);
        moves = this.GetAllowedMovementDiagonalDirection(true, false, moves);
        moves = this.GetAllowedMovementDiagonalDirection(false, true, moves);
        moves = this.GetAllowedMovementDiagonalDirection(false, false, moves);
        return moves;
    };
    Queen.prototype.GetAllowedMovementStraightDirection = function (x, increment, moves) {
        var tile = this.GetPosition();
        var mult = increment ? 1 : -1;
        var direction = x ? "x" : "y";
        var i = x ? 1 : 0;
        var j = x ? 0 : 1;
        if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {
            var canMoveTo = gameBoard.board[tile.x + (i * mult)][tile.y + (j * mult)].CanTileBePassed(this);
            while (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7 && canMoveTo != 2) {
                moves.push(gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)]);
                if (canMoveTo == 1) {
                    break;
                }
                i = x ? i + 1 : i;
                j = x ? j : j + 1;
                if (tile[direction] + (i * mult) + (j * mult) >= 0 && tile[direction] + (i * mult) + (j * mult) <= 7) {
                    canMoveTo = gameBoard.board[tile["x"] + (i * mult)][tile["y"] + (j * mult)].CanTileBePassed(this);
                }
                else {
                    break;
                }
            }
        }
        return moves;
    };
    Queen.prototype.GetAllowedMovementDiagonalDirection = function (increasingX, increasingY, moves) {
        var tile = this.GetPosition();
        var i = increasingX ? 1 : -1;
        var j = increasingY ? 1 : -1;
        if (tile.x + i >= 0 && tile.x + i <= 7 && tile.y + j >= 0 && tile.y + j <= 7) {
            var canMoveTo = gameBoard.board[tile.x + i][tile.y + j].CanTileBePassed(this);
            while (tile.x + i >= 0 && tile.x + i <= 7 && tile.y + j >= 0 && tile.y + j <= 7 && canMoveTo != 2) {
                moves.push(gameBoard.board[tile.x + i][tile.y + j]);
                if (canMoveTo == 1) {
                    break;
                }
                i = increasingX ? i + 1 : i - 1;
                j = increasingY ? j + 1 : j - 1;
                if (tile.x + i >= 0 && tile.x + i <= 7 && tile.y + j >= 0 && tile.y + j <= 7) {
                    canMoveTo = gameBoard.board[tile.x + i][tile.y + j].CanTileBePassed(this);
                }
                else {
                    break;
                }
            }
        }
        return moves;
    };
    return Queen;
}(Piece));
var Knight = /** @class */ (function (_super) {
    __extends(Knight, _super);
    function Knight() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.points = 3;
        _this.pieceName = "Knight";
        return _this;
    }
    Knight.prototype.GetAllowedMovement = function () {
        var moves = [];
        var patterns = [
            [-2, -1],
            [-2, 1],
            [2, -1],
            [2, 1],
            [-1, 2],
            [-1, -2],
            [1, 2],
            [1, -2],
        ];
        var tile = this.GetPosition();
        for (var i = 0; i <= 7; i++) {
            var a = patterns[i][0];
            var b = patterns[i][1];
            if (tile.x + a >= 0 && tile.y + b >= 0 && tile.x + a <= 7 && tile.y + b <= 7
                && gameBoard.board[tile.x + patterns[i][0]][tile.y + patterns[i][1]].CanTileBePassed(this) != 2) {
                moves.push(gameBoard.board[tile.x + patterns[i][0]][tile.y + patterns[i][1]]);
            }
        }
        return moves;
    };
    return Knight;
}(Piece));
var King = /** @class */ (function (_super) {
    __extends(King, _super);
    function King() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.points = 100;
        _this.pieceName = "King";
        return _this;
    }
    King.prototype.GetAllowedMovement = function () {
        var moves = [];
        var tile = this.GetPosition();
        var patterns = [
            [1, 1],
            [1, 0],
            [1, -1],
            [0, 1],
            [0, -1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
        ];
        for (var i = 0; i <= 7; i++) {
            if (tile.x + patterns[i][0] >= 0 && tile.x + patterns[i][0] <= 7
                && tile.y + patterns[i][1] >= 0 && tile.y + patterns[i][1] <= 7
                && gameBoard.board[tile.x + patterns[i][0]][tile.y + patterns[i][1]].CanTileBePassed(this) != 2) {
                moves.push(gameBoard.board[tile.x + patterns[i][0]][tile.y + patterns[i][1]]);
            }
        }
        // Castling
        var number = this.white ? 0 : 7;
        if (!this.hasMoved) {
            var rook = gameBoard.board[number][0].GetPiece();
            if (rook) {
                if (!rook.hasMoved) {
                    // Check if there are no pieces in between
                    if (!gameBoard.board[number][1].GetPiece() && !gameBoard.board[number][2].GetPiece() && !gameBoard.board[number][3].GetPiece()) {
                        // Check if the kings positions aren't attacked
                        if (!gameBoard.board[number][4].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][3].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][2].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][1].CanSquareBeAttacked(this.white)[0]) {
                            moves.push(gameBoard.board[number][2]);
                        }
                    }
                }
            }
            rook = gameBoard.board[number][7].GetPiece() || null;
            if (rook) {
                if (!rook.hasMoved) {
                    // Check if there are no pieces in between
                    if (!gameBoard.board[number][5].GetPiece() && !gameBoard.board[number][6].GetPiece()) {
                        // Check if the kings positions aren't attacked
                        if (!gameBoard.board[number][4].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][5].CanSquareBeAttacked(this.white)[0] && !gameBoard.board[number][6].CanSquareBeAttacked(this.white)[0]) {
                            moves.push(gameBoard.board[number][6]);
                        }
                    }
                }
            }
        }
        return moves;
    };
    return King;
}(Piece));
var Pawn = /** @class */ (function (_super) {
    __extends(Pawn, _super);
    function Pawn() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.points = 1;
        _this.pieceName = "Pawn";
        _this.doubleMoved = 0;
        return _this;
    }
    Pawn.prototype.GetAllowedMovement = function () {
        var moves = [];
        var tile = this.GetPosition();
        var inc = this.white ? 1 : -1;
        // Check for first row movement
        if (tile.x == 1 && this.white && gameBoard.board[tile.x + 1][tile.y].GetPiece() == null && gameBoard.board[tile.x + 2][tile.y].GetPiece() == null) {
            moves.push(gameBoard.board[tile.x + 2][tile.y]);
            this.doubleMoved = ui.turn;
        }
        if (tile.x == 6 && !this.white && gameBoard.board[tile.x - 1][tile.y].GetPiece() == null && gameBoard.board[tile.x - 2][tile.y].GetPiece() == null) {
            moves.push(gameBoard.board[tile.x - 2][tile.y]);
            // Register for en passant
            this.doubleMoved = ui.turn + 1;
        }
        // Check if it can hit something
        if (tile.y + 1 <= 7 && gameBoard.board[tile.x + inc][tile.y + 1].CanTileBePassed(this) == 1) {
            moves.push(gameBoard.board[tile.x + inc][tile.y + 1]);
        }
        if (tile.y - 1 >= 0 && gameBoard.board[tile.x + inc][tile.y - 1].CanTileBePassed(this) == 1) {
            moves.push(gameBoard.board[tile.x + inc][tile.y - 1]);
        }
        // Check for en passant captures
        if (tile.y == 4 && this.white) {
            if (tile.y + 1 <= 7 && gameBoard.board[tile.x][tile.y + 1].GetPiece()) {
                var piece = gameBoard.board[tile.x][tile.y + 1].GetPiece();
                if (gameBoard.board[tile.x][tile.y + 1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
                    moves.push(gameBoard.board[tile.x + 1][tile.y + 1]);
                }
            }
            if (tile.y - 1 >= 0 && gameBoard.board[tile.x][tile.y - 1].GetPiece()) {
                var piece = gameBoard.board[tile.x][tile.y - 1].GetPiece();
                if (gameBoard.board[tile.x][tile.y - 1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
                    moves.push(gameBoard.board[tile.x + 1][tile.y - 1]);
                }
            }
        }
        if (tile.x == 3 && !this.white) {
            if (tile.y + 1 <= 7 && gameBoard.board[tile.x][tile.y + 1].GetPiece()) {
                var piece = gameBoard.board[tile.x][tile.y + 1].GetPiece();
                if (gameBoard.board[tile.x][tile.y + 1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
                    moves.push(gameBoard.board[tile.x + 1][tile.y + 1]);
                }
            }
            if (tile.y - 1 >= 0 && gameBoard.board[tile.x][tile.y - 1].GetPiece()) {
                var piece = gameBoard.board[tile.x][tile.y - 1].GetPiece();
                if (gameBoard.board[tile.x][tile.y - 1].CanTileBePassed(this) == 1 && piece.doubleMoved == ui.turn) {
                    moves.push(gameBoard.board[tile.x - 1][tile.y - 1]);
                }
            }
        }
        // Normal move
        if (gameBoard.board[tile.x + inc][tile.y].CanTileBePassed(this) == 0) {
            moves.push(gameBoard.board[tile.x + inc][tile.y]);
        }
        return moves;
    };
    return Pawn;
}(Piece));
