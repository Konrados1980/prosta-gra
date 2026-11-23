// efekty głębi („trochę 3D”): chmury na dwóch wysokościach (paralaksa) i wysokość lotu samolotu
// Paralaksa: im coś bliżej oka, tym szybciej przesuwa się po ekranie. Chmury są nad samolotem,
// więc przesuwają się szybciej niż ziemia – dzięki temu widać, że lecimy wysoko.
const CLOUD_LAYERS = [
  { speed: 1.35, size: 1.0, alpha: 0.22, gap: 300 },   // niższe chmury
  { speed: 1.8,  size: 1.5, alpha: 0.30, gap: 520 },   // wyższe (bliżej nas): większe i szybsze
];
const CLOUD_SHADOW = { dx: 40, dy: 70, alpha: 0.10 };  // cień chmury na ziemi (to samo słońce co u samolotu)

// Chmury danej warstwy widoczne teraz: każda z kilku „kłębów” (stałe miejsca dzięki hash)
function cloudsOf(layer, li) {
  const list = [], pos = cam * layer.speed;
  for (let i = Math.floor(pos / layer.gap) - 1; i <= Math.floor((pos + H) / layer.gap) + 1; i++) {
    if (hash(i, 50 + li) < 0.35) continue;                       // nie w każdym rzędzie jest chmura
    const x = hash(i, 51 + li) * W, y = H - (i * layer.gap + hash(i, 52 + li) * layer.gap - pos);
    const puffs = [];
    for (let k = 0; k < 5; k++) {
      puffs.push({ dx: (hash(i, 60 + k) - 0.5) * 90 * layer.size, dy: (hash(i, 70 + k) - 0.5) * 36 * layer.size,
        r: (22 + hash(i, 80 + k) * 22) * layer.size });
    }
    list.push({ x, y, puffs });
  }
  return list;
}
function puffShape(c, ox, oy) {
  ctx.beginPath();
  for (const p of c.puffs) { ctx.moveTo(c.x + ox + p.dx + p.r, c.y + oy + p.dy); ctx.arc(c.x + ox + p.dx, c.y + oy + p.dy, p.r, 0, Math.PI * 2); }
}
// Cienie chmur na ziemi i wodzie (rysowane pod samolotem)
function drawCloudShadows() {
  ctx.fillStyle = `rgba(0,0,0,${CLOUD_SHADOW.alpha * (1 - pal.dark)})`;
  CLOUD_LAYERS.forEach((layer, li) => { for (const c of cloudsOf(layer, li)) { puffShape(c, CLOUD_SHADOW.dx * layer.speed, CLOUD_SHADOW.dy * layer.speed); ctx.fill(); } });
}
// Same chmury (rysowane nad samolotem, półprzezroczyste, żeby nie zasłaniały przeszkód)
function drawClouds() {
  const night = pal.dark;                                         // nocą chmury są ciemniejsze
  const shade = Math.round(255 - 150 * night);
  CLOUD_LAYERS.forEach((layer, li) => {
    ctx.fillStyle = `rgba(${shade},${shade},${Math.min(255, shade + 15)},${layer.alpha})`;
    const top = `rgba(255,255,255,${layer.alpha * (1 - 0.6 * night)})`;
    for (const c of cloudsOf(layer, li)) {
      puffShape(c, 0, 0); ctx.fill();
      // jaśniejszy wierzch kłębów – chmura wygląda na „puszystą” bryłę
      ctx.beginPath();
      for (const p of c.puffs) { const r = p.r * 0.6, px = c.x + p.dx - p.r * 0.25, py = c.y + p.dy - p.r * 0.25; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); }
      ctx.fillStyle = top; ctx.fill();
      ctx.fillStyle = `rgba(${shade},${shade},${Math.min(255, shade + 15)},${layer.alpha})`;
    }
  });
}

// Wysokość lotu (0 = nisko, 1 = wysoko) – tylko wygląd, zderzenia się nie zmieniają.
// Samolot lekko faluje, wznosi się przy przyspieszaniu (↑) i opada przy hamowaniu (↓).
function planeAltitude() {
  const target = Math.max(0, Math.min(1,
    0.45 + 0.25 * Math.sin(gt * 0.7) + (plane.boost ? 0.3 : 0) - (keys.ArrowDown ? 0.25 : 0)));
  plane.alt = plane.alt === undefined ? target : plane.alt + (target - plane.alt) * 0.05;
  return plane.alt;
}
