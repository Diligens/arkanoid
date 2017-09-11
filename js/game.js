'use strict'


var game = new Phaser.Game(1150, 800, Phaser.AUTO, 'arkanoid', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('bg_space', 'img/space.jpg');
    game.load.spritesheet('paddle', 'img/paddle.png', 250, 50);
    game.load.atlas('rabbit', 'img/rabbit.png', 'img/rabbit.json');
    game.load.atlas('ball', 'img/fireball.png', 'img/fireball.json');


    game.load.audio('ball_hit_paddle', 'sound/ball_hit_paddle.mp3');
    game.load.audio('rabbit', 'sound/rabbit.mp3');
    game.load.audio('start_ball', 'sound/start_ball.mp3');
    game.load.audio('minus_live', 'sound/minus_live.mp3');

}

var ball;
var paddle;
var rabbits;


// === For keyboard controlls
// var rectangle;
// var graphics;
// var controllText;


var ballOnPaddle = true;
var ballOnPaddlePosition = 20;

var lives = 3;
var score = 0;

var scoreText;
var livesText;
var introText;

var s;

var animPaddle;
var animFireball;
var animGhostRabbit

var cursors;
var left;
var right;

var soundBallHitPaddle;
var soundStartBall;
var soundMinusLive;
var soundRabbit;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);


    game.physics.arcade.checkCollision.down = false;

    s = game.add.tileSprite(0, 0, 1350, 700, 'bg_space');

    rabbits = game.add.group();

    rabbits.enableBody = true;
    rabbits.physicsBodyType = Phaser.Physics.ARCADE;

    var rabbit;

    for (var y = 0; y < 3; y++)
    {
        for (var x = 0; x < 8; x++) 
        {
                rabbit = rabbits.create(200 + (x * 100), 50 + (y * 150), 'rabbit');
                rabbit.scale.set(0.2);
                rabbit.body.immovable = true;

        }
    }

    paddle = game.add.sprite(game.world.centerX, 650, 'paddle', 0);
    paddle.smoothed = false;
    paddle.anchor.setTo(0.4, 0);
    paddle.scale.set(2, 1);
    animPaddle = paddle.animations.add('hit');

    game.physics.enable(paddle, Phaser.Physics.ARCADE);


    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    
    ball = game.add.sprite(100, paddle.y - ballOnPaddlePosition, 'ball');
    ball.anchor.set(0);
    ball.checkWorldBounds = true;
    ball.animations.add('fire');
    ball.play('fire', 14, true);

    game.physics.enable(ball, Phaser.Physics.ARCADE);


    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    ball.scale.set(0.5);
    ball.anchor.setTo(0.5, 0.5);
    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(40, 760, 'score: 0', { font: "30px Roboto", fill: "#ffffff", align: "left" });
    livesText = game.add.text(1000, 760, 'lives: 3', { font: "30px Roboto", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 500, '- click to start -', { font: "40px Calibri", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

    
    soundBallHitPaddle = game.add.audio('ball_hit_paddle');
    soundRabbit = game.add.audio('rabbit');
    soundStartBall = game.add.audio('start_ball');
    soundMinusLive = game.add.audio('minus_live');

    cursors = game.input.keyboard.createCursorKeys();
  
    // === For keyboard controlls

    // controllText = game.add.text(450, 760, 'controll', { font: "30px Roboto", fill: "#ffffff", align: "left" });
    // rectangle = new Phaser.Polygon();
    // rectangle.setTo([ new Phaser.Point(550, 720), new Phaser.Point(620, 720), new Phaser.Point(620, 760), new Phaser.Point(550, 760)]);

    // graphics = game.add.graphics(0, 0);

    // graphics.beginFill(0xFF33ff);
    // graphics.drawPolygon(rectangle.points);
    // graphics.endFill();
}

var keyboardControll = false;

// === For keyboard controlls

// function controllChange() {

//     if (keyboardControll = false) {
//         keyboardControll = true;
//     } else {
//         keyboardControll = false;
//     }
    
// }

function update () {

    ball.angle += 0.3;

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x + 10;
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, rabbits, ballHitRabbit, null, this);
    }        

        // mouse control
        if (keyboardControll == false) {
            paddle.x = game.input.x;

            if (paddle.x < 0)
            {
                paddle.x = 0;
            }
            else if (paddle.x > game.width - 100)
            {
                paddle.x = game.width - 100;
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
        ball.body.velocity.y = -450;
        ball.body.velocity.x = -355;
        introText.visible = false;
        soundStartBall.play();
    }

}

function ballLost () {

    if (lives >= 0) {
        lives--;
    }
    livesText.text = 'lives: ' + lives;
    soundMinusLive.play();

    if (lives < 1)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x - ballOnPaddlePosition, paddle.y - ballOnPaddlePosition);
        
    }

}

function gameOver () {

    ball.body.velocity.setTo(0, 0);
    
    introText.text = 'Game Over!';
    introText.visible = true;

}

function ballHitRabbit (_ball, _rabbit) {


    var ghostRabbit = game.add.sprite(_rabbit.x, _rabbit.y, 'rabbit');
    ghostRabbit.anchor.set(0);
    ghostRabbit.scale.set(0.2);

    animGhostRabbit = ghostRabbit.animations.add('kill');
    animGhostRabbit.play(60, false);

    setTimeout(function(){
        ghostRabbit.kill();
    },350);

    soundRabbit.play();



        _rabbit.kill();
        score += 10;

        scoreText.text = 'score: ' + score;


    if (rabbits.countLiving() == 0)
    {

        score += 100;
        scoreText.text = 'score: ' + score;
        introText.text = '- Next Level -';
        
        ball.x = paddle.body.x + 100;
        ball.y = paddle.body.y - ballOnPaddlePosition;
        ballOnPaddle = true;
        ball.body.velocity.set(0);

        setTimeout(function(){
            rabbits.callAll('revive');
        },500);

    }


        



}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x)
    {
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);
    }
    else
    {
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

    animPaddle.play(30, false);

    soundBallHitPaddle.play();

}






   