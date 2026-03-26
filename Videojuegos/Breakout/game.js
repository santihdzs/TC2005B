/*
 * Breakout Game - TC2005B
 * Santiago Hernández - A01787550
 */

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 600;

const paddleWidth = 60;
const paddleHeight = 60;
let paddleX = canvasWidth / 2 - paddleWidth / 2;
let paddleY = canvasHeight / 2 - paddleHeight / 2;

const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;
let ballSpeedX = 0.5;
let ballSpeedY = 0.5;

const paddleMargin = 100;
const minPaddleX = paddleMargin;
const maxPaddleX = canvasWidth - paddleMargin - paddleWidth;
const minPaddleY = paddleMargin;
const maxPaddleY = canvasHeight - paddleMargin - paddleHeight;

const blockSize = 30;
let blocks = [];
let score = 0;
let lives = 3;
let isGameOver = false;
let ballStarted = false;

const blocksDestroyedEl = document.getElementById("blocksDestroyed");
const livesEl = document.getElementById("lives");
const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
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
    ballSpeedX = 0.5;
    ballSpeedY = 0.5;
    paddleX = canvasWidth / 2 - paddleWidth / 2;
    paddleY = canvasHeight / 2 - paddleHeight / 2;
    score = 0;
    lives = 3;
    isGameOver = false;
    ballStarted = false;
    initBlocks();
    updateDisplay();
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
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, 25, 0, Math.PI * 2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function collisionDetection() {
    for (let b of blocks) {
        if (b.status === 1) {
            if (ballX + ballRadius > b.x && ballX - ballRadius < b.x + blockSize && 
                ballY + ballRadius > b.y && ballY - ballRadius < b.y + blockSize) {
                // determine which side was hit
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

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // draw center danger zone
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
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
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
        // reverse based on where it hit
        let hitX = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        let hitY = (ballY - (paddleY + paddleHeight / 2)) / (paddleHeight / 2);
        
        if (Math.abs(hitX) > Math.abs(hitY)) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX += hitX * 0.3;
        } else {
            ballSpeedY = -ballSpeedY;
            ballSpeedY += hitY * 0.3;
        }
    }
    
    // center collision
    let distToCenter = Math.sqrt(Math.pow(ballX - canvasWidth/2, 2) + Math.pow(ballY - canvasHeight/2, 2));
    if (distToCenter < 25 + ballRadius) {
        lives--;
        if (lives === 0) {
            isGameOver = true;
        } else {
            ballStarted = false;
            ballSpeedX = 0.5;
            ballSpeedY = 0.5;
        }
    }
    
    // check if all blocks destroyed
    let blocksLeft = 0;
    for (let b of blocks) {
        if (b.status === 1) blocksLeft++;
    }
    
    if (blocksLeft === 0) {
        initBlocks();
        ballSpeedX += 0.2;
        ballSpeedY += 0.2;
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
    const speed = 5;
    if (upPressed && paddleY > minPaddleY) {
        paddleY -= speed;
    }
    if (downPressed && paddleY < maxPaddleY) {
        paddleY += speed;
    }
    if (leftPressed && paddleX > minPaddleX) {
        paddleX -= speed;
    }
    if (rightPressed && paddleX < maxPaddleX) {
        paddleX += speed;
    }
}

function gameLoop() {
    movePaddle();
    draw();
}

initBlocks();
setInterval(gameLoop, 1000 / 60);
restartBtn.addEventListener("click", restartGame);