"use strict";

var Shougi = require('./shougi.js');

var game = (function() {
    
    var io; //move to global?
    var shougi; //abstract to module?
    var players; //abstract to module?
    var active_player; //0 == sente, 1 == gote
    var turn;
    
    var init = function(server) {
        io = server;
        shougi = new Shougi();
        //shougi.printBoard();
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
            players[socket.id] = player;
            socket.emit('enter_success', {
                player: (player === active_player) ? 0 : 1, 
                board: shougi.getBoardState(player)
            }); //fix this after to set correct for calling player
        }
    };
    
    var actionHandler = function(socket, action) {
        
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