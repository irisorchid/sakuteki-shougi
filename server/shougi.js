"use strict";

//=============================================================================
// ** Shougi
//=============================================================================

function Shougi() {
    this.initialize.apply(this, arguments);
}

Shougi.prototype.initialize = function() {
    this.initialBoard();
};

Shougi.prototype.initialBoard = function() {
    this.board = new Array(9);
    for (var i = 0; i < 2; i++) {
        var senpou = [];
        var chuuken = new Array(9).fill(null);
        var taishou = new Array(9);
        
        for (var n = 0; n < 9; n++) {
            senpou.push(new Piece(7, i, false));
        }
        
        chuuken[1+6*i] = new Piece(1, i, false);
        chuuken[7-6*i] = new Piece(2, i, false);
        
        taishou[0] = new Piece(6, i, false);
        taishou[1] = new Piece(5, i, false);
        taishou[2] = new Piece(4, i, false);
        taishou[3] = new Piece(3, i, false);
        taishou[4] = new Piece(0, i, (i === 0));
        taishou[5] = new Piece(3, i, false);
        taishou[6] = new Piece(4, i, false);
        taishou[7] = new Piece(5, i, false);
        taishou[8] = new Piece(6, i, false);
        
        this.board[8-8*i] = taishou;
        this.board[7-6*i] = chuuken;
        this.board[6-4*i] = senpou;
    }
    this.board[3] = new Array(9).fill(null);
    this.board[4] = new Array(9).fill(null);
    this.board[5] = new Array(9).fill(null);
};

//doesn't calculate fog yet
Shougi.prototype.getFullBoardState = function(player) {
    var temp_board = [];
    if (player === 0) {
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                if (this.board[y][x] !== null) {
                    temp_board.push({
                        id: this.board[y][x].id,
                        x: x,
                        y: y,
                        alliance: this.board[y][x].alliance,
                        promoted: this.board[y][x].promoted
                    });
                }
            }
        }
    } else if (player === 1) {
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                if (this.board[y][x] !== null) {
                    temp_board.push({
                        id: this.board[y][x].id,
                        x: 8-x,
                        y: 8-y,
                        alliance: 1 - this.board[y][x].alliance,
                        promoted: this.board[y][x].promoted
                    });
                }
            }
        }
    }
    return temp_board;
};

Shougi.prototype.printBoard = function() {
    for (var y = 0; y < 9; y++) {
        var temp = '';
        for (var x = 8; x >= 0; x--) {
            if (this.board[y][x] === null) {
                temp += ' --';
            } else {
                temp += ' ' + this.board[y][x].id + this.board[y][x].alliance;
            }
        }
        console.log(temp);
    }
};

//=============================================================================
// ** Piece
//=============================================================================

function Piece() {
    this.initialize.apply(this, arguments);
}

Piece.prototype.initialize = function(id, alliance, promoted) {
    this.id = id;
    this.alliance = alliance;
    this.promoted = promoted;
};

module.exports = Shougi;