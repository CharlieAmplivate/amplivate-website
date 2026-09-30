#!/usr/bin/env python3
"""Rebuild the Amplivate site and copy it to the repository root (the folder GitHub Pages publishes).

Edit the site in amplivate.html (and the YOUR DETAILS block at the top of gen.py), then run:
    python3 _build/build.py
"""
import os, shutil, subprocess, sys
BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
KEEP = {'.git', '_build', 'README.md', '_config.yml', '.gitignore', 'CNAME'}

for step in ('prerender.py', 'gen.py', 'assets.py'):
    subprocess.run([sys.executable, os.path.join(BASE, step)], check=True)

dist = os.path.join(BASE, 'dist')
for name in os.listdir(ROOT):                       # clear old site files, keep repo plumbing
    if name in KEEP: continue
    p = os.path.join(ROOT, name)
    shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
for name in os.listdir(dist):
    s, d = os.path.join(dist, name), os.path.join(ROOT, name)
    shutil.copytree(s, d) if os.path.isdir(s) else shutil.copy2(s, d)
print('site copied to', ROOT)
