# Security and privacy

## Trust boundary

SPECTRE-SIGNAL is a local audio research prototype, **not a sandbox for hostile media**. The application has no audio-upload API, microphone input, login, analytics pipeline or session database. The browser holds working bytes, decoded samples and displayed results in memory. Reloading resets app state; it does not erase downloaded files, clipboard contents, browser caches or host logs.

- Static hosting still involves network requests. The page loads Tailwind and Lucide scripts and Google Fonts resources; their providers receive normal request metadata. Third-party scripts run in the page's context. “Client-side” is not a guarantee of confidentiality or offline operation.
- Treat filenames, tag values, carved strings and sample contents as untrusted. Some file-derived values are currently inserted into HTML. Use the built-in specimen or trusted recordings you have permission to inspect; do not open unknown files to see whether they are safe. Prefer text-only DOM rendering when changing these views.
- COPY writes the digest to the OS clipboard. Download writes the **current file bytes**, which may include metadata and test text, not a sanitized recording. Review what you share, including screenshots and logs.
- Hashes establish byte identity, not authenticity. Entropy, string matches and spectral warnings are heuristics, not proof of malware or hidden messages. See the [research scope](docs/RESEARCH_ETHICS.md).

Use localhost or HTTPS for secure-context browser APIs. Before broader deployment, review rendering of untrusted text and the [external dependency and CSP considerations](docs/DEPLOYMENT.md#external-resources-and-offline-use).

## Report a vulnerability privately

Do **not** file a public issue or PR containing vulnerability details, sensitive samples, personal data or secrets. If **Report a vulnerability** is available in the repository's Security tab, use that private channel. Otherwise contact the maintainer through an established private channel before public disclosure. Include the affected revision, browser/OS, relevant panel and impact; use a non-sensitive description rather than sending someone else's recording.
