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

//=============================================================================
// ** Game_Board
//=============================================================================

// handles dynamic board objects

function Game_Board() {
    this.initialize.apply(this, arguments);
}

Game_Board.prototype.initialize = function() {
    this.playerPieces = [];
    this.enemyPieces = [];
    this.fogOfWar = new Game_Fog();
};

Game_Board.prototype.loadPieces = function(pieces) {
    //load pieces passed from server, from enter success callback
    //use drop action for pieces coming out of fog
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
