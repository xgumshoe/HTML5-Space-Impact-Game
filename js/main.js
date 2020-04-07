var stage = new createjs.Stage('game');
var GRID = 5;
var POINTS = 0;
var started = false;
var bullets = [];
var targets = [];

// Title
var title = stage.addChild(new createjs.Text("SPACE IMPACT", "Bold 20px Arial", "white"));
title.textAlign = "center";
title.textBaseline = "middle";
title.x = stage.canvas.width/2;
title.y = 100;

// Score
var score = stage.addChild(new createjs.Text(`SCORE: ${POINTS}`, "Bold 20px Arial", "white"));
score.textAlign = "left";
score.textBaseline = "middle";
score.x = 50;
score.y = 180;

// Game screen
var screen = stage.addChild(new createjs.Container());
screen.x = 50;
screen.y = 200;

// Background
var bg = screen.addChild(new createjs.Shape());
bg.graphics
	.beginStroke('rgba(255, 255, 255, 1)').setStrokeStyle(2)
	.beginFill('rgba(0, 0, 0, 1)').drawRect(0, 0, 400, 400);
	
// Controls
var guide = stage.addChild(new createjs.Text("Use arrow keys", "Bold 20px Arial", "white"));
guide.textAlign = "center";
guide.textBaseline = "middle";
guide.x = stage.canvas.width/2;
guide.y = 300;

var keys = stage.addChild(new createjs.Shape());
keys.x = 250;
keys.y = 610;
keys.graphics
	// Up
	.beginStroke('rgba(0, 0, 0, 1)').setStrokeStyle(1)
	.beginFill('rgba(255, 255, 255, 1)').drawRoundRect(40, 0, 40, 40, 5).endStroke()
	.beginFill('rgba(0, 0, 0, 1)').moveTo(60, 10).lineTo(70, 20).lineTo(50, 20).closePath()
	// Down
	.beginStroke('rgba(0, 0, 0, 1)').setStrokeStyle(1)
	.beginFill('rgba(255, 255, 255, 1)').drawRoundRect(40, 40, 40, 40, 5).endStroke()
	.beginFill('rgba(0, 0, 0, 1)').moveTo(60, 70).lineTo(70, 60).lineTo(50, 60).closePath()
keys.regX = 60;

// Player
class Player {
	constructor() {
		this.x = 50;
		this.y = 150;
		
		this.dx = 0;
		this.dy = 0;
		
		this.shipW = 10;
		this.shipH = 7;
		
		this.cells = [ // Ship Design
			1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
			0, 0, 1, 0, 1, 1, 0, 1, 0, 0,
			0, 1, 0, 1, 1, 1, 1, 0, 1, 1,
			0, 0, 1, 0, 1, 1, 0, 1, 0, 0,
			0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
			1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		];
		
		this.fireDelay = 10;
		this.fireTick = 0;
		
		this.body = screen.addChild(new createjs.Shape());
		this.body.x = this.x; // Move to initial x coordinate
		
	}
	/*
	 * Draw ship
	 */
	draw() {
		for(var y = 0; y < this.shipH; ++y) {
			for(var x = 0; x < this.shipW; ++x) {
				var fill = this.cells[((y * this.shipW)+x)] === 1 ? 'rgba(255, 255, 255, 1)':'rgba(0, 0, 0, 1)';
				this.body.graphics.beginFill(fill).drawRect(x * GRID, y * GRID, GRID, GRID)
			}
		}
		this.body.regX = (this.shipW * GRID)/2;
		this.body.regY = (this.shipH * GRID)/2;
	}
	/*
	 * Move ship
	 */
	move() {
		this.dy = 0;
		this.body.y = player.y;
	}
	/*
	 * Increase fire tick
	 */
	tick() {
		this.fireTick++;
	}
	/*
	 * Create new bullet
	 */
	fire() {
		var bullet = new Bullet(this.x + (this.body.regX), this.y);
		bullets.push(bullet);
		screen.addChild(bullet.body);
	}
}
var player = new Player();

// Bullet
class Bullet {
	constructor(x, y) {
		this.destroyed = false;
		
		this.x = x;
		this.y = y;
		
		this.body = new createjs.Shape();
		this.body.graphics
			.beginFill('rgba(255, 0, 0, 1)').drawCircle(0, 0, GRID)
		this.body.x = this.x;
		this.body.y = this.y;
	}
	/*
	 * Move bullet position
	 */
	move() {
		this.x += GRID;
		this.body.x = this.x;
		
		if(this.x >= bg.graphics.command.w-(GRID * 2)) this.destroy();
	}
	/*
	 * Remove bullet from stage
	 */
	destroy() {
		var self = this;
		self.destroyed = true;
		
		createjs.Tween.get(self.body)
			.to({ scale : 1.2, alpha : 0.1 }, 150)
			.call(function() {
				screen.removeChild(self.body);
			})
	}
	/*
	 * Get bullet pos
	 * @Return: {Object} x,y
	 */
	get pos() {
		return { x : this.x, y : this.y };
	}
}

/*
 * Enemies control
 */
class Enemies {
	constructor() {
		this.respawnDelay = 50;
		this.respawnTick = 0;
	}
	/*
	 * Increase respawn tick
	 */
	tick() {
		this.respawnTick++;
	}
	/*
	 * Create enemy
	 */
	create() {
		var x = Math.floor(Math.random() * (350-250)) + 250;
		var y = Math.floor(Math.random() * (350-50)) + 50;
		var enemy = new Enemy(x, y);
		targets.push(enemy);
		screen.addChild(enemy.body);
	}
}
var enemies = new Enemies();

class Enemy {
	constructor(x, y) {
		this.destroyed = false;
		
		this.x = x;
		this.y = y;
		this.width = 40;
		this.height = 40;
		
		this.body = new createjs.Shape();
		this.body.graphics
			.beginFill('rgba(50, 50, 50, 1)').drawRect(0, 0, this.width, this.height)
			.beginFill('rgba(255, 0, 0, 1)').drawCircle(this.width/2, this.height/2, 10)
		this.body.regX = this.width/2;
		this.body.regY = this.height/2;
		this.body.x = this.x;
		this.body.y = this.y;
	}
	/*
	 * Move enemy
	 */
	move() {
		// this.body.rotation+=35;
		this.x -= GRID;
		this.body.x = this.x;
		
		if(this.x <= 20) this.destroy();
	}
	/*
	 * Remove enemy from stage
	 */
	destroy() {
		var self = this;
		self.destroyed = true;
		
		createjs.Tween.get(self.body)
			.to({ scale : 1.2, alpha : 0.1 }, 150)
			.call(function() {
				screen.removeChild(self.body);
			})
	}
	/*
	 * Check collision with bullet
	 * @Param: {Object} bullet x, y
	 */
	collided(b) {
		if(b.x >= this.x-(this.width/2) && b.x <= this.x+(this.width/2) &&
			b.y >= this.y-(this.height/2) && b.y <= this.y+(this.height/2)) {
			return true;
		}
		return false;
	}
}

// Update game
function update() {
	if(started) {
		// Update player velocity
		player.y += player.dy;
		
		if(player.y <= player.body.regY + GRID) player.y = player.body.regY + GRID;
		if(player.y >= bg.graphics.command.h-(player.body.regY + GRID)) player.y = bg.graphics.command.h-(player.body.regY + GRID);
		
		player.move();
		
		// Fire
		player.tick();
		if(player.fireTick % player.fireDelay === 0) {
			player.fire();
		}
		
		// Enemy
		enemies.tick();
		if(enemies.respawnTick % enemies.respawnDelay === 0) {
			enemies.create();
		}
		
		// Filter out destroyed bullets
		var bulletList = bullets.filter(e => !e.destroyed);
		bulletList.map(b => {
			b.move();
			
			// Check bullet collision with enemy
			var enemy = targets.find(e => e.collided(b.pos) && !e.destroyed);
			if(enemy) {
				b.destroy();
				enemy.destroy();
				score.text = `SCORE: ${++POINTS}`;
			}
		});
		
		// Filter out destroyed targets
		var targetList = targets.filter(e => !e.destroyed);
		targetList.map(e => {
			e.move();
		});
	}
	
	stage.update();
}

function restart() {
	started = true;
	POINTS = 0;
	score.text = `SCORE: ${POINTS}`;
	
	player.draw();
		
	guide.visible = false;
}
setTimeout(() => { restart(); }, 0);
	
window.addEventListener('keydown', (e) => {
	if (e.keyCode === 38 && player.dy === 0) { // Up arrow key
		player.dy = -GRID;
	} else if (e.keyCode === 40 && player.dy === 0) { // Down arrow key
		player.dy = GRID;
	}
});

createjs.Ticker.on('tick', update);