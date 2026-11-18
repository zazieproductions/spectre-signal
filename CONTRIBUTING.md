# Contributing

## Report a bug or suggest a feature

Use the [issue chooser](https://github.com/zazieproductions/spectre-signal/issues/new/choose) for non-sensitive reports. For a bug, give the browser version, OS, serving context (localhost or HTTPS), relevant controls and expected vs. actual behavior. Prefer steps using the built-in WAV or the [synthetic silence fixture](docs/TESTING.md#a-reproducible-control-file); do not post private recordings, metadata or personal data. Follow [Security](SECURITY.md) for vulnerabilities instead of opening a public issue.

For a feature, describe the audio research task and an observable result that would make the change useful. A “detected” indicator alone is not an accuracy test. Respect the [research boundaries](docs/RESEARCH_ETHICS.md).

## Prepare a change

1. [Serve the repository locally](README.md#quick-start). There is no install or build step. Work on the extracted files in `src/` and `index.html`; leave `archive/sonic-ghost-original.html` as a reference.
2. Update the [control and preset tables](README.md#control-reference) if labels, defaults or behavior change. For changes to data flow or dependencies, update the [architecture](docs/ARCHITECTURE.md) or [deployment guide](docs/DEPLOYMENT.md) too.
3. From the repository root, run `python3 -m unittest discover -s tests -p 'test*.py'`. Exercise the relevant [browser checks](docs/TESTING.md#browser-smoke-checks) for UI/audio changes. Static CI does not perform those checks.
4. In the [pull request template](.github/PULL_REQUEST_TEMPLATE.md), explain the change, how it was checked and any limits. Use synthetic examples in screenshots and logs. Do not commit generated audio, private samples or credentials.
