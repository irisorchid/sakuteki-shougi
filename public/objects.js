"use strict";

//=============================================================================
// ** BattleManager
//=============================================================================

function BattleManager() {
    throw new Error('This is a static class');
}

BattleManager.init = function() {
    this._board = new Game_Board();
    this._turn = 0;
    this._createSocket();
    this.pendingAction = false;
    this.pointerActive = false; //used to prevent some pointer glitches with i.e. start() stop()
    
    this._enter();
};

BattleManager.isTurn = function() {
    return this._turn === 0;
};

BattleManager.loadBoardState = function(state) {
    this._turn = state.player;
    this._board.loadPieces(state.pieces);
    this._board.applyFog(state.fog);
};

BattleManager.performAction = function(piece, action) {
    this.pendingAction = true;
    this._currentPiece = piece;
    this._currentAction = action;
    this._socket.emit('action', action);
};

BattleManager._createSocket = function() {
    this._socket = io();
    
    this._socket.on('test', (data) => {
        console.log(data);
    });
    this._socket.on('disconnect', () => {
        console.log("d/c");
    });
    this._socket.on('action_success', (data) => {
        //data => {player:, actions:, fog:}
        this._board.loadActions(data.actions);
        this._board.applyFog(data.fog);
        //if redirect, change destX, destY
        if (data.redirect !== undefined) {
            this._currentAction.destX = data.redirect.x;
            this._currentAction.destY = data.redirect.y;
            this._currentAction.promote = data.redirect.promote;
        }
        this._currentPiece.move(this._currentAction.destX, this._currentAction.destY, this._currentAction.promote);
        this._turn = (this._turn + 1) % 2;
        this.pendingAction = false;
    });
    this._socket.on('action_fail', () => {
        if (this._currentPiece.isOnHand()) {
            this._board.arrangeHand(this._currentPiece._id);
        } else {
            this._currentPiece._updateLocation();
        }
        this.pendingAction = false;
    });
    this._socket.on('action_enemy', (data) => {
        this._board.loadActions(data.actions);
        this._board.applyFog(data.fog);
        this._turn = (this._turn + 1) % 2;
    });
}

BattleManager._enter = function() {
    this._socket.on('enter_success', (data) => {
        this.loadBoardState(data);
    });
    this._socket.on('enter_fail', () => {
        //do something
    });
    this._socket.emit('enter_room');
}

//=============================================================================
// ** Game_Board
//=============================================================================

function Game_Board() {
    this.initialize.apply(this, arguments);
}

Game_Board.prototype.initialize = function() {
    this._fogOfWar = new Game_Fog();
    this._clearBoard();
};

Game_Board.prototype.loadPieces = function(pieces) {
    this._resetPieces();
    
    for (var i = 0; i < pieces.length; i++) {
        var piece = this._nextHiddenPiece(pieces[i].id);
        if (piece !== null) {
            piece.loadFromSource(pieces[i].x, pieces[i].y, pieces[i].alliance, pieces[i].promoted);
        }
    }
};

Game_Board.prototype.loadActions = function(actions) {
//remove{x, y, capture} //reveal{id, x, y, promote}
    for (var i = 0; i < actions.remove.length; i++) {
        if (actions.remove[i].x === -1) {
            this._nextHiddenPiece(actions.remove[i].y).remove(actions.remove[i].capture);
        } else {
            this._pieceAt(actions.remove[i].x, actions.remove[i].y).remove(actions.remove[i].capture);
        }
    }
    for (var i = 0; i < actions.reveal.length; i++) {
        this._nextHiddenPiece(actions.reveal[i].id).move(actions.reveal[i].x, actions.reveal[i].y, actions.reveal[i].promote);
    }
};

Game_Board.prototype.applyFog = function(fog) {
    this._fogOfWar.applyFogGrid(fog);
};

Game_Board.prototype.arrangeHand = function(id) {
    var index = 0;
    for (var i = 0; i < this._gamePieces[id].length; i++) {
        if (this._gamePieces[id][i].isOnHand()) {
            this._gamePieces[id][i]._handPosition = index;
            this._gamePieces[id][i]._updateLocation();
            this._gamePieces[id][i]._pushToFront();
            index++;
        }
    }
};

Game_Board.prototype.handIncrementSize = function(id) {
    var numPieces = 0;
    var handStep = (id === 7) ? 180 : 72;
    for (var i = 0; i < this._gamePieces[id].length; i++) {
        if (this._gamePieces[id][i].isOnHand()) {
            numPieces++;
        }
    }
    if (numPieces === 0) { return 0; }
    return handStep / numPieces;
};

Game_Board.prototype._clearBoard = function() {
    this._gamePieces = [];
    for (var i = 0; i < 8; i++) {
        this._gamePieces[i] = [];
    }
};

Game_Board.prototype._pieceAt = function(x, y) {
    for (var id = 0; id < 8; id++) {
        for (var i = 0; i < this._gamePieces[id].length; i++) {
            if (this._gamePieces[id][i].isAt(x, y)) {
                return this._gamePieces[id][i];
            }
        } 
    }
    return null;
};

Game_Board.prototype._nextHiddenPiece = function(id) {
    for (var i = 0; i < this._gamePieces[id].length; i++) {
        if (this._gamePieces[id][i].isHidden()) {
            return this._gamePieces[id][i];
        }
    }
    return null;
};

Game_Board.prototype._resetPieces = function() {
    this._clearBoard();
    for (var i = 0; i < 3; i++) {
        for (var n = 0; n < 2; n++) {
            this._gamePieces[i].push(new Game_Piece(i));
        }
    }
    for (var i = 3; i < 7; i++) {
        for (var n = 0; n < 4; n++) {
            this._gamePieces[i].push(new Game_Piece(i));
        }
    }
    for (var n = 0; n < 18; n++) {
        this._gamePieces[i].push(new Game_Piece(7));
    }
};

//=============================================================================
// ** Game_Piece
//=============================================================================

function Game_Piece() {
    this.initialize.apply(this, arguments);
}

Game_Piece.prototype.initialize = function(id, x=-1, y=-1, alliance=1, promoted=false) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._alliance = alliance;
    this._promoted = promoted;
    this._texture = new PIXI.Texture(PIXI.loader.resources['pieces'].texture);
    this._sprite = new PIXI.Sprite(this._texture);
    this._sprite.interactive = true;
    this._active = false;
    this._handPosition = 0;
    
    //using mouse events because touch logic is different
    this._sprite.on('mouseup', this._onPointerUp.bind(this));
    this._sprite.on('mousemove', this._onPointerMove.bind(this));
    
    this._updateFrame();
    this._updateLocation();
    Game.context.stage.addChild(this._sprite);
};

Game_Piece.prototype.loadFromSource = function(x=this._x, y=this._y, alliance=this._alliance, promoted=this._promoted) {
    this._x = x;
    this._y = y;
    this._alliance = alliance;
    this._promoted = promoted;
    this._updateFrame();
    this._updateLocation();
};

//should add function that returns vision based on ID
Game_Piece.prototype.isAt = function(x, y) {
    return this._x === x && this._y === y;
};

Game_Piece.prototype.isHidden = function() {
    return this._alliance === 1 && (this._x === -1 || this._y === -1);
};

Game_Piece.prototype.isOnHand = function() {
    return this._alliance === 0 && (this._x === -1 || this._y === -1);
};

Game_Piece.prototype.canPromote = function() {
    return this._id !== 0 && this._id !== 3 && !this._promoted;
};

Game_Piece.prototype.mustPromote = function(destY) {
    return (destY === 0 && this._id > 4) || (destY <= 1 && this._id === 5);
};

Game_Piece.prototype.move = function(x, y, promote=false) {
    //if (x < 0 || x > 8) { return; }
    //if (y < 0 || y > 8) { return; }
    this._x = x;
    this._y = y;
    if (promote) {
        this.promote();
    }
    if (this.isOnHand()) {
        BattleManager._board.arrangeHand(this._id);
    }
    this._updateLocation();
};

Game_Piece.prototype.promote = function() {
    //if (!this.canPromote) { return; }
    this._promoted = true;
    this._updateFrame();
};

Game_Piece.prototype.remove = function(capture=false) {
    this._x = -1;
    this._y = -1;
    if (this._id !== 0) { this._promoted = false; } //if statement for display purposes if king is captured
    if (capture) {
        this._alliance = 1 - this._alliance;
        BattleManager._board.arrangeHand(this._id);
    }
    this._updateLocation();
    this._updateFrame();
};

Game_Piece.prototype._updateFrame = function() {
    var frame_x = this._id * 64;
    var frame_y = this._alliance * 128 + (this._promoted ? 64 : 0);
    
    this._texture.frame = new PIXI.Rectangle(frame_x, frame_y, 64, 64);
};

Game_Piece.prototype._updateLocation = function() {
    if (!(this._sprite.visible = !this.isHidden())) { //xd code //use 0,0 for now
        this._sprite.x = 0;
        this._sprite.y = 0;
    } else if (this.isOnHand()) {
        var baseIncrement = 6;
        this._sprite.x = this._handX() + BattleManager._board.handIncrementSize(this._id) * this._handPosition + baseIncrement;
        this._sprite.y = this._handY();
    } else {
        this._sprite.x = (Game.WINDOW_WIDTH + 576) / 2 - (this._x + 1) * 64;
        this._sprite.y = (Game.WINDOW_HEIGHT - 576) / 2 + this._y * 64;
    }
};

Game_Piece.prototype._handX = function() {
    var base = (Game.WINDOW_WIDTH + 576) / 2 + 48;
    var offset = (8 % this._id) ? 0 : 128;
    return base + offset;
};

Game_Piece.prototype._handY = function() {
    var base = (Game.WINDOW_HEIGHT + 576) / 2 - 256;
    var offset = Math.floor((this._id - 1) / 2) * 64;
    return base + offset;
};

Game_Piece.prototype._pushToFront = function() {
    Game.context.stage.removeChild(this._sprite);
    Game.context.stage.addChild(this._sprite);
};

Game_Piece.prototype._onPointerUp = function() {
    if (!(BattleManager.isTurn() && this._alliance === 0)) { return; }
    if (BattleManager.pendingAction) { return; }
    
    var mousePosition = Game.context.renderer.plugins.interaction.mouse.global;
    if (BattleManager.pointerActive) {
        var boardX = Math.floor(((Game.WINDOW_WIDTH + 576) / 2 - mousePosition.x) / 64);
        var boardY = Math.floor((mousePosition.y - (Game.WINDOW_HEIGHT - 576) / 2) / 64);
        
        this._active = false;
        BattleManager.pointerActive = false;
        
        //should be a full legal move check
        if (boardX < 0 || boardX > 8 || boardY < 0 || boardY > 8) {
            if (this.isOnHand()) {
                BattleManager._board.arrangeHand(this._id);
            } else {
                this._updateLocation();
            }
            return;
        }
        var temp = BattleManager._board._pieceAt(boardX, boardY);
        if (temp !== null) {
            if (temp._alliance === 0) {
                if (this.isOnHand()) {
                    BattleManager._board.arrangeHand(this._id);
                } else {
                    this._updateLocation();
                }
                return;
            }
        }
        //should be a full legal move check
        
        var forcedPromote = this.mustPromote(boardY);
        if (boardY <= 2 && this.canPromote() && !forcedPromote) {
            Game.dialog = new Promotion_Dialog(this, {
                id: this._id,
                x: this._x,
                y: this._y,
                destX: boardX,
                destY: boardY,
                promote: false
            });
        } else {
            BattleManager.performAction(this, {
                id: this._id,
                x: this._x,
                y: this._y,
                destX: boardX,
                destY: boardY,
                promote: forcedPromote
            });
        }
    } else {
        this._sprite.x = mousePosition.x - this._sprite.width / 2;
        this._sprite.y = mousePosition.y - this._sprite.height / 2;
        this._pushToFront();
        
        BattleManager.pointerActive = true;
        this._active = true;
    }
};

Game_Piece.prototype._onPointerMove = function() {
    if (!this._active) {
        return;
    }
    var mousePosition = Game.context.renderer.plugins.interaction.mouse.global;
    this._sprite.x = mousePosition.x - this._sprite.width / 2;
    this._sprite.y = mousePosition.y - this._sprite.height / 2;
};

//=============================================================================
// ** Game_Fog
//=============================================================================

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

Game_Fog.prototype.applyFogGrid = function(grid) {
    this._grid = grid;
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 9; x++) {
            this._spriteGroup.children[y*9+x].alpha = (this._grid[y][x] === 0) ? 0.8 : 0;
        }
    }
};

/*
Game_Fog.prototype.activate = function(x, y) {
    this._grid[y][x] = 0;
    this._spriteGroup.children[y*9+x].alpha = 0.8;
};

Game_Fog.prototype.deactivate = function(x, y) {
    this._grid[y][x] = 1;
    this._spriteGroup.children[y*9+x].alpha = 0;
};
*/

//=============================================================================
// ** Promotion_Button
//=============================================================================

function Promotion_Button() {
    this.initialize.apply(this, arguments);
}

Promotion_Button.prototype.initialize = function(x, y, width, height, name, callback) {
    this._width = width;
    this._height = height;
    this._createSprite(x, y, name, callback);
};

Promotion_Button.prototype._createSprite = function(x, y, name, callback) {
    this._sprite = new PIXI.Graphics();
    this._sprite.x = x;
    this._sprite.y = y;
    this._drawBackground(0xFFFFFF);
    
    this._text = new PIXI.Text(name, {
        fill: 0x000000,
        fontFamily: 'Helvetica',
        fontSize: 24
    });
    
    this._text.x = Math.floor((this._width - this._text.width) / 2);
    this._text.y = Math.floor((this._height - this._text.height) / 2);
    this._sprite.addChild(this._text);
    
    this._sprite.interactive = true;
    this._sprite.on('mousedown', this._onButtonDown.bind(this));
    this._sprite.on('mouseup', callback);
    this._sprite.on('mouseover', this._onButtonOver.bind(this));
    this._sprite.on('mouseout', this._onButtonOut.bind(this));
};

Promotion_Button.prototype._drawBackground = function(color) {
    this._sprite.lineStyle(1, 0x808080, 1);
    this._sprite.beginFill(color);
    this._sprite.drawRect(0, 0, this._width, this._height);
    this._sprite.endFill();
};

Promotion_Button.prototype._onButtonDown = function() {
    this._drawBackground(0x808080);
    this._text.style.fill = 0xFFFFFF;
};

Promotion_Button.prototype._onButtonOver = function() {
    this._drawBackground(0xF0F0F0);
    this._text.style.fill = 0x000000;
};

Promotion_Button.prototype._onButtonOut = function() {
    this._drawBackground(0xFFFFFF);
    this._text.style.fill = 0x000000 ;
};

//=============================================================================
// ** Promotion_Dialog
//=============================================================================

function Promotion_Dialog() {
    this.initialize.apply(this, arguments);
}

Promotion_Dialog.prototype.initialize = function(piece, action) {
    this._piece = piece;
    this._action = action;
    this._createDialog();
};

Promotion_Dialog.prototype._closeDialog = function() {
    Game.context.stage.removeChild(this._background);
    Game.context.stage.removeChild(this._context);
};

Promotion_Dialog.prototype._createDialog = function() {
    this._createBackground();
    this._drawContext();
    this._drawTitle();
    this._drawPieces();
    this._createButtons();
};

Promotion_Dialog.prototype._createBackground = function() {
    this._background = new PIXI.Graphics();
    this._background.interactive = true;
    this._background.alpha = 0.75;
    this._background.beginFill(0xA0A0A0);
    this._background.drawRect(0, 0, Game.WINDOW_WIDTH, Game.WINDOW_HEIGHT);
    this._background.endFill();
    Game.context.stage.addChild(this._background);
};

Promotion_Dialog.prototype._createButtons = function() {
    var yesButton = new Promotion_Button(8, 112, 84, 40, 'Yes', this._callbackYes.bind(this));
    var noButton = new Promotion_Button(100, 112, 84, 40, 'No', this._callbackNo.bind(this));
    
    this._context.addChild(yesButton._sprite);
    this._context.addChild(noButton._sprite);
};

Promotion_Dialog.prototype._drawContext = function() {
    this._context = new PIXI.Graphics();
    this._context.beginFill(0xFFFFFF);
    this._context.drawRect(0, 0, 192, 160);
    this._context.endFill();
    this._context.beginFill(0x10A0C0);
    this._context.drawRect(0, 0, 192, 32);
    this._context.endFill();
    this._context.x = (Game.WINDOW_WIDTH - 192) / 2;
    this._context.y = (Game.WINDOW_HEIGHT - 160) / 2;
    Game.context.stage.addChild(this._context);
};

Promotion_Dialog.prototype._drawTitle = function() {
    var title = new PIXI.Text('Promote?', {
        fill: 0xFFFFFF,
        fontFamily: 'Helvetica',
        fontSize: 24
    });
    title.x = Math.floor((192 - title.width) / 2);
    title.y = Math.floor((32 - title.height) / 2);
    this._context.addChild(title);
};

Promotion_Dialog.prototype._drawPieces = function() {
    var frameX = this._action.id * 64;
    var baseTexture = PIXI.loader.resources['pieces'].texture;
    
    var promotedSprite = new PIXI.Sprite(new PIXI.Texture(baseTexture));
    promotedSprite.x = 18;
    promotedSprite.y = 44;
    promotedSprite.texture.frame = new PIXI.Rectangle(frameX, 64, 64, 64);
    
    var unpromotedSprite = new PIXI.Sprite(new PIXI.Texture(baseTexture))
    unpromotedSprite.x = 110;
    unpromotedSprite.y = 44;
    unpromotedSprite.texture.frame = new PIXI.Rectangle(frameX, 0, 64, 64);
    
    this._context.addChild(promotedSprite);
    this._context.addChild(unpromotedSprite);
};

Promotion_Dialog.prototype._callbackYes = function() {
    this._action.promote = true;
    BattleManager.performAction(this._piece, this._action);
    this._closeDialog();
};

Promotion_Dialog.prototype._callbackNo = function() {
    this._action.promote = false;
    BattleManager.performAction(this._piece, this._action);
    this._closeDialog();
};