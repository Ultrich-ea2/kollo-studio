// Local-only static server. No uploads, telemetry, commands or remote access.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".md": "text/plain; charset=utf-8",
  ".zip": "application/zip",
  ".png": "image/png",
};
const server = http.createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const url = new URL(req.url, "http://localhost");
    let name = decodeURIComponent(url.pathname);
    if (name === "/") name = "/index.html";
    if (name.includes("\\") || name.includes("\0") || name.includes(":"))
      throw new Error("Invalid path");
    const file = path.resolve(root, "." + name);
    const relative = path.relative(root, file);
    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative) ||
      (!["index.html", "favicon.svg", "guide.md"].includes(relative) &&
        !relative.startsWith("assets" + path.sep) &&
        !relative.startsWith("downloads" + path.sep))
    ) {
      res.writeHead(404);
      res.end();
      return;
    }
    const real = await fs.realpath(file);
    if (!real.startsWith(root + path.sep)) throw new Error("Outside root");
    const data = await fs.readFile(real);
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.on("error", () => {
  console.error(
    "Port 4179 ist belegt. Beende das andere lokale Kollo-Studio und starte erneut.",
  );
  process.exitCode = 1;
});
server.listen(4179, "127.0.0.1", () => {
  console.log(
    "\nKollo läuft nur auf diesem Gerät.\nÖffne im Browser: http://127.0.0.1:" +
      server.address().port +
      "\n\nDieses Fenster offen lassen. Beenden: Strg+C.\n",
  );
});
