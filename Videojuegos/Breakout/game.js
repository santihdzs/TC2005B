/*
 * Breakout Game - TC2005B
 * Santiago Hernández - A01787550
 */

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 600;

const perimeterMargin = 40;
const centerSize = 50;

// paddle dimensions based on position
let paddleWidth = 60;
let paddleHeight = 12;
let paddleX = canvasWidth / 2 - paddleWidth / 2;
let paddleY = perimeterMargin;
let paddleSide = 'top'; // top, right, bottom, left
let sidesHit = 0;

const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;
let ballSpeedX = 0.05;
let ballSpeedY = 0.05;

const blockSize = 30;
let blocks = [];
let score = 0;
let lives = 3;
let isGameOver = false;
let ballStarted = false;
let speedIncrease = 0;

const blocksDestroyedEl = document.getElementById("blocksDestroyed");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

function initBlocks() {
    blocks = [];
    
    // top row
    for (let i = 0; i < 20; i++) {
        blocks.push({ x: i * blockSize, y: 0, status: 1 });
    }
    // bottom row
    for (let i = 0; i < 20; i++) {
        blocks.push({ x: i * blockSize, y: canvasHeight - blockSize, status: 1 });
    }
    // left column
    for (let i = 1; i < 18; i++) {
        blocks.push({ x: 0, y: i * blockSize, status: 1 });
    }
    // right column
    for (let i = 1; i < 18; i++) {
        blocks.push({ x: canvasWidth - blockSize, y: i * blockSize, status: 1 });
    }
}

function restartGame() {
    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
    ballSpeedX = 0.05;
    ballSpeedY = 0.05;
    score = 0;
    lives = 3;
    isGameOver = false;
    ballStarted = false;
    speedIncrease = 0;
    sidesHit = 0;
    initBlocks();
    updatePaddlePosition();
    updateDisplay();
}

function updatePaddlePosition() {
    if (paddleSide === 'top') {
        paddleX = Math.max(perimeterMargin, Math.min(canvasWidth - perimeterMargin - paddleWidth, paddleX));
        paddleY = perimeterMargin;
    } else if (paddleSide === 'bottom') {
        paddleX = Math.max(perimeterMargin, Math.min(canvasWidth - perimeterMargin - paddleWidth, paddleX));
        paddleY = canvasHeight - perimeterMargin - paddleHeight;
    } else if (paddleSide === 'left') {
        paddleX = perimeterMargin;
        paddleY = Math.max(perimeterMargin, Math.min(canvasHeight - perimeterMargin - paddleHeight, paddleY));
    } else if (paddleSide === 'right') {
        paddleX = canvasWidth - perimeterMargin - paddleWidth;
        paddleY = Math.max(perimeterMargin, Math.min(canvasHeight - perimeterMargin - paddleHeight, paddleY));
    }
}

function updateDisplay() {
    blocksDestroyedEl.textContent = score;
    livesEl.textContent = lives;
}

function drawRect(x, y, w, h, color) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    drawRect(paddleX, paddleY, paddleWidth, paddleHeight, "#3333AA");
}

function drawBall() {
    drawCircle(ballX, ballY, ballRadius, "#0095DD");
}

function drawBlocks() {
    for (let b of blocks) {
        if (b.status === 1) {
            drawRect(b.x, b.y, blockSize, blockSize, "#0095DD");
        }
    }
}

function drawGameOver() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
}

function drawCenter() {
    let cx = canvasWidth / 2;
    let cy = canvasHeight / 2;
    drawRect(cx - centerSize/2, cy - centerSize/2, centerSize, centerSize, "#FF0000");
}

function collisionDetection() {
    for (let b of blocks) {
        if (b.status === 1) {
            if (ballX + ballRadius > b.x && ballX - ballRadius < b.x + blockSize && 
                ballY + ballRadius > b.y && ballY - ballRadius < b.y + blockSize) {
                let overlapLeft = ballX + ballRadius - b.x;
                let overlapRight = b.x + blockSize - (ballX - ballRadius);
                let overlapTop = ballY + ballRadius - b.y;
                let overlapBottom = b.y + blockSize - (ballY - ballRadius);
                
                let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    ballSpeedX = -ballSpeedX;
                } else {
                    ballSpeedY = -ballSpeedY;
                }
                
                b.status = 0;
                score++;
            }
        }
    }
}

function changePaddleSide() {
    sidesHit++;
    if (sidesHit % 4 === 0) {
        speedIncrease += 0.02;
    }
    
    if (paddleSide === 'top') {
        paddleSide = 'right';
        paddleWidth = 12;
        paddleHeight = 60;
        paddleX = canvasWidth - perimeterMargin - paddleWidth;
        paddleY = perimeterMargin;
    } else if (paddleSide === 'right') {
        paddleSide = 'bottom';
        paddleWidth = 60;
        paddleHeight = 12;
        paddleX = canvasWidth / 2 - paddleWidth / 2;
        paddleY = canvasHeight - perimeterMargin - paddleHeight;
    } else if (paddleSide === 'bottom') {
        paddleSide = 'left';
        paddleWidth = 12;
        paddleHeight = 60;
        paddleX = perimeterMargin;
        paddleY = canvasHeight / 2 - paddleHeight / 2;
    } else if (paddleSide === 'left') {
        paddleSide = 'top';
        paddleWidth = 60;
        paddleHeight = 12;
        paddleX = canvasWidth / 2 - paddleWidth / 2;
        paddleY = perimeterMargin;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    drawCenter();
    drawBlocks();
    drawBall();
    drawPaddle();
    
    if (isGameOver) {
        drawGameOver();
        return;
    }
    
    if (!ballStarted) {
        ballX = paddleX + paddleWidth / 2;
        ballY = paddleY + paddleHeight / 2;
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Presiona ESPACIO para iniciar", canvasWidth / 2, canvasHeight / 2 + 50);
        updateDisplay();
        requestAnimationFrame(draw);
        return;
    }
    
    collisionDetection();
    ballX += ballSpeedX + (ballSpeedX > 0 ? speedIncrease : -speedIncrease);
    ballY += ballSpeedY + (ballSpeedY > 0 ? speedIncrease : -speedIncrease);
    
    // wall collisions
    if (ballX + ballRadius > canvasWidth || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY + ballRadius > canvasHeight || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }
    
    // paddle collision
    if (ballX + ballRadius > paddleX && ballX - ballRadius < paddleX + paddleWidth &&
        ballY + ballRadius > paddleY && ballY - ballRadius < paddleY + paddleHeight) {
        
        if (paddleSide === 'top' || paddleSide === 'bottom') {
            ballSpeedY = -ballSpeedY;
            let hit = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            ballSpeedX += hit * 0.01;
            changePaddleSide();
        } else {
            ballSpeedX = -ballSpeedX;
            let hit = (ballY - (paddleY + paddleHeight / 2)) / (paddleHeight / 2);
            ballSpeedY += hit * 0.01;
            changePaddleSide();
        }
    }
    
    // center collision
    let cx = canvasWidth / 2;
    let cy = canvasHeight / 2;
    if (ballX + ballRadius > cx - centerSize/2 && ballX - ballRadius < cx + centerSize/2 &&
        ballY + ballRadius > cy - centerSize/2 && ballY - ballRadius < cy + centerSize/2) {
        lives--;
        if (lives === 0) {
            isGameOver = true;
        } else {
            ballStarted = false;
            ballSpeedX = 0.05;
            ballSpeedY = 0.05;
        }
    }
    
    // check if all blocks destroyed
    let blocksLeft = 0;
    for (let b of blocks) {
        if (b.status === 1) blocksLeft++;
    }
    
    if (blocksLeft === 0) {
        initBlocks();
    }
    
    updateDisplay();
    requestAnimationFrame(draw);
}

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "ArrowUp" || e.key === "Up") {
        upPressed = true;
    }
    else if (e.key === "ArrowDown" || e.key === "Down") {
        downPressed = true;
    }
    else if (e.key === "ArrowLeft" || e.key === "Left") {
        leftPressed = true;
    }
    else if (e.key === "ArrowRight" || e.key === "Right") {
        rightPressed = true;
    }
    if (e.code === "Space" && !ballStarted && !isGameOver) {
        ballStarted = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowUp" || e.key === "Up") {
        upPressed = false;
    }
    else if (e.key === "ArrowDown" || e.key === "Down") {
        downPressed = false;
    }
    else if (e.key === "ArrowLeft" || e.key === "Left") {
        leftPressed = false;
    }
    else if (e.key === "ArrowRight" || e.key === "Right") {
        rightPressed = false;
    }
}

function movePaddle() {
    const speed = 4;
    
    if (paddleSide === 'top') {
        if (leftPressed && paddleX > perimeterMargin) {
            paddleX -= speed;
        }
        if (rightPressed && paddleX < canvasWidth - perimeterMargin - paddleWidth) {
            paddleX += speed;
        }
    } else if (paddleSide === 'bottom') {
        if (leftPressed && paddleX > perimeterMargin) {
            paddleX -= speed;
        }
        if (rightPressed && paddleX < canvasWidth - perimeterMargin - paddleWidth) {
            paddleX += speed;
        }
    } else if (paddleSide === 'left') {
        if (upPressed && paddleY > perimeterMargin) {
            paddleY -= speed;
        }
        if (downPressed && paddleY < canvasHeight - perimeterMargin - paddleHeight) {
            paddleY += speed;
        }
    } else if (paddleSide === 'right') {
        if (upPressed && paddleY > perimeterMargin) {
            paddleY -= speed;
        }
        if (downPressed && paddleY < canvasHeight - perimeterMargin - paddleHeight) {
            paddleY += speed;
        }
    }
    
    updatePaddlePosition();
}

function gameLoop() {
    movePaddle();
    draw();
}

initBlocks();
setInterval(gameLoop, 1000 / 60);
restartBtn.addEventListener("click", restartGame);