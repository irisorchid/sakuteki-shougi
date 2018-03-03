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
            console.log(players);
            io.to(id).emit('enter_success', {
                player: (player === active_player) ? 0 : 1, 
                pieces: shougi.getBoardState(player)
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
        active_player = 1 - active_player;
        io.to(id).emit('action_success'); //just do this for now
        var enemy_id = players[1 - players[id]];
        io.to(enemy_id).emit('enemy_action');
    };
    
    var sendUpdate = function(data) {
        //io.emit('update'); //in future should change to emit to room only
    };
    
    return {
        init: init,
        addPlayer: addPlayer,
        removePlayer : removePlayer,
        actionHandler: actionHandler
    };
    
})();

module.exports = game;