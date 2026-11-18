from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class StructureTests(unittest.TestCase):
    def test_assets_exist(self):
        for name in ['index.html', 'src/styles/main.css', 'src/scripts/app.js', 'archive/sonic-ghost-original.html']:
            self.assertTrue((ROOT / name).is_file(), name)

    def test_assets_referenced(self):
        html = (ROOT / 'index.html').read_text()
        self.assertIn('./src/styles/main.css', html)
        self.assertIn('./src/scripts/app.js', html)
        self.assertIn('SPECTRE-SIGNAL', html)

if __name__ == '__main__':
    unittest.main()
