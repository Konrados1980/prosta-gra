// Mały serwer do podglądu gry na komputerze: node scripts/serve.js, potem http://localhost:5173
// (gra działa też po dwukrotnym kliknięciu w index.html; serwer przydaje się do testów w przeglądarce).
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const port = Number(process.env.PORT) || 5173;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = path.normalize(path.join(root, url === "/" ? "index.html" : url));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end("Nie znaleziono"); return;
  }
  res.writeHead(200, { "Content-Type": (types[path.extname(file)] || "text/plain") + "; charset=utf-8", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Gra: http://localhost:${port}`));
