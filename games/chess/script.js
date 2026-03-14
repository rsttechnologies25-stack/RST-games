/**
 * RexonSoftTech - Chess Engine
 * A lightweight, self-contained Chess implementation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const boardElement = document.getElementById('chess-board');
    const turnDisplay = document.getElementById('turn-display');
    const gameStatus = document.getElementById('game-status');
    const moveHistoryElement = document.getElementById('move-history');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const gameOverModal = document.getElementById('gameOverModal');
    const winnerText = document.getElementById('winner-text');
    const gameSummary = document.getElementById('game-summary');
    const modeBtns = document.querySelectorAll('.mode-btn-v2[data-mode]');
    const difficultyBtns = document.querySelectorAll('.diff-btn[data-difficulty]');
    const difficultySelector = document.getElementById('difficulty-selector');
    const multiPanel = document.getElementById('multiplayer-panel');
    const undoBtn = document.getElementById('undo-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const hintBtn = document.getElementById('hint-btn');

    // Game Constants
    const PIECES = {
        wP: '<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5"/></svg>',
        wR: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M34 14l-3 3H14l-3-3" /><path d="M31 17v12.5H14V17" /><path d="M31 29.5l1.5 2.5h-20l1.5-2.5" /><path d="M11 14h23" fill="none" stroke-linejoin="miter" /></g></svg>',
        wN: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" /><path d="M24 18c.3 1.2 2 1.9 1.2 4-1.2 3.4-6.4 5.7-10.4 2.8C10.5 22 15 11 22 10z" fill="#fff" /><path d="M9.5 25.5A.5.5 0 1 1 9 25a.5.5 0 0 1 .5.5z" fill="#000" /><path d="M15 15.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="#000" /><path d="M28 27c1.5 1.5 3 1 3.5 1s.5 1 1 0 .5-1.5-1-2h-3.5" /></g></svg>',
        wB: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 0 4.46-13.5 4.5h-13.5c0-.04 0-4.5 0-4.5z" /><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" /><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter" /></g></svg>',
        wQ: '<svg viewBox="0 0 45 45"><g fill="white" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z" /><path d="M9 26c0 2 1.5 2 2.5 4 2.5 3 2.5 3.5 3 6.5h21c.5-3 .5-3.5 3-6.5 1-2 2.5-2 2.5-4-6-1.5-18.5-1.5-27 0z" /><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" /></g></svg>',
        wK: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter" /><path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6 0-1.5 2.5 3 10 3 10z" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter" /><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-1.5-4-7.5-3-6-9-6-12 0-3 6 0 6.5-4 7.5-3 6 0 9.5 6 10.5v7z" fill="#fff" /><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" /></g></svg>',
        bP: '<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#fff" stroke-width="1.5"/></svg>',
        bR: '<svg viewBox="0 0 45 45"><g fill="#000" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M34 14l-3 3H14l-3-3" /><path d="M31 17v12.5H14V17" /><path d="M31 29.5l1.5 2.5h-20l1.5-2.5" /><path d="M11 14h23" fill="none" stroke-linejoin="miter" /></g></svg>',
        bN: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000" /><path d="M24 18c.3 1.2 2 1.9 1.2 4-1.2 3.4-6.4 5.7-10.4 2.8C10.5 22 15 11 22 10z" fill="#000" /><path d="M9.5 25.5A.5.5 0 1 1 9 25a.5.5 0 0 1 .5.5z" fill="#fff" /><path d="M15 15.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="#fff" /><path d="M28 27c1.5 1.5 3 1 3.5 1s.5 1 1 0 .5-1.5-1-2h-3.5" /></g></svg>',
        bB: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 0 4.46-13.5 4.5h-13.5c0-.04 0-4.5 0-4.5z" /><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" /><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter" /></g></svg>',
        bQ: '<svg viewBox="0 0 45 45"><g fill="black" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z" /><path d="M9 26c0 2 1.5 2 2.5 4 2.5 3 2.5 3.5 3 6.5h21c.5-3 .5-3.5 3-6.5 1-2 2.5-2 2.5-4-6-1.5-18.5-1.5-27 0z" /><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" /></g></svg>',
        bK: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter" /><path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6 0-1.5 2.5 3 10 3 10z" fill="#000" stroke-linecap="butt" stroke-linejoin="miter" /><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-1.5-4-7.5-3-6-9-6-12 0-3 6 0 6.5-4 7.5-3 6 0 9.5 6 10.5v7z" fill="#000" /><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" /></g></svg>'
    };

    // Initial Board State
    const initialBoard = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];

    // Game State
    let board = JSON.parse(JSON.stringify(initialBoard)); // Current board
    let turn = 'white'; // current player
    let selectedSquare = null; // {row, col}
    let lastMove = null; // {from: {r, c}, to: {r, c}}
    let validMoves = []; // array of {row, col}
    let gameActive = true;
    let mode = 'ai'; // 'ai' or 'pvp'
    let difficulty = 'easy'; // 'easy', 'medium', 'hard'
    let moveHistory = [];
    let capturedPieces = { white: [], black: [] };
    let castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
    let enPassantTarget = null; // {row, col} or null
    let stateHistory = []; // Array of snapshots for undo

    // -- Initialization --

    function initGame() {
        createBoardUI();
        updateGameStatus();
        
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mode = btn.dataset.mode;
                difficultySelector.style.display = (mode === 'ai') ? 'flex' : 'none';
                multiPanel.style.display = (mode === 'online') ? 'block' : 'none';
                
                if (mode === 'online' && !peer) {
                    initMultiplayer();
                }
                
                resetGame();
            });
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                difficulty = btn.dataset.difficulty;
                resetGame();
            });
        });

        restartBtn.addEventListener('click', resetGame);
        playAgainBtn.addEventListener('click', resetGame);
        
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => undoMove());
    }

    function resetGame(isRemote = false) {
        board = JSON.parse(JSON.stringify(initialBoard));
        turn = 'white';
        selectedSquare = null;
        lastMove = null;
        validMoves = [];
        gameActive = true;
        moveHistory = [];
        capturedPieces = { white: [], black: [] };
        castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
        enPassantTarget = null;
        stateHistory = [];
        
        moveHistoryElement.innerHTML = '';
        gameOverModal.classList.remove('active');

        // Sync Reset
        if (mode === 'online' && !isRemote && conn) {
            conn.send({ type: 'reset' });
        }

        createBoardUI();
        updateGameStatus();
        updateCapturedPiecesUI();
    }

    // -- UI Rendering --

    function createBoardUI() {
        if (!boardElement) return;
        boardElement.innerHTML = '';
        
        // standard is 0-7 (top-down, 0 is rank 8, 7 is rank 1)
        // Perspective: Black at bottom means 0 is at bottom, 7 is at top. 
        const isFlipped = (mode === 'online' && mySide === 'black');

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const r = isFlipped ? 7 - i : i;
                const c = isFlipped ? 7 - j : j;

                const square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'white-sq' : 'black-sq'}`;
                square.dataset.row = r;
                square.dataset.col = c;
                
                const pieceCode = board[r][c];
                if (pieceCode) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${pieceCode[0] === 'w' ? 'white' : 'black'}`;
                    piece.innerText = PIECES[pieceCode];
                    square.appendChild(piece);
                }
                
                square.addEventListener('click', () => handleSquareClick(r, c));
                boardElement.appendChild(square);
            }
        }
        updatePlayerLabels();
    }

    function updatePlayerLabels() {
        const uSide = document.getElementById('user-side');
        const oSide = document.getElementById('opponent-side');
        const oLabel = document.querySelector('#opponent-info .player-tag');

        if (!uSide || !oSide) return; // Wait for DOM

        if (mode === 'online') {
            uSide.innerText = mySide.charAt(0).toUpperCase() + mySide.slice(1);
            uSide.className = `player-side ${mySide}`;
            
            const opponentSide = mySide === 'white' ? 'black' : 'white';
            oSide.innerText = opponentSide.charAt(0).toUpperCase() + opponentSide.slice(1);
            oSide.className = `player-side ${opponentSide}`;
            oLabel.innerText = "Opponent (Online)";
        } else {
            uSide.innerText = "White";
            uSide.className = "player-side white";
            oSide.innerText = "Black";
            oSide.className = "player-side black";
            oLabel.innerText = mode === 'ai' ? "Computer (AI)" : "Friend (Local)";
        }
    }

    function updateBoardUI() {
        const squares = boardElement.querySelectorAll('.square');
        squares.forEach((sq) => {
            const r = parseInt(sq.dataset.row);
            const c = parseInt(sq.dataset.col);
            sq.innerHTML = '';
            sq.classList.remove('selected', 'valid-move', 'valid-capture', 'last-move');
            
            const pieceCode = board[r][c];
            if (pieceCode) {
                const piece = document.createElement('div');
                piece.className = `piece ${pieceCode[0] === 'w' ? 'white' : 'black'}`;
                piece.innerText = PIECES[pieceCode];
                sq.appendChild(piece);
            }

            // Highlight last move
            if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) {
                sq.classList.add('last-move');
            }

            // Highlight selected
            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                sq.classList.add('selected');
            }

            // Highlight valid moves
            const move = validMoves.find(m => m.row === r && m.col === c);
            if (move) {
                if (board[r][c]) {
                    sq.classList.add('valid-capture');
                } else {
                    sq.classList.add('valid-move');
                }
            }
        });
    }

    // -- Input Handling --

    function handleSquareClick(row, col) {
        if (!gameActive) return;
        if (mode === 'ai' && turn === 'black') return; // Wait for AI
        
        // Multi-player turn check
        if (mode === 'online') {
            if (!conn) return; // Not connected
            if (turn !== mySide) return; // Not your turn
        }

        const piece = board[row][col];
        
        // If clicking a valid move
        const moveIndex = validMoves.findIndex(m => m.row === row && m.col === col);
        if (moveIndex !== -1) {
            executeMove(selectedSquare.row, selectedSquare.col, row, col);
            return;
        }

        // If clicking own piece
        if (piece && ((turn === 'white' && piece[0] === 'w') || (turn === 'black' && piece[0] === 'b'))) {
            selectedSquare = { row, col };
            validMoves = getLegalMoves(row, col, board, turn);
            updateBoardUI();
        } else {
            selectedSquare = null;
            validMoves = [];
            updateBoardUI();
        }
    }

    // -- Core Logic --

    function executeMove(fromR, fromC, toR, toC, isSimulation = false, isRemote = false) {
        if (!isSimulation) saveState();
        
        const piece = board[fromR][fromC];
        const targetPiece = board[toR][toC];
        
        // Check for Castling
        if (piece[1] === 'K' && Math.abs(toC - fromC) === 2) {
            const rookCols = toC > fromC ? { from: 7, to: 5 } : { from: 0, to: 3 };
            board[toR][rookCols.to] = board[toR][rookCols.from];
            board[toR][rookCols.from] = '';
        }

        // Check for En Passant Execution
        if (piece[1] === 'P' && enPassantTarget && toR === enPassantTarget.row && toC === enPassantTarget.col) {
            board[fromR][toC] = ''; // Remove the captured pawn
        }

        // Update En Passant Target for next move
        enPassantTarget = null;
        if (piece[1] === 'P' && Math.abs(toR - fromR) === 2) {
            enPassantTarget = { row: (fromR + toR) / 2, col: fromC };
        }

        // Move the piece
        board[toR][toC] = piece;
        board[fromR][fromC] = '';

        // Pawn Promotion (Auto to Queen for simplicity)
        if (piece[1] === 'P' && (toR === 0 || toR === 7)) {
            board[toR][toC] = piece[0] + 'Q';
        }

        // Captured Piece Tracking
        if (targetPiece) {
            const side = targetPiece[0] === 'w' ? 'white' : 'black';
            capturedPieces[side].push(targetPiece);
        }

        // Update Castling Rights
        updateCastlingRights(piece, fromR, fromC);

        if (isSimulation) return;

        // Visual update & state change
        lastMove = { from: { r: fromR, c: fromC }, to: { r: toR, c: toC } };
        selectedSquare = null;
        validMoves = [];
        
        // Algebraic Notation Logic
        const moveLabel = getAlgebraicNotation(piece, fromR, fromC, toR, toC, targetPiece);
        addMoveToHistory(moveLabel);
        
        // Sync Online Move
        if (mode === 'online' && !isRemote && conn) {
            conn.send({
                type: 'move',
                from: { r: fromR, c: fromC },
                to: { r: toR, c: toC }
            });
        }

        turn = (turn === 'white' ? 'black' : 'white');
        updateBoardUI();
        updateGameStatus();
        updateCapturedPiecesUI();

        // Check End Conditions
        checkEndConditions();

        // AI Move
        if (gameActive && mode === 'ai' && turn === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }

    function saveState() {
        stateHistory.push({
            board: JSON.parse(JSON.stringify(board)),
            turn: turn,
            lastMove: JSON.parse(JSON.stringify(lastMove)),
            castlingRights: JSON.parse(JSON.stringify(castlingRights)),
            enPassantTarget: JSON.parse(JSON.stringify(enPassantTarget)),
            moveHistory: [...moveHistory]
        });
        if (stateHistory.length > 50) stateHistory.shift(); // Limit history
    }

    function undoMove(isRemote = false) {
        if (!gameActive || stateHistory.length === 0) return;
        if (mode === 'ai' && turn === 'black') return; // Can't undo while computer thinking
        
        // In AI mode, undo twice (user + computer move)
        if (mode === 'ai' && stateHistory.length >= 2 && !isRemote) {
            applyState(stateHistory.pop()); // Pop AI move
            applyState(stateHistory.pop()); // Pop User move
        } else {
            applyState(stateHistory.pop());
        }

        // Sync Online Undo
        if (mode === 'online' && !isRemote && conn) {
            conn.send({ type: 'undo' });
        }

        selectedSquare = null;
        validMoves = [];
        updateBoardUI();
        updateGameStatus();
        updateMoveHistoryUI();
    }

    function applyState(state) {
        board = state.board;
        turn = state.turn;
        lastMove = state.lastMove;
        castlingRights = state.castlingRights;
        enPassantTarget = state.enPassantTarget;
        moveHistory = state.moveHistory;
        capturedPieces = JSON.parse(JSON.stringify(state.capturedPieces || { white: [], black: [] }));
    }

    function updateMoveHistoryUI() {
        moveHistoryElement.innerHTML = '';
        for (let i = 0; i < moveHistory.length; i++) {
            const entry = document.createElement('div');
            entry.className = 'move-entry';
            const moveNum = Math.floor(i / 2) + 1;
            const prefix = i % 2 === 0 ? `${moveNum}. ` : '';
            entry.innerText = prefix + moveHistory[i];
            moveHistoryElement.appendChild(entry);
        }
        moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
    }

    function getAlgebraicNotation(piece, fromR, fromC, toR, toC, captured) {
        // Special case: Castling
        if (piece[1] === 'K' && Math.abs(toC - fromC) === 2) {
            return toC > fromC ? 'O-O' : 'O-O-O';
        }
        
        const type = piece[1] === 'P' ? '' : piece[1];
        const captureChar = captured ? (piece[1] === 'P' ? String.fromCharCode(97 + fromC) + 'x' : 'x') : '';
        const targetSq = String.fromCharCode(97 + toC) + (8 - toR);
        
        return type + captureChar + targetSq;
    }

    function updateCapturedPiecesUI() {
        const whiteCaptured = document.getElementById('opponent-captured'); // Opponent (Black) holds White pieces if they captured them? 
        // Logic check: Opponent (usually top) should show pieces captured FROM them? 
        // Actually Chess.com shows pieces captured BY the player next to their profile.
        const userCapturedContainer = document.getElementById('user-captured');
        const opponentCapturedContainer = document.getElementById('opponent-captured');
        
        if (!userCapturedContainer || !opponentCapturedContainer) return;

        userCapturedContainer.innerHTML = '';
        opponentCapturedContainer.innerHTML = '';

        // Pieces captured BY White (User) are Black pieces
        capturedPieces.black.forEach(p => {
            const img = document.createElement('div');
            img.className = 'captured-piece-img';
            img.innerHTML = PIECES[p];
            userCapturedContainer.appendChild(img);
        });

        // Pieces captured BY Black (Opponent) are White pieces
        capturedPieces.white.forEach(p => {
            const img = document.createElement('div');
            img.className = 'captured-piece-img';
            img.innerHTML = PIECES[p];
            opponentCapturedContainer.appendChild(img);
        });
    }

    function updateCastlingRights(piece, r, c) {
        if (piece === 'wK') {
            castlingRights.w.k = false;
            castlingRights.w.q = false;
        } else if (piece === 'bK') {
            castlingRights.b.k = false;
            castlingRights.b.q = false;
        } else if (piece === 'wR') {
            if (r === 7 && c === 0) castlingRights.w.q = false;
            if (r === 7 && c === 7) castlingRights.w.k = false;
        } else if (piece === 'bR') {
            if (r === 0 && c === 0) castlingRights.b.q = false;
            if (r === 0 && c === 7) castlingRights.b.k = false;
        }
    }

    function addMoveToHistory(move) {
        moveHistory.push(move);
        updateMoveHistoryUI();
    }

    function updateGameStatus() {
        turnDisplay.innerText = turn.charAt(0).toUpperCase() + turn.slice(1);
        if (isKingInCheck(board, turn)) {
            gameStatus.innerText = "Check!";
            gameStatus.style.color = "var(--error-color)";
        } else {
            gameStatus.innerText = "Live";
            gameStatus.style.color = "var(--primary-color)";
        }
    }

    function checkEndConditions() {
        const moves = getAllLegalMoves(board, turn);
        if (moves.length === 0) {
            gameActive = false;
            if (isKingInCheck(board, turn)) {
                // Checkmate
                const winner = turn === 'white' ? 'Black' : 'White';
                winnerText.innerText = `Checkmate!`;
                gameSummary.innerText = `${winner} has won the game.`;
                if (winner === 'White') ScoreManager.saveScore('chess', 1); // Save win for White (User)
            } else {
                // Stalemate
                winnerText.innerText = `Stalemate!`;
                gameSummary.innerText = `The game is a draw.`;
            }
            gameOverModal.classList.add('active');
            document.getElementById('share-btn').style.display = 'inline-block';
        }
    }

    // -- Validation Engine --

    function getLegalMoves(r, c, b, pTurn) {
        const pseudoMoves = getPseudoLegalMoves(r, c, b);
        const legalMoves = [];
        
        pseudoMoves.forEach(move => {
            // Simulate move
            const tempBoard = JSON.parse(JSON.stringify(b));
            tempBoard[move.row][move.col] = tempBoard[r][c];
            tempBoard[r][c] = '';
            
            if (!isKingInCheck(tempBoard, pTurn)) {
                legalMoves.push(move);
            }
        });

        // Add castling as a special case
        if (!isKingInCheck(b, pTurn)) {
            const piece = b[r][c];
            if (piece === 'wK' && r === 7 && c === 4) {
                if (castlingRights.w.k && !b[7][5] && !b[7][6] && !isSquareAttacked(7, 5, b, 'white')) legalMoves.push({row: 7, col: 6});
                if (castlingRights.w.q && !b[7][3] && !b[7][2] && !b[7][1] && !isSquareAttacked(7, 3, b, 'white')) legalMoves.push({row: 7, col: 2});
            } else if (piece === 'bK' && r === 0 && c === 4) {
                if (castlingRights.b.k && !b[0][5] && !b[0][6] && !isSquareAttacked(0, 5, b, 'black')) legalMoves.push({row: 0, col: 6});
                if (castlingRights.b.q && !b[0][3] && !b[0][2] && !b[0][1] && !isSquareAttacked(0, 3, b, 'black')) legalMoves.push({row: 0, col: 2});
            }
        }

        return legalMoves;
    }

    function getPseudoLegalMoves(r, c, b) {
        const piece = b[r][c];
        const type = piece[1];
        const color = piece[0]; // 'w' or 'b'
        const moves = [];

        if (type === 'P') {
            const dir = color === 'w' ? -1 : 1;
            const startRow = color === 'w' ? 6 : 1;
            
            // Forward
            if (!b[r + dir] || !b[r + dir][c]) {
                moves.push({row: r + dir, col: c});
                if (r === startRow && (!b[r + 2 * dir] || !b[r + 2 * dir][c])) {
                    moves.push({row: r + 2 * dir, col: c});
                }
            }
            // Capture
            for (let dc of [-1, 1]) {
                const targetPiece = b[r + dir] ? b[r + dir][c + dc] : null;
                if (targetPiece && targetPiece[0] !== color) {
                    moves.push({row: r + dir, col: c + dc});
                }
                // En Passant
                if (enPassantTarget && enPassantTarget.row === r + dir && enPassantTarget.col === c + dc) {
                    moves.push({row: r + dir, col: c + dc});
                }
            }
        } else if (type === 'N') {
            const jumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            jumps.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    if (!b[nr][nc] || b[nr][nc][0] !== color) moves.push({row: nr, col: nc});
                }
            });
        } else if (type === 'B' || type === 'R' || type === 'Q') {
            const dirs = [];
            if (type !== 'R') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]); // Diagonals
            if (type !== 'B') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]); // Straights
            
            dirs.forEach(([dr, dc]) => {
                let nr = r + dr, nc = c + dc;
                while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    if (!b[nr][nc]) {
                        moves.push({row: nr, col: nc});
                    } else {
                        if (b[nr][nc][0] !== color) moves.push({row: nr, col: nc});
                        break;
                    }
                    nr += dr; nc += dc;
                }
            });
        } else if (type === 'K') {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        if (!b[nr][nc] || b[nr][nc][0] !== color) moves.push({row: nr, col: nc});
                    }
                }
            }
        }
        return moves.filter(m => m.row >= 0 && m.row < 8 && m.col >= 0 && m.col < 8);
    }

    function isKingInCheck(b, turnColor) {
        const colorPrefix = turnColor === 'white' ? 'w' : 'b';
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (b[r][c] === colorPrefix + 'K') kingPos = {row: r, col: c};
            }
        }
        if (!kingPos) return false;
        return isSquareAttacked(kingPos.row, kingPos.col, b, turnColor);
    }

    function isSquareAttacked(r, c, b, victimColor) {
        const attackerColor = victimColor === 'white' ? 'b' : 'w';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = b[row][col];
                if (piece && piece[0] === attackerColor) {
                    const moves = getPseudoLegalMoves(row, col, b);
                    if (moves.some(m => m.row === r && m.col === c)) return true;
                }
            }
        }
        return false;
    }

    function getAllLegalMoves(b, pTurn) {
        const allMoves = [];
        const colorPrefix = pTurn === 'white' ? 'w' : 'b';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (b[r][c] && b[r][c][0] === colorPrefix) {
                    const moves = getLegalMoves(r, c, b, pTurn);
                    moves.forEach(m => allMoves.push({fromR: r, fromC: c, toR: m.row, toC: m.col}));
                }
            }
        }
        return allMoves;
    }

    // -- AI Engine --

    function makeAIMove() {
        const moves = getAllLegalMoves(board, 'black');
        if (moves.length === 0) return;

        let bestMove = null;
        if (difficulty === 'easy') {
            bestMove = moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Medium AI: Minimax Depth 2
            bestMove = getBestMove(board, 2);
        }

        if (bestMove) {
            executeMove(bestMove.fromR, bestMove.fromC, bestMove.toR, bestMove.toC);
        }
    }

    function getBestMove(b, depth) {
        const moves = getAllLegalMoves(b, 'black');
        let bestScore = -Infinity;
        let bestMove = moves[0];

        moves.forEach(move => {
            const tempBoard = simulateMove(b, move);
            const score = minimax(tempBoard, depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
        return bestMove;
    }

    function minimax(b, depth, alpha, beta, isMaximizing) {
        if (depth === 0) return evaluateBoard(b);

        const moves = getAllLegalMoves(b, isMaximizing ? 'black' : 'white');
        if (moves.length === 0) return evaluateBoard(b);

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                const score = minimax(simulateMove(b, move), depth - 1, alpha, beta, false);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                const score = minimax(simulateMove(b, move), depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    function simulateMove(b, move) {
        const newBoard = JSON.parse(JSON.stringify(b));
        newBoard[move.toR][move.toC] = newBoard[move.fromR][move.fromC];
        newBoard[move.fromR][move.fromC] = '';
        return newBoard;
    }

    function evaluateBoard(b) {
        const vals = { P: 10, N: 30, B: 30, R: 50, Q: 90, K: 900 };
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = b[r][c];
                if (!p) continue;
                const weight = vals[p[1]];
                score += (p[0] === 'b' ? weight : -weight);
            }
        }
        return score;
    }

    // -- Multiplayer Logic --
    let peer = null;
    let conn = null;
    let mySide = 'white';

    function generateShortId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let res = '';
        for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
    }

    function updateMultiplayerStatus(msg, isError = false) {
        const status = document.getElementById('connection-status');
        if (!status) return;
        status.innerText = msg;
        status.style.color = isError ? "var(--error-color)" : "var(--text-muted)";
        if (msg.includes("Connected")) {
            status.style.color = "var(--success-color)";
            status.classList.add('connected');
        } else {
            status.classList.remove('connected');
        }
    }

    function initMultiplayer(targetId = null) {
        const myIdDisplay = document.getElementById('my-peer-id');
        const loader = document.getElementById('searching-loader');
        
        if (peer) {
            peer.destroy();
            peer = null;
        }

        updateMultiplayerStatus("Connecting to server...");
        const myId = targetId || generateShortId();
        
        peer = new Peer(myId, { debug: 1 });

        peer.on('open', (id) => {
            if (myIdDisplay) myIdDisplay.innerText = id;
            updateMultiplayerStatus(targetId ? "Lobby Active - Waiting..." : "Ready to Connect");
            
            if (!targetId) {
                const joinId = new URLSearchParams(window.location.search).get('join');
                if (joinId && joinId !== id) connectToPeer(joinId);
            }
        });

        peer.on('connection', (c) => {
            if (conn) return c.close();
            conn = c;
            mySide = 'white';
            setupConnection(c);
        });

        peer.on('error', (err) => {
            console.error("Peer Error:", err.type, err);
            if (err.type === 'id-taken' && targetId) {
                initMultiplayer();
                setTimeout(() => connectToPeer(targetId), 1000);
            } else {
                updateMultiplayerStatus("Error (" + err.type + ")", true);
            }
            if (loader) loader.style.display = 'none';
        });
    }

    function connectToPeer(friendId) {
        if (!peer || !peer.open) return updateMultiplayerStatus("Multiplayer not ready", true);
        friendId = (friendId || "").trim().toUpperCase();
        if (!friendId || friendId === peer.id) return;

        updateMultiplayerStatus("Connecting to " + friendId + "...");
        const activeConn = peer.connect(friendId, { reliable: true });
        
        const timeout = setTimeout(() => {
            if (!activeConn.open) {
                updateMultiplayerStatus("Peer offline or not found", true);
                const loader = document.getElementById('searching-loader');
                if (loader) loader.style.display = 'none';
            }
        }, 8000);

        activeConn.on('open', () => {
            clearTimeout(timeout);
            conn = activeConn;
            mySide = 'black';
            setupConnection(activeConn);
        });
    }

    function setupConnection(c) {
        updateMultiplayerStatus("Connected as " + (mySide === 'white' ? 'White' : 'Black'));
        const loader = document.getElementById('searching-loader');
        if (loader) loader.style.display = 'none';
        
        c.on('data', (data) => {
            if (data.type === 'move') executeMove(data.from.r, data.from.c, data.to.r, data.to.c, false, true);
            else if (data.type === 'undo') undoMove(true);
            else if (data.type === 'reset') resetGame(true);
        });

        c.on('close', () => {
            updateMultiplayerStatus("Opponent disconnected", true);
            conn = null;
        });
    }

    function setupMultiplayerUI() {
        const joinBtn = document.getElementById('join-btn');
        const copyBtn = document.getElementById('copy-link-btn');
        const randomBtn = document.getElementById('random-btn');
        const input = document.getElementById('join-id-input');
        const loader = document.getElementById('searching-loader');

        if (joinBtn) joinBtn.onclick = () => connectToPeer(input.value);
        
        if (copyBtn) {
            copyBtn.onclick = () => {
                if (!peer || !peer.id) return alert("Multiplayer not ready");
                const url = `${window.location.origin}${window.location.pathname}?join=${peer.id}`;
                if (navigator.share) {
                    navigator.share({ title: 'Chess Challenge', text: 'Play Chess with me!', url: url })
                        .catch(() => copyToClipboard(url));
                } else {
                    copyToClipboard(url);
                }
            };
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerText = "✅";
                setTimeout(() => copyBtn.innerText = "🔗", 2000);
            }).catch(() => {
                alert("Invite Link: " + text);
            });
        }

        if (randomBtn) {
            randomBtn.onclick = () => {
                if (!peer || !peer.open) return updateMultiplayerStatus("Multiplayer not ready", true);
                if (loader) loader.style.display = 'flex';
                updateMultiplayerStatus("Searching for match...");
                
                const lobbyId = "REX_LOBBY_1";
                const testConn = peer.connect(lobbyId, { reliable: true });
                let foundMatch = false;

                const searchTimeout = setTimeout(() => {
                    if (!foundMatch) {
                        testConn.close();
                        updateMultiplayerStatus("No match found. Starting lobby...");
                        setTimeout(() => initMultiplayer(lobbyId), 500);
                    }
                }, 4000);

                testConn.on('open', () => {
                    foundMatch = true;
                    clearTimeout(searchTimeout);
                    conn = testConn;
                    mySide = 'black';
                    setupConnection(testConn);
                });

                testConn.on('error', (err) => {
                    console.log("Matchmaking probe error (expected if no lobby):", err);
                    // Don't update status to Error here, as we are still searching
                });
            };
        }

        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const gameContainer = document.querySelector('.game-container');

        if (fullscreenBtn && gameContainer) {
            fullscreenBtn.onclick = () => {
                try {
                    if (!document.fullscreenElement) {
                        gameContainer.requestFullscreen().catch(err => {
                            console.error(`Fullscreen failed: ${err.message}`);
                            alert("Fullscreen Mode not supported or blocked by browser.");
                        });
                    } else {
                        document.exitFullscreen();
                    }
                } catch (e) {
                    console.error("Fullscreen API Error:", e);
                }
            };

            document.addEventListener('fullscreenchange', () => {
                if (document.fullscreenElement) {
                    fullscreenBtn.querySelector('.label').innerText = "Exit";
                    fullscreenBtn.classList.add('active');
                } else {
                    fullscreenBtn.querySelector('.label').innerText = "Full Screen";
                    fullscreenBtn.classList.remove('active');
                }
            });
        }
    }

    setupMultiplayerUI();
    initGame();
});
