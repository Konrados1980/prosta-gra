// dźwięki: krótkie efekty tworzone w kodzie (Web Audio, bez plików), szum silnika, wyciszanie (D)
// Przeglądarka pozwala grać dźwięk dopiero po pierwszym klawiszu albo kliknięciu – wtedy tworzymy „syntezator”.
let audio = null, master = null, engine = null, noiseBuf = null;
let muted = false;
try { muted = localStorage.getItem('lotNadRzeka_mute') === '1'; } catch (e) {}
const soundLog = [];          // ostatnie odtworzone dźwięki (pomaga w testach)
const VOLUME = 0.5;           // głośność wszystkich dźwięków (0–1)

function initAudio() {
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return;
  if (!audio) {
    audio = new AC();
    master = audio.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(audio.destination);
  }
  if (audio.state === 'suspended' && audio.resume) audio.resume();
}
addEventListener('keydown', initAudio);
addEventListener('pointerdown', initAudio);

function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : VOLUME;
  try { localStorage.setItem('lotNadRzeka_mute', muted ? '1' : '0'); } catch (e) {}
  const btn = document.getElementById('dzwiek');
  if (btn) btn.textContent = muted ? '🔇 Dźwięk wyłączony (D)' : '🔊 Dźwięk (D)';
}

// Ton: częstotliwość (Hz), czas (s), kształt fali, głośność, opcjonalnie zjazd do innej częstotliwości i opóźnienie
function tone(freq, dur, type, vol, slideTo, delay = 0) {
  const t = audio.currentTime + delay;
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
// Szum (wybuchy): losowe próbki przepuszczone przez filtr, który ścina wysokie tony
function noise(dur, vol, cutoff) {
  if (!noiseBuf) {
    noiseBuf = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = audio.currentTime;
  const s = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff, t);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
}

// Jeden efekt dźwiękowy po nazwie
function sfx(name) {
  soundLog.push(name); if (soundLog.length > 30) soundLog.shift();
  if (!audio || muted) return;
  try {
    if (name === 'shot') tone(880, 0.07, 'square', 0.08, 440);
    if (name === 'hit') tone(260, 0.08, 'triangle', 0.25, 130);
    if (name === 'break') { noise(0.2, 0.35, 1400); tone(170, 0.16, 'sine', 0.3, 60); }
    if (name === 'star') { tone(880, 0.08, 'sine', 0.25); tone(1320, 0.14, 'sine', 0.25, null, 0.07); }
    if (name === 'explosion') { noise(0.8, 0.7, 700); tone(90, 0.6, 'sawtooth', 0.25, 30); }
    if (name === 'warn') { tone(1000, 0.06, 'square', 0.1); tone(1000, 0.06, 'square', 0.1, null, 0.12); }
    if (name === 'cannon') { noise(0.3, 0.4, 450); tone(120, 0.25, 'sine', 0.35, 45); }
    if (name === 'stage') [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.2, null, i * 0.12));
  } catch (e) { /* brak dźwięku nie może zatrzymać gry */ }
}

// Szum silnika: gra tylko w trakcie lotu; wyżej, gdy samolot leci szybciej
function updateEngine(on) {
  if (!audio) return;
  if (!engine) {
    const o = audio.createOscillator(), f = audio.createBiquadFilter(), g = audio.createGain();
    o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 400; g.gain.value = 0;
    o.connect(f); f.connect(g); g.connect(master); o.start();
    engine = { o, g };
  }
  const t = audio.currentTime;
  const speed = Math.min(110 + cam * 0.012, 300) + (plane ? (H - 40 - plane.y) * 0.35 : 0);
  engine.o.frequency.setTargetAtTime(55 + speed * 0.2, t, 0.1);
  engine.g.gain.setTargetAtTime(on && !muted ? 0.05 : 0, t, 0.08);
}

// Przycisk pod grą: to samo co klawisz D
const soundBtn = document.getElementById('dzwiek');
if (soundBtn) {
  soundBtn.onclick = e => { initAudio(); toggleMute(); e.currentTarget.blur(); };
  if (muted) soundBtn.textContent = '🔇 Dźwięk wyłączony (D)';
}
