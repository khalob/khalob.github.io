var canvas;
var ctx;
var cellSize;
var keys;
var p1;
var p2;
var mainTimer;
var paused;
var foodTimer;
var food;
var foodDelay;

//Initialize Game
init();

function init() {
	cellSize = [10, 10];
	keys = new Array(500);
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	p1 = new Player(5, 100, 490, "UP", "rgba(255, 0, 0,", "Red");
	p2 = new Player(5, 400, 490, "UP", "rgba(0, 0, 255,", "Blue");
	mainTimer = setInterval(gameLoop, 100);
	foodTimer = 0;
	paused = false;
	food = [];
	foodDelay = 80;
	spawnFood();
}

function gameOver(winnerName) {
	//Stop game mechanics
	clearInterval(mainTimer);

	//Clear game screen
	setTimeout(clearScreen, 10);

	//Display Winner
	setTimeout(function () {
		displayWinner(winnerName);
	}, 15);

	//Clear remaining variables
	setTimeout(clearVariables, 2900);

	//Restart Game
	setTimeout(init, 3000);
}

function displayWinner(winnerName) {
	ctx.font = "70px Georgia";
	ctx.fillStyle = "#ffffff";
	var textWidth = winnerName.length * 5;
	ctx.fillText(winnerName + " wins!", 110 - textWidth, 200);
}

function clearScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearVariables() {
	mainTimer = null;
	cellSize = null;
	keys = null;
	p1 = null;
	p2 = null;
	canvas = null;
	ctx = null;
}

function pause() {
	paused = !paused;
}

function Cell(posX, posY) {
	this.x = posX;
	this.y = posY;
}

function Player(size, posX, posY, direction, color, name) {
	this.cells = [new Cell(posX, posY)];
	this.curDir = direction;
	this.color = color;
	this.name = name;
	var nextPos;

	this.Grow = function () {
		nextPos = getNextPos(this);
		//push a new cell at tail.x + direction and tail.y + direction
		this.cells.push(new Cell((nextPos[0] * -1), (nextPos[1] * -1)));
	};

	//Initialize player based on size
	for (i = 0; i < size - 1; i++) {
		this.Grow();
	}
}

window.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
	// space and arrow keys will not scroll
	if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
		e.preventDefault();
	}
});

window.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
	if (e.keyCode == 32) { //spacebar
		pause();
	}
});

function draw(obj, color, isGradient) {
	var shade = .75;
	var shadeDiff = 0;
	var patternLength = 7;
	for (i = 0; i < obj.length; i++) {
		if (isGradient) {
			if (Math.floor(i / patternLength) % 2 == 0) {
				shadeDiff = (i % patternLength * 0.075);
			} else {
				shadeDiff = ((patternLength - (i % patternLength)) * 0.075);
			}
			ctx.fillStyle = color + " " + (shade - shadeDiff) + ")";
		} else {
			ctx.fillStyle = color;
		}
		ctx.fillRect(obj[i].x, obj[i].y, cellSize[0], cellSize[1]);
	}

}

function gameLoop() {
	if (!paused) {
		clearScreen();
		whatKeyArrows(p1);
		if (movePlayer(p1, p2) == -1) {
			return;
		}
		draw(p1.cells, p1.color, true);
		whatKeyWASD(p2);
		if (movePlayer(p2, p1)) {
			return;
		}
		draw(p2.cells, p2.color, true);
		draw(food, "green", false);
		addFoodTimer();
		if (foodTimer == foodDelay) {
			spawnFood();
		}
	}
}

function whatKeyArrows(p) {
	if (keys[37] && p.curDir != "RIGHT") {
		p.curDir = "LEFT";
	}
	if (keys[39] && p.curDir != "LEFT") {
		p.curDir = "RIGHT";
	}
	if (keys[40] && p.curDir != "UP") {
		p.curDir = "DOWN";
	}
	if (keys[38] && p.curDir != "DOWN") {
		p.curDir = "UP";
	}
}

function whatKeyWASD(p) {
	if (keys[65] && p.curDir != "RIGHT") {
		p.curDir = "LEFT";
	}
	if (keys[68] && p.curDir != "LEFT") {
		p.curDir = "RIGHT";
	}
	if (keys[83] && p.curDir != "UP") {
		p.curDir = "DOWN";
	}
	if (keys[87] && p.curDir != "DOWN") {
		p.curDir = "UP";
	}
}

function movePlayer(p, otherP) {
	var nextPos = getNextPos(p);
	var curX = p.cells[0].x;
	var curY = p.cells[0].y;
	var tempX;
	var tempY;
	//     Self Collision
	if (collision(p.cells, nextPos[0], nextPos[1], 1)) {
		gameOver(otherP.name);
	}
	//      Food Collision
	if (collision(food, nextPos[0], nextPos[1], 0)) {
		eatFood(p, nextPos[0], nextPos[1]);
	}
	//     Other Player Collision
	if (collision(otherP.cells, nextPos[0], nextPos[1], 0)) {
		gameOver(otherP.name);
		return -1;
	}

	//move head
	p.cells[0].x = nextPos[0];
	p.cells[0].y = nextPos[1];
	//move the rest
	for (i = 1; i < p.cells.length; i++) {
		//temp store cell pos
		tempX = p.cells[i].x;
		tempY = p.cells[i].y;
		p.cells[i].x = curX;
		p.cells[i].y = curY;
		curX = tempX;
		curY = tempY;
	}
}

function collision(array, checkX, checkY, startNum) {
	for (i = startNum; i < array.length; i++) {
		if (array[i].x == checkX && array[i].y == checkY) {
			return true;
		}
	}
	return false;
}

function getNextPos(p) {
	var nextCellX = p.cells[0].x;
	var nextCellY = p.cells[0].y;
	switch (p.curDir) {
		case "LEFT":
			nextCellX += -1 * cellSize[0];
			break;
		case "UP":
			nextCellY += -1 * cellSize[1];
			break;
		case "RIGHT":
			nextCellX += cellSize[0];
			break;
		case "DOWN":
			nextCellY += cellSize[1];
			break;
	}
	if (nextCellX >= canvas.width) {
		nextCellX = 0;
	} else if (nextCellX < 0) {
		nextCellX = canvas.width;
	}

	if (nextCellY >= canvas.height) {
		nextCellY = 0;
	} else if (nextCellY < 0) {
		nextCellY = canvas.height;
	}
	return [nextCellX, nextCellY];
}

function spawnFood() {
	var x = Math.floor((Math.random() * (canvas.width / cellSize[0]))) * cellSize[0];
	var y = Math.floor((Math.random() * (canvas.width / cellSize[1]))) * cellSize[1];
	food.push(new Cell(x, y));
}

function eatFood(p, x, y) {
	for (i = 0; i < food.length; i++) {
		if (food[i].x == x && food[i].y == y) {
			//remove one item at food[i]

			food.splice(i, 1);
		}
	}
	p.Grow();
}

function addFoodTimer() {
	if (foodTimer < foodDelay) {
		foodTimer++;
	} else {
		foodTimer = 0;
	}
}
