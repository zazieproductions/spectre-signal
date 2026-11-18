# Architecture and roadmap

## Current architecture

- `index.html`: HTML panels, control IDs, Tailwind CDN configuration and vendor script imports.
- `src/styles/main.css`: standalone CSS extracted from original.
- `src/scripts/app.js`: browser globals, audio graph, WAV handling, heuristic inspection, canvas rendering and DOM event handlers. Loaded with `defer` to ensure markup is parsed first.
- `archive/sonic-ghost-original.html`: immutable reference for comparing functionality.

## Refactor milestones

1. Add browser smoke tests for upload, playback, synthesis and export.
2. Split WAV encoding/decoding, entropy, LSB experiments and DSP into testable modules.
3. Add known-good WAV fixtures and reference assertions for forensic claims.
4. Replace runtime Tailwind CDN with pinned local build assets and add a CSP.
5. Introduce accessibility checks and error reporting for unsupported codecs.
6. Review memory usage and object URL cleanup on repeated uploads.

## Threat model

Local research UI only. No network interception or remote collection capability is established. CDN dependencies can receive normal page requests. Treat imported audio as untrusted and do not upload confidential recordings to third-party services.
