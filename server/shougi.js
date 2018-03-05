"use strict";

//=============================================================================
// ** Shougi
//=============================================================================

function Shougi() {
    this.initialize.apply(this, arguments);
}

Shougi.prototype.initialize = function() {
    this.initialBoard();
    this.hand = [[], []];
    this.fog = [[], [], []]; //[2] is just for transposing player 1 fog for now
    this.applyFog(0);
    this.applyFog(1);
    this.resetFog(2);
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
            if (this.board[y][x] !== null && this.board[y][x].alliance === player) {
                var vision = this.board[y][x].currentVision = this.board[y][x].getVision(x, y);
                for (var i = 0; i < vision.length; i++) {
                    this.fog[player][vision[i].y][vision[i].x] += 1;
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

Shougi.prototype.nextInHand = function(id, player) {
    for (var i = 0; i < this.hand[player]; i++) {
        if (this.hand[player][i].id === id) {
            return this.hand[player][i].id;
        }
    }
    return null;
};

//very messy need to clean up; hacky blind capture implementation atm
Shougi.prototype.processMove = function(player, action) {
    var player_updates = { player: 0 };
    var enemy_updates = { player: 1 };
    
    //remove{x, y, capture} //reveal{id, x, y, promote}
    var player_actions = { remove: [], reveal: [] };
    var enemy_actions = { remove: [], reveal: [] };

    var vision;
    //check for piece capture
    if (this.board[action.destY][action.destX] !== null) {
        //enemy loses vision at captured piece location
        vision = this.board[action.destY][action.destX].currentVision;
        for (var i = 0; i < vision.length; i++) {
            this.fog[1-player][vision[i].y][vision[i].x] -= 1;
            if (this.fog[1-player][vision[i].y][vision[i].x] === 0) {
                if (this.board[vision[i].y][vision[i].x] !== null && this.board[vision[i].y][vision[i].x].alliance === player) {
                    enemy_actions.remove.push({ x: vision[i].x, y: vision[i].y, capture: false });
                }
            }
        }
        this.board[action.destY][action.destX].currentVision = [];
        
        //flag for remove //if blind capture
        if (this.fog[player][action.destY][action.destX] === 0) {
            player_actions.remove.push({ x: -1, y: this.board[action.destY][action.destX].id, capture: true }); //blind capture
        } else {
            player_actions.remove.push({ x: action.destX, y: action.destY, capture: true }); //normal capture
        }
        enemy_actions.remove.push({ x: action.destX, y: action.destY, capture: true });
        //capture this piece
        this.board[action.destY][action.destX].alliance = player;
        this.hand[player].push(this.board[action.destY][action.destX]);
        this.board[action.destY][action.destX] = null;
    }
    
    //move piece to location
    if (action.x === -1 || action.y === -1) {
        //drop
        this.board[action.destY][action.destX] = this.nextInHand(action.id);
    } else {
        //lose vision from original location, flag for remove
        vision = this.board[action.y][action.x].currentVision;
        for (var i = 0; i < vision.length; i++) {
            this.fog[player][vision[i].y][vision[i].x] -= 1;
            if (this.fog[player][vision[i].y][vision[i].x] === 0) {
                if (this.board[vision[i].y][vision[i].x] !== null && this.board[vision[i].y][vision[i].x].alliance !== player) {
                    player_actions.remove.push({ x: vision[i].x, y: vision[i].y, capture: false });
                }
            }
        }
        //flag for remove
        if (this.fog[1-player][action.y][action.x] > 0) {
            enemy_actions.remove.push( {x: action.x, y: action.y, capture: false} );
        }
        //move
        this.board[action.destY][action.destX] = this.board[action.y][action.x];
        this.board[action.y][action.x] = null;
        //promote
        if (action.promote) {
            this.board[action.destY][action.destX].promoted = true;
        }
    }
    
    //gain vision at new location, flag for reveal
    vision = this.board[action.destY][action.destX].currentVision = this.board[action.destY][action.destX].getVision(action.destX, action.destY);
    for (var i = 0; i < vision.length; i++) {
        if (this.fog[player][vision[i].y][vision[i].x] === 0) {
            if (this.board[vision[i].y][vision[i].x] !== null && this.board[vision[i].y][vision[i].x].alliance !== player) {
                player_actions.reveal.push({ id: this.board[vision[i].y][vision[i].x].id, x: vision[i].x, y: vision[i].y, promote: this.board[vision[i].y][vision[i].x].promoted });
            }
        }
        this.fog[player][vision[i].y][vision[i].x] += 1;
    }
    //flag for reveal
    if (this.fog[1-player][action.destY][action.destX] > 0) {
        enemy_actions.reveal.push({ id: action.id, x: action.destX, y: action.destY, promote: this.board[action.destY][action.destX].promoted });
    }
    //delete vision;
    
    //this.getfog;
    var player_fog = this.getFog(player);
    var enemy_fog = this.getFog(1-player);
    
    //transpose actions for gote
    if (player === 0) {
        for (var i = 0; i < enemy_actions.remove.length; i++) {
            enemy_actions.remove[i].x = 8 - enemy_actions.remove[i].x;
            enemy_actions.remove[i].y = 8 - enemy_actions.remove[i].y;
        }
        for (var i = 0; i < enemy_actions.reveal.length; i++) {
            enemy_actions.reveal[i].x = 8 - enemy_actions.reveal[i].x;
            enemy_actions.reveal[i].y = 8 - enemy_actions.reveal[i].y;
        }
    } else {
        for (var i = 0; i < player_actions.remove.length; i++) {
            if (player_actions.remove[i].x > -1) {
                player_actions.remove[i].x = 8 - player_actions.remove[i].x;
                player_actions.remove[i].y = 8 - player_actions.remove[i].y;
            }
        }
        for (var i = 0; i < player_actions.reveal.length; i++) {
            player_actions.reveal[i].x = 8 - player_actions.reveal[i].x;
            player_actions.reveal[i].y = 8 - player_actions.reveal[i].y;
        }
    }
    
    this.printBoard();
    
    //join updates
    player_updates.actions = player_actions;
    player_updates.fog = player_fog;
    enemy_updates.actions = enemy_actions;
    enemy_updates.fog = enemy_fog;

    return [player_updates, enemy_updates];
};

//used to correct gote incoming actions
Shougi.prototype.transposeAction = function(action) {
    action.x = 8 - action.x;
    action.y = 8 - action.y;
    action.destX = 8 - action.destX;
    action.destY = 8 - action.destY;
};

Shougi.prototype.getFog = function(player) {
    if (player === 0) { return this.fog[0]; }
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            this.fog[2][y][x] = this.fog[1][8-y][8-x];
        }
    }
    return this.fog[2];
};

Shougi.prototype.legalMove = function(player, action) {
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
    
    //cannot move on top of own piece, and cannot move in place
    if (this.board[action.destY][action.destX] !== null && this.board[action.destY][action.destX].alliance === player) { return false; } 
    
    if (action.x === -1 || action.y === -1) {
        if (this.board[action.destY][action.destX] !== null) { return false; }
        if (this.nextInHand(action.id, player) === null) { return false; }
        //TODO: check invalid drop locations
        //TODO: cannot drop in fog
    }
    //TODO: if move, check that piece is correct
    //TODO: if piece is promoted, promote should be true
    //TODO: if piece is not promoted, check if promote is legal
    //TODO: check if piece's movement can move to location (also if movement is blocked)
    //TODO: reroute movement for hisha / kaku if blocked
    
    return true;
};

Shougi.prototype.getBoardState = function(player) {
    var boardstate = [];
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            if (this.board[y][x] !== null && this.fog[player][y][x] > 0) {
                boardstate.push({
                    id: this.board[y][x].id,
                    x: player ? 8-x : x,
                    y: player ? 8-y : y,
                    alliance: player ? 1-this.board[y][x].alliance : this.board[y][x].alliance,
                    promoted: this.board[y][x].promoted
                });
            }
        }
    }
    //console.log(boardstate);
    return boardstate;
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

/*
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
};*/

//Shougi.prototype.getMovement = function(id, x, y, alliance, promoted) {};

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
    this.currentVision = [];
};

Piece.prototype.getVision = function(x, y) {
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

Piece.prototype.getMovement = function(x, y) {
};

module.exports = Shougi;