//=============================================================================
// ** BattleManager
//=============================================================================

// handles game_actions and client-server interaction

function BattleManager() {
    throw new Error('This is a static class');
}

BattleManager.init = function() {
    this.board = new Game_Board();    
};

BattleManager.loadBoardState = function(pieces) {
    this.board.loadBoardState(pieces);
};

//=============================================================================
// ** Game_Board
//=============================================================================

// handles dynamic board objects
// add load function here for server data input?

function Game_Board() {
    this.initialize.apply(this, arguments);
}

Game_Board.prototype.initialize = function() {
    this.fogOfWar = new Game_Fog();
    
    this._setEmptyBoard();
    this._initializePieces();
};


Game_Board.prototype._setEmptyBoard = function() {
    this._gamePieces = [];
    for (var i = 0; i < 8; i++) {
        this._gamePieces[i] = [];
    }
};

Game_Board.prototype._initializePieces = function() {
    //2 ou hisha kaku
    for (var i = 0; i < 3; i++) {
        for (var n = 0; n < 2; n++) {
            this._gamePieces[i].push(new Game_Piece(i));
        }
    }
    //4 kin gin keima kyosha
    for (var i = 3; i < 7; i++) {
        for (var n = 0; n < 4; n++) {
            this._gamePieces[i].push(new Game_Piece(i));
        }
    }
    //18 fuhyou
    for (var n = 0; n < 18; n++) {
        this._gamePieces[i].push(new Game_Piece(7));
    }
};

Game_Board.prototype.loadBoardState = function(pieces) {
    //load pieces passed from server, from enter success callback
    //use drop action for pieces coming out of fog
    //console.log(pieces.length);
    for (var i = 0; i < pieces.length; i++) {
        var piece = this.nextInactivePiece(pieces[i].id);
        if (piece !== null) {
            piece.setPieceStatus(pieces[i].x, pieces[i].y, pieces[i].alliance, pieces[i].promoted);
            Game.context.stage.addChild(piece._sprite);
        }
    }
};

Game_Board.prototype.nextInactivePiece = function(id) {
    for (var i = 0; i < this._gamePieces[id].length; i++) {
        if (!this._gamePieces[id][i].isActive()) {
            return this._gamePieces[id][i];
        }
    }
    return null;
};

//=============================================================================
// ** Game_Piece
//=============================================================================

function Game_Piece() {
    this.initialize.apply(this, arguments);
}

Game_Piece.prototype.initialize = function(id, x=-1, y=-1, alliance=1, promoted=false, update_board=false) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._alliance = alliance;
    this._promoted = promoted;
    this._texture = new PIXI.Texture(PIXI.loader.resources['pieces'].texture);
    this._sprite = new PIXI.Sprite(this._texture);
    
    if (update_board) {
        this.updateFrame();
        this.updateLocation();
    }
};

Game_Piece.prototype.setPieceStatus = function(x=this._x, y=this._y, alliance=this._alliance, promoted=this._promoted) {
    this._x = x;
    this._y = y;
    this._alliance = alliance;
    this._promoted = promoted;
    this.updateFrame();
    this.updateLocation();
};

//should add update function

Game_Piece.prototype.isActive = function() {
    return this._x !== -1 && this._y !== -1;
};

Game_Piece.prototype.updateFrame = function() {
    var frame_x = this._id * 64;
    var frame_y = this._alliance * 128 + (this._promoted ? 64 : 0);
    
    this._sprite.texture.frame = new PIXI.Rectangle(frame_x, frame_y, 64, 64);
};

Game_Piece.prototype.updateLocation = function() {
    this._sprite.x = (Game.WINDOW_WIDTH + 576) / 2 - (this._x + 1) * 64;
    this._sprite.y = (Game.WINDOW_HEIGHT - 576) / 2 + this._y * 64;
};

//=============================================================================
// ** Game_Fog
//=============================================================================

// handles fog of war

function Game_Fog() {
    this.initialize.apply(this, arguments);
}

Game_Fog.prototype.initialize = function() {
    this._grid = [];
    for (var i = 0; i < 9; i++) {
        this._grid.push(new Array(9).fill(0));
    }
    this._spriteGroup = new PIXI.Container();
    for (var y = 0; y < 9; y++) {
        for (var x = 1; x < 10; x++) {
            var rectangle = new PIXI.Graphics();
            rectangle.beginFill(0x808080);
            rectangle.drawRect(0,0,64,64);
            rectangle.endFill();
            rectangle.alpha = 0.8;
            rectangle.x = (Game.WINDOW_WIDTH + 576) / 2 - x*64;
            rectangle.y = (Game.WINDOW_HEIGHT - 576) / 2 + y*64;
            this._spriteGroup.addChild(rectangle);
        }
    }
    Game.context.stage.addChild(this._spriteGroup);
};

Game_Fog.prototype.isFog = function(x, y) {
    return this._grid[y][x] === 0;
};

//this might not ever see use
Game_Fog.prototype.applyGridToSprite = function() {
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            this._spriteGroup.children[y*9+x].alpha = (this._grid[y][x] === 0) ? 0.8 : 0;
        }
    }
};

Game_Fog.prototype.activate = function(x, y) {
    this._grid[y][x] = 0;
    this._spriteGroup.children[y*9+x].alpha = 0.8;
};

Game_Fog.prototype.deactivate = function(x, y) {
    this._grid[y][x] = 1;
    this._spriteGroup.children[y*9+x].alpha = 0;
};