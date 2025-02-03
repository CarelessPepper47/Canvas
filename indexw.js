const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gravity = 0.5;

class Player {
    constructor(position) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0, // Zresetuj velocity y do 0
        };
        this.height = 100;
        this.width = 100; // Dodaj szerokość gracza
        this.isDragging = false; // Dodaj flagę dla drag and drop
        this.offset = { x: 0, y: 0 }; // Offset podczas przeciągania
    }

    draw() {
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        if (!this.isDragging) { // Tylko jeśli nie przeciągamy
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;

           if (this.position.y + this.height + this.velocity.y < canvas.height) {
                this.velocity.y += gravity;
            } else {
                this.velocity.y = 0;
                this.position.y = canvas.height - this.height; // Poprawka, by nie wpadał pod podłogę
            }
        } else { // Ustaw prędkość na 0 podczas przeciągania
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


const player = new Player({
    x: 0,
    y: 0,
});

const keys = {
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
};

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

     // Ruch za pomocą klawiszy
     player.velocity.x = 0;
     if (keys.d.pressed) {
         player.velocity.x = 2;
     }
     if (keys.a.pressed) {
         player.velocity.x = -2;
     }
}

animate();


window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
        break;
        case 'a':
            keys.a.pressed = true;
        break;
        case 'w':
        if (!player.isDragging){
            player.velocity.y = -10;
        }
        break;

    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
        break;
        case 'a':
            keys.a.pressed = false;
        break;
    }
});


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