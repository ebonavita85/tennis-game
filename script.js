// Ottiene il canvas e il contesto di disegno
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 🎾 Variabili di Gioco ---

// Dimensioni del campo
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Palla
let ball = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    radius: 8,
    dx: 4, // Velocità orizzontale
    dy: 4  // Velocità verticale
};

// Racchette (Paddle)
const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 10;
const PADDLE_SPEED = 6;

let player1 = {
    x: 10,
    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0 // Velocità verticale del giocatore
};

let player2 = {
    x: GAME_WIDTH - PADDLE_WIDTH - 10,
    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0 // Velocità verticale del giocatore
};

// Punteggio
let score1 = 0;
let score2 = 0;

// --- 🎨 Funzioni di Disegno ---

// Disegna un rettangolo (usato per le racchette)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Disegna il cerchio (la palla)
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fill();
}

// Disegna il punteggio
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    // Punteggio Giocatore 1 (sinistra)
    ctx.fillText(score1, GAME_WIDTH / 4, 30); 
    // Punteggio Giocatore 2 (destra)
    ctx.fillText(score2, GAME_WIDTH * 3 / 4, 30);
}

// Disegna tutti gli elementi
function draw() {
    // 1. Pulisce il canvas (ridisegna lo sfondo)
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 2. Disegna la linea centrale (opzionale)
    ctx.strokeStyle = 'white';
    ctx.setLineDash([10, 10]); // Linea tratteggiata
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();
    
    // 3. Disegna le racchette
    drawRect(player1.x, player1.y, player1.width, player1.height, 'white');
    drawRect(player2.x, player2.y, player2.width, player2.height, 'white');
    
    // 4. Disegna la palla
    drawCircle(ball.x, ball.y, ball.radius, 'white');
    
    // 5. Disegna il punteggio
    drawScore();
}

// --- ⚙️ Funzioni di Aggiornamento Logico ---

// Aggiorna la posizione della palla
function updateBall() {
    // Muove la palla
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collisione con i bordi superiore e inferiore
    if (ball.y + ball.radius > GAME_HEIGHT || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy; // Inverte la direzione verticale
    }

    // Collisione con la racchetta 1 (Sinistra)
    if (ball.x - ball.radius < player1.x + player1.width && 
        ball.y > player1.y && 
        ball.y < player1.y + player1.height && 
        ball.dx < 0) 
    {
        ball.dx = -ball.dx; // Inverte la direzione orizzontale
    }

    // Collisione con la racchetta 2 (Destra)
    if (ball.x + ball.radius > player2.x && 
        ball.y > player2.y && 
        ball.y < player2.y + player2.height && 
        ball.dx > 0) 
    {
        ball.dx = -ball.dx; // Inverte la direzione orizzontale
    }

    // Palla fuori dal campo (Gol)
    if (ball.x < 0) {
        score2++; // Punto per il Giocatore 2
        resetBall();
    } else if (ball.x > GAME_WIDTH) {
        score1++; // Punto per il Giocatore 1
        resetBall();
    }
}

// Riposiziona la palla al centro e inverte la direzione per il nuovo punto
function resetBall() {
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    // Inverte dx per dare il servizio all'altro giocatore
    ball.dx = -ball.dx; 
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * 4; // Direzione verticale casuale
}

// Aggiorna la posizione delle racchette e le mantiene nei limiti
function updatePaddles() {
    // Aggiorna la posizione della racchetta 1
    player1.y += player1.dy;
    // Limita la racchetta al bordo superiore/inferiore
    if (player1.y < 0) player1.y = 0;
    if (player1.y + PADDLE_HEIGHT > GAME_HEIGHT) player1.y = GAME_HEIGHT - PADDLE_HEIGHT;

    // Aggiorna la posizione della racchetta 2
    player2.y += player2.dy;
    // Limita la racchetta al bordo superiore/inferiore
    if (player2.y < 0) player2.y = 0;
    if (player2.y + PADDLE_HEIGHT > GAME_HEIGHT) player2.y = GAME_HEIGHT - PADDLE_HEIGHT;
}


// --- 🎮 Ciclo di Gioco Principale ---

function gameLoop() {
    updatePaddles();
    updateBall();
    draw();
    
    // Richiama la funzione per il prossimo frame (circa 60 volte al secondo)
    requestAnimationFrame(gameLoop);
}


// --- ⌨️ Gestione degli Input (Tasti) ---

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Giocatore 1 (W/S)
        case 'w':
            player1.dy = -PADDLE_SPEED;
            break;
        case 's':
            player1.dy = PADDLE_SPEED;
            break;
        
        // Giocatore 2 (Frecce UP/DOWN)
        case 'ArrowUp':
            player2.dy = -PADDLE_SPEED;
            break;
        case 'ArrowDown':
            player2.dy = PADDLE_SPEED;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        // Giocatore 1
        case 'w':
        case 's':
            player1.dy = 0;
            break;
        
        // Giocatore 2
        case 'ArrowUp':
        case 'ArrowDown':
            player2.dy = 0;
            break;
    }
});


// --- 🏁 Avvia il Gioco ---
gameLoop();
