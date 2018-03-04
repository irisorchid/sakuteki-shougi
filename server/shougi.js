"use strict";

//=============================================================================
// ** Shougi
//=============================================================================

function Shougi() {
    this.initialize.apply(this, arguments);
}

Shougi.prototype.initialize = function() {
    this.initialBoard();
    this.fog = [[], []];
    this.applyFog(0);
    this.applyFog(1);
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

Shougi.prototype.applyFog = function(player) {
    this.resetFog(player);
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            
            //use a simple 1 aoe fog for now
            if (this.board[y][x] !== null && this.board[y][x].alliance === player) {
                for (var i = -1; i < 2; i++) {
                    for (var j = -1; j < 2; j++) {
                        var mi = (player) ? 8-y-i: y+i
                        var mj = (player) ? 8-x-j: x+j
                        if (mi >= 0 && mi < 9 && mj >= 0 && mj < 9) {
                            this.fog[player][mi][mj] = 1;
                        }
                    }
                }
            }
            
        }
    }
};

Shougi.prototype.resetFog = function(player) {
    this.fog[player] = [];
    for (var i = 0; i < 9; i++) {
        this.fog[player].push(new Array(9).fill(0));
    }
};

Shougi.prototype.takeTurn = function(player, action) {
    var updates = {};
    
    //check for piece capture, make sure to handle blind capture
    if (this.board[action.destY][action.destX] !== null) {
        
    }
    
    //move piece to location
    
    //calculate fog
    this.applyFog(player);
    
    //reveal pieces - NOT DONE
    
    this.board[action.destY][action.destX]
};

Shougi.prototype.legalMove = function(player, action) {
    //should assert and throw error on action format being incorrect / illegal
    if (typeof action.id !== 'number') { return false; }
    if (typeof action.x !== 'number') { return false; }
    if (typeof action.y !== 'number') { return false; }
    if (typeof action.destX !== 'number') { return false; }
    if (typeof action.destY !== 'number') { return false; }
    if (typeof action.promote !== 'boolean') { return false; }
    
    if (action.id < 0) { return false; }
    if (action.id > 8) { return false; }
    if (action.destX < 0) { return false; }
    if (action.destX > 8) { return false; }
    if (action.destY < 0) { return false; }
    if (action.destY > 8) { return false; }
    if (action.x < -1) { return false; }
    if (action.x > 8) { return false; }
    if (action.y < -1) { return false; }
    if (action.y > 8) { return false; }
    
    //check not moving in place
    if (action.x === action.destX && action.y === action.destY) { return false; }
    //check if location is occupied by allied piece; cannot capture own piece
    if (this.board[y][x] !== null && this.board[y][x].alliance === player) { return false; }
    //TODO: check if piece's movement can move to location (also if movement is blocked)
    //TODO: reroute movement for hisha / kaku if blocked
    
    return true;
};

Shougi.prototype.getFullBoardState = function(player) {
    var temp_board = [];
    if (player === 0) {
        for (var y = 0; y < 9; y++) {
            for (var x = 0; x < 9; x++) {
                if (this.board[y][x] !== null && this.fog[player][y][x] === 1) {
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
                if (this.board[y][x] !== null && this.fog[player][8-y][8-x] === 1) {
                    temp_board.push({
                        id: this.board[y][x].id,
                        x: 8-x,
                        y: 8-y,
                        alliance: 1-this.board[y][x].alliance,
                        promoted: this.board[y][x].promoted
                    });
                }
            }
        }
    }
    return temp_board;
};

/*
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
};*/

Shougi.prototype.getVision = function(id, x, y) {
    //actually depends on id but use 1 aoe for now for proof of concept
    //only need board for blocked vision if its used?
    var vision = [];
    
    for (var j = -1; j < 2; j++) {
        for (var i = -1; i < 2; i++) {
            var offsetX = x+i;
            var offsetY = y+j;
            if (offsetX >= 0 && offsetX < 9 && offsetY >= 0 && offsetY < 9) {
                vision.push({ x: x+i, y: y+j });
            }
        }
    }
    
    return vision
};

Shougi.prototype.getMovement = function(id, x, y) {};

//=============================================================================
// ** Piece
//=============================================================================

//basically a struct
function Piece() {
    this.initialize.apply(this, arguments);
}

Piece.prototype.initialize = function(id, alliance, promoted) {
    this.id = id;
    this.alliance = alliance;
    this.promoted = promoted;
    this.currentVision = [];
};

//=============================================================================
// ** Fog
//=============================================================================

function Fog() {
    this.initialize.apply(this, arguments);
}

module.exports = Shougi;