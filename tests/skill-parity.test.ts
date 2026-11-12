import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDeck, type Deck } from "../src/model";

const root = fileURLToPath(new URL("../", import.meta.url));
const validator = path.join(
  root,
  "skills/kollo-theme/scripts/validate_deck.py",
);
const python = process.platform === "win32" ? "python" : "python3";
const available =
  spawnSync(python, ["--version"], { encoding: "utf8" }).status === 0;
const original = fs.readFileSync(
  path.join(root, "skills/kollo-theme/assets/beispiel.kollo.json"),
  "utf8",
);
type Case = { name: string; raw: string; valid: boolean };

function cases(): Case[] {
  const values: Case[] = [
    { name: "bundled example", raw: original, valid: true },
  ];
  const change = (name: string, valid: boolean, edit: (deck: Deck) => void) => {
    const deck = JSON.parse(original) as Deck;
    edit(deck);
    values.push({ name, raw: JSON.stringify(deck), valid });
  };
  values.push({
    name: "single file BOM",
    raw: "\uFEFF" + original,
    valid: true,
  });
  values.push({
    name: "double file BOM",
    raw: "\uFEFF\uFEFF" + original,
    valid: false,
  });
  values.push({ name: "malformed JSON", raw: "{", valid: false });
  values.push({ name: "top array", raw: "[]", valid: false });
  for (const ending of ["\n", "\r", "\r\n", "\u2028", "\u2029"]) {
    change("strict id " + JSON.stringify(ending), false, (d) => {
      d.slides[0].id += ending;
    });
    change("strict color " + JSON.stringify(ending), false, (d) => {
      d.theme.primary += ending;
    });
  }
  change("extra key", false, (d) => {
    (d as any).script = "not executed";
  });
  change("prototype key", false, (d) => {
    Object.defineProperty(d, "__proto__", {
      value: { unsafe: true },
      enumerable: true,
    });
  });
  change("missing notes", false, (d) => {
    delete (d.slides[0] as any).notes;
  });
  change("duplicate IDs", false, (d) => {
    d.slides[1].id = d.slides[0].id;
  });
  change("zero slides", false, (d) => {
    d.slides = [];
  });
  change("eighty slides", true, (d) => {
    d.slides = Array.from({ length: 80 }, (_, i) => ({
      ...d.slides[0],
      id: "slide-" + i,
    }));
  });
  change("eighty-one slides", false, (d) => {
    d.slides = Array.from({ length: 81 }, (_, i) => ({
      ...d.slides[0],
      id: "slide-" + i,
    }));
  });
  for (const duration of [1, 240, 1.5, 0, 241])
    change("duration " + duration, duration === 1 || duration === 240, (d) => {
      d.duration = duration;
    });
  change("boolean duration", false, (d) => {
    (d as any).duration = true;
  });
  for (const scale of [0.8, 1.25, 0.79, 1.251])
    change("scale " + scale, scale >= 0.8 && scale <= 1.25, (d) => {
      d.theme.scale = scale;
    });
  for (const seconds of [0, 3600, -1, 3601, 0.5])
    change("seconds " + seconds, seconds === 0 || seconds === 3600, (d) => {
      d.slides[0].seconds = seconds;
    });
  change("emoji exact UTF16 boundary", true, (d) => {
    d.title = "😀".repeat(100);
  });
  change("emoji exceeds UTF16 boundary", false, (d) => {
    d.title = "😀".repeat(100) + "x";
  });
  change("unpaired surrogate", false, (d) => {
    d.slides[0].notes = "\uD800";
  });
  change("forbidden control", false, (d) => {
    d.slides[0].notes = "\u0000";
  });
  change("all text preserved", true, (d) => {
    d.slides[0].notes = "  École / œuvre / €\n👩🏽‍🎓\tEnde ";
  });
  change("thirteen items", false, (d) => {
    d.slides[0].items = Array(13).fill("Punkt");
  });
  change("three columns", false, (d) => {
    d.slides[0].layout = "columns";
    d.slides[0].items = ["A", "B", "C"];
  });
  for (const [item, valid] of [
    ["12,50 | A", true],
    ["0 | A", true],
    ["-1 | A", false],
    ["1e3 | A", false],
    ["1 | A | B", false],
    ["1 | ", false],
    ["1. | A", false],
    ["\uFEFF12 | A", true],
    ["12 | \uFEFF", false],
    ["\u008512 | A", false],
    ["12 | \u0085", true],
  ] as const)
    change("chart " + JSON.stringify(item), valid, (d) => {
      d.slides[0].layout = "chart";
      d.slides[0].items = [item];
    });
  change("stats unit", true, (d) => {
    d.slides[0].layout = "stats";
    d.slides[0].items = ["42 % | Anteil"];
  });
  const png = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(png);
  png.write("IHDR", 12);
  png.writeUInt32BE(1, 16);
  png.writeUInt32BE(1, 20);
  const pngUri = "data:image/png;base64," + png.toString("base64");
  change("PNG header", true, (d) => {
    d.slides[0].image = pngUri;
  });
  for (const ending of ["\n", "\r", "\u2028", "\u2029"])
    change("strict image " + JSON.stringify(ending), false, (d) => {
      d.slides[0].image = pngUri + ending;
    });
  change("non-multiple4 base64", false, (d) => {
    d.slides[0].image = pngUri + "=";
  });
  change("wrong image MIME", false, (d) => {
    d.slides[0].image = pngUri.replace("image/png", "image/jpeg");
  });
  change("remote image", false, (d) => {
    d.slides[0].image = "https://example.invalid/image.png";
  });
  change("SVG image", false, (d) => {
    d.slides[0].image = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
  });
  const jpg = Buffer.from([
    255, 216, 255, 192, 0, 8, 8, 0, 20, 0, 30, 1, 255, 217,
  ]);
  change("JPEG header", true, (d) => {
    d.slides[0].image = "data:image/jpeg;base64," + jpg.toString("base64");
  });
  change("duplicate JPEG SOI", false, (d) => {
    d.slides[0].image =
      "data:image/jpeg;base64," +
      Buffer.concat([jpg.subarray(0, 2), jpg]).toString("base64");
  });
  const giant = Buffer.from(png);
  giant.writeUInt32BE(4097, 16);
  change("image edge limit", false, (d) => {
    d.slides[0].image = "data:image/png;base64," + giant.toString("base64");
  });
  return values;
}

function pythonResults(values: Case[]) {
  const code = `
import importlib.util,json,pathlib,sys,tempfile
sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('kollo_validator',sys.argv[1]);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
results=[]
with tempfile.TemporaryDirectory(prefix='kollo-parity-') as temporary:
 for i,case in enumerate(json.loads(sys.stdin.buffer.read().decode('utf-8'))):
  file=pathlib.Path(temporary)/str(i);file.write_text(case['raw'],encoding='utf-8')
  try:
   errors=module.validate_deck(module.load_deck(file));results.append({'name':case['name'],'valid':not errors,'errors':errors[:2]})
  except (ValueError,UnicodeError,RecursionError,OverflowError) as exc:
   results.append({'name':case['name'],'valid':False,'errors':[str(exc)]})
print(json.dumps(results,ensure_ascii=True))
`;
  const result = spawnSync(python, ["-B", "-c", code, validator], {
    encoding: "utf8",
    input: JSON.stringify(values),
    maxBuffer: 2 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as {
    name: string;
    valid: boolean;
    errors: string[];
  }[];
}

test(
  "portable Python validator and TypeScript model agree on synthetic boundary/security fixtures",
  { skip: !available },
  (t) => {
    const values = cases(),
      python = pythonResults(values);
    assert.equal(values.length, python.length);
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      let jsValid = true;
      try {
        parseDeck(value.raw);
      } catch {
        jsValid = false;
      }
      assert.equal(jsValid, value.valid, "TypeScript " + value.name);
      assert.equal(
        python[i].valid,
        value.valid,
        "Python " + value.name + ": " + python[i].errors.join("; "),
      );
    }
    t.diagnostic(
      `${values.length} shared JSON boundary/security fixtures checked in both runtimes.`,
    );
  },
);

test(
  "duplicate JSON keys are deliberately stricter in the Python file loader",
  { skip: !available },
  () => {
    const raw = original.replace(
      /"version"\s*:\s*1/,
      '"version":1,"version":1',
    );
    assert.doesNotThrow(() => parseDeck(raw)); // JSON.parse keeps the final value.
    const [result] = pythonResults([
      { name: "duplicate version", raw, valid: false },
    ]);
    assert.equal(result.valid, false);
    assert.match(result.errors.join(" "), /Doppelter/);
  },
);

test(
  "portable validator and advisory reviewer Python regression suite",
  { skip: !available },
  () => {
    const result = spawnSync(
      python,
      ["-B", path.join(root, "tests/test_skill_validator.py")],
      { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /Ran [1-9]\d* tests/);
  },
);
