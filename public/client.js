"use strict";

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}
PIXI.utils.sayHello(type)

var socket = io();
var WINDOW_WIDTH = 1280;
var WINDOW_HEIGHT = 720;

socket.on('test', (data) => {
    console.log(data)
})

//should emit enter

//socket.emit('test', 'hello world');

var app = new PIXI.Application({
    width: WINDOW_WIDTH, 
    height: WINDOW_HEIGHT,
    backgroundColor: 0xc0c8e8
});

document.body.appendChild(app.view);

PIXI.loader
    //.add('board','res/board.png')
    .load(setup);
    
function setup() {
    var background = new PIXI.Sprite.fromImage('res/board.png');
    app.stage.addChild(background)
}