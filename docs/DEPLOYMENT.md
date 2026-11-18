# Deploying the static workbench

For a private local session, use the [loopback server instructions](../README.md#quick-start). For a shared installation, use a static HTTPS host and confirm you have [permission to publish](../README.md#license). There is no build command, package manifest, database, file-upload service or application secret to configure.

## Files to serve

```text
<site base>/
├── index.html
└── src/
    ├── scripts/app.js
    └── styles/main.css
```

Copy these files **with their directories**. Relative asset URLs work under a site subdirectory as well as at the origin root. Serve JS and CSS with their normal content types; a missing asset must not be replaced by an HTML fallback. Do not publish your entire working directory, `.git`, recordings or exported samples. The archived prototype is not needed. Python's development server is for local testing, not production hosting.

### GitHub Pages (optional, for maintainers)

There is no deployment workflow in this repository; Pages builds the branch directly. The repository root is currently published from **`main`** and **`/(root)`** at <https://zazieproductions.github.io/spectre-signal/>. If publishing the repository root is appropriate, go to **Settings → Pages → Build and deployment → Deploy from a branch**, choose the intended publishing branch and **`/(root)`**, then save. `docs/` contains manuals, not the entry page. Use the HTTPS site URL reported by Pages. The [Validate workflow](../.github/workflows/validate.yml) checks the repository; it does not publish it.

Branch-root publishing can expose other tracked files too. If you only intend to serve the three runtime files above, stage just those files on your static host instead.

## External resources and offline use

| Resource as shipped | Used for | If unavailable |
| --- | --- | --- |
| `cdn.tailwindcss.com` | Runtime Tailwind utility styles and theme config | Layout, visibility classes and controls may not render correctly. |
| `unpkg.com/lucide@latest` | Icon script, initialized at the top of `app.js` | Initialization can stop before event listeners are attached. |
| `fonts.googleapis.com` (CSS) and Google font asset hosts | Fira Code and Orbitron | Fonts may fall back; requests still disclose normal connection metadata. |

Local file selection does not eliminate these requests. For an offline installation, first produce local CSS, pin and vendor the icon script and permitted font assets, and replace the external references. Review third-party terms. A strict Content Security Policy will also need to account for the inline configuration and COPY handler. These changes are **not** part of the shipped build; verify with a cold cache and the network disabled before claiming offline support.

## Post-deploy checks

1. Open the deployed URL over **HTTPS** (localhost is a development exception). Confirm `src/styles/main.css` and `src/scripts/app.js` return the expected content at the site's base path.
2. Wait for the built-in WAV to show a duration, a SHA-256 digest and a waveform. If nothing initializes, check the console and network panel for missing assets, blocked CDNs or CSP errors. If hashing fails, check the secure context.
3. Use a low gain and explicitly click **ENGAGE STREAM**. Browsers can suspend an audio context until a user gesture. If **COPY** fails, check clipboard permission and context; copying is not needed to inspect audio.
4. Run the [manual smoke checks](TESTING.md#browser-smoke-checks) with synthetic input. If just one import fails to decode, try the known PCM WAV before attributing the problem to hosting.
