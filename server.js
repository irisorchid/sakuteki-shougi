"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 65403;
var game = require('./server/game.js'); //currently simulates 1 game room

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

game.init(io);

io.on('connection', (socket) => {
    //NOTE TO SELF: don't execute anything besides socket.on in here i.e. console.log(socket.id)
    //NOTE TO SELF: emit passes data using JSON.stringify, so cannot send object.prototype properties or functions
    //io.to(socket.id).emit('test', socket.id); or socket.emit('test');
    
    socket.on('disconnect', () => {
    });
    
    socket.on('test', (data) => { console.log(data); });
    
    socket.on('enter_room', () => {
        game.addPlayer(socket);
    });
    
    socket.on('take_turn', (data) => {
        //handles action made by player
    });

});

http.listen(port, () => {
    console.log('listening on *:' + port);
});