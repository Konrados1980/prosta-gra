// widok pod kątem („pseudo-3D”): perspektywa, niebo z horyzontem, samolot w przeliczonym miejscu; przełącznik V
// Jak to działa: świat rysujemy jak zwykle (z góry) na niewidocznym płótnie, a potem przenosimy go na ekran
// pasek po pasku – im wyżej (dalej), tym pasek węższy i bardziej ściśnięty. Logika gry się nie zmienia.
const FAR_SCALE = 0.5;    // najdalsza część świata jest 2× mniejsza (1 = bez perspektywy); horyzont wychodzi ok. 28% od góry
let view3d = true;       // domyślnie widok pod kątem; kto wybrał „z góry” (V), ten go zachowuje
try { view3d = localStorage.getItem('lotNadRzeka_view') !== 'gora'; } catch (e) {}
let scene = null, sceneCtx = null;

function toggleView() {
  view3d = !view3d;
  try { localStorage.setItem('lotNadRzeka_view', view3d ? 'kat' : 'gora'); } catch (e) {}
  const btn = document.getElementById('widok');
  if (btn) btn.textContent = view3d ? '🎥 Widok: pod kątem (V)' : '🎥 Widok: z góry (V)';
}

// Perspektywa: s = skala paska (1 na dole, FAR_SCALE na horyzoncie). Każdy pasek jest zmniejszony tak samo
// w poziomie i w pionie, więc przedmioty tylko maleją z odległością (nie rozciągają się).
// Z tego wychodzi: odległość w świecie d = L·ln(1/s), gdzie L = H / ln(1/FAR_SCALE).
const persL = () => H / Math.log(1 / FAR_SCALE);
const virtualHorizon = () => H - persL();                         // tu skala byłaby 0
const hz = () => virtualHorizon() + FAR_SCALE * persL();          // widoczny horyzont
const scaleAt = v => (v - virtualHorizon()) / persL();
const sceneYAt = s => H - persL() * Math.log(1 / s);              // który wiersz świata trafia na ekran
// Punkt ze świata (widok z góry) -> miejsce na ekranie w widoku pod kątem
function project(x, y) {
  const s = Math.exp(-(H - y) / persL());
  return { x: W / 2 + (x - W / 2) * s, y: virtualHorizon() + s * persL(), s };
}
// Chmury w perspektywie: dalsze mniejsze i bliżej horyzontu
function drawCloudsAngled() {
  const shade = Math.round(255 - 150 * pal.dark);
  CLOUD_LAYERS.forEach((layer, li) => {
    ctx.fillStyle = `rgba(${shade},${shade},${Math.min(255, shade + 15)},${layer.alpha})`;
    for (const c of cloudsOf(layer, li)) {
      if (c.y < -40 || c.y > H + 40) continue;
      const p = project(c.x, Math.min(H, c.y));
      ctx.beginPath();
      for (const q of c.puffs) { const r = q.r * p.s, px = p.x + q.dx * p.s, py = p.y + q.dy * p.s * 0.6; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); }
      ctx.fill();
    }
  });
}

function skyColors() {
  const top = [[90, 160, 235], [240, 130, 70], [8, 14, 40], [170, 195, 220]];
  // kolor nieba z pory dnia: mieszamy tak samo jak paletę (src/stages.js)
  const info = stageInfo(cam), n = (info.n - 1) % 4, into = cam - (info.n - 1) * STAGE_LENGTH;
  const t = Math.min(1, Math.max(0, (into - (STAGE_LENGTH - STAGE_BLEND)) / STAGE_BLEND));
  return mixArr(top[n], top[(n + 1) % 4], t);
}

function drawAngled() {
  // 1) świat na niewidocznym płótnie (jak w widoku z góry)
  scene = scene || document.createElement('canvas');
  if (scene.width !== canvas.width || scene.height !== canvas.height) { scene.width = canvas.width; scene.height = canvas.height; sceneCtx = null; }
  sceneCtx = sceneCtx || scene.getContext('2d');
  const main = ctx;
  ctx = sceneCtx; ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  drawWorld(); drawCloudShadows(); drawParticles(); drawPopups();
  ctx = main;

  // 2) niebo i ląd w tle (widoczny po bokach w oddali)
  const sky = skyColors(), h0 = hz();
  const g = ctx.createLinearGradient(0, 0, 0, h0);
  g.addColorStop(0, `rgb(${sky.map(Math.round)})`); g.addColorStop(1, rgba([...mixArr(sky, [255, 255, 255], 0.45), 1]));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, h0 + 1);
  drawMountains(sky, h0);        // góry i pagórki na horyzoncie
  ctx.fillStyle = rgba(pal.grass); ctx.fillRect(0, h0, W, H - h0);

  // 3) świat przenoszony pasek po pasku (pasek co 2 piksele ekranu)
  const step = 2 / renderScale;
  for (let v = h0; v < H; v += step) {
    const s = scaleAt(v + step / 2), sy = sceneYAt(s), sy2 = sceneYAt(scaleAt(Math.min(H, v + step)));
    const srcY = Math.max(0, sy) * renderScale, srcH = Math.max(1, (sy2 - sy) * renderScale);
    ctx.drawImage(scene, 0, srcY, scene.width, srcH, W / 2 - W * s / 2, v, W * s, step + 0.5);
  }
  // mgiełka oddalenia przy horyzoncie
  const fog = ctx.createLinearGradient(0, h0, 0, h0 + (H - h0) * 0.35);
  fog.addColorStop(0, rgba([...mixArr(sky, [255, 255, 255], 0.45), 0.85])); fog.addColorStop(1, rgba([...sky, 0]));
  ctx.fillStyle = fog; ctx.fillRect(0, h0, W, (H - h0) * 0.35);

  // 4) samolot (i tarcza) w przeliczonym miejscu, nie spłaszczony; potem chmury i pora dnia
  const p = project(plane.x, plane.y), real = { x: plane.x, y: plane.y };
  if (state === 'play' || state === 'pause') {
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s * 1.15, p.s * 1.15); ctx.translate(-plane.x, -plane.y);
    drawPlane(); drawShield();
    ctx.restore();
  }
  drawCloudsAngled();
  plane.x = p.x; plane.y = p.y;                 // reflektor nocą świeci z miejsca, gdzie widać samolot
  try { drawAtmosphere(); } finally { plane.x = real.x; plane.y = real.y; }
}

// Góry na horyzoncie: dwie warstwy. Przy skręcaniu samolotu bliższe pagórki przesuwają się na boki
// bardziej niż dalekie góry (paralaksa w poziomie). Kształt grzbietu to suma kilku fal – zawsze ten sam.
const MOUNTAINS = [
  { height: 62, shift: 0.06, waves: [[0.011, 1.3, 0.5], [0.027, 4.1, 0.3], [0.063, 2.2, 0.2]], tint: [70, 90, 130], haze: 0.55, snow: true },
  { height: 32, shift: 0.16, waves: [[0.017, 0.4, 0.55], [0.041, 2.9, 0.3], [0.09, 5.3, 0.15]], tint: [40, 80, 50], haze: 0.3, snow: false },
];
function ridge(m, x) {
  let h = 0;
  for (const [f, ph, a] of m.waves) h += a * (0.5 + 0.5 * Math.sin(x * f + ph));
  return m.height * h;
}
function drawMountains(sky, h0) {
  const turn = (plane ? plane.x - W / 2 : 0);
  for (const m of MOUNTAINS) {
    const off = -turn * m.shift;
    // kolor: odcień gór zmieszany z niebem (im dalej, tym bardziej „za mgłą”), nocą ciemniej, zimą jaśniej
    let col = mixArr(m.tint, sky, m.haze);
    col = mixArr(col, [10, 15, 35], pal.dark * 0.8);
    col = mixArr(col, [225, 232, 240], pal.snow * (m.snow ? 0.55 : 0.75));
    ctx.fillStyle = rgba([...col, 1]);
    ctx.beginPath(); ctx.moveTo(0, h0 + 1);
    for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, h0 - ridge(m, x - off));
    ctx.lineTo(W, h0 + 1); ctx.closePath(); ctx.fill();
    if (m.snow) {
      // śnieżne czubki: tam, gdzie grzbiet jest wyżej niż 55% maksymalnej wysokości
      ctx.fillStyle = `rgba(245,248,255,${0.55 + 0.4 * pal.snow - 0.4 * pal.dark})`;
      ctx.beginPath();
      let inPeak = false;
      for (let x = 0; x <= W + 8; x += 4) {
        const r = ridge(m, x - off), cap = m.height * 0.55;
        if (r > cap) { if (!inPeak) { ctx.moveTo(x, h0 - cap); inPeak = true; } ctx.lineTo(x, h0 - r); }
        else if (inPeak) { ctx.lineTo(x, h0 - cap); ctx.closePath(); inPeak = false; }
      }
      if (inPeak) { ctx.lineTo(W + 8, h0 - m.height * 0.55); ctx.closePath(); }
      ctx.fill();
    }
  }
}

// Przycisk pod grą: to samo co klawisz V
const viewBtn = document.getElementById('widok');
if (viewBtn) {
  viewBtn.onclick = e => { toggleView(); e.currentTarget.blur(); };
  viewBtn.textContent = view3d ? '🎥 Widok: pod kątem (V)' : '🎥 Widok: z góry (V)';
}
