"""Captura as telas fictícias com o Edge (modo sem janela) e salva em WebP.

Uso: python tools/mockups/capture.py [id ...]
Sem argumentos, captura todos os projetos que usam o placeholder.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HTML = ROOT / 'tools' / 'mockups' / 'mockup.html'
OUT = ROOT / 'public' / 'img' / 'projetos'
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'


def placeholder_ids() -> list[str]:
    src = (ROOT / 'src' / 'data' / 'projects.ts').read_text(encoding='utf-8')
    ids = []
    for block in re.split(r'\n  \{\n', src)[1:]:
        m = re.search(r"id: '([^']+)'", block)
        if m and 'imagens: [PH]' in block:
            ids.append(m.group(1))
    return ids


def capture(pid: str) -> Path:
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / 'shot.png'
        url = HTML.as_uri() + '?id=' + pid
        subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        f'--user-data-dir={tmp}\\profile', '--window-size=1280,800', '--virtual-time-budget=2000',
                        f'--screenshot={png}', url], check=True, capture_output=True, timeout=60)
        out = OUT / f'{pid}.webp'
        Image.open(png).convert('RGB').save(out, 'WEBP', quality=82, method=6)
        return out


if __name__ == '__main__':
    ids = sys.argv[1:] or placeholder_ids()
    for pid in ids:
        path = capture(pid)
        print(f'{pid}: {path.stat().st_size // 1024} KB')
    print(json.dumps(ids))
