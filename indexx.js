
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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

    c.clearRect(0, 0, canvas.width, canvas.height);
    if (currentAnimation.flip) {
        c.save();
        c.scale(-1, 1);
        c.drawImage(
            spriteSheet,
            currentFrame * frameSize, 0, frameSize, frameSize,
            -(canvas.width - frameSize) / 2 - frameSize, (canvas.height - frameSize) / 2, frameSize, frameSize
        );
        c.restore();
    } else {
        c.drawImage(
            spriteSheet,
            currentFrame * frameSize, 0, frameSize, frameSize,
            (canvas.width - frameSize) / 2, (canvas.height - frameSize) / 2, frameSize, frameSize
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
    h: { pressed: false }
};

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



// // Responsywne ustawienie rozmiaru canvas
// function setCanvasSize() {
//     const maxWidth = window.innerWidth;
//     let width = 1344;
//     let height = 912;

//     canvas.width = width;
//     canvas.height = height;
// }

// const scaledCanvas = {
//     width: canvas.width,
//     height: canvas.height,
// }
// const scaledCanvasBackground = {
//     width: canvas.width,
//     height: canvas.height,
// }

// setCanvasSize();
// window.addEventListener('resize', setCanvasSize);


// // Grawitacja
// const gravity = 0.5

// // Dodawanie spritow
// class Sprite {
//     constructor({position, imageSrc, frameRate = 1}) {
//         this.position = position
//         this.image = new Image()
//         this.image.onload = () => {
//             this.width = this.image.width / this.frameRate
//             this.height = this.image.height
//         }
//         this.image.src = imageSrc
//         this.frameRate = frameRate
//         this.currentFrame = 0
//     }

//     draw() {
//         if (!this.image) return

//         const cropbox = {
//             position: {
//                 x: this.currentFrame * this.image.width/this.frameRate,
//                 y:0,
//             },
//             width: this.image.width / this.frameRate,
//             height: this.image.height,
//         }

//         c.drawImage(
//             this.image, 
//             cropbox.position.x, 
//             cropbox.position.y, 
//             cropbox.width, 
//             cropbox.height, 
//             this.position.x, 
//             this.position.y,
//             this.width / this.frameRate,
//             this.height
//         )
//     }

//     update() {
//         this.draw()
//         this.updateFrames()
//     }
    
//     updateFrames() {
//         this.currentFrame++
//     }

// }



// // Tworzenie gracza i jego ruch
// class Player extends Sprite{
//     constructor({position, imageSrc, frameRate}) {
//         super({imageSrc, frameRate})
//         this.position = position
//         this.velocity = {
//             x: 0,
//             y: 1,
//         }

//         // Rozmiary gracza
// 	    this.isDragging = false; // Dodaj flagę dla drag and drop
//         this.offset = { x: 0, y: 0 }; // Offset podczas przeciągania
//         this.color = 'red';
        
//     }

//     // draw() {
//     //     c.fillStyle = this.color;
//     //     c.fillRect(this.position.x, this.position.y, this.width, this.height)
//     // }

//     update() {
//         this.draw()

//         // Grawitacja jesli nie przeciagamy
// 	    if (!this.isDragging) { // Tylko jeśli nie przeciągamy
//             this.position.y += this.velocity.y;
//             this.position.x += this.velocity.x;
        
//         if (this.position.y + this.height + this.velocity.y < canvas.height) {
//             this.velocity.y += gravity;
//         } else {
//             // Stop spadania
//             this.velocity.y = 0;
//         }
//         } else {
//             this.velocity.x = 0;
//             this.velocity.y = 0;
//         }

//     // Ograniczenie pozycji gracza wewnątrz canvasu
//         if (this.position.x < 0) {
//             this.position.x = 0;
//         }
//         if (this.position.x + this.width > canvas.width) {
//             this.position.x = canvas.width - this.width;
//         }
//         if (this.position.y < 0) {
//             this.position.y = 0
//         }
//         if (this.position.y + this.height > canvas.height && !this.isDragging) {
//             this.position.y = canvas.height - this.height
//         }
//     }
// }

// // Zmienna gracza i jego koordynaty
// const player = new Player({
//     position: { 
//     x: 0,
//     y: 0,
// }, imageSrc: './img/character/idle.png',
//     // frameRate: 14,
//     frameRate: 1,

// });

// let y = 100;

// const keys = {
//     d: {
//         pressed: false,
//     },
//     a: {
//         pressed: false,
//     },
// }

// const background = new Sprite({
//     position: {
//         x: 0,
//         y: 0,
//     },
//     // imageSrc: './img/exampleBase.png',
//     imageSrc: './img/background.png',
// })

// // Funckja w której odgrywać się będzie całą gra
// function animate() {
//     window.requestAnimationFrame(animate);
//     c.fillStyle = 'white'
//     c.fillRect(0, 0, canvas.width, canvas.height)

//     c.save()
//     c.scale(2, 2)
//     c.translate(0, -background.image.height + scaledCanvas.height)
//     background.update()
//     c.restore()
//     player.update()

//     player.velocity.x = 0;
//     if (keys.d.pressed) {
//         player.velocity.x = 5;
//     } else if (keys.a.pressed) {
//         player.velocity.x = -5;
//     }
// }

// // Odpalanie funkcji
// animate();

// // Reakcja na naciśnięcie przycisku
// window.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'd':
//             keys.d.pressed = true;
//         break;
//         case 'a':
//             keys.a.pressed = true
//         break;
//         case 'w': 
//         player.velocity.y = -10;

//     }
// })

// // Reakcja na wypuszczenie przycisku
// window.addEventListener('keyup', (event) => {
//     switch (event.key) {
//         case 'd':
//             keys.d.pressed = false;
//         break;
//         case 'a':
//             keys.a.pressed = false;
//         break;
//     }
// })

// // Obsługa dotyku
// canvas.addEventListener('touchstart', (event) => {
//     const touch = event.touches[0];
//     const rect = canvas.getBoundingClientRect();
//     const touchX = touch.clientX - rect.left;
//     const touchY = touch.clientY - rect.top;

//      // Sprawdzenie czy dotykamy gracza
//     if (touchX >= player.position.x &&
//         touchX <= player.position.x + player.width &&
//         touchY >= player.position.y &&
//         touchY <= player.position.y + player.height) {

//         player.isDragging = true;
//         player.offset.x = touchX - player.position.x; // Oblicz offset
//         player.offset.y = touchY - player.position.y;
//     }
// });

// canvas.addEventListener('touchmove', (event) => {
//     if (player.isDragging) {
//         const touch = event.touches[0];
//         const rect = canvas.getBoundingClientRect();
//         const touchX = touch.clientX - rect.left;
//         const touchY = touch.clientY - rect.top;
//           // Ustaw pozycję gracza z uwzględnieniem offsetu
//         player.position.x = touchX - player.offset.x;
//         player.position.y = touchY - player.offset.y;

//          // Ograniczenie, aby gracz nie wychodził poza canvas
//          if (player.position.x < 0) {
//              player.position.x = 0
//           }
//           if (player.position.x + player.width > canvas.width) {
//               player.position.x = canvas.width - player.width
//           }
//           if(player.position.y < 0) {
//               player.position.y = 0
//           }
//          if(player.position.y + player.height > canvas.height) {
//              player.position.y = canvas.height - player.height
//          }
//     }
// });

// canvas.addEventListener('touchend', () => {
//     player.isDragging = false; // Przestań przeciągać, pozwól grawitacji działać
//     player.velocity.y = 0; // Wyzeruj prędkość pionową
// });

// // Pobranie palette-container
// const paletteContainer = document.querySelector('.palette-container');

// // Obsługa kliknięcia palety
// paletteContainer.addEventListener('click', (event) => {
//     const target = event.target;

//     if (target.classList.contains('palette')) {
//         const color = target.getAttribute('data-color');
//         player.color = color; // Zmiana koloru gracza
//     }
// });