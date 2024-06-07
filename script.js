const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

resizeCanvas(); // Resize canvas initially
window.addEventListener('resize', resizeCanvas); // Resize canvas when window size changes

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const balls = [];
const squares = [];

function Ball(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.sound = new Audio('boin.mp3'); // Load the collision sound

    // Calculate mass based on volume (proportional to radius^3)
    this.mass = (4 / 3) * Math.PI * Math.pow(this.radius, 3);

    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    this.update = function() {
        this.draw();

        if (this.x + this.dx > canvas.width - this.radius || this.x + this.dx < this.radius) {
            this.dx = -this.dx;
            this.playCollisionSound();
        }
        if (this.y + this.dy > canvas.height - this.radius || this.y + this.dy < this.radius) {
            this.dy = -this.dy;
            this.playCollisionSound();
        }

        this.dy += parseFloat(document.getElementById('gravity').value); // Use gravity value from input

        this.x += this.dx;
        this.y += this.dy;
    }

    this.playCollisionSound = function() {
        if (document.getElementById('enableSound').checked) {
            this.sound.currentTime = 0; // Reset sound to the beginning
            this.sound.play(); // Play the sound
        }
    }
}

function Square(x, y, dx, dy, size, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.size = size;
    this.color = color;
    this.sound = new Audio('boin.mp3'); // Load the collision sound

    this.draw = function() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    this.update = function() {
        this.draw();

        if (this.x + this.dx > canvas.width - this.size || this.x + this.dx < 0) {
            this.dx = -this.dx;
            this.playCollisionSound();
        }
        if (this.y + this.dy > canvas.height - this.size || this.y + this.dy < 0) {
            this.dy = -this.dy;
            this.playCollisionSound();
        }

        this.dy += parseFloat(document.getElementById('gravity').value); // Use gravity value from input

        this.x += this.dx;
        this.y += this.dy;
    }

    this.playCollisionSound = function() {
        if (document.getElementById('enableSound').checked) {
            this.sound.currentTime = 0; // Reset sound to the beginning
            this.sound.play(); // Play the sound
        }
    }
}

function addBall() {
    const radius = parseFloat(document.getElementById('ballSize').value); // Use ball size value from input
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    let color;
    if (document.getElementById('randomColors').checked) {
        color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    } else {
        color = document.getElementById('ballColor').value || '#FFFFFF'; // Default to white if no color is set
    }
    const dx = (Math.random() - 0.5) * 4;
    const dy = (Math.random() - 0.5) * 4;
    balls.push(new Ball(x, y, dx, dy, radius, color));
}

function addSquare() {
    const size = parseFloat(document.getElementById('squareSize').value); // Use square size value from input
    const x = Math.random() * (canvas.width - size);
    const y = Math.random() * (canvas.height - size);
    const color = document.getElementById('squareColor').value;
    const dx = (Math.random() - 0.5) * 4;
    const dy = (Math.random() - 0.5) * 4;
    squares.push(new Square(x, y, dx, dy, size, color));
}

function toggleDropdown() {
    const dropdown = document.getElementById('menu');
    dropdown.classList.toggle('show');
}

function detectCollision(obj1, obj2) {
    if (obj1 instanceof Ball && obj2 instanceof Ball) {
        const distance = Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
        return distance < obj1.radius + obj2.radius;
    } else if (obj1 instanceof Square && obj2 instanceof Square) {
        return (
            obj1.x < obj2.x + obj2.size &&
            obj1.x + obj1.size > obj2.x &&
            obj1.y < obj2.y + obj2.size &&
            obj1.y + obj2.size > obj2.y
        );
    } else if (obj1 instanceof Ball && obj2 instanceof Square) {
        const distX = Math.abs(obj1.x - obj2.x - obj2.size / 2);
        const distY = Math.abs(obj1.y - obj2.y - obj2.size / 2);

        if (distX > (obj2.size / 2 + obj1.radius) || distY > (obj2.size / 2 + obj1.radius)) {
            return false;
        }

        if (distX <= (obj2.size / 2) || distY <= (obj2.size / 2)) {
            return true;
        }

        const dx = distX - obj2.size / 2;
        const dy = distY - obj2.size / 2;
        return (dx * dx + dy * dy <= (obj1.radius * obj1.radius));
    } else if (obj1 instanceof Square && obj2 instanceof Ball) {
        return detectCollision(obj2, obj1); // A colisão entre bola e quadrado é simétrica, podemos reutilizar a função invertendo a ordem dos objetos
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, document.getElementById('bgColor1').value);
    gradient.addColorStop(1, document.getElementById('bgColor2').value);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.update();

        balls.forEach(otherBall => {
            if (ball !== otherBall && detectCollision(ball, otherBall)) {
                ball.playCollisionSound();
                ball.dx = -ball.dx;
                ball.dy = -ball.dy;
            }
        });

        squares.forEach(square => {
            if (detectCollision(ball, square)) {
                ball.playCollisionSound();
                ball.dx = -ball.dx;
                ball.dy = -ball.dy;
            }
        });
    });

    squares.forEach(square => {
        square.update();

        squares.forEach(otherSquare => {
            if (square !== otherSquare && detectCollision(square, otherSquare)) {
                square.playCollisionSound();
                square.dx = -square.dx;
                square.dy = -square.dy;
            }
        });

        balls.forEach(ball => {
            if (detectCollision(square, ball)) {
                square.playCollisionSound();
                square.dx = -square.dx;
                square.dy = -square.dy;
            }
        });
    });
}

animate();

document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');
    const body = document.body;
    const clickableTop = document.getElementById('clickable-top');

    // Mostra o navbar quando o mouse passa sobre ele
    navbar.addEventListener('mouseover', function () {
        body.classList.add('show-navbar');
    });

    // Oculta o navbar quando o mouse sai dele
    navbar.addEventListener('mouseout', function () {
        body.classList.remove('show-navbar');
    });

    // Alterna a visibilidade do navbar quando clicado
    navbar.addEventListener('click', function () {
        body.classList.toggle('show-navbar');
    });

    // Mostra o navbar quando a área clicável no topo é clicada
    clickableTop.addEventListener('click', function () {
        body.classList.add('show-navbar');
    });
});
