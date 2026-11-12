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

test("DELFI builds exact-media offline HTML and external-script hosted HTML with restrictive CSP", async () => {
  const { buildDelfi } = await import(
    pathToFileURL(path.resolve("scripts/build-delfi.mjs")).href
  );
  const destination = await fs.mkdtemp(
    path.join(os.tmpdir(), "kollo-delfi-test-"),
  );
  try {
    assert.equal((await buildDelfi(destination)).duration, 392);
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
    const content = JSON.parse(scripts[0][2]);
    assert.deepEqual(
      content,
      JSON.parse(await fs.readFile(path.join(source, "content.json"), "utf8")),
    );
    const executable = scripts[1][2];
    const base64Hash = createHash("sha256").update(executable).digest("base64");
    assert.ok(offline.includes(`script-src 'sha256-${base64Hash}'`));
    assert.match(offline, /media-src data:/);
    assert.match(offline, /connect-src 'none'/);
    const embeddedVideo = Buffer.from(
      offline.match(/src="data:video\/mp4;base64,([^"]+)"/)![1],
      "base64",
    );
    assert.equal(
      sha(embeddedVideo),
      sha(await fs.readFile(path.join(source, "presentation.mp4"))),
    );
    assert.doesNotMatch(offline, /(?:src|href)="(?:\.\/|\.\.\/)/);
    assert.doesNotMatch(hosted, /data:video\/mp4/);
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
