const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const gravity = 0.5; // Dodajemy grawitację
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
let playerYVelocity = 0; // Prędkość w osi Y
const jumpStrength = -15;   // Siła skoku
let isGrounded = false;    // Czy postać dotyka podłoża

function draw(time) {
    if (!lastTime) lastTime = time;
    const deltaTime = time - lastTime;

    if (deltaTime > frameDelay) {
        currentFrame++;
        if (currentFrame >= currentAnimation.frames) {
            if (isAttacking) {
                isAttacking = false;
                setAnimation(lastDirection === "right" ? "idle" : "walkLeft");
            }
            currentFrame = 0;
        }
        lastTime = time;
    }

    // Aktualizacja pozycji gracza (grawitacja i skok)
    playerYVelocity += gravity;
    playerPositionY += playerYVelocity;

    // Kolizja z podłożem
    if (playerPositionY > canvas.height - frameSize) {
        playerPositionY = canvas.height - frameSize;
        playerYVelocity = 0;
        isGrounded = true;
    } else {
        isGrounded = false;
    }

    c.clearRect(0, 0, canvas.width, canvas.height);
    if (currentAnimation.flip) {
        c.save();
        c.scale(-1, 1);
        c.drawImage(
            spriteSheet,
            currentFrame * frameSize, 0, frameSize, frameSize,
            -(canvas.width + frameSize) / 2 - frameSize, playerPositionY, frameSize, frameSize
        );
        c.restore();
    } else {
        c.drawImage(
            spriteSheet,
            currentFrame * frameSize, 0, frameSize, frameSize,
            (canvas.width - frameSize) / 2, playerPositionY, frameSize, frameSize
        );
    }

    requestAnimationFrame(draw);
}

function setAnimation(name) {
    if (isAttacking && name !== "attackRight" && name !== "attackLeft") return;
    currentAnimation = animations[name];
    spriteSheet.src = currentAnimation.src;
    currentFrame = 0;
}
spriteSheet.onload = () => requestAnimationFrame(draw);

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    h: { pressed: false },
    w: { pressed: false } // Dodajemy klawisz skoku
};

let playerPositionX = (canvas.width - frameSize) / 2; // Początkowa pozycja X
let playerPositionY = canvas.height - frameSize;      // Początkowa pozycja Y

window.addEventListener('keydown', (event) => {
    if (isAttacking) return;

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
            if (!isAttacking) {
                isAttacking = true;
                setAnimation(lastDirection === "right" ? "attackRight" : "attackLeft");
            }
            break;
        case 'w':
            if (isGrounded) { // Sprawdzamy czy gracz dotyka podłoża przed skokiem
                playerYVelocity = jumpStrength;
                isGrounded = false;
            }
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