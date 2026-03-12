const clickArea = document.getElementById('click-area');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const statusText = document.getElementById('status-text');
const resultModal = document.getElementById('result-modal');
const finalScoreDisplay = document.getElementById('final-score');
const finalCpsDisplay = document.getElementById('final-cps');
const restartBtn = document.getElementById('restart-btn');
const newRecordMsg = document.getElementById('new-record-msg');

let score = 0;
let timeLeft = 10.00;
let isPlaying = false;
let timerInterval;

// Load high score
const GAME_ID = 'speed_click';
bestScoreDisplay.textContent = ScoreManager.getBestScore(GAME_ID);

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    timeLeft = 10.00;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft.toFixed(2);
    statusText.textContent = "CLICK!";
    clickArea.style.borderColor = 'var(--secondary-color)';

    // Start Timer
    timerInterval = setInterval(() => {
        timeLeft -= 0.01;
        timerDisplay.textContent = timeLeft.toFixed(2);

        if (timeLeft <= 0) {
            endGame();
        }
    }, 10);
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = "0.00";
    statusText.textContent = "Time's Up!";
    clickArea.style.borderColor = 'var(--primary-color)';

    // Check High Score
    const isNewRecord = ScoreManager.saveScore(GAME_ID, score, 'desc');
    bestScoreDisplay.textContent = ScoreManager.getBestScore(GAME_ID);
    updateLeaderboard();

    // Show Modal
    finalScoreDisplay.textContent = score;
    finalCpsDisplay.textContent = (score / 10).toFixed(1);

    if (isNewRecord) {
        newRecordMsg.style.display = 'block';
    } else {
        newRecordMsg.style.display = 'none';
    }

    setTimeout(() => {
        resultModal.style.display = 'flex';
    }, 500);
}

function updateLeaderboard() {
    const scores = ScoreManager.getScores(GAME_ID);
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = scores.map((s, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>${s.score}</td>
            <td>${s.date}</td>
        </tr>
    `).join('');
}

// Initial Load
updateLeaderboard();

function createRipple(e) {
    const rect = clickArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.classList.add('click-ripple');
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    clickArea.appendChild(ripple);

    setTimeout(() => ripple.remove(), 500);
}

clickArea.addEventListener('mousedown', (e) => {
    if (!isPlaying && timeLeft === 10.00) {
        startGame();
    }

    if (isPlaying) {
        score++;
        scoreDisplay.textContent = score;
        createRipple(e);

        // Tilt Effect
        const rect = clickArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const centerX = rect.width / 2;
        const tiltX = (x - centerX) / centerX * 2; // -2 to 2
        clickArea.style.transform = `perspective(500px) rotateY(${tiltX}deg) scale(0.99)`;
        setTimeout(() => clickArea.style.transform = 'perspective(500px) rotateY(0deg) scale(1)', 50);
    }
});

restartBtn.addEventListener('click', () => {
    resultModal.style.display = 'none';
    timeLeft = 10.00;
    score = 0;
    timerDisplay.textContent = "10.00";
    scoreDisplay.textContent = "0";
    statusText.textContent = "Click to Start";
});

document.getElementById('share-btn').addEventListener('click', () => {
    const cps = (score / 10).toFixed(1);
    const text = `I scored ${score} clicks (${cps} CPS) in the Speed Click Challenge at RexonSoftTech! Can you beat me? Play now: https://rst-games.rexonsofttech.in/games/speed-click/`;
    ShareManager.shareToWhatsApp(text);
});
