const emojis = ['🎮', '🎲', '🎯', '👾', '🚀', '💎', '🔥', '⚡'];
const grid = document.getElementById('memory-grid');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const bestMovesDisplay = document.getElementById('best-moves');
const resultModal = document.getElementById('result-modal');
const finalMovesDisplay = document.getElementById('final-moves');
const newRecordMsg = document.getElementById('new-record-msg');

let cards = [...emojis, ...emojis]; // duplicate pairs
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let lockBoard = false;

// Load Best Score (Low moves is better)
const GAME_ID = 'memory_game';
let bestMoves = ScoreManager.getBestScore(GAME_ID);
if (bestMoves !== 0 && bestMoves !== '0' && bestMoves !== '-') {
    bestMovesDisplay.textContent = bestMoves;
} else {
    bestMovesDisplay.textContent = '-';
}

updateLeaderboard();

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initGame() {
    shuffle(cards);
    grid.innerHTML = '';
    cards.forEach((emoji) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = emoji;

        card.innerHTML = `
            <div class="card-face card-front"></div>
            <div class="card-face card-back">${emoji}</div>
        `;

        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    let isMatch = flippedCards[0].dataset.value === flippedCards[1].dataset.value;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards[0].classList.add('matched');
    flippedCards[1].classList.add('matched');
    matchedPairs++;
    pairsDisplay.textContent = `${matchedPairs}/8`;
    flippedCards = [];

    if (matchedPairs === 8) {
        endGame();
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        flippedCards[0].classList.remove('flipped');
        flippedCards[1].classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
    }, 1000);
}

function endGame() {
    setTimeout(() => {
        finalMovesDisplay.textContent = moves;

        // Save Score (Lower is better = 'asc')
        const isNewRecord = ScoreManager.saveScore(GAME_ID, moves, 'asc');
        updateLeaderboard();

        if (isNewRecord) {
            newRecordMsg.style.display = 'block';
        } else {
            newRecordMsg.style.display = 'none';
        }

        resultModal.style.display = 'flex';
    }, 500);
}

function updateLeaderboard() {
    const scores = ScoreManager.getScores(GAME_ID);
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    tbody.innerHTML = scores.map((s, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>${s.score} Moves</td>
            <td>${s.date}</td>
        </tr>
    `).join('');
}

document.getElementById('share-btn').addEventListener('click', () => {
    const text = `I completed the Memory Game in ${moves} moves on RexonSoftTech! Can you do better? Play now: https://rst-games.rexonsofttech.in/games/memory/`;
    ShareManager.shareToWhatsApp(text);
});

initGame();
