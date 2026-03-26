/*
 * Breakout Game - TC2005B
 * Santiago Hernández - A01787550
 */

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 600;

const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvasWidth - paddleWidth) / 2;
let paddleY = canvasHeight - 40;

const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight - 30;
let ballSpeedX = 2.5;
let ballSpeedY = -2.5;

let numRows = 5;
let numCols = 8;
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 50;

let blocks = [];
let score = 0;
let lives = 3;
let isGameOver = false;
let isGameWon = false;
let flipped = false;
let lastFlipTime = 0;
const flipInterval = 8000;

const blocksDestroyedEl = document.getElementById("blocksDestroyed");
const livesEl = document.getElementById("lives");
const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const restartBtn = document.getElementById("restartBtn");

function initBlocks() {
    blocks = [];
    let totalWidth = numCols * blockWidth + (numCols - 1) * blockPadding;
    let blockOffsetLeft = (canvasWidth - totalWidth) / 2;
    
    for (let c = 0; c < numCols; c++) {
        blocks[c] = [];
        for (let r = 0; r < numRows; r++) {
            blocks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function restartGame() {
    ballX = canvasWidth / 2;
    ballY = paddleY - ballRadius;
    ballSpeedX = 2.5;
    ballSpeedY = -2.5;
    paddleX = (canvasWidth - paddleWidth) / 2;
    paddleY = flipped ? 40 : canvasHeight - 40;
    score = 0;
    lives = 3;
    isGameOver = false;
    isGameWon = false;
    flipped = false;
    lastFlipTime = Date.now();
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
    drawRect(paddleX, paddleY, paddleWidth, paddleHeight, "#0095DD");
}

function drawBall() {
    drawCircle(ballX, ballY, ballRadius, "#0095DD");
}

function drawBlocks() {
    let totalWidth = numCols * blockWidth + (numCols - 1) * blockPadding;
    let blockOffsetLeft = (canvasWidth - totalWidth) / 2;
    
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            if (blocks[c][r].status === 1) {
                let blockY;
                if (flipped) {
                    blockY = canvasHeight - blockOffsetTop - (r + 1) * (blockHeight + blockPadding) + blockPadding;
                } else {
                    blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
                }
                let blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
                blocks[c][r].x = blockX;
                blocks[c][r].y = blockY;
                drawRect(blockX, blockY, blockWidth, blockHeight, "#0095DD");
            }
        }
    }
}

function drawGameOver() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
}

function collisionDetection() {
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            let b = blocks[c][r];
            if (b.status === 1) {
                if (ballX + ballRadius > b.x && ballX - ballRadius < b.x + blockWidth && 
                    ballY + ballRadius > b.y && ballY - ballRadius < b.y + blockHeight) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    score++;
                    if (score === numRows * numCols) {
                        isGameWon = true;
                    }
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBlocks();
    drawBall();
    drawPaddle();
    
    if (isGameOver) {
        drawGameOver();
        return;
    }
    
    if (isGameWon) {
        score = 0;
        isGameWon = false;
        ballX = canvasWidth / 2;
        ballY = paddleY - ballRadius;
        ballSpeedX = 2.5;
        ballSpeedY = -2.5;
        paddleX = (canvasWidth - paddleWidth) / 2;
        initBlocks();
    }
    
    // flip every 5 seconds
    let currentTime = Date.now();
    if (currentTime - lastFlipTime > flipInterval) {
        flipped = !flipped;
        paddleY = flipped ? 40 : canvasHeight - 40;
        ballSpeedY = -ballSpeedY;
        lastFlipTime = currentTime;
    }
    
    collisionDetection();
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    if (ballX + ballRadius > canvasWidth || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX;
    }
    
    if (flipped) {
        if (ballY - ballRadius < 0) {
            ballSpeedY = -ballSpeedY;
        }
        if (ballY + ballRadius > paddleY && ballY - ballRadius < paddleY + paddleHeight) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                ballSpeedY = -ballSpeedY;
                let hit = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
                let angle = (Math.PI / 2) + hit * (Math.PI / 9);
                ballSpeedX = Math.cos(angle) * 2.5;
                ballSpeedY = -Math.abs(Math.sin(angle)) * 4;
            }
        }
        if (ballY + ballRadius > canvasHeight) {
            lives--;
            if (lives === 0) {
                isGameOver = true;
            } else {
                ballX = canvasWidth / 2;
                ballY = paddleY - ballRadius;
                ballSpeedX = 2.5;
                ballSpeedY = 2.5;
                paddleX = (canvasWidth - paddleWidth) / 2;
            }
        }
    } else {
        if (ballY - ballRadius < 0) {
            ballSpeedY = -ballSpeedY;
        }
        if (ballY + ballRadius > paddleY && ballY - ballRadius < paddleY + paddleHeight) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                ballSpeedY = -ballSpeedY;
                let hit = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
                let angle = (Math.PI / 2) + hit * (Math.PI / 9);
                ballSpeedX = Math.cos(angle) * 2.5;
                ballSpeedY = Math.abs(Math.sin(angle)) * 4;
            }
        }
        if (ballY + ballRadius > canvasHeight) {
            lives--;
            if (lives === 0) {
                isGameOver = true;
            } else {
                ballX = canvasWidth / 2;
                ballY = paddleY - ballRadius;
                ballSpeedX = 2.5;
                ballSpeedY = -2.5;
                paddleX = (canvasWidth - paddleWidth) / 2;
            }
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
    else if (e.key === "ArrowLeft" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function movePaddle() {
    if (flipped) {
        if (rightPressed && paddleX < canvasWidth - paddleWidth) {
            paddleX += 7;
        }
        else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    } else {
        if (rightPressed && paddleX < canvasWidth - paddleWidth) {
            paddleX += 7;
        }
        else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    }
}

function gameLoop() {
    movePaddle();
    draw();
}

initBlocks();
lastFlipTime = Date.now();
setInterval(gameLoop, 1000 / 60);
restartBtn.addEventListener("click", restartGame);