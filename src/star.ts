class Star{

    pos: Vector;
    screenX: number;
    screenY: number;
    prevScreenX: number | undefined;
    prevScreenY: number | undefined;
    onScreen: boolean;
    chunk: Chunk
    r: number;
    g: number;
    b: number;
    dim: boolean;
    currentBrightness: number;
    brightnessStep: number;

    constructor(x: number, y: number, z: number, chunk: Chunk, brightnessStep: number, r: number, g: number, b: number){
        this.pos = new Vector(x, y, z)
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
        this.currentBrightness = 0
        this.brightnessStep = brightnessStep
    }


    

}