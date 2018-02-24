"use strict";

//=============================================================================
// ** Game
//=============================================================================

function Game() {
    throw new Error('This is a static class.');
}

Game.WINDOW_WIDTH = 1280;
Game.WINDOW_HEIGHT = 720;

Game.preloadAllAssets = function() {
    PIXI.loader
        .add('board','res/board.png')
        .add('hand','res/hand.png')
        .add('pieces','res/pieces.png')
        .load(Game._onAssetsLoaded);
};

Game._createSocket = function() {
    this.socket = io();
    
    this.socket.on('test', (data) => { console.log(data); });
    
    //this.socket.on('update');
    
    //this.socket.on('newplayer');
    
    //this.socket.emit('test', 'hello world');
};

Game._createContext = function() {
    this.context = new PIXI.Application({
        width: this.WINDOW_WIDTH, 
        height: this.WINDOW_HEIGHT,
        backgroundColor: 0xe6c6a1
    });
    document.body.appendChild(this.context.view);
};

Game._createBoard = function() {
    this._boardSprite = new PIXI.Sprite(PIXI.loader.resources['board'].texture);
    this._boardSprite.x = (this.WINDOW_WIDTH - 576) / 2;
    this._boardSprite.y = (this.WINDOW_HEIGHT - 576) / 2;
    this.context.stage.addChild(this._boardSprite);
};

Game._createHand = function() {
    this._handSprite = new PIXI.Sprite(PIXI.loader.resources['hand'].texture);
    this._handSprite.x = this._boardSprite.x + 624;
    this._handSprite.y = this._boardSprite.y + 320;
    this._handSprite.width = 256;
    this._handSprite.height = 256;
    this.context.stage.addChild(this._handSprite);
    
    this._enemyHandSprite = new PIXI.Sprite(PIXI.loader.resources['hand'].texture);
    this._enemyHandSprite.x = this._boardSprite.x - 48;
    this._enemyHandSprite.y = this._boardSprite.y + 256;
    this._enemyHandSprite.scale.x = -1;
    this._enemyHandSprite.scale.y = -1;
    this._enemyHandSprite.width = 256;
    this._enemyHandSprite.height = 256;
    this.context.stage.addChild(this._enemyHandSprite);
    
    this._enemyHandFogSprite = new PIXI.Graphics();
    this._enemyHandFogSprite.beginFill(0x808080);
    this._enemyHandFogSprite.drawRect(0,0,256,256);
    this._enemyHandFogSprite.endFill();
    this._enemyHandFogSprite.alpha = 0.8;
    this._enemyHandFogSprite.x = this._boardSprite.x - 304;
    this._enemyHandFogSprite.y = this._boardSprite.y;
    this.context.stage.addChild(this._enemyHandFogSprite);
};

Game._createPieceTexture = function() {
    this.pieceTexture = PIXI.loader.resources['pieces'].texture;
    this.pieceFrame = []; //11 and 27 are empty sprites
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 8; x++) {
            this.pieceFrame.push(new PIXI.Rectangle(x*64, y*64, 64, 64));
        }
    }
};

Game._enter = function() {
    this.socket.on('enter_success', () => {
        //do something
        //should receive list of pieces with positions {id, x, y, alliance, promoted}
        //populate some array with sprite piece
    });
    this.socket.on('enter_fail', () => {
        //do something
    });
    this.socket.emit('enter_room');
};

Game._onAssetsLoaded = function() {
    Game._createSocket();
    //TODO: create background with tatami tiling texture 
    Game._createContext();
    Game._createBoard();
    Game._createHand();
    Game._createPieceTexture();
    BattleManager.init();
    
    Game._enter();
};

//=============================================================================
// ** Main
//=============================================================================

window.onload = function() {
    Game.preloadAllAssets();
};