import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const source = fileURLToPath(new URL("../showcases/delfi/", import.meta.url));
const hash = (value) => createHash("sha256").update(value).digest("hex");

/** Build the original 6:32 DELFI example, hosted and as a single offline file. */
export async function buildDelfi(destinationFolder) {
  const names = [
    "template.html",
    "style.css",
    "player.js",
    "content.json",
    "presentation.mp4",
    "preview.jpg",
    "provenance.json",
  ];
  const files = Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [
        name,
        await fs.readFile(path.join(source, name)),
      ]),
    ),
  );
  const content = JSON.parse(files["content.json"].toString("utf8"));
  const provenance = JSON.parse(files["provenance.json"].toString("utf8"));
  // Refuse partial or silently substituted original media in a release.
  for (const [name, expected] of [
    ["presentation.mp4", provenance.video_sha256],
    ["preview.jpg", provenance.poster_sha256],
  ]) {
    if (hash(files[name]) !== expected)
      throw new Error(`DELFI original asset differs: ${name}`);
  }
  if (
    content.duration !== 392 ||
    content.scenes.length !== 16 ||
    content.scenes.some(
      (scene, index) =>
        scene.start !== (index ? content.scenes[index - 1].end : 0) ||
        scene.end !== scene.start + scene.duration ||
        typeof scene.speech !== "string" ||
        !scene.speech.trim(),
    ) ||
    content.scenes.at(-1).end !== content.duration
  ) {
    throw new Error("DELFI original scene timing is incomplete");
  }
  const template = files["template.html"].toString("utf8");
  const script = files["player.js"].toString("utf8");
  const style = files["style.css"].toString("utf8");
  if (/<\/script/i.test(script) || /<\/style/i.test(style))
    throw new Error("Unsafe inline asset terminator");
  const contentBlock = `<script type="application/json" id="content-data">${JSON.stringify(content).replaceAll("<", "\\u003c")}</script>`;
  const scriptHash = createHash("sha256").update(script).digest("base64");
  const render = (offline) => {
    const policy = offline
      ? `default-src 'none'; script-src 'sha256-${scriptHash}'; style-src 'unsafe-inline'; img-src data:; media-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`
      : "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
    const replacements = {
      CSP: `<meta http-equiv="Content-Security-Policy" content="${policy}">`,
      STYLES: offline
        ? `<style>${style}</style>`
        : '<link rel="stylesheet" href="./style.css">',
      VIDEO: offline
        ? `data:video/mp4;base64,${files["presentation.mp4"].toString("base64")}`
        : "./presentation.mp4",
      POSTER: offline
        ? `data:image/jpeg;base64,${files["preview.jpg"].toString("base64")}`
        : "./preview.jpg",
      CONTENT: contentBlock,
      PLAYER: offline
        ? `<script>${script}</script>`
        : '<script src="./player.js"></script>',
      DELIVERY_NOTE: offline
        ? "Diese einzelne Datei enthält das komplette Video und funktioniert offline."
        : 'Für einen Vortrag ohne Internet: <a href="./presentation.html" download>HTML für unterwegs herunterladen</a>. Die Datei enthält das komplette Video.',
    };
    let result = template.replace(
      /\{\{([A-Z_]+)\}\}/g,
      (_placeholder, name) => {
        if (!(name in replacements))
          throw new Error(`Unknown DELFI template field: ${name}`);
        return replacements[name];
      },
    );
    if (/\{\{[A-Z_]+\}\}/.test(result))
      throw new Error("Unresolved DELFI template field");
    return result;
  };
  await fs.mkdir(destinationFolder, { recursive: true });
  for (const name of [
    "style.css",
    "player.js",
    "presentation.mp4",
    "preview.jpg",
    "provenance.json",
  ]) {
    await fs.writeFile(path.join(destinationFolder, name), files[name]);
  }
  await fs.writeFile(
    path.join(destinationFolder, "vorfuehren.html"),
    render(false),
  );
  await fs.writeFile(
    path.join(destinationFolder, "presentation.html"),
    render(true),
  );
  await fs.copyFile(
    path.join(source, "GESTALTUNG.md"),
    path.join(destinationFolder, "GESTALTUNG.md"),
  );
  return {
    duration: content.duration,
    scenes: content.scenes.length,
    title: content.title,
  };
}
