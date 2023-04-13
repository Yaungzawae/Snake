const {
  initGame,
  gameLoop,
  changeVelocity,
} = require("./Game");
const { FPS } = require("./Constants");
const express = require("express");
const { makeid } = require("./helpers");
const app = express();

const db = {
  clientIdToRoomId: {},
};

app.use("/", express.static(__dirname + "/views"));

const server = app.listen("8080", () => {
  console.log("Server has started");
});

const io = require("socket.io")(server, {
  cors: {
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

io.on("connection", (socket) => {
  socket.on("keyDown", keyDownHandler);
  socket.on("createGame", createGameHandler);
  socket.on("joinGame", joinGameHandler);
  socket.on("reset", resetHandler);
  socket.on("leave", leaveHandler)

  function keyDownHandler(keyCode, PLAYER_NUMBER) {
    const roomId = db.clientIdToRoomId[socket.id];
    if(!db.hasOwnProperty(roomId)){
        return
    }
    const { gameState, gameIsActive } = db[roomId];
    if (gameIsActive) {
      try {
        const updatedVelocity = changeVelocity(keyCode);
        if (
          gameState.players[PLAYER_NUMBER - 1].vel.x !== -updatedVelocity.x &&
          gameState.players[PLAYER_NUMBER - 1].vel.y !== -updatedVelocity.y
        ) {
          gameState.players[PLAYER_NUMBER - 1].vel = updatedVelocity;   
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  function createGameHandler() {
    const roomId = makeid(8);
    if (db.hasOwnProperty(roomId)) {
      createRoomHandler();
    } else {
      db[roomId] = { gameState: initGame(), gameIsActive: false };
      db[roomId].connectedClients = [socket.id]
      db.clientIdToRoomId[socket.id] = roomId;
      socket.emit("init", roomId);
      socket.join(roomId);
    }
  }
  function joinGameHandler(roomId) {
    if(!db.hasOwnProperty(roomId)){
      socket.emit("error", "Invalid Code.")
      return
    }

    if(db[roomId].connectedClients.length >= 2){
      socket.emit("error", "Maximum capacity has reached for this game.");
      return 
    }

    db[roomId].gameIsActive = true;
    db[roomId].connectedClients.push(socket.id)
    db.clientIdToRoomId[socket.id] = roomId;
    socket.emit("init", roomId);
    socket.join(roomId);
    setGameInterval(roomId, db[roomId].gameState);
  }
  function resetHandler(){
    const roomId = db.clientIdToRoomId[socket.id];
    db[roomId].gameState = initGame();
    socket.emit("init", roomId);
    setGameInterval(roomId, db[roomId].gameState);
  }
  function leaveHandler(){
    const roomId = db.clientIdToRoomId[socket.id];
    for(let client of db[roomId].connectedClients){
      delete db.clientIdToRoomId[client]
    }
    delete db[roomId];
    io.in(roomId).emit("leave")
  }
});

function setGameInterval(roomId, state) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state);
    if (!winner) {
      emitGameState(roomId, state);
    } else {
      emitGameOver(roomId, winner);
      clearInterval(intervalId);
    }
  }, 1000 / FPS);
}

function emitGameState(roomId, state) {
  io.in(roomId).emit("gameState", state);
}

function emitGameOver(roomId, winner) {
  if(winner === 1 || winner === 2){
    io.in(roomId).emit("gameOver", `Player ${winner} Wins`);
  } else {
    io.in(roomId).emit("gameOver", winner);
  }
}
