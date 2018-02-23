"use strict";
//=============================================================================
// ** Game
//=============================================================================

function Game() {
    throw new Error('This is a static class.');
}

Game.WINDOW_WIDTH = 1280;
Game.WINDOW_HEIGHT = 720;

Game.createSocket = function() {
    this.socket = io();
    
    this.socket.on('test', (data) => {
        console.log(data);
    });
    
    //this.socket.on('update');
    
    //this.socket.on('newplayer');
    
    this.socket.emit('test', 'hello world');
}

Game.preloadAllAssets = function() {
    PIXI.loader
        .add('board','res/board.png')
        .add('fog','res/fog.png')
        .add('hand','res/hand.png')
        .add('pieces','res/pieces.png')
        .load(Game.onAssetsLoaded);
};

Game.createContext = function() {
    this.context = new PIXI.Application({
        width: this.WINDOW_WIDTH, 
        height: this.WINDOW_HEIGHT,
        backgroundColor: 0x10a0c0
    });
    
    document.body.appendChild(this.context.view);
};

Game.createBoard = function() {
    this._boardSprite = new PIXI.Sprite(PIXI.loader.resources['board'].texture);
    this._boardSprite.x = (this.WINDOW_WIDTH - 576) / 2;
    this._boardSprite.y = (this.WINDOW_HEIGHT - 576) / 2;
    this.context.stage.addChild(this._boardSprite);
};

Game.onAssetsLoaded = function() {
    //create application, board, hand here
    Game.createSocket();
    Game.createContext();
    Game.createBoard();
    //createHand
    //emit enter here, using some .on to handle successful join
};


//=============================================================================
// ** Main
//=============================================================================

window.onload = function() {
    //should emit enter after preloadassets, run game on successful enter
    Game.preloadAllAssets();
};