const canvas = document.querySelector('canvas');

document.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false }); 

// Łapanie API "2d"
const c = canvas.getContext('2d');

// Responsywne ustawienie rozmiaru canvas
function setCanvasSize() {
    const maxWidth = window.innerWidth;
    let width = 840;
    let height = 600;

    if (maxWidth < 800) {
        width = Math.max(320, maxWidth);
        height = width / (800/600);
    }

    canvas.width = width;
    canvas.height = height;
}

const scaledCanvas = {
    width: canvas.width*2,
    height: canvas.height*2,
}
const scaledCanvasBackground = {
    width: canvas.width/4,
    height: canvas.height/4,
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// // Wielkość okna gry
// canvas.width = 800;
// canvas.height = 600;

// Grawitacja
const gravity = 0.5

// Dodawanie spritow
class Sprite {
    constructor({position, imageSrc, frameRate = 1}) {
        this.position = position
        this.image = new Image()
        this.image.onload = () => {
            this.width = this.image.width / this.frameRate
            this.height = this.image.height
        }
        this.image.src = imageSrc
        this.frameRate = frameRate
        this.currentFrame = 0
    }

    draw() {
        if (!this.image) return

        const cropbox = {
            position: {
                x: this.currentFrame * this.image.width/this.frameRate,
                y:0,
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
            this.width / this.frameRate,
            this.height
        )
    }

    update() {
        this.draw()
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
}



// Tworzenie gracza i jego ruch
class Player extends Sprite{
    constructor({position, imageSrc, frameRate}) {
        super({imageSrc, frameRate})
        this.position = position
        this.velocity = {
            x: 0,
            y: 1,
        }

        // Rozmiary gracza
	    this.isDragging = false; // Dodaj flagę dla drag and drop
        this.offset = { x: 0, y: 0 }; // Offset podczas przeciągania
        this.color = 'red';
        
    }

    // draw() {
    //     c.fillStyle = this.color;
    //     c.fillRect(this.position.x, this.position.y, this.width, this.height)
    // }

    update() {
        this.draw()

        // Grawitacja jesli nie przeciagamy
	    if (!this.isDragging) { // Tylko jeśli nie przeciągamy
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
        
        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity;
        } else {
            // Stop spadania
            this.velocity.y = 0;
        }
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

    // Ograniczenie pozycji gracza wewnątrz canvasu
        if (this.position.x < 0) {
            this.position.x = 0;
        }
        if (this.position.x + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
        }
        if (this.position.y < 0) {
            this.position.y = 0
        }
        if (this.position.y + this.height > canvas.height && !this.isDragging) {
            this.position.y = canvas.height - this.height
        }
    }
}

// Zmienna gracza i jego koordynaty
const player = new Player({
    position: { 
    x: 0,
    y: 0,
}, imageSrc: './img/character/idle.png',
    // frameRate: 14,
    frameRate: 1,

});

let y = 100;

const keys = {
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
}

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    // imageSrc: './img/exampleBase.png',
    imageSrc: './img/background.png',
})

// Funckja w której odgrywać się będzie całą gra
function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)

    c.save()
    c.scale(4, 4)
    c.translate(0, -background.image.height + scaledCanvas.height/2 + 10)
    background.update()
    c.restore()
    player.update()

    player.velocity.x = 0;
    if (keys.d.pressed) {
        player.velocity.x = 5;
    } else if (keys.a.pressed) {
        player.velocity.x = -5;
    }
}

// Odpalanie funkcji
animate();

// Reakcja na naciśnięcie przycisku
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
        break;
        case 'a':
            keys.a.pressed = true
        break;
        case 'w': 
        player.velocity.y = -10;

    }
})

// Reakcja na wypuszczenie przycisku
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
        break;
        case 'a':
            keys.a.pressed = false;
        break;
    }
})

// Obsługa dotyku
canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

     // Sprawdzenie czy dotykamy gracza
    if (touchX >= player.position.x &&
        touchX <= player.position.x + player.width &&
        touchY >= player.position.y &&
        touchY <= player.position.y + player.height) {

        player.isDragging = true;
        player.offset.x = touchX - player.position.x; // Oblicz offset
        player.offset.y = touchY - player.position.y;
    }
});

canvas.addEventListener('touchmove', (event) => {
    if (player.isDragging) {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
          // Ustaw pozycję gracza z uwzględnieniem offsetu
        player.position.x = touchX - player.offset.x;
        player.position.y = touchY - player.offset.y;

         // Ograniczenie, aby gracz nie wychodził poza canvas
         if (player.position.x < 0) {
             player.position.x = 0
          }
          if (player.position.x + player.width > canvas.width) {
              player.position.x = canvas.width - player.width
          }
          if(player.position.y < 0) {
              player.position.y = 0
          }
         if(player.position.y + player.height > canvas.height) {
             player.position.y = canvas.height - player.height
         }
    }
});

canvas.addEventListener('touchend', () => {
    player.isDragging = false; // Przestań przeciągać, pozwól grawitacji działać
    player.velocity.y = 0; // Wyzeruj prędkość pionową
});

// Pobranie palette-container
const paletteContainer = document.querySelector('.palette-container');

// Obsługa kliknięcia palety
paletteContainer.addEventListener('click', (event) => {
    const target = event.target;

    if (target.classList.contains('palette')) {
        const color = target.getAttribute('data-color');
        player.color = color; // Zmiana koloru gracza
    }
});