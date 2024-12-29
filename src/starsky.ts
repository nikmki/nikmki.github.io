const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.appendChild(canvas)

const ctx = canvas.getContext('2d')

if(!ctx){
    throw new Error("Failed to get Canvas Context")
}


const chunkRadius = 12;
const centerIndex = chunkRadius + 1;
const chunkMap: boolean[][][] = []
for(let i = 0; i < chunkRadius * 2 + 1; i++){
    let matrix2D: boolean[][] = [];
    for (let j = 0; j < chunkRadius * 2 + 1; j++) {
        let row: boolean[] = new Array(chunkRadius * 2 + 1).fill(false);
        matrix2D.push(row);
    }
    chunkMap.push(matrix2D);
}

const loadedChunks: Chunk[] = []
let currentChunk = new Chunk(-1000, -1000, -1000)

let stars: Star[] = []
const spaceSize = 1000


const viewAxisXStart = new Vector(0.001, 0, 0)
const viewAxisYStart = new Vector(0, 0.001, 0)
const viewVectorStart = new Vector(0,0,1)

let viewVector = viewVectorStart
let viewAxisX = viewAxisXStart
let viewAxisY = viewAxisYStart
let position = new Vector(0, 0, 0)


const rotationSpeed = 0.001;
const maxSpeed = 3
const minSpeed = 0
const startSpeed = 0.1
const accelerationAmount = 0.0003
const decelerationAmount = -0.0006



let xRotDelta = 0
let yRotDelta = 0

let speedDelta = startSpeed;
let acceleration = 0;



const chunkLoading = (centerChunk: Chunk) => {

    // let start = performance.now()

    for (let i = loadedChunks.length - 1; i >= 0; i--) {
        const chunk = loadedChunks[i];

        let loaded = undefined

        try{
            loaded = chunkMap[chunk.x - centerChunk.x + centerIndex][chunk.y - centerChunk.y + centerIndex][chunk.z - centerChunk.z + centerIndex];
        }catch(error){}
        

        if(loaded === undefined){
            loadedChunks.splice(i, 1)
        }else{
            chunkMap[chunk.x - centerChunk.x + centerIndex][chunk.y - centerChunk.y + centerIndex][chunk.z - centerChunk.z + centerIndex] = true
        }

    }

    // console.log(`First part: ${performance.now() - start} milliseconds`);

    // start = performance.now()
    
    for (let x = 0; x < chunkMap.length; x++) {
        for (let y = 0; y < chunkMap[x].length; y++) {
            for (let z = 0; z < chunkMap[x][y].length; z++) {
                
                if(!chunkMap[x][y][z]){
                    const newChunk = new Chunk(centerChunk.x - centerIndex + x, centerChunk.y - centerIndex + y, centerChunk.z - centerIndex + z)
                    loadedChunks.push(newChunk)
                    const nStars = getRandomIntInRange(1,2)
                    for (let i = 0; i < nStars; i++) {
                        newChunk.stars.push(new Star(
                            getRandomIntInRange(newChunk.x * 100, newChunk.x * 100 + 100), 
                            getRandomIntInRange(newChunk.y * 100, newChunk.y * 100 + 100), 
                            getRandomIntInRange(newChunk.z * 100, newChunk.z * 100 + 100), newChunk))
                        
                    }
                }


                chunkMap[x][y][z] = false;

            }
            
        }
        
    }

    stars = []
    loadedChunks.forEach(chunk => {
        stars.push(...chunk.stars)
    })

    // console.log(`Second part: ${performance.now() - start} milliseconds`);
}


let oldTimeStamp: number;
let fps = 0;
let deltaTime = 0;

const animationCallBack = (timeStamp: number) => {
    if(canvas.width != window.innerWidth || canvas.height != window.innerHeight){
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    if(!oldTimeStamp){
        oldTimeStamp = timeStamp
    }

    deltaTime = timeStamp - oldTimeStamp
    oldTimeStamp = timeStamp;
    fps = Math.round(1000 / deltaTime)


    const chunkX = Math.floor(position.x / 100)
    const chunkY = Math.floor(position.y / 100)
    const chunkZ = Math.floor(position.z / 100)

    
    if(currentChunk.x !== chunkX || currentChunk.y !== chunkY || currentChunk.z !== chunkZ){
        currentChunk = new Chunk(chunkX, chunkY, chunkZ);
        
        chunkLoading(currentChunk);
        //console.log(loadedChunks)
    }


    if(xRotDelta !== 0 || yRotDelta !== 0){
        viewVector = viewVector.rotateVector(viewAxisX, yRotDelta * deltaTime)
        viewVector = viewVector.rotateVector(viewAxisY, xRotDelta * deltaTime)
        viewAxisY = viewAxisY.rotateVector(viewAxisX, yRotDelta * deltaTime)
        viewAxisX = viewAxisX.rotateVector(viewAxisY, xRotDelta * deltaTime)


        // viewVector = viewVectorStart.rotateVector(viewAxisX, yRot).rotateVector(viewAxisY, xRot)
        // viewAxisY = viewAxisYStart.rotateVector(viewAxisX, yRot)
        // viewAxisX = viewAxisXStart.rotateVector(viewAxisY, xRot)
    }

    speedDelta = Math.min(maxSpeed, Math.max(minSpeed, speedDelta + (acceleration * deltaTime)))
    position = position.add(viewVector.multiply(speedDelta * deltaTime))
    
    
    
    ctx.clearRect(0,0, canvas.width, canvas.height)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)


    ctx.font = '25px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText("FPS: " + fps, 10, 30);
    ctx.fillText(`X: ${Math.round(position.x)} Y: ${Math.round(position.y)} Z: ${Math.round(position.z)}`, 10, 70);
    ctx.fillText(`Speed: ${speedDelta.toFixed(3)}`, 10, 110);


    stars.forEach(star => {
        setCoordsOnScreen(position, viewVector, viewAxisX, viewAxisY, star, canvas.width, canvas.height)
    });
    

    let starsOnScreen = 0;
    stars.forEach(star => {

        
        if(star.onScreen){

            let dist = position.distance(star.pos)
            let sizeFactor = 1 + Math.max(2 * (1000 - dist) / 1000, -0.5);

            // drawCircle(ctx, star.screenX, star.screenY, 6 * sizeFactor, "rgba(255, 255, 255, 0.05)")
            // drawCircle(ctx, star.screenX, star.screenY, 4 * sizeFactor, "rgba(255, 255, 255, 0.05)")
            // drawCircle(ctx, star.screenX, star.screenY, 2 * sizeFactor, "#FFFFFF")
            ctx.fillStyle = "#FFFFFF"

            if(star.selected){
                ctx.fillStyle = '#FF0000'
            }
            ctx.fillRect(star.screenX, star.screenY, 2 * sizeFactor, 2 * sizeFactor)



            // ctx.strokeStyle = "#FFFFFF"; 
            // ctx.lineWidth = 5;
            
            // ctx.beginPath();

            
            // ctx.moveTo(star.screenX, star.screenY); 

            
            // ctx.lineTo(star.prevScreenX!, star.prevScreenY!); 
            // ctx.stroke();


            starsOnScreen++;
        }
        
       
    })
    
    //console.log(starsOnScreen)

    
    window.requestAnimationFrame(animationCallBack)
}

window.requestAnimationFrame(animationCallBack)


// Add a click event listener to the canvas
canvas.addEventListener('click', (event: MouseEvent) => {
    // Get the bounding rectangle of the canvas
    const rect = canvas.getBoundingClientRect();

    // Calculate click position relative to the canvas
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const star of stars) {
        if(clickX > star.screenX - 2 && clickX < star.screenX + 2 
            && clickY > star.screenY - 2 && clickY < star.screenY + 2
        ){
            star.selected = true;
            break;
        }
    }

});


document.addEventListener('keydown', (event: KeyboardEvent) => {

    
    switch (event.key) {
        case 'ArrowUp':
            yRotDelta = rotationSpeed
            break;
        case 'ArrowDown':
            yRotDelta = -rotationSpeed
            break;
        case 'ArrowLeft':
            xRotDelta = -rotationSpeed
            break;
        case 'ArrowRight':
            xRotDelta = rotationSpeed
            break;
        case 'w':
            acceleration = accelerationAmount
            break;
        case 's':
            acceleration = decelerationAmount
            break;
    }
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
    switch (event.key) {
        case 'ArrowUp':
            yRotDelta = 0
            break;
        case 'ArrowDown':
            yRotDelta = 0
            break;
        case 'ArrowLeft':
            xRotDelta = 0
            break;
        case 'ArrowRight':
            xRotDelta = 0
            break;
        case 'w':
            acceleration = 0
            break;
        case 's':
            acceleration = 0
            break;
    }
});

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}


function getRandomIntInRange(min: number, max: number){
    return min + getRandomInt(max - min)
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string){
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
}


function setCoordsOnScreen(posVector: Vector, viewVector: Vector, viewXAxis: Vector, viewYAxis: Vector, star: Star, width: number, height: number){
    let P0 = posVector.add(viewVector) 
    let starDirection = star.pos.subtract(posVector)

    let numerator = viewVector.dotProduct(P0) - viewVector.dotProduct(posVector);
    let denominator = viewVector.dotProduct(starDirection)

    if(denominator === 0){
        star.onScreen = false;
        return
    }

    let t = numerator / denominator;

    if(t < 0){
        star.onScreen = false;
        return
    }

    let intersectionAtOrigin = new Vector(
        posVector.x + t * starDirection.x - P0.x,
        posVector.y + t * starDirection.y - P0.y,
        posVector.z + t * starDirection.z - P0.z
    );


    let x = intersectionAtOrigin.dotProduct(viewXAxis) / viewXAxis.dotProduct(viewXAxis) 
    let y = intersectionAtOrigin.dotProduct(viewYAxis) / viewYAxis.dotProduct(viewYAxis)


    star.screenX = canvas.width / 2 + x;
    star.screenY = canvas.height / 2 + y;
    
    star.onScreen = star.screenX > 0 && star.screenX < canvas.width && star.screenY > 0 && star.screenY < canvas.height;
    

}



