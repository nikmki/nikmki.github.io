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


class Chunk{
    x: number;
    y: number;
    z: number;
    stars: Star[];

    constructor(x: number, y: number, z: number){
        this.x = x;
        this.y = y;
        this.z = z;
        this.stars = [];
    }
}

class Vector{

    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v2: Vector){
        return new Vector(this.x + v2.x, this.y + v2.y, this.z + v2.z);
    }

    subtract(v2: Vector){
        return new Vector(this.x - v2.x, this.y - v2.y, this.z - v2.z)
    }

    dotProduct(v2: Vector) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z;
    }
    
    crossProduct(v2: Vector) {
        return new Vector(
            this.y * v2.z - this.z * v2.y,
            this.z * v2.x - this.x * v2.z,
            this.x * v2.y - this.y * v2.x
        );
    }

    multiply(n: number){
        return new Vector(this.x * n, this.y * n, this.z * n);
    }
    
    rotateVector(u: Vector, theta: number) {
        // Normalize the axis vector u
        let uLength = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);
        let uNormalized = new Vector(u.x / uLength, u.y / uLength, u.z / uLength);
    
        // Compute components of Rodrigues' rotation formula
        let vDotU = this.dotProduct(uNormalized);
        let vCrossU = uNormalized.crossProduct(this);
    
        // Apply Rodrigues' rotation formula
        let rotatedVector = new Vector(
            this.x * Math.cos(theta) + vCrossU.x * Math.sin(theta) + uNormalized.x * vDotU * (1 - Math.cos(theta)),
            this.y * Math.cos(theta) + vCrossU.y * Math.sin(theta) + uNormalized.y * vDotU * (1 - Math.cos(theta)),
            this.z * Math.cos(theta) + vCrossU.z * Math.sin(theta) + uNormalized.z * vDotU * (1 - Math.cos(theta))
        );
    
        return rotatedVector;
    }
    
    distance(v2: Vector): number{
        let diff = this.subtract(v2);
        return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z)
    }


    angle(v2: Vector): number{
        return Math.acos(this.dotProduct(v2) / (this.length() * v2.length()))
    }

    length(){
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

}