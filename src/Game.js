const { GRID_SIZE } = require("./Constants");

function initGame() {
  const gameState = createGameState();
  randomFood(gameState);
  return gameState;
}

function createGameState() {
  return {
    players: [
      {
        pos: {
          x: 4,
          y: 10,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        pos: {
          x: 18,
          y: 10,
        },
        vel: {
          x: -1,
          y: 0,
        },
        snake: [
          { x: 20, y: 10 },
          { x: 19, y: 10 },
          { x: 18, y: 10 },
        ],
      },
    ],
    food: {
      x: 10,
      y: 10,
    },
  };
}
function gameLoop(state) { //game loop will return the winner if exists, if not loop
  const [ player1, player2 ] = state.players;

    player1.pos.x += player1.vel.x; // player1's new frame
    player1.pos.y += player1.vel.y;

    player2.pos.x += player2.vel.x; // player2's new frame
    player2.pos.y += player2.vel.y;

    if (
      player1.pos.x < 0 ||
      player1.pos.x === GRID_SIZE ||
      player1.pos.y < 0 ||
      player1.pos.y === GRID_SIZE
    ) {
      return 2;
    }
    if (
      player2.pos.x < 0 ||
      player2.pos.x === GRID_SIZE ||
      player2.pos.y < 0 ||
      player2.pos.y === GRID_SIZE
    ) {
      return 1;
    }
    if(player1.pos.x === player2.pos.x && player1.pos.y === player2.pos.y){
      return "Draw"
    }

    for (let { x, y } of player1.snake) {
      if (x === player1.pos.x && y === player1.pos.y) { //check if the player1's head is inside its body
        return 2;
      }
      if(x === player2.pos.x && y === player2.pos.y){ // check if the player2's head is inside player1'body 
        return 1;
      }
    }
    for (let { x, y } of player2.snake) {
      if (x === player2.pos.x && y === player2.pos.y) { // check if the player2's head is inside its body
        return 1;
      }
      if(x === player1.pos.x && y === player1.pos.y){ // check if the player1's head is inside player2'body 
        return 2;
      }
    }

    if (player1.pos.x === state.food.x && player1.pos.y === state.food.y) { // player1's food
      player1.snake.push({ x: player1.pos.x, y: player1.pos.y });
      randomFood(state);
    }
    if (player2.pos.x === state.food.x && player2.pos.y === state.food.y) { //player2's food
      player2.snake.push({ x: player2.pos.x, y: player2.pos.y });
      randomFood(state);
    }
  

    player1.snake.push({ x: player1.pos.x, y: player1.pos.y }); // update new frame
    player1.snake.shift();

    player2.snake.push({ x: player2.pos.x, y: player2.pos.y });
    player2.snake.shift();

  return false;
}

function randomFood(state) {
  const food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
  for (let { x, y } of state.players[0].snake) {
    if (x === food.x && y === food.y) {
      return randomFood(state);
    }
  }
  state.food = food;
}

function changeVelocity(keyCode) {
  switch (keyCode) {
    case 37: //l
      return { x: -1, y: 0 };

    case 38: //d
      return { x: 0, y: -1 };

    case 39: //r
      return { x: 1, y: 0 };

    case 40: //u
      return { x: 0, y: 1 };
    default:
      break;
  }
}

module.exports = {
  initGame,
  gameLoop,
  changeVelocity,
};
