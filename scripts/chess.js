"use strict";
var Square = /** @class */ (function () {
    function Square(i, j, white) {
        this.x = i;
        this.y = j;
        this.white = white;
    }
    Square.prototype.GetPiece = function () {
        return this.piece;
    };
    Square.prototype.SetPiece = function (piece) {
        this.piece = piece;
    };
    Square.prototype.GetPosition = function () {
        return { x: this.x, y: this.y };
    };
    Square.prototype.GetObject = function () {
        return this.object;
    };
    Square.prototype.SetObject = function () {
        this.object = $("#" + ((this.x).toString() + (this.y).toString()));
    };
    // 0 means free
    // 1 means can capture but not move further
    // 2 means blocked
    Square.prototype.CanTileBePassed = function (piece) {
        if (!this.piece) {
            return 0;
        }
        else if (piece.white != this.piece.white) {
            return 1;
        }
        else {
            return 2;
        }
    };
    Square.prototype.CanSquareBeAttacked = function (white) {
        var color = white ? 0 : 1;
        var opposingColor = !white ? "white" : "black";
        var pieces = [];
        for (var _i = 0, _a = gameBoard.pieces[opposingColor]; _i < _a.length; _i++) {
            var piece = _a[_i];
            if (piece.CanMoveToPosition({ x: this.x, y: this.y }, false)) {
                pieces.push(piece);
            }
        }
        return [pieces.length > 0, pieces];
    };
    Square.prototype.IsLegalMove = function (piece, newPosition) {
        // Check if move is in the allowed moves for the piece
        var moves = piece.GetAllowedMovementAfterCheckingCheck();
        var allowed = false;
        for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
            var tile = moves_1[_i];
            if (tile.x == newPosition.x && tile.y == newPosition.y) {
                allowed = true;
            }
        }
        return allowed;
    };
    Square.prototype.DrawPiece = function () {
        var s = this.x.toString() + (this.y).toString();
        // Delete first
        if ("#" + s + "Img") {
            $("#" + s + "Img").remove();
        }
        if (this.piece) {
            var color = this.piece.white ? "white" : "black";
            this.piece.SetObject($('<img />', {
                id: (this.x).toString() + (this.y).toString() + "Img",
                "class": "PieceImage",
                src: "./images/" + color + "_" + (this.piece.GetName()).toLowerCase() + ".png",
                alt: color + "_" + (this.piece.GetName()).toLowerCase()
            }));
            console.log("./images/" + color + "_" + (this.piece.GetName()).toLowerCase() + ".png");
            this.piece.GetObject().appendTo("#" + s);
            this.piece.GetObject().draggable({});
        }
    };
    Square.prototype.OnSquareClicked = function () {
        for (var _i = 0, _a = gameBoard.highlightedSquares; _i < _a.length; _i++) {
            var square = _a[_i];
            square.object.removeClass("Highlighted");
        }
        gameBoard.highlightedSquares = [];
        if (gameBoard.selectedSquare) {
            gameBoard.selectedSquare.object.removeClass("Selected");
        }
        this.object.addClass("Selected");
        gameBoard.selectedSquare = this;
        if (this.piece) {
            var moves = this.piece.GetAllowedMovementAfterCheckingCheck();
            for (var _b = 0, moves_2 = moves; _b < moves_2.length; _b++) {
                var square = moves_2[_b];
                square.object.addClass("Highlighted");
                gameBoard.highlightedSquares.push(square);
            }
        }
    };
    Square.prototype.OnPieceDropped = function (event, ui) {
        var id = ui.draggable[0].id;
        var x = Number(id.substr(0, 1));
        var y = Number(id.substr(1, 1));
        var piece = gameBoard.board[x][y].piece;
        var s = event.target.id;
        var newX = Number(s.substr(0, 1));
        var newY = Number(s.substr(1, 1));
        piece.OnDragged(newX, newY);
    };
    return Square;
}());
// Handles the board, whose turn it, list with moves and undo button
var UI = /** @class */ (function () {
    function UI() {
        this.turn = 0;
        this.whiteToMove = true;
        this.changeTurns = true;
        $("#TurnText").text("White to move");
    }
    UI.prototype.nextTurn = function () {
        this.moveList = $("#MoveListBox");
        gameBoard.DrawAllPieces();
        gameBoard.specialMove = null;
        //if (!this.whiteToMove) this.turn++
        console.log(gameBoard.IsPlayerChecked(!this.whiteToMove)[0]);
        if (this.changeTurns || gameBoard.IsPlayerChecked(!this.whiteToMove)[0]) {
            this.whiteToMove = !this.whiteToMove;
            this.changeTurns = false;
        }
        else {
            this.changeTurns = true;
        }
        // Remove all highlights
        for (var _i = 0, _a = gameBoard.highlightedSquares; _i < _a.length; _i++) {
            var square = _a[_i];
            square.GetObject().removeClass("Highlighted");
        }
        gameBoard.highlightedSquares = [];
        for (var _b = 0, _c = gameBoard.checkingSquares; _b < _c.length; _b++) {
            var square = _c[_b];
            square.GetObject().removeClass("Checking");
        }
        gameBoard.checkingSquares = [];
        if (gameBoard.selectedSquare) {
            gameBoard.selectedSquare.GetObject().removeClass("Selected");
        }
        // Display whose turn it is
        var color = this.whiteToMove ? "white" : "black";
        $("#TurnText").text(color + " to move");
        // Mark pieces checking the new player
        if (gameBoard.IsPlayerChecked(this.whiteToMove)[0]) {
            for (var _d = 0, _e = gameBoard.IsPlayerChecked(this.whiteToMove)[1]; _d < _e.length; _d++) {
                var piece = _e[_d];
                piece.GetSquare().GetObject().addClass("Checking");
                gameBoard.checkingSquares.push(piece.GetSquare());
            }
        }
        // Check if the next player has a possible move.
        var movesPossible = false;
        for (var _f = 0, _g = gameBoard.pieces[color]; _f < _g.length; _f++) {
            var piece = _g[_f];
            if (piece.GetAllowedMovementAfterCheckingCheck().length > 0) {
                movesPossible = true;
                break;
            }
        }
        // Handle ending the game
        if (!movesPossible) {
            if (gameBoard.IsPlayerChecked(this.whiteToMove)[0]) {
                $("#TurnText").text(color + " loses");
            }
            else {
                $("#TurnText").text("Draw");
            }
        }
    };
    return UI;
}());
// Handles all the squares and the pieces
var Board = /** @class */ (function () {
    function Board() {
        this.board = [];
        this.kings = [];
        this.pieces = { white: [], black: [] };
        this.highlightedSquares = [];
        this.checkingSquares = [];
        this.specialMove = null;
        for (var i = 0; i <= 7; i++) {
            this.board[i] = [];
            for (var j = 0; j <= 7; j++) {
                this.board[i][j] = new Square(i, j, (i + j) % 2 == 0);
            }
        }
    }
    Board.prototype.CreatePieces = function () {
        // White pieces
        this.pieces.white.push(new Rook(true, { x: 0, y: 0 }));
        this.pieces.white.push(new Rook(true, { x: 0, y: 7 }));
        this.pieces.white.push(new Knight(true, { x: 0, y: 6 }));
        this.pieces.white.push(new Knight(true, { x: 0, y: 1 }));
        this.pieces.white.push(new Bishop(true, { x: 0, y: 5 }));
        this.pieces.white.push(new Bishop(true, { x: 0, y: 2 }));
        this.pieces.white.push(new Queen(true, { x: 0, y: 3 }));
        var king = new King(true, { x: 0, y: 4 });
        this.pieces.white.push(king);
        this.kings[0] = king;
        for (var i = 0; i <= 7; i++) {
            this.pieces.white.push(new Pawn(true, { x: 1, y: i }));
        }
        // Black pieces
        this.pieces.black.push(new Rook(false, { x: 7, y: 0 }));
        this.pieces.black.push(new Rook(false, { x: 7, y: 7 }));
        this.pieces.black.push(new Knight(false, { x: 7, y: 6 }));
        this.pieces.black.push(new Knight(false, { x: 7, y: 1 }));
        this.pieces.black.push(new Bishop(false, { x: 7, y: 5 }));
        this.pieces.black.push(new Bishop(false, { x: 7, y: 2 }));
        this.pieces.black.push(new Queen(false, { x: 7, y: 3 }));
        king = new King(false, { x: 7, y: 4 });
        this.pieces.black.push(king);
        this.kings[1] = king;
        for (var i = 0; i <= 7; i++) {
            this.pieces.black.push(new Pawn(false, { x: 6, y: i }));
        }
    };
    Board.prototype.IsPlayerChecked = function (white) {
        var color = white ? 0 : 1;
        return gameBoard.kings[color].GetSquare().CanSquareBeAttacked(white);
    };
    Board.prototype.SetObjects = function () {
        var _this = this;
        var _loop_1 = function (i) {
            var _loop_2 = function (j) {
                this_1.board[i][j].SetObject();
                this_1.board[i][j].GetObject().click(function () { return _this.board[i][j].OnSquareClicked(); });
                this_1.board[i][j].GetObject().droppable({
                    drop: this_1.board[i][j].OnPieceDropped
                });
            };
            for (var j = 0; j <= 7; j++) {
                _loop_2(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i <= 7; i++) {
            _loop_1(i);
        }
    };
    Board.prototype.DrawAllPieces = function () {
        for (var i = 0; i <= 7; i++) {
            for (var j = 0; j <= 7; j++) {
                this.board[i][j].DrawPiece();
            }
        }
    };
    return Board;
}());
var gameBoard = new Board();
var testBoard;
$(document).ready(function () {
    gameBoard.CreatePieces();
    gameBoard.DrawAllPieces();
    gameBoard.SetObjects();
});
var ui = new UI();
