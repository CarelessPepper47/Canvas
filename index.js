const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = 320;
    canvas.height = 400;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const gravity = 0.5;
const spriteSheet = new Image();
spriteSheet.src = "./img/character/idle.png";

const animations = {
    idle: { src: "./img/character/idle.png", frames: 14 },
    walkRight: { src: "./img/character/walkRight.png", frames: 14 },
    walkLeft: { src: "./img/character/walk.png", frames: 14 },
    attackRight: { src: "./img/character/heavyRight.png", frames: 20 },
    attackLeft: { src: "./img/character/heavy.png", frames: 20 }
};

const frameSize = 96;
let currentFrame = 0;
let lastTime = 0;
const frameDelay = 100;
let isAttacking = false;
let currentAnimation = animations.idle;
let lastDirection = "right";
let playerYVelocity = 0;
const jumpStrength = -15;
let isGrounded = false;
let playerColor = "white";

let playerXVelocity = 0;
const moveSpeed = 2;

function draw(time) {
    if (!lastTime) lastTime = time;
    const deltaTime = time - lastTime;

    if (deltaTime > frameDelay) {
        currentFrame++;
        if (currentFrame >= currentAnimation.frames) {
            if (isAttacking) {
                isAttacking = false;
                setAnimation("idle");
            }
            currentFrame = 0;
        }
        lastTime = time;
    }

    playerYVelocity += gravity;
    playerPositionY += playerYVelocity;
    playerPositionX += playerXVelocity;

    if (playerPositionY > canvas.height - frameSize) {
        playerPositionY = canvas.height - frameSize;
        playerYVelocity = 0;
        isGrounded = true;
    } else {
        isGrounded = false;
    }

    if (playerPositionX < 0) playerPositionX = 0;
    if (playerPositionX > canvas.width - frameSize) playerPositionX = canvas.width - frameSize;

    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = playerColor;
    if (currentAnimation.flip) {
        c.save();
        c.scale(-1, 1);
        c.drawImage(
            spriteSheet,
            currentFrame * frameSize, 0, frameSize, frameSize,
            -(playerPositionX + frameSize), playerPositionY, frameSize, frameSize
        );
        c.restore();
    } else {
        c.drawImage(
            spriteSheet,
            currentFrame * frameSize, 0, frameSize, frameSize,
            playerPositionX, playerPositionY, frameSize, frameSize
        );
    }

    requestAnimationFrame(draw);
}

function setAnimation(name) {
    currentAnimation = animations[name];
    spriteSheet.src = currentAnimation.src;
    currentFrame = 0;
}

spriteSheet.onload = () => requestAnimationFrame(draw);

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    h: { pressed: false },
    w: { pressed: false }
};

let playerPositionX = (canvas.width - frameSize) / 2;
let playerPositionY = canvas.height - frameSize;

// Funkcje obsługi przycisków
function walkLeftStart() {
    keys.a.pressed = true;
    lastDirection = "left";
    setAnimation("walkLeft");
    playerXVelocity = -moveSpeed;
}

function walkLeftEnd() {
    keys.a.pressed = false;
    playerXVelocity = 0;
    setAnimation("idle");
}

function walkRightStart() {
    keys.d.pressed = true;
    lastDirection = "right";
    setAnimation("walkRight");
    playerXVelocity = moveSpeed;
}

function walkRightEnd() {
    keys.d.pressed = false;
    playerXVelocity = 0;
    setAnimation("idle");
}


function jump() {
    if (isGrounded) {
        playerYVelocity = jumpStrength;
        isGrounded = false;
    }
}

function heavyAttack() {
        isAttacking = true;
        setAnimation(lastDirection === "right" ? "attackRight" : "attackLeft");
}

// Dodajemy Event Listenery dla przycisków - TOUCHSTART
document.querySelector('#ButtonWalkLeft').addEventListener('touchstart', walkLeftStart);
document.querySelector('#ButtonWalkLeft').addEventListener('touchend', walkLeftEnd);

document.querySelector('#ButtonWalkRight').addEventListener('touchstart', walkRightStart);
document.querySelector('#ButtonWalkRight').addEventListener('touchend', walkRightEnd);

document.querySelector('#ButtonJump').addEventListener('touchstart', jump);
document.querySelector('#ButtonHeavy').addEventListener('touchstart', heavyAttack);


// Klawisze
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            lastDirection = "right";
            setAnimation("walkRight");
            playerXVelocity = moveSpeed;
            break;
        case 'a':
            keys.a.pressed = true;
            lastDirection = "left";
            setAnimation("walkLeft");
            playerXVelocity = -moveSpeed;
            break;
        case 'h':
                isAttacking = true;
                setAnimation(lastDirection === "right" ? "attackRight" : "attackLeft");
            break;
        case 'w':
            if (isGrounded) {
                playerYVelocity = jumpStrength;
                isGrounded = false;
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            playerXVelocity = 0;
            setAnimation("idle");
            break;
        case 'a':
            keys.a.pressed = false;
            playerXVelocity = 0;
            setAnimation("idle");
            break;
    }
});

// Pobranie kontenera palety
const paletteContainer = document.querySelector('.palette-container');

// Obsługa kliknięcia palety
paletteContainer.addEventListener('click', (event) => {
    const target = event.target;

    if (target.classList.contains('palette')) {
        const color = target.getAttribute('data-color');
        playerColor = color; // Zmiana koloru gracza
    }
});