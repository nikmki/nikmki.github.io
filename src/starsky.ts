const canvas = document.createElement('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.appendChild(canvas)

const ctx = canvas.getContext('2d')

if(!ctx){
    throw new Error("Failed to get Canvas Context")
}


const chunkRadius = 3;
const centerIndex = chunkRadius + 1;
const chunkLoadStates: boolean[][][] = []
const chunkSize = 500
for(let i = 0; i < chunkRadius * 2 + 1; i++){
    let matrix2D: boolean[][] = [];
    for (let j = 0; j < chunkRadius * 2 + 1; j++) {
        let row: boolean[] = new Array(chunkRadius * 2 + 1).fill(false);
        matrix2D.push(row);
    }
    chunkLoadStates.push(matrix2D);
}

let loadedChunks: Chunk[] = []
let currentChunk = new Chunk(-1000, -1000, -1000)

let stars: Star[] = []

const viewAxisXStart = new Vector(0.001, 0, 0)
const viewAxisYStart = new Vector(0, 0.001, 0)
const viewVectorStart = new Vector(0,0,1)

const rotationSpeed = 0.01;
const maxSpeed = 30
const minSpeed = 0
const startSpeed = 2
const accelerationAmount = 0.08
const decelerationAmount = -0.16

let viewVector = viewVectorStart
let viewAxisX = viewAxisXStart
let viewAxisY = viewAxisYStart
let position = new Vector(0, 0, 0)

let xRotDelta = 0
let yRotDelta = 0

let speedDelta = startSpeed;
let acceleration = 0;

// const starColors = [[255, 180, 180], [255, 255, 255], [255,255, 255], [255, 230, 150], [200, 200, 255]]
const starColors = [[255, 255, 255]]

let oldTimeStamp: number;
let deltaTime = 0;
let trails = 1

const animationCallBack = (timeStamp: number) => {
    if(canvas.width != window.innerWidth || canvas.height != window.innerHeight){
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    if(!oldTimeStamp){
        oldTimeStamp = timeStamp
    }

    deltaTime = (timeStamp - oldTimeStamp) / 16.67
    oldTimeStamp = timeStamp;


    const chunkX = Math.floor(position.x / chunkSize)
    const chunkY = Math.floor(position.y / chunkSize)
    const chunkZ = Math.floor(position.z / chunkSize)


    if(currentChunk.x !== chunkX || currentChunk.y !== chunkY || currentChunk.z !== chunkZ){
        currentChunk = new Chunk(chunkX, chunkY, chunkZ);
        chunkLoading(currentChunk);
    }


    if(speedDelta > 10){
        trails = Math.max(0.3, (20 - speedDelta) * 0.1)
    }else{
        trails = 1
    }

    if(xRotDelta !== 0 || yRotDelta !== 0){
        viewVector = viewVector.rotateVector(viewAxisX, yRotDelta * deltaTime)
        viewVector = viewVector.rotateVector(viewAxisY, xRotDelta * deltaTime)
        viewAxisY = viewAxisY.rotateVector(viewAxisX, yRotDelta * deltaTime)
        viewAxisX = viewAxisX.rotateVector(viewAxisY, xRotDelta * deltaTime)
    }

    speedDelta = Math.min(maxSpeed, Math.max(minSpeed, speedDelta + (acceleration * deltaTime)))
    position = position.add(viewVector.multiply(speedDelta * deltaTime))
    
    ctx.fillStyle = `rgba(0,0,0, ${trails})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = '25px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Speed: ${speedDelta.toFixed(3)}`, 10, 30);

    
    stars.forEach(star => {

        setCoordsOnScreen(star)

        if(!star.onScreen){
            return
        }

        const dist = position.distance(star.pos)
        if(dist > 1100){
            return
        }
        

        if(Math.random() < 0.01){
            star.dim = !star.dim
        }
        

        const sizeFactor = Math.min((1100 / dist), 100) 
        const dimmer = star.dim && sizeFactor < 2 ? 60 : 0;

        
        const color = `rgba(${star.r - dimmer}, ${star.g - dimmer}, ${star.b - dimmer}, 1)`

        if(sizeFactor < 2){
            ctx.fillStyle = color
            const size = 2 * sizeFactor
            ctx.fillRect(star.screenX - size * 0.5, star.screenY - size * 0.5, size, size)
        }else{
            drawCircle(ctx, star.screenX, star.screenY, sizeFactor, color)


            if(speedDelta < 8){
                const brightnessFactor = Math.sin(star.currentBrightness) * 0.1 + 1.4
                drawCircle(ctx, star.screenX, star.screenY, sizeFactor * brightnessFactor, "rgba(255,255,255,0.2)")
                star.currentBrightness += star.brightnessStep
                if(star.currentBrightness > 2 * Math.PI){
                    star.currentBrightness = 0
                }
            }
            
        }    
        
        
       
    })

   
    
    window.requestAnimationFrame(animationCallBack)
}

window.requestAnimationFrame(animationCallBack)

document.addEventListener('keydown', keyDownListener);
document.addEventListener('keyup', keyUpListener);

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


function setCoordsOnScreen(star: Star){
    let P0 = position.add(viewVector) 
    let starDirection = star.pos.subtract(position)

    let numerator = viewVector.dotProduct(P0) - viewVector.dotProduct(position);
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
        position.x + t * starDirection.x - P0.x,
        position.y + t * starDirection.y - P0.y,
        position.z + t * starDirection.z - P0.z
    );


    let x = intersectionAtOrigin.dotProduct(viewAxisX) / viewAxisX.dotProduct(viewAxisX) 
    let y = intersectionAtOrigin.dotProduct(viewAxisY) / viewAxisY.dotProduct(viewAxisY)


    star.screenX = canvas.width / 2 + x;
    star.screenY = canvas.height / 2 + y;
    
    star.onScreen = star.screenX > 0 && star.screenX < canvas.width && star.screenY > 0 && star.screenY < canvas.height;
    

}


function chunkLoading(centerChunk: Chunk){
    let start = performance.now()
    let newLoadedChunks = []

    for (let i = loadedChunks.length - 1; i >= 0; i--) {
        const chunk = loadedChunks[i];

        let loaded = undefined

        try{
            loaded = chunkLoadStates[chunk.x - centerChunk.x + centerIndex][chunk.y - centerChunk.y + centerIndex][chunk.z - centerChunk.z + centerIndex];
        }catch(error){}
        

        if(loaded !== undefined){
            newLoadedChunks.push(chunk)
            chunkLoadStates[chunk.x - centerChunk.x + centerIndex][chunk.y - centerChunk.y + centerIndex][chunk.z - centerChunk.z + centerIndex] = true
        }

    }

    loadedChunks = newLoadedChunks
    console.log(`First part: ${performance.now() - start} milliseconds. Chunks length: ${loadedChunks.length}`);

    start = performance.now()
    
    for (let x = 0; x < chunkLoadStates.length; x++) {
        for (let y = 0; y < chunkLoadStates[x].length; y++) {
            for (let z = 0; z < chunkLoadStates[x][y].length; z++) {
                
                if(!chunkLoadStates[x][y][z]){
                    const newChunk = new Chunk(centerChunk.x - centerIndex + x, centerChunk.y - centerIndex + y, centerChunk.z - centerIndex + z)
                    loadedChunks.push(newChunk)
                    const nStars = getRandomIntInRange(50, 80)
                    for (let i = 0; i < nStars; i++) {
                        const starColor = starColors[getRandomInt(starColors.length)]
                        newChunk.stars.push(new Star(
                            getRandomIntInRange(newChunk.x * chunkSize, newChunk.x * chunkSize + chunkSize), 
                            getRandomIntInRange(newChunk.y * chunkSize, newChunk.y * chunkSize + chunkSize), 
                            getRandomIntInRange(newChunk.z * chunkSize, newChunk.z * chunkSize + chunkSize), 
                            newChunk,
                            0.01 + Math.random() * 0.03,
                            starColor[0],
                            starColor[1],
                            starColor[2]
                        ))
                    }
                }


                chunkLoadStates[x][y][z] = false;

            }
            
        }
        
    }

    stars = []
    loadedChunks.forEach(chunk => {
        stars.push(...chunk.stars)
    })

    console.log(`Second part: ${performance.now() - start} milliseconds`);
}


function keyDownListener(event: KeyboardEvent){
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
}


function keyUpListener(event: KeyboardEvent){
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
}

