import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { showcaseExamples } from "../src/examples";
import {
  cloneDeck,
  createSlide,
  defaultDeck,
  layouts,
  parseDeck,
  type Layout,
} from "../src/model";
import { createScene, measureText, svgMarkup } from "../src/scene";

test("all showcases fit the artboard and preserve every visible title and content field", () => {
  for (const example of showcaseExamples) {
    assert.deepEqual(parseDeck(example.deck), example.deck);
    for (const [index, slide] of example.deck.slides.entries()) {
      const scene = createScene(slide, example.deck, index);
      assert.deepEqual(scene.warnings, [], `${example.id}/${slide.id}`);
      const text = scene.elements.filter((e) => e.type === "text");
      for (const e of text)
        assert.ok(
          measureText(e.text, e.fontSize, e.font, e.bold) <= e.w + 0.02,
          `${slide.id}: ${e.text}`,
        );
      for (const e of scene.elements) {
        assert.ok(
          e.x >= 0 && e.y >= 0 && e.x + e.w <= 1280.01 && e.y + e.h <= 720.01,
        );
      }
      const visible = text
        .map((e) => e.text)
        .join(" ")
        .replace(/\s+/g, " ");
      assert.ok(visible.includes(slide.title.replace(/\s+/g, " ")), slide.id);
      assert.ok(
        visible.includes("Fiktives Lehrbeispiel"),
        "examples identify their evidence status on each slide",
      );
      assert.ok(!svgMarkup(scene).includes("<script"));
    }
  }
});

test("composition is optional and old decks retain their exact data and rendering", () => {
  const old = cloneDeck(defaultDeck);
  const parsed = parseDeck(JSON.stringify(old));
  assert.deepEqual(parsed, old);
  assert.equal(Object.hasOwn(parsed.theme, "composition"), false);
  const explicit = cloneDeck(old);
  explicit.theme.composition = "classic";
  old.slides.forEach((slide, i) =>
    assert.deepEqual(
      createScene(slide, old, i),
      createScene(slide, explicit, i),
    ),
  );
  for (const composition of ["editorial", "technical", "stage"] as const) {
    const changed = cloneDeck(old);
    changed.theme.composition = composition;
    assert.deepEqual(parseDeck(changed), changed);
    for (const layout of Object.keys(layouts) as Layout[]) {
      const slide = createSlide(layout);
      changed.slides = [slide];
      assert.deepEqual(
        createScene(slide, changed, 0).warnings,
        [],
        `${composition}/${layout}`,
      );
    }
  }
});

test("technical code reveals complete blocks while the starting data stays visible", () => {
  const example = showcaseExamples.find((e) => e.id === "signalweg")!;
  for (const index of [2, 3]) {
    const scene = createScene(example.deck.slides[index], example.deck, index);
    const code = scene.elements.filter(
      (e) => e.type === "text" && e.font === "Courier New" && e.fontSize === 23,
    );
    assert.ok(
      code.some(
        (e) =>
          e.type === "text" &&
          e.text === "const prices = [];" &&
          e.group === undefined,
      ),
    );
    assert.ok(
      code
        .filter(
          (e) =>
            e.type === "text" &&
            e.text.trim() &&
            e.text !== "const prices = [];",
        )
        .every((e) => e.group === 1),
    );
  }
  const scene = createScene(example.deck.slides[1], example.deck, 1);
  const groups = new Set(scene.elements.map((e) => e.group).filter(Boolean));
  assert.deepEqual(
    [...groups].sort(),
    [1, 2, 3],
    "a pipeline builds in three connected steps",
  );
});

test("portable and app validators agree on composition extension boundaries", () => {
  const python = process.platform === "win32" ? "python" : "python3";
  const root = fileURLToPath(new URL("../", import.meta.url));
  const candidates: unknown[] = [
    "classic",
    "editorial",
    "technical",
    "stage",
    "",
    "stage\n",
    "STAGE",
    null,
    false,
    0,
    [],
    {},
    "custom",
  ];
  const decks = candidates.map((value) => {
    const d = cloneDeck(defaultDeck);
    (d.theme as unknown as Record<string, unknown>).composition = value;
    return d;
  });
  const app = decks.map((d) => {
    try {
      parseDeck(d);
      return true;
    } catch {
      return false;
    }
  });
  assert.deepEqual(
    app,
    candidates.map((_, i) => i < 4),
  );
  const result = spawnSync(
    python,
    [
      "-B",
      "-c",
      "import sys,json;sys.path.insert(0,sys.argv[1]);from validate_deck import validate_deck;print(json.dumps([not validate_deck(d) for d in json.load(sys.stdin)]))",
      path.join(root, "skills/kollo-theme/scripts"),
    ],
    { input: JSON.stringify(decks), encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), app);
});
