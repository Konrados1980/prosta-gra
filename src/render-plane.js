// rysowanie gwiazdek, napisów z punktami i samolotu
// Pięcioramienna gwiazdka, która się obraca i lekko pulsuje
function drawStar(x, y, size, angle) {
  const s = size * (1 + 0.1 * Math.sin(angle * 2));
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  ctx.shadowColor = '#fff59d'; ctx.shadowBlur = 12;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s : s * 0.45;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd54a'; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#f57f17'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

// Napisy "+25", "+10" unoszące się po zdobyciu punktów
function drawPopups() {
  ctx.textAlign = 'center';
  for (const p of popups) {
    const grow = 1 + 0.8 * Math.max(0, (p.life - 0.85) / 0.15);   // na początku większy
    ctx.font = `bold ${Math.round(p.size * grow)}px system-ui, sans-serif`;
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = '#000'; ctx.fillText(p.text, p.x + 1, p.y + 1);
    ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

// Nowoczesny odrzutowiec widziany z góry (nosem do góry). sx = zwężenie skrzydeł przy przechyle.
function jetPath(part, sx) {
  ctx.beginPath();
  if (part === 'body') {            // smukły kadłub ze szpiczastym nosem
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(3, -18, 4.5, -10, 4.5, -2);
    ctx.lineTo(4, 12); ctx.lineTo(2.5, 16); ctx.lineTo(-2.5, 16); ctx.lineTo(-4, 12);
    ctx.lineTo(-4.5, -2);
    ctx.bezierCurveTo(-4.5, -10, -3, -18, 0, -22);
  }
  if (part === 'wings') {           // skrzydła w kształcie delty, odchylone do tyłu
    ctx.moveTo(4, -6); ctx.lineTo(18 * sx, 7); ctx.lineTo(18 * sx, 10); ctx.lineTo(4, 7);
    ctx.closePath(); ctx.moveTo(-4, -6); ctx.lineTo(-18 * sx, 7); ctx.lineTo(-18 * sx, 10); ctx.lineTo(-4, 7);
  }
  if (part === 'canards') {         // małe przednie skrzydełka
    ctx.moveTo(3.5, -12); ctx.lineTo(8 * sx, -8); ctx.lineTo(3.8, -7);
    ctx.closePath(); ctx.moveTo(-3.5, -12); ctx.lineTo(-8 * sx, -8); ctx.lineTo(-3.8, -7);
  }
  if (part === 'tail') {            // statecznik z tyłu
    ctx.moveTo(3, 9); ctx.lineTo(9 * sx, 15); ctx.lineTo(9 * sx, 17); ctx.lineTo(2.5, 15.5);
    ctx.closePath(); ctx.moveTo(-3, 9); ctx.lineTo(-9 * sx, 15); ctx.lineTo(-9 * sx, 17); ctx.lineTo(-2.5, 15.5);
  }
  ctx.closePath();
}

function drawPlane() {
  if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return;   // miganie podczas ochrony
  const { x, y } = plane, roll = plane.roll || 0;
  const sx = 1 - Math.abs(roll) * 0.28;                // przechylone skrzydła wyglądają na krótsze

  // Cień na wodzie (przesunięty, jakby słońce świeciło z lewej góry)
  ctx.save();
  ctx.translate(x + 16, y + 24); ctx.scale(0.85, 0.85); ctx.rotate(roll * 0.15);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  for (const p of ['wings', 'tail', 'canards', 'body']) { jetPath(p, sx); ctx.fill(); }
  ctx.restore();

  ctx.save();
  ctx.translate(x, y); ctx.rotate(roll * 0.15);

  // Płomień z silnika (dłuższy, gdy lecisz do przodu)
  const flame = 9 + Math.random() * 5 + (plane.boost || 0) * 8;
  const fg = ctx.createLinearGradient(0, 15, 0, 15 + flame);
  fg.addColorStop(0, '#ffffff'); fg.addColorStop(0.25, '#ffeb3b'); fg.addColorStop(0.6, '#ff9800'); fg.addColorStop(1, 'rgba(255,87,34,0)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(-2.6, 15.5); ctx.quadraticCurveTo(0, 15 + flame * 1.1, 2.6, 15.5); ctx.fill();

  // Skrzydła i statecznik: szare z jaśniejszą krawędzią
  const wg = ctx.createLinearGradient(0, -6, 0, 12);
  wg.addColorStop(0, '#b0bec5'); wg.addColorStop(1, '#607d8b');
  ctx.fillStyle = wg; ctx.strokeStyle = '#37474f'; ctx.lineWidth = 0.8; ctx.lineJoin = 'round';
  jetPath('wings', sx); ctx.fill(); ctx.stroke();
  jetPath('tail', sx); ctx.fill(); ctx.stroke();
  jetPath('canards', sx); ctx.fill(); ctx.stroke();
  // pomarańczowe końcówki skrzydeł
  ctx.fillStyle = '#ff6d00';
  ctx.fillRect(18 * sx - 2.5, 6.5, 2.5, 3.5); ctx.fillRect(-18 * sx, 6.5, 2.5, 3.5);

  // Kadłub: biało-srebrny, z cieniowaniem z boków
  const bg = ctx.createLinearGradient(-5, 0, 5, 0);
  bg.addColorStop(0, '#90a4ae'); bg.addColorStop(0.45, '#ffffff'); bg.addColorStop(1, '#78909c');
  ctx.fillStyle = bg; ctx.strokeStyle = '#455a64';
  jetPath('body', sx); ctx.fill(); ctx.stroke();
  // pomarańczowy pas wzdłuż kadłuba
  ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, 13); ctx.stroke();

  // Kabina pilota: szklana, z odblaskiem
  const cg = ctx.createLinearGradient(0, -16, 0, -5);
  cg.addColorStop(0, '#b3e5fc'); cg.addColorStop(0.5, '#0288d1'); cg.addColorStop(1, '#01579b');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.ellipse(0, -10, 2.4, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.beginPath(); ctx.ellipse(-0.8, -12, 0.7, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
