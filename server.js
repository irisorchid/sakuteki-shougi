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
    
    socket.on('disconnect', () => {
    });
    
    socket.on('test', (data) => {
        //game.test(data);
        //io.to(socket.id).emit('test', socket.id);
    });
    
    socket.on('enter', (data) => {
    });
    
    socket.on('exit', (data) => {
    });
    
    socket.on('move', (data) => {
    });

});

http.listen(port, () => {
    console.log('listening on *:' + port);
});