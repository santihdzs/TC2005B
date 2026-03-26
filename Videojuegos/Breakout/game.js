/*
 * Breakout Game - TC2005B
 * Santiago Hernández - A01787550
 */

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvasWidth - paddleWidth) / 2;

const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight - 30;
let ballSpeedX = 4;
let ballSpeedY = -4;

let numRows = 5;
let numCols = 8;
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 30;
const blockOffsetLeft = 30;

let blocks = [];
let score = 0;
let lives = 3;
let isGameOver = false;
let isGameWon = false;
let extraBalls = [];

const blocksDestroyedEl = document.getElementById("blocksDestroyed");
const livesEl = document.getElementById("lives");
const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const restartBtn = document.getElementById("restartBtn");

function initBlocks() {
    blocks = [];
    for (let c = 0; c < numCols; c++) {
        blocks[c] = [];
        for (let r = 0; r < numRows; r++) {
            let isSpecial = Math.random() < 0.1;
            blocks[c][r] = { x: 0, y: 0, status: 1, isSpecial: isSpecial };
        }
    }
}

function restartGame() {
    ballX = canvasWidth / 2;
    ballY = canvasHeight - 30;
    ballSpeedX = 4;
    ballSpeedY = -4;
    paddleX = (canvasWidth - paddleWidth) / 2;
    score = 0;
    lives = 3;
    isGameOver = false;
    isGameWon = false;
    extraBalls = [];
    numRows = parseInt(rowsInput.value);
    numCols = parseInt(colsInput.value);
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
    drawRect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight, "#0095DD");
}

function drawBall() {
    drawCircle(ballX, ballY, ballRadius, "#0095DD");
}

function drawBlocks() {
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            if (blocks[c][r].status === 1) {
                let blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
                let blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
                blocks[c][r].x = blockX;
                blocks[c][r].y = blockY;
                if (blocks[c][r].isSpecial) {
                    drawRect(blockX, blockY, blockWidth, blockHeight, "#FF0000");
                } else {
                    drawRect(blockX, blockY, blockWidth, blockHeight, "#0095DD");
                }
            }
        }
    }
}

function drawExtraBalls() {
    for (let i = 0; i < extraBalls.length; i++) {
        let b = extraBalls[i];
        if (b.active) {
            drawCircle(b.x, b.y, ballRadius, "#FF0000");
        }
    }
}

function drawGameOver() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
}

function drawVictory() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvasWidth / 2, canvasHeight / 2);
}

function collisionDetection() {
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            let b = blocks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + blockWidth && 
                    ballY > b.y && ballY < b.y + blockHeight) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    score++;
                    if (b.isSpecial) {
                        createExtraBall();
                    }
                    if (score === numRows * numCols) {
                        isGameWon = true;
                    }
                }
            }
        }
    }
}

function createExtraBall() {
    extraBalls.push({
        x: ballX,
        y: ballY,
        speedX: -ballSpeedX,
        speedY: ballSpeedY,
        active: true
    });
}

function updateExtraBalls() {
    for (let i = 0; i < extraBalls.length; i++) {
        let b = extraBalls[i];
        if (!b.active) continue;
        b.x += b.speedX;
        b.y += b.speedY;
        if (b.x + ballRadius > canvasWidth || b.x - ballRadius < 0) {
            b.speedX = -b.speedX;
        }
        if (b.y - ballRadius < 0) {
            b.speedY = -b.speedY;
        }
        if (b.y + ballRadius > canvasHeight) {
            b.active = false;
        }
        if (b.y + ballRadius > canvasHeight - paddleHeight &&
            b.x > paddleX && b.x < paddleX + paddleWidth) {
            b.speedY = -b.speedY;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBlocks();
    drawBall();
    drawPaddle();
    drawExtraBalls();
    
    if (isGameOver) {
        drawGameOver();
        return;
    }
    
    if (isGameWon) {
        drawVictory();
        return;
    }
    
    collisionDetection();
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    updateExtraBalls();
    
    if (ballX + ballRadius > canvasWidth || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }
    if (ballY + ballRadius > canvasHeight - paddleHeight) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -ballSpeedY;
            let deltaX = ballX - (paddleX + paddleWidth / 2);
            ballSpeedX = deltaX * 0.1;
        }
    }
    
    if (ballY + ballRadius > canvasHeight) {
        lives--;
        if (lives === 0) {
            isGameOver = true;
        } else {
            ballX = canvasWidth / 2;
            ballY = canvasHeight - 30;
            ballSpeedX = 4;
            ballSpeedY = -4;
            paddleX = (canvasWidth - paddleWidth) / 2;
        }
    }
    
    updateDisplay();
    requestAnimationFrame(draw);
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function movePaddle() {
    if (rightPressed && paddleX < canvasWidth - paddleWidth) {
        paddleX += 7;
    }
    else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
}

function gameLoop() {
    movePaddle();
    draw();
}

initBlocks();
setInterval(gameLoop, 1000 / 60);
restartBtn.addEventListener("click", restartGame);