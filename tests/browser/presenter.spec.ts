import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const secret = "PRIVATE-PROMPTER-NOTES-ONLY";
async function project(page: Page) {
  const deck = JSON.parse(
    await fs.readFile("skills/kollo-theme/assets/beispiel.kollo.json", "utf8"),
  );
  deck.title = "Fensterprobe";
  deck.slides[0].title = "Ein klarer Anfang";
  deck.slides[0].subtitle =
    "Eine erfundene Präsentation für den Funktionstest.";
  deck.slides[0].notes = `${secret} ${"Ein Satz zum Lesen, mit einer kleinen Pause. ".repeat(35)}`;
  deck.slides[1] = {
    ...deck.slides[0],
    id: "schritte",
    layout: "bullets",
    title: "Zwei Schritte",
    subtitle: "",
    items: ["Erster Schritt", "Zweiter Schritt"],
    reveal: true,
    notes: "Zweite private Notiz.",
  };
  deck.slides[2] = {
    ...deck.slides[0],
    id: "ende",
    layout: "bullets",
    title: "Ein guter Schluss",
    subtitle: "",
    items: ["Eine klare Antwort", "Ein sinnvoller nächster Schritt"],
    reveal: true,
    notes: "Die letzte private Notiz.",
  };
  await page.goto("/");
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({
      name: "fenster.kollo.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(deck)),
    });
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    deck.title,
  );
}
async function open(page: Page, label: string) {
  const wait = page.waitForEvent("popup");
  await page.getByRole("button", { name: label, exact: true }).click();
  const popup = await wait;
  await expect(popup.locator(".kollo-presenter")).toBeVisible();
  return popup;
}

test("live presenter synchronizes clean audience, private reader, reveals, clocks and reconnects under CSP", async ({
  page,
}) => {
  await page.route("**/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await project(page);
  await page.getByRole("button", { name: "Präsentieren", exact: true }).click();
  const audience = await open(page, "Publikumsfenster öffnen");
  const prompt = await open(page, "Teleprompter öffnen");
  for (const child of [audience, prompt])
    child.on("pageerror", (error) => errors.push(error.message));
  await expect(prompt.locator(".prompt-script")).toContainText(secret);
  expect(await audience.locator("body").textContent()).not.toContain(secret);
  expect(await audience.content()).not.toContain("Zweite private Notiz");
  await audience.mouse.move(100, 100);
  await expect(
    audience.locator("button,[role=button],input,select,textarea"),
  ).toHaveCount(0);
  if (await audience.evaluate(() => document.fullscreenEnabled)) {
    await audience.keyboard.press("f");
    await expect
      .poll(() => audience.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(true);
    await audience.keyboard.press("f");
    await expect
      .poll(() => audience.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(false);
  }
  await page.evaluate(() => {
    const cancelled = new Event("beforeunload", { cancelable: true });
    cancelled.preventDefault();
    window.dispatchEvent(cancelled);
  });
  await expect(page.locator("#count")).toHaveText("1 / 3");
  expect(prompt.isClosed() || audience.isClosed()).toBe(false);
  await prompt.evaluate(() => {
    const cancelled = new Event("beforeunload", { cancelable: true });
    cancelled.preventDefault();
    window.dispatchEvent(cancelled);
  });
  await page.locator("#notes-toggle").click();
  await expect(page.locator("#notes .prompt-script")).toContainText(secret);
  await prompt.locator("#next").click();
  await expect(page.locator(".presenter-bar")).toContainText("2 / 3");
  await expect(audience.locator('.slide[aria-current="true"]')).toContainText(
    "Zwei Schritte",
  );
  expect(
    await audience.locator('.slide[aria-current="true"] .unrevealed').count(),
  ).toBeGreaterThan(0);
  const hiddenBefore = await audience
    .locator('.slide[aria-current="true"] .unrevealed')
    .count();
  await audience.keyboard.press("ArrowRight");
  await expect
    .poll(() =>
      audience.locator('.slide[aria-current="true"] .unrevealed').count(),
    )
    .toBeLessThan(hiddenBefore);
  await expect(prompt.locator("#cue-status")).toContainText("Phase 1");
  await prompt.locator("#timer-toggle").click();
  await expect(page.locator("#clock")).not.toHaveText("00:00");
  await page.locator("#timer-toggle").click();
  expect(await prompt.locator("#clock").textContent()).toBe(
    await page.locator("#clock").textContent(),
  );
  await prompt.locator("#timer-reset").click();
  await expect(page.locator("#clock")).toHaveText("00:00");
  await prompt.locator("#black-toggle").click();
  await expect(audience.locator(".black-screen")).toBeVisible();
  await audience.keyboard.press("b");
  await expect(page.locator(".black-screen")).toBeHidden();
  await audience.close();
  await expect(page.locator(".presenter-status")).toContainText(
    /getrennt|geschlossen/,
  );
  const restored = await open(page, "Publikumsfenster öffnen");
  await expect(restored.locator('.slide[aria-current="true"]')).toContainText(
    "Zwei Schritte",
  );
  expect(
    await restored.locator('.slide[aria-current="true"] .unrevealed').count(),
  ).toBeLessThan(hiddenBefore);
  await restored.reload();
  await expect(page.locator(".presenter-status")).toContainText("getrennt");
  const afterReload = await open(page, "Publikumsfenster öffnen");
  await expect(
    afterReload.locator('.slide[aria-current="true"]'),
  ).toContainText("Zwei Schritte");
  expect(restored.isClosed()).toBe(false);
  await restored.close();
  await afterReload.route("https://former-window.invalid/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>Unrelated page</title><p>Former presentation window</p>",
    }),
  );
  await afterReload.goto("https://former-window.invalid/");
  const afterNavigation = await open(page, "Publikumsfenster öffnen");
  await expect(
    afterNavigation.locator('.slide[aria-current="true"]'),
  ).toContainText("Zwei Schritte");
  expect(afterReload.isClosed()).toBe(false);
  await expect(
    afterReload.getByText("Former presentation window"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Präsentation beenden", exact: true })
    .click();
  await expect
    .poll(() => prompt.isClosed() && afterNavigation.isClosed())
    .toBe(true);
  expect(afterReload.isClosed()).toBe(false);
  await afterReload.close();
  expect(errors).toEqual([]);
});

test("teleprompter reading controls pause on manual scroll, preserve slide control, and fit smaller screens", async ({
  page,
}) => {
  await project(page);
  await page.getByRole("button", { name: "Präsentieren", exact: true }).click();
  const prompt = await open(page, "Teleprompter öffnen");
  await prompt.setViewportSize({ width: 900, height: 800 });
  await prompt.getByLabel("Teleprompter-Schriftgröße").fill("50");
  await expect(prompt.locator("#font-value")).toHaveText("50 px");
  await prompt.getByRole("button", { name: "Spiegeln", exact: true }).click();
  await expect(prompt.locator(".prompt-script")).toHaveClass(/is-mirrored/);
  await prompt.getByRole("button", { name: "Spiegeln", exact: true }).click();
  await prompt.locator("#reader-toggle").click();
  await expect
    .poll(() => prompt.locator(".prompt-word.is-read").count())
    .toBeGreaterThan(0);
  await prompt.locator(".prompt-reader").hover();
  await prompt.mouse.wheel(0, 500);
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("#count")).toHaveText("1 / 3");
  await prompt.locator("#reader-reset").click();
  await expect(prompt.locator(".prompt-word").first()).toHaveClass(
    /is-current/,
  );
  await prompt.getByRole("button", { name: "Lesefokus", exact: true }).click();
  await expect(prompt.locator(".prompt-preview")).toBeHidden();
  await prompt.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      prompt.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await prompt.emulateMedia({ reducedMotion: "reduce" });
  await prompt.getByLabel("Teleprompter-Schriftgröße").fill("68");
  await expect(prompt.locator(".prompt-reader")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect.poll(() => prompt.isClosed()).toBe(true);
});

test("blocked popup is explained and separate presentation sessions stay isolated", async ({
  page,
  context,
}) => {
  await project(page);
  await page.getByRole("button", { name: "Präsentieren", exact: true }).click();
  await page.evaluate(() => {
    const saved = window.open;
    Object.assign(window, { savedOpenForTest: saved });
    window.open = () => null;
  });
  await page
    .getByRole("button", { name: "Teleprompter öffnen", exact: true })
    .click();
  await expect(page.locator(".presenter-status")).toContainText(
    "Fenster blockiert",
  );
  await page.evaluate(() => {
    window.open = (
      window as unknown as { savedOpenForTest: typeof window.open }
    ).savedOpenForTest;
  });
  const first = await open(page, "Teleprompter öffnen");
  const another = await context.newPage();
  await another.goto("/");
  await another
    .getByRole("button", { name: "Werkstatt öffnen", exact: true })
    .click();
  await another
    .getByRole("button", { name: "Präsentieren", exact: true })
    .click();
  const second = await open(another, "Teleprompter öffnen");
  const otherCount = await second.locator("#count").textContent();
  await first.locator("#next").click();
  await expect(first.locator("#count")).toHaveText("2 / 3");
  await expect(second.locator("#count")).toHaveText(otherCount!);
  await another.close();
  await expect.poll(() => second.isClosed()).toBe(true);
  await expect(first.locator("#count")).toHaveText("2 / 3");
});

test("downloaded HTML runs file:// with notes, synchronized windows and no network", async ({
  page,
  context,
}) => {
  await project(page);
  await page.getByRole("button", { name: "Mitnehmen", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Sprechernotizen in PowerPoint & HTML einschließen",
    })
    .check();
  const wait = page.waitForEvent("download");
  await page
    .locator(".export-card")
    .filter({
      has: page.getByRole("heading", { name: "Auf die Bühne", exact: true }),
    })
    .getByRole("button")
    .click();
  const download = await wait;
  const output = path.resolve("qa/presenter-file.html");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await download.saveAs(output);
  const standalone = await context.newPage();
  const external: string[] = [],
    errors: string[] = [];
  context.on("request", (request) => {
    if (/^https?:/.test(request.url())) external.push(request.url());
  });
  standalone.on("pageerror", (error) => errors.push(error.message));
  await standalone.goto(pathToFileURL(output).href);
  await expect(standalone.locator("#count")).toHaveText("1 / 3");
  const audience = await open(standalone, "Publikumsfenster öffnen");
  const prompt = await open(standalone, "Teleprompter öffnen");
  for (const child of [audience, prompt])
    child.on("pageerror", (error) => errors.push(error.message));
  await expect(prompt.locator(".prompt-script")).toContainText(secret);
  expect(await audience.content()).not.toContain(secret);
  await prompt.keyboard.press("End");
  await expect(standalone.locator("#count")).toHaveText("3 / 3");
  await expect(audience.locator('.slide[aria-current="true"]')).toContainText(
    "Ein guter Schluss",
  );
  await expect(
    audience.locator('.slide[aria-current="true"] .unrevealed'),
  ).toHaveCount(0);
  await prompt.keyboard.press("ArrowLeft");
  await expect
    .poll(() =>
      audience.locator('.slide[aria-current="true"] .unrevealed').count(),
    )
    .toBeGreaterThan(0);
  await standalone.keyboard.press("n");
  await expect(standalone.locator("#notes")).toContainText(
    "Die letzte private Notiz",
  );
  await standalone.reload();
  await expect.poll(() => audience.isClosed() && prompt.isClosed()).toBe(true);
  await expect(standalone.locator("#count")).toHaveText("1 / 3");
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
