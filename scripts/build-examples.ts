import fs from "node:fs/promises";
import path from "node:path";
import { showcaseExamples } from "../src/examples";
import { exportHtml, exportPptx } from "../src/exports";
import { createScene, svgMarkup } from "../src/scene";
import JSZip from "jszip";
import { buildDelfi } from "./build-delfi.mjs";

const root = path.resolve("dist/examples");
await fs.mkdir(root, { recursive: true });
const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const entries: string[] = [];
await buildDelfi(path.join(root, "delfi"));
entries.push(
  `<article data-kind="original"><a href="delfi/vorfuehren.html"><img src="delfi/preview.jpg" alt="Titelszene der DELFI-Originalpräsentation"></a><div><small>ORIGINALDEMO · 6:32 MINUTEN · 16 SZENEN</small><h2>PyTutorAI / DELFI</h2><p>Feedback, das den nächsten Schritt erklärt. Die Originalanimationen, Demo und Sprechtexte mit manuellen Klicksignalen von Ultrich Edima Edima mit André Greubel.</p><p>Video ohne Ton mit manuellen Animationsphasen, Klicksignalen im Sprechtext und separatem Publikumsfenster. Ein Anschauungsbeispiel; keine bearbeitbare Kollo- oder PowerPoint-Datei.</p><nav><a href="delfi/vorfuehren.html">Original vorführen & Teleprompter →</a><a href="delfi/presentation.html" download>HTML für unterwegs</a><a href="delfi/GESTALTUNG.md">Gestaltung & Herkunft</a></nav></div></article>`,
);
for (const example of showcaseExamples) {
  const folder = path.join(root, example.id);
  await fs.mkdir(folder, { recursive: true });
  const scenes = example.deck.slides.map((slide, index) =>
    createScene(slide, example.deck, index),
  );
  const warnings = scenes.flatMap((scene, index) =>
    scene.warnings.map((warning) => `${example.id}/${index + 1}: ${warning}`),
  );
  if (warnings.length) throw new Error(warnings.join("\n"));
  const standalone = await (await exportHtml(example.deck)).text();
  await fs.writeFile(path.join(folder, "presentation.html"), standalone);
  // The hosted site disallows inline scripts. Keep that policy intact while
  // retaining the single-file HTML for downloads and the offline archives.
  const scriptStart = standalone.lastIndexOf("<script>");
  const scriptEnd = standalone.indexOf("</script>", scriptStart);
  if (scriptStart < 0 || scriptEnd < 0)
    throw new Error("Standalone player script missing");
  await fs.writeFile(
    path.join(folder, "player.js"),
    standalone.slice(scriptStart + 8, scriptEnd),
  );
  const hosted = (
    standalone.slice(0, scriptStart) +
    '<script src="./player.js"></script>' +
    standalone.slice(scriptEnd + 9)
  ).replace(/script-src 'sha256-[^']+'/, "script-src 'self'");
  await fs.writeFile(path.join(folder, "vorfuehren.html"), hosted);
  await fs.writeFile(
    path.join(folder, "deck.kollo.json"),
    JSON.stringify(example.deck, null, 2) + "\n",
  );
  await fs.writeFile(path.join(folder, "preview.svg"), svgMarkup(scenes[0]));
  // Editable shapes and text, no browser-only effects. Open and verify on target device.
  const rawPptx = await JSZip.loadAsync(
    await (await exportPptx(example.deck, "editable")).arrayBuffer(),
  );
  const stablePptx = new JSZip();
  for (const name of Object.keys(rawPptx.files).sort()) {
    const entry = rawPptx.files[name];
    if (entry.dir) continue;
    const data =
      name === "docProps/core.xml"
        ? (await entry.async("string")).replace(
            /(<dcterms:(?:created|modified)[^>]*>)[^<]*(<\/dcterms:(?:created|modified)>)/g,
            (_match, opening, closing) =>
              `${opening}2026-01-01T00:00:00Z${closing}`,
          )
        : await entry.async("uint8array");
    stablePptx.file(name, data, {
      date: new Date("2026-01-01T00:00:00Z"),
      createFolders: false,
    });
  }
  await fs.writeFile(
    path.join(folder, "bearbeitbar.pptx"),
    await stablePptx.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    }),
  );
  await fs.writeFile(
    path.join(folder, "GESTALTUNG.md"),
    `# ${example.name}\n\n${example.description}\n\n${example.designNotes.map((note) => `- ${note}`).join("\n")}\n\nAlle Inhalte und Zahlen sind fiktives Übungsmaterial. Keine Forschungsbefunde.\n\n- presentation.html: direkt im Browser öffnen, schrittweise Einblendungen und getrennte Fenster ausprobieren. Enthält die fiktiven Sprechernotizen. Das Hauptfenster offen lassen.\n- deck.kollo.json: bearbeitbares Original in Kollo importieren.\n- bearbeitbar.pptx: editierbare Texte und Formen. Einblendungen erscheinen vollständig; einfache Folienübergänge bleiben erhalten. Schriftumbrüche am Zielgerät prüfen.\n- preview.svg: statische Übersicht der ersten Folie.\n\nDie HTML-Datei bleibt die Referenz für die Browseranimationen.\n`,
  );
  entries.push(
    `<article><a href="${example.id}/vorfuehren.html"><img src="${example.id}/preview.svg" alt="Titelfolie ${escape(example.name)}"></a><div><h2>${escape(example.name)}</h2><p>${escape(example.description)}</p><nav><a href="${example.id}/vorfuehren.html">Vorführen & Teleprompter →</a><a href="${example.id}/presentation.html" download>HTML für unterwegs</a><a href="${example.id}/deck.kollo.json" download>Projektdatei</a><a href="${example.id}/bearbeitbar.pptx" download>PowerPoint</a><a href="${example.id}/GESTALTUNG.md">Gestaltung</a></nav></div></article>`,
  );
}
await fs.writeFile(
  path.join(root, "index.html"),
  `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' file:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Kollo: Vorlagen & Originaldemo</title><style>*{box-sizing:border-box}body{margin:0;padding:6vw;background:#f4f0e6;color:#173c31;font:17px/1.6 Arial,sans-serif}header{max-width:850px;margin-bottom:60px}small{letter-spacing:.14em;font-size:12px}h1{font-size:clamp(44px,8vw,96px);line-height:1;letter-spacing:-.06em;margin:24px 0}h1 em{font-family:Georgia,serif;font-weight:400}article{display:grid;grid-template-columns:1.4fr 1fr;gap:35px;padding:35px 0;border-top:1px solid #b7bcae}img{width:100%;display:block}h2{font-size:34px;letter-spacing:-.04em;line-height:1.1}nav{display:flex;gap:12px 20px;flex-wrap:wrap}a{color:inherit;text-underline-offset:5px}a:focus-visible{outline:3px solid #a84424;outline-offset:5px}footer{margin-top:50px;font-size:14px;max-width:900px}@media(max-width:800px){article{grid-template-columns:1fr;gap:10px}}</style></head><body><header><small>KOLLO / BEISPIELSAMMLUNG</small><h1>Inspiration.<br><em>In Bewegung.</em></h1><p>Öffne ein Beispiel, blättere durch die Folien und probiere den Teleprompter aus. Keine Installation, kein Internet erforderlich. Drei frei bearbeitbare Vorlagen mit fiktiven Inhalten und eine ausdrücklich freigegebene Originaldemo: PyTutorAI / DELFI (6:32).</p></header>${entries.join("")}<footer><p>Die drei Vorlagen vorführen: Pfeile oder Leertaste. Mit „Teleprompter öffnen“ den privaten Sprechtext abtrennen; „Publikumsfenster öffnen“ zeigt nur die Folien. Das Hauptfenster bleibt die Steuerzentrale und muss offen bleiben. Fenster manuell auf die gewünschten Bildschirme ziehen. Die Browser müssen Pop-ups erlauben.</p><p>DELFI: Mit „Abtrennen“ das reine Video öffnen. Leertaste startet oder pausiert, die Pfeiltasten wechseln die Szene. Das Hauptfenster enthält den synchronen Sprechtext und bleibt offen.</p><p>Die drei Vorlagen enthalten PowerPoint mit bearbeitbaren Texten und Formen, aber nicht die schrittweisen Browseranimationen. Auf dem Vortragsgerät prüfen. Die DELFI-Demo bewahrt das Originalvideo und seine Sprechtexte mit manuellen Klicksignalen; sie enthält keine Projektdatei oder PowerPoint. Für neue Inhalte eine Projektdatei der drei Vorlagen in Kollo öffnen oder den mitgelieferten KI-Skill nutzen.</p></footer></body></html>`,
);
console.log(
  `Generated ${showcaseExamples.length} editable examples plus the original DELFI video demonstration.`,
);
await fs.copyFile(
  "src/example-assets/campus-plan.svg",
  path.join(root, "spielraum", "campus-plan.svg"),
);
