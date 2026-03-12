const reactionArea = document.getElementById('reaction-area');
const mainText = document.getElementById('main-text');
const subText = document.getElementById('sub-text');
const iconDisplay = document.getElementById('icon-display');
const scoreHistory = document.getElementById('score-history');
const bestScoreDisplay = document.getElementById('best-score');

let startTime;
let timeoutId;
let gameState = 'idle'; // idle, waiting, ready, result
let scores = [];

// Load Best Score (Lower is better for reaction time, but ScoreManager assumes higher is better usually.
// We need to implement a "Low Score is Best" logic or just store normally and handle display manually.
// For simplicity in main.js, let's treat "high score" as just "best score".
// NOTE: main.js assumes `score > currentHigh`. We might need to override or just manage locally for this game if we want "lowest ms".
// Let's manage locally for this specific game to avoid changing global utility yet.
const GAME_ID = 'reaction_time';
let bestScore = ScoreManager.getBestScore(GAME_ID);
// Handle text display if no score
if (bestScore === '-' || bestScore === 0) bestScore = 9999;

// Initial render
updateLeaderboard();

function setState(state) {
    gameState = state;
    reactionArea.className = ''; // Reset classes

    if (state === 'waiting') {
        reactionArea.classList.add('waiting');
        mainText.textContent = "Wait for Green...";
        subText.textContent = "Don't click yet.";
        iconDisplay.textContent = "✋";
    } else if (state === 'ready') {
        reactionArea.classList.add('ready');
        mainText.textContent = "CLICK!";
        subText.textContent = "";
        iconDisplay.textContent = "⚡";
    } else if (state === 'too-soon') {
        reactionArea.classList.add('too-soon');
        mainText.textContent = "Too Soon!";
        subText.textContent = "Click to try again.";
        iconDisplay.textContent = "⚠️";
    } else if (state === 'result') {
        // Handled in click logic
    } else {
        // Idle
        mainText.textContent = "Click to Start";
        subText.textContent = "Wait for green...";
        iconDisplay.textContent = "⚡";
    }
}

reactionArea.addEventListener('mousedown', () => {
    if (gameState === 'idle' || gameState === 'result' || gameState === 'too-soon') {
        startGame();
    } else if (gameState === 'waiting') {
        tooSoon();
    } else if (gameState === 'ready') {
        endGame();
    }
});

function startGame() {
    setState('waiting');
    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds

    timeoutId = setTimeout(() => {
        setState('ready');
        startTime = Date.now();
    }, randomDelay);
}

function tooSoon() {
    clearTimeout(timeoutId);
    setState('too-soon');
}

function endGame() {
    const timeTaken = Date.now() - startTime;
    reactionArea.className = ''; // Reset
    gameState = 'result';

    mainText.textContent = `${timeTaken} ms`;
    subText.textContent = "Click to keep going";
    iconDisplay.textContent = "⏱️";

    // Save Score (Lower is better = 'asc')
    const isNewBest = ScoreManager.saveScore(GAME_ID, timeTaken, 'asc');
    updateLeaderboard();

    if (isNewBest) {
        subText.textContent = "New Best Score! Click to play again";
    }

    document.getElementById('share-btn').style.display = 'inline-flex';
}

function updateLeaderboard() {
    const scores = ScoreManager.getScores(GAME_ID);
    const tbody = document.getElementById('leaderboard-body');
    if (tbody) {
        tbody.innerHTML = scores.map((s, i) => `
            <tr>
                <td>#${i + 1}</td>
                <td>${s.score} ms</td>
                <td>${s.date}</td>
            </tr>
        `).join('');
    }
}

document.getElementById('share-btn').addEventListener('click', () => {
    const scores = ScoreManager.getScores(GAME_ID);
    const best = scores.length > 0 ? scores[0].score : 'N/A';
    const text = `My reaction time is ${best}ms at RexonSoftTech! Can you beat it? Play now: https://rst-games.rexonsofttech.in/games/reaction/`;
    ShareManager.shareToWhatsApp(text);
});
