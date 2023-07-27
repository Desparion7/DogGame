document.addEventListener('DOMContentLoaded', function () {
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = 800;
	canvas.height = 720;
	enemies = [];
	let score = 0;
	let gameOver = false;

	class InputHandler {
		constructor() {
			this.keys = [];
			window.addEventListener('keydown', (e) => {
				if (
					(e.key === 's' ||
						e.key === 'w' ||
						e.key === 'a' ||
						e.key === 'd') &&
					this.keys.indexOf(e.key) === -1
				) {
					this.keys.push(e.key);
				}
			});
			window.addEventListener('keyup', (e) => {
				if (
					e.key === 's' ||
					e.key === 'w' ||
					e.key === 'a' ||
					e.key === 'd'
				) {
					this.keys.splice(this.keys.indexOf(e.key), 1);
				}
			});
		}
	}

	class Player {
		constructor(gameWidth, gameHeight) {
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.width = 200;
			this.height = 200;
			this.x = 0;
			this.y = this.gameHeight - this.height;
			this.image = document.getElementById('playerImage');
			this.frameX = 0;
			this.maxFrame = 8;
			this.frameY = 0;
			this.fps = 20;
			this.frameTimer = 0;
			this.frameInterval = 1000 / this.fps;
			this.speed = 0;
			this.vy = 0;
			this.weight = 1;
		}
		update(input, deltaTime, enemies) {
			// collision detection
			enemies.forEach((enemy) => {
				const dx =
					enemy.x + enemy.width / 2 - (this.x + this.width / 2);
				const dy =
					enemy.y + enemy.height / 2 - (this.y + this.height / 2);
				const distance = Math.sqrt(dx * dx + dy * dy);
				if (distance < enemy.width / 2 + this.width / 2) {
					gameOver = true;
				}
			});

			// sprite animation
			if (this.frameTimer > this.frameInterval) {
				if (this.frameX >= this.maxFrame) this.frameX = 0;
				this.frameX++;
				this.frameTimer = 0;
			} else {
				this.frameTimer += deltaTime;
			}

			// controls
			if (input.keys.indexOf('d') > -1) {
				this.speed = 5;
			} else if (input.keys.indexOf('a') > -1) {
				this.speed = -5;
			} else if (input.keys.indexOf('w') > -1 && this.onGround()) {
				this.vy -= 25;
			} else {
				this.speed = 0;
			}
			// horizontal movment
			if (this.x < 0) {
				this.x = 0;
			}
			if (this.x > this.gameWidth - this.width) {
				this.x = this.gameWidth - this.width;
			}
			this.x += this.speed;
			// vertical movment
			this.y += this.vy;
			if (!this.onGround()) {
				this.vy += this.weight;
				this.maxFrame = 5;
				this.frameY = 1;
			} else {
				this.vy = 0;
				this.maxFrame = 8;
				this.frameY = 0;
			}
			if (this.y > this.gameHeight - this.height)
				this.y = this.gameHeight - this.height;
		}
		onGround() {
			return this.y >= this.gameHeight - this.height;
		}
		draw(context) {
			context.drawImage(
				this.image,
				this.width * this.frameX,
				this.height * this.frameY,
				this.width,
				this.height,
				this.x,
				this.y,
				this.width,
				this.height
			);
		}
	}
	class BackGround {
		constructor(gameWidth, gameHeight) {
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.image = document.getElementById('backgroundImage');
			this.x = 0;
			this.y = 0;
			this.width = 2400;
			this.height = 720;
			this.speed = 7;
		}
		draw(context) {
			context.drawImage(
				this.image,
				this.x,
				this.y,
				this.width,
				this.height
			);
			context.drawImage(
				this.image,
				this.x + this.width - this.speed,
				this.y,
				this.width,
				this.height
			);
		}
		update() {
			this.x -= this.speed;
			if (this.x < 0 - this.width) this.x = 0;
		}
	}

	class Enemy {
		constructor(gameWidth, gameHeight) {
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.width = 160;
			this.height = 119;
			this.x = this.gameWidth;
			this.y = this.gameHeight - this.height;
			this.image = document.getElementById('enemyImage');
			this.frameX = 0;
			this.maxFrame = 5;
			this.fps = 20;
			this.frameTimer = 0;
			this.frameInterval = 1000 / this.fps;
			this.speed = 8;
			this.markedForDeletion = false;
		}
		draw(context) {
			context.drawImage(
				this.image,
				this.width * this.frameX,
				0,
				this.width,
				this.height,
				this.x,
				this.y,
				this.width,
				this.height
			);
		}
		update(deltaTime) {
			if (this.frameTimer > this.frameInterval) {
				if (this.frameX >= this.maxFrame) this.frameX = 0;
				this.frameX++;
				this.frameTimer = 0;
			} else {
				this.frameTimer += deltaTime;
			}

			this.x -= this.speed;
			if (this.x < 0 - this.width) {
				this.markedForDeletion = true;
				score++;
			}
		}
	}

	function handleEnemies(deltaTime) {
		if (enemyTimer > enemyInterval + randomEnemyInterval) {
			enemies.push(new Enemy(canvas.width, canvas.height));
			randomEnemyInterval = Math.random() * 1000 + 500;
			enemyTimer = 0;
		} else {
			enemyTimer += deltaTime;
		}
		enemies.forEach((enemy) => {
			enemy.draw(ctx);
			enemy.update(deltaTime);
		});
		enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
	}

	function displayStatusText(context) {
		context.font = '40px Helvetica';
		context.fillStyle = 'black';
		context.fillText('Score: ' + score, 20, 50);
		context.fillStyle = 'white';
		context.fillText('Score: ' + score, 23, 53);
		if (gameOver) {
			context.textAlign = 'center';
			context.fillStyle = 'black';
			context.fillText('Game over, try again!', canvas.width / 2, 200);
			context.fillStyle = 'white';
			context.fillText(
				'Game over, try again!',
				canvas.width / 2 + 2,
				202
			);
		}
	}

	const input = new InputHandler();
	const player = new Player(canvas.width, canvas.height);
	const backgrund = new BackGround(canvas.width, canvas.height);

	let lastTime = 0;
	let enemyTimer = 0;
	let enemyInterval = 2000;
	let randomEnemyInterval = Math.random() * 1000 + 500;

	function animate(timeStamp) {
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		backgrund.draw(ctx);
		backgrund.update();
		player.draw(ctx);
		player.update(input, deltaTime, enemies);
		handleEnemies(deltaTime);
		displayStatusText(ctx);
		if (!gameOver) {
			requestAnimationFrame(animate);
		}
	}
	animate(0);
});
