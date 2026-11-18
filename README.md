# SPECTRE-SIGNAL

**Browser-based audio forensics and spectral research workbench.**

An experimental, client-side laboratory for inspecting audio signals, exploring spectral features, generating synthetic test signals, and studying audio steganography. Refactored from the original **SONIC-GHOST** single-file prototype.

> **Research prototype:** interface labels such as “offensive”, “C2”, “SIGINT”, and “threat detection” are thematic. The application is not a validated intrusion, interception, malware detection, or forensic attribution system.

## Features in the inherited prototype

- Local audio upload and playback via Web Audio API
- Waveform, frequency spectrum, and scrolling spectrogram displays
- Hexadecimal and printable-string inspection
- Shannon entropy and heuristic metadata analysis
- LSB extraction/injection experiments and WAV export
- Synthetic audio specimen generation and DTMF exploration

The original implementation is preserved in [`archive/sonic-ghost-original.html`](archive/sonic-ghost-original.html).

## Quick start

No npm install, backend, API key, or build step required. On macOS:

```bash
cd spectre-signal
python3 -m http.server 8000
```

Visit http://localhost:8000 in your browser. Requires internet access for Tailwind CDN, Google Fonts, and Lucide icons. Audio decoding support depends on the browser.

## Project layout

```text
index.html                   Interface and Tailwind configuration
src/styles/main.css         Styling and CRT effects
src/scripts/app.js          Original audio and interface logic
archive/                    Untouched source prototype
docs/                       Architecture and research boundaries
tests/                      Static structure checks
.github/workflows/          Automated validation
```

## Limitations and next steps

This is a **conservative structural extraction**, not a rewrite into modules. `app.js` retains global mutable state and tightly coupled DOM operations. DSP and steganography results have not been benchmarked against reference fixtures. The app loads third-party CDN assets and should not be used offline without vendoring them. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Responsible use

Only analyze recordings you own or are authorized to inspect. Do not treat generated test patterns as a real command-and-control capability. No server-side uploads are implemented by this repo; third-party CDN requests still occur.

## License

No open-source license is granted by default. Add a `LICENSE` file when you choose terms for public distribution.
