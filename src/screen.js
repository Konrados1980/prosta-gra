// rozmiar planszy, pełny ekran, przesuwanie świata po zmianie okna
// ===== Ustawienia =====
const canvas = document.getElementById('gra');
const ctx = canvas.getContext('2d');
const SEG = 160;          // długość jednego odcinka rzeki (w pikselach świata)

// ===== Rozmiar planszy =====
// Wysokość planszy jest stała (640), a szerokość dopasowujemy do kształtu okna,
// więc na szerokim monitorze widać więcej brzegów i rzeka ma więcej miejsca na zakręty.
const H = 640;
let W = 480;
let renderScale = 1;      // ile pikseli ekranu przypada na 1 jednostkę gry
const MIN_W = 480, MAX_W = 1280;
function resize() {
  const footer = document.fullscreenElement ? 0 : document.getElementById('stopka').offsetHeight + 16;
  const availW = innerWidth - 8, availH = innerHeight - footer - 8;
  const oldW = W;
  W = Math.round(Math.max(MIN_W, Math.min(MAX_W, H * availW / availH)));
  if (oldW !== W && segments) recenterWorld(oldW);
  const scale = Math.min(availW / W, availH / H);       // powiększamy planszę, żeby wypełniła okno
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
  // Rysujemy w prawdziwej rozdzielczości ekranu (ostro, bez widocznych pikseli),
  // a gra dalej liczy wszystko w swoich jednostkach W × H.
  renderScale = Math.min(2.5, scale * (devicePixelRatio || 1));
  canvas.width = Math.round(W * renderScale); canvas.height = Math.round(H * renderScale);
  if (plane) plane.x = Math.min(plane.x, W - 15);
}
// Po zmianie szerokości okna przesuwamy cały świat tak, żeby rzeka została na środku planszy
// (inaczej po zwężeniu okna rzeka mogłaby uciec poza ekran).
function recenterWorld(oldW) {
  const dx = (W - oldW) / 2;
  for (const s of segments) {
    s.c += dx;
    s.c = Math.max(s.w + 15, Math.min(W - s.w - 15, s.c));   // rzeka musi się zmieścić
  }
  for (const list of [obstacles, rings, cannons, balls, bullets, particles, popups, powerups]) {
    for (const o of list || []) { o.x += dx; if (o.bx !== undefined) o.bx += dx; }
  }
  if (plane) { plane.x += dx; plane.px = plane.x; }
  if (drag) drag = null;
  if (state === 'play') invuln = Math.max(invuln, 1.5);     // chwila ochrony po zmianie okna
}
addEventListener('resize', resize);
document.addEventListener('fullscreenchange', resize);

// Pełny ekran: klawisz F albo przycisk pod grą
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}
document.getElementById('pelnyEkran').addEventListener('click', e => { toggleFullscreen(); e.currentTarget.blur(); });
