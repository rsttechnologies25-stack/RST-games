const gridContainer = document.getElementById('gridContainer');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalScoreDisplay = document.getElementById('finalScore');
const modalBestScoreDisplay = document.getElementById('modalBestScore');

let gameActive = true;
let score = 0;
let redTileIndex = -1;

const GRID_SIZE = 16; // 4x4 grid
const BEST_SCORE_KEY = 'dontTapRedBestScore';

// Load best score
function loadBestScore() {
    const saved = ScoreManager.getBestScore("dont_tap_red");
    return saved ? parseInt(saved) : 0;
}

// Save best score
function saveBestScore(score) {
    const currentBest = loadBestScore();
    if (score > currentBest) {
        ScoreManager.saveScore("dont_tap_red", score);
        return true;
    }
    return false;
}

// Shuffle and create grid
function createGrid() {
    gridContainer.innerHTML = '';

    // Random red tile position
    redTileIndex = Math.floor(Math.random() * GRID_SIZE);

    // Create tiles
    for (let i = 0; i < GRID_SIZE; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';

        if (i === redTileIndex) {
            tile.classList.add('red');
        }

        tile.addEventListener('click', () => handleTileClick(i));
        gridContainer.appendChild(tile);
    }
}

// Handle tile click
function handleTileClick(index) {
    if (!gameActive) return;

    if (index === redTileIndex) {
        // Red tile clicked - game over
        gameOver();
    } else {
        // Safe tile clicked - increment score and shuffle
        score++;
        scoreDisplay.textContent = score;
        shuffleGrid();
    }
}

// Shuffle grid
function shuffleGrid() {
    // Create a subtle transition effect
    gridContainer.style.opacity = '0.5';

    setTimeout(() => {
        createGrid();
        gridContainer.style.opacity = '1';
    }, 150);
}

// Game over
function gameOver() {
    gameActive = false;

    // Add shake animation to grid
    gridContainer.classList.add('shake');
    setTimeout(() => gridContainer.classList.remove('shake'), 500);

    // Save best score
    const isNewBest = saveBestScore(score);
    const bestScore = loadBestScore();

    // Update displays
    finalScoreDisplay.textContent = score;
    modalBestScoreDisplay.textContent = bestScore;
    bestScoreDisplay.textContent = bestScore;

    // Show game over modal after shake animation
    setTimeout(() => {
        gameOverModal.classList.add('active');
    }, 600);

    // Show buttons
    restartBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';

    // Update share button
    updateShareButton(score);
}

// Update share button with WhatsApp message
function updateShareButton(score) {
    const message = `🟥 Don't Tap the Red - RexonSoftTech\n\n` +
        `Score: ${score} safe tiles tapped\n` +
        `Can you beat my score?\n\n` +
        `${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    shareBtn.onclick = () => window.open(whatsappUrl, '_blank');
}

// Restart game
function restartGame() {
    gameActive = true;
    score = 0;
    scoreDisplay.textContent = score;
    gameOverModal.classList.remove('active');
    restartBtn.style.display = 'none';
    shareBtn.style.display = 'none';
    createGrid();
}

// Event listeners
playAgainBtn.addEventListener('click', restartGame);
restartBtn.addEventListener('click', restartGame);

// Initialize game
bestScoreDisplay.textContent = loadBestScore();
createGrid();
