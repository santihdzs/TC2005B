/*
 * Breakout Game - TC2005B
 * Based on Pong from class activities
 * 
 * Santiago Hernández - A01787550
 * 2026-03-26
 */

"use strict";

// --- Canvas and Context Setup ---
// Get the canvas element from HTML - this is where we draw the game
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d"); // getContext("2d") gives us the 2D drawing API

// --- Game Variables ---
// Canvas dimensions - like in Pong example
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Paddle properties - the bar at the bottom that player controls
const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvasWidth - paddleWidth) / 2; // center the paddle

// Ball properties - like the ball in Pong
const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight - 30;
let ballSpeedX = 4; // horizontal speed
let ballSpeedY = -4; // negative means it goes up

// Blocks configuration - can be changed by user
let numRows = 5; // default rows
let numCols = 8; // default columns
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 30;
const blockOffsetLeft = 30;

// Blocks array - will hold all the blocks
let blocks = [];

// Game state
let score = 0; // blocks destroyed
let lives = 3; // starting lives
let isGameOver = false;
let isGameWon = false;

// Special blocks - red ones that return two balls
let extraBalls = []; // array to hold extra balls

// HTML elements
const blocksDestroyedEl = document.getElementById("blocksDestroyed");
const livesEl = document.getElementById("lives");
const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const restartBtn = document.getElementById("restartBtn");

// --- Initialization ---

// Initialize blocks based on current row/col settings
function initBlocks() {
    blocks = []; // clear existing blocks
    
    // Create 2D array of blocks - nested loops like in class examples
    for (let c = 0; c < numCols; c++) {
        blocks[c] = []; // each column is an array
        for (let r = 0; r < numRows; r++) {
            // 10% chance of being a red block (special - returns 2 balls)
            let isSpecial = Math.random() < 0.1;
            blocks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, // 1 = active, 0 = destroyed
                isSpecial: isSpecial // special red block
            };
        }
    }
}

// Restart game - reset everything
function restartGame() {
    // Reset ball position and speed
    ballX = canvasWidth / 2;
    ballY = canvasHeight - 30;
    ballSpeedX = 4;
    ballSpeedY = -4;
    
    // Reset paddle
    paddleX = (canvasWidth - paddleWidth) / 2;
    
    // Reset score and lives
    score = 0;
    lives = 3;
    isGameOver = false;
    isGameWon = false;
    
    // Reset extra balls
    extraBalls = [];
    
    // Get new row/col values from inputs
    numRows = parseInt(rowsInput.value);
    numCols = parseInt(colsInput.value);
    
    // Initialize blocks
    initBlocks();
    
    // Update display
    updateDisplay();
}

// Update the HTML display elements
function updateDisplay() {
    blocksDestroyedEl.textContent = score;
    livesEl.textContent = lives;
}

// --- Drawing Functions ---

// Draw a filled rectangle - used for paddle and blocks
function drawRect(x, y, w, h, color) {
    ctx.beginPath(); // start a new path
    ctx.rect(x, y, w, h); // define rectangle
    ctx.fillStyle = color; // set fill color
    ctx.fill(); // fill the rectangle
    ctx.closePath(); // close the path
}

// Draw a circle - used for ball
function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2); // arc(x, y, radius, startAngle, endAngle)
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Draw the paddle
function drawPaddle() {
    drawRect(paddleX, canvasHeight - paddleHeight, paddleWidth, paddleHeight, "#0095DD");
}

// Draw the ball
function drawBall() {
    drawCircle(ballX, ballY, ballRadius, "#0095DD");
}

// Draw all blocks
function drawBlocks() {
    // Nested for loop - like in class examples for 2D arrays
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            // Only draw active blocks
            if (blocks[c][r].status === 1) {
                // Calculate block position
                let blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
                let blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
                
                // Store position in the block object
                blocks[c][r].x = blockX;
                blocks[c][r].y = blockY;
                
                // Red blocks are special, blue are normal
                if (blocks[c][r].isSpecial) {
                    drawRect(blockX, blockY, blockWidth, blockHeight, "#FF0000");
                } else {
                    drawRect(blockX, blockY, blockWidth, blockHeight, "#0095DD");
                }
            }
        }
    }
}

// Draw extra balls (from special blocks)
function drawExtraBalls() {
    for (let i = 0; i < extraBalls.length; i++) {
        let b = extraBalls[i];
        if (b.active) {
            drawCircle(b.x, b.y, ballRadius, "#FF0000");
        }
    }
}

// Draw game over message
function drawGameOver() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
}

// Draw victory message
function drawVictory() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvasWidth / 2, canvasHeight / 2);
}

// --- Collision Detection ---

// Check if ball hits a block
function collisionDetection() {
    for (let c = 0; c < numCols; c++) {
        for (let r = 0; r < numRows; r++) {
            let b = blocks[c][r];
            // Only check active blocks
            if (b.status === 1) {
                // Check if ball is inside the block
                if (ballX > b.x && ballX < b.x + blockWidth && 
                    ballY > b.y && ballY < b.y + blockHeight) {
                    // Ball hit the block
                    ballSpeedY = -ballSpeedY; // bounce
                    b.status = 0; // destroy block
                    score++;
                    
                    // If it's a special red block, create extra ball
                    if (b.isSpecial) {
                        createExtraBall();
                    }
                    
                    // Check if player won
                    if (score === numRows * numCols) {
                        isGameWon = true;
                    }
                }
            }
        }
    }
}

// Create an extra ball when hitting a red block
function createExtraBall() {
    extraBalls.push({
        x: ballX,
        y: ballY,
        speedX: -ballSpeedX, // opposite direction
        speedY: ballSpeedY,
        active: true
    });
}

// Update extra balls position
function updateExtraBalls() {
    for (let i = 0; i < extraBalls.length; i++) {
        let b = extraBalls[i];
        if (!b.active) continue;
        
        b.x += b.speedX;
        b.y += b.speedY;
        
        // Bounce off walls (left, right, top)
        if (b.x + ballRadius > canvasWidth || b.x - ballRadius < 0) {
            b.speedX = -b.speedX;
        }
        if (b.y - ballRadius < 0) {
            b.speedY = -b.speedY;
        }
        
        // Check if fell through bottom
        if (b.y + ballRadius > canvasHeight) {
            b.active = false;
        }
        
        // Check paddle collision
        if (b.y + ballRadius > canvasHeight - paddleHeight &&
            b.x > paddleX && b.x < paddleX + paddleWidth) {
            b.speedY = -b.speedY;
        }
    }
}

// --- Main Game Loop ---

function draw() {
    // Clear canvas each frame - like in Pong
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw everything
    drawBlocks();
    drawBall();
    drawPaddle();
    drawExtraBalls();
    
    // Check game over
    if (isGameOver) {
        drawGameOver();
        return;
    }
    
    // Check victory
    if (isGameWon) {
        drawVictory();
        return;
    }
    
    // Collision detection for main ball
    collisionDetection();
    
    // Ball movement - add speed to position
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // Update extra balls
    updateExtraBalls();
    
    // Wall collision - bounce off left wall
    if (ballX + ballRadius > canvasWidth) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX;
    }
    
    // Wall collision - bounce off top wall
    if (ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }
    
    // Paddle collision - bounce back up
    if (ballY + ballRadius > canvasHeight - paddleHeight) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -ballSpeedY;
            // Add some angle based on where it hit the paddle
            let deltaX = ballX - (paddleX + paddleWidth / 2);
            ballSpeedX = deltaX * 0.1;
        }
    }
    
    // Ball fell through bottom - lose a life
    if (ballY + ballRadius > canvasHeight) {
        lives--;
        
        if (lives === 0) {
            isGameOver = true;
        } else {
            // Reset ball position
            ballX = canvasWidth / 2;
            ballY = canvasHeight - 30;
            ballSpeedX = 4;
            ballSpeedY = -4;
            paddleX = (canvasWidth - paddleWidth) / 2;
        }
    }
    
    // Update HTML display
    updateDisplay();
    
    // Request next frame - like in Pong game loop
    requestAnimationFrame(draw);
}

// --- Input Handling ---

// Keyboard event listener - like in Pong
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

let rightPressed = false;
let leftPressed = false;

function keyDownHandler(e) {
    // Right arrow or D key
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        rightPressed = true;
    }
    // Left arrow or A key
    else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    // Right arrow or D key
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        rightPressed = false;
    }
    // Left arrow or A key
    else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        leftPressed = false;
    }
}

// Mouse movement - additional control option
document.addEventListener("mousemove", mouseMoveHandler);

function mouseMoveHandler(e) {
    // Calculate relative position within the canvas
    let relativeX = e.clientX - canvas.offsetLeft;
    
    // Make sure paddle stays within canvas
    if (relativeX > 0 && relativeX < canvasWidth) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// --- Start Game ---

// Initialize and start the game
initBlocks();
draw();

// Restart button click handler
restartBtn.addEventListener("click", restartGame);