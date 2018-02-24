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
            socket.emit('enter_success'); //should emit some data
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