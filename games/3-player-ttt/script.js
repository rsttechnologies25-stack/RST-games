document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('ttt-board');
    const playerCards = [
        document.getElementById('player1-card'),
        document.getElementById('player2-card'),
        document.getElementById('player3-card')
    ];
    const statusMsg = document.getElementById('status-msg');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const gameOverModal = document.getElementById('gameOverModal');
    const winnerText = document.getElementById('winner-text');
    const gameSummary = document.getElementById('game-summary');

    const GRID_SIZE = 6;
    const WIN_LENGTH = 4;
    const MARKERS = ['X', 'O', '▢'];
    
    let board = Array(GRID_SIZE * GRID_SIZE).fill(null);
    let currentPlayer = 0; // 0, 1, or 2
    let gameActive = true;

    function initGame() {
        createBoard();
        updateHUD();
        
        restartBtn.addEventListener('click', resetGame);
        playAgainBtn.addEventListener('click', () => {
            gameOverModal.classList.remove('active');
            resetGame();
        });
    }

    function createBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const square = document.createElement('div');
            square.classList.add('ttt-square');
            square.dataset.index = i;
            square.addEventListener('click', () => handleSquareClick(i));
            boardElement.appendChild(square);
        }
    }

    function handleSquareClick(index) {
        if (!gameActive || board[index]) return;

        board[index] = MARKERS[currentPlayer];
        const square = boardElement.children[index];
        square.innerText = MARKERS[currentPlayer];
        square.dataset.marker = MARKERS[currentPlayer];
        square.classList.add('filled');

        if (checkWin(index)) {
            endGame(false);
        } else if (board.every(cell => cell !== null)) {
            endGame(true);
        } else {
            currentPlayer = (currentPlayer + 1) % 3;
            updateHUD();
        }
    }

    function updateHUD() {
        playerCards.forEach((card, idx) => {
            card.classList.toggle('active', idx === currentPlayer);
        });
        statusMsg.innerText = `Player ${currentPlayer + 1}'s Turn (${MARKERS[currentPlayer]})`;
    }

    function checkWin(index) {
        const r = Math.floor(index / GRID_SIZE);
        const c = index % GRID_SIZE;
        const marker = board[index];

        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal \
            [1, -1]  // Diagonal /
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            let winningSquares = [index];

            // Check in forward direction
            for (let i = 1; i < WIN_LENGTH; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                const ni = nr * GRID_SIZE + nc;
                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[ni] === marker) {
                    count++;
                    winningSquares.push(ni);
                } else break;
            }

            // Check in backward direction
            for (let i = 1; i < WIN_LENGTH; i++) {
                const nr = r - dr * i;
                const nc = c - dc * i;
                const ni = nr * GRID_SIZE + nc;
                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[ni] === marker) {
                    count++;
                    winningSquares.push(ni);
                } else break;
            }

            if (count >= WIN_LENGTH) {
                highlightWinners(winningSquares);
                return true;
            }
        }
        return false;
    }

    function highlightWinners(squares) {
        squares.forEach(idx => {
            boardElement.children[idx].classList.add('winner');
        });
    }

    function endGame(isDraw) {
        gameActive = false;
        if (isDraw) {
            winnerText.innerText = "It's a Draw!";
            gameSummary.innerText = "The board is full. No winner this time.";
        } else {
            winnerText.innerText = `Player ${currentPlayer + 1} Wins!`;
            gameSummary.innerText = `Player ${MARKERS[currentPlayer]} connected ${WIN_LENGTH} in a row.`;
            // Trigger score manager if we have logic for it
            if (typeof ScoreManager !== 'undefined') {
                ScoreManager.saveScore('3player-ttt', 1);
            }
        }
        gameOverModal.classList.add('active');
    }

    function resetGame() {
        board = Array(GRID_SIZE * GRID_SIZE).fill(null);
        currentPlayer = 0;
        gameActive = true;
        createBoard();
        updateHUD();
    }

    initGame();
});
