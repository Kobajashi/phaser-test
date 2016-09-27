var SpaceHipster = SpaceHipster || {};

SpaceHipster.Game = function () {

}

SpaceHipster.Game.prototype = {
	generateAsteroids: function () {
		this.asteroids = this.game.add.group();

		this.asteroids.enableBody = true;
		this.asteroids.physicsBodyType = Phaser.Physics.ARCADE;

		var numAsteroids = this.game.rnd.integerInRange(150, 200);
		var asteroid;

		for (var i = 0; i < numAsteroids; i++) {
			asteroid = this.asteroids.create(this.randX(), this.randY(), 'rock', this.game.rnd.integerInRange(0, 4));
			//asteroid.scale.setTo(this.game.rnd.integerInRange(10, 40) / 10);

			asteroid.body.velocity.x = this.game.rnd.integerInRange(-20, 20);
			asteroid.body.velocity.y = this.game.rnd.integerInRange(-20, 20);
			asteroid.body.immovable = true;
			asteroid.body.collideWorldBounds = true;
		}
	},
	generateCollectables: function () {
		this.collectables = this.game.add.group();
		this.collectables.enableBody = true;
		this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

		var numCollectables = this.game.rnd.integerInRange(100, 150);
		var collectable;

		for (var i = 0; i < numCollectables; i++) {
			collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
			collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
			collectable.animations.play('fly');
		}
	},
	showLables: function () {
		var text = "0";
		var style = {font: "20px Arial", fill: "#fff", align: "center"};
		this.scoreLabel = this.game.add.text(this.game.width - 50, this.game.height - 50, text, style);
		this.scoreLabel.fixedToCamera = true;
	},
	create: function () {
		this.game.world.setBounds(0, 0, 1920, 1920);
		this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

		this.player = this.game.add.sprite(this.game.world.centerX - 500, this.game.world.centerY - 500, 'playership');
		console.log(this.game.world.centerX, this.game.world.centerY);
		this.player.scale.setTo(2);

		this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
		this.player.animations.play('fly');

		this.playerScore = 0;
		this.game.physics.arcade.enable(this.player);
		this.playerSpeed = 120;
		this.player.body.collideWorldBounds = true;

		this.game.camera.follow(this.player);

		this.explosionSound = this.game.add.audio('explosion');
		this.collectSound = this.game.add.audio('collect');

		this.generateCollectables();
		this.generateAsteroids();
		this.showLables();
	},
	hitAsteroid: function (player, asteroid) {
//play explosion sound
		this.explosionSound.play();

		//player explosion will be added here
		var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
		emitter.makeParticles('playerParticle');
		emitter.minParticleSpeed.setTo(-200, -200);
		emitter.maxParticleSpeed.setTo(200, 200);
		emitter.gravity = 0;
		emitter.start(true, 1000, null, 100);
		this.player.kill();

		this.game.time.events.add(800, this.gameOver, this);
	},

	randX: function () {
		var x = this.game.world.randomX;
		return Math.abs(x - this.game.world.centerX) > 50 ? x : this.game.world.randomX;
	},

	randY: function () {
		var y = this.game.world.randomY;
		return Math.abs(y - this.game.world.centerY) > 50 ? y : this.game.world.randomY;
	},

	gameOver: function () {
		//pass it the score as a parameter
		this.game.state.start('MainMenu', true, false, this.playerScore);
	},
	collect: function (player, collectable) {
		this.collectSound.play();
		this.playerScore++;
		collectable.kill();
		this.scoreLabel.text = this.playerScore;
	},
	update: function () {
		if (this.game.input.activePointer.justPressed()) {

			//move on the direction of the input
			this.game.physics.arcade.moveToPointer(this.player, this.playerSpeed);
		}

		this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);
		this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
	}
}