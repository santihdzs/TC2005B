/*
 * Breakout Game - TC2005B
 * Santiago Hernández - A01787550
 */

"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 600;

const centerSize = 50;

// Brick config
const brickThickness = 20;
const brickRows = 3;
const brickGap = 2;
const brickDepth = brickRows * (brickThickness + brickGap);
const brickLengthH = 40;
const brickLengthV = 40;

// Paddle track - the perimeter rectangle just inside the bricks
const trackLeft = brickDepth;
const trackTop = brickDepth;
const trackRight = canvasWidth - brickDepth;
const trackBottom = canvasHeight - brickDepth;
const trackW = trackRight - trackLeft;
const trackH = trackBottom - trackTop;
const trackPerimeter = 2 * trackW + 2 * trackH;

// Paddle config
const paddleLength = 80;
const paddleThick = 12;
let paddlePos = 0; // distance along perimeter, clockwise from top-left corner
let paddleSide = 'bottom';

const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight / 2;
let ballSpeedX = 3;
let ballSpeedY = 3;

let blocks = [];
let score = 0;
let lives = 3;
let isGameOver = false;
let ballStarted = false;

const blocksDestroyedEl = document.getElementById("blocksDestroyed");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

function initBlocks() {
    blocks = [];

    // Top rows
    for (let row = 0; row < brickRows; row++) {
        let y = row * (brickThickness + brickGap);
        let count = Math.floor(canvasWidth / (brickLengthH + brickGap));
        let totalW = count * (brickLengthH + brickGap) - brickGap;
        let offsetX = (canvasWidth - totalW) / 2;
        for (let col = 0; col < count; col++) {
            blocks.push({
                x: offsetX + col * (brickLengthH + brickGap),
                y: y,
                w: brickLengthH,
                h: brickThickness,
                status: 1,
                side: 'top'
            });
        }
    }

    // Bottom rows
    for (let row = 0; row < brickRows; row++) {
        let y = canvasHeight - (row + 1) * (brickThickness + brickGap) + brickGap;
        let count = Math.floor(canvasWidth / (brickLengthH + brickGap));
        let totalW = count * (brickLengthH + brickGap) - brickGap;
        let offsetX = (canvasWidth - totalW) / 2;
        for (let col = 0; col < count; col++) {
            blocks.push({
                x: offsetX + col * (brickLengthH + brickGap),
                y: y,
                w: brickLengthH,
                h: brickThickness,
                status: 1,
                side: 'bottom'
            });
        }
    }

    // Left columns (skip corners covered by top/bottom)
    for (let row = 0; row < brickRows; row++) {
        let x = row * (brickThickness + brickGap);
        let startY = brickDepth;
        let endY = canvasHeight - brickDepth;
        let space = endY - startY;
        let count = Math.floor(space / (brickLengthV + brickGap));
        let totalH = count * (brickLengthV + brickGap) - brickGap;
        let offsetY = startY + (space - totalH) / 2;
        for (let col = 0; col < count; col++) {
            blocks.push({
                x: x,
                y: offsetY + col * (brickLengthV + brickGap),
                w: brickThickness,
                h: brickLengthV,
                status: 1,
                side: 'left'
            });
        }
    }

    // Right columns
    for (let row = 0; row < brickRows; row++) {
        let x = canvasWidth - (row + 1) * (brickThickness + brickGap) + brickGap;
        let startY = brickDepth;
        let endY = canvasHeight - brickDepth;
        let space = endY - startY;
        let count = Math.floor(space / (brickLengthV + brickGap));
        let totalH = count * (brickLengthV + brickGap) - brickGap;
        let offsetY = startY + (space - totalH) / 2;
        for (let col = 0; col < count; col++) {
            blocks.push({
                x: x,
                y: offsetY + col * (brickLengthV + brickGap),
                w: brickThickness,
                h: brickLengthV,
                status: 1,
                side: 'right'
            });
        }
    }
}

// Convert perimeter distance to x,y and side
function perimToXY(p) {
    p = ((p % trackPerimeter) + trackPerimeter) % trackPerimeter;
    if (p < trackW) {
        return { x: trackLeft + p, y: trackTop, side: 'top' };
    } else if (p < trackW + trackH) {
        return { x: trackRight, y: trackTop + (p - trackW), side: 'right' };
    } else if (p < 2 * trackW + trackH) {
        return { x: trackRight - (p - trackW - trackH), y: trackBottom, side: 'bottom' };
    } else {
        return { x: trackLeft, y: trackBottom - (p - 2 * trackW - trackH), side: 'left' };
    }
}

function getPaddleRect() {
    let center = perimToXY(paddlePos);
    paddleSide = center.side;

    if (center.side === 'top') {
        return { x: center.x - paddleLength / 2, y: trackTop - paddleThick, w: paddleLength, h: paddleThick };
    } else if (center.side === 'bottom') {
        return { x: center.x - paddleLength / 2, y: trackBottom, w: paddleLength, h: paddleThick };
    } else if (center.side === 'left') {
        return { x: trackLeft - paddleThick, y: center.y - paddleLength / 2, w: paddleThick, h: paddleLength };
    } else {
        return { x: trackRight, y: center.y - paddleLength / 2, w: paddleThick, h: paddleLength };
    }
}

function restartGame() {
    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
    ballSpeedX = 3;
    ballSpeedY = 3;
    score = 0;
    lives = 3;
    isGameOver = false;
    ballStarted = false;
    paddlePos = trackW + trackH + trackW / 2; // bottom center
    initBlocks();
    updateDisplay();
}

function resetBall() {
    ballStarted = false;
    ballSpeedX = 3;
    ballSpeedY = 3;
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
    let pr = getPaddleRect();
    drawRect(pr.x, pr.y, pr.w, pr.h, "#3333AA");
}

function drawBall() {
    drawCircle(ballX, ballY, ballRadius, "#0095DD");
}

function drawBlocks() {
    for (let b of blocks) {
        if (b.status === 1) {
            let color;
            if (b.side === 'top') color = "#FF6633";
            else if (b.side === 'bottom') color = "#33CC33";
            else if (b.side === 'left') color = "#FFCC00";
            else color = "#CC33FF";
            drawRect(b.x, b.y, b.w, b.h, color);
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        }
    }
}

function drawCenter() {
    let cx = canvasWidth / 2;
    let cy = canvasHeight / 2;
    drawRect(cx - centerSize / 2, cy - centerSize / 2, centerSize, centerSize, "#FF0000");
    ctx.strokeStyle = "#AA0000";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - centerSize / 2, cy - centerSize / 2, centerSize, centerSize);
}

function drawGameOver() {
    ctx.font = "40px Verdana";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 + 100);
}

function collisionDetection() {
    for (let b of blocks) {
        if (b.status === 1) {
            if (ballX + ballRadius > b.x && ballX - ballRadius < b.x + b.w &&
                ballY + ballRadius > b.y && ballY - ballRadius < b.y + b.h) {

                let overlapLeft = ballX + ballRadius - b.x;
                let overlapRight = b.x + b.w - (ballX - ballRadius);
                let overlapTop = ballY + ballRadius - b.y;
                let overlapBottom = b.y + b.h - (ballY - ballRadius);

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

function checkPaddleCollision() {
    let pr = getPaddleRect();

    if (ballX + ballRadius > pr.x && ballX - ballRadius < pr.x + pr.w &&
        ballY + ballRadius > pr.y && ballY - ballRadius < pr.y + pr.h) {

        if (paddleSide === 'top') {
            ballSpeedY = Math.abs(ballSpeedY);
            let hit = (ballX - (pr.x + pr.w / 2)) / (pr.w / 2);
            ballSpeedX += hit * 0.5;
        } else if (paddleSide === 'bottom') {
            ballSpeedY = -Math.abs(ballSpeedY);
            let hit = (ballX - (pr.x + pr.w / 2)) / (pr.w / 2);
            ballSpeedX += hit * 0.5;
        } else if (paddleSide === 'left') {
            ballSpeedX = Math.abs(ballSpeedX);
            let hit = (ballY - (pr.y + pr.h / 2)) / (pr.h / 2);
            ballSpeedY += hit * 0.5;
        } else if (paddleSide === 'right') {
            ballSpeedX = -Math.abs(ballSpeedX);
            let hit = (ballY - (pr.y + pr.h / 2)) / (pr.h / 2);
            ballSpeedY += hit * 0.5;
        }

        // Clamp speed
        let maxSpeed = 7;
        ballSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, ballSpeedX));
        ballSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, ballSpeedY));
    }
}

function checkCenterCollision() {
    let cx = canvasWidth / 2;
    let cy = canvasHeight / 2;
    let half = centerSize / 2;

    if (ballX + ballRadius > cx - half && ballX - ballRadius < cx + half &&
        ballY + ballRadius > cy - half && ballY - ballRadius < cy + half) {
        lives--;
        if (lives <= 0) {
            isGameOver = true;
        } else {
            resetBall();
        }
    }
}

function checkWallBounce() {
    if (ballX - ballRadius < 0) {
        ballX = ballRadius;
        ballSpeedX = Math.abs(ballSpeedX);
    }
    if (ballX + ballRadius > canvasWidth) {
        ballX = canvasWidth - ballRadius;
        ballSpeedX = -Math.abs(ballSpeedX);
    }
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballSpeedY = Math.abs(ballSpeedY);
    }
    if (ballY + ballRadius > canvasHeight) {
        ballY = canvasHeight - ballRadius;
        ballSpeedY = -Math.abs(ballSpeedY);
    }
}

// Input
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
        // Launch ball away from current paddle side
        if (paddleSide === 'top') { ballSpeedX = 3; ballSpeedY = 3; }
        else if (paddleSide === 'bottom') { ballSpeedX = 3; ballSpeedY = -3; }
        else if (paddleSide === 'left') { ballSpeedX = 3; ballSpeedY = 3; }
        else if (paddleSide === 'right') { ballSpeedX = -3; ballSpeedY = 3; }
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
    let center = perimToXY(paddlePos);
    let side = center.side;

    // arrow keys map to perimeter movement based on side
    let move = 0;

    if (side === 'top') {
        if (leftPressed) move = -speed;
        if (rightPressed) move = speed;
    } else if (side === 'right') {
        if (upPressed) move = -speed;
        if (downPressed) move = speed;
    } else if (side === 'bottom') {
        if (leftPressed) move = speed;
        if (rightPressed) move = -speed;
    } else if (side === 'left') {
        if (upPressed) move = speed;
        if (downPressed) move = -speed;
    }

    if (move !== 0) {
        paddlePos = ((paddlePos + move) % trackPerimeter + trackPerimeter) % trackPerimeter;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawCenter();
    drawBlocks();
    drawPaddle();
    drawBall();

    if (isGameOver) {
        drawGameOver();
        updateDisplay();
        return;
    }

    if (!ballStarted) {
        // Ball sticks to paddle
        let pr = getPaddleRect();
        if (paddleSide === 'top') {
            ballX = pr.x + pr.w / 2;
            ballY = pr.y + pr.h + ballRadius + 2;
        } else if (paddleSide === 'bottom') {
            ballX = pr.x + pr.w / 2;
            ballY = pr.y - ballRadius - 2;
        } else if (paddleSide === 'left') {
            ballX = pr.x + pr.w + ballRadius + 2;
            ballY = pr.y + pr.h / 2;
        } else if (paddleSide === 'right') {
            ballX = pr.x - ballRadius - 2;
            ballY = pr.y + pr.h / 2;
        }

        ctx.font = "20px Verdana";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Presiona ESPACIO para iniciar", canvasWidth / 2, canvasHeight / 2 + 80);
        updateDisplay();
        return;
    }

    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    checkWallBounce();
    collisionDetection();
    checkPaddleCollision();
    checkCenterCollision();

    // Check win
    let blocksLeft = 0;
    for (let b of blocks) {
        if (b.status === 1) blocksLeft++;
    }
    if (blocksLeft === 0) {
        initBlocks();
    }

    updateDisplay();
}

function gameLoop() {
    movePaddle();
    draw();
    requestAnimationFrame(gameLoop);
}

// Init
paddlePos = trackW + trackH + trackW / 2; // bottom center
initBlocks();
updateDisplay();
requestAnimationFrame(gameLoop);
restartBtn.addEventListener("click", restartGame);