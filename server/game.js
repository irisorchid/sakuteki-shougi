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
            console.log(players); //change later
            io.to(id).emit('enter_success', {
                player: (player === active_player) ? 0 : 1, 
                pieces: shougi.getBoardState(player),
                fog: shougi.getFog(player)
            });
        }
    };
    
    var removePlayer = function(id) {
        if (players[id] === 0 || players[id] === 1) {
            players[players[id]] = null;
            delete players[id];
        }
    };
    
    var actionHandler = function(id, action) {
        //action {id, x, y, destX, destY, promote}
        //verify id, maybe force disconnect
        if (players[id] === undefined) { return; }
        if (players[id] !== active_player) { return; }

        if (shougi.legalMove(players[id], action)) {
            var data = shougi.processMove(players[id], action);
            var enemy_id = players[1 - players[id]];
            
            io.to(id).emit('action_success', data[0]);
            io.to(enemy_id).emit('action_enemy', data[1]);
            active_player = 1 - active_player;
        }
        io.to(id).emit('action_fail');
    };
    
    return {
        init: init,
        addPlayer: addPlayer,
        removePlayer : removePlayer,
        actionHandler: actionHandler
    };
    
})();

module.exports = game;