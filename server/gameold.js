"use strict";

//=============================================================================
// ** Shougi_Piece
//=============================================================================

function Shougi_Piece() {
    this.initialize.apply(this, arguments);
};

Shougi_Piece.prototype.initialize = function(id, alliance, promoted) {
    this.id = id;
    this.alliance = alliance;
    this.promoted = promoted;
};

//=============================================================================
// ** Shougi_Board
//=============================================================================

function Shougi_Board() {
    this.initialize.apply(this, arguments);
};

Shougi_Board.prototype.initialize = function() {
    this.board = new Array(9);
    for (var i = 0; i < 2; i++) {
        var senpou = [];
        var chuuken = new Array(9).fill(null);
        var taishou = new Array(9);
        
        for (var n = 0; n < 9; n++) {senpou.push(new Shougi_Piece(7, i, false));}
        
        chuuken[1] = new Shougi_Piece(2, i, false);
        chuuken[7] = new Shougi_Piece(1, i, false);
        
        taishou[0] = new Shougi_Piece(6, i, false);
        taishou[1] = new Shougi_Piece(5, i, false);
        taishou[2] = new Shougi_Piece(4, i, false);
        taishou[3] = new Shougi_Piece(3, i, false);
        taishou[4] = new Shougi_Piece(0, i, (i === 0));
        taishou[5] = new Shougi_Piece(3, i, false);
        taishou[6] = new Shougi_Piece(4, i, false);
        taishou[7] = new Shougi_Piece(5, i, false);
        taishou[8] = new Shougi_Piece(6, i, false);
        
        this.board[8-8*i] = taishou;
        this.board[7-6*i] = chuuken;
        this.board[6-4*i] = senpou;
    }
    this.board[3] = new Array(9).fill(null);
    this.board[3] = new Array(9).fill(null);
    this.board[3] = new Array(9).fill(null);
};

//=============================================================================
// ** Module
//=============================================================================

var game = (function() {
    
    var io; //move to global?
    var board; //abstract to module?
    var players; //abstract to module?
    var active_player; //0 == sente, 1 == gote
    var turn;
    var ta;
    
    var init = function(server) {
        io = server;
        players = { 0: null, 1: null };
        active_player = 0;
        turn = 0;
    };

    
    var addPlayer = function(socket) {
        var player = (players[0] === null) ? 0 : (players[1] === null) ? 1 : null;
        if (player === null) {
            socket.emit('enter_fail');
        } else {
            players[player] = socket.id;
            socket.emit('enter_success'); //should emit some data, use for update, also turn id
        }
    };
    
    var actionHandler = function(id, data) {
        
    };
    
    var takeTurn = function() {
        
    };
    
    var sendUpdate = function(data) {
        //io.emit('update'); //in future should change to emit to room only
    };
    
    return {
        init: init,
        addPlayer: addPlayer
    };
    
})();

module.exports = game;