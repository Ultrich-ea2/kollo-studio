import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
const qa = path.resolve("qa");
test("file import accepts one UTF-8 BOM and rejects malformed colors without replacing the project", async ({
  page,
}) => {
  const raw = await fs.readFile(
    "skills/kollo-theme/assets/beispiel.kollo.json",
    "utf8",
  );
  const deck = JSON.parse(raw);
  await page.goto("/");
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({
      name: "bom.kollo.json",
      mimeType: "application/json",
      buffer: Buffer.from("\uFEFF" + raw),
    });
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    deck.title,
  );
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("kollo.project.v1") || "null")
            ?.deck ?? null,
      ),
    )
    .toEqual(deck);
  deck.theme.primary += "\n";
  deck.title = "Must not replace valid project";
  await page
    .locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({
      name: "invalid.kollo.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(deck)),
    });
  await expect(page.locator(".toast")).toContainText("Import nicht übernommen");
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    JSON.parse(raw).title,
  );
});
test.beforeAll(async () => {
  await fs.mkdir(qa, { recursive: true });
});
test("editor persists, undo restores, code validates atomically, import cannot execute scripts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page
    .getByLabel("Projektname", { exact: true })
    .fill("Meine geprüfte Präsentation");
  await expect(
    page.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    "Meine geprüfte Präsentation",
  );
  const before = await page.locator(".thumbnail").count();
  await page
    .getByRole("button", { name: "Folie duplizieren", exact: true })
    .click();
  await expect(page.locator(".thumbnail")).toHaveCount(before + 1);
  await page.getByRole("button", { name: "Rückgängig", exact: true }).click();
  await expect(page.locator(".thumbnail")).toHaveCount(before);
  await page.getByRole("button", { name: "Code", exact: true }).click();
  const code = page.getByRole("textbox", { name: "Projektcode JSON" });
  await code.fill('{"version":1,"__proto__":{"polluted":true}}');
  await page.getByRole("button", { name: "Prüfen & übernehmen" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    "Meine geprüfte Präsentation",
  );
  await page.getByRole("button", { name: "Code-Änderungen verwerfen" }).click();
  const data = JSON.parse(await code.inputValue());
  data.slides[0].title = "<script>window.pwned=1</script>";
  await code.fill(JSON.stringify(data));
  await page.getByRole("button", { name: "Prüfen & übernehmen" }).click();
  expect(await page.evaluate(() => "pwned" in window)).toBe(false);
  await page.locator(".thumbnail").first().click();
  await expect(page.locator(".artboard")).toContainText(
    "<script>window.pwned=1</script>",
  );
  expect(errors).toEqual([]);
});
test("presentation reveals, keyboard navigation and notes are explicit", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page.getByRole("button", { name: "Präsentieren", exact: true }).click();
  await expect(page.locator(".presenter")).toBeVisible();
  await expect(page.locator("#notes")).toBeHidden();
  await page.keyboard.press("n");
  await expect(page.locator("#notes.controller-script")).toBeVisible();
  await expect(page.locator("#notes .prompt-script")).not.toBeEmpty();
  await expect(page.locator(".help")).toContainText(
    "Diese Steuerung enthält Sprechernotizen",
  );
  await page.keyboard.press("n");
  await expect(page.locator("#notes")).toBeHidden();
  await page.keyboard.press("End");
  await expect(page.locator(".presenter-bar")).toContainText("11 / 11");
  await page.keyboard.press("Escape");
  await expect(page.locator(".workbench")).toBeVisible();
});
test("all real downloads open as expected and exclude private notes by default", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page
    .getByLabel("Sprechernotizen", { exact: false })
    .fill("PRIVATE-NOTES-TEST-DO-NOT-PUBLISH");
  await page.getByRole("button", { name: "Mitnehmen", exact: true }).click();
  const items = [
    ["Weiterarbeiten", "editable.pptx"],
    ["So wie hier", "visual.pptx"],
    ["Abgeben & teilen", "slides.pdf"],
    ["Auf die Bühne", "presentation.html"],
    ["Projekt sichern", "deck.json"],
    ["Alles dabei", "kit.zip"],
  ];
  for (const [title, name] of items) {
    const pending = page.waitForEvent("download");
    await page
      .locator(".export-card")
      .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
      .getByRole("button")
      .click();
    const d = await pending;
    await d.saveAs(path.join(qa, name));
    expect((await fs.stat(path.join(qa, name))).size).toBeGreaterThan(1000);
    await expect(page.locator(".export-progress")).toHaveCount(0);
  }
  const editable = await JSZip.loadAsync(
    await fs.readFile(path.join(qa, "editable.pptx")),
  );
  const visual = await JSZip.loadAsync(
    await fs.readFile(path.join(qa, "visual.pptx")),
  );
  const ep = await editable.file("ppt/slides/slide1.xml")!.async("string");
  expect(ep).toContain("<a:t>");
  expect(ep).not.toContain("<p:pic>");
  expect(await visual.file("ppt/slides/slide1.xml")!.async("string")).toContain(
    "<p:pic>",
  );
  for (const name of Object.keys(editable.files).filter(
    (x) => x.startsWith("ppt/notesSlides/") && x.endsWith(".xml"),
  ))
    expect(await editable.file(name)!.async("string")).not.toContain(
      "PRIVATE-NOTES-TEST",
    );
  const html = await fs.readFile(path.join(qa, "presentation.html"), "utf8");
  expect(html).not.toContain("PRIVATE-NOTES-TEST");
  expect(html).toContain("Content-Security-Policy");
  const kit = await JSZip.loadAsync(
    await fs.readFile(path.join(qa, "kit.zip")),
  );
  expect(Object.keys(kit.files).some((p) => p.endsWith("SKILL.md"))).toBe(true);
  expect(
    Object.keys(kit.files).some((p) => p.endsWith("validate_deck.py")),
  ).toBe(true);
  for (const resource of [
    "prepare_sources.py",
    "review_deck.py",
    "adapt-existing.md",
    "academic-story.md",
    "research-evidence.md",
    "source-packet.md",
  ]) {
    expect(Object.keys(kit.files).some((p) => p.endsWith(resource))).toBe(true);
  }
  expect(Object.keys(kit.files).some((p) => /__pycache__|\.pyc$/.test(p))).toBe(
    false,
  );
  expect(await fs.readFile(path.join(qa, "deck.json"), "utf8")).toContain(
    "PRIVATE-NOTES-TEST",
  );
  expect(
    (await fs.readFile(path.join(qa, "slides.pdf"))).subarray(0, 5).toString(),
  ).toBe("%PDF-");
});
test("desktop and mobile stay within viewport, previews contain all text, take review screenshots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({
    path: path.join(qa, "home-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page.screenshot({
    path: path.join(qa, "editor-desktop.png"),
    fullPage: true,
  });
  const bad = await page.locator(".artboard svg text").evaluateAll((nodes) =>
    nodes
      .filter((n) => {
        const b = (n as SVGGraphicsElement).getBBox();
        return (
          b.x < 0 || b.x + b.width > 1280 || b.y < 0 || b.y + b.height > 720
        );
      })
      .map((n) => n.textContent),
  );
  expect(bad).toEqual([]);
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(qa, "editor-mobile.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Bearbeiten", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Titel", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Kollo Startseite" }).click();
  await page.screenshot({
    path: path.join(qa, "home-mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
test("downloads packages and guide resolve, source kit excludes machine state", async ({
  request,
}) => {
  for (const url of [
    "/downloads/kollo-theme.zip",
    "/downloads/kollo-studio-source.zip",
    "/guide.md",
    "/downloads/manifest.json",
  ])
    expect((await request.get(url)).ok()).toBe(true);
  const response = await request.get("/downloads/kollo-studio-source.zip");
  const zip = await JSZip.loadAsync(await response.body());
  expect(
    Object.keys(zip.files).some((p) => p.endsWith("package-lock.json")),
  ).toBe(true);
  expect(
    Object.keys(zip.files).filter((p) =>
      /(?:^|\/)(?:\.git|node_modules|\.env|qa|dist|__pycache__)(?:\/|$)|\.pyc$/.test(
        p,
      ),
    ),
  ).toEqual([]);
});
test("the complete skill and its relative references work after download, and the guide fits mobile", async ({
  page,
  request,
}) => {
  const response = await request.get("/downloads/kollo-theme.zip");
  expect(response.ok()).toBe(true);
  const zip = await JSZip.loadAsync(await response.body(), {
    checkCRC32: true,
  });
  const prefix = "skills/kollo-theme/";
  for (const file of [
    "SKILL.md",
    "scripts/prepare_sources.py",
    "scripts/review_deck.py",
    "scripts/validate_deck.py",
    "assets/arbeitsbrief.md",
  ]) {
    expect(zip.file(prefix + file)).not.toBeNull();
  }
  for (const [file, entry] of Object.entries(zip.files)) {
    if (entry.dir || !file.endsWith(".md")) continue;
    for (const match of (await entry.async("string")).matchAll(
      /\]\(([^)]+)\)/g,
    )) {
      const link = match[1];
      if (/^(?:https?:|#)/.test(link)) continue;
      const target = path.posix.normalize(
        path.posix.join(path.posix.dirname(file), link.split("#")[0]),
      );
      expect(
        zip.file(target),
        `${file} links to missing ${target}`,
      ).not.toBeNull();
    }
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Anleitung", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Deine bestehende Präsentation weiterentwickeln.",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(qa, "skill-guide-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: path.join(qa, "skill-guide-mobile.png"),
    fullPage: true,
  });
});
test("separate tabs cannot silently overwrite a project", async ({
  context,
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page.getByLabel("Projektname", { exact: true }).fill("Erster Tab");
  await expect(
    page.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await other.getByLabel("Projektname", { exact: true }).fill("Zweiter Tab");
  await expect(
    other.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  await expect(page.locator(".conflict")).toBeVisible();
  await page
    .getByLabel("Projektname", { exact: true })
    .fill("Nicht überschreiben");
  await page.waitForTimeout(550);
  expect(
    await other.evaluate(
      () => JSON.parse(localStorage.getItem("kollo.project.v1")!).deck.title,
    ),
  ).toBe("Zweiter Tab");
});
