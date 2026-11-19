// przeszkody: rodzaje, punkty, rozmieszczanie, ruch
// ===== Przeszkody =====
// hp = ile trafień wytrzyma, pts = punkty za rozbicie, color = kolor napisu z punktami
const TYPES = {
  rock:    { name: 'Skała', hp: 1, pts: 10, color: '#eeeeee' },
  log:     { name: 'Pień',  hp: 1, pts: 15, color: '#e6c08f' },
  buoy:    { name: 'Boja',  hp: 1, pts: 20, color: '#ff8a80' },
  whirl:   { name: 'Wir',   hp: 2, pts: 25, color: '#84ffff' },
  boulder: { name: 'Głaz',  hp: 3, pts: 50, color: '#ffab40' },
};
// Przeszkody stawiamy tylko na szerokich fragmentach rzeki i zawsze z wolnym przejazdem obok.
const MIN_WIDTH = 190;   // minimalna szerokość wody (bez wyspy), żeby postawić przeszkodę
const FREE_GAP = 80;     // tyle wolnej wody musi zostać obok przeszkody

// rzeka musi być szeroka w całej okolicy przeszkody, a nie tylko w jednym punkcie
function wideRiver(wy) {
  for (let d = -80; d <= 80; d += 20) {
    const r = riverAt(wy + d);
    if (r.iw > 0.5 || 2 * r.w < MIN_WIDTH) return false;
  }
  return true;
}
// Losuje rodzaj przeszkody; im dalej, tym więcej trudniejszych
function pickType() {
  const p = Math.min(cam / 15000, 1);
  const w = {
    rock: 5 - 2 * p,
    log: 0.8 + 2 * p,
    buoy: 0.6 + 2 * p,
    boulder: cam > 1500 ? 0.4 + 1.6 * p : 0,
    whirl: cam > 3000 ? 0.3 + 1.2 * p : 0,
  };
  let sum = 0;
  for (const k in w) sum += w[k];
  let roll = Math.random() * sum;
  for (const k in w) { roll -= w[k]; if (roll <= 0) return k; }
  return 'rock';
}
// Losuje x tak, żeby przeszkoda o połowie szerokości "half" zostawiła wolny przejazd
function freeX(r, half) {
  for (let tries = 0; tries < 8; tries++) {
    const x = r.c - r.w + half + 6 + Math.random() * (2 * r.w - 2 * half - 12);
    const gapLeft = (x - half) - (r.c - r.w), gapRight = (r.c + r.w) - (x + half);
    if (Math.max(gapLeft, gapRight) >= FREE_GAP) return x;
  }
  return null;
}
function makeObstacle(wy) {
  if (!wideRiver(wy)) return null;
  const type = pickType();
  const o = { type, wy, hp: TYPES[type].hp, flash: 0 };
  let half;
  if (type === 'rock')    { o.r = 10 + Math.random() * 8; half = o.r; }
  if (type === 'boulder') { o.r = 22 + Math.random() * 4; half = o.r; }
  if (type === 'buoy')    { o.r = 9; o.amp = 25 + Math.random() * 15; o.ph = Math.random() * 6.3; half = o.r + o.amp; }
  if (type === 'log')     { o.r = 6; o.len = 46 + Math.random() * 20; o.vx = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 30); half = o.len / 2 + o.r; }
  if (type === 'whirl')   { o.r = 16; o.pull = 90; o.spin = Math.random() * 6.3; half = o.r; }
  const x = freeX(riverAt(wy), half);
  if (x === null) return null;
  o.x = x; o.bx = x;
  return o;
}
// Ruch przeszkód: boje kołyszą się na boki, pnie dryfują i odbijają od brzegów, wiry się kręcą
function moveObstacles(dt) {
  for (const o of obstacles) {
    o.flash = Math.max(0, o.flash - dt);
    if (o.type === 'buoy') o.x = o.bx + Math.sin(gt * 1.6 + o.ph) * o.amp;
    if (o.type === 'whirl') o.spin += dt * 3;
    if (o.type === 'log') {
      o.x += o.vx * dt;
      const half = o.len / 2 + o.r;
      if (!inWater(o.x - half, o.wy) || !inWater(o.x + half, o.wy)) { o.x -= o.vx * dt; o.vx = -o.vx; }
    }
  }
}
// Odległość punktu od krawędzi przeszkody (ujemna = w środku)
function bodyDist(o, x, wy) {
  if (o.type === 'log') {
    const dx = Math.max(Math.abs(x - o.x) - o.len / 2, 0);
    return Math.hypot(dx, wy - o.wy) - o.r;
  }
  return Math.hypot(x - o.x, wy - o.wy) - o.r;
}
function channelCenter(wy) {
  const r = riverAt(wy);
  return r.iw < 3 ? r.c : (r.c - r.w + r.c - r.iw) / 2;
}

// Zamiana współrzędnych: świat (wy rośnie w górę) -> ekran
const toScreenY = wy => H - (wy - cam);
const toWorldY = sy => cam + (H - sy);
