import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const source = path.resolve("showcases/delfi");
const sha = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");

test("DELFI preserves the original 392-second video, poster, credits and 16 contiguous scenes", async () => {
  const content = JSON.parse(
    await fs.readFile(path.join(source, "content.json"), "utf8"),
  );
  const provenance = JSON.parse(
    await fs.readFile(path.join(source, "provenance.json"), "utf8"),
  );
  const video = await fs.readFile(path.join(source, "presentation.mp4"));
  assert.equal(video.byteLength, 8280949);
  assert.equal(
    sha(video),
    "c909e7b75744d132dd56524d0e88b9c536f69d9ab239cdb5080bdac43710096b",
  );
  assert.equal(
    sha(await fs.readFile(path.join(source, "preview.jpg"))),
    "b3ba2e61bdc40f0e3ff665f224fa91f6e67de7827057487e5aac0ea7acf52c42",
  );
  assert.equal(content.presenter, "Ultrich Edima Edima");
  assert.equal(content.collaborator, "André Greubel");
  // Canonical JSON fingerprint independently compared with the original HTML.
  // This protects every original speech, visual cue and scene timing, not just counts.
  assert.equal(
    sha(JSON.stringify(content)),
    "ddb2449897be2e77b0c8a8d4fbd2ac99324f136cceb8e8490afe7e20c4f11d7c",
  );
  assert.equal(content.duration, 392);
  assert.equal(content.scenes.length, 16);
  let time = 0;
  for (const scene of content.scenes) {
    assert.equal(scene.start, time);
    assert.equal(scene.end, scene.start + scene.duration);
    assert.ok(scene.speech.length > 100);
    time = scene.end;
  }
  assert.equal(time, 392);
  assert.equal(
    provenance.original_sha256,
    "4299dcf2a341c369fe2987022e3341a303782d9a24714b45cb86e41db871e2a3",
  );
  assert.equal(provenance.original_filename, "PyTutorAI_DELFI.html");
  assert.doesNotMatch(
    JSON.stringify(provenance),
    /C:[\\/]|Users[\\/]|Downloads[\\/]/,
  );
});

test("DELFI builds one shared presenter with exact media, original narration and a restrictive CSP", async () => {
  const { buildDelfi } = await import(
    pathToFileURL(path.resolve("scripts/build-delfi.mjs")).href
  );
  const destination = await fs.mkdtemp(
    path.join(os.tmpdir(), "kollo-delfi-test-"),
  );
  try {
    const result = await buildDelfi(destination);
    assert.equal(result.duration, 392);
    assert.equal(result.scenes, 16);
    const original = JSON.parse(
      await fs.readFile(path.join(source, "content.json"), "utf8"),
    );
    const plan = JSON.parse(
      await fs.readFile(path.join(source, "phases.json"), "utf8"),
    );
    assert.equal(
      result.phases,
      plan.scenes.reduce(
        (total: number, scene: { stops: number[] }) =>
          total + scene.stops.length,
        0,
      ),
    );
    const offline = await fs.readFile(
      path.join(destination, "presentation.html"),
      "utf8",
    );
    const hosted = await fs.readFile(
      path.join(destination, "vorfuehren.html"),
      "utf8",
    );
    const scripts = [
      ...offline.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g),
    ];
    assert.equal(scripts.length, 2);
    assert.match(scripts[0][1], /type="application\/json"/);
    assert.match(scripts[0][1], /id="presenter-data"/);
    const config = JSON.parse(scripts[0][2]);
    assert.equal(config.title, original.title);
    assert.equal(config.duration, 392 / 60);
    assert.equal(config.showNotes, true);
    assert.equal(config.slides.length, 16);
    for (let index = 0; index < original.scenes.length; index++) {
      const slide = config.slides[index],
        scene = original.scenes[index],
        phase = plan.scenes[index];
      assert.equal(
        slide.notes.replace(/\n\[(?:KLICK|FOLIE)\](?:\n|$)/g, ""),
        scene.speech,
      );
      assert.equal(
        (slide.notes.match(/^\[KLICK\]$/gm) || []).length,
        phase.stops.length,
      );
      assert.equal(
        (slide.notes.match(/^\[FOLIE\]$/gm) || []).length,
        index < 15 ? 1 : 0,
      );
      assert.equal(slide.seconds, scene.duration);
      assert.deepEqual(slide.media, {
        start: phase.start,
        starts: phase.starts,
        stops: phase.stops,
        labels: phase.labels,
      });
      assert.match(slide.svg, /data:image\/jpeg;base64,/);
    }
    const executable = scripts[1][2];
    const { mountPresenter } = await import("../src/presenter/runtime.mjs");
    assert.ok(
      executable.startsWith(mountPresenter.toString().replace(/\r\n?/g, "\n")),
    );
    // HTML parsing normalizes source line endings before the browser checks CSP.
    // Hashing raw Windows CRLF made the downloadable file block its own player.
    const base64Hash = createHash("sha256")
      .update(executable.replace(/\r\n?/g, "\n"))
      .digest("base64");
    assert.ok(offline.includes(`script-src 'sha256-${base64Hash}'`));
    assert.match(offline, /media-src data:/);
    assert.match(offline, /connect-src 'none'/);
    assert.match(config.media.src, /^data:video\/mp4;base64,/);
    const embeddedVideo = Buffer.from(config.media.src.split(",")[1], "base64");
    assert.equal(
      sha(embeddedVideo),
      sha(await fs.readFile(path.join(source, "presentation.mp4"))),
    );
    assert.doesNotMatch(offline, /(?:src|href)="(?:\.\/|\.\.\/)/);
    assert.doesNotMatch(hosted, /data:video\/mp4/);
    const hostedScripts = [
      ...hosted.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g),
    ];
    assert.equal(hostedScripts.length, 2);
    const hostedConfig = JSON.parse(hostedScripts[0][2]);
    assert.deepEqual(hostedConfig, {
      ...config,
      media: { src: "./presentation.mp4", poster: "./preview.jpg" },
    });
    assert.match(hosted, /<script src="\.\/player\.js"><\/script>/);
    assert.match(hosted, /<link rel="stylesheet" href="\.\/style\.css">/);
    assert.match(hosted, /media-src 'self'/);
    assert.match(hosted, /Stand der Demo: 08\.09\.2026/);
    assert.match(
      hosted,
      /<a href="\.\/presentation\.html" download>HTML für unterwegs herunterladen<\/a>/,
    );
    assert.doesNotMatch(
      hosted,
      /\{\{[A-Z_]+\}\}|\son\w+=|<iframe|<object|<embed/,
    );
    assert.equal(
      await fs.readFile(path.join(destination, "player.js"), "utf8"),
      executable,
    );
    assert.equal(
      sha(await fs.readFile(path.join(destination, "presentation.mp4"))),
      sha(embeddedVideo),
    );
    const before = sha(offline);
    await buildDelfi(destination);
    assert.equal(
      sha(await fs.readFile(path.join(destination, "presentation.html"))),
      before,
    );
  } finally {
    await fs.rm(destination, { recursive: true, force: true });
  }
});

test("DELFI rejects phase plans that lose provenance, cross scene bounds or misplace speech signals", async () => {
  const { validatePhases } = await import(
    pathToFileURL(path.resolve("scripts/build-delfi.mjs")).href
  );
  const content = JSON.parse(
    await fs.readFile(path.join(source, "content.json"), "utf8"),
  );
  const plan = JSON.parse(
    await fs.readFile(path.join(source, "phases.json"), "utf8"),
  );
  assert.equal(validatePhases(content, plan).length, 16);
  type Phase = {
    id: string;
    originalSpeechSha256: string;
    start: number;
    starts: number[];
    stops: number[];
    labels: string[];
    offsets: number[];
  };
  type Plan = { scenes: Phase[] };
  const invalid: [string, (copy: Plan) => void][] = [
    [
      "missing scene",
      (copy) => {
        copy.scenes.pop();
      },
    ],
    [
      "reordered scene",
      (copy) => {
        [copy.scenes[0], copy.scenes[1]] = [copy.scenes[1], copy.scenes[0]];
      },
    ],
    [
      "changed speech hash",
      (copy) => {
        copy.scenes[0].originalSpeechSha256 = "0".repeat(64);
      },
    ],
    [
      "mismatched arrays",
      (copy) => {
        copy.scenes[0].labels.pop();
      },
    ],
    [
      "baseline before scene",
      (copy) => {
        copy.scenes[1].start = content.scenes[1].start - 1;
      },
    ],
    [
      "baseline at next scene",
      (copy) => {
        copy.scenes[0].start = content.scenes[0].end;
      },
    ],
    [
      "non-finite baseline",
      (copy) => {
        copy.scenes[0].start = NaN;
      },
    ],
    [
      "backward segment",
      (copy) => {
        copy.scenes[0].starts[0] = copy.scenes[0].start - 0.1;
      },
    ],
    [
      "empty segment",
      (copy) => {
        copy.scenes[0].stops[0] = copy.scenes[0].starts[0];
      },
    ],
    [
      "scene boundary crossed",
      (copy) => {
        copy.scenes[0].stops[0] = content.scenes[0].end;
      },
    ],
    [
      "overlapping segments",
      (copy) => {
        copy.scenes[0].starts[1] = copy.scenes[0].stops[0] - 0.1;
      },
    ],
    [
      "non-finite stop",
      (copy) => {
        copy.scenes[0].stops[0] = Infinity;
      },
    ],
    [
      "duplicate speech offset",
      (copy) => {
        copy.scenes[0].offsets[1] = copy.scenes[0].offsets[0];
      },
    ],
    [
      "offset beyond speech",
      (copy) => {
        copy.scenes[0].offsets[0] = content.scenes[0].speech.length;
      },
    ],
    [
      "offset inside word",
      (copy) => {
        copy.scenes[0].offsets[0] = 1;
      },
    ],
    [
      "fractional offset",
      (copy) => {
        copy.scenes[0].offsets[0] = 1.5;
      },
    ],
    [
      "missing visible label",
      (copy) => {
        copy.scenes[0].labels[0] = " ";
      },
    ],
  ];
  for (const [reason, mutate] of invalid) {
    const copy = structuredClone(plan);
    mutate(copy);
    assert.throws(() => validatePhases(content, copy), Error, reason);
  }
  const changedContent = structuredClone(content);
  changedContent.scenes[0].speech += " Changed source.";
  assert.throws(() => validatePhases(changedContent, plan), /provenance/);
});
