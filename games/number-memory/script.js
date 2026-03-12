const displayArea = document.getElementById('number-display');
const displayText = document.getElementById('display-text');
const inputArea = document.getElementById('input-area');
const answerInput = document.getElementById('answer-input');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const levelDisplay = document.getElementById('level');
const timerBar = document.getElementById('timer-bar');
const resultModal = document.getElementById('result-modal');
const finalLevelDisplay = document.getElementById('final-level');
const correctNumDisplay = document.getElementById('correct-number');
const userAnsDisplay = document.getElementById('user-answer');
const newRecordMsg = document.getElementById('new-record-msg');

let level = 1;
let currentNumber = '';
let displayTime = 2000; // ms to show number
let GAME_ID = 'number_memory';

updateLeaderboard();

startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    startGame();
});

function startGame() {
    generateNumber();
    showNumber();
}

function generateNumber() {
    currentNumber = '';
    for (let i = 0; i < level; i++) {
        currentNumber += Math.floor(Math.random() * 10);
    }
}

function showNumber() {
    inputArea.style.display = 'none';
    displayText.style.display = 'block';
    displayText.textContent = currentNumber;

    // Timer Animation
    timerBar.style.width = '100%';
    timerBar.style.transition = `width ${displayTime / 1000}s linear`;

    // Force reflow
    timerBar.offsetHeight;

    setTimeout(() => {
        timerBar.style.width = '0%';
    }, 10);

    setTimeout(() => {
        displayText.style.display = 'none';
        inputArea.style.display = 'block';
        answerInput.value = '';
        answerInput.focus();
    }, displayTime);
}

submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

function checkAnswer() {
    const userAnswer = answerInput.value;

    if (userAnswer === currentNumber) {
        level++;
        levelDisplay.textContent = level;
        // Increase difficulty: time slightly increases but digits increase (harder)
        // Or keep time same per digit? Let's make it fixed + small increment
        displayTime = 1500 + (level * 500); // 1: 2s, 2: 2.5s, 3: 3s...
        if (displayTime > 5000) displayTime = 5000; // Cap at 5s? No, longer numbers need more time to read.
        displayTime = 1000 + (level * 600); // Tweak

        startGame();
    } else {
        endGame(userAnswer);
    }
}

function endGame(userAnswer) {
    const isNewRecord = ScoreManager.saveScore(GAME_ID, level, 'desc');
    updateLeaderboard();

    finalLevelDisplay.textContent = level;
    correctNumDisplay.textContent = currentNumber;
    userAnsDisplay.textContent = userAnswer || "(Empty)";

    if (isNewRecord) {
        newRecordMsg.style.display = 'block';
    } else {
        newRecordMsg.style.display = 'none';
    }

    resultModal.style.display = 'flex';
}

function restartGame() {
    level = 1;
    levelDisplay.textContent = level;
    displayTime = 2000;
    resultModal.style.display = 'none';
    startBtn.style.display = 'none';
    startGame();
}

function updateLeaderboard() {
    const scores = ScoreManager.getScores(GAME_ID);
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    tbody.innerHTML = scores.map((s, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>Lvl ${s.score}</td>
            <td>${s.date}</td>
        </tr>
    `).join('');
}

document.getElementById('share-btn').addEventListener('click', () => {
    const text = `I reached Level ${level} in Number Memory on RexonSoftTech! Can you beat my brain? Play now: https://rst-games.rexonsofttech.in/games/number-memory/`;
    ShareManager.shareToWhatsApp(text);
});
