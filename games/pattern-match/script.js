const targetPattern = document.getElementById('targetPattern');
const optionsGrid = document.getElementById('optionsGrid');
const levelDisplay = document.getElementById('level');
const bestLevelDisplay = document.getElementById('bestLevel');
const timerBar = document.getElementById('timerBar');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalLevelDisplay = document.getElementById('finalLevel');
const modalBestLevelDisplay = document.getElementById('modalBestLevel');

let gameActive = true;
let level = 1;
let correctOptionIndex = -1;
let currentTime = 10000; // Starting time in ms
let timerInterval;

const INITIAL_TIME = 10000; // 10 seconds
const TIME_DECREASE = 500; // Decrease by 0.5s per level
const MIN_TIME = 3000; // Minimum 3 seconds
const BEST_LEVEL_KEY = 'patternMatchBestLevel';

// Pattern types
const PATTERN_TYPES = ['numbers', 'shapes', 'colors'];
const SHAPES = ['⭐', '❤️', '🔴', '⬛', '🔵', '🟢', '🟡', '🔷'];
const COLORS = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪'];

// Load best level
function loadBestLevel() {
    const saved = ScoreManager.getBestScore("pattern_match");
    return saved ? parseInt(saved) : 0;
}

// Save best level
function saveBestLevel(level) {
    const currentBest = loadBestLevel();
    if (level > currentBest) {
        ScoreManager.saveScore("pattern_match", level);
        return true;
    }
    return false;
}

// Generate a pattern
function generatePattern(type, length) {
    let pattern = [];

    switch (type) {
        case 'numbers':
            for (let i = 0; i < length; i++) {
                pattern.push(Math.floor(Math.random() * 10));
            }
            break;

        case 'shapes':
            for (let i = 0; i < length; i++) {
                pattern.push(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
            }
            break;

        case 'colors':
            for (let i = 0; i < length; i++) {
                pattern.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
            }
            break;
    }

    return pattern;
}

// Create similar but different pattern
function createDistractor(originalPattern, type) {
    const pattern = [...originalPattern];
    const changeIndex = Math.floor(Math.random() * pattern.length);

    if (type === 'numbers') {
        let newNum;
        do {
            newNum = Math.floor(Math.random() * 10);
        } while (newNum === pattern[changeIndex]);
        pattern[changeIndex] = newNum;
    } else if (type === 'shapes') {
        let newShape;
        do {
            newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        } while (newShape === pattern[changeIndex]);
        pattern[changeIndex] = newShape;
    } else if (type === 'colors') {
        let newColor;
        do {
            newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (newColor === pattern[changeIndex]);
        pattern[changeIndex] = newColor;
    }

    return pattern;
}

// Format pattern for display
function formatPattern(pattern) {
    return pattern.join(' ');
}

// Create round
function createRound() {
    optionsGrid.innerHTML = '';

    // Determine pattern type and length based on level
    const patternType = PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];
    const patternLength = Math.min(3 + Math.floor(level / 3), 7); // Grow from 3 to 7

    // Generate target pattern
    const target = generatePattern(patternType, patternLength);

    // Display target
    targetPattern.textContent = formatPattern(target);

    // Generate 3 distractors + 1 correct option
    const options = [
        target,
        createDistractor(target, patternType),
        createDistractor(target, patternType),
        createDistractor(target, patternType)
    ];

    // Shuffle options
    correctOptionIndex = 0;
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
        if (i === correctOptionIndex) correctOptionIndex = j;
        else if (j === correctOptionIndex) correctOptionIndex = i;
    }

    // Create option cards
    options.forEach((option, index) => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.textContent = formatPattern(option);
        card.addEventListener('click', () => handleOptionClick(index));
        optionsGrid.appendChild(card);
    });

    // Start timer
    startTimer();
}

// Start timer
function startTimer() {
    let timeLeft = currentTime;
    timerBar.style.width = '100%';

    const startTimestamp = Date.now();

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTimestamp;
        timeLeft = Math.max(0, currentTime - elapsed);
        const percentage = (timeLeft / currentTime) * 100;
        timerBar.style.width = percentage + '%';

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 50);
}

// Handle option click
function handleOptionClick(index) {
    if (!gameActive) return;

    clearInterval(timerInterval);

    if (index === correctOptionIndex) {
        // Correct!
        level++;
        levelDisplay.textContent = level;

        // Increase difficulty (reduce time)
        currentTime = Math.max(MIN_TIME, currentTime - TIME_DECREASE);

        // Next level
        createRound();
    } else {
        // Wrong answer
        gameOver();
    }
}

// Game over
function gameOver() {
    gameActive = false;
    clearInterval(timerInterval);

    const achievedLevel = level - 1; // Level reached before failure

    // Save best level
    const isNewBest = saveBestLevel(achievedLevel);
    const bestLevel = loadBestLevel();

    // Update displays
    finalLevelDisplay.textContent = achievedLevel;
    modalBestLevelDisplay.textContent = bestLevel;
    bestLevelDisplay.textContent = bestLevel;

    // Show game over modal
    gameOverModal.classList.add('active');

    // Show buttons
    restartBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';

    // Update share button
    updateShareButton(achievedLevel);
}

// Update share button with WhatsApp message
function updateShareButton(level) {
    const message = `🔷 Quick Pattern Match - RexonSoftTech\n\n` +
        `Level Reached: ${level}\n` +
        `Can you beat my level?\n\n` +
        `${window.location.href}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    shareBtn.onclick = () => window.open(whatsappUrl, '_blank');
}

// Restart game
function restartGame() {
    gameActive = true;
    level = 1;
    currentTime = INITIAL_TIME;

    levelDisplay.textContent = level;

    gameOverModal.classList.remove('active');
    restartBtn.style.display = 'none';
    shareBtn.style.display = 'none';

    createRound();
}

// Event listeners
playAgainBtn.addEventListener('click', restartGame);
restartBtn.addEventListener('click', restartGame);

// Initialize game
bestLevelDisplay.textContent = loadBestLevel();
createRound();
