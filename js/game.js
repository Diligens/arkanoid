'use strict'


var game = new Phaser.Game(1150, 800, Phaser.AUTO, 'arkanoid', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('bg_space', 'img/space.jpg');
    game.load.spritesheet('paddle', 'img/paddle.png', 250, 50);
    game.load.image('rabbit', 'img/rabbit.png');
    game.load.image('ball', 'img/ball.jpg');


    game.load.audio('ball_hit_paddle', 'sound/ball_hit_paddle.mp3');
    game.load.audio('game_over', 'sound/game_over.mp3');
    // game.load.audio('hit_brick', 'sound/hit_brick_2.mp3');
    game.load.audio('rabbit', 'sound/rabbit.mp3');
    game.load.audio('start_ball', 'sound/start_ball.mp3');
    game.load.audio('minus_live', 'sound/minus_live.mp3');

}

var ball;
var paddle;
var bricks;
var rabbit;

var ballOnPaddle = true;

var lives = 3;
var score = 0;

var scoreText;
var livesText;
var introText;

var s;

var anim;

var cursors;
var left;
var right;

var sound_ball_hit_paddle;
var game_over;
var hit_brick;
var start_ball;
var minus_live;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;

    s = game.add.tileSprite(0, 0, 1350, 700, 'bg_space');

    //  The bricks group contains bricks, we can crash them
    bricks = game.add.group();

    // We will enable physics for any object that is created in this group
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var brick;

    for (var y = 0; y < 2; y++) // y - number of rows (max - 4)
    {
        for (var x = 0; x < 5; x++) // x - blocks number in rows
        {
                brick = bricks.create(140 + (x * 190), 50 + (y * 190), 'rabbit');
                brick.scale.set(0.6);
                brick.body.immovable = true;
        }
    }

    paddle = game.add.sprite(game.world.centerX, 650, 'paddle', 0);
    paddle.smoothed = false;
    paddle.anchor.setTo(0.4, 0);
    paddle.scale.set(2, 2);
    anim = paddle.animations.add('hit');
    


    game.physics.enable(paddle, Phaser.Physics.ARCADE);


    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(100, paddle.y - 100, 'ball');
    ball.anchor.set(0);
    ball.checkWorldBounds = true;


    game.physics.enable(ball, Phaser.Physics.ARCADE);


    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    // ball.scale.set(0.5);
    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(40, 760, 'score: 0', { font: "30px Roboto", fill: "#ffffff", align: "left" });
    livesText = game.add.text(1000, 760, 'lives: 3', { font: "30px Roboto", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Calibri", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

    
    sound_ball_hit_paddle = game.add.audio('ball_hit_paddle');
    game_over = game.add.audio('game_over');
    // hit_brick = game.add.audio('hit_brick');
    rabbit = game.add.audio('rabbit');
    start_ball = game.add.audio('start_ball');
    minus_live = game.add.audio('minus_live');

    cursors = game.input.keyboard.createCursorKeys();
}

var keyboardControll = false;

function update (input_x) {

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }        

        // mouse control
        if (keyboardControll == false) {
            paddle.x = game.input.x;

            if (paddle.x < 200)
            {
                paddle.x = 200;
            }
            else if (paddle.x > game.width - 300)
            {
                paddle.x = game.width - 300;
            }
        }


        // keyboard controll 

        // paddle.body.velocity.set(0);

        // if (cursors.left.isDown)
        // {
        //     keyboardControll = true; 

        //     if (paddle.x > 230)
        //     {
        //         paddle.body.velocity.x = -1500;
        //     }
        // }
        // else if (cursors.right.isDown)
        // {
        //     if (paddle.x < game.width - 325)
        //     {
        //         paddle.body.velocity.x = 1500;
        //     }
        // } else {

        // }


}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -500;
        ball.body.velocity.x = -355;
        introText.visible = false;
        start_ball.play();
    }

}

function ballLost () {

    lives--;
    livesText.text = 'lives: ' + lives;
    minus_live.play();

    if (lives === 0)
    {
        gameOver();
        game_over.play(); 
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x - 100, paddle.y - 100);
        
    }

}

function gameOver () {

    ball.body.velocity.setTo(0, 0);
    
    introText.text = 'Game Over!';
    introText.visible = true;

}

function ballHitBrick (_ball, _brick) {

    _brick.kill();
    // hit_brick.play();
    rabbit.play();

    score += 10;

    scoreText.text = 'score: ' + score;

    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        //  New level starts
        score += 100;
        scoreText.text = 'score: ' + score;
        introText.text = '- Next Level -';

        //  Let's move the ball back to the paddle
        
        ball.x = paddle.body.x + 100;
        ball.y = paddle.body.y - 100;
        ballOnPaddle = true;
        ball.body.velocity.set(0);

        //  And bring the bricks back from the dead 
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

    sound_ball_hit_paddle.play();

}






   