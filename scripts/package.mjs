import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import JSZip from "jszip";
const root = process.cwd();
const downloads = path.join(root, "dist", "downloads");
await fs.mkdir(downloads, { recursive: true });
const stamp = new Date("2026-01-01T00:00:00Z");
async function addTree(zip, relative, prefix = "") {
  const absolute = path.join(root, relative);
  const info = await fs.stat(absolute);
  if (info.isDirectory()) {
    for (const file of (await fs.readdir(absolute)).sort())
      await addTree(zip, path.posix.join(relative, file), prefix);
  } else
    zip.file(prefix + relative, await fs.readFile(absolute), { date: stamp });
}
const skill = new JSZip();
await addTree(skill, "skills/kollo-theme/");
const source = new JSZip();
for (const file of [
  "src",
  "public",
  "skills",
  "scripts",
  "tests",
  "docs",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "playwright.config.ts",
  "index.html",
  "vercel.json",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  ".gitignore",
  ".github",
]) {
  try {
    await addTree(source, file, "kollo-studio/");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}
const files = [
  ["kollo-theme.zip", skill],
  ["kollo-studio-source.zip", source],
];
const offline = new JSZip();
for (const name of ["index.html", "favicon.svg", "guide.md", "assets"]) {
  async function copy(rel) {
    const abs = path.join(root, "dist", rel);
    const st = await fs.stat(abs);
    if (st.isDirectory()) {
      for (const child of (await fs.readdir(abs)).sort())
        await copy(path.posix.join(rel, child));
    } else
      offline.file(
        rel,
        rel === "index.html"
          ? (await fs.readFile(abs, "utf8")).replace(
              "<html ",
              '<html data-offline="true" ',
            )
          : await fs.readFile(abs),
        { date: stamp },
      );
  }
  await copy(name);
}
offline.file(
  "server.mjs",
  await fs.readFile(path.join(root, "scripts", "offline-server.mjs")),
  { date: stamp },
);
offline.file(
  "Start-Kollo.cmd",
  '@echo off\r\ncd /d "%~dp0"\r\nwhere node >nul 2>&1\r\nif errorlevel 1 (\r\n echo Bitte zuerst Node.js 24 installieren: https://nodejs.org\r\n pause\r\n exit /b 1\r\n)\r\nnode server.mjs\r\npause\r\n',
  { date: stamp },
);
offline.file(
  "START-HIER.txt",
  "Kollo offline\n\nEinmalig Node.js 22 oder neuer installieren (empfohlen: Node.js 24 LTS).\nWindows: ZIP entpacken und Start-Kollo.cmd doppelklicken.\nmacOS/Linux: im entpackten Ordner node server.mjs ausführen.\nLokale Adresse aus dem Terminal im Browser öffnen. Kein npm install nötig.\nDer Server bindet nur an 127.0.0.1 und sendet keine Präsentationen ins Netz.\nProjekt regelmäßig als JSON sichern. Port 4179 bleibt gleich, damit die lokale Sicherung erhalten bleibt.\nDie HTML-Datei deines Vortrags funktioniert direkt per Doppelklick ohne Node.js.\n",
  { date: stamp },
);
const manifest = { version: "1.0.0", files: [] };
for (const [name, zip] of files) {
  const bytes = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  await fs.writeFile(path.join(downloads, name), bytes);
  offline.file("downloads/" + name, bytes, { date: stamp });
  manifest.files.push({
    file: name,
    size: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  });
}
const offlineBytes = await offline.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 9 },
});
await fs.writeFile(
  path.join(downloads, "kollo-studio-offline.zip"),
  offlineBytes,
);
manifest.files.push({
  file: "kollo-studio-offline.zip",
  size: offlineBytes.length,
  sha256: crypto.createHash("sha256").update(offlineBytes).digest("hex"),
});
await fs.writeFile(
  path.join(downloads, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  "Download packages:",
  manifest.files.map((f) => `${f.file} (${f.size} bytes)`).join(", "),
);
