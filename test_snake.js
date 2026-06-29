let snakeBody = [{x: 7, y: 5}];
let food = {x: 8, y: 5};
let score = 0;

function tick() {
  const prev = snakeBody;
  const head = { ...prev[0] };
  head.x += 1; // move right
  
  const newSnake = [head, ...prev];
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    food = {x: 10, y: 10}; // move food away
  } else {
    newSnake.pop();
  }
  snakeBody = newSnake;
}

console.log("Initial:", JSON.stringify(snakeBody));
tick();
console.log("Tick 1 (eats food):", JSON.stringify(snakeBody), "Score:", score);
tick();
console.log("Tick 2 (moves):", JSON.stringify(snakeBody), "Score:", score);
