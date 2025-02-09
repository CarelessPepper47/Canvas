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
    idleRight: { src: "./img/character/idleRight.png", frames: 14 },
    walkRight: { src: "./img/character/walkRight.png", frames: 14 },
    walkLeft: { src: "./img/character/walk.png", frames: 14 },
    attackRight: { src: "./img/character/heavyRight.png", frames: 20, adjustedFrameDelay: 1000 / 14 },
    attackLeft: { src: "./img/character/heavy.png", frames: 20, adjustedFrameDelay: 1000 / 14 }
};

const frameSize = 96;
let currentFrame = 0;
let lastTime = 0;
let frameDelay = 1000 / 14;
let isAttacking = false;
let currentAnimation = animations.idle;
let lastDirection = "right";
let playerYVelocity = 0;
const jumpStrength = -10;
let isGrounded = false;
let playerColor = "white";

// Nowe zmienne do kontroli ruchu
let playerXVelocity = 0; // Prędkość pozioma
let acceleration = 0.2;  // Przyspieszenie ruchu
let maxSpeed = 0.5;        // Maksymalna prędkość

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
    
    // Aktualizacja pozycji poziomej
    playerPositionX += playerXVelocity;

    // Ograniczenie pozycji gracza w obrębie ekranu
    if (playerPositionY > canvas.height - frameSize) {
        playerPositionY = canvas.height - frameSize;
        playerYVelocity = 0;
        isGrounded = true;
    } else {
        isGrounded = false;
    }

    if (playerPositionX < 0) playerPositionX = 0;
    if (playerPositionX > canvas.width - frameSize) playerPositionX = canvas.width - frameSize;

    // Renderowanie postaci
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = playerColor;
    c.drawImage(
        spriteSheet,
        currentFrame * frameSize, 0, frameSize, frameSize,
        playerPositionX, playerPositionY, frameSize, frameSize
    );

    requestAnimationFrame(draw);
}

function setAnimation(name) {
    currentAnimation = animations[name];
    spriteSheet.src = currentAnimation.src;
    currentFrame = 0;

    if (name === "attackRight" || name === "attackLeft") {
        frameDelay = currentAnimation.adjustedFrameDelay;
    } else {
        frameDelay = 1000 / 14;
    }
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

// Funkcje obsługi ruchu
function walkLeftStart() {
    keys.a.pressed = true;
    lastDirection = "left";
    setAnimation("walkLeft");
}

function walkLeftEnd() {
    keys.a.pressed = false;
}

function walkRightStart() {
    keys.d.pressed = true;
    lastDirection = "right";
    setAnimation("walkRight");
}

function walkRightEnd() {
    keys.d.pressed = false;
}

function jump() {
    if (isGrounded) {
        playerYVelocity = jumpStrength;
        isGrounded = false;
    }
}

// Obsługa ataku
function heavyAttack() {
    if (!isAttacking) {
        isAttacking = true;
        setAnimation(lastDirection === "right" ? "attackRight" : "attackLeft");

        // Unieruchomienie postaci w trakcie animacji ataku
        let savedXPosition = playerPositionX;
        playerXVelocity = 0; 

        // Czas trwania animacji heavy = 20 klatek * 71 ms = 1420 ms
        setTimeout(() => {
            isAttacking = false;
            const idleAnimation = lastDirection === "right" ? "idleRight" : "idle";
setAnimation(idleAnimation);
        }, 1420);

        // Funkcja aktualizująca pozycję w trakcie ataku
        function freezePosition() {
            if (isAttacking) {
                playerPositionX = savedXPosition;
                requestAnimationFrame(freezePosition);
            }
        }
        freezePosition();
    }
}

// Zmodyfikowana obsługa klawiatury – blokada ruchu podczas ataku
window.addEventListener('keydown', (event) => {
    if (isAttacking) return; // Blokujemy inne akcje w trakcie ataku

    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            lastDirection = "right";
            setAnimation("walkRight");
            break;
        case 'a':
            keys.a.pressed = true;
            lastDirection = "left";
            setAnimation("walkLeft");
            break;
        case 'h':
            heavyAttack();
            break;
        case 'w':
            jump();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (isAttacking) return;
    
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            setAnimation(lastDirection === "right" ? "idle" : "walkLeft");
            break;
        case 'a':
            keys.a.pressed = false;
            setAnimation(lastDirection === "right" ? "idle" : "walkLeft");
            break;
    }
});

// Nowa funkcja obsługująca ruch z przyspieszeniem
function updateMovement() {
    if (keys.a.pressed) {
        playerXVelocity -= acceleration; // Przyspieszenie w lewo
        if (playerXVelocity < -maxSpeed) playerXVelocity = -maxSpeed; // Ograniczenie prędkości
    } else if (keys.d.pressed) {
        playerXVelocity += acceleration; // Przyspieszenie w prawo
        if (playerXVelocity > maxSpeed) playerXVelocity = maxSpeed; // Ograniczenie prędkości
    } else {
        // Stopniowe zatrzymywanie
        if (playerXVelocity > 0) {
            playerXVelocity -= acceleration+0.1;
            if (playerXVelocity < 0) playerXVelocity = 0;
        } else if (playerXVelocity < 0) {
            playerXVelocity += acceleration+0.1;
            if (playerXVelocity > 0) playerXVelocity = 0;
        }
    }

    requestAnimationFrame(updateMovement);
}

updateMovement(); // Uruchamiamy stałą aktualizację ruchu
