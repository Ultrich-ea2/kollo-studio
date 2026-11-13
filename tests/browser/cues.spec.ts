import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const cueNotes =
  "Privater Einstieg.\n[KLICK]\nErster Punkt erklärt.\n[KLICK]\nZweiter Punkt erklärt.\n[FOLIE]";

async function cueDeck(notes = cueNotes) {
  const deck = JSON.parse(
    await fs.readFile("skills/kollo-theme/assets/beispiel.kollo.json", "utf8"),
  );
  deck.title = "Klicksignale prüfen";
  const basis = deck.slides[0];
  deck.slides = [
    {
      ...basis,
      id: "schritte",
      layout: "bullets",
      title: "Zwei sichtbare Schritte",
      subtitle: "",
      items: ["Erster Befund", "Zweiter Befund"],
      notes,
      reveal: true,
    },
    {
      ...basis,
      id: "schluss",
      layout: "bullets",
      title: "Ein klarer Schluss",
      subtitle: "",
      items: ["Eine klare Antwort"],
      notes: "[KLICK]\nAbschließender privater Gedanke.",
      reveal: true,
    },
  ];
  return deck;
}

async function importDeck(page: Page, notes = cueNotes) {
  await page.clock.install();
  await page.route("**/", async (route) => {
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(
        new URL(route.request().url()).hostname,
      )
    ) {
      await route.continue();
      return;
    }
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
  await page.goto("/");
  await page.unroute("**/");
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({
      name: "klicksignale.kollo.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(await cueDeck(notes))),
    });
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    "Klicksignale prüfen",
  );
  await page.getByRole("button", { name: "Präsentieren", exact: true }).click();
}

async function open(page: Page, label: string) {
  const waiting = page.waitForEvent("popup");
  await page.getByRole("button", { name: label, exact: true }).click();
  const popup = await waiting;
  await expect(popup.locator(".kollo-presenter")).toBeVisible();
  return popup;
}

async function reachCue(controller: Page, prompt: Page, order: number) {
  await controller.clock.runFor(10000);
  await expect(prompt.locator(".prompt-marker.is-current")).toHaveAttribute(
    "data-cue",
    String(order),
  );
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(prompt.locator(".prompt-action")).toHaveClass(/is-waiting/);
}

test("forward confirmation resumes reading to two checkpoints without advancing the audience automatically", async ({
  page,
}) => {
  await importDeck(page);
  const audience = await open(page, "Publikumsfenster öffnen");
  const prompt = await open(page, "Teleprompter öffnen");
  await expect(prompt.locator(".prompt-marker")).toHaveCount(3);
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await prompt.locator("#reader-toggle").click();
  await reachCue(page, prompt, 0);
  await page.clock.runFor(20000);
  await expect(prompt.locator("#cue-status")).toHaveText("Phase 0 / 2");
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const firstPosition = await prompt.locator(".prompt-word.is-read").count();
  await page.clock.runFor(600);
  expect(await prompt.locator(".prompt-word.is-read").count()).toBeGreaterThan(
    firstPosition,
  );
  await reachCue(page, prompt, 1);
  await expect(prompt.locator("#cue-status")).toHaveText("Phase 1 / 2");
  await audience.keyboard.press("ArrowRight");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const secondPosition = await prompt.locator(".prompt-word.is-read").count();
  await page.clock.runFor(600);
  expect(await prompt.locator(".prompt-word.is-read").count()).toBeGreaterThan(
    secondPosition,
  );
  await reachCue(page, prompt, 2);
  await page.clock.runFor(20000);
  await expect(page.locator("#count")).toHaveText("1 / 2");
  await expect(prompt.locator("#cue-status")).toHaveText("Phase 2 / 2");
  await expect(prompt.locator(".prompt-marker.is-current")).toHaveText(
    "→ Nächste Folie",
  );
  await expect(prompt.locator(".prompt-marker.is-current")).toHaveAttribute(
    "aria-label",
    /Ein klarer Schluss/,
  );
  await prompt.locator("#cue-next").click();
  await expect(page.locator("#count")).toHaveText("2 / 2");
  await expect(prompt.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    "0",
  );
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.clock.runFor(10000);
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(prompt.locator("#cue-next")).toBeDisabled();
  await expect(prompt.locator("#next-action")).toHaveText(
    "Keine weitere Folie",
  );
  expect(await audience.content()).not.toMatch(
    /Privater Einstieg|\[KLICK\]|\[FOLIE\]/,
  );
  await expect(
    audience.locator(".prompt-marker,#next-action,button"),
  ).toHaveCount(0);
});

test("early forward clicks align and resume narration while rewind, reset and jump stay paused", async ({
  page,
}) => {
  await importDeck(page);
  let prompt = await open(page, "Teleprompter öffnen");
  await page.locator("#next").click();
  await expect(
    prompt.locator(".prompt-word.is-active-phase").first(),
  ).toHaveText("Erster");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await reachCue(page, prompt, 1);
  await prompt.close();
  prompt = await open(page, "Teleprompter öffnen");
  await expect(prompt.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    "1",
  );
  await prompt.locator("#previous").click();
  await expect(prompt.locator(".prompt-word.is-current")).toHaveText(
    "Privater",
  );
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await prompt.locator("#reader-reset").click();
  await expect(prompt.locator('.prompt-marker[data-cue="0"]')).toHaveClass(
    /is-done/,
  );
  await expect(prompt.locator(".prompt-word.is-current")).toHaveText(
    "Privater",
  );
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await prompt.locator("#jump").selectOption("1");
  await prompt.locator("#jump").selectOption("0");
  await expect(prompt.locator("#cue-status")).toHaveText("Phase 0 / 2");
  await expect(prompt.locator(".prompt-word.is-current")).toHaveText(
    "Privater",
  );
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  for (const key of ["End", "Home"]) {
    await prompt.keyboard.press(key);
    await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }
});

test("exact own-line and adjacent cues work while malformed plans remain usable", async ({
  page,
}) => {
  await importDeck(
    page,
    " \t[KLICK]\t \r[KLICK]\r\nKurz. [Klick]\n[KLICK: nur ein Hinweis]\n[FOLIE]\nDieser Text bleibt lesbar.\n[KLICK]",
  );
  const prompt = await open(page, "Teleprompter öffnen");
  await expect(prompt.locator(".prompt-marker")).toHaveCount(4);
  await expect(prompt.locator(".prompt-marker.is-current")).toHaveAttribute(
    "data-cue",
    "0",
  );
  await expect(prompt.locator("#cue-warning")).toContainText(
    "Regieplan prüfen",
  );
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    "1",
  );
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(prompt.locator(".prompt-script")).toContainText(
    "[KLICK: nur ein Hinweis]",
  );
  await expect(
    prompt.locator(".prompt-word").filter({ hasText: "[Klick]" }),
  ).toHaveCount(1);
  await page.clock.runFor(30000);
  await expect(prompt.locator("#count")).toHaveText("1 / 2");
  await expect(prompt.locator(".prompt-marker.is-current")).toHaveCount(0);
  await prompt.locator("#focus-toggle").click();
  await expect(prompt.locator(".prompt-preview")).toBeHidden();
  await prompt.setViewportSize({ width: 390, height: 844 });
  await expect(prompt.locator("#cue-next")).toBeVisible();
  expect(
    await prompt.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await prompt.screenshot({ path: "qa/cues-mobile.png", fullPage: true });
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#count")).toHaveText("2 / 2");
});

test("downloaded HTML resumes and stops private narration offline without automatic audience changes", async ({
  page,
  context,
}) => {
  await importDeck(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Mitnehmen", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Sprechernotizen in PowerPoint & HTML einschließen",
    })
    .check();
  const card = page.locator(".export-card").filter({
    has: page.getByRole("heading", { name: "Auf die Bühne", exact: true }),
  });
  const pending = page.waitForEvent("download");
  await card
    .getByRole("button", { name: "Herunterladen", exact: true })
    .click();
  const file = path.resolve("qa/cues-downloaded.html");
  await (await pending).saveAs(file);
  const requests: string[] = [],
    errors: string[] = [];
  context.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await context.setOffline(true);
  await page.goto(pathToFileURL(file).href);
  const prompt = await open(page, "Teleprompter öffnen");
  const audience = await open(page, "Publikumsfenster öffnen");
  await prompt.locator("#reader-toggle").click();
  await expect(prompt.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    "0",
  );
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(prompt.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    "1",
  );
  await expect(prompt.locator("#cue-status")).toHaveText("Phase 1 / 2");
  await audience.keyboard.press("ArrowRight");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(prompt.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    "2",
  );
  await expect(page.locator("#count")).toHaveText("1 / 2");
  await expect(audience.locator("button")).toHaveCount(0);
  expect(await audience.content()).not.toContain("Privater Einstieg");
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test("suspension stays paused until a new explicit forward confirmation", async ({
  page,
}) => {
  await importDeck(page);
  let prompt = await open(page, "Teleprompter öffnen");
  await prompt.locator("#reader-toggle").click();
  await reachCue(page, prompt, 0);
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent("pagehide", { persisted: true }),
    ),
  );
  await expect.poll(() => prompt.isClosed()).toBe(true);
  prompt = await open(page, "Teleprompter öffnen");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await prompt.locator("#cue-next").click();
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await reachCue(page, prompt, 1);
  await expect(prompt.locator("#cue-status")).toHaveText("Phase 1 / 2");
});

test("integrated and detached readers share forward flow and paused reverse navigation", async ({
  page,
}) => {
  await importDeck(page);
  await expect(page.locator("#notes")).toBeHidden();
  await page.locator("#notes-toggle").click();
  await page.locator("#notes #focus-toggle").click();
  await expect(page.locator(".stage")).toBeHidden();
  await page.locator("#notes #focus-toggle").click();
  await expect(page.locator(".stage")).toBeVisible();
  const prompt = await open(page, "Teleprompter öffnen");
  const audience = await open(page, "Publikumsfenster öffnen");
  await expect(page.locator("#notes .prompt-marker.is-current")).toHaveText(
    "→ Einblendung 1 von 2",
  );
  await page.keyboard.press("ArrowRight");
  for (const reader of [page, prompt]) {
    await expect(reader.locator(".prompt-word.is-active-phase")).toHaveText([
      "Erster",
      "Punkt",
      "erklärt.",
    ]);
    await expect(reader.locator("#reader-toggle")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await prompt.keyboard.press("ArrowRight");
  await expect(page.locator(".prompt-word.is-active-phase").first()).toHaveText(
    "Zweiter",
  );
  await expect(prompt.locator(".prompt-marker.is-current")).toHaveText(
    "→ Nächste Folie",
  );
  await audience.keyboard.press("ArrowRight");
  await expect(page.locator("#count")).toHaveText("2 / 2");
  await audience.keyboard.press("ArrowLeft");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "2",
  );
  await expect(prompt.locator(".prompt-word.is-current")).toHaveText("Zweiter");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await prompt.keyboard.press("ArrowLeft");
  await expect(page.locator(".prompt-word.is-current")).toHaveText("Erster");
  await prompt.keyboard.press("ArrowLeft");
  await expect(page.locator(".prompt-word.is-current")).toHaveText("Privater");
  await page.clock.runFor(60000);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "0",
  );
  await expect(page.locator(".prompt-word.is-current")).toHaveText("Privater");
  await expect(
    audience.locator(".prompt-script,.prompt-marker,button"),
  ).toHaveCount(0);
});

test("compact checkpoints retain every word, preserve paragraphs and fit mobile", async ({
  page,
}) => {
  await importDeck(
    page,
    "Privater Einstieg.\n\nNoch ein Absatz.\n[KLICK]\nErster Punkt erklärt.\n[KLICK]\nZweiter Punkt erklärt.\n[FOLIE]",
  );
  const prompt = await open(page, "Teleprompter öffnen");
  await expect(prompt.locator(".prompt-script")).toContainText(
    "Privater Einstieg.\n\nNoch ein Absatz.",
  );
  for (const width of [1440, 390]) {
    await prompt.setViewportSize({ width, height: 900 });
    const geometry = await prompt
      .locator(".prompt-marker")
      .evaluateAll((markers) =>
        markers.map((marker) => {
          const box = marker.getBoundingClientRect(),
            next = marker.nextElementSibling;
          return {
            height: box.height,
            before: getComputedStyle(marker, "::before").content,
            adjacentWhitespace: [
              marker.previousSibling,
              marker.nextSibling,
            ].some(
              (sibling) =>
                sibling?.nodeType === Node.TEXT_NODE &&
                /^\s+$/.test(sibling.textContent || ""),
            ),
            gap: next ? next.getBoundingClientRect().top - box.bottom : 0,
          };
        }),
      );
    for (const marker of geometry) {
      expect(marker.height).toBeLessThan(34);
      expect(["none", "normal", '""']).toContain(marker.before);
      expect(marker.adjacentWhitespace).toBe(false);
      expect(marker.gap).toBeLessThan(62);
    }
    await expect(prompt.locator(".prompt-word")).toHaveText([
      "Privater",
      "Einstieg.",
      "Noch",
      "ein",
      "Absatz.",
      "Erster",
      "Punkt",
      "erklärt.",
      "Zweiter",
      "Punkt",
      "erklärt.",
    ]);
  }
});

test("manual pause and scroll stop reading until the next explicit phase", async ({
  page,
}) => {
  await importDeck(page);
  const prompt = await open(page, "Teleprompter öffnen");
  await page.keyboard.press("ArrowRight");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await prompt.locator("#reader-toggle").click();
  await page.clock.runFor(10000);
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  await page.keyboard.press("ArrowRight");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await prompt.locator(".prompt-reader").dispatchEvent("wheel");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const pausedWord = await prompt
    .locator(".prompt-word.is-current")
    .textContent();
  await page.clock.runFor(10000);
  await expect(prompt.locator(".prompt-word.is-current")).toHaveText(
    pausedWord!,
  );
  await page.keyboard.press("ArrowLeft");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.keyboard.press("ArrowRight");
  await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await reachCue(page, prompt, 2);
});
