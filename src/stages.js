// etapy (pory dnia): kolory świata, płynne przejścia, noc z reflektorem, napis „Etap N”
const STAGE_LENGTH = 10000;   // co tyle jednostek lotu (= 1000 pkt dystansu) zmienia się etap
const STAGE_BLEND = 1500;     // tyle jednostek lotu przed końcem etapu kolory zaczynają się zmieniać
// Kolory jako [r, g, b, przezroczystość]; drzewa: [cień, środek, światło]
const STAGES = [
  { name: 'Dzień', grass: [61, 139, 61, 1], patchDark: [0, 60, 0, .13], patchLight: [170, 220, 120, .10],
    sand: [217, 196, 143, 1], wetSand: [184, 162, 106, 1], water: [33, 150, 243, 1], deep: [13, 71, 161, .28],
    foam: [255, 255, 255, .7], tree: [[46, 125, 50, 1], [67, 160, 71, 1], [102, 187, 106, 1]],
    pine: [[27, 94, 32, 1], [46, 125, 50, 1], [56, 142, 60, 1]], tint: [0, 0, 0, 0], dark: 0, snow: 0 },
  { name: 'Zachód słońca', grass: [92, 122, 52, 1], patchDark: [70, 30, 0, .15], patchLight: [255, 180, 90, .12],
    sand: [232, 172, 112, 1], wetSand: [190, 130, 80, 1], water: [64, 126, 200, 1], deep: [30, 50, 120, .28],
    foam: [255, 220, 190, .7], tree: [[70, 100, 40, 1], [112, 132, 52, 1], [176, 156, 72, 1]],
    pine: [[45, 70, 35, 1], [70, 95, 40, 1], [98, 118, 46, 1]], tint: [255, 110, 40, .16], dark: 0, snow: 0 },
  { name: 'Noc', grass: [32, 64, 48, 1], patchDark: [0, 20, 20, .2], patchLight: [80, 120, 140, .08],
    sand: [122, 118, 112, 1], wetSand: [96, 92, 92, 1], water: [26, 62, 124, 1], deep: [5, 15, 50, .4],
    foam: [200, 220, 255, .5], tree: [[18, 50, 34, 1], [28, 70, 46, 1], [44, 92, 62, 1]],
    pine: [[12, 38, 26, 1], [20, 54, 36, 1], [30, 70, 48, 1]], tint: [10, 20, 60, .12], dark: .55, snow: 0 },
  { name: 'Zima', grass: [232, 238, 242, 1], patchDark: [150, 170, 190, .15], patchLight: [255, 255, 255, .4],
    sand: [208, 214, 220, 1], wetSand: [170, 180, 192, 1], water: [80, 150, 200, 1], deep: [20, 70, 120, .3],
    foam: [255, 255, 255, .9], tree: [[40, 90, 62, 1], [62, 112, 82, 1], [240, 245, 250, 1]],
    pine: [[24, 70, 50, 1], [40, 90, 66, 1], [236, 242, 246, 1]], tint: [180, 210, 255, .08], dark: 0, snow: 1 },
];

let pal = STAGES[0];          // kolory bieżącej klatki (liczone w stageInfo)
let curStage = 1, stageBanner = null;

const mixArr = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rgba = c => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3]})`;
function mixPalette(a, b, t) {
  const p = { name: t < 0.5 ? a.name : b.name };
  for (const k in a) {
    if (k === 'name') continue;
    p[k] = typeof a[k] === 'number' ? a[k] + (b[k] - a[k]) * t
      : Array.isArray(a[k][0]) ? a[k].map((c, i) => mixArr(c, b[k][i], t)) : mixArr(a[k], b[k], t);
  }
  return p;
}
// Numer etapu (1, 2, 3…), nazwa pory dnia i kolory dla danego miejsca lotu
function stageInfo(camPos) {
  const n = Math.floor(Math.max(0, camPos) / STAGE_LENGTH);
  const into = camPos - n * STAGE_LENGTH;
  const t = Math.min(1, Math.max(0, (into - (STAGE_LENGTH - STAGE_BLEND)) / STAGE_BLEND));
  const now = STAGES[n % STAGES.length], next = STAGES[(n + 1) % STAGES.length];
  return { n: n + 1, name: now.name, pal: t > 0 ? mixPalette(now, next, t) : now };
}

// Wywoływane co klatkę gry: wykrywa nowy etap i pokazuje napis
function updateStage(dt) {
  const n = stageInfo(cam).n;
  if (n > curStage) stageBanner = { text: `Etap ${n}`, sub: stageInfo(cam).name, life: 2.5 };
  curStage = n;
  if (stageBanner && (stageBanner.life -= dt) <= 0) stageBanner = null;
}

// Zimą po rzece płyną kry lodu (tylko ozdoba – nie są przeszkodą)
function drawIce() {
  if (pal.snow < 0.05) return;
  const ICE = 60;
  ctx.fillStyle = `rgba(240,248,255,${0.85 * pal.snow})`;
  for (let i = Math.floor(cam / ICE) - 1; i <= Math.floor((cam + H) / ICE) + 1; i++) {
    if (hash(i, 7) < 0.45) continue;
    const wy = i * ICE + hash(i, 8) * ICE, r = riverAt(wy);
    const x = r.c + (hash(i, 9) * 2 - 1) * r.w * 0.7, s = 7 + hash(i, 10) * 9;
    if (!inWater(x - s, wy) || !inWater(x + s, wy)) continue;
    const y = toScreenY(wy);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3 + hash(i, 11), rr = s * (0.7 + hash(i, 12 + k) * 0.5);
      ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7);
    }
    ctx.closePath(); ctx.fill();
  }
}

// Zabarwienie całej sceny (zachód, noc) i ciemność z reflektorem samolotu
let fog = null;
function drawAtmosphere() {
  if (pal.tint[3] > 0.01) { ctx.fillStyle = rgba(pal.tint); ctx.fillRect(0, 0, W, H); }
  if (pal.dark < 0.01 || !plane) return;
  fog = fog || document.createElement('canvas');
  if (fog.width !== canvas.width || fog.height !== canvas.height) { fog.width = canvas.width; fog.height = canvas.height; }
  const f = fog.getContext('2d');
  f.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  f.globalCompositeOperation = 'source-over';
  f.clearRect(0, 0, W, H);
  f.fillStyle = `rgba(4,8,28,${pal.dark})`; f.fillRect(0, 0, W, H);
  f.globalCompositeOperation = 'destination-out';               // „wycinamy” światło z ciemności
  const light = (x, y, r, sy) => {
    f.save(); f.translate(x, y); f.scale(1, sy);
    const g = f.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    f.fillStyle = g; f.beginPath(); f.arc(0, 0, r, 0, Math.PI * 2); f.fill(); f.restore();
  };
  light(plane.x, plane.y - 130, 110, 1.8);                       // reflektor przed samolotem
  light(plane.x, plane.y, 55, 1);                                 // poświata wokół samolotu
  ctx.drawImage(fog, 0, 0, W, H);
  // ciepłe światło reflektora (dodawane do koloru pod spodem)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(plane.x, plane.y - 140); ctx.scale(1, 2);
  const beam = ctx.createRadialGradient(0, 0, 0, 0, 0, 95);
  beam.addColorStop(0, `rgba(255,236,170,${0.4 * pal.dark})`); beam.addColorStop(1, 'rgba(255,236,170,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.arc(0, 0, 95, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // ostrzegające armatki widać też w ciemności (uczciwość)
  for (const c of cannons) {
    const sy = toScreenY(c.wy);
    if (sy >= 60 && sy <= plane.y - 60 && c.cd < CHARGE_TIME) circle(c.x + c.dir * 20, sy, 6, 'rgba(255,23,68,.9)');
  }
}

function drawStageBanner() {
  if (!stageBanner) return;
  ctx.globalAlpha = Math.min(1, stageBanner.life);
  ctx.textAlign = 'center'; ctx.fillStyle = '#000';
  ctx.font = 'bold 40px system-ui, sans-serif'; ctx.fillText(stageBanner.text, W / 2 + 2, H * 0.32 + 2);
  ctx.fillStyle = '#fff'; ctx.fillText(stageBanner.text, W / 2, H * 0.32);
  ctx.font = 'bold 22px system-ui, sans-serif'; ctx.fillStyle = '#ffd54a';
  ctx.fillText(stageBanner.sub, W / 2, H * 0.32 + 34);
  ctx.globalAlpha = 1;
}
