"use strict";

var game = (function() {
    
    var io; //move to global?
    var board; //abstract to module?
    var players = { 0: null, 1: null }; //abstract to module?
    
    var init = function(server) {
        io = server;
    }
    
    var test = function(data) {
        console.log(data);
    };
    
    var join = function(socket) {
        //players.push(id);
    }
    
    return {
        init: init,
        test: test
    };
    
})();

module.exports = game;