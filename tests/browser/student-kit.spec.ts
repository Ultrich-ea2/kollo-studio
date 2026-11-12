import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import JSZip from "jszip";

test("showcases preview without replacing a project and a new deck starts empty with undo", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page
    .getByLabel("Projektname", { exact: true })
    .fill("Mein bestehendes Projekt");
  await expect(
    page.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("kollo.project.v1")!).deck,
  );
  await page.getByRole("button", { name: "Vorlagen", exact: true }).click();
  await page
    .getByRole("button", { name: "Lesespuren vorführen", exact: true })
    .click();
  await expect(page.locator(".presenter")).toBeVisible();
  await page.keyboard.press("Escape");
  const after = await page.evaluate(
    () => JSON.parse(localStorage.getItem("kollo.project.v1")!).deck,
  );
  expect(after).toEqual(before);
  await page.getByLabel("Neuer Arbeitstitel").fill("Eine neue Frage");
  await page.getByLabel("Redezeit in Minuten").fill("12");
  await page
    .getByLabel("Gestaltung", { exact: true })
    .selectOption("lesespuren");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Leeres Projekt anlegen" }).click();
  await expect(page.locator(".thumbnail")).toHaveCount(1);
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    "Eine neue Frage",
  );
  await expect
    .poll(async () =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("kollo.project.v1")!).deck.title,
      ),
    )
    .toBe("Eine neue Frage");
  const deck = await page.evaluate(
    () => JSON.parse(localStorage.getItem("kollo.project.v1")!).deck,
  );
  expect(deck.theme.composition).toBe("editorial");
  expect(deck.slides[0].notes + deck.slides[0].source + deck.author).toBe("");
  await page.getByRole("button", { name: "Rückgängig", exact: true }).click();
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    before.title,
  );
  await expect(page.locator(".thumbnail")).toHaveCount(before.slides.length);
});

test("all release archives match hashes and the student kit opens examples directly offline", async ({
  request,
  page,
  context,
}) => {
  test.setTimeout(90000);
  const manifest = await (await request.get("/downloads/manifest.json")).json();
  const archives = new Map<string, Buffer>();
  for (const entry of manifest.files) {
    const response = await request.get(`/downloads/${entry.file}`);
    expect(response.ok()).toBeTruthy();
    const bytes = await response.body();
    expect(bytes.length).toBe(entry.size);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);
    await JSZip.loadAsync(bytes, { checkCRC32: true });
    archives.set(entry.file, bytes);
  }
  expect(archives.has("kollo-student-kit.zip")).toBe(true);
  expect(archives.has("kollo-examples.zip")).toBe(true);
  expect(archives.has("kollo-delfi.zip")).toBe(true);
  const kit = await JSZip.loadAsync(archives.get("kollo-student-kit.zip")!);
  for (const required of [
    "START-HIER.html",
    "START-HIER.txt",
    "skills/kollo-theme/SKILL.md",
    "skills/kollo-theme/references/new-from-zero.md",
    "skills/kollo-theme/references/presenting-and-teleprompter.md",
    "studio/server.mjs",
    "studio/Start-Kollo.cmd",
    "source/kollo-studio-source.zip",
    "guides/guide.md",
    "examples/delfi/presentation.html",
    "examples/delfi/provenance.json",
    "examples/delfi/phases.json",
    "studio/downloads/kollo-delfi.zip",
  ])
    expect(kit.file(required), required).not.toBeNull();
  const root = path.resolve("qa/student-kit-browser");
  for (const entry of Object.values(kit.files)) {
    if (entry.dir) continue;
    expect(entry.name).not.toMatch(
      /(?:^|\/)(?:\.git|\.env|__pycache__|qa)(?:\/|$)|\.py[co]$/,
    );
    const dest = path.resolve(root, entry.name);
    expect(dest.startsWith(root + path.sep)).toBe(true);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, await entry.async("nodebuffer"));
  }
  const requests: string[] = [];
  context.on("request", (req) => {
    if (/^https?:/.test(req.url())) requests.push(req.url());
  });
  await context.setOffline(true);
  await page.goto(pathToFileURL(path.join(root, "START-HIER.html")).href);
  await page.getByRole("link", { name: "Die Beispielsammlung öffnen" }).click();
  await expect(page.locator("article")).toHaveCount(4);
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
      ),
  ).toBe(true);
  for (const id of ["lesespuren", "signalweg", "spielraum"]) {
    const dir = path.join(root, "examples", id);
    const json = JSON.parse(
      await fs.readFile(path.join(dir, "deck.kollo.json"), "utf8"),
    );
    expect(json.slides).toHaveLength(7);
    const pptx = await JSZip.loadAsync(
      await fs.readFile(path.join(dir, "bearbeitbar.pptx")),
    );
    expect(
      Object.keys(pptx.files).filter((name) =>
        /^ppt\/slides\/slide\d+\.xml$/.test(name),
      ),
    ).toHaveLength(7);
    await page.goto(pathToFileURL(path.join(dir, "presentation.html")).href);
    await expect(page.locator("#count")).toContainText("1 / 7");
    await page.keyboard.press("End");
    await expect(page.locator("#count")).toContainText("7 / 7");
  }
  await page.goto(
    pathToFileURL(path.join(root, "examples/delfi/presentation.html")).href,
  );
  await expect(page.locator("#count")).toContainText("1 / 16");
  await expect(
    page.locator('.media-canvas[data-media-slide="0"]'),
  ).toHaveAttribute("data-media-time", "2.1");
  await expect(page.locator("#notes .prompt-marker")).toHaveCount(3);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  if (
    (await page
      .locator(".kollo-presenter")
      .getAttribute("data-media-playing")) === "true"
  )
    await page.keyboard.press("ArrowRight");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-media-playing",
    "false",
  );
  expect(requests).toEqual([]);
});

test("example gallery and new-project form fit mobile without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Vorlagen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Leeres Projekt anlegen" }),
  ).toBeVisible();
  await expect(page.locator(".showcase")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
