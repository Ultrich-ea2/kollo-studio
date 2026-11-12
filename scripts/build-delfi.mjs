import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { mountPresenter } from "../src/presenter/runtime.mjs";
import { presenterCss } from "../src/presenter/styles.ts";

const source = fileURLToPath(new URL("../showcases/delfi/", import.meta.url));
const hash = (value) => createHash("sha256").update(value).digest("hex");
const escapeHtml = (text) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

export function validatePhases(content, plan) {
  if (plan.scenes?.length !== content.scenes.length)
    throw new Error("DELFI phase plan is incomplete");
  return content.scenes.map((scene, index) => {
    const phase = plan.scenes[index];
    if (
      phase.id !== scene.id ||
      phase.originalSpeechSha256 !== hash(scene.speech)
    )
      throw new Error(`DELFI speech provenance differs: ${scene.id}`);
    const count = phase.stops?.length;
    if (
      !count ||
      phase.starts?.length !== count ||
      phase.labels?.length !== count ||
      phase.offsets?.length !== count
    )
      throw new Error(`DELFI phase lengths differ: ${scene.id}`);
    if (
      !Number.isFinite(phase.start) ||
      phase.start < scene.start ||
      phase.start >= scene.end
    )
      throw new Error(`DELFI baseline outside scene: ${scene.id}`);
    let previous = phase.start;
    let offset = -1;
    for (let i = 0; i < count; i++) {
      const from = phase.starts[i],
        to = phase.stops[i],
        at = phase.offsets[i];
      if (
        !Number.isFinite(from) ||
        !Number.isFinite(to) ||
        from < previous ||
        to <= from ||
        to >= scene.end
      )
        throw new Error(`DELFI phase outside scene: ${scene.id}/${i}`);
      if (
        !Number.isInteger(at) ||
        at <= offset ||
        at < 0 ||
        at >= scene.speech.length ||
        (at && !/\s/.test(scene.speech[at - 1]))
      )
        throw new Error(`DELFI speech offset invalid: ${scene.id}/${i}`);
      if (typeof phase.labels[i] !== "string" || !phase.labels[i].trim())
        throw new Error(`DELFI phase label missing: ${scene.id}/${i}`);
      previous = to;
      offset = at;
    }
    let notes = scene.speech;
    for (const at of [...phase.offsets].reverse())
      notes = notes.slice(0, at) + "\n[KLICK]\n" + notes.slice(at);
    if (index < content.scenes.length - 1) notes += "\n[FOLIE]";
    if (notes.replace(/\n\[(?:KLICK|FOLIE)\](?:\n|$)/g, "") !== scene.speech)
      throw new Error("DELFI speech reconstruction failed");
    return { phase, notes };
  });
}

/** One presenter for SVG decks and the original video's manually gated phases. */
export async function buildDelfi(destinationFolder) {
  const names = [
    "template.html",
    "style.css",
    "player.js",
    "content.json",
    "phases.json",
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
  const content = JSON.parse(files["content.json"]);
  const plan = JSON.parse(files["phases.json"]);
  const provenance = JSON.parse(files["provenance.json"]);
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
  )
    throw new Error("DELFI original scene timing is incomplete");
  if (
    plan.version !== 1 ||
    plan.source?.videoSha256 !== provenance.video_sha256 ||
    plan.source?.originalSha256 !== provenance.original_sha256 ||
    plan.source?.duration !== content.duration
  )
    throw new Error("DELFI phase source provenance differs");
  const reviewed = validatePhases(content, plan);
  const slides = await Promise.all(
    content.scenes.map(async (scene, index) => {
      const poster = await fs.readFile(
        path.join(source, "frames", `${scene.id}.jpg`),
      );
      const { phase, notes } = reviewed[index];
      return {
        title: scene.title.replace(/\s+/g, " "),
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img"><title>${escapeHtml(scene.title)}</title><image width="1280" height="720" href="data:image/jpeg;base64,${poster.toString("base64")}" /></svg>`,
        notes,
        reveal: true,
        transition: "none",
        seconds: scene.duration,
        media: {
          start: phase.start,
          starts: phase.starts,
          stops: phase.stops,
          labels: phase.labels,
        },
      };
    }),
  );
  const style = presenterCss + "\n" + files["style.css"].toString("utf8");
  const script = (
    mountPresenter.toString() +
    "\n" +
    files["player.js"].toString("utf8")
  ).replace(/\r\n?/g, "\n");
  if (/<\/script/i.test(script) || /<\/style/i.test(style))
    throw new Error("Unsafe inline asset terminator");
  const scriptHash = createHash("sha256").update(script).digest("base64");
  const render = (offline) => {
    const config = {
      title: content.title,
      duration: content.duration / 60,
      showNotes: true,
      css: presenterCss,
      slides,
      media: {
        src: offline
          ? `data:video/mp4;base64,${files["presentation.mp4"].toString("base64")}`
          : "./presentation.mp4",
        poster: offline
          ? `data:image/jpeg;base64,${files["preview.jpg"].toString("base64")}`
          : "./preview.jpg",
      },
    };
    const policy = offline
      ? `default-src 'none'; script-src 'sha256-${scriptHash}'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`
      : "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
    const replacements = {
      CSP: `<meta http-equiv="Content-Security-Policy" content="${policy}">`,
      STYLES: offline
        ? `<style>${style}</style>`
        : '<link rel="stylesheet" href="./style.css">',
      CONTENT: `<script type="application/json" id="presenter-data">${JSON.stringify(config).replaceAll("<", "\\u003c")}</script>`,
      PLAYER: offline
        ? `<script>${script}</script>`
        : '<script src="./player.js"></script>',
      DELIVERY_NOTE: offline
        ? "Diese einzelne Datei enthält das Originalvideo und funktioniert offline."
        : 'Für einen Vortrag ohne Internet: <a href="./presentation.html" download>HTML für unterwegs herunterladen</a>.',
      PHASE_COUNT: String(
        reviewed.reduce((sum, { phase }) => sum + phase.stops.length, 0),
      ),
    };
    return files["template.html"]
      .toString("utf8")
      .replace(/\{\{([A-Z_]+)\}\}/g, (_placeholder, name) => {
        if (!(name in replacements))
          throw new Error(`Unknown DELFI template field: ${name}`);
        return replacements[name];
      });
  };
  await fs.mkdir(destinationFolder, { recursive: true });
  for (const name of [
    "presentation.mp4",
    "preview.jpg",
    "provenance.json",
    "phases.json",
  ])
    await fs.writeFile(path.join(destinationFolder, name), files[name]);
  await fs.writeFile(path.join(destinationFolder, "style.css"), style);
  await fs.writeFile(path.join(destinationFolder, "player.js"), script);
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
    scenes: slides.length,
    phases: reviewed.reduce((n, { phase }) => n + phase.stops.length, 0),
    title: content.title,
  };
}
