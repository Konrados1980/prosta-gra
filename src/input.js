// stan gry, klawiatura i sterowanie dotykiem
// ===== Stan gry =====
let state = 'menu';       // 'menu' | 'play' | 'pause' | 'next' (między turami) | 'results'
let cam, plane, lives, score, bonus, obstacles, rings, particles, segments, invuln, nextSpawn;
let gt = 0;               // czas gry w sekundach (do animacji przeszkód)
let bullets, shotCd;      // pociski samolotu i czas do następnego strzału
let popups = [];          // unoszące się napisy z punktami
let cannons = [], balls = [], nextCannon = 0;   // armatki na brzegu i ich kule
const SHOT_DELAY = 0.2;   // co ile sekund można strzelić (przy trzymanej Spacji)
const SHOT_SPEED = 550;   // jak szybko pocisk leci w górę ekranu

// Klawisze zapisujemy po e.code (fizyczny klawisz), więc działa przy każdym układzie klawiatury
const keys = {};
let wantShot = false;     // krótkie stuknięcie Spacji/X też odda strzał
const isShotKey = c => c === 'Space' || c === 'KeyX';
addEventListener('keydown', e => {
  const enter = e.code === 'Enter' || e.code === 'NumpadEnter';
  // Podczas wpisywania imienia klawisze nie sterują grą (poza Enterem = start)
  if (e.target.tagName === 'INPUT') {
    if (enter) { e.preventDefault(); startFromMenu(); }
    return;
  }
  keys[e.code] = true;
  if (e.code.startsWith('Arrow') || isShotKey(e.code)) e.preventDefault();
  if (isShotKey(e.code) && !e.repeat && state === 'play') wantShot = true;
  if (enter && !e.repeat) {
    e.preventDefault();
    if (state === 'menu') startFromMenu();
    else if (state === 'next') startTurn();
    else if (state === 'results') startRound();
  }
  if (e.code === 'KeyF') toggleFullscreen();
  if (e.code === 'KeyV') toggleView();            // widok z góry / pod kątem (src/perspective.js)
  if (e.code === 'KeyD') toggleMute();            // włącz / wyłącz dźwięk (src/sound.js)
  // M: powrót do menu (zmiana graczy i imion) z pauzy, między turami albo z wyników
  if (e.code === 'KeyM' && (state === 'pause' || state === 'next' || state === 'results')) showMenu();
  if (e.code === 'KeyP' && (state === 'play' || state === 'pause')) {
    state = state === 'play' ? 'pause' : 'play';
  }
});
addEventListener('keyup', e => { keys[e.code] = false; });
// Po przełączeniu okna klawisze mogłyby "utknąć" wciśnięte
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

// ===== Sterowanie dotykiem (działa też myszą) =====
// Przesuwasz palec w dowolnym miejscu gry, a samolot przesuwa się o tyle samo,
// więc palec nie zasłania samolotu.
let drag = null;   // { px, py, ax, ay } = gdzie był palec i samolot na początku ruchu
function pointerPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
}
function anchorDrag(p) { drag = { px: p.x, py: p.y, ax: plane.x, ay: plane.y, tx: plane.x, ty: plane.y }; }
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  if (state === 'next') startTurn();
  else if (state === 'pause') state = 'play';
  else if (state !== 'play') return;
  anchorDrag(pointerPos(e));
});
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const p = pointerPos(e);
  drag.tx = drag.ax + (p.x - drag.px);
  drag.ty = drag.ay + (p.y - drag.py);
  drag.last = p;
});
// po puszczeniu palca samolot jeszcze dolatuje do wskazanego miejsca
const endDrag = () => { if (drag) drag.released = true; };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

// Pauza, gdy przełączysz kartę lub aplikację na telefonie
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'play') state = 'pause';
});
