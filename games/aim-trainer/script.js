const playArea = document.getElementById('playArea');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const timerDisplay = document.getElementById('timer');
const hitsDisplay = document.getElementById('hits');
const missesDisplay = document.getElementById('misses');
const accuracyDisplay = document.getElementById('accuracy');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalHitsDisplay = document.getElementById('finalHits');
const finalMissesDisplay = document.getElementById('finalMisses');
const finalAccuracyDisplay = document.getElementById('finalAccuracy');
const bestScoreDisplay = document.getElementById('bestScore');

let gameActive = false;
let hits = 0;
let misses = 0;
let timeLeft = 30;
let timerInterval;
let spawnInterval;
let dots = [];

const GAME_DURATION = 30; // seconds
const DOT_SPAWN_INTERVAL = 800; // milliseconds
const DOT_LIFETIME = 2000; // milliseconds before auto-removal

// LocalStorage key
const BEST_SCORE_KEY = 'aimTrainerBestScore';

// Load best score
function loadBestScore() {
    const saved = ScoreManager.getBestScore("aim_trainer");
    return saved ? parseInt(saved) : 0;
}

// Save best score
function saveBestScore(score) {
    const currentBest = loadBestScore();
    if (score > currentBest) {
        ScoreManager.saveScore("aim_trainer", score);
        return true;
    }
    return false;
}

// Calculate accuracy
function calculateAccuracy() {
    const total = hits + misses;
    if (total === 0) return 0;
    return Math.round((hits / total) * 100);
}

// Update displays
function updateDisplays() {
    hitsDisplay.textContent = hits;
    missesDisplay.textContent = misses;
    accuracyDisplay.textContent = calculateAccuracy() + '%';
    timerDisplay.textContent = timeLeft;
}

// Spawn a dot at random position
function spawnDot() {
    if (!gameActive) return;

    const dot = document.createElement('div');
    dot.className = 'dot';

    // Random position (accounting for dot size and margins)
    const maxX = playArea.offsetWidth - 80;
    const maxY = playArea.offsetHeight - 80;
    const x = Math.random() * maxX + 20;
    const y = Math.random() * maxY + 20;

    dot.style.left = x + 'px';
    dot.style.top = y + 'px';

    // Click handler
    dot.addEventListener('click', (e) => {
        e.stopPropagation();
        hits++;
        updateDisplays();
        dot.remove();
        const index = dots.indexOf(dot);
        if (index > -1) dots.splice(index, 1);
    });

    playArea.appendChild(dot);
    dots.push(dot);

    // Auto-remove after lifetime
    setTimeout(() => {
        if (dot.parentElement) {
            dot.remove();
            const index = dots.indexOf(dot);
            if (index > -1) dots.splice(index, 1);
        }
    }, DOT_LIFETIME);
}

// Handle play area clicks (misses)
function handlePlayAreaClick(e) {
    if (!gameActive) return;
    if (e.target === playArea) {
        misses++;
        updateDisplays();
    }
}

// Start game
function startGame() {
    gameActive = true;
    hits = 0;
    misses = 0;
    timeLeft = GAME_DURATION;
    dots = [];

    // Clear play area
    playArea.innerHTML = '';

    // Hide start screen
    startScreen.style.display = 'none';

    // Hide buttons
    restartBtn.style.display = 'none';
    shareBtn.style.display = 'none';

    updateDisplays();

    // Start timer
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplays();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Start spawning dots
    spawnInterval = setInterval(spawnDot, DOT_SPAWN_INTERVAL);
    spawnDot(); // Spawn first dot immediately
}

// End game
function endGame() {
    gameActive = false;

    // Clear intervals
    clearInterval(timerInterval);
    clearInterval(spawnInterval);

    // Remove all remaining dots
    dots.forEach(dot => dot.remove());
    dots = [];

    // Calculate final stats
    const accuracy = calculateAccuracy();
    const score = hits;
    const isNewBest = saveBestScore(score);
    const bestScore = loadBestScore();

    // Update final stats display
    finalHitsDisplay.textContent = hits;
    finalMissesDisplay.textContent = misses;
    finalAccuracyDisplay.textContent = accuracy + '%';
    bestScoreDisplay.textContent = bestScore;

    // Show game over modal
    gameOverModal.classList.add('active');

    // Show buttons
    restartBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';

    // Update share button
    updateShareButton(score, accuracy);
}

// Update share button with WhatsApp message
function updateShareButton(score, accuracy) {
    const message = `🎯 Aim Trainer - RexonSoftTech\n\n` +
        `Score: ${score} hits\n` +
        `Accuracy: ${accuracy}%\n\n` +
        `Try to beat my score!\n` +
        `${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    shareBtn.onclick = () => window.open(whatsappUrl, '_blank');
}

// Restart game
function restartGame() {
    gameOverModal.classList.remove('active');
    startGame();
}

// Event listeners
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', restartGame);
restartBtn.addEventListener('click', restartGame);
playArea.addEventListener('click', handlePlayAreaClick);

// Display best score on load
bestScoreDisplay.textContent = loadBestScore();
