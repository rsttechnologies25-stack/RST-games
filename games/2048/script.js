const tileContainer = document.getElementById('tile-container');
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const resultModal = document.getElementById('result-modal');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordMsg = document.getElementById('new-record-msg');

let board = [];
let score = 0;
const SIZE = 4;
const GAME_ID = '2048_neon';

// Helper to calc position
function getTilePos(row, col) {
    // grid gap 15px. cell size approx.
    // CSS uses percent, but we need exact pixels for smooth sliding animation if we go that route.
    // However, simplest logic: Clear and redraw tiles every frame OR use specific classes like .tile-pos-1-1
    // Let's use left/top percentages.
    // width of one cell = (100% - 45px)/4. gap = 15px (which is approx X%).
    // Better: Just use CSS classes `position-row-col`?
    // Let's try direct %, simplified.
    // Gap 15px in 500px container ~ 3%.
    // Cell ~ 21.25%.
    // Easy way: just map row/col to left/top %
    const gap = 15; // px relative? No.
    // Let's assume standard logic: 
    // gap + (size + gap) * index
    // 0: 0%
    // 1: 25%? No. CSS Grid handles BG. Tiles must overlay.
    // Check CSS: 
    // width: calc((100% - 45px) / 4);
    // gap: 15px;
    // let w = (100 - (3*gap_percent))/4 ??
    return {
        top: `calc(${row} * 100% / 4 + 7px)`, // Approximate centering or grid match? 
        left: `calc(${col} * 100% / 4 + 7px)`
        // Actually this is tricky without fixed pixels.
        // Let's use simple logic: top = (gap * (row+1)) + (size * row) ?
        // CSS Grid is easiest for background, but absolute position necessary for animation.
        // Let's just re-render grid for MVP 2048 without complex slide animations first?
        // User requested "Subtle animations". Sliding is key to 2048 feel.
        // Simple method: Class based positioning.
        // .pos-0-0 { top: 0; left: 0 }
        // .pos-0-1 { top: 0; left: 25% }
    };
}

updateLeaderboard();

function initGame() {
    board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    score = 0;
    score = 0;
    scoreDisplay.textContent = 0;
    tileContainer.innerHTML = '';
    spawnTile();
    spawnTile();
    updateView();
}

function spawnTile() {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
        return { r, c, val: board[r][c] };
    }
    return null;
}

function updateView() {
    tileContainer.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] !== 0) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.classList.add(`tile-${board[r][c]}`);
                if (board[r][c] > 2048) tile.classList.add('tile-2048'); // Fallback style
                tile.textContent = board[r][c];

                // Position
                // Calculate percentage based on 15px gap + width
                // 100% width = container.
                // gap is 15px.
                // We'll use approx % logic: 
                // Col 0: 0. 
                // But we used calc in CSS: `width: calc((100% - 45px) / 4);`
                // Let's use style.left based on c * (25%) ? No, gaps.
                // c=0: 0. c=1: 25% + gap_adjustment.
                // It's easiest to just set style left/top based on:
                // `calc( ${c} * (100% - 45px) / 4 + ${c * 15}px )`
                tile.style.left = `calc(${c} * ((100% - 45px) / 4) + ${c * 15}px)`;
                tile.style.top = `calc(${r} * ((100% - 45px) / 4) + ${r * 15}px)`;

                tileContainer.appendChild(tile);
            }
        }
    }
    scoreDisplay.textContent = score;
}

// Logic: Move
function move(dir) { // 0:Left, 1:Up, 2:Right, 3:Down
    let moved = false;

    // Rotate board to simplify logic to "Shift Left"
    let rotated = board;
    for (let i = 0; i < dir; i++) {
        rotated = rotateLeft(rotated);
    }

    // Shift Left and Merge
    for (let r = 0; r < SIZE; r++) {
        const row = rotated[r];
        const newRow = row.filter(val => val !== 0);

        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                score += newRow[i];
                newRow[i + 1] = 0; // mark for deletion
            }
        }

        const filteredRow = newRow.filter(val => val !== 0);
        while (filteredRow.length < SIZE) filteredRow.push(0);

        if (filteredRow.join(',') !== row.join(',')) {
            moved = true;
        }
        rotated[r] = filteredRow;
    }

    // Rotate back
    for (let i = 0; i < (4 - dir) % 4; i++) {
        rotated = rotateLeft(rotated);
    }
    board = rotated;

    if (moved) {
        spawnTile();
        updateView();
        checkGameOver();
    }
}

function rotateLeft(grid) {
    const newGrid = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            newGrid[c][SIZE - 1 - r] = grid[r][c];
        }
    }
    return newGrid;
}

function checkGameOver() {
    // Check empty
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (board[r][c] === 0) return;

    // Check merges
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return;
            if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return;
        }
    }

    // Game Over
    endGame();
}

function endGame() {
    finalScoreDisplay.textContent = score;
    const isNew = ScoreManager.saveScore(GAME_ID, score, 'desc');
    updateLeaderboard();

    if (isNew) newRecordMsg.style.display = 'block';
    else newRecordMsg.style.display = 'none';

    resultModal.style.display = 'flex';
}

function restartGame() {
    resultModal.style.display = 'none';
    initGame();
}

// Input
document.addEventListener('keydown', (e) => {
    // 37 left, 38 up, 39 right, 40 down
    if (e.key === 'ArrowLeft') move(0);
    else if (e.key === 'ArrowUp') move(1); // Logic rotate: 1x Left = Down? Wait/
    // My rotateLeft logic:
    // Original: 
    // [1, 2]
    // [3, 4]
    // Rotate Left:
    // [2, 4]
    // [1, 3]
    // If I want to shift UP: Rotate Left 1x (Top becomes Left), Shift Left, Rotate Back 3x (Left becomes Top).
    // Correct.
    // Right: Rotate 2x. Down: Rotate 3x.
    // wait.
    // Left (0): No rotate.
    // Up (1): Rotate 1x ??
    // If board is:
    // A B
    // C D
    // UP means A and C merge.
    // Rotate Left:
    // B D
    // A C
    // Shift Left merges B D? No. A C?
    // Let's trace.
    // UP: Col 0 moves up.
    // Rotate Left puts Col 0 as Row 1 (bottom).
    // Wait. R0C0 -> C0R3 (if size 4).
    // Standard rotate counter clockwise:
    // (r, c) -> (SIZE-1-c, r)
    // 
    // Easier: Just map keys to rotation count.

    // Left: 0 rotations.
    // Down: 1 rotation (Left become Bottom? No. Left becomes Top? No).
    // Let's stick to standard 2048 transform:
    // To move UP, we want Top to be Left.
    // Rotate Counter Clockwise 90deg (1x). Top row becomes Left col?
    // No. Top Row becomes Left Col is Clockwise.
    // Let's debug rotation logic:
    // newGrid[c][SIZE - 1 - r] = grid[r][c];
    // r0, c0 -> 0, 3 (Bottom left) -- This is -90deg (Counter Clockwise).
    // So Top Row became Right Col.
    // We want Top to be Left to use "Shift Left" logic.
    // That means we need +90deg (Clockwise) or -270deg.
    // My RotateLeft is -90deg.
    // So 1x = -90. 3x = -270 = +90.
    // To move UP (Top), we need Top at Left. That means +90. So 3 rotations.
    // To move RIGHT, we need Right at Left. 180. 2 rotations.
    // To move DOWN, we need Bottom at Left. -90 (1 rotation).

    else if (e.key === 'ArrowUp') move(3);
    else if (e.key === 'ArrowRight') move(2);
    else if (e.key === 'ArrowDown') move(1);
});

// Touch
let touchStart = {};
document.addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault(); // prevent scroll
}, { passive: false });

document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 2 : 0);
    } else {
        if (Math.abs(dy) > 30) move(dy > 0 ? 1 : 3); // Down is dy>0? Yes.
        // My Move map: 0:Left, 1:Down (rot 1), 2:Right, 3:Up (rot 3).
        // Standard:
        // Left: dx < 0 -> 0.
        // Right: dx > 0 -> 2.
        // Up: dy < 0 -> 3.
        // Down: dy > 0 -> 1.
    }
});

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

restartBtn.addEventListener('click', restartGame);
document.getElementById('share-btn').addEventListener('click', () => {
    const text = `I scored ${score} in 2048 Neon on RexonSoftTech! Play now: https://rst-games.rexonsofttech.in/games/2048/`;
    ShareManager.shareToWhatsApp(text);
});

initGame();
