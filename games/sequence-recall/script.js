const buttons = {
    green: document.getElementById('btn-green'),
    red: document.getElementById('btn-red'),
    yellow: document.getElementById('btn-yellow'),
    blue: document.getElementById('btn-blue')
};
const colors = ['green', 'red', 'yellow', 'blue'];
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status');
const levelIndicator = document.getElementById('level-indicator');
const resultModal = document.getElementById('result-modal');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordMsg = document.getElementById('new-record-msg');

let gameSequence = [];
let userSequence = [];
let level = 0;
let isGameActive = false;
let isPlayerTurn = false;
const GAME_ID = 'sequence_recall';

updateLeaderboard();

startBtn.addEventListener('click', () => {
    startGame();
});

function startGame() {
    startBtn.style.display = 'none';
    gameSequence = [];
    userSequence = [];
    level = 0;
    isGameActive = true;
    nextLevel();
}

function nextLevel() {
    userSequence = [];
    level++;
    levelIndicator.textContent = level;
    statusText.textContent = "Watch the sequence...";

    // Add random color
    const randomColor = colors[Math.floor(Math.random() * 4)];
    gameSequence.push(randomColor);

    // Play sequence
    playSequence();
}

function playSequence() {
    isPlayerTurn = false;
    let i = 0;
    const interval = setInterval(() => {
        if (i >= gameSequence.length) {
            clearInterval(interval);
            isPlayerTurn = true;
            statusText.textContent = "Your turn!";
            return;
        }
        activateButton(gameSequence[i]);
        i++;
    }, 800);
}

function activateButton(color) {
    const btn = buttons[color];
    btn.classList.add('active');
    // Optional: Add sound here later
    setTimeout(() => {
        btn.classList.remove('active');
    }, 400);
}

// User Interaction
Object.keys(buttons).forEach(key => {
    buttons[key].addEventListener('click', () => {
        if (!isGameActive || !isPlayerTurn) return;

        handleUserClick(key);
        activateButton(key); // Visual feedback
    });
});

function handleUserClick(color) {
    userSequence.push(color);

    // Check if correct so far
    const currentIndex = userSequence.length - 1;
    if (userSequence[currentIndex] !== gameSequence[currentIndex]) {
        gameOver();
        return;
    }

    // Check if level complete
    if (userSequence.length === gameSequence.length) {
        isPlayerTurn = false;
        statusText.textContent = "Success! Next level...";
        setTimeout(nextLevel, 1000);
    }
}

function gameOver() {
    isGameActive = false;
    // Score is basically level - 1 (completed levels), or just level if we count steps
    const score = level - 1;
    finalScoreDisplay.textContent = score;

    const isNewRecord = ScoreManager.saveScore(GAME_ID, score, 'desc');
    updateLeaderboard();

    if (isNewRecord) {
        newRecordMsg.style.display = 'block';
    } else {
        newRecordMsg.style.display = 'none';
    }

    resultModal.style.display = 'flex';
}

function restartGame() {
    resultModal.style.display = 'none';
    startGame();
}

function updateLeaderboard() {
    const scores = ScoreManager.getScores(GAME_ID);
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    tbody.innerHTML = scores.map((s, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>${s.score}</td>
            <td>${s.date}</td>
        </tr>
    `).join('');
}

document.getElementById('share-btn').addEventListener('click', () => {
    const score = finalScoreDisplay.textContent;
    const text = `I recalled a sequence of ${score} steps in Sequence Recall on RexonSoftTech! Test your memory: https://rst-games.rexonsofttech.in/games/sequence-recall/`;
    ShareManager.shareToWhatsApp(text);
});
