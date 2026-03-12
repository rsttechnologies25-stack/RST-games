// --- Analytics Mock ---
function trackPageView(page) {
    console.log(`[Analytics] Tracked page view: ${page}`);
    // Future: send to server
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('RexonSoftTech Initialized');
    trackPageView(window.location.pathname);

    // Page Fade-in
    document.body.classList.add('loaded');

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            if (!document.documentElement.classList.contains('light')) {
                header.style.background = 'rgba(11, 15, 25, 0.95)';
            } else {
                header.style.background = 'rgba(243, 244, 246, 0.95)';
            }
        } else {
            header.style.boxShadow = 'none';
            if (!document.documentElement.classList.contains('light')) {
                header.style.background = 'rgba(11, 15, 25, 0.9)';
            } else {
                header.style.background = 'rgba(243, 244, 246, 0.9)';
            }
        }
    });

    // Theme Toggle Logic
    const themeBtn = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'light') {
        document.documentElement.classList.add('light');
        if (themeBtn) themeBtn.innerHTML = '🌙';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('light');
            let theme = 'dark';
            if (document.documentElement.classList.contains('light')) {
                theme = 'light';
                themeBtn.innerHTML = '🌙';
            } else {
                themeBtn.innerHTML = '☀️';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '☰';
            });
        });
    }

    // Search and Category Filter Logic
    const searchInput = document.querySelector('.search-input');
    const filterBtns = document.querySelectorAll('.cat-btn');
    const gameCards = document.querySelectorAll('.game-card');

    if (searchInput || filterBtns.length > 0) {
        const filterGames = () => {
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const activeFilter = document.querySelector('.cat-btn.active').dataset.filter;

            gameCards.forEach(card => {
                const title = card.dataset.title.toLowerCase();
                const category = card.dataset.category;
                const matchesSearch = title.includes(searchTerm);
                const matchesFilter = activeFilter === 'all' || category === activeFilter;

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        if (searchInput) {
            searchInput.addEventListener('input', filterGames);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterGames();
            });
        });
    }

    // Contact Form Logic
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const status = document.getElementById('formStatus');
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;

            if (name && email && message) {
                status.style.display = 'block';
                status.style.color = 'var(--success-color)';
                status.textContent = 'Message sent successfully! We will get back to you soon.';
                contactForm.reset();
                setTimeout(() => {
                    status.style.display = 'none';
                }, 5000);
            } else {
                status.style.display = 'block';
                status.style.color = 'var(--error-color)';
                status.textContent = 'Please fill out all fields.';
            }
        });
    }

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }

    // Leaderboard Modal Logic
    const leaderboardLink = document.getElementById('showLeaderboard');
    if (leaderboardLink) {
        // Add Modal HTML dynamically if not present
        if (!document.getElementById('leaderboardModal')) {
            const modalHTML = `
                <div class="modal" id="leaderboardModal">
                    <div class="modal-container">
                        <span class="modal-close">&times;</span>
                        <h2 class="text-center mb-2">High Scores</h2>
                        <div class="leaderboard-grid" id="leaderboardContent">
                            <!-- Populated by JS -->
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modal = document.getElementById('leaderboardModal');
        const content = document.getElementById('leaderboardContent');
        const closeBtn = modal.querySelector('.modal-close');

        const updateLeaderboard = () => {
            const games = [
                { id: 'speed_click', name: 'Speed Click' },
                { id: 'typing_speed', name: 'Typing Speed' },
                { id: 'reaction_time', name: 'Reaction Time' },
                { id: 'tic_tac_toe', name: 'Tic Tac Toe' },
                { id: 'memory_game', name: 'Memory Cards' },
                { id: 'number_memory', name: 'Number Memory' },
                { id: 'sequence_recall', name: 'Sequence Recall' },
                { id: 'quick_math', name: 'Quick Math' },
                { id: '2048', name: '2048 Neon' },
                { id: 'block_puzzle', name: 'Block Puzzle' },
                { id: 'chess', name: 'Chess' },
                { id: 'aim_trainer', name: 'Aim Trainer' },
                { id: 'dont_tap_red', name: 'Don\'t Tap Red' },
                { id: 'odd_one_out', name: 'Odd One Out' },
                { id: 'pattern_match', name: 'Pattern Match' }
            ];

            content.innerHTML = '';
            games.forEach(game => {
                const best = ScoreManager.getBestScore(game.id);
                if (best !== 0 && best !== '-') {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <h4>${game.name}</h4>
                        <span class="score-val">${best}</span>
                    `;
                    content.appendChild(item);
                }
            });

            if (content.innerHTML === '') {
                content.innerHTML = '<p class="text-center">No scores yet. Start playing!</p>';
            }
        };

        leaderboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            updateLeaderboard();
            modal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
});

// Score Manager - Handles local storage for game scores
const ScoreManager = {
    // Save score and return true if it's a high score (top 1) or just made the board
    saveScore: (gameId, score, sortOrder = 'desc') => {
        // sortOrder: 'desc' (Higher is better), 'asc' (Lower is better like time)
        let scores = ScoreManager.getScores(gameId);

        scores.push({
            score: score,
            date: new Date().toLocaleDateString()
        });

        // Sort
        if (sortOrder === 'desc') {
            scores.sort((a, b) => b.score - a.score);
        } else {
            scores.sort((a, b) => a.score - b.score);
        }

        // Keep top 5
        scores = scores.slice(0, 5);
        localStorage.setItem(`rst_scores_${gameId}`, JSON.stringify(scores));

        // Check if new best
        if (scores.length > 0 && scores[0].score == score) return true;
        return false;
    },
    getScores: (gameId) => {
        const stored = localStorage.getItem(`rst_scores_${gameId}`);
        return stored ? JSON.parse(stored) : [];
    },
    getBestScore: (gameId) => {
        const scores = ScoreManager.getScores(gameId);
        return scores.length > 0 ? scores[0].score : (gameId === 'reaction_time' || gameId === 'memory_game' ? '-' : 0);
    }
};

// Share Utility
const ShareManager = {
    shareToWhatsApp: (text) => {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
};
