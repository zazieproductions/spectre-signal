"""Offline check for repo-relative inline Markdown links and image paths in guides."""

import re
import unittest
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
INLINE_TARGET = re.compile(r'\]\(([^\s()]+)\)')


class DocumentationTests(unittest.TestCase):
    def test_local_file_targets_exist(self):
        guides = [
            *ROOT.glob('*.md'),
            *(ROOT / 'docs').rglob('*.md'),
            *(ROOT / '.github').rglob('*.md'),
        ]
        for guide in guides:
            in_fence = False
            for line_no, line in enumerate(guide.read_text(encoding='utf-8').splitlines(), 1):
                if line.startswith('```'):
                    in_fence = not in_fence
                    continue
                if in_fence:
                    continue
                for target in INLINE_TARGET.findall(line):
                    url = urlsplit(target)
                    if url.scheme or url.netloc or not url.path:
                        continue  # No network checks or heading-slug assumptions.
                    with self.subTest(guide=guide.relative_to(ROOT), line=line_no, link=target):
                        self.assertTrue((guide.parent / unquote(url.path)).exists())
