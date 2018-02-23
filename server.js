"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8000;
var game = require('./server/game.js');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

game.init(io);

io.on('connection', (socket) => {
    //NOTE TO SELF: don't execute anything besides socket.on in here i.e. console.log(socket.id)
    //NOTE TO SELF: emit passes data using JSON.stringify, so cannot send object.prototype properties or functions
    
    socket.on('disconnect', () => {
    });
    
    socket.on('test', (data) => {
        game.test(data);
        //io.to(socket.id).emit('test', socket.id);
        //socket.emit('test');
    });
    
    socket.on('enter', () => {
        //if a seat is empty, register this socket as player and send something back
        
    });
    
    socket.on('exit', (data) => {
    });
    
    socket.on('action', (data) => {
        //handles action made by player
    });

});

http.listen(port, () => {
    console.log('listening on *:' + port);
});