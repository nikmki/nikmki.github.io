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