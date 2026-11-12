import test from "node:test";
import assert from "node:assert/strict";
import {
  cloneDeck,
  createSlide,
  defaultDeck,
  layouts,
  templates,
  type Layout,
} from "../src/model";
import {
  createScene,
  measureText,
  svgMarkup,
  type Scene,
  type Text,
} from "../src/scene";

const textElements = (scene: Scene) =>
  scene.elements.filter((e): e is Text => e.type === "text");
const tinyPng =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZ1kAAAAASUVORK5CYII=";
const make = (layout: Layout) => {
  const deck = cloneDeck(defaultDeck),
    slide = createSlide(layout);
  deck.slides = [slide];
  return { deck, slide };
};

test("all template scenes are deterministic, in bounds and have no capacity warnings", () => {
  for (const template of templates)
    for (const [i, slide] of template.deck.slides.entries()) {
      const before = JSON.stringify(template.deck);
      const scene = createScene(slide, template.deck, i);
      assert.deepEqual(
        scene,
        createScene(slide, template.deck, i),
        `${template.id} ${i + 1}`,
      );
      assert.equal(JSON.stringify(template.deck), before, "scene is pure");
      assert.deepEqual(scene.warnings, [], `${template.id} ${i + 1}`);
      for (const e of scene.elements) {
        assert.ok(e.x >= 0 && e.y >= 0 && e.w > 0 && e.h > 0);
        assert.ok(e.x + e.w <= 1280.01 && e.y + e.h <= 720.01);
        assert.ok([e.x, e.y, e.w, e.h].every(Number.isFinite));
        if (e.type === "text") {
          assert.ok(!/[\r\n]/.test(e.text), "each text element is one line");
          assert.ok(
            measureText(e.text, e.fontSize, e.font, e.bold) <= e.w + 0.02,
            `${slide.id}: ${e.text}`,
          );
          assert.equal(e.h, Math.round(e.fontSize * 1.18 * 1000) / 1000);
        }
      }
      assert.ok(
        textElements(scene).some((t) => t.bold && t.fontSize >= 58),
        "large academic title",
      );
    }
});

test("every fresh layout is immediately usable, including the image placeholder", () => {
  for (const layout of Object.keys(layouts) as Layout[]) {
    const { slide, deck } = make(layout);
    assert.deepEqual(createScene(slide, deck, 0).warnings, [], layout);
  }
});

test("wrapping preserves all words in order, with fixed exported positions", () => {
  const { deck, slide } = make("bullets");
  slide.items = [
    "Ein sorgfältig formulierter akademischer Gedanke benötigt manchmal mehrere Zeilen und bleibt trotzdem in allen Ausgabeformaten vollständig lesbar.",
  ];
  const scene = createScene(slide, deck, 0);
  assert.deepEqual(scene.warnings, []);
  const content = textElements(scene).filter(
    (e) => e.group === 1 && e.fontSize === 28,
  );
  assert.ok(content.length >= 2);
  assert.equal(content.map((e) => e.text).join(" "), slide.items[0]);
  for (let i = 1; i < content.length; i++)
    assert.ok(Math.abs(content[i].y - content[i - 1].y - 28 * 1.18) < 0.002);
  const svg = svgMarkup(scene);
  for (const e of content)
    assert.ok(
      svg.includes(
        `y="${Math.round((e.y + e.fontSize * 0.92) * 1000) / 1000}"`,
      ),
    );
});

test("overlong words and overflow are explicit and survive screenshots", () => {
  const { deck, slide } = make("bullets");
  slide.items = [
    "W".repeat(400),
    ...Array.from({ length: 10 }, () =>
      "Ein langer Inhalt mit vielen weiteren Erläuterungen. ".repeat(4),
    ),
  ];
  const scene = createScene(slide, deck, 0);
  assert.ok(scene.warnings.some((w) => /Wort/.test(w)));
  assert.ok(scene.warnings.some((w) => /Überlauf/.test(w)));
  assert.ok(
    textElements(scene).some((e) => e.text.startsWith("Layout prüfen:")),
  );
  assert.equal(slide.items[0].length, 400, "no source truncation");
  for (const e of scene.elements)
    assert.ok(e.x + e.w <= 1280.01 && e.y + e.h <= 720.01);
});

test("oversized heading, chapter, source and identity fields never disappear without a warning", () => {
  const { deck, slide } = make("title");
  slide.title = "Eine sehr lange wissenschaftliche Überschrift ".repeat(5);
  slide.section = "Kapitel ".repeat(50);
  slide.source = "Quellenangabe mit Fundstellen ".repeat(55);
  deck.author = "Name ".repeat(30);
  deck.institution = "Hochschule ".repeat(30);
  const scene = createScene(slide, deck, 0);
  for (const field of ["Titel", "Kapitel", "Quellenangabe", "Vortragsangaben"])
    assert.ok(
      scene.warnings.some((w) => w.startsWith(field + ":")),
      field,
    );
});

test("image is contained at native aspect ratio and never cropped or stretched", () => {
  const { deck, slide } = make("image");
  const bytes = Buffer.from(tinyPng.split(",")[1], "base64");
  bytes.writeUInt32BE(400, 16);
  bytes.writeUInt32BE(100, 20);
  slide.image = "data:image/png;base64," + bytes.toString("base64");
  slide.imageAlt = "Breites Beispielbild";
  slide.body = "Bild mit erklärendem Begleittext.";
  const scene = createScene(slide, deck, 0),
    image = scene.elements.find((e) => e.type === "image")!;
  assert.equal(image.type, "image");
  assert.ok(Math.abs(image.w / image.h - 4) < 0.0001);
  assert.ok(image.x > 56 && image.x + image.w < 794);
  assert.ok(image.y > 82 && image.y + image.h <= 616);
  assert.deepEqual(scene.warnings, []);
  slide.layout = "bullets";
  assert.ok(
    createScene(slide, deck, 0).warnings.some((w) =>
      /Bild.*nicht sichtbar/.test(w),
    ),
  );
});

test("chart retains decimal labels, handles zero and exposes every grouped bar", () => {
  const { deck, slide } = make("chart");
  slide.items = ["0 | Keine Beobachtung", "2,50 | Gruppe A", "10 | Gruppe B"];
  const scene = createScene(slide, deck, 0);
  assert.deepEqual(scene.warnings, []);
  const texts = textElements(scene).map((e) => e.text);
  for (const label of [
    "0",
    "2,50",
    "10",
    "Keine Beobachtung",
    "Gruppe A",
    "Gruppe B",
  ])
    assert.ok(texts.includes(label));
  assert.deepEqual(
    [...new Set(scene.elements.map((e) => e.group).filter(Boolean))],
    [1, 2, 3],
  );
  slide.items = ["0 | A", "0 | B"];
  assert.ok(
    createScene(slide, deck, 0).elements.every((e) => Number.isFinite(e.w)),
  );
});

test("code preserves indentation and line breaks, warns rather than truncates a long line", () => {
  const { deck, slide } = make("code");
  slide.body = "const value = 2\n  return value\n\nend";
  const scene = createScene(slide, deck, 0);
  assert.deepEqual(scene.warnings, []);
  const code = textElements(scene).filter(
    (e) => e.font === "Courier New" && e.fontSize === 23,
  );
  assert.deepEqual(
    code.map((e) => e.text),
    slide.body.split("\n"),
  );
  slide.body = "const " + "x".repeat(200);
  assert.ok(
    createScene(slide, deck, 0).warnings.some((w) =>
      /Codezeile 1: Überlauf/.test(w),
    ),
  );
});

test("theme affects every layout; progress can be disabled without changing content", () => {
  const { deck, slide } = make("bullets");
  slide.items = ["Eine kurze Aussage"];
  deck.theme.background = "#ffffff";
  deck.theme.foreground = "#142c29";
  deck.theme.muted = "#52615a";
  deck.theme.primary = "#17685b";
  deck.theme.secondary = "#9c431b";
  deck.theme.font = "Georgia";
  deck.theme.scale = 1.25;
  const scene = createScene(slide, deck, 0);
  assert.equal(scene.background, "#ffffff");
  assert.ok(textElements(scene).every((e) => e.font === "Georgia"));
  assert.ok(textElements(scene).some((e) => e.fontSize === 35));
  assert.deepEqual(scene.warnings, []);
  deck.theme.showProgress = false;
  assert.equal(
    createScene(slide, deck, 0).elements.filter(
      (e) => e.type === "rect" && e.y === 706,
    ).length,
    0,
  );
});

test("SVG escapes user text, image descriptions and attributes and preserves reveal groups", () => {
  const { deck, slide } = make("bullets");
  slide.title = '<script>alert("x")</script>';
  slide.items = ["A & B < C > D \"quoted\" 'apostrophe'"];
  const svg = svgMarkup(createScene(slide, deck, 0));
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.ok(
    svg.includes(
      "A &amp; B &lt; C &gt; D &quot;quoted&quot; &apos;apostrophe&apos;",
    ),
  );
  assert.ok(svg.includes('data-group="1"'));
  const hostile: Scene = {
    background: '" onload="alert(1)',
    warnings: [],
    elements: [
      {
        type: "image",
        x: 1,
        y: 2,
        w: 3,
        h: 4,
        src: 'x" onload="alert(1)',
        alt: "</title><script>x</script>",
        group: 2,
      },
    ],
  };
  const hostileSvg = svgMarkup(hostile);
  assert.ok(!hostileSvg.includes('" onload="'));
  assert.ok(
    hostileSvg.includes("&lt;/title&gt;&lt;script&gt;x&lt;/script&gt;"),
  );
  assert.ok(hostileSvg.includes('data-group="2"'));
});

test("metrics are deterministic for accented, wide, combining and monospace text", () => {
  assert.ok(measureText("WWWW", 28) > measureText("iiii", 28));
  assert.equal(measureText("e\u0301", 28), measureText("e", 28));
  assert.ok(
    measureText("ÄÖÜ", 28, "Georgia", true) > measureText("ÄÖÜ", 28, "Arial"),
  );
  assert.equal(
    measureText("iiii", 24, "Courier New"),
    measureText("WWWW", 24, "Courier New"),
  );
  assert.ok(Number.isFinite(measureText("中文 👩🏽‍🎓", 24)));
});
