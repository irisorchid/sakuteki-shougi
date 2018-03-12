"use strict";

//=============================================================================
// ** Shougi
//=============================================================================

function Shougi() {
    this.initialize.apply(this, arguments);
}

Shougi.prototype.initialize = function() {
    this.initialBoard();
    this.resetFog();
};

Shougi.prototype.initialBoard = function() {
    this.board = new Array(9);
    this.hand = [[], []];
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

Shougi.prototype.resetFog = function() {
    this.fog = [[], [], []]; //[2] is just for transposing player 1 fog for now
    this.applyFog(0);
    this.applyFog(1);
    this.clearFog(2);
};

Shougi.prototype.applyFog = function(player) {
    this.clearFog(player);
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            if (this.board[y][x] !== null && this.board[y][x].alliance === player) {
                var vision = this.board[y][x].currentVision = this.getVision(x, y, this.board[y][x]);
                for (var i = 0; i < vision.length; i++) {
                    this.fog[player][vision[i].y][vision[i].x] += 1;
                }
            }
        }
    }
};

Shougi.prototype.clearFog = function(player) {
    this.fog[player] = [];
    for (var i = 0; i < 9; i++) {
        this.fog[player].push(new Array(9).fill(0));
    }
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
    vision = this.board[action.destY][action.destX].currentVision = this.getVision(action.destX, action.destY, this.board[action.destY][action.destX]);
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
    
    //transpose outgoing actions for gote
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

//used to correct gote outgoing actions
//Shougi.prototype.transposeAction2 = function() {};

Shougi.prototype.legalMove = function(player, action) {
    if (typeof action.id !== 'number') { return false; }
    if (typeof action.x !== 'number') { return false; }
    if (typeof action.y !== 'number') { return false; }
    if (typeof action.destX !== 'number') { return false; }
    if (typeof action.destY !== 'number') { return false; }
    if (typeof action.promote !== 'boolean') { return false; }
    
    if (player === 1) { this.transposeAction(action); }
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
    
    return (action.x === -1 || action.y === -1) ? this.validDrop(player, action) : this.validMove(player, action);
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
    return boardstate;
};

Shougi.prototype.validPosition = function(x, y) {
    return !(x < 0 || x > 8 || y < 0 || y > 8);
};

Shougi.prototype.validDrop = function(player, action) {
    if (action.promote) { return false; }
    if (this.board[action.destY][action.destX] !== null) { return false; }
    if (this.nextInHand(action.id, player) === null) { return false; }
    if (this.fog[player][action.destY][action.destX] === 0) { return false; }
    
    if (action.id >= 5 && action.destY === 8*player) { return false; }
    if (action.id === 5 && action.destY === 1+6*player) { return false; }
    
    return true;
};

Shougi.prototype.validMove = function(player, action) {
    var piece = this.board[action.y][action.x];
    if (piece === null) { return false; }
    if (piece.id !== action.id) { return false; }
    //TODO: check if piece's movement can move to location (also if movement is blocked)
    //TODO: reroute movement for hisha / kaku if blocked
    //if (this.board[action.destY][action.destX] !== null && this.board[action.destY][action.destX].alliance === player) { return false; }
    
    if (action.promote) {
        if (action.id === 0 || action.id === 3) { return false; }
        if (piece.promoted) { return false; }
        if (player === 0) {
            if (action.destY > 2) { return false; }
        } else {
            if (action.destY < 6) { return false; }
        }
    }
    
    //TODO: check for forced promote
    
    return true;
};

Shougi.prototype.visionDiamond = function(x, y, radius) {
    var vision = [];
    for (var j = -radius; j <= radius; j++) {
        var offset_y = y+j;
        if (offset_y < 0 || offset_y > 8) { continue; }
        for (var i = -radius; i <= radius; i++) {
            var offset_x = x+i;
            if (offset_x < 0 || offset_x > 8) { continue; }
            if (i === 0 && j === 0) { continue; }
            if (Math.abs(i) + Math.abs(j) <= radius) { vision.push({ x: offset_x, y: offset_y }) }
        }
    }
    return vision;
};

Shougi.prototype.visionInDirection = function(x, y, dx, dy, alliance=-1, limit=0) {
    var vision = [];
    var i = x+dx;
    var j = y+dy;
    
    while(this.validPosition(i, j)) {
        vision.push({ x: i, y: j });
        if (this.board[j][i] !== null && this.board[j][i].alliance !== alliance) { break; }
        i += dx;
        j += dy;
    }
    
    return vision;
};

Shougi.prototype.visionInPlace = function(x, y) {
    if (this.validPosition(x, y)) { return [{ x: x, y: y }]; }
    return [];
};

Shougi.prototype.getVision = function(x, y, piece) {
    var vision = [];
    var forward = 2 * piece.alliance - 1;
    vision.push({ x: x, y: y });
    
    if (piece.id === 0) {
        vision = vision.concat(this.visionDiamond(x, y, 3));
    } else if (piece.id === 1) {
        vision = vision.concat(this.visionDiamond(x, y, 3));
        if (piece.promoted) {
            vision = vision.concat(this.visionInPlace(x, y+4));
            vision = vision.concat(this.visionInPlace(x+4, y));
            vision = vision.concat(this.visionInPlace(x, y-4));
            vision = vision.concat(this.visionInPlace(x-4, y));
        }
    } else if (piece.id === 2) {
        vision = vision.concat(this.visionInDirection(x, y, 1, 1, piece.alliance));
        vision = vision.concat(this.visionInDirection(x, y, 1, -1, piece.alliance));
        vision = vision.concat(this.visionInDirection(x, y, -1, 1, piece.alliance));
        vision = vision.concat(this.visionInDirection(x, y, -1, -1, piece.alliance));
        if (piece.promoted) {
            vision = vision.concat(this.visionDiamond(x, y, 1));
        }
    } else if (piece.id === 3 || piece.id === 4 || piece.promoted) {
        vision = vision.concat(this.visionDiamond(x, y, 2));
    } else if (piece.id === 5) {
        vision = vision.concat(this.visionDiamond(x, y, 3));
    } else if (piece.id === 6) {
        vision = vision.concat(this.visionInDirection(x, y, 0, forward, piece.alliance));
    } else if (piece.id === 7) {
        vision = vision.concat(this.visionInPlace(x-1, y+forward));
        vision = vision.concat(this.visionInPlace(x, y+forward));
        vision = vision.concat(this.visionInPlace(x+1, y+forward));
        vision = vision.concat(this.visionInPlace(x, y+2*forward));
    }
    
    return vision;
};

Shougi.prototype.getMovement = function(x, y, piece) {
    var movement = [];
    var forward = 2 * piece.alliance - 1;
    
    switch (piece.id) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        case 6:
            break;
        case 7:
            break;
    }
    
    return movement;
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

//struct
function Piece() {
    this.initialize.apply(this, arguments);
}

Piece.prototype.initialize = function(id, alliance, promoted) {
    this.id = id;
    this.alliance = alliance;
    this.promoted = promoted;
    this.currentVision = [];
};

module.exports = Shougi;