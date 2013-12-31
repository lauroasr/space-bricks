'use strict';

var canvas;
var pixiStage;
var pixiRenderer;
var physicsWorld;
var physicsRenderer;
var worldGravity;

var stars = [];
var starsDirection = new PIXI.Point(Math.cos(Math.PI / 180 * 45), Math.sin(Math.PI / 180 * 45));

var brickPoints = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50,  y: 50 },
    { x: 0,  y: 50 }
];

var game = {};

window.onload = function () {
    canvas = document.createElement('canvas');
    canvas.id = 'viewport';
    document.body.appendChild(this.canvas);

    // initialize pixi.js stuff
    pixiStage = new PIXI.Stage(0x0, true);
    pixiRenderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight, this.canvas);


    // load star textures
    var star = PIXI.Texture.fromImage('src/sprites/galaxy/star1.jpg');
    var bigStar = PIXI.Texture.fromImage('src/sprites/galaxy/star2.jpg');

    // create star sprites
    for (var i = 0; i < 100; i++) {
        if (Math.random() > 0.1) {
            stars.push(new PIXI.Sprite(star));
            stars[i].width = Physics.util.random(3, 10);
            stars[i].height = stars[i].width;
        } else {
            stars.push(new PIXI.Sprite(bigStar));
            stars[i].width = Physics.util.random(5, 25);
            stars[i].height = stars[i].width;
        }
        stars[i].position.x = Math.random() * window.innerWidth;
        stars[i].position.y = Math.random() * window.innerHeight;
        stars[i].speed = Math.random();

        pixiStage.addChild(stars[i]);
    }

    // initialize PhysicsJS stuff
    physicsWorld = Physics();
    physicsRenderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: window.innerWidth,
        height: window.innerHeight
    });
    physicsWorld.add(this.physicsRenderer);
    Physics.util.ticker.subscribe(step);

    // add bounds to the world
    physicsWorld.add(Physics.behavior('edge-collision-detection', {
        aabb: Physics.aabb(0, 0, canvas.width - 1, canvas.height + 200),
        restitution: 1, cof: 0.5
    }));
    physicsWorld.add(Physics.behavior('body-impulse-response'));

    // create the gravity behavior
    worldGravity = Physics.behavior('constant-acceleration', {
        acc: { x: 0, y: 0 }
    });
    physicsWorld.add(worldGravity);

    physicsRenderer.beforeRender = null;

    // make bodies collide
    physicsWorld.add(Physics.behavior('body-collision-detection'));
    physicsWorld.add(Physics.behavior('sweep-prune'));

    var ball = Physics.body('circle', {
        x: 0, y: 0,
        radius: 20,
        vx: 0.5, vy: 0.5,
        restitution: 1.001
    });
    physicsWorld.add(ball);

    var brickeTexture = new Image();
    brickeTexture.src = 'src/sprites/brick.jpg';

    var bricks = [];


    game.platform = Physics.body('convex-polygon', {
        x: canvas.width / 2, y: canvas.height - 100,
        vertices: [
            { x: 0, y: 0 },
            { x: 150, y: 0 },
            { x: 150, y: 25 },
            { x: 0, y: 25 }
        ],
        fixed: true
    });
    physicsWorld.add(game.platform);

    canvas.onmousemove = function (event) {
        game.platform.state.pos.set(event.clientX, canvas.height - 100);
    };

    start();


};

function step(time, timeout) {
    for (var i in stars) {
        stars[i].position.x += stars[i].speed * starsDirection.x;
        stars[i].position.y += stars[i].speed * starsDirection.y;

        if (stars[i].position.x > window.innerWidth) {
            stars[i].position.x = -stars[i].width;
        }
        if (stars[i].position.y > window.innerHeight) {
            stars[i].position.y =  -stars[i].height;
        }
    }

    pixiRenderer.render(pixiStage);
    // restore the context to its original form
    pixiRenderer.context.setTransform(1, 0, 0, 1, 0, 0);
    physicsWorld.step(time);
    physicsWorld.render();
}

function start() {
    Physics.util.ticker.start();
}

function stop() {
    Physics.util.ticker.stop();
}


