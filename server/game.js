"use strict";

var Shougi = require('./shougi.js');

var game = (function() {
    
    var io;
    var shougi;
    var players;
    var active_player; //0 == sente, 1 == gote
    var turn;
    
    var init = function(server) {
        io = server;
        shougi = new Shougi(); //shougi.printBoard();
        players = { 0: null, 1: null };
        active_player = 0;
        turn = 0;
    };
  
    var addPlayer = function(id) {
        var player = (players[0] === null) ? 0 : (players[1] === null) ? 1 : null;
        if (player === null) {
            io.to(id).emit('enter_fail');
        } else {
            players[player] = id;
            players[id] = player;
            io.to(id).emit('enter_success', {
                player: (player === active_player) ? 0 : 1, 
                board: shougi.getBoardState(player)
            }); 
    };
    
    var actionHandler = function(id, action) {
        
    };
    
    var sendUpdate = function(data) {
        //io.emit('update'); //in future should change to emit to room only
    };
    
    return {
        init: init,
        addPlayer: addPlayer,
        actionHandler: actionHandler
    };
    
})();

module.exports = game;