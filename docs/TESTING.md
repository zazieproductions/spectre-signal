# Testing and interpreting results

## Automated checks

From the repository root, with Python 3 (CI uses 3.12):

```sh
python3 -m unittest discover -s tests -p 'test*.py'
```

No packages, browser or audio device are needed. [`tests/`](../tests/) checks the entry page, extracted assets, archive and local documentation file links. [Validate](../.github/workflows/validate.yml) runs on pushes and pull requests. A green check does **not** exercise Web Audio, device output, CDN availability, accessibility or forensic accuracy.

## A reproducible control file

The built-in specimen is useful for exploring the UI, but its random noise floor means its digest is not a golden value. For an independent byte-for-byte check, this Python 3 snippet makes one second of mono 48 kHz PCM16 **silence** in a new temporary directory and prints its reference SHA-256. No recording or external download is needed.

```sh
python3 - <<'PY'
import hashlib
import tempfile
import wave
from pathlib import Path

path = Path(tempfile.mkdtemp(prefix='spectre-test-')) / 'silence.wav'
with wave.open(str(path), 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(48000)
    wav.writeframes(b'\x00\x00' * 48000)
print(path)
print(hashlib.sha256(path.read_bytes()).hexdigest())
PY
```

Use **INGEST AUDIO TARGET** with the printed path. Expect `RIFF`, **96,044 bytes** (44-byte header plus 96,000 data bytes), **1.00s / 1ch**, a flat waveform and the same digest. Entropy need not be zero: the histogram includes the header. The display rate is the decoded context rate. You can delete the temporary directory after testing.

## Browser smoke checks

Start with a fresh page on [localhost](../README.md#quick-start) or HTTPS and low speaker volume. Use the built-in WAV unless the row specifies another input. These are manual observations, not benchmark pass marks.

| Exercise | Expected observation |
| --- | --- |
| Boot without touching the controls | `SIGINT_INTERCEPT_GHOSTC2.wav`, a 64-hex-character digest and a 6.50 s mono duration appear. No playback until a play/generate action. Wait for decode, not just the loaded badge. |
| Engage at 1×, pause, click the middle of the waveform, resume, then HALT | Time advances, stops on pause, seeks to about halfway, then resets to `00:00.000` on HALT. With loop on, sound repeats. With loop off the sound ends, but the UI may need HALT. |
| Play the generated file; compare ALLPASS to LOWPASS with the cutoff near 1 kHz. Change colormap and hover the FFT | High bars attenuate with the filter; newly painted waterfall rows use the chosen palette. Cursor text follows coordinates. The file digest is unchanged. Restore ALLPASS, 1× and a comfortable gain. |
| Watch the tone matrix during the early bursts; pause and choose CLEAR | The matrix can highlight row/column matches; CLEAR empties the sequence. Do not assert an exact transcript: this is a frame-dependent heuristic. |
| On the generated file, search `52 49 46 46` in HEX; switch to STRINGS and search `PROJECT` | A header row matches the hex query; a printable project marker matches the string query. Clear search to see the unfiltered preview. |
| Open SYNTHESIZE SPECTRAL TEXT; close with ×. Reopen, enter `TEST`, then compile | Closing does not replace the file. Compiling creates `SIGINT_INTERCEPT_TEST.wav` and starts just before the spectral word. HALT before the next check. |
| Load the control WAV above via picker, then drop it on the page | Both paths show the reference digest, size and duration; neither starts playback. Try COPY on a secure origin if the clipboard is permitted. |
| With the control WAV loaded, use short ASCII text `TEST123` and INJECT; extract at `0x2C`, step 2; download and re-import the result | A new `STEGO_INJECTED_PAYLOAD.wav` is loaded and its preview begins with the test text. The re-imported download has the injected file's digest, not the silence digest. The original on disk is unchanged. |
| Tab through buttons, selects and sliders; zoom the page; open and close the dialog | Check reachability, visible focus, labels, reading order and small-screen layout. Note pointer-only canvas operations, motion, or lost modal focus as limitations rather than assuming keyboard or screen-reader parity. |

When reporting a discrepancy, include browser/OS, serving context, control settings, fixture description and expected vs. observed behavior. Do not attach private audio, raw metadata or clipboard contents. See [contributing](../CONTRIBUTING.md) and [private security reporting](../SECURITY.md).
