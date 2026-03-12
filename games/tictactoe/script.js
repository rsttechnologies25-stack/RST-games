const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const restartBtn = document.getElementById('restart-btn');
const modeBtns = document.querySelectorAll('[data-mode]');
const scoreXDisplay = document.getElementById('score-x');
const scoreODisplay = document.getElementById('score-o');
const scoreTieDisplay = document.getElementById('score-tie');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = 'ai'; // 'ai' or 'pvp'
let difficulty = 'medium'; // 'easy', 'medium', 'hard'
let scores = { X: 0, O: 0, Tie: 0 };

const winningConditions = [
    // Horizontal rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Vertical columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
    // Diagonals removed as requested
];

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    // Prevent human input during AI's turn
    if (gameMode === 'ai' && currentPlayer === 'O') {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    // Trigger AI move after player change
    if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500); // Small delay for realism
    }
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = gameMode === 'ai' && currentPlayer === 'O'
        ? "Computer's Turn"
        : `Player ${currentPlayer}'s Turn`;
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = currentPlayer === 'O' && gameMode === 'ai'
            ? "Computer Wins!"
            : `Player ${currentPlayer} Wins!`;
        gameActive = false;
        scores[currentPlayer]++;
        updateScores();
        
        // Save to global leaderboard (Total wins for X)
        if (currentPlayer === 'X') {
            ScoreManager.saveScore('tic_tac_toe', scores.X);
        }
        
        showShareButton();
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusText.textContent = "Draw!";
        gameActive = false;
        scores.Tie++;
        updateScores();
        showShareButton();
        return;
    }

    handlePlayerChange();
}

function updateScores() {
    scoreXDisplay.textContent = scores.X;
    scoreODisplay.textContent = scores.O;
    scoreTieDisplay.textContent = scores.Tie;
}

function showShareButton() {
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.style.display = 'inline-flex';
}

document.getElementById('share-btn').addEventListener('click', () => {
    let result = "played Tic Tac Toe";
    if (statusText.textContent.includes('Wins')) {
        result = `won a game of Tic Tac Toe`;
    } else if (statusText.textContent.includes('Draw')) {
        result = `tied a game of Tic Tac Toe`;
    }
    const text = `I just ${result} at RexonSoftTech! Play now: https://rst-games.rexonsofttech.in/games/tictactoe/`;
    ShareManager.shareToWhatsApp(text);
});

function makeAIMove() {
    let cellIndex;

    try {
        if (difficulty === 'easy') {
            // Easy: Random move
            cellIndex = makeRandomMove();
        } else if (difficulty === 'medium') {
            // Medium: Try to win, block, or random
            cellIndex = makeStrategicMove();
        } else {
            // Hard: Minimax for perfect play
            cellIndex = makePerfectMove();
        }

        if (cellIndex === null || cellIndex === undefined) {
            console.error('AI could not find a valid move');
            return;
        }

        const cell = document.querySelector(`.cell[data-index='${cellIndex}']`);
        if (!cell) {
            console.error('Cell not found for index:', cellIndex);
            return;
        }

        handleCellPlayed(cell, cellIndex);
        handleResultValidation();
    } catch (error) {
        console.error('Error in makeAIMove:', error);
        // Fallback to random move
        cellIndex = makeRandomMove();
        if (cellIndex !== null) {
            const cell = document.querySelector(`.cell[data-index='${cellIndex}']`);
            if (cell) {
                handleCellPlayed(cell, cellIndex);
                handleResultValidation();
            }
        }
    }
}

function makeRandomMove() {
    const available = gameState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    if (available.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}

function makeStrategicMove() {
    // 1. Try to win
    const winMove = findWinningMove('O');
    if (winMove !== null) return winMove;

    // 2. Block player from winning
    const blockMove = findWinningMove('X');
    if (blockMove !== null) return blockMove;

    // 3. Take center if available
    if (gameState[4] === "") return 4;

    // 4. Random move
    return makeRandomMove();
}

function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const positions = [gameState[a], gameState[b], gameState[c]];

        // Count player marks and empty spots
        const playerCount = positions.filter(p => p === player).length;
        const emptyCount = positions.filter(p => p === "").length;

        if (playerCount === 2 && emptyCount === 1) {
            // Find the empty spot
            if (gameState[a] === "") return a;
            if (gameState[b] === "") return b;
            if (gameState[c] === "") return c;
        }
    }
    return null;
}

function makePerfectMove() {
    // Minimax algorithm for perfect play
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (gameState[i] === "") {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = "";

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (!board.includes("")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(board) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function restartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.textContent = "Player X's Turn";
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('x');
        cell.classList.remove('o');
    });
}

// Mode Selector
const difficultySelector = document.getElementById('difficulty-selector');
const difficultyBtns = document.querySelectorAll('[data-difficulty]');

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;

        // Show/hide difficulty selector based on mode
        if (gameMode === 'ai') {
            difficultySelector.style.display = 'flex';
        } else {
            difficultySelector.style.display = 'none';
        }

        restartGame();
    });
});

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
        restartGame();
    });
});

// Initialize UI
if (gameMode === 'ai') {
    difficultySelector.style.display = 'flex';
} else {
    difficultySelector.style.display = 'none';
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
