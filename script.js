const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let score = 10;
let gameFrame = 0;
ctx.font = '50px Georgia';

let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  click: false,
};

canvas.addEventListener('mousedown', function (event) {
  mouse.click = true;
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', function () {
  mouse.click = false;
});

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
};

document.addEventListener('keydown', function (event) {
  keys[event.code] = true;
});

document.addEventListener('keyup', function (event) {
  keys[event.code] = false;
});

class Player {
  constructor() {
    this.x = canvas.width;
    this.y = canvas.height / 2;
    this.radius = 50;
    this.speed = 5;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.spriteWidth = 498;
    this.spriteHeight = 327;
  }

  update() {
    if (keys.ArrowUp || keys.KeyW) {
      this.y -= this.speed;
    }
    if (keys.ArrowDown || keys.KeyS) {
      this.y += this.speed;
    }
    if (keys.ArrowLeft || keys.KeyA) {
      this.x -= this.speed;
    }
    if (keys.ArrowRight || keys.KeyD) {
      this.x += this.speed;
    }

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    if (mouse.x !== this.x) {
      this.x -= dx / 30;
    }
    if (mouse.y !== this.y) {
      this.y -= dy / 30;
    }
  }

  draw() {
    if (mouse.click) {
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

class Bubble {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100;
    this.radius = 50;
    this.speed = Math.random() * 5 + 1;
    this.distance;
    this.counted = false;
    this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
  }

  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }

  draw() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
  }
}

class PowerUp {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 100;
    this.radius = 30;
    this.speed = Math.random() * 3 + 1;
    this.type = Math.random() <= 0.5 ? 'speed' : 'invincibility';
    this.duration = 300;
    this.distance;
    this.counted = false;
  }

  update() {
    this.y -= this.speed;
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
  }

  draw() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
  }
}

class Obstacle {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  update() {
    this.x -= this.speed;
    this.draw();
  }

  draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const player = new Player();
const bubblesArray = [];
const powerUpsArray = [];
const obstaclesArray = [];
const bubblePop1 = new Audio('Plop.ogg');
const bubblePop2 = new Audio('bubbles-single2.wav');
const powerUpSound = new Audio('powerup.wav');
let gameIsOver = false;
let level = 1;
let obstacleSpeed = 5;
let maxObstacles = 3;
let powerUpSpawnChance = 0.02;
let powerUpDuration = 300;
let invincibilityActive = false;
let invincibilityTimer = 0;

function handleBubbles() {
  if (gameFrame % 50 === 0) {
    bubblesArray.push(new Bubble());
  }

  for (let i = 0; i < bubblesArray.length; i++) {
    bubblesArray[i].update();
    bubblesArray[i].draw();

    if (
      bubblesArray[i].y < 0 - bubblesArray[i].radius * 2 ||
      bubblesArray[i].counted
    ) {
      bubblesArray.splice(i, 1);
      i--;
    } else if (bubblesArray[i].distance < bubblesArray[i].radius + player.radius) {
      if (!bubblesArray[i].counted) {
        if (bubblesArray[i].sound === 'sound1') {
          bubblePop1.play();
        } else {
          bubblePop2.play();
        }
        score++;
        bubblesArray[i].counted = true;
        bubblesArray.splice(i, 1);
        i--;
      }
    }
  }
}

function handlePowerUps() {
  if (gameFrame % 500 === 0 && Math.random() <= powerUpSpawnChance) {
    powerUpsArray.push(new PowerUp());
  }

  for (let i = 0; i < powerUpsArray.length; i++) {
    powerUpsArray[i].update();
    powerUpsArray[i].draw();

    if (
      powerUpsArray[i].y < 0 - powerUpsArray[i].radius * 2 ||
      powerUpsArray[i].counted
    ) {
      powerUpsArray.splice(i, 1);
      i--;
    } else if (
      powerUpsArray[i].distance < powerUpsArray[i].radius + player.radius &&
      !powerUpsArray[i].counted
    ) {
      powerUpSound.play();
      if (powerUpsArray[i].type === 'speed') {
        player.speed += 2;
        setTimeout(() => (player.speed -= 2), powerUpDuration);
      } else if (powerUpsArray[i].type === 'invincibility') {
        invincibilityActive = true;
        invincibilityTimer = powerUpDuration;
      }
      powerUpsArray[i].counted = true;
      powerUpsArray.splice(i, 1);
      i--;
    }
  }
}

function handleObstacles() {
  if (gameFrame % 100 === 0 && obstaclesArray.length < maxObstacles) {
    const randomY = Math.random() * (canvas.height - 200) + 100;
    const obstacleWidth = 60;
    const obstacleHeight = 60;
    const obstacleSpeed = Math.random() * 2 + 2;
    obstaclesArray.push(
      new Obstacle(canvas.width + obstacleWidth, randomY, obstacleWidth, obstacleHeight, obstacleSpeed)
    );
  }

  for (let i = 0; i < obstaclesArray.length; i++) {
    obstaclesArray[i].update();

    if (obstaclesArray[i].x < 0 - obstaclesArray[i].width) {
      obstaclesArray.splice(i, 1);
      i--;
    } else if (
      player.x < obstaclesArray[i].x + obstaclesArray[i].width &&
      player.x + player.radius > obstaclesArray[i].x &&
      player.y < obstaclesArray[i].y + obstaclesArray[i].height &&
      player.y + player.radius > obstaclesArray[i].y &&
      !invincibilityActive
    ) {
      gameIsOver = true;
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleBubbles();
  handlePowerUps();
  handleObstacles();
  player.update();
  player.draw();
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 10, 50);
  gameFrame++;

  if (gameFrame % 500 === 0) {
    level++;
    maxObstacles++;
    obstacleSpeed++;
    powerUpSpawnChance += 0.02;
  }

  if (gameIsOver) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Georgia';
    ctx.fillText('Game Over, your score is ' + score, 160, canvas.height / 2 - 10);
    cancelAnimationFrame(animationId);
    gameOverScreen.style.display = 'block';
  } else {
    animationId = requestAnimationFrame(animate);
  }

  if (invincibilityActive) {
    invincibilityTimer--;
    if (invincibilityTimer === 0) {
      invincibilityActive = false;
    }
  }
}

animate();
