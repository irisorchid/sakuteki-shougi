"use strict";


var game = (function() {
    
    var io; //move to global?
    var board; //abstract to module?
    var players; //abstract to module?
    var active_player; //0 == sente, 1 == gote
    var turn;
    
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
            socket.emit('enter_success', defaultSenteBoard()); //should emit some data
        }
    };
    
    var defaultSenteBoard = function() {
        var board = [];
        board.push({id: 0, x: 4, y: 8, alliance: 0, promoted: true});
        board.push({id: 1, x: 1, y: 7, alliance: 0, promoted: false});
        board.push({id: 2, x: 7, y: 7, alliance: 0, promoted: false});
        board.push({id: 3, x: 3, y: 8, alliance: 0, promoted: false});
        board.push({id: 3, x: 5, y: 8, alliance: 0, promoted: false});
        board.push({id: 4, x: 2, y: 8, alliance: 0, promoted: false});
        board.push({id: 4, x: 6, y: 8, alliance: 0, promoted: false});
        board.push({id: 5, x: 1, y: 8, alliance: 0, promoted: false});
        board.push({id: 5, x: 7, y: 8, alliance: 0, promoted: false});
        board.push({id: 6, x: 0, y: 8, alliance: 0, promoted: false});
        board.push({id: 6, x: 8, y: 8, alliance: 0, promoted: false});
        for (var i = 0; i < 9; i++) {
            board.push({id: 7, x: i, y: 6, alliance: 0, promoted: false});
        }
        return board;
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