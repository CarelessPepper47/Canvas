const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = 800; // Set the width to 800
    canvas.height = 600; // Set the height to 600
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
    attackLeft: { src: "./img/character/heavy.png", frames: 20, adjustedFrameDelay: 1000 / 14 },
    jump: { src: "./img/character/jump.png", frames: 10 }, // New jump animation
    jumpRight: { src: "./img/character/jumpRight.png", frames: 10 }, // New jumpRight animation
    run: { src: "./img/character/run.png", frames: 5 }, // New run animation
    runRight: { src: "./img/character/runRight.png", frames: 5 } // New runRight animation
};

const frameSize = 96; // Keep the frame size unchanged
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
const maxSpeed = 1; // Maksymalna prędkość

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

    // Adjust frame delay if needed
    if (name === "attackRight" || name === "attackLeft") {
        frameDelay = currentAnimation.adjustedFrameDelay;
    } else if (name === "jump" || name === "jumpRight") {
        frameDelay = 1000 / 10; // Adjust frame rate for jump animations here
    } else if (name === "run" || name === "runRight") {
        frameDelay = 1000 / 10; // Adjust frame rate for run animations here
    } else {
        frameDelay = 1000 / 14;
    }
}

spriteSheet.onload = () => requestAnimationFrame(draw);

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    h: { pressed: false },
    w: { pressed: false },
    Shift: { pressed: false }
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
    setAnimation(lastDirection === "left" ? "idle" : "walkLeft");
}

function walkRightStart() {
    keys.d.pressed = true;
    lastDirection = "right";
    setAnimation("walkRight");
}

function walkRightEnd() {
    keys.d.pressed = false;
    setAnimation(lastDirection === "right" ? "idleRight" : "walkRight");
}

function jump() {
    if (isGrounded) {
        playerYVelocity = jumpStrength;
        isGrounded = false;
        if (keys.a.pressed) {
            playerXVelocity = -maxSpeed;
            setAnimation("jump"); // Start jump animation
        } else if (keys.d.pressed) {
            playerXVelocity = maxSpeed;
            setAnimation("jumpRight"); // Start jumpRight animation
        } else {
            playerXVelocity = 0;
            setAnimation("jump"); // Start jump animation
        }
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
            if (keys.Shift.pressed) {
                setAnimation("runRight"); // Start runRight animation
            } else {
                setAnimation("walkRight");
            }
            break;
        case 'a':
            keys.a.pressed = true;
            lastDirection = "left";
            if (keys.Shift.pressed) {
                setAnimation("run"); // Start run animation
            } else {
                setAnimation("walkLeft");
            }
            break;
        case 'h':
            heavyAttack();
            break;
        case 'w':
            keys.w.pressed = true;
            jump();
            break;
        case 'Shift':
            keys.Shift.pressed = true;
            if (keys.d.pressed) {
                setAnimation("runRight"); // Start runRight animation
            } else if (keys.a.pressed) {
                setAnimation("run"); // Start run animation
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (isAttacking) return;
    
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            setAnimation(lastDirection === "right" ? "idleRight" : "walkRight");
            break;
        case 'a':
            keys.a.pressed = false;
            setAnimation(lastDirection === "left" ? "idle" : "walkLeft");
            break;
        case 'w':
            keys.w.pressed = false;
            playerYVelocity -= playerYVelocity;
            break;
        case 'Shift':
            keys.Shift.pressed = false;
            if (keys.d.pressed) {
                setAnimation("walkRight"); // Revert to walkRight animation
            } else if (keys.a.pressed) {
                setAnimation("walkLeft"); // Revert to walk animation
            }
            break;
    }
});

// Stała prędkość poruszania się postaci
const moveSpeed = 1;  // ← Możesz tu modyfikować prędkość ruchu

// Usunięcie dynamicznego przyspieszania - teraz ruch jest stały
function updateMovement() {
    if (keys.a.pressed && !isAttacking) {
        playerXVelocity = keys.Shift.pressed ? -moveSpeed * 2 : -moveSpeed; // Ruch w lewo z ustaloną prędkością
    } else if (keys.d.pressed && !isAttacking) {
        playerXVelocity = keys.Shift.pressed ? moveSpeed * 2 : moveSpeed;  // Ruch w prawo z ustaloną prędkością
    } else {
        playerXVelocity = 0; // Zatrzymanie postaci po puszczeniu klawisza
    }

    requestAnimationFrame(updateMovement);
}

updateMovement(); // Uruchamiamy stałą aktualizację ruchu
