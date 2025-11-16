// Ottiene il canvas e il contesto di disegno
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Assicurati che il canvas sia adattivo per i dispositivi mobile
canvas.style.width = '100%';
canvas.style.height = '100%';

// --- 🎾 Variabili di Gioco ---

// Dimensioni del campo (prendiamo le dimensioni dall'HTML per la logica)
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

// Scala il contesto del canvas per evitare pixelizzazione su schermi ad alta risoluzione
// e per far corrispondere le coordinate logiche con quelle fisiche
const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

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
    dy: 0 // Velocità verticale
};

let player2 = {
    x: GAME_WIDTH - PADDLE_WIDTH - 10,
    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0 // Velocità verticale
};

// Punteggio
let score1 = 0;
let score2 = 0;

// Variabili per il Touch Control
let touchY1 = player1.y + PADDLE_HEIGHT / 2; // Posizione Y del touch per P1
let touchY2 = player2.y + PADDLE_HEIGHT / 2; // Posizione Y del touch per P2

// --- 🎨 Funzioni di Disegno (DRAW) ---

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(score1, GAME_WIDTH / 4, 30);
    ctx.fillText(score2, GAME_WIDTH * 3 / 4, 30);
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Linea centrale
    ctx.strokeStyle = 'white';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();
    
    // Racchette
    drawRect(player1.x, player1.y, player1.width, player1.height, 'white');
    drawRect(player2.x, player2.y, player2.width, player2.height, 'white');
    
    // Palla
    drawCircle(ball.x, ball.y, ball.radius, 'white');
    
    // Punteggio
    drawScore();
}

// --- ⚙️ Funzioni di Aggiornamento Logico (UPDATE) ---

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collisione muri (Superiore/Inferiore)
    if (ball.y + ball.radius > GAME_HEIGHT || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Collisione Racchetta 1 (Sinistra)
    if (ball.x - ball.radius < player1.x + player1.width && 
        ball.y > player1.y && 
        ball.y < player1.y + player1.height && 
        ball.dx < 0) 
    {
        ball.dx = -ball.dx;
    }

    // Collisione Racchetta 2 (Destra)
    if (ball.x + ball.radius > player2.x && 
        ball.y > player2.y && 
        ball.y < player2.y + player2.height && 
        ball.dx > 0) 
    {
        ball.dx = -ball.dx;
    }

    // Palla fuori dal campo (Punto)
    if (ball.x < 0) {
        score2++;
        resetBall();
    } else if (ball.x > GAME_WIDTH) {
        score1++;
        resetBall();
    }
}

function resetBall() {
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    ball.dx = -ball.dx; 
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * 4;
}

// Aggiornamento posizione racchetta basato sul touch
function updatePaddles() {
    // La racchetta cerca di raggiungere la posizione Y del touch/mouse
    
    // Player 1 (Sinistra)
    const center1 = player1.y + PADDLE_HEIGHT / 2;
    const diff1 = touchY1 - center1;
    
    // Se la differenza è maggiore della velocità, muovi alla massima velocità
    if (Math.abs(diff1) > PADDLE_SPEED) {
        player1.y += diff1 > 0 ? PADDLE_SPEED : -PADDLE_SPEED;
    } else {
        // Altrimenti, muovi direttamente alla posizione del touch
        player1.y += diff1; 
    }

    // Player 2 (Destra)
    const center2 = player2.y + PADDLE_HEIGHT / 2;
    const diff2 = touchY2 - center2;
    
    if (Math.abs(diff2) > PADDLE_SPEED) {
        player2.y += diff2 > 0 ? PADDLE_SPEED : -PADDLE_SPEED;
    } else {
        player2.y += diff2;
    }

    // Limiti (rimane come prima)
    if (player1.y < 0) player1.y = 0;
    if (player1.y + PADDLE_HEIGHT > GAME_HEIGHT) player1.y = GAME_HEIGHT - PADDLE_HEIGHT;
    if (player2.y < 0) player2.y = 0;
    if (player2.y + PADDLE_HEIGHT > GAME_HEIGHT) player2.y = GAME_HEIGHT - PADDLE_HEIGHT;
}


// --- 🎮 Ciclo di Gioco Principale ---

function gameLoop() {
    updatePaddles();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}


// --- ✋ Gestione degli Input Touch (Mobile) e Mouse (Desktop) ---

// Funzione di utilità per normalizzare le coordinate del touch
function getCanvasTouchY(touchY) {
    // Questa funzione mappa la coordinata Y del touch sullo schermo
    // alle coordinate Y logiche del nostro canvas (0 a GAME_HEIGHT)
    const rect = canvas.getBoundingClientRect();
    const clientY = touchY - rect.top; // Posizione Y relativa al canvas
    return (clientY / rect.height) * GAME_HEIGHT; // Scala sulla dimensione logica
}

canvas.addEventListener('mousemove', (event) => {
    // Se non ci sono touch attivi, usa il mouse per controllare P1
    if (event.clientX < canvas.width / 2) {
        touchY1 = getCanvasTouchY(event.clientY);
    }
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault(); // Previene lo scrolling della pagina durante il gioco
    
    // Gestisce tutti i touchpoints attivi
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        const touchX = getCanvasTouchY(touch.clientX); // Posizione X normalizzata
        const touchY = getCanvasTouchY(touch.clientY); // Posizione Y normalizzata

        // Area di controllo: P1 (metà sinistra del campo)
        if (touch.clientX < canvas.width / 2) {
            touchY1 = touchY;
        } 
        // Area di controllo: P2 (metà destra del campo)
        else {
            touchY2 = touchY;
        }
    }
}, false); // 'false' è importante per prevenire problemi di performance


// --- 🏁 Avvia il Gioco ---
gameLoop();
