import PptxGenJS from "pptxgenjs";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { parseDeck, type Deck, type Slide } from "./model";
import { createScene, svgMarkup, type Scene } from "./scene";
import { presenterCss } from "./presenter/styles";

const WIDTH = 1280;
const HEIGHT = 720;
const RASTER_SCALE = 2;
const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const XML_END = "</p:clrMapOvr></p:sld>";

export const exportDisclosure =
  "HTML: Übergänge und schrittweise Einblendungen. PowerPoint: bearbeitbare Objekte oder Folienbilder; nur einfache Folienübergänge, Zoom wird zu Überblenden. PDF: statische Folienbilder. In PowerPoint und PDF sind alle Inhalte im Endzustand sichtbar. Arial/Georgia und für Code Courier New müssen auf dem Zielgerät vorhanden sein. Enthaltene Notizen sind in HTML, PPTX und Projektdatei lesbar; sie sind kein geschütztes Geheimnis.";

const exportGuide = `# Kollo: Exporthinweise\n\n${exportDisclosure}\n\n- presentation.html funktioniert ohne Internet. Öffnen Sie die Datei im Browser.\n- Rechts/Leertaste: nächste Einblendung oder Folie. Links: zurück. Pos1/Ende: erste/letzte Folie.\n- „Publikumsfenster öffnen“ zeigt nur die Folien. „Teleprompter öffnen“ zeigt private Notizen, die aktuelle und nächste Folie; beide Fenster sind mit dieser Steuerung synchron. Fenster auf die gewünschten Bildschirme ziehen. Pop-ups müssen erlaubt sein. Das Hauptfenster offen halten.\n- Beim Öffnen ist die Leseführung pausiert. Rechts/Weiter startet sie beim neuen Abschnitt bis zum nächsten Klicksignal; dort wartet sie. Manuelles Scrollen oder Pause hält sie an, der nächste Vorwärtsschritt startet sie erneut. Links, Pos1/Ende und direkte Folienwahl lassen sie pausiert. Das Tempo ist einstellbar, ohne Spracherkennung. Folien werden manuell gewechselt. Das Publikumsfenster enthält keine Schaltflächen; F funktioniert dort weiterhin.\n- N zeigt ausdrücklich die gegebenenfalls mitgelieferten privaten Notizen. Diese sind im Dateiquelltext enthalten.\n- T startet/pausiert den Vortragstimer, R setzt ihn zurück, F schaltet Vollbild um.\n- Beim Drucken werden alle Folien im Endzustand und ohne Notizen ausgegeben. Wählen Sie bei Bedarf Querformat, keine Ränder und Hintergrundgrafiken.\n- deck.kollo.json ist die bearbeitbare Sicherung, einschließlich aller an den Export übergebenen Notizen und Bilder.\n- PPTX-Schriftmetriken können von der Browseransicht abweichen. Prüfen Sie Ihre Folien auf dem Vortragsgerät.\n- PDF und visuelles PPTX bestehen aus hochauflösenden Bildern: Text ist dort nicht als Text bearbeitbar/durchsuchbar.\n- Der Skill enthält Anleitung und einen optionalen Prüfer. Das Öffnen des Kits führt den Prüfer nicht aus.\n`;

type ResourceMap = Record<string, string>;
// Vite replaces these literal glob calls at build time. The catch permits pure
// exporter tests in Node; a missing production resource fails exportKit clearly.
const bundledResources: ResourceMap = (() => {
  try {
    return {
      ...import.meta.glob(
        [
          "/skills/kollo-theme/**/*.{md,py,json,yaml,svg}",
          "/skills/kollo-theme/LICENSE",
        ],
        {
          query: "?raw",
          import: "default",
          eager: true,
        },
      ),
      ...import.meta.glob("/public/guide.md", {
        query: "?raw",
        import: "default",
        eager: true,
      }),
    } as ResourceMap;
  } catch {
    return {};
  }
})();

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

function binaryBlob(bytes: Uint8Array, mime: string): Blob {
  return new Blob([new Uint8Array(bytes).buffer], { type: mime });
}

function prepare(deck: Deck): { deck: Deck; scenes: Scene[] } {
  const clean = parseDeck(deck);
  const scenes = clean.slides.map((slide, index) =>
    createScene(slide, clean, index),
  );
  const problems = scenes.flatMap((scene, i) =>
    scene.warnings.map((w) => `Folie ${i + 1}: ${w}`),
  );
  if (problems.length)
    throw new Error(
      `Export angehalten. Bitte zuerst das Layout prüfen:\n${problems.join("\n")}`,
    );
  return { deck: clean, scenes };
}

function requireBrowser(): void {
  if (typeof document === "undefined")
    throw new Error(
      "Dieser Bildexport benötigt einen Browser mit Canvas-Unterstützung.",
    );
}

async function imageFromSource(source: string): Promise<HTMLImageElement> {
  requireBrowser();
  const image = new Image();
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(
        new Error(
          "Ein Folienbild konnte nicht geladen werden. Bitte prüfen Sie das Bildformat.",
        ),
      );
    image.src = source;
  });
  if (
    !image.naturalWidth ||
    !image.naturalHeight ||
    image.naturalWidth > 16384 ||
    image.naturalHeight > 16384 ||
    image.naturalWidth * image.naturalHeight > 40_000_000
  ) {
    throw new Error(
      "Ein Bild ist leer oder zu groß (maximal 40 Megapixel und 16.384 Pixel je Seite).",
    );
  }
  return image;
}

function canvas(
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  requireBrowser();
  const node = document.createElement("canvas");
  node.width = width;
  node.height = height;
  const context = node.getContext("2d");
  if (!context)
    throw new Error(
      "Der Browser kann keine Folienbilder erzeugen. Bitte versuchen Sie einen aktuellen Browser.",
    );
  return { canvas: node, context };
}

async function scenePng(scene: Scene): Promise<string> {
  requireBrowser();
  await document.fonts?.ready;
  // SVG image decoding can otherwise silently omit a broken nested image.
  for (const element of scene.elements)
    if (element.type === "image") await imageFromSource(element.src);
  const source = URL.createObjectURL(
    new Blob([svgMarkup(scene)], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = await imageFromSource(source);
    const target = canvas(WIDTH * RASTER_SCALE, HEIGHT * RASTER_SCALE);
    target.context.fillStyle = scene.background;
    target.context.fillRect(0, 0, target.canvas.width, target.canvas.height);
    target.context.drawImage(
      image,
      0,
      0,
      target.canvas.width,
      target.canvas.height,
    );
    return target.canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(source);
  }
}

async function powerPointImage(source: string): Promise<string> {
  // Build-time examples run in Node. prepare() has already checked the data URI,
  // signature, byte and dimension bounds; PptxGenJS accepts PNG/JPEG directly.
  // This is header validation, not a pixel decode. Published examples are also
  // rendered in a real browser/PowerPoint during release verification.
  if (
    typeof Image === "undefined" &&
    typeof process !== "undefined" &&
    process.versions?.node &&
    /^data:image\/(?:png|jpeg);base64,/.test(source)
  )
    return source;
  const image = await imageFromSource(source);
  if (!source.startsWith("data:image/webp;")) return source;
  const target = canvas(image.naturalWidth, image.naturalHeight);
  target.context.drawImage(image, 0, 0);
  return target.canvas.toDataURL("image/png");
}

export function assertSafeZipPath(path: string): void {
  if (
    !path ||
    path.startsWith("/") ||
    /^[A-Za-z]:/.test(path) ||
    /[\\\u0000-\u001f]/.test(path) ||
    path.split("/").some((p) => p === "." || p === "..")
  ) {
    throw new Error("Unsicherer Dateipfad im Exportpaket.");
  }
}

/** Patch only freshly generated upstream PptxGenJS packages, never user ZIPs. */
export async function patchPptxTransitions(
  raw: Blob,
  transitions: Slide["transition"][],
): Promise<Blob> {
  const zip = await JSZip.loadAsync(await raw.arrayBuffer(), {
    checkCRC32: true,
  });
  for (const [path, entry] of Object.entries(zip.files)) {
    assertSafeZipPath(path);
    const original = (entry as typeof entry & { unsafeOriginalName?: string })
      .unsafeOriginalName;
    if (original !== undefined && original !== path)
      throw new Error("Veränderter Dateipfad im PowerPoint-Paket.");
  }
  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(path),
  );
  if (
    !zip.file("[Content_Types].xml") ||
    !zip.file("ppt/presentation.xml") ||
    slidePaths.length !== transitions.length
  ) {
    throw new Error("Das PowerPoint-Paket hat eine unerwartete Struktur.");
  }
  for (let i = 0; i < transitions.length; i++) {
    const effect = transitions[i];
    if (!["none", "fade", "slide", "zoom"].includes(effect))
      throw new Error("Unbekannter PowerPoint-Übergang.");
    const path = `ppt/slides/slide${i + 1}.xml`;
    const entry = zip.file(path);
    if (!entry) throw new Error("Eine PowerPoint-Folie fehlt im Export.");
    const xml = await entry.async("string");
    if (
      !xml.includes(XML_END) ||
      /<p:(?:transition|timing)\b/.test(xml) ||
      xml.indexOf(XML_END) !== xml.lastIndexOf(XML_END)
    ) {
      throw new Error(
        "Unbekannte PowerPoint-Folienstruktur; der Übergang wurde nicht eingefügt.",
      );
    }
    if (effect === "none") continue;
    const child = effect === "slide" ? '<p:push dir="l"/>' : "<p:fade/>";
    zip.file(
      path,
      xml.replace(
        XML_END,
        `</p:clrMapOvr><p:transition spd="med" advClick="1">${child}</p:transition></p:sld>`,
      ),
    );
  }
  return binaryBlob(
    await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
    PPTX_MIME,
  );
}

export async function exportPptx(
  input: Deck,
  mode: "editable" | "visual",
): Promise<Blob> {
  if (!["editable", "visual"].includes(mode))
    throw new Error("Unbekannter PowerPoint-Exportmodus.");
  const { deck, scenes } = prepare(input);
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "KOLLO", width: WIDTH / 96, height: HEIGHT / 96 });
  pptx.layout = "KOLLO";
  pptx.author = deck.author;
  pptx.subject = "Kollo – Präsentation";
  pptx.title = deck.title;
  pptx.company = deck.institution;
  pptx.theme = { headFontFace: deck.theme.font, bodyFontFace: deck.theme.font };
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const slide = pptx.addSlide();
    slide.background = { color: scene.background.replace("#", "") };
    if (mode === "visual") {
      slide.addImage({
        data: await scenePng(scene),
        x: 0,
        y: 0,
        w: WIDTH / 96,
        h: HEIGHT / 96,
        altText: deck.slides[i].title,
      });
    } else {
      for (const [index, element] of scene.elements.entries()) {
        const position = {
          x: element.x / 96,
          y: element.y / 96,
          w: element.w / 96,
          h: element.h / 96,
        };
        if (element.type === "text") {
          slide.addText(element.text, {
            ...position,
            margin: 0,
            breakLine: false,
            wrap: false,
            valign: "top",
            fontFace: element.font || deck.theme.font,
            fontSize: element.fontSize * 0.75,
            color: element.color.replace("#", ""),
            bold: element.bold || false,
            align: element.align || "left",
            paraSpaceAfter: 0,
            lineSpacingMultiple: 1,
            objectName: `Text ${index + 1}`,
            lang: "de-DE",
          });
        } else if (element.type === "rect") {
          slide.addShape(
            element.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect,
            {
              ...position,
              fill: { color: element.fill.replace("#", "") },
              line: element.stroke
                ? { color: element.stroke.replace("#", ""), width: 0.75 }
                : { transparency: 100 },
              ...(element.radius ? { rectRadius: element.radius / 96 } : {}),
              objectName: `Form ${index + 1}`,
            },
          );
        } else {
          slide.addImage({
            ...position,
            data: await powerPointImage(element.src),
            altText: element.alt,
            objectName: `Bild ${index + 1}`,
          });
        }
      }
    }
    if (deck.slides[i].notes) slide.addNotes(deck.slides[i].notes);
  }
  const raw = await pptx.write({ outputType: "uint8array", compression: true });
  if (!(raw instanceof Uint8Array))
    throw new Error("PowerPoint konnte nicht erzeugt werden.");
  return patchPptxTransitions(
    binaryBlob(raw, PPTX_MIME),
    deck.slides.map((slide) => slide.transition),
  );
}

export async function exportPdf(input: Deck): Promise<Blob> {
  const { deck, scenes } = prepare(input);
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [960, 540],
    compress: true,
  });
  pdf.setProperties({
    title: deck.title,
    author: deck.author,
    subject: "Kollo – statische Präsentation",
    creator: "Kollo Studio",
  });
  for (let i = 0; i < scenes.length; i++) {
    if (i) pdf.addPage([960, 540], "landscape");
    pdf.addImage(
      await scenePng(scenes[i]),
      "PNG",
      0,
      0,
      960,
      540,
      undefined,
      "FAST",
    );
  }
  return pdf.output("blob");
}

// Use the original dependency-free source, never a bundler-transformed function
// .toString(): transpilers can insert helpers outside that function's closure.
const presenterSource: string | undefined = (() => {
  try {
    return Object.values(
      import.meta.glob("/src/presenter/runtime.mjs", {
        query: "?raw",
        import: "default",
        eager: true,
      }),
    )[0] as string | undefined;
  } catch {
    return undefined;
  }
})();
async function playerScript(): Promise<string> {
  let source = presenterSource;
  if (!source && typeof process !== "undefined" && process.versions?.node) {
    // Node is used only by build-time example generation and exporter tests.
    const moduleName = "node:fs/promises";
    const files = await import(/* @vite-ignore */ moduleName);
    const relative = "./presenter/runtime.mjs";
    source = await files.readFile(
      new URL(/* @vite-ignore */ relative, import.meta.url),
      "utf8",
    );
  }
  if (!source || !source.includes("export function mountPresenter("))
    throw new Error("Der Präsentationsplayer fehlt. Bitte Kollo neu bauen.");
  source = source.replace(
    "export function mountPresenter(",
    "function mountPresenter(",
  );
  if (/<\/script/i.test(source)) throw new Error("Unsichere Player-Ressource.");
  return `(() => {\n${source}\nconst root = document.getElementById('kollo-player');
const slides = [...root.querySelectorAll('.slide')].map(section => ({
  title: section.dataset.title,
  svg: section.querySelector('svg').outerHTML,
  notes: section.querySelector('template').content.textContent,
  reveal: section.dataset.reveal === 'true',
  transition: section.dataset.transition,
  seconds: Number(section.dataset.seconds)
}));
mountPresenter(root, {slides, title:root.dataset.title, duration:Number(root.dataset.duration), css:document.getElementById('kollo-player-style').textContent});
})();`;
}

async function scriptHash(script: string): Promise<string> {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      "Sicherer HTML-Export ist in diesem Browserkontext nicht verfügbar. Bitte HTTPS oder localhost verwenden.",
    );
  const hash = new Uint8Array(
    await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(script),
    ),
  );
  return btoa(String.fromCharCode(...hash));
}

export async function exportHtml(input: Deck): Promise<Blob> {
  const { deck, scenes } = prepare(input);
  const slides = scenes
    .map(
      (scene, i) =>
        `<section class="slide" role="group" aria-roledescription="Folie" aria-label="${i + 1}: ${escapeHtml(deck.slides[i].title)}" aria-current="${i === 0}" aria-hidden="${i !== 0}" data-title="${escapeHtml(deck.slides[i].title)}" data-transition="${deck.slides[i].transition}" data-reveal="${deck.slides[i].reveal}" data-seconds="${deck.slides[i].seconds}">${svgMarkup(scene)}<template>${escapeHtml(deck.slides[i].notes)}</template></section>`,
    )
    .join("\n");
  const script = (await playerScript()).replace(/\r\n?/g, "\n");
  const hash = await scriptHash(script);
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>${escapeHtml(deck.title)} – Kollo</title><style id="kollo-player-style">${presenterCss}</style><style>html,body{margin:0;background:#13161e}</style></head>
<body><div id="kollo-player" class="kollo-presenter" data-title="${escapeHtml(deck.title)}" data-duration="${deck.duration}"><main class="stage" aria-label="Präsentation">${slides}</main></div><noscript>Für Einblendungen und synchronisierte Fenster ist JavaScript nötig. Die Folien lassen sich weiterhin drucken.</noscript><script>${script}</script></body></html>`;
  return new Blob([html], { type: "text/html;charset=utf-8" });
}

/** Resources are bundled trusted text files, never content from a project. */
export async function createKitArchive(
  input: Deck,
  resources: ResourceMap,
): Promise<Blob> {
  const { deck } = prepare(input);
  const normalized: ResourceMap = {};
  for (const [original, text] of Object.entries(resources)) {
    const path = original.startsWith("/public/")
      ? original.slice("/public/".length)
      : original.replace(/^\//, "");
    assertSafeZipPath(path);
    if (path !== "guide.md" && !path.startsWith("skills/kollo-theme/"))
      throw new Error("Unerwartete Ressource im Offline-Kit.");
    if (typeof text !== "string" || Object.hasOwn(normalized, path))
      throw new Error("Ungültige oder doppelte Ressource im Offline-Kit.");
    normalized[path] = text;
  }
  if (!normalized["guide.md"] || !normalized["skills/kollo-theme/SKILL.md"])
    throw new Error(
      "Die Kit-Anleitung oder der Skill fehlt. Bitte die App neu bauen.",
    );
  const zip = new JSZip();
  zip.file("presentation.html", await (await exportHtml(deck)).text());
  zip.file("deck.kollo.json", JSON.stringify(deck, null, 2));
  zip.file("EXPORTS.md", exportGuide);
  for (const [path, text] of Object.entries(normalized)) zip.file(path, text);
  return binaryBlob(
    await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
    "application/zip",
  );
}

export async function exportKit(deck: Deck): Promise<Blob> {
  return createKitArchive(deck, bundledResources);
}

export function downloadBlob(blob: Blob, filename: string): void {
  requireBrowser();
  if (!filename || /[\\/\u0000-\u001f]/.test(filename))
    throw new Error("Ungültiger Download-Dateiname.");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}
