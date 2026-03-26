/*
 * Breakout Game - TC2005B
 * Santiago Hernández - A01787550
 */

"use strict";

// global variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 600;

let game;
let oldTime = 0;

// class for the ball
class ball {
    constructor(position, radius, color) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.velocity = { x: 0, y: 0 };
        this.speed = 4;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // bounce off left and right walls
        if (this.position.x - this.radius < 0 || this.position.x + this.radius > canvasWidth) {
            this.velocity.x *= -1;
        }
        // bounce off top
        if (this.position.y - this.radius < 0) {
            this.velocity.y *= -1;
        }
    }

    reset() {
        this.position.x = canvasWidth / 2;
        this.position.y = canvasHeight - 40;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    serve() {
        // angle between 45 and 135 degrees
        let angle = Math.PI / 4 + Math.random() * Math.PI / 2;
        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = -Math.abs(Math.sin(angle)) * this.speed;
    }
}

// class for the paddle
class paddle {
    constructor(position, width, height, color) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocity = { x: 0, y: 0 };
        this.speed = 0.6;
        this.keys = [];
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(deltaTime) {
        this.velocity.x = 0;
        for (const direction of this.keys) {
            this.velocity.x += direction;
        }
        this.velocity.x *= this.speed;

        this.position.x += this.velocity.x * deltaTime;

        // keep paddle inside canvas
        if (this.position.x < 0) {
            this.position.x = 0;
        }
        if (this.position.x + this.width > canvasWidth) {
            this.position.x = canvasWidth - this.width;
        }
    }

    addKey(direction) {
        if (!this.keys.includes(direction)) {
            this.keys.push(direction);
        }
    }

    delKey(direction) {
        if (this.keys.includes(direction)) {
            this.keys.splice(this.keys.indexOf(direction), 1);
        }
    }
}

// class for blocks
class block {
    constructor(position, width, height, color) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.status = 1;
    }

    draw() {
        if (this.status === 1) {
            ctx.beginPath();
            ctx.rect(this.position.x, this.position.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}

// main game class
class game {
    constructor() {
        this.lives = 3;
        this.score = 0;
        this.level = 1;
        this.numRows = 5;
        this.numCols = 8;
        this.ballSpeed = 4;
        
        this.paddleWidth = 100;
        this.paddleHeight = 10;
        this.blockWidth = 75;
        this.blockHeight = 20;
        this.blockPadding = 10;
        this.blockOffsetTop = 30;
        this.blockOffsetLeft = 30;
        
        this.paddle = new paddle(
            { x: (canvasWidth - this.paddleWidth) / 2, y: canvasHeight - this.paddleHeight },
            this.paddleWidth,
            this.paddleHeight,
            "#0095DD"
        );
        
        this.ball = new ball(
            { x: canvasWidth / 2, y: canvasHeight - 40 },
            8,
            "#0095DD"
        );
        
        this.blocks = [];
        this.createBlocks();
        this.createEventListeners();
        
        this.gameOver = false;
        this.ballServed = false;
    }

    createBlocks() {
        this.blocks = [];
        for (let c = 0; c < this.numCols; c++) {
            this.blocks[c] = [];
            for (let r = 0; r < this.numRows; r++) {
                let blockX = (c * (this.blockWidth + this.blockPadding)) + this.blockOffsetLeft;
                let blockY = (r * (this.blockHeight + this.blockPadding)) + this.blockOffsetTop;
                this.blocks[c][r] = new block(
                    { x: blockX, y: blockY },
                    this.blockWidth,
                    this.blockHeight,
                    "#0095DD"
                );
            }
        }
    }

    createEventListeners() {
        window.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight" || event.key === "Right") {
                this.paddle.addKey(1);
            }
            if (event.key === "ArrowLeft" || event.key === "Left") {
                this.paddle.addKey(-1);
            }
            if (event.code === "Space" && !this.ballServed && !this.gameOver) {
                this.ball.serve();
                this.ballServed = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "ArrowRight" || event.key === "Right") {
                this.paddle.delKey(1);
            }
            if (event.key === "ArrowLeft" || event.key === "Left") {
                this.paddle.delKey(-1);
            }
        });
    }

    draw() {
        // clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // draw elements
        this.paddle.draw();
        this.ball.draw();
        
        for (let c = 0; c < this.numCols; c++) {
            for (let r = 0; r < this.numRows; r++) {
                this.blocks[c][r].draw();
            }
        }
        
        // draw score and lives (shown in html panel)
        
        if (this.gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.font = "40px Arial";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);
        }
        
        if (!this.ballServed && !this.gameOver) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Press SPACE to serve", canvasWidth / 2, canvasHeight / 2 + 50);
        }
    }

    update(deltaTime) {
        if (this.gameOver) return;
        
        this.paddle.update(deltaTime);
        
        if (this.ballServed) {
            this.ball.update(deltaTime);
        } else {
            // ball follows paddle before serve
            this.ball.position.x = this.paddle.position.x + this.paddle.width / 2;
            this.ball.position.y = this.paddle.position.y - this.ball.radius;
        }
        
        // check paddle collision
        if (this.ball.position.y + this.ball.radius > this.paddle.position.y &&
            this.ball.position.y - this.ball.radius < this.paddle.position.y + this.paddle.height &&
            this.ball.position.x > this.paddle.position.x &&
            this.ball.position.x < this.paddle.position.x + this.paddle.width) {
            
            // calculate where ball hit paddle (-1 = left edge, 1 = right edge)
            let hit = (this.ball.position.x - (this.paddle.position.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            
            // angle between 70 and 110 degrees (20 degree range each side)
            let angle = (Math.PI / 2) + hit * (Math.PI / 9);
            this.ball.velocity.x = Math.cos(angle) * this.ballSpeed;
            this.ball.velocity.y = -Math.abs(Math.sin(angle)) * this.ballSpeed;
        }
        
        // check block collision
        for (let c = 0; c < this.numCols; c++) {
            for (let r = 0; r < this.numRows; r++) {
                let b = this.blocks[c][r];
                if (b.status === 1) {
                    if (this.ball.position.x > b.position.x &&
                        this.ball.position.x < b.position.x + b.width &&
                        this.ball.position.y > b.position.y &&
                        this.ball.position.y < b.position.y + b.height) {
                        
                        this.ball.velocity.y *= -1;
                        b.status = 0;
                        this.score++;
                    }
                }
            }
        }
        
        // check if ball fell
        if (this.ball.position.y - this.ball.radius > canvasHeight) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver = true;
            } else {
                this.ball.reset();
                this.ballServed = false;
            }
        }
        
        // check if all blocks destroyed - next level
        let blocksLeft = 0;
        for (let c = 0; c < this.numCols; c++) {
            for (let r = 0; r < this.numRows; r++) {
                if (this.blocks[c][r].status === 1) {
                    blocksLeft++;
                }
            }
        }
        
        if (blocksLeft === 0) {
            this.level++;
            this.ballSpeed += 0.5;
            this.ball.reset();
            this.ballServed = false;
            
            // get rows and cols from inputs
            let rowsInput = document.getElementById("rowsInput").value;
            let colsInput = document.getElementById("colsInput").value;
            this.numRows = parseInt(rowsInput);
            this.numCols = parseInt(colsInput);
            
            this.createBlocks();
        }
        
        // update display
        document.getElementById("blocksDestroyed").textContent = this.score;
        document.getElementById("lives").textContent = this.lives;
        document.getElementById("level").textContent = this.level;
    }
}

// main function
function main() {
    const canvasEl = document.getElementById("gameCanvas");
    canvasEl.width = canvasWidth;
    canvasEl.height = canvasHeight;
    ctx = canvasEl.getContext("2d");
    
    game = new game();
    
    drawScene(0);
}

// main loop
function drawScene(newTime) {
    let deltaTime = newTime - oldTime;
    oldTime = newTime;
    
    game.update(deltaTime);
    game.draw(newTime);
    
    requestAnimationFrame(drawScene);
}

// restart function
function restartGame() {
    game = new game();
}

// init
document.getElementById("restartBtn").addEventListener("click", restartGame);
main();