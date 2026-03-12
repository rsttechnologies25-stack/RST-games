const gridContainer = document.getElementById('grid-container');
const shapeContainers = [
    document.getElementById('shape-1'),
    document.getElementById('shape-2'),
    document.getElementById('shape-3')
];
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const resultModal = document.getElementById('result-modal');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordMsg = document.getElementById('new-record-msg');

const GRID_SIZE = 8;
let grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)); // 0: empty, 1-N: color index
let score = 0;
const GAME_ID = 'block_puzzle';

// Shape Definitions (Binary Matrix)
const SHAPES = [
    { map: [[1]], color: 1 }, // Single
    { map: [[1, 1]], color: 2 }, // 2-Line H
    { map: [[1], [1]], color: 2 }, // 2-Line V
    { map: [[1, 1, 1]], color: 3 }, // 3-Line H
    { map: [[1], [1], [1]], color: 3 }, // 3-Line V
    { map: [[1, 1], [1, 1]], color: 4 }, // 2x2 Square
    { map: [[1, 1, 1], [0, 1, 0]], color: 5 }, // T-Shape (Up)
    { map: [[1, 0], [1, 1], [1, 0]], color: 5 }, // T-Shape (Left)
    { map: [[1, 1], [1, 0]], color: 6 }, // L-Mini
    { map: [[1, 0, 0], [1, 1, 1]], color: 6 }, // L-Big
    { map: [[1, 1, 1, 1]], color: 1 }, // 4-Line H
    { map: [[1], [1], [1], [1]], color: 1 }, // 4-Line V,
    { map: [[1, 1, 1], [1, 0, 0]], color: 5 }, // L-Big Inv
    { map: [[1, 1, 1], [0, 0, 1]], color: 5 } // L-Big Rev
];

let availableShapes = [null, null, null];
let activeDrag = null;

// Initialize
bestScoreDisplay.textContent = ScoreManager.getBestScore(GAME_ID) === '-' ? 0 : ScoreManager.getBestScore(GAME_ID);
updateLeaderboard();
initGrid();
spawnShapes();

function initGrid() {
    gridContainer.innerHTML = '';
    // Create cells
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        gridContainer.appendChild(cell);
    }
}

function renderGrid() {
    const cells = gridContainer.querySelectorAll('.cell');
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const val = grid[r][c];
            const cell = cells[r * GRID_SIZE + c];
            cell.className = 'cell'; // reset
            if (val > 0) {
                cell.classList.add('filled');
                cell.classList.add(`color-${val}`);
            }
        }
    }
    scoreDisplay.textContent = score;
}

function spawnShapes() {
    availableShapes.forEach((s, idx) => {
        if (!s) {
            const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            // Clone deeply
            const shapeObj = {
                map: JSON.parse(JSON.stringify(randomShape.map)),
                color: randomShape.color,
                id: idx
            };
            availableShapes[idx] = shapeObj;
            renderShape(idx);
        }
    });

    // Check Game Over
    if (!canMove()) {
        endGame();
    }
}

function renderShape(idx) {
    const container = shapeContainers[idx];
    container.innerHTML = '';
    const shape = availableShapes[idx];
    if (!shape) return;

    const shapeEl = document.createElement('div');
    shapeEl.classList.add('shape');
    shapeEl.style.gridTemplateColumns = `repeat(${shape.map[0].length}, 25px)`;

    shape.map.forEach(row => {
        row.forEach(cell => {
            const block = document.createElement('div');
            block.classList.add('shape-block');
            if (cell) block.classList.add(`color-${shape.color}`);
            else block.style.visibility = 'hidden';
            shapeEl.appendChild(block);
        });
    });

    // Touch/Mouse Events
    shapeEl.addEventListener('mousedown', (e) => startDrag(e, idx, false));
    shapeEl.addEventListener('touchstart', (e) => startDrag(e, idx, true), { passive: false });

    container.appendChild(shapeEl);
}

// Drag Logic
function startDrag(e, idx, isTouch) {
    e.preventDefault();
    const shape = availableShapes[idx];
    if (!shape) return;

    // Create a clone to drag
    const dragEl = shapeContainers[idx].querySelector('.shape').cloneNode(true);
    dragEl.classList.add('dragging');
    document.body.appendChild(dragEl);

    activeDrag = {
        el: dragEl,
        shape: shape,
        idx: idx,
        isTouch: isTouch,
        offsetX: 0,
        offsetY: 0
    };

    // Calculate offset to center under finger
    const rect = shapeContainers[idx].getBoundingClientRect();
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Center it
    const elRect = dragEl.getBoundingClientRect();
    activeDrag.offsetX = elRect.width / 2;
    activeDrag.offsetY = elRect.height / 2; // Actually we want finger to be somewhat relative

    moveDrag(isTouch ? e.touches[0].clientX : e.clientX, isTouch ? e.touches[0].clientY : e.clientY);

    const moveHandler = isTouch ? onTouchMove : onMouseMove;
    const endHandler = isTouch ? onTouchEnd : onMouseUp;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler, { passive: false });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', endHandler);

    function onMouseMove(ev) { moveDrag(ev.clientX, ev.clientY); }
    function onTouchMove(ev) { ev.preventDefault(); moveDrag(ev.touches[0].clientX, ev.touches[0].clientY); }

    function onMouseUp(ev) { endDrag(ev.clientX, ev.clientY, moveHandler, endHandler); }
    function onTouchEnd(ev) { endDrag(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY, moveHandler, endHandler); }
}

function moveDrag(x, y) {
    if (!activeDrag) return;
    activeDrag.el.style.left = (x - activeDrag.offsetX) + 'px';
    activeDrag.el.style.top = (y - activeDrag.offsetY * 2) + 'px'; // Move up slightly to see under finger
}

function endDrag(x, y, moveHandler, endHandler) {
    document.removeEventListener(activeDrag.isTouch ? 'touchmove' : 'mousemove', moveHandler);
    document.removeEventListener(activeDrag.isTouch ? 'touchend' : 'mouseup', endHandler);

    // Check drop target
    // We need to find which cell is nearest to the top-left block of the shape
    // Or center of shape?
    // Let's assume the dragEl's top-left corresponds to shape[0][0].

    const gridRect = gridContainer.getBoundingClientRect();
    const elRect = activeDrag.el.getBoundingClientRect();

    // Relative X/Y to grid
    const relX = elRect.left - gridRect.left;
    const relY = elRect.top - gridRect.top;

    // Cell size (approx 500px width - gap 4px * 7 / 8... wait. grid gap 4px.)
    // Better: measure one cell
    const cellEl = gridContainer.querySelector('.cell');
    if (!cellEl) return;
    const cellSize = cellEl.getBoundingClientRect().width + 4; // width + gap

    const col = Math.round(relX / cellSize);
    const row = Math.round(relY / cellSize);

    if (canPlace(activeDrag.shape, row, col)) {
        placeShape(activeDrag.shape, row, col);
        availableShapes[activeDrag.idx] = null;
        shapeContainers[activeDrag.idx].innerHTML = ''; // Remove original

        checkLines();

        // Refill if empty
        if (availableShapes.every(s => s === null)) {
            spawnShapes();
        } else {
            // Check if remaining shapes can fit
            if (!canMove()) endGame();
        }
    } else {
        // Return animation? Just delete clone
    }

    activeDrag.el.remove();
    activeDrag = null;
}

function canPlace(shape, startRow, startCol) {
    const map = shape.map;
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 1) {
                const gridR = startRow + r;
                const gridC = startCol + c;

                if (gridR < 0 || gridR >= GRID_SIZE || gridC < 0 || gridC >= GRID_SIZE) return false;
                if (grid[gridR][gridC] !== 0) return false;
            }
        }
    }
    return true;
}

function placeShape(shape, startRow, startCol) {
    const map = shape.map;
    let placedBlocks = 0;
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 1) {
                grid[startRow + r][startCol + c] = shape.color;
                placedBlocks++;
            }
        }
    }
    score += placedBlocks;
    renderGrid();
}

function checkLines() {
    let linesCleared = 0;
    const rowsToClear = [];
    const colsToClear = [];

    // Check Rows
    for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r].every(val => val !== 0)) rowsToClear.push(r);
    }

    // Check Cols
    for (let c = 0; c < GRID_SIZE; c++) {
        let full = true;
        for (let r = 0; r < GRID_SIZE; r++) {
            if (grid[r][c] === 0) { full = false; break; }
        }
        if (full) colsToClear.push(c);
    }

    // Clear logic
    rowsToClear.forEach(r => {
        grid[r] = Array(GRID_SIZE).fill(0);
    });

    colsToClear.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = 0;
    });

    const query = [];
    rowsToClear.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) query.push(r * GRID_SIZE + c);
    });
    colsToClear.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) query.push(r * GRID_SIZE + c);
    });

    // Bonus Score
    if (rowsToClear.length + colsToClear.length > 0) {
        score += (rowsToClear.length + colsToClear.length) * 10;
        // Animation CSS class logic could be added here
        renderGrid();
    }
}

function canMove() {
    // Check if ANY available shape fits ANYWHERE
    const shapes = availableShapes.filter(s => s !== null);
    if (shapes.length === 0) return true; // waiting for spawn

    for (const shape of shapes) {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlace(shape, r, c)) return true;
            }
        }
    }
    return false;
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
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    scoreDisplay.textContent = 0;
    availableShapes = [null, null, null];
    shapeContainers.forEach(c => c.innerHTML = '');
    resultModal.style.display = 'none';
    renderGrid();
    spawnShapes();
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
    const text = `I scored ${score} in Block Puzzle on RexonSoftTech! Play now: https://rst-games.rexonsofttech.in/games/block-puzzle/`;
    ShareManager.shareToWhatsApp(text);
});
