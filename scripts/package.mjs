import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import JSZip from "jszip";
const root = process.cwd();
const downloads = path.join(root, "dist", "downloads");
await fs.mkdir(downloads, { recursive: true });
const stamp = new Date("2026-01-01T00:00:00Z");
const zipOptions = { date: stamp, createFolders: false };
async function copyTree(zip, base, prefix = "", offlineExamples = false) {
  for (const name of (await fs.readdir(base)).sort()) {
    if (offlineExamples && ["player.js", "vorfuehren.html"].includes(name))
      continue;
    const file = path.join(base, name);
    if ((await fs.stat(file)).isDirectory())
      await copyTree(zip, file, prefix + name + "/", offlineExamples);
    else
      zip.file(
        prefix + name,
        offlineExamples && name === "index.html"
          ? (await fs.readFile(file, "utf8")).replaceAll(
              "/vorfuehren.html",
              "/presentation.html",
            )
          : await fs.readFile(file),
        zipOptions,
      );
  }
}
async function addTree(zip, relative, prefix = "") {
  if (
    relative.split(/[\\/]/).includes("__pycache__") ||
    /\.py[co]$/i.test(relative)
  )
    return;
  const absolute = path.join(root, relative);
  const info = await fs.stat(absolute);
  if (info.isDirectory()) {
    for (const file of (await fs.readdir(absolute)).sort())
      await addTree(zip, path.posix.join(relative, file), prefix);
  } else zip.file(prefix + relative, await fs.readFile(absolute), zipOptions);
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
const examples = new JSZip();
await copyTree(examples, path.join(root, "dist", "examples"), "", true);
examples.file(
  "LICENSE",
  await fs.readFile(path.join(root, "LICENSE")),
  zipOptions,
);
files.push(["kollo-examples.zip", examples]);
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
        zipOptions,
      );
  }
  await copy(name);
}
offline.file(
  "server.mjs",
  await fs.readFile(path.join(root, "scripts", "offline-server.mjs")),
  zipOptions,
);
offline.file(
  "Start-Kollo.cmd",
  '@echo off\r\ncd /d "%~dp0"\r\nwhere node >nul 2>&1\r\nif errorlevel 1 (\r\n echo Bitte zuerst Node.js 24 installieren: https://nodejs.org\r\n pause\r\n exit /b 1\r\n)\r\nnode server.mjs\r\npause\r\n',
  zipOptions,
);
offline.file(
  "START-HIER.txt",
  "Kollo offline\n\nEinmalig Node.js 22 oder neuer installieren (empfohlen: Node.js 24 LTS).\nWindows: ZIP entpacken und Start-Kollo.cmd doppelklicken.\nmacOS/Linux: im entpackten Ordner node server.mjs ausführen.\nLokale Adresse aus dem Terminal im Browser öffnen. Kein npm install nötig.\nDer Server bindet nur an 127.0.0.1 und sendet keine Präsentationen ins Netz.\nProjekt regelmäßig als JSON sichern. Port 4179 bleibt gleich, damit die lokale Sicherung erhalten bleibt.\nDie HTML-Datei deines Vortrags funktioniert direkt per Doppelklick ohne Node.js.\n",
  zipOptions,
);
const manifest = {
  version: JSON.parse(
    await fs.readFile(path.join(root, "package.json"), "utf8"),
  ).version,
  files: [],
};
for (const [name, zip] of files) {
  const bytes = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  await fs.writeFile(path.join(downloads, name), bytes);
  offline.file("downloads/" + name, bytes, zipOptions);
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
const student = new JSZip();
await addTree(student, "skills/kollo-theme/");
await copyTree(student, path.join(root, "dist", "examples"), "examples/", true);
student.file(
  "guides/guide.md",
  await fs.readFile(path.join(root, "public", "guide.md")),
  zipOptions,
);
student.file(
  "LICENSE",
  await fs.readFile(path.join(root, "LICENSE")),
  zipOptions,
);
student.file(
  "source/kollo-studio-source.zip",
  await fs.readFile(path.join(downloads, "kollo-studio-source.zip")),
  zipOptions,
);
for (const name of Object.keys(offline.files).sort()) {
  if (!offline.files[name].dir)
    student.file(
      "studio/" + name,
      await offline.files[name].async("uint8array"),
      zipOptions,
    );
}
student.file(
  "START-HIER.txt",
  `KOLLO / DEIN PRÄSENTATIONSATELIER\n\n1. ZIP vollständig entpacken.\n2. START-HIER.html im Browser öffnen.\n3. examples/index.html zeigt drei fertige Beispiele. HTML läuft direkt, ohne Installation.\n4. studio/Start-Kollo.cmd startet den lokalen Editor unter Windows (Node.js 22+, empfohlen 24 LTS, erforderlich). macOS/Linux: im studio-Ordner node server.mjs.\n5. skills/kollo-theme enthält den vollständigen KI-Skill. SKILL.md ist der Einstieg; die Unterordner zusammenlassen.\n6. source/kollo-studio-source.zip enthält getrennt den vollständigen Quellcode.\n\nDie Beispiele sind fiktiv. Eigene Präsentationen in Kollo immer auch als JSON sichern. Ein Arbeitskit oder JSON enthält Sprechernotizen; vor dem Weitergeben prüfen. Der Skill führt nichts automatisch aus und lädt keine KI.\n\nFenster für Vortrag und Teleprompter manuell auf getrennte Bildschirme ziehen. Das Hauptfenster muss geöffnet bleiben. Das ist eine Synchronisation auf diesem Rechner, keine Verbindung zu einem zweiten Gerät.\n\nOffline bedeutet: Die Beispiele benötigen kein Netz. Der Editor benötigt eine lokale Node.js-Installation, aber kein npm install. Der KI-Skill benötigt eine KI-Umgebung deiner Wahl.\n`,
  zipOptions,
);
student.file(
  "START-HIER.html",
  `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Kollo — Dein Präsentationsatelier</title><style>*{box-sizing:border-box}body{margin:0;padding:7vw;background:#f4f0e6;color:#173c31;font:17px/1.65 Arial,sans-serif;max-width:1400px}small{font-size:12px;letter-spacing:.14em}h1{font-size:clamp(45px,8vw,100px);line-height:1;letter-spacing:-.06em;margin:24px 0}h1 em{font:italic 1em Georgia,serif}header p{max-width:670px}main{margin-top:60px}section{display:grid;grid-template-columns:90px 1fr;gap:20px;border-top:1px solid #b5bfaa;padding:30px 0}b{font:italic 48px Georgia,serif}h2{margin:0;font-size:30px;letter-spacing:-.035em}p{max-width:900px}a{color:inherit;text-underline-offset:5px}a:focus-visible{outline:3px solid #af482e;outline-offset:5px}code{background:#e1e5d5;padding:3px 6px;font-size:15px}footer{border-top:1px solid #b5bfaa;margin-top:35px;padding-top:20px;font-size:14px}@media(max-width:600px){section{grid-template-columns:45px 1fr;gap:10px}b{font-size:32px}}</style></head><body><header><small>KOLLO / STUDENTEN-KIT</small><h1>Dein Gedanke.<br><em>Deine Regie.</em></h1><p>Ein vollständiger Arbeitsplatz für deinen nächsten Vortrag. Beginne mit einem Beispiel, einem leeren Blatt oder einem Gespräch mit deiner KI.</p></header><main><section><b>01</b><div><h2>Erst einmal ansehen.</h2><p>Drei eigenständige Gestaltungen. Öffne die Beispiele direkt, teste die Einblendungen und trenne den Teleprompter vom Publikumsbild. Die Inhalte und Zahlen sind fiktiv.</p><a href="examples/index.html">Die Beispielsammlung öffnen →</a></div></section><section><b>02</b><div><h2>Selber bauen.</h2><p>Im Ordner <code>studio</code> liegt der fertige Editor. Installiere einmal Node.js 22 oder neuer (empfohlen: 24 LTS). Windows: <code>Start-Kollo.cmd</code> doppelklicken. macOS/Linux: im studio-Ordner <code>node server.mjs</code> ausführen. Die im Terminal angezeigte lokale Adresse öffnen. Kein npm install erforderlich.</p><p>Unter „Vorlagen“ ein leeres Projekt anlegen oder eine Projektdatei aus examples importieren. Regelmäßig als JSON sichern. Öffne studio/index.html nicht direkt per Doppelklick; der Editor benötigt den lokalen Server.</p><a href="studio/START-HIER.txt">Offline-Anleitung lesen →</a></div></section><section><b>03</b><div><h2>Deiner KI das Handwerk geben.</h2><p>Der vollständige Ordner <code>skills/kollo-theme</code> gehört zusammen. Gib der KI den Skill und deine freigegebenen Materialien. Er unterstützt neue Vorträge, bestehende Folien, Demos, Sprechtexte und die Prüfung der Ausgabe. Die KI liefert eine .kollo.json, die du im Studio öffnen kannst. Das Kit selbst enthält keinen KI-Dienst.</p><a href="skills/kollo-theme/SKILL.md">Skill-Einstieg →</a> · <a href="skills/kollo-theme/references/task-prompts.md">Beispielaufträge →</a></div></section><section><b>04</b><div><h2>Bis ins Detail verändern.</h2><p>In <code>source/kollo-studio-source.zip</code> liegen Anwendung, Presenter, Layout-Engine, Exporte, Tests und Build-Skripte. Für Änderungen am Quellcode: entpacken, Node.js installieren, <code>npm ci --ignore-scripts</code>, dann <code>npm run dev</code>. Nur dieser Weg benötigt eine Paketinstallation.</p><a href="source/kollo-studio-source.zip" download>Quellcode entpacken →</a> · <a href="guides/guide.md">Vollständige Anleitung →</a></div></section></main><footer><p>Privates bleibt privat: Die Beispiele sind frei teilbar. Eigene JSON-Dateien und Arbeitskits enthalten Sprechernotizen. Prüfe sie vor dem Versenden. Separate Fenster laufen auf demselben Rechner; das steuernde Hauptfenster muss offen bleiben. Es gibt keine Spracherkennung und keine automatische Synchronisation zu deiner Stimme.</p><p>HTML zeigt die Browseranimationen. PowerPoint-Dateien enthalten editierbare Texte und Formen mit einfachen Übergängen; einzelne Einblendungen werden nicht übernommen. Prüfe das gewünschte Exportformat auf deinem Vortragsgerät.</p></footer></body></html>`,
  zipOptions,
);
const studentBytes = await student.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 9 },
});
await fs.writeFile(path.join(downloads, "kollo-student-kit.zip"), studentBytes);
manifest.files.push({
  file: "kollo-student-kit.zip",
  size: studentBytes.length,
  sha256: crypto.createHash("sha256").update(studentBytes).digest("hex"),
});
await fs.writeFile(
  path.join(downloads, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  "Download packages:",
  manifest.files.map((f) => `${f.file} (${f.size} bytes)`).join(", "),
);
