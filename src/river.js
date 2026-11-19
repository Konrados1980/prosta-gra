// rzeka: odcinki, szerokość, wyspy, sprawdzanie wody
// ===== Rzeka =====
// Każdy odcinek ma: c = środek, w = połowa szerokości, iw = połowa szerokości wyspy (0 = brak)
function makeSegment(i) {
  // na szerszym ekranie rzeka jest trochę szersza (najwyżej 1,4 raza)
  const k = Math.max(1, Math.min(1.4, Math.sqrt(W / MIN_W)));
  if (i < 4) return { c: W / 2, w: 180 * k, iw: 0 };
  const hard = Math.min(i / 120, 1);                 // trudność rośnie z dystansem
  const prev = segments[i - 1];
  // połowa szerokości rzeki: najmniej 110 (cała rzeka min. 220), zmienia się łagodnie,
  // najwyżej o 35 na odcinek, więc nie ma nagłych zwężeń
  const want = (RIVER_MIN_HALF + Math.random() * (110 - 40 * hard)) * k;
  const w = Math.max(RIVER_MIN_HALF * k, Math.max(prev.w - 35 * k, Math.min(prev.w + 35 * k, want)));
  const margin = 15;
  // środek przesuwa się najwyżej o 80 px na odcinek, żeby dało się nadążyć za zakrętem
  const minC = w + margin, maxC = W - w - margin;
  // i jest lekko ściągany w stronę środka ekranu, żeby rzeka nie uciekała pod sam brzeg planszy
  const drift = (Math.random() * 2 - 1) * 80 + (W / 2 - prev.c) * 0.15;
  const c = Math.max(minC, Math.min(maxC, prev.c + Math.max(-80, Math.min(80, drift))));
  let iw = 0;
  // wyspa tylko na szerokiej rzece; każda odnoga obok wyspy ma co najmniej CHANNEL_MIN
  if (w >= 160 * k && Math.random() < 0.5 + 0.2 * hard) iw = Math.min(w * 0.35, w - CHANNEL_MIN * k);
  return { c, w, iw };
}
const RIVER_MIN_HALF = 110;   // najwęższa rzeka: 2 × 110 = 220 jednostek
const CHANNEL_MIN = 100;      // najwęższa odnoga przy wyspie
function seg(i) {
  i = Math.max(0, i);       // przed startem (poniżej ekranu) rzeka wygląda jak na początku
  while (segments.length <= i) segments.push(makeSegment(segments.length));
  return segments[i];
}
function riverAt(wy) {
  const i = Math.floor(wy / SEG);
  let t = (wy - i * SEG) / SEG;
  t = t * t * (3 - 2 * t);                           // płynne przejście
  const a = seg(i), b = seg(i + 1);
  return { c: a.c + (b.c - a.c) * t, w: a.w + (b.w - a.w) * t, iw: a.iw + (b.iw - a.iw) * t };
}
function inWater(x, wy) {
  const r = riverAt(wy), d = Math.abs(x - r.c);
  return d < r.w && (r.iw < 1 || d > r.iw);   // iw < 1 = brak wyspy
}
// Losowy punkt w wodzie (w lewym lub prawym kanale, jeśli jest wyspa)
function randomWaterX(wy, pad) {
  const r = riverAt(wy);
  if (r.iw < 3) return r.c - r.w + pad + Math.random() * Math.max(0, 2 * (r.w - pad));
  const chW = r.w - r.iw - 2 * pad;
  const left = Math.random() < 0.5;
  const start = left ? r.c - r.w + pad : r.c + r.iw + pad;
  return start + Math.random() * Math.max(0, chW);
}
