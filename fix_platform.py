import os
import re

HEADER_TEMPLATE = """
    <header>
        <div class="container">
            <nav>
                <a href="{root_path}index.html" class="logo" aria-label="RexonSoftTech Home">
                    <h3 style="margin:0; font-size: 1.8rem; color: var(--primary-color);">Rexon<span
                            style="color: var(--text-color);">SoftTech</span></h3>
                </a>
                <div class="nav-actions">
                    <div class="nav-links">
                        <a href="{root_path}index.html">Home</a>
                        <a href="{root_path}games.html">Games</a>
                        <a href="#" id="showLeaderboard">Leaderboard</a>
                    </div>
                    <button class="theme-toggle" title="Toggle Theme" aria-label="Switch between light and dark mode">☀️</button>
                    <button class="mobile-menu-btn" aria-label="Open mobile menu">☰</button>
                </div>
            </nav>
        </div>
    </header>
"""

FOOTER_TEMPLATE = """
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>RexonSoftTech</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">Your ultimate destination for free, high-quality browser games. Play, compete, and share your high scores!</p>
                </div>
                <div class="footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="{root_path}index.html">Home</a></li>
                        <li><a href="{root_path}games.html">All Games</a></li>
                        <li><a href="#" class="leaderboard-trigger">Leaderboard</a></li>
                        <li><a href="{root_path}legal/contact.html">Contact Us</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="{root_path}games.html?cat=reflex">Reflex Games</a></li>
                        <li><a href="{root_path}games.html?cat=brain">Brain Training</a></li>
                        <li><a href="{root_path}games.html?cat=skill">Skill Based</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="{root_path}legal/privacy.html">Privacy Policy</a></li>
                        <li><a href="{root_path}legal/terms.html">Terms of Use</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="copyright">&copy; 2026 RexonSoftTech. All rights reserved.</p>
                <div class="social-links">
                    <a href="https://wa.me/?text=Check%20out%20these%20awesome%20games%20at%20RexonSoftTech" target="_blank" title="Share on WhatsApp">💬</a>
                    <a href="#" title="Twitter">🐦</a>
                    <a href="#" title="Discord">👾</a>
                </div>
            </div>
        </div>
    </footer>
"""

BREADCRUMBS_TEMPLATE = """
        <div class="breadcrumbs">
            <a href="{root_path}index.html">Home</a>
            <span>/</span>
            <a href="{root_path}games.html">Games</a>
            <span>/</span>
            <span>{game_name}</span>
        </div>
"""

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine relative root path
    depth = file_path.count('/') - 2 # assuming running from root
    if 'legal/' in file_path:
        root_path = '../'
    elif 'games/' in file_path:
        root_path = '../../'
    else:
        root_path = './'

    # 1. Update Header
    header_html = HEADER_TEMPLATE.format(root_path=root_path)
    if '<header>' in content:
        content = re.sub(r'<header>.*?</header>', header_html, content, flags=re.DOTALL)
    else:
        content = content.replace('<body>', '<body>' + header_html)

    # 2. Update Footer
    footer_html = FOOTER_TEMPLATE.format(root_path=root_path)
    if '<footer>' in content:
        content = re.sub(r'<footer>.*?</footer>', footer_html, content, flags=re.DOTALL)
    else:
        content = content.replace('</body>', footer_html + '\n</body>')

    # 3. Add Breadcrumbs to game pages
    if 'games/' in file_path and 'index.html' in file_path:
        game_name_match = re.search(r'<h1>(.*?)</h1>', content)
        game_name = game_name_match.group(1) if game_name_match else "Game"
        breadcrumbs_html = BREADCRUMBS_TEMPLATE.format(root_path=root_path, game_name=game_name)
        
        if '<div class="breadcrumbs">' not in content:
            # Place after header and before main content
            content = content.replace('</header>', '</header>\n    <main class="container">\n' + breadcrumbs_html)
            # Remove redundant main container if it was already there (careful!)
            # Just let it be for now or refine regex
        else:
            content = re.sub(r'<div class="breadcrumbs">.*?</div>', breadcrumbs_html, content, flags=re.DOTALL)

    # 4. Global Leaderboard Trigger Fix
    # Ensure all links with class .leaderboard-trigger or id showLeaderboard work
    # (Actually handled by main.js, but good to have consistency)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed: {file_path}")

def main():
    for root, dirs, files in os.walk('.'):
        if 'dist' in root or '.git' in root or '.agent' in root:
            continue
        for file in files:
            if file in ['index.html', 'games.html'] or (root.endswith('legal') and file.endswith('.html')):
                process_file(os.path.join(root, file))
            elif root.startswith('./games/') and file == 'index.html':
                 process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
