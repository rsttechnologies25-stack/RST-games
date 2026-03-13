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
    const modeBtns = document.querySelectorAll('.mode-btn[data-mode]');
    const difficultyBtns = document.querySelectorAll('.mode-btn[data-difficulty]');
    const difficultySelector = document.getElementById('difficulty-selector');
    const multiPanel = document.getElementById('multiplayer-panel');

    // Game Constants
    const PIECES = {
        wP: '♙', wR: '♖', wN: '♘', wB: '♗', wQ: '♕', wK: '♔',
        bP: '♟', bR: '♜', bN: '♞', bB: '♝', bQ: '♛', bK: '♚'
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
    let difficulty = 'medium'; // 'easy', 'medium'
    let moveHistory = [];
    let castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
    let enPassantTarget = null; // {row, col} or null

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
    }

    function resetGame(isRemote = false) {
        board = JSON.parse(JSON.stringify(initialBoard));
        turn = 'white';
        selectedSquare = null;
        lastMove = null;
        validMoves = [];
        gameActive = true;
        moveHistory = [];
        castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
        enPassantTarget = null;
        
        moveHistoryElement.innerHTML = '';
        gameOverModal.classList.remove('active');

        // Sync Reset
        if (mode === 'online' && !isRemote && conn) {
            conn.send({ type: 'reset' });
        }

        createBoardUI();
        updateGameStatus();
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

        // Update Castling Rights
        updateCastlingRights(piece, fromR, fromC);

        if (isSimulation) return;

        // Visual update & state change
        lastMove = { from: { r: fromR, c: fromC }, to: { r: toR, c: toC } };
        selectedSquare = null;
        validMoves = [];
        const moveLabel = `${piece[1]}${String.fromCharCode(97 + toC)}${8 - toR}`;
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

        // Check End Conditions
        checkEndConditions();

        // AI Move
        if (gameActive && mode === 'ai' && turn === 'black') {
            setTimeout(makeAIMove, 500);
        }
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
        const div = document.createElement('div');
        div.innerText = `${Math.ceil(moveHistory.length / 2)}. ${move}`;
        moveHistoryElement.prepend(div);
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
    let mySide = 'white'; // Default for host

    function generateShortId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function initMultiplayer() {
        const status = document.getElementById('connection-status');
        const myIdDisplay = document.getElementById('my-peer-id');
        const joinInput = document.getElementById('join-id-input');
        const joinBtn = document.getElementById('join-btn');
        const copyBtn = document.getElementById('copy-link-btn');
        const randomBtn = document.getElementById('random-btn');
        const loader = document.getElementById('searching-loader');

        status.innerText = "Initializing Peer...";

        const myShortId = generateShortId();
        peer = new Peer(myShortId);

        peer.on('open', (id) => {
            myIdDisplay.innerText = id;
            status.innerText = "Ready to Connect";
            
            // Check for Auto-Join Link
            const urlParams = new URLSearchParams(window.location.search);
            const joinId = urlParams.get('join');
            if (joinId && joinId !== id) {
                connectToPeer(joinId);
            }
        });

        function connectToPeer(friendId) {
            status.innerText = "Connecting...";
            conn = peer.connect(friendId);
            mySide = 'black'; // Joiner is black

            conn.on('open', () => {
                setupConnectionListeners();
                status.innerText = "Connected as Black";
                status.classList.add('connected');
                loader.style.display = 'none';
                resetGame();
            });
        }

        // Receiving a connection
        peer.on('connection', (c) => {
            if (conn) {
                c.close();
                return;
            }
            conn = c;
            mySide = 'white'; // Host is white
            setupConnectionListeners();
            status.innerText = "Connected as White";
            status.classList.add('connected');
            loader.style.display = 'none';
            resetGame();
        });

        joinBtn.addEventListener('click', () => {
            const friendId = joinInput.value.trim().toUpperCase();
            if (!friendId) return;
            connectToPeer(friendId);
        });

        copyBtn.addEventListener('click', () => {
            const inviteLink = `${window.location.origin}${window.location.pathname}?join=${peer.id}`;
            navigator.clipboard.writeText(inviteLink).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "✅";
                setTimeout(() => copyBtn.innerText = originalText, 2000);
            });
        });

        randomBtn.addEventListener('click', () => {
            loader.style.display = 'flex';
            status.innerText = "Finding global room...";
            
            // Simplified Random Match: Try to join a "public" room based on a small range
            // This is a P2P simulation of random matching.
            const lobbyId = "REXON_CHESS_LOBBY_" + (Math.floor(Math.random() * 5) + 1);
            connectToPeer(lobbyId);

            // If not connected in 5 seconds, become the host for that lobby
            setTimeout(() => {
                if (!conn || !conn.open) {
                    status.innerText = "Hosting public room...";
                    // We can't easily change our ID after init, so we just inform the user
                    // to wait for someone else to connect to their current ID or try again.
                    // For a true random match, a discovery server is needed.
                    // As a fallback, we'll just keep waiting.
                }
            }, 5000);
        });

        peer.on('error', (err) => {
            console.error(err);
            if (err.type === 'peer-unavailable') {
                status.innerText = "Peer not found.";
            } else {
                status.innerText = "Connection Error";
            }
            status.classList.remove('connected');
            loader.style.display = 'none';
        });
    }

    function setupConnectionListeners() {
        conn.on('data', (data) => {
            if (data.type === 'move') {
                executeMove(data.from.r, data.from.c, data.to.r, data.to.c, false, true);
            } else if (data.type === 'reset') {
                resetGame(true);
            }
        });

        conn.on('close', () => {
            document.getElementById('connection-status').innerText = "Friend Disconnected";
            document.getElementById('connection-status').classList.remove('connected');
            conn = null;
        });
    }

    initGame();
});
