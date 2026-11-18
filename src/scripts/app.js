// Initialize Lucide Icons
        lucide.createIcons();

        // ============================================================================
        // GLOBAL AUDIO & FORENSIC STATE
        // ============================================================================
        let audioCtx = null;
        let audioBuffer = null;
        let rawFileBytes = null;
        let sourceNode = null;
        let analyserNode = null;
        let filterNode = null;
        let gainNode = null;

        let isPlaying = false;
        let isLooping = true;
        let startTime = 0;
        let pauseOffset = 0;
        let animFrameId = null;
        let extractedStrings = [];

        // Canvas references
        const canvasWaveform = document.getElementById('canvas-waveform');
        const ctxWaveform = canvasWaveform.getContext('2d');
        const canvasFFT = document.getElementById('canvas-fft');
        const ctxFFT = canvasFFT.getContext('2d');
        const canvasSpec = document.getElementById('canvas-spectrogram');
        const ctxSpec = canvasSpec.getContext('2d');

        // Resize canvases properly for Retina/DPI
        function resizeCanvases() {
            [canvasWaveform, canvasFFT, canvasSpec].forEach(c => {
                const rect = c.parentElement.getBoundingClientRect();
                c.width = rect.width;
                c.height = rect.height;
            });
            if (audioBuffer) drawStaticWaveform(audioBuffer);
        }
        window.addEventListener('resize', resizeCanvases);

        // Audit Logger
        function logAudit(msg, level = 'INFO') {
            const logEl = document.getElementById('audit-log');
            const colors = {
                'INFO': 'text-cyber-cyan',
                'WARN': 'text-cyber-amber',
                'CRIT': 'text-cyber-red font-bold',
                'OK': 'text-cyber-green'
            };
            const time = new Date().toISOString().split('T')[1].slice(0, 8);
            const div = document.createElement('div');
            div.innerHTML = `<span class="text-slate-600">[${time}]</span> <span class="${colors[level] || 'text-slate-300'}">[${level}]</span> ${msg}`;
            logEl.prepend(div);
        }

        // Copy helper
        function copyHash(id) {
            const text = document.getElementById(id).innerText.trim();
            navigator.clipboard.writeText(text);
            logAudit('Cryptographic SHA-256 digest copied to clipboard.', 'OK');
        }

        // ============================================================================
        // PROCEDURAL COVERT PAYLOAD SYNTHESIZER (WORKS IMMEDIATELY ON LOAD)
        // Generates a valid WAV binary in memory containing:
        // 1. Custom RIFF INFO metadata tags with C2 IP & Operator Callsign
        // 2. LSB Steganography hidden flag in the PCM samples
        // 3. Acoustic DTMF burst tones + 19.2kHz Ultrasonic FSK beacon + Spectral Art
        // ============================================================================
        async function generateCovertSample(customSpectralWord = "GHOST-C2") {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
            }
            const sampleRate = 48000;
            const duration = 6.5; // seconds
            const numSamples = Math.floor(sampleRate * duration);
            const pcmFloats = new Float32Array(numSamples);

            logAudit(`Synthesizing multi-layered covert audio artifact (${sampleRate}Hz, 16-bit)...`, 'INFO');

            // 5x7 Bitmap Font for Spectral Waterfall Drawing
            const font5x7 = {
                'G': [0x3E,0x41,0x49,0x49,0x7A], 'H': [0x7F,0x08,0x08,0x08,0x7F],
                'O': [0x3E,0x41,0x41,0x41,0x3E], 'S': [0x46,0x49,0x49,0x49,0x31],
                'T': [0x01,0x01,0x7F,0x01,0x01], '-': [0x08,0x08,0x08,0x08,0x08],
                'C': [0x3E,0x41,0x41,0x41,0x22], '2': [0x62,0x51,0x49,0x49,0x46],
                '/': [0x20,0x10,0x08,0x04,0x02], 'A': [0x7E,0x11,0x11,0x11,0x7E],
                'E': [0x7F,0x49,0x49,0x49,0x41], 'X': [0x63,0x14,0x08,0x14,0x63],
                'F': [0x7F,0x09,0x09,0x09,0x01], 'I': [0x00,0x41,0x7F,0x41,0x00],
                'L': [0x7F,0x40,0x40,0x40,0x40], '0': [0x3E,0x51,0x49,0x45,0x3E],
                '1': [0x00,0x42,0x7F,0x40,0x00], '9': [0x06,0x49,0x49,0x29,0x1E]
            };

            // DTMF sequence to embed: "9", "1", "1", "#", "C", "2"
            const dtmfTones = [
                { char: '9', f1: 852, f2: 1477, start: 0.3, end: 0.65 },
                { char: '1', f1: 697, f2: 1209, start: 0.8, end: 1.15 },
                { char: '1', f1: 697, f2: 1209, start: 1.3, end: 1.65 },
                { char: '#', f1: 941, f2: 1477, start: 1.8, end: 2.15 },
                { char: 'C', f1: 852, f2: 1633, start: 2.3, end: 2.65 },
                { char: '2', f1: 697, f2: 1336, start: 2.8, end: 3.15 }
            ];

            const word = customSpectralWord.toUpperCase();

            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;

                // 1. Subtle cyberpunk dark ambient drone
                sample += 0.12 * Math.sin(2 * Math.PI * 110 * t) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 1.5 * t));
                sample += 0.06 * Math.sin(2 * Math.PI * 220 * t + Math.sin(2 * Math.PI * 3 * t));

                // 2. DTMF Tones (0.3s to 3.2s)
                for (const tone of dtmfTones) {
                    if (t >= tone.start && t <= tone.end) {
                        sample += 0.22 * (Math.sin(2 * Math.PI * tone.f1 * t) + Math.sin(2 * Math.PI * tone.f2 * t));
                    }
                }

                // 3. Near-Ultrasonic FSK Covert Carrier Burst (18.6kHz / 19.4kHz)
                if (t > 0.5 && t < 6.0) {
                    const bitPeriod = Math.floor(t * 14) % 2;
                    const uFreq = bitPeriod === 0 ? 18600 : 19400;
                    sample += 0.14 * Math.sin(2 * Math.PI * uFreq * t);
                }

                // 4. Inverse-FFT Spectral Text Synthesis (3.3s to 6.2s) between 9kHz and 16.5kHz
                if (t >= 3.3 && t <= 6.2) {
                    const normT = (t - 3.3) / 2.9;
                    const totalCols = word.length * 6;
                    const colIdx = Math.floor(normT * totalCols);
                    const charIdx = Math.floor(colIdx / 6);
                    const subCol = colIdx % 6;

                    if (charIdx < word.length && subCol < 5) {
                        const ch = word[charIdx];
                        const bitmap = font5x7[ch] || [0x7F,0x41,0x41,0x41,0x7F];
                        const colMask = bitmap[subCol];
                        for (let row = 0; row < 7; row++) {
                            if ((colMask >> (6 - row)) & 1) {
                                const freq = 9500 + row * 950;
                                sample += 0.075 * Math.sin(2 * Math.PI * freq * t);
                            }
                        }
                    }
                }

                // Gentle white noise floor
                sample += (Math.random() * 2 - 1) * 0.008;
                pcmFloats[i] = Math.max(-0.98, Math.min(0.98, sample));
            }

            // Build WAV Binary with Custom Forensic Metadata Chunk + LSB Secret
            const secretFlag = "FLAG{s0n1c_gh0st_ultras0n1c_lsb_c2_pwn3d_2025} // C2_CALLBACK=10.13.37.99:4443 // OP=NIGHTFALL\0";
            const wavBytes = encodeWAVWithStegoAndMetadata(pcmFloats, sampleRate, secretFlag);

            await ingestRawAudioBytes(wavBytes, `SIGINT_INTERCEPT_${word.replace(/[^A-Z0-9]/g, '')}.wav`);
            logAudit(`Covert payload compiled: Embedded LSB Flag + Ultrasonic FSK (19.4kHz) + DTMF.`, 'CRIT');
        }

        // Encode Float32 PCM into a standard RIFF WAV Uint8Array with LSB Stego & INFO Chunk
        function encodeWAVWithStegoAndMetadata(samples, sampleRate, lsbSecret) {
            const infoStr = "INAM\x14\x00\x00\x00PROJECT_SONIC_GHOST\x00IART\x10\x00\x00\x00APT_SIGINT_UNIT\x00ICMT\x26\x00\x00\x00COVERT_CHANNEL_ACTIVE_SHA256_VERIFIED\x00";
            const listPayload = "INFO" + infoStr;
            const listChunkSize = listPayload.length;
            const dataSize = samples.length * 2;
            const totalSize = 44 + dataSize + 8 + listChunkSize;

            const buffer = new ArrayBuffer(totalSize);
            const view = new DataView(buffer);

            const writeStr = (offset, str) => {
                for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
            };

            writeStr(0, 'RIFF');
            view.setUint32(4, totalSize - 8, true);
            writeStr(8, 'WAVE');
            writeStr(12, 'fmt ');
            view.setUint32(16, 16, true); // PCM chunk size
            view.setUint16(20, 1, true);  // PCM format
            view.setUint16(22, 1, true);  // Mono
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true); // 16-bit
            writeStr(36, 'data');
            view.setUint32(40, dataSize, true);

            // Convert secret string into bit array
            const secretBits = [];
            for (let i = 0; i < lsbSecret.length; i++) {
                const code = lsbSecret.charCodeAt(i);
                for (let b = 7; b >= 0; b--) {
                    secretBits.push((code >> b) & 1);
                }
            }

            // Write 16-bit PCM samples & replace LSB with secretBits
            let offset = 44;
            for (let i = 0; i < samples.length; i++) {
                let s = Math.max(-1, Math.min(1, samples[i]));
                let pcm16 = s < 0 ? s * 0x8000 : s * 0x7FFF;
                pcm16 = Math.round(pcm16);

                if (i < secretBits.length) {
                    pcm16 = (pcm16 & ~1) | secretBits[i];
                }
                view.setInt16(offset, pcm16, true);
                offset += 2;
            }

            // Append Forensic LIST/INFO Metadata Chunk at tail
            writeStr(offset, 'LIST');
            view.setUint32(offset + 4, listChunkSize, true);
            writeStr(offset + 8, listPayload);

            return new Uint8Array(buffer);
        }

        // ============================================================================
        // BINARY INGESTION, CRYPTOGRAPHIC HASHING, ENTROPY & METADATA PARSER
        // ============================================================================
        async function ingestRawAudioBytes(uint8Array, fileName = "TARGET.wav") {
            stopAudio();
            rawFileBytes = uint8Array;

            // Update Basic Telemetry
            document.getElementById('file-badge').innerText = "ARTIFACT_LOADED";
            document.getElementById('file-badge').className = "text-[10px] bg-cyber-green/20 text-cyber-green border border-cyber-green/40 px-1.5 py-0.5";
            document.getElementById('meta-name').innerText = fileName;
            document.getElementById('meta-size').innerText = `${(uint8Array.byteLength / 1024).toFixed(1)} KB (${uint8Array.byteLength} B)`;

            // Magic Bytes
            const magicHex = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            const magicAscii = Array.from(uint8Array.slice(0, 4)).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
            document.getElementById('meta-magic').innerText = `${magicHex} (${magicAscii})`;

            // Compute Shannon Entropy
            const entropy = calculateShannonEntropy(uint8Array);
            const entEl = document.getElementById('meta-entropy');
            entEl.innerText = `${entropy.toFixed(4)} bits/byte`;
            entEl.className = entropy > 7.4 ? "text-cyber-red font-bold" : "text-cyber-amber font-bold";

            // Compute SHA-256 Digest via Web Crypto API
            const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            document.getElementById('meta-sha256').innerText = sha256Hex;

            // Parse RIFF / ID3 Metadata Tags
            parseForensicTags(uint8Array);

            // Extract LSB Steganography Stream automatically
            extractLSBStream();

            // Render Hex & Carve Printable ASCII Strings
            renderHexView(uint8Array);
            carvePrintableStrings(uint8Array);

            // Decode Audio Data for DSP & Spectrogram
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const copyBuffer = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
            audioBuffer = await audioCtx.decodeAudioData(copyBuffer);

            document.getElementById('meta-duration').innerText = `${audioBuffer.duration.toFixed(2)}s / ${audioBuffer.numberOfChannels}ch`;
            document.getElementById('status-sr').innerText = `${audioBuffer.sampleRate} Hz`;
            document.getElementById('time-total').innerText = formatTime(audioBuffer.duration);

            resizeCanvases();
            drawStaticWaveform(audioBuffer);
            logAudit(`Decoded PCM stream: ${audioBuffer.length} frames @ ${audioBuffer.sampleRate}Hz.`, 'OK');
        }

        function calculateShannonEntropy(bytes) {
            const freq = new Uint32Array(256);
            const len = bytes.length;
            for (let i = 0; i < len; i++) freq[bytes[i]]++;
            let entropy = 0;
            for (let i = 0; i < 256; i++) {
                if (freq[i] > 0) {
                    const p = freq[i] / len;
                    entropy -= p * Math.log2(p);
                }
            }
            return entropy;
        }

        function parseForensicTags(bytes) {
            const tagContainer = document.getElementById('meta-tags');
            tagContainer.innerHTML = '';
            const ascii = new TextDecoder('ascii', { fatal: false }).decode(bytes);
            const tagsFound = [];

            // Search common RIFF INFO & ID3 markers
            const markers = ['INAM', 'IART', 'ICMT', 'ICOP', 'ISFT', 'TIT2', 'TPE1', 'COMM'];
            markers.forEach(tag => {
                const idx = ascii.indexOf(tag);
                if (idx !== -1 && idx + 8 < bytes.length) {
                    const size = bytes[idx + 4] | (bytes[idx + 5] << 8);
                    const val = ascii.slice(idx + 8, idx + 8 + Math.min(size, 64)).replace(/[^\x20-\x7E]/g, '');
                    if (val.length > 1) {
                        tagsFound.push(`<div><span class="text-cyber-cyan">[${tag}]</span> ${val}</div>`);
                    }
                }
            });

            if (tagsFound.length === 0) {
                tagContainer.innerHTML = `<div class="text-slate-400">CONTAINER: Standard RIFF/WAVE PCM</div>`;
            } else {
                tagContainer.innerHTML = tagsFound.join('');
                logAudit(`Extracted ${tagsFound.length} embedded metadata chunks from container.`, 'WARN');
            }
        }

        // ============================================================================
        // LSB STEGANOGRAPHY EXTRACTOR & INJECTOR
        // ============================================================================
        function extractLSBStream() {
            if (!rawFileBytes) return;
            const offsetHex = document.getElementById('lsb-offset').value;
            const startOffset = parseInt(offsetHex, 16) || 44;
            const step = parseInt(document.getElementById('lsb-step').value, 10) || 2;

            const maxBytesToDecode = 240;
            let decodedStr = "";
            let currentByte = 0;
            let bitCount = 0;
            let ones = 0;
            let zeros = 0;

            for (let i = startOffset; i < rawFileBytes.length && decodedStr.length < maxBytesToDecode; i += step) {
                const bit = rawFileBytes[i] & 1;
                if (bit) ones++; else zeros++;
                currentByte = (currentByte << 1) | bit;
                bitCount++;

                if (bitCount === 8) {
                    if (currentByte >= 32 && currentByte <= 126) {
                        decodedStr += String.fromCharCode(currentByte);
                    } else if (currentByte === 0 && decodedStr.length > 4) {
                        decodedStr += " [NULL] ";
                    } else {
                        decodedStr += ".";
                    }
                    currentByte = 0;
                    bitCount = 0;
                }
            }

            document.getElementById('lsb-output').value = decodedStr;

            // Chi-Square / Bit Balance Anomaly Check
            const ratio = ones / (ones + zeros || 1);
            const chiEl = document.getElementById('lsb-chi');
            if (decodedStr.includes("FLAG{") || decodedStr.includes("C2_")) {
                chiEl.innerText = "SIGNATURE: STEGO PAYLOAD DETECTED";
                chiEl.className = "text-cyber-red font-bold animate-pulse";
            } else {
                chiEl.innerText = `Bit Balance: ${(ratio * 100).toFixed(1)}% 1s`;
                chiEl.className = "text-cyber-cyan";
            }
        }

        document.getElementById('btn-run-lsb').addEventListener('click', () => {
            extractLSBStream();
            logAudit('Re-scanned PCM bitplanes for LSB steganography.', 'INFO');
        });

        document.getElementById('btn-inject-lsb').addEventListener('click', async () => {
            if (!audioBuffer) return;
            const secret = document.getElementById('lsb-secret-input').value || "FLAG{injected_by_sonic_ghost}";
            const channelData = audioBuffer.getChannelData(0);
            const newWav = encodeWAVWithStegoAndMetadata(channelData, audioBuffer.sampleRate, secret + "\0");
            await ingestRawAudioBytes(newWav, "STEGO_INJECTED_PAYLOAD.wav");
            logAudit(`Injected ${secret.length * 8} bits into 16-bit PCM LSB plane.`, 'OK');
        });

        document.getElementById('btn-export-stego').addEventListener('click', () => {
            if (!rawFileBytes) return;
            const blob = new Blob([rawFileBytes], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = document.getElementById('meta-name').innerText || 'spectre_signal_payload.wav';
            a.click();
            logAudit('Exported modified binary WAV artifact to disk.', 'OK');
        });

        // ============================================================================
        // HEX INSPECTOR & PRINTABLE STRINGS CARVER
        // ============================================================================
        function renderHexView(bytes, filter = "") {
            const hexContainer = document.getElementById('view-hex');
            const maxLines = 120; // Keep DOM snappy
            let html = "";
            let linesRendered = 0;

            // Render head + tail where metadata often hides
            const slices = [
                { start: 0, end: Math.min(bytes.length, 16 * 70) },
                { start: Math.max(0, bytes.length - 16 * 30), end: bytes.length }
            ];

            slices.forEach((s, idx) => {
                if (idx === 1 && s.start > slices[0].end) {
                    html += `<div class="text-cyber-amber my-1">--- [SKIPPED PCM STREAM BODY: JUMPING TO TRAILER CHUNKS] ---</div>`;
                }
                for (let i = s.start; i < s.end && linesRendered < maxLines; i += 16) {
                    const row = bytes.slice(i, i + 16);
                    const addr = i.toString(16).padStart(8, '0').toUpperCase();
                    let hexPart = "";
                    let asciiPart = "";

                    for (let j = 0; j < 16; j++) {
                        if (j < row.length) {
                            const b = row[j];
                            hexPart += b.toString(16).padStart(2, '0').toUpperCase() + " ";
                            asciiPart += (b >= 32 && b <= 126) ? String.fromCharCode(b).replace(/</g, '&lt;') : ".";
                        } else {
                            hexPart += "   ";
                        }
                        if (j === 7) hexPart += " ";
                    }

                    if (!filter || asciiPart.toLowerCase().includes(filter.toLowerCase()) || hexPart.toLowerCase().includes(filter.toLowerCase())) {
                        html += `<div><span class="text-slate-500">${addr}:</span> <span class="text-slate-300">${hexPart}</span> <span class="text-cyber-cyan">|${asciiPart}|</span></div>`;
                        linesRendered++;
                    }
                }
            });

            hexContainer.innerHTML = html || `<div class="text-slate-500">No matching hex patterns.</div>`;
        }

        function carvePrintableStrings(bytes) {
            extractedStrings = [];
            let current = "";
            let startOffset = 0;

            for (let i = 0; i < bytes.length; i++) {
                const b = bytes[i];
                if (b >= 32 && b <= 126) {
                    if (current.length === 0) startOffset = i;
                    current += String.fromCharCode(b);
                } else {
                    if (current.length >= 5) {
                        extractedStrings.push({ offset: startOffset, str: current });
                    }
                    current = "";
                }
            }
            if (current.length >= 5) extractedStrings.push({ offset: startOffset, str: current });
            renderStringsList("");
        }

        function renderStringsList(filter) {
            const container = document.getElementById('view-strings');
            const filtered = extractedStrings.filter(item => !filter || item.str.toLowerCase().includes(filter.toLowerCase())).slice(0, 150);
            container.innerHTML = filtered.map(item => {
                const isSuspicious = /FLAG|HTTP|C2|CMD|PASS|KEY|PROJECT|APT/i.test(item.str);
                return `<div class="flex justify-between border-b border-slate-900 py-0.5">
                    <span class="text-slate-500">0x${item.offset.toString(16).padStart(6, '0').toUpperCase()}</span>
                    <span class="${isSuspicious ? 'text-cyber-red font-bold' : 'text-cyber-green'} break-all pl-2">${item.str}</span>
                </div>`;
            }).join('');
        }

        // Hex / Strings Tab Switcher & Search
        document.getElementById('tab-hex').addEventListener('click', () => {
            document.getElementById('view-hex').classList.remove('hidden');
            document.getElementById('view-strings').classList.add('hidden');
            document.getElementById('tab-hex').className = "bg-cyber-cyan text-cyber-black font-bold px-2 py-0.5";
            document.getElementById('tab-strings').className = "bg-cyber-dark text-slate-400 border border-cyber-border px-2 py-0.5";
        });
        document.getElementById('tab-strings').addEventListener('click', () => {
            document.getElementById('view-strings').classList.remove('hidden');
            document.getElementById('view-hex').classList.add('hidden');
            document.getElementById('tab-strings').className = "bg-cyber-cyan text-cyber-black font-bold px-2 py-0.5";
            document.getElementById('tab-hex').className = "bg-cyber-dark text-slate-400 border border-cyber-border px-2 py-0.5";
        });
        document.getElementById('hex-search').addEventListener('input', (e) => {
            const q = e.target.value;
            if (rawFileBytes) {
                renderHexView(rawFileBytes, q);
                renderStringsList(q);
            }
        });

        // ============================================================================
        // WEB AUDIO API ENGINE, DSP FILTERS, SPECTROGRAM & SIGINT DEMODULATOR
        // ============================================================================
        function startAudio(offset = pauseOffset) {
            if (!audioBuffer) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            if (sourceNode) {
                try { sourceNode.stop(); } catch (e) {}
            }

            sourceNode = audioCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.loop = isLooping;
            sourceNode.playbackRate.value = parseFloat(document.getElementById('dsp-rate').value);

            filterNode = audioCtx.createBiquadFilter();
            filterNode.type = document.getElementById('dsp-filter-type').value;
            filterNode.frequency.value = parseFloat(document.getElementById('dsp-cutoff').value);
            filterNode.Q.value = 2.5;

            gainNode = audioCtx.createGain();
            gainNode.gain.value = parseFloat(document.getElementById('dsp-gain').value) / 100;

            analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = 2048;
            analyserNode.smoothingTimeConstant = 0.65;

            sourceNode.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(analyserNode);
            analyserNode.connect(audioCtx.destination);

            startTime = audioCtx.currentTime - offset;
            sourceNode.start(0, offset % audioBuffer.duration);
            isPlaying = true;

            document.getElementById('text-play').innerText = "PAUSE STREAM";
            document.getElementById('sigint-sequence').innerText = "";

            cancelAnimationFrame(animFrameId);
            renderRealTimeLoop();
        }

        function pauseAudio() {
            if (!isPlaying) return;
            try { sourceNode.stop(); } catch (e) {}
            pauseOffset = (audioCtx.currentTime - startTime) % audioBuffer.duration;
            isPlaying = false;
            document.getElementById('text-play').innerText = "ENGAGE STREAM";
            cancelAnimationFrame(animFrameId);
        }

        function stopAudio() {
            if (sourceNode) {
                try { sourceNode.stop(); } catch (e) {}
            }
            isPlaying = false;
            pauseOffset = 0;
            document.getElementById('text-play').innerText = "ENGAGE STREAM";
            document.getElementById('playhead').style.left = '0%';
            document.getElementById('time-current').innerText = "00:00.000";
            cancelAnimationFrame(animFrameId);
        }

        // Static Waveform Envelope Renderer
        function drawStaticWaveform(buffer) {
            const w = canvasWaveform.width;
            const h = canvasWaveform.height;
            ctxWaveform.clearRect(0, 0, w, h);

            // Grid lines
            ctxWaveform.strokeStyle = 'rgba(0, 243, 255, 0.08)';
            ctxWaveform.beginPath();
            ctxWaveform.moveTo(0, h / 2);
            ctxWaveform.lineTo(w, h / 2);
            ctxWaveform.stroke();

            const data = buffer.getChannelData(0);
            const step = Math.ceil(data.length / w);
            const amp = h / 2;

            ctxWaveform.strokeStyle = '#00f3ff';
            ctxWaveform.lineWidth = 1;
            ctxWaveform.beginPath();

            for (let i = 0; i < w; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                ctxWaveform.moveTo(i, (1 + min) * amp);
                ctxWaveform.lineTo(i, (1 + max) * amp);
            }
            ctxWaveform.stroke();
        }

        // Color Palette Mapper for Waterfall Spectrogram
        function getSpectrogramColor(val, palette) {
            const v = val / 255;
            if (palette === 'matrix') {
                return [Math.floor(v * 30), Math.floor(Math.pow(v, 1.3) * 255), Math.floor(v * 90)];
            } else if (palette === 'inferno') {
                return [Math.min(255, Math.floor(v * 340)), Math.floor(Math.pow(v, 2) * 180), Math.floor(Math.sin(v * Math.PI) * 140)];
            }
            // Default Cyber Thermal
            if (v < 0.2) return [5, 8, Math.floor(v * 5 * 80)];
            if (v < 0.55) return [0, Math.floor((v - 0.2) * 2.8 * 240), 255];
            if (v < 0.82) return [Math.floor((v - 0.55) * 3.7 * 255), 255, Math.floor(255 - (v - 0.55) * 3.7 * 200)];
            return [255, Math.floor(255 - (v - 0.82) * 5.5 * 255), 100];
        }

        let lastDetectedDTMF = "";
        let lastDTMFTime = 0;

        // Real-Time Visualization & SIGINT Demodulation Loop
        function renderRealTimeLoop() {
            if (!isPlaying || !analyserNode) return;

            const freqBins = analyserNode.frequencyBinCount;
            const freqData = new Uint8Array(freqBins);
            const timeData = new Uint8Array(freqBins);
            analyserNode.getByteFrequencyData(freqData);
            analyserNode.getByteTimeDomainData(timeData);

            // 1. Update Playhead & Time
            const elapsed = ((audioCtx.currentTime - startTime) * parseFloat(document.getElementById('dsp-rate').value)) % audioBuffer.duration;
            const pct = (elapsed / audioBuffer.duration) * 100;
            document.getElementById('playhead').style.left = `${pct}%`;
            document.getElementById('time-current').innerText = formatTime(elapsed);

            // 2. Compute Peak & RMS dBFS
            let sumSq = 0;
            let peak = 0;
            for (let i = 0; i < timeData.length; i++) {
                const norm = (timeData[i] - 128) / 128;
                sumSq += norm * norm;
                if (Math.abs(norm) > peak) peak = Math.abs(norm);
            }
            const rmsDb = (20 * Math.log10(Math.sqrt(sumSq / timeData.length) + 0.0001)).toFixed(1);
            const peakDb = (20 * Math.log10(peak + 0.0001)).toFixed(1);
            document.getElementById('stat-rms').innerText = `${rmsDb} dBFS`;
            document.getElementById('stat-peak').innerText = `${peakDb} dBFS`;

            // 3. Draw Live FFT Spectrum Analyzer
            const fw = canvasFFT.width;
            const fh = canvasFFT.height;
            ctxFFT.fillStyle = 'rgba(5, 6, 8, 0.45)';
            ctxFFT.fillRect(0, 0, fw, fh);

            const barWidth = fw / 256;
            let ultrasonicEnergy = 0;

            for (let i = 0; i < 256; i++) {
                const binIdx = Math.floor((i / 256) * freqBins);
                const val = freqData[binIdx];
                const barH = (val / 255) * fh;

                if (i > 190) ultrasonicEnergy += val; // > 17.8kHz

                ctxFFT.fillStyle = i > 190 ? '#ff0055' : (val > 190 ? '#00ff66' : '#00f3ff');
                ctxFFT.fillRect(i * barWidth, fh - barH, Math.max(1, barWidth - 1), barH);
            }

            // Ultrasonic Carrier Alert
            const uAlert = document.getElementById('ultrasonic-alert');
            if (ultrasonicEnergy / 65 > 55) {
                uAlert.classList.remove('hidden');
            } else {
                uAlert.classList.add('hidden');
            }

            // 4. Scroll & Paint Waterfall Spectrogram (Left-to-Right or Top-to-Bottom)
            const sw = canvasSpec.width;
            const sh = canvasSpec.height;
            // Shift existing canvas down by 2px
            ctxSpec.drawImage(canvasSpec, 0, 0, sw, sh - 2, 0, 2, sw, sh - 2);

            const palette = document.getElementById('spec-palette').value;
            const imgData = ctxSpec.createImageData(sw, 2);
            for (let x = 0; x < sw; x++) {
                const bin = Math.floor((x / sw) * (freqBins * 0.85)); // Focus 0 - 20.5kHz
                const [r, g, b] = getSpectrogramColor(freqData[bin], palette);
                for (let row = 0; row < 2; row++) {
                    const p = (row * sw + x) * 4;
                    imgData.data[p] = r;
                    imgData.data[p + 1] = g;
                    imgData.data[p + 2] = b;
                    imgData.data[p + 3] = 255;
                }
            }
            ctxSpec.putImageData(imgData, 0, 0);

            // 5. Real-Time DTMF Dual-Tone Frequency Demodulator
            detectDTMFFromFFT(freqData, audioCtx.sampleRate, analyserNode.fftSize);

            animFrameId = requestAnimationFrame(renderRealTimeLoop);
        }

        function detectDTMFFromFFT(freqData, sampleRate, fftSize) {
            const rowFreqs = [697, 770, 852, 941];
            const colFreqs = [1209, 1336, 1477, 1633];
            const dtmfGrid = [
                ['1', '2', '3', 'A'],
                ['4', '5', '6', 'B'],
                ['7', '8', '9', 'C'],
                ['*', '0', '#', 'D']
            ];

            const getBinAmp = (f) => {
                const bin = Math.round((f * fftSize) / sampleRate);
                return Math.max(freqData[bin - 1] || 0, freqData[bin] || 0, freqData[bin + 1] || 0);
            };

            let maxRowIdx = -1, maxRowVal = 155;
            rowFreqs.forEach((f, i) => {
                const amp = getBinAmp(f);
                if (amp > maxRowVal) { maxRowVal = amp; maxRowIdx = i; }
            });

            let maxColIdx = -1, maxColVal = 155;
            colFreqs.forEach((f, i) => {
                const amp = getBinAmp(f);
                if (amp > maxColVal) { maxColVal = amp; maxColIdx = i; }
            });

            // Reset matrix UI highlights
            document.querySelectorAll('[id^="dtmf-"]').forEach(el => {
                el.classList.remove('bg-cyber-amber', 'text-cyber-black', 'font-bold');
            });

            if (maxRowIdx !== -1 && maxColIdx !== -1) {
                const key = dtmfGrid[maxRowIdx][maxColIdx];
                const keyEl = document.getElementById(`dtmf-${key}`);
                if (keyEl) keyEl.classList.add('bg-cyber-amber', 'text-cyber-black', 'font-bold');

                const now = performance.now();
                if (key !== lastDetectedDTMF || now - lastDTMFTime > 320) {
                    const seqEl = document.getElementById('sigint-sequence');
                    seqEl.innerText += key;
                    lastDetectedDTMF = key;
                    lastDTMFTime = now;
                }
            }
        }

        function formatTime(sec) {
            const m = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = Math.floor(sec % 60).toString().padStart(2, '0');
            const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
            return `${m}:${s}.${ms}`;
        }

        // ============================================================================
        // INTERACTIVE UI LISTENERS
        // ============================================================================
        document.getElementById('btn-play').addEventListener('click', () => {
            if (isPlaying) pauseAudio(); else startAudio();
        });
        document.getElementById('btn-stop').addEventListener('click', stopAudio);
        document.getElementById('btn-loop').addEventListener('click', (e) => {
            isLooping = !isLooping;
            if (sourceNode) sourceNode.loop = isLooping;
            e.currentTarget.classList.toggle('bg-cyber-cyan/20', isLooping);
        });

        // Waveform Click-to-Seek
        document.getElementById('waveform-container').addEventListener('click', (e) => {
            if (!audioBuffer) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const seekTime = (clickX / rect.width) * audioBuffer.duration;
            pauseOffset = seekTime;
            document.getElementById('playhead').style.left = `${(seekTime / audioBuffer.duration) * 100}%`;
            document.getElementById('time-current').innerText = formatTime(seekTime);
            if (isPlaying) startAudio(seekTime);
        });

        // FFT Cursor Frequency Readout
        canvasFFT.addEventListener('mousemove', (e) => {
            const rect = canvasFFT.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const nyquist = (audioBuffer ? audioBuffer.sampleRate : 48000) / 2;
            const freq = Math.round((x / rect.width) * nyquist);
            const db = Math.round(((rect.height - y) / rect.height) * 100 - 100);
            document.getElementById('fft-hover-readout').innerText = `CURSOR: ${freq} Hz | ${db} dBFS`;
        });

        // DSP Controls Live Update
        document.getElementById('dsp-filter-type').addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('val-filter-type').innerText = val.toUpperCase();
            if (filterNode) filterNode.type = val;
            logAudit(`Switched DSP Biquad topology to ${val.toUpperCase()}.`, 'INFO');
        });

        document.getElementById('dsp-cutoff').addEventListener('input', (e) => {
            const val = e.target.value;
            document.getElementById('val-cutoff').innerText = `${val} Hz`;
            if (filterNode) filterNode.frequency.value = parseFloat(val);
        });

        document.getElementById('dsp-rate').addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('val-rate').innerText = `${val.toFixed(2)}x`;
            if (sourceNode) sourceNode.playbackRate.value = val;
        });

        document.getElementById('dsp-gain').addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            document.getElementById('val-gain').innerText = `${val}%`;
            if (gainNode) gainNode.gain.value = val / 100;
        });

        // Upload Local Audio Target
        document.getElementById('btn-upload').addEventListener('click', () => {
            document.getElementById('audio-upload').click();
        });
        document.getElementById('audio-upload').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const buf = await file.arrayBuffer();
            await ingestRawAudioBytes(new Uint8Array(buf), file.name);
        });

        // Generate Covert C2 Sample Button
        document.getElementById('btn-synth').addEventListener('click', async () => {
            await generateCovertSample("GHOST-C2");
            startAudio(0);
        });

        // Clear SIGINT Sequence
        document.getElementById('btn-clear-sigint').addEventListener('click', () => {
            document.getElementById('sigint-sequence').innerText = "";
        });

        // Spectral Watermark Modal
        document.getElementById('btn-paint-spec').addEventListener('click', () => {
            document.getElementById('modal-spectral').classList.remove('hidden');
            document.getElementById('modal-spectral').classList.add('flex');
        });
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('modal-spectral').classList.add('hidden');
            document.getElementById('modal-spectral').classList.remove('flex');
        });
        document.getElementById('btn-trigger-spectral').addEventListener('click', async () => {
            const word = document.getElementById('spectral-text-input').value || "EXFIL-99";
            document.getElementById('modal-spectral').classList.add('hidden');
            document.getElementById('modal-spectral').classList.remove('flex');
            await generateCovertSample(word);
            startAudio(3.1); // Jump right before spectral text begins
        });

        // Drag and Drop Audio Support anywhere on window
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                const buf = await file.arrayBuffer();
                await ingestRawAudioBytes(new Uint8Array(buf), file.name);
            }
        });

        // Boot Initialization: Automatically synthesize and load the covert C2 specimen
        window.addEventListener('DOMContentLoaded', async () => {
            resizeCanvases();
            logAudit('SPECTRE-SIGNAL v4.0.9 Offensive Audio Forensics Engine initialized.', 'OK');
            await generateCovertSample("GHOST-C2");
        });
