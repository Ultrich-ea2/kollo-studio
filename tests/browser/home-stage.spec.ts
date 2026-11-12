import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import type { Deck } from "../../src/model";

const privateNote = "PRIVATE-HOME-PREVIEW-NOTIZ";

async function importProject(page: Page, count = 3) {
  const deck = JSON.parse(
    await fs.readFile("skills/kollo-theme/assets/beispiel.kollo.json", "utf8"),
  ) as Deck;
  deck.title = "Mein eigener Testvortrag";
  deck.duration = count;
  const titleSlide = deck.slides[0];
  deck.slides = Array.from({ length: count }, (_, index) => ({
    ...titleSlide,
    id: `eigene-folie-${index + 1}`,
    title: `Mein Gedanke ${index + 1}`,
    subtitle: "Eigene Inhalte für die Projektvorschau",
    notes: `${privateNote} ${index + 1}`,
    seconds: 60,
  }));
  await page.goto("/");
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .locator('input[type="file"][accept="application/json,.json"]')
    .setInputFiles({
      name: "eigener-vortrag.kollo.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(deck)),
    });
  await expect(page.getByLabel("Projektname", { exact: true })).toHaveValue(
    deck.title,
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("kollo.project.v1") || "null")?.deck,
      ),
    )
    .toEqual(deck);
  return deck;
}

test("home previews the saved project privately and starts the chosen slide without changing its contents", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  const deck = await importProject(page);
  const saved = await page.evaluate(() =>
    localStorage.getItem("kollo.project.v1"),
  );
  await page
    .getByRole("button", { name: "Kollo Startseite", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: deck.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator(".home-proof-stage")).toContainText(
    deck.slides[0].title,
  );
  await expect(page.locator("body")).not.toContainText(privateNote);
  await expect(
    page.getByLabel("Projektvorschau: Folie wählen").getByRole("button"),
  ).toHaveCount(3);

  await page
    .getByRole("button", { name: "Projektvorschau: Folie 2", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Projektvorschau: Folie 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".home-proof-stage")).toContainText(
    deck.slides[1].title,
  );
  expect(
    await page.evaluate(() => localStorage.getItem("kollo.project.v1")),
  ).toBe(saved);
  expect(
    await page
      .locator(".launch-heading, .project-deck")
      .evaluateAll((nodes) =>
        nodes.every((node) => getComputedStyle(node).animationName === "none"),
      ),
  ).toBe(true);
  await fs.mkdir(path.resolve("qa"), { recursive: true });
  await page.screenshot({
    path: path.resolve("qa/home-stage-reduced-motion.png"),
    fullPage: true,
  });

  await page
    .getByRole("button", {
      name: "Aktuelles Projekt ausprobieren",
      exact: true,
    })
    .click();
  await expect(page.locator("#count")).toHaveText("2 / 3");
  await expect(page.locator('.slide[aria-current="true"]')).toContainText(
    deck.slides[1].title,
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: deck.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(privateNote);
  expect(
    await page.evaluate(() => localStorage.getItem("kollo.project.v1")),
  ).toBe(saved);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: deck.title, exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("kollo.project.v1")),
  ).toBe(saved);
  expect(errors).toEqual([]);
});

test("the slide sequence remains keyboard reachable and notes stay with their slide on desktop and mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const deck = await importProject(page, 12);
  const notes = page.getByLabel("Sprechernotizen", { exact: false });
  const lastSlide = page.getByRole("button", {
    name: "Folie 12: Mein Gedanke 12",
    exact: true,
  });
  await lastSlide.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".artboard")).toContainText(deck.slides[11].title);
  await expect(notes).toHaveValue(`${privateNote} 12`);
  await notes.fill("Meine überarbeitete Notiz für Folie zwölf.");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("kollo.project.v1")!).deck.slides[11]
            .notes,
      ),
    )
    .toBe("Meine überarbeitete Notiz für Folie zwölf.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Folien", exact: true }).click();
  const firstSlide = page.getByRole("button", {
    name: "Folie 1: Mein Gedanke 1",
    exact: true,
  });
  await firstSlide.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".artboard")).toContainText(deck.slides[0].title);
  await expect(notes).toBeVisible();
  await expect(notes).toHaveValue(`${privateNote} 1`);
  await page.getByRole("button", { name: "Folien", exact: true }).click();
  await lastSlide.focus();
  await page.keyboard.press("Space");
  await expect(notes).toHaveValue("Meine überarbeitete Notiz für Folie zwölf.");
  await page.getByRole("button", { name: "Bearbeiten", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Titel", exact: true }),
  ).toHaveValue(deck.slides[11].title);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
