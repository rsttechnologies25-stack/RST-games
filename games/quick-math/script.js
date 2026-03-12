const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game-area');
const startBtn = document.getElementById('start-btn');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const problemDisplay = document.getElementById('problem-display');
const optionsContainer = document.getElementById('options-container');
const resultModal = document.getElementById('result-modal');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordMsg = document.getElementById('new-record-msg');

let score = 0;
let timeLeft = 30;
let timerInterval;
let correctAnswer = 0;
const GAME_ID = 'quick_math';

updateLeaderboard();

startBtn.addEventListener('click', startGame);

function startGame() {
    startScreen.style.display = 'none';
    gameArea.style.display = 'block';
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    generateProblem();
}

function generateProblem() {
    // Generate operators: +, -, *
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * 3)];

    let a, b;
    if (op === '+') {
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        correctAnswer = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * a); // Ensure positive result
        correctAnswer = a - b;
    } else {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        correctAnswer = a * b;
    }

    problemDisplay.textContent = `${a} ${op} ${b} = ?`;
    generateOptions(correctAnswer);
}

function generateOptions(answer) {
    const options = [answer];
    while (options.length < 4) {
        let offset = Math.floor(Math.random() * 10) - 5; // -5 to +5
        if (offset === 0) offset = 1;
        let fake = answer + offset;
        if (!options.includes(fake) && fake >= 0) {
            options.push(fake);
        }
    }

    // Shuffle
    options.sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = opt;
        btn.addEventListener('click', () => checkAnswer(opt, btn));
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selected, btn) {
    if (selected === correctAnswer) {
        score++;
        scoreDisplay.textContent = score;
        btn.classList.add('correct');
        // Very quick delay to show green before switching
        setTimeout(generateProblem, 200);
    } else {
        btn.classList.add('wrong');
        // Penalty or Just continue? Let's just continue but maybe delay slightly?
        // Or -1 score? Let's do no penalty but lost time from animation/thinking.
        // Actually, let's penalize score for guessing?
        // Simple version: No penalty, just lost time.
        setTimeout(generateProblem, 200);
    }
}

function endGame() {
    clearInterval(timerInterval);
    const isNewRecord = ScoreManager.saveScore(GAME_ID, score, 'desc');
    updateLeaderboard();

    finalScoreDisplay.textContent = score;
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
    const text = `I scored ${score} in Quick Math Duel on RexonSoftTech! Test your brain speed: https://rst-games.rexonsofttech.in/games/quick-math/`;
    ShareManager.shareToWhatsApp(text);
});
