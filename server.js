"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, { wsEngine: 'ws' }); //temporary workaround for uws9.14.0 delay bug?
var port = process.env.PORT || 65403;
var game = require('./server/game.js'); //currently simulates 1 game room

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

game.init(io);

io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
        game.removePlayer(socket.id); //should have a proper remove event
    });
    
    socket.on('test', (data) => {
        console.log(data);
    });
    
    socket.on('enter_room', () => {
        game.addPlayer(socket.id);
    });
    
    socket.on('action', (data) => {
        game.actionHandler(socket.id, data);
    });

});

http.listen(port, () => {
    console.log('listening on *:' + port);
});

/*
//open console
var repl = require('repl').start('>');
repl.context.game = game;
repl.context.io = io;
*/