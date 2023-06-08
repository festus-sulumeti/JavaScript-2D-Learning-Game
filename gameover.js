const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const finalScoreElement = document.getElementById('finalScore');

restartButton.addEventListener('click', restartGame);

function restartGame() {
  gameOverScreen.style.display = 'none';
  resetGame();
  animate();
}

function resetGame() {
  score = 0;
  updateScore();
  gameIsOver = false;
  level = 1;
  obstacleSpeed = 5;
  maxObstacles = 3;
  powerUpSpawnChance = 0.02;
  powerUpDuration = 300;
  invincibilityActive = false;
  invincibilityTimer = 0;
  player.x = canvas.width;
  player.y = canvas.height / 2;
  player.speed = 5;
  player.frameX = 0;
  player.frameY = 0;
  player.frame = 0;
}

function handleGameOver() {
  cancelAnimationFrame(animationId);
  gameOverScreen.style.display = 'block';
  finalScoreElement.textContent = score;
}

// Add this line to the end of the animate() function:
if (gameIsOver) {
  handleGameOver();
} else {
  animationId = requestAnimationFrame(animate);
}
