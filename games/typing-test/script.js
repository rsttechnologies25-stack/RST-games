const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const resultModal = document.getElementById('result-modal');
const finalErrors = document.getElementById('final-errors');
const levelSelect = document.getElementById('level-select');
const durationSelect = document.getElementById('duration-select');
const restartBtn = document.getElementById('restart-btn');
const newRecordMsg = document.getElementById('new-record-msg');

// Game State
let duration = 30;
let timeLeft = 30;
let timeElapsed = 0;
let timerInterval;
let isPlaying = false;
let charIndex = 0;
let errors = 0;
let correctChars = 0;

// Quotes Pool (No API, static content for reliability)
const paragraphs = {
    easy: [
        "The cat sat on the mat.",
        "Sun shines bright today.",
        "Red apples are sweet.",
        "Dogs love to play ball.",
        "Birds fly in the sky."
    ],
    medium: [
        "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. Believe you can and you're halfway there.",
        "In the middle of difficulty lies opportunity. Do what you can, with what you have, where you are.",
        "Code is like humor. When you have to explain it, it's bad. Simplicity is the soul of efficiency.",
        "Technology is best when it brings people together. It always seems impossible until it is done."
    ],
    hard: [
        "Complexity is the enemy of execution; simplicity, on the other hand, is the prerequisite for reliability.",
        "The measure of intelligence is the ability to change. Imagination is more important than knowledge.",
        "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
        "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
        "The biological nature of mankind has not changed for thousands of years, but the technological landscape has transformed beyond recognition."
    ]
};

function loadParagraph() {
    const level = levelSelect.value;
    const pool = paragraphs[level];
    const randomIndex = Math.floor(Math.random() * pool.length);
    const text = pool[randomIndex];
    textDisplay.innerHTML = "";
    text.split("").forEach(char => {
        let span = document.createElement("span");
        span.innerText = char;
        textDisplay.appendChild(span);
    });
    if (textDisplay.firstChild) {
        textDisplay.firstChild.classList.add("current");
    }
    charIndex = 0;
}

function startGame() {
    isPlaying = true;
    levelSelect.disabled = true;
    durationSelect.disabled = true;

    timerInterval = setInterval(() => {
        if (duration === 0) { // No Time mode
            timeElapsed++;
            timerDisplay.textContent = timeElapsed;
            updateStats();
        } else {
            if (timeLeft > 0) {
                timeLeft--;
                timeElapsed++;
                timerDisplay.textContent = timeLeft;
                updateStats();
            } else {
                endGame();
            }
        }
    }, 1000);
}

function updateStats() {
    // WPM = (Characters / 5) / TimeMinutes
    // But standard WPM is usually (Correct Chars / 5) / TimeMinutes
    // To show real-time WPM, we check elapsed time. avoid divide by zero.
    let wpm = 0;
    if (timeElapsed > 0) {
        wpm = Math.round(((correctChars / 5) / timeElapsed) * 60);
    }
    wpmDisplay.textContent = wpm;

    let accuracy = 0;
    if (charIndex > 0) {
        accuracy = Math.round(((charIndex - errors) / charIndex) * 100);
    }
    accuracyDisplay.textContent = accuracy;
}

function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;
    inputField.disabled = true;

    // Final Stats
    const finalWpm = parseInt(wpmDisplay.textContent);
    const finalAcc = parseInt(accuracyDisplay.textContent);

    document.getElementById('final-wpm').innerText = finalWpm;
    document.getElementById('final-accuracy').innerText = finalAcc + '%';
    document.getElementById('final-cpm').innerText = charIndex;
    document.getElementById('final-errors').innerText = errors;

    // Check High Score
    const GAME_ID = 'typing_test';
    const isNewRecord = ScoreManager.saveScore(GAME_ID, finalWpm, 'desc');
    updateLeaderboard();

    if (isNewRecord) {
        newRecordMsg.style.display = 'block';
    } else {
        newRecordMsg.style.display = 'none';
    }

    resultModal.style.display = 'flex';
}

function updateLeaderboard() {
    const scores = ScoreManager.getScores('typing_test');
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    tbody.innerHTML = scores.map((s, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>${s.score} WPM</td>
            <td>${s.date}</td>
        </tr>
    `).join('');
}

document.getElementById('share-btn').addEventListener('click', () => {
    const wpm = document.getElementById('final-wpm').innerText;
    const acc = document.getElementById('final-accuracy').innerText;
    const text = `I typed at ${wpm} WPM with ${acc} accuracy on RexonSoftTech! Test your speed here: https://rst-games.rexonsofttech.in/games/typing-test/`;
    ShareManager.shareToWhatsApp(text);
});

function resetGame() {
    clearInterval(timerInterval);
    loadParagraph();
    duration = parseInt(durationSelect.value);
    timeLeft = duration;
    timeElapsed = 0;
    charIndex = 0;
    errors = 0;
    correctChars = 0;
    isPlaying = false;
    inputField.value = "";
    inputField.disabled = false;
    levelSelect.disabled = false;
    durationSelect.disabled = false;
    timerDisplay.textContent = duration === 0 ? 0 : timeLeft;
    wpmDisplay.textContent = 0;
    accuracyDisplay.textContent = 100;
    resultModal.style.display = 'none';
    inputField.focus();
    updateLeaderboard();
}

function initInputListeners() {
    inputField.addEventListener("input", (e) => {
        if (!isPlaying && timeLeft > 0) {
            startGame();
        }

        const chars = textDisplay.querySelectorAll("span");
        const typedChar = e.data; // Note: This might be null for non-text input, but we handle logic via current index

        // Handling backspace or paste is complex with simple "input", so we'll use value length but for simplicity with visual cues:
        // Let's implement character-by-character validation from the input value compared to target text.
        // Actually, simpler method: Listen to input value.
        const typedValue = inputField.value;
        const currentParamsCharIndex = typedValue.length - 1; // Index of just typed char

        // If backspace was pressed (value length < previous tracked index), we need to revert classes.
        // But tracking backspace in "input" event is tricky.
        // Better approach: Re-evaluate all characters based on current input value.

        charIndex = typedValue.length;

        const quoteChars = textDisplay.querySelectorAll('span');

        // Reset counts for re-calculation
        errors = 0;
        correctChars = 0;

        quoteChars.forEach((charSpan, index) => {
            const char = typedValue[index];

            if (char == null) {
                charSpan.classList.remove('correct');
                charSpan.classList.remove('incorrect');
                charSpan.classList.remove('current');
                if (index === typedValue.length) { // Next character waiting
                    charSpan.classList.add('current');
                }
            } else if (char === charSpan.innerText) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
                charSpan.classList.remove('current');
                correctChars++;
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
                charSpan.classList.remove('current');
                errors++;
            }
        });

        // Auto-end if finished quote
        if (typedValue.length === quoteChars.length) {
            endGame();
        }
    });

    // Capture focus
    document.addEventListener('keydown', () => inputField.focus());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            resetGame();
        }
    });
}

// Initial Load
levelSelect.addEventListener('change', resetGame);
durationSelect.addEventListener('change', resetGame);
loadParagraph();
initInputListeners();
updateLeaderboard();
restartBtn.addEventListener('click', resetGame);
