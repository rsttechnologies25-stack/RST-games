import os
import shutil
import re

SOURCE_DIR = '.'
DIST_DIR = 'dist'
IGNORE_DIRS = {'.git', 'dist', '__pycache__', '.gemini', '.agent'}
IGNORE_FILES = {'build.py', 'README.md', '.DS_Store', 'fix_platform.py'}

def minify_html(content):
    # Remove comments
    content = re.sub(r'<!--(.*?)-->', '', content, flags=re.DOTALL)
    # Remove whitespace between tags
    content = re.sub(r'>\s+<', '><', content)
    return content.strip()

def minify_css(content):
    # Remove comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*([:;{}])\s*', r'\1', content)
    content = content.replace('; }', '}')
    return content.strip()

def minify_js(content):
    # Simple JS Minifier (Not full obfuscation, but remove comments/space)
    # Remove single line comments
    content = re.sub(r'//.*', '', content)
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove whitespace
    # This is risky with regex but safe for simple code if we just trim lines
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    return '\n'.join(lines) 

    # Note: True obfuscation (renaming vars) is hard with regex. 
    # This basic minification makes it hard to read but safe to run.

def build():
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR)

    print(f"Building to {DIST_DIR}...")

    for root, dirs, files in os.walk(SOURCE_DIR):
        # Filter directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        # Create corresponding dir in dist
        rel_path = os.path.relpath(root, SOURCE_DIR)
        if rel_path == '.':
            target_dir = DIST_DIR
        else:
            target_dir = os.path.join(DIST_DIR, rel_path)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)

        for file in files:
            if file in IGNORE_FILES:
                continue

            src_file = os.path.join(root, file)
            dst_file = os.path.join(target_dir, file)
            
            try:
                if file.endswith('.html'):
                    with open(src_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    with open(dst_file, 'w', encoding='utf-8') as f:
                        f.write(minify_html(content))
                    print(f"Minified HTML: {src_file}")
                    
                elif file.endswith('.css'):
                    with open(src_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    with open(dst_file, 'w', encoding='utf-8') as f:
                        f.write(minify_css(content))
                    print(f"Minified CSS: {src_file}")

                elif file.endswith('.js'):
                    with open(src_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    with open(dst_file, 'w', encoding='utf-8') as f:
                        f.write(minify_js(content))
                    print(f"Minified JS: {src_file}")
                
                else:
                    # just copy
                    shutil.copy2(src_file, dst_file)
            except Exception as e:
                print(f"Error processing {src_file}: {e}")

    print("\nBuild Complete! The 'dist' folder is ready for deployment.")

if __name__ == "__main__":
    build()
