"use strict";

var game = (function() {
    
    var io; //move to global?
    var board; //abstract to module?
    var players; //abstract to module?
    
    var init = function(data) {
        io = data;
    }
    
    var test = function(data) {
        console.log(data);
    };
    
    return {
        init: init,
        test: test
    };
    
})();

module.exports = game;