const canvas = document.querySelector('canvas');

// Zapobieganie domyślnej akcji przewijania przy dotyku
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false });

const c = canvas.getContext('2d');

// Responsywne ustawienie rozmiaru canvas
function setCanvasSize() {
    const maxWidth = window.innerWidth;
    let width = 800;
    let height = 600;

    if (maxWidth < 800) {
        width = Math.max(320, maxWidth);
        height = width / (800 / 600);
    }

    canvas.width = width;
    canvas.height = height;
}

const scaledCanvas = {
    width: canvas.width,
    height: canvas.height,
};

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

const gravity = 0.5;

// Klasa Sprite
class Sprite {
    constructor({ position, imageSrc, frameRate = 1, frameBuffer = 5, loop = true, scale = 1 }) {
        this.position = position
        this.scale = scale
        this.image = new Image()
        this.image.onload = () => {
            this.width = (this.image.width / this.frameRate) * this.scale
            this.height = this.image.height * this.scale
        }
        this.image.src = imageSrc
        this.frameRate = frameRate
        this.currentFrame = 0
        this.frameBuffer = frameBuffer
        this.elapsedFrames = 0
        this.loop = loop
        this.loaded = false
        this.image.onload = () => {
            this.loaded = true
            this.width = (this.image.width / this.frameRate) * this.scale
            this.height = this.image.height * this.scale
        }
    }

    draw() {
        if (!this.loaded) return
        const cropbox = {
            position: {
                x: this.currentFrame * (this.image.width / this.frameRate),
                y: 0,
            },
            width: this.image.width / this.frameRate,
            height: this.image.height,
        }

        c.drawImage(
            this.image,
            cropbox.position.x,
            cropbox.position.y,
            cropbox.width,
            cropbox.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }

    updateFrames() {
        this.elapsedFrames++

        if (this.elapsedFrames % this.frameBuffer === 0) {
            if (this.currentFrame < this.frameRate - 1) {
                this.currentFrame++
            } else if (this.loop) {
                this.currentFrame = 0
            }
        }
    }

    update() {
        if (!this.loaded) return
        this.draw()
        this.updateFrames()
    }
}

// Klasa Player
class Player extends Sprite {
    constructor({ position, velocity, imageSrc, frameRate = 1, frameBuffer = 5, loop = true, animations, scale }) {
        super({ position, imageSrc, frameRate, frameBuffer, loop, scale })
        this.velocity = velocity
        this.animations = animations
        this.lastDirection = 'right'
        this.attacking = false
        this.currentAnimation = null

        for (let key in this.animations) {
            const imageSrc = this.animations[key].imageSrc
            this.animations[key].image = new Image()
            this.animations[key].image.src = imageSrc
        }
    }

    switchSprite(key) {
        if (this.image === this.animations[key].image || !this.loaded) return

        this.currentFrame = 0
        this.image = this.animations[key].image
        this.frameRate = this.animations[key].frameRate
        this.frameBuffer = this.animations[key].frameBuffer
        this.currentAnimation = key
    }

    update() {
        if (!this.loaded) return
        this.draw()
        this.updateFrames()
        // animations
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity
        } else {
            this.velocity.y = 0
        }
    }
}

// Tworzenie gracza
const player = new Player({
    position: {
        x: 100,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    imageSrc: './img/character/idle.png',
    frameRate: 11,
    animations: {
        idleRight: {
            imageSrc: './img/character/idle.png',
            frameRate: 11,
            frameBuffer: 5,
        },
        idleLeft: {
            imageSrc: './img/character/walk.png',
            frameRate: 11,
            frameBuffer: 5,
        },
        runRight: {
            imageSrc: './img/character/walk.png',
            frameRate: 12,
            frameBuffer: 5,
        },
        runLeft: {
            imageSrc: './img/character/runLeft.png',
            frameRate: 12,
            frameBuffer: 5,
        },
        attackRight: {
            imageSrc: './img/character/attackRight.png',
            frameRate: 6,
            frameBuffer: 5,
        },
        attackLeft: {
            imageSrc: './img/character/attackLeft.png',
            frameRate: 6,
            frameBuffer: 5,
        },
    },
    scale: 0.5,
});

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    h: {
        pressed: false
    }
}

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './img/background.png',
    scale: 1,
})

// Funkcja animacji
function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    background.update();
    player.update();
    player.velocity.x = 0;

    if (keys.d.pressed && !player.attacking) {
        player.switchSprite('walk');
        player.velocity.x = 5;
        player.lastDirection = 'right';
    } else if (keys.a.pressed && !player.attacking) {
        player.switchSprite('walk');
        player.velocity.x = -5;
        player.lastDirection = 'left';
    } else if (!player.attacking) {
        player.switchSprite('idle');
    }

    if (keys.h.pressed && !player.attacking) {
        player.attacking = true;
        player.switchSprite('idle'); // Brak animacji ataku, zostaje idle
    }

    if (player.attacking && player.currentAnimation === 'idle') {
        if (player.currentFrame === player.animations[player.currentAnimation].frameRate - 1) {
            player.attacking = false;
        }
    }
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true
            break;
        case 'w':
            if (player.velocity.y === 0) {
                player.velocity.y = -15;
            }
            break;
        case 'h':
            keys.h.pressed = true;
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'h':
            keys.h.pressed = false;
            break;
    }
})