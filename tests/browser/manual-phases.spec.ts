import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import { presenterCss } from "../../src/presenter/styles";

async function fixture(
  page: Page,
  mode:
    | "normal"
    | "broken"
    | "missing"
    | "invalid"
    | "out-of-range"
    | "delayed" = "normal",
) {
  const runtime = (
    await fs.readFile("src/presenter/runtime.mjs", "utf8")
  ).replace("export function mountPresenter(", "function mountPresenter(");
  const video = await fs.readFile("showcases/delfi/presentation.mp4");
  const fallback =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#102024"/><text x="100" y="180" fill="white">Media fixture</text></svg>';
  const options = {
    title: "Manual phase fixture",
    duration: 1,
    css: presenterCss,
    showNotes: true,
    media: { src: "/__phase-fixture.mp4" },
    slides: [
      {
        title: "First scene",
        svg: fallback,
        reveal: true,
        seconds: 4,
        transition: "none",
        notes:
          "Introduction.\n[KLICK]\nFirst phase narration.\n[KLICK]\nSecond phase narration.\n[FOLIE]",
        media: {
          start: 0,
          starts: [0, 2.4],
          stops: [1.4, 3.8],
          labels: ["First animation", "Second animation"],
        },
      },
      {
        title: "Second scene",
        svg: fallback,
        reveal: true,
        seconds: 2,
        transition: "none",
        notes: "Second introduction.\n[KLICK]\nFinal narration.",
        media: { start: 18, stops: [19], labels: ["Final animation"] },
      },
    ],
  };
  if (mode === "missing") Reflect.deleteProperty(options, "media");
  if (mode === "invalid")
    options.slides.forEach((slide) =>
      Reflect.deleteProperty(slide.media, "stops"),
    );
  if (mode === "out-of-range") options.slides[1].media.stops = [9999];
  let release = () => {};
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  if (mode !== "delayed") release();
  await page.route("**/__phase-fixture.mp4", async (route) => {
    await ready;
    if (mode === "broken")
      return route.fulfill({
        contentType: "video/mp4",
        body: "invalid media bytes",
      });
    const range = /bytes=(\d+)-(\d*)/.exec(
      route.request().headers().range || "",
    );
    const start = Number(range?.[1] || 0);
    const end = range?.[2] ? Number(range[2]) : video.length - 1;
    return route.fulfill({
      status: range ? 206 : 200,
      contentType: "video/mp4",
      headers: {
        "Accept-Ranges": "bytes",
        ...(range
          ? { "Content-Range": `bytes ${start}-${end}/${video.length}` }
          : {}),
      },
      body: video.subarray(start, end + 1),
    });
  });
  await page.route("**/__phase-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<html lang="de"><meta charset="UTF-8"><title>Manual phases</title><body style="margin:0"><div id="root"></div><script>${runtime};mountPresenter(document.getElementById("root"), ${JSON.stringify(options)});</script></body></html>`,
    }),
  );
  await page.goto("/__phase-fixture", { waitUntil: "domcontentloaded" });
  if (mode === "normal")
    await expect(
      page.locator('.slide[aria-current="true"] canvas'),
    ).toBeVisible();
  return release;
}

async function open(page: Page, button: string) {
  const waiting = page.waitForEvent("popup");
  await page.locator(button).click();
  const popup = await waiting;
  await expect(popup.locator(".kollo-presenter")).toBeVisible();
  return popup;
}

async function stopped(page: Page, time: number) {
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-media-playing",
    "false",
  );
  await expect
    .poll(() =>
      page
        .locator("#phase-media")
        .evaluate(
          (node, expected) =>
            Math.abs((node as HTMLVideoElement).currentTime - expected),
          time,
        ),
    )
    .toBeLessThan(0.045);
  await expect(
    page.locator('.slide[aria-current="true"] canvas'),
  ).toHaveAttribute("data-media-time", String(time));
}

async function pixels(page: Page, selector: string) {
  return page
    .locator(selector)
    .evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
}

test("one decoder gates each video phase and synchronizes private text and every displayed frame", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await fixture(page);
  const audience = await open(page, "#audience-open");
  const prompt = await open(page, "#teleprompter-open");
  const stage = '.slide[aria-current="true"] canvas';
  await expect(page.locator("video")).toHaveCount(1);
  await expect(audience.locator("video")).toHaveCount(0);
  await expect(prompt.locator("video")).toHaveCount(0);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  await expect(page.locator(".prompt-word.is-current")).toHaveText("First");
  await page.keyboard.press("ArrowRight");
  await stopped(page, 1.4);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  expect(await pixels(audience, stage)).toBe(await pixels(page, stage));
  expect(await pixels(prompt, "#current-preview canvas")).toBe(
    await pixels(page, stage),
  );
  await audience.keyboard.press("ArrowRight");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "2",
  );
  await expect(page.locator(".prompt-word.is-current")).toHaveText("Second");
  await stopped(page, 3.8);
  const finalFrame = await pixels(page, stage);
  await page.waitForTimeout(500);
  await stopped(page, 3.8);
  await expect(page.locator(".prompt-word.is-current")).toHaveText("Second");
  expect(await pixels(page, stage)).toBe(finalFrame);
  expect(await pixels(audience, stage)).toBe(finalFrame);
  expect(await pixels(prompt, "#current-preview canvas")).toBe(finalFrame);
  await prompt.keyboard.press("ArrowRight");
  await stopped(page, 18);
  await prompt.keyboard.press("ArrowLeft");
  await stopped(page, 3.8);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "2",
  );
  await page.keyboard.press("ArrowLeft");
  await stopped(page, 1.4);
  await expect(prompt.locator(".prompt-word.is-current")).toHaveText("First");
  await page.keyboard.press("ArrowLeft");
  await stopped(page, 0);
  await expect(page.locator(".prompt-word.is-current")).toHaveText(
    "Introduction.",
  );
  await page.evaluate(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        repeat: true,
        bubbles: true,
      }),
    ),
  );
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "0",
  );
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await stopped(page, 0);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "0",
  );
  await expect(page.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(await audience.content()).not.toContain("First phase narration");
  expect(errors).toEqual([]);
});

test("reduced motion seeks one final phase frame without playback and can change during playback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await fixture(page);
  await page.keyboard.press("ArrowRight");
  await stopped(page, 1.4);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  await expect(page.locator("#phase-media")).toHaveJSProperty("paused", true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-media-playing",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await stopped(page, 3.8);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "2",
  );
});

test("missing, invalid, failed and out-of-range media preserve usable manual controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const mode of [
    "missing",
    "invalid",
    "broken",
    "out-of-range",
  ] as const) {
    await fixture(page, mode);
    await expect(page.locator(".presenter-status")).toContainText(
      "Vorschaubilder und der Sprechtext bleiben verfügbar",
    );
    await expect(page.locator('.slide[aria-current="true"] svg')).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".kollo-presenter")).toHaveAttribute(
      "data-media-playing",
      "false",
    );
    if (mode === "invalid")
      await expect(page.locator("#count")).toHaveText("2 / 2");
    else {
      await expect(page.locator(".kollo-presenter")).toHaveAttribute(
        "data-phase",
        "1",
      );
      await expect(page.locator(".prompt-word.is-current")).toHaveText("First");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator(".kollo-presenter")).toHaveAttribute(
        "data-phase",
        "2",
      );
      await expect(page.locator(".kollo-presenter")).toHaveAttribute(
        "data-media-playing",
        "false",
      );
    }
  }
  expect(errors).toEqual([]);
});

test("navigation while metadata loads commits only the latest phase without stale playback", async ({
  page,
}) => {
  const release = await fixture(page, "delayed");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  await page.keyboard.press("ArrowLeft");
  release();
  await stopped(page, 0);
  await page.waitForTimeout(250);
  await expect(page.locator("#phase-media")).toHaveJSProperty("paused", true);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "0",
  );
  await expect(page.locator(".prompt-word.is-current")).toHaveText(
    "Introduction.",
  );
});
