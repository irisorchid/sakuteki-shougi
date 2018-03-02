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

Game._onAssetsLoaded = function() {
    //TODO: create background with tatami tiling texture 
    Game._createContext();
    Game._createBoard();
    Game._createHand();
    BattleManager.init();
};

//=============================================================================
// ** Main
//=============================================================================

window.onload = function() {
    Game.preloadAllAssets();
};