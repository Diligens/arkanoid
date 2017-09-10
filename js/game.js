'use strict'


var game = new Phaser.Game(1150, 800, Phaser.AUTO, 'arkanoid', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('breakout', 'img/breakout.png', 'img/breakout.json');
    game.load.image('bg_space', 'img/bg_space.jpg');
    game.load.spritesheet('paddle', 'img/paddle.png', 250, 50);
    game.load.atlas('bricks', 'img/bricks.png', 'img/bricks.json');

}

var ball;
var paddle;
var bricks;

var ballOnPaddle = true;

var lives = 3;
var score = 0;

var scoreText;
var livesText;
var introText;

var s;

var anim;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;

    s = game.add.tileSprite(0, 0, 1350, 750, 'bg_space');

    //  The bricks group contains bricks, we can crash them
    bricks = game.add.group();

    // We will enable physics for any object that is created in this group
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var brick;

    for (var y = 0; y < 2; y++) // y - number of rows (max - 4)
    {
        for (var x = 0; x < 6; x++) // x - blocks number in rows
        {
            brick = bricks.create(150 + (x * 150), 30 + (y * 165), 'bricks', 'bricks'+(y+1)+'.png');
            brick.body.bounce.set(1);
            brick.scale.set(2);
            brick.body.immovable = true;
        }
    }

    paddle = game.add.sprite(game.world.centerX, 570, 'paddle', 0);
    paddle.smoothed = false;
    paddle.anchor.setTo(0.4, 0);
    paddle.scale.set(2);
    anim = paddle.animations.add('hit');
    


    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(100, paddle.y - 100, 'bricks', 'bricks4.png');
    ball.anchor.set(0);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);


    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(32, 770, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(1100, 770, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 450, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

}


function update (input_x) {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    s.tilePosition.x -= (game.input.speed.x / 20);

        paddle.x = game.input.x;


        if (paddle.x < 24)
        {
            paddle.x = 24;
        }
        else if (paddle.x > game.width - 24)
        {
            paddle.x = game.width - 24;
        }

        if (ballOnPaddle)
        {
            ball.body.x = paddle.x;
        }
        else
        {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
        }


}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -155;
        introText.visible = false;
    }

}

function ballLost () {

    lives--;
    livesText.text = 'lives: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x - 50, paddle.y - 100);
        
    }

}

function gameOver () {

    ball.body.velocity.setTo(0, 0);
    
    introText.text = 'Game Over!';
    introText.visible = true;

}

function ballHitBrick (_ball, _brick) {

    _brick.kill();

    score += 10;

    scoreText.text = 'score: ' + score;

    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        //  New level starts
        score += 1000;
        scoreText.text = 'score: ' + score;
        introText.text = '- Next Level -';

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 100;
        ball.y = paddle.y - 100;
        ball.animations.stop();

        //  And bring the bricks back from the dead :)
        bricks.callAll('revive');
    }

}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

    anim.play(30, false);


}







   