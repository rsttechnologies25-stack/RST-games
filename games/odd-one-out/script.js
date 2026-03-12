const itemsGrid = document.getElementById('itemsGrid');
const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('round');
const bestScoreDisplay = document.getElementById('bestScore');
const timerBar = document.getElementById('timerBar');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalScoreDisplay = document.getElementById('finalScore');
const finalRoundDisplay = document.getElementById('finalRound');
const modalBestScoreDisplay = document.getElementById('modalBestScore');

let gameActive = true;
let score = 0;
let round = 1;
let oddItemIndex = -1;
let currentTime = 5000; // Starting time in ms
let timerInterval;
let timeLeft = 5000;

const INITIAL_TIME = 5000; // 5 seconds
const TIME_DECREASE = 200; // Decrease by 0.2s per round
const MIN_TIME = 2000; // Minimum 2 seconds
const BEST_SCORE_KEY = 'oddOneOutBestScore';

// Item types
const ITEM_TYPES = ['numbers', 'shapes', 'colors'];

// Collections
const SHAPES = ['⭐', '❤️', '🔴', '⬛', '🔵', '🟢', '🟡', '🔷', '🔶', '⬜'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

// Load best score
function loadBestScore() {
    const saved = ScoreManager.getBestScore("odd_one_out");
    return saved ? parseInt(saved) : 0;
}

// Save best score
function saveBestScore(score) {
    const currentBest = loadBestScore();
    if (score > currentBest) {
        ScoreManager.saveScore("odd_one_out", score);
        return true;
    }
    return false;
}

// Generate items
function generateItems() {
    const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    let items = [];
    let oddItem;

    switch (itemType) {
        case 'numbers':
            const baseNum = Math.floor(Math.random() * 99) + 1;
            const differentNum = baseNum + Math.floor(Math.random() * 9) + 1;
            items = [baseNum, baseNum, baseNum, differentNum];
            break;

        case 'shapes':
            const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            let differentShape;
            do {
                differentShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            } while (differentShape === baseShape);
            items = [baseShape, baseShape, baseShape, differentShape];
            break;

        case 'colors':
            const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            let differentColor;
            do {
                differentColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            } while (differentColor === baseColor);
            items = [baseColor, baseColor, baseColor, differentColor];
            break;
    }

    // Shuffle items
    oddItemIndex = 3; // Last item before shuffle
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
        if (i === oddItemIndex) oddItemIndex = j;
        else if (j === oddItemIndex) oddItemIndex = i;
    }

    return { items, itemType };
}

// Create item cards
function createRound() {
    itemsGrid.innerHTML = '';
    const { items, itemType } = generateItems();

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';

        if (itemType === 'numbers') {
            card.classList.add('number');
            card.textContent = item;
        } else if (itemType === 'shapes') {
            card.textContent = item;
        } else if (itemType === 'colors') {
            card.classList.add('color-box');
            card.style.backgroundColor = item;
        }

        card.addEventListener('click', () => handleItemClick(index));
        itemsGrid.appendChild(card);
    });

    // Start timer
    startTimer();
}

// Start timer
function startTimer() {
    timeLeft = currentTime;
    timerBar.style.width = '100%';

    const startTimestamp = Date.now();

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTimestamp;
        timeLeft = Math.max(0, currentTime - elapsed);
        const percentage = (timeLeft / currentTime) * 100;
        timerBar.style.width = percentage + '%';

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver(false);
        }
    }, 50);
}

// Handle item click
function handleItemClick(index) {
    if (!gameActive) return;

    clearInterval(timerInterval);

    if (index === oddItemIndex) {
        // Correct!
        score++;
        round++;
        scoreDisplay.textContent = score;
        roundDisplay.textContent = round;

        // Increase difficulty (reduce time)
        currentTime = Math.max(MIN_TIME, currentTime - TIME_DECREASE);

        // Next round
        createRound();
    } else {
        // Wrong answer
        gameOver(false);
    }
}

// Game over
function gameOver(timeout = true) {
    gameActive = false;
    clearInterval(timerInterval);

    // Save best score
    const isNewBest = saveBestScore(score);
    const bestScore = loadBestScore();

    // Update displays
    finalScoreDisplay.textContent = score;
    finalRoundDisplay.textContent = round - 1;
    modalBestScoreDisplay.textContent = bestScore;
    bestScoreDisplay.textContent = bestScore;

    // Show game over modal
    gameOverModal.classList.add('active');

    // Show buttons
    restartBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';

    // Update share button
    updateShareButton(score, round - 1);
}

// Update share button with WhatsApp message
function updateShareButton(score, rounds) {
    const message = `🧠 Odd One Out - RexonSoftTech\n\n` +
        `Score: ${score}\n` +
        `Rounds: ${rounds}\n` +
        `Can you beat me?\n\n` +
        `${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    shareBtn.onclick = () => window.open(whatsappUrl, '_blank');
}

// Restart game
function restartGame() {
    gameActive = true;
    score = 0;
    round = 1;
    currentTime = INITIAL_TIME;

    scoreDisplay.textContent = score;
    roundDisplay.textContent = round;

    gameOverModal.classList.remove('active');
    restartBtn.style.display = 'none';
    shareBtn.style.display = 'none';

    createRound();
}

// Event listeners
playAgainBtn.addEventListener('click', restartGame);
restartBtn.addEventListener('click', restartGame);

// Initialize game
bestScoreDisplay.textContent = loadBestScore();
createRound();
