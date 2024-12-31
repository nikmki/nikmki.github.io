"use strict";
class Star {
    constructor(x, y, z, chunk, brightnessStep, r, g, b) {
        this.pos = new Vector(x, y, z);
        this.screenX = 0;
        this.screenY = 0;
        this.prevScreenX = undefined;
        this.prevScreenY = undefined;
        this.onScreen = false;
        this.chunk = chunk;
        this.r = r;
        this.g = g;
        this.b = b;
        this.dim = false;
        this.currentBrightness = 0;
        this.brightnessStep = brightnessStep;
    }
}
