const socket = io({
    transports: ['websocket']
});

var PLAYER_NUMBER;
const GRID = 20;
const BLOCK_SIZE =  document.documentElement.clientWidth > 600 ? 600/GRID : 300/GRID 
const SNAKE_COLOR = "#00FF00"
const FOOD_COLOR = "#FF0000"

const initialScreen = document.querySelector("#initialScreen")
const gameScreen = document.querySelector("#gameScreen")
const createGameButton = document.querySelector("#newGameButton")
const joinGameButton = document.querySelector("#joinGameButton")
const gameCodeDisplay = document.querySelector("#gameCodeDisplay")
const gameCodeInput = document.querySelector("#gameCodeInput")
const errorDisplay = document.querySelector("#error")
const resultDisplay = document.querySelector("#result");
const playerOneScoreDisplay = document.querySelector("#playerOneScore")
const playerTwoScoreDisplay = document.querySelector("#playerTwoScore")
const resetButton = document.querySelector("#reset");
const leaveButton = document.querySelector("#leave")





createGameButton.addEventListener("click", createGameHandler);
joinGameButton.addEventListener("click", joinGameHandler)
resetButton.addEventListener("click", resetButtonHandler)
leaveButton.addEventListener("click", leaveButtonHandler)


function createGameHandler(){
    PLAYER_NUMBER = 1;
    socket.emit("createGame");
}

function joinGameHandler(){
    PLAYER_NUMBER = 2;
    socket.emit("joinGame", gameCodeInput.value);
}

function errorHandler(errorMessage){
    errorDisplay.innerText = errorMessage;
}

function resetButtonHandler(e){
    resetButton.style.display = "none";
    leaveButton.style.display = "none";
    resultDisplay.innerText = ""
    socket.emit("reset");
}

function leaveButtonHandler(){
    socket.emit("leave");
    removePlayScene()
}


function init(gameCode){
    gameCodeDisplay.innerText = gameCode;
    initPlayScene();
}

function initPlayScene(){
    initialScreen.style.display = "none"
    resetButton.style.display = "none"
    leaveButton.style.display = "none";
    canvas.width = canvas.height = document.documentElement.clientWidth > 600 ? 600 : 300 
    gameScreen.style.display = "block";
    ctx.fillStyle = "#000000"
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function removePlayScene(){
    gameCodeDisplay.innerText = "";
    resultDisplay.innerText = "";
    gameCodeInput.value = "";
    errorDisplay.innerText = "";
    PLAYER_NUMBER = ""
    initialScreen.style.display = "block";
    resetButton.style.display = "none";
    leaveButton.style.display = "none";
    gameScreen.style.display = "none";
}




socket.on("connect", ()=>{
    console.log("connected")
})

socket.on("init", init)

socket.on("gameState",(gameState)=>{
    requestAnimationFrame(()=>drawGameState(gameState))
})

socket.on("gameOver",gameOverHandler)

socket.on("error", errorHandler);

socket.on("leave", removePlayScene)

const canvas = document.querySelector("#canvas")
var hammer = new Hammer(document,{
    inputClass: Hammer.TouchMouseInput,
    recognizers: [
        [Hammer.Pan]
    ]
});
hammer.on("panleft",()=>socket.emit("keyDown", 37 , PLAYER_NUMBER))
hammer.on("panright",()=>socket.emit("keyDown", 39 , PLAYER_NUMBER))
hammer.on("panup",()=>socket.emit("keyDown", 38 , PLAYER_NUMBER))
hammer.on("pandown",()=>socket.emit("keyDown", 40 , PLAYER_NUMBER))
const ctx = canvas.getContext("2d")


document.addEventListener("keydown",keyDownHandler, true)

function keyDownHandler(event){
    console.log(event.keyCode)
    socket.emit("keyDown", event.keyCode, PLAYER_NUMBER)
}

function gameOverHandler(message){
    resultDisplay.innerText = message;
    resetButton.style.display = "block"
    leaveButton.style.display = "block"
}



//Drawing Game
////////////////////////////////////////////////////////////////////////////////////////////

function drawGameState(gameState){
    const [playerOne , playerTwo] = gameState.players;
    ctx.fillStyle = "#000000"
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawPlayer(playerOne , SNAKE_COLOR);
    drawPlayer(playerTwo , "#0000FF")
    updateScore(playerOneScoreDisplay, playerOne.snake.length - 3)
    updateScore(playerTwoScoreDisplay, playerTwo.snake.length - 3)
    drawFood(gameState.food)
}
function drawPlayer(player, color){
    ctx.fillStyle = color;
    const snake = player.snake;
    for(let {x,y} of snake){
        ctx.fillRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE)
    }
}
function drawFood(food){
    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x*BLOCK_SIZE, food.y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function updateScore(player,score){
    player.innerText = score;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
