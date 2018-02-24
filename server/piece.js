"use strict";

function Shougi_Piece() {
    this.initialize.apply(this, arguments);
};

Shougi_Piece.prototype.initialize = function(id, alliance, promoted) {
    this.id = id
    this.alliance = alliance
    this.promoted = promoted
}