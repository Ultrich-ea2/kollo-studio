import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { presenterCss } from "../../src/presenter/styles";

type ClockProbe = {
  holdHost: boolean;
  delivered: number;
  suppressed: number;
  wallOffset: number;
  writes: number;
};
async function fixture(page: Page, short = false) {
  const runtime = (
    await fs.readFile("src/presenter/runtime.mjs", "utf8")
  ).replace("export function mountPresenter(", "function mountPresenter(");
  const words = (from: number, count: number) =>
    Array.from({ length: count }, (_, i) => "word" + (from + i)).join(" ");
  const notes = short
    ? words(0, 8) +
      "\n[KLICK]\n" +
      words(8, 8) +
      "\n[KLICK]\n" +
      words(16, 8) +
      "\n[FOLIE]"
    : words(0, 200) +
      "\n[KLICK]\nMore words for the next phase.\n[KLICK]\nThe final phase.\n[FOLIE]";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><text x="100" y="100">Clock fixture</text><text data-group="1" x="100" y="180">One</text><text data-group="2" x="100" y="260">Two</text></svg>';
  const options = {
    title: "Reader clock",
    duration: 10,
    showNotes: true,
    css: presenterCss,
    slides: [
      {
        title: "Reading",
        svg,
        notes,
        reveal: true,
        transition: "none",
        seconds: 60,
      },
      {
        title: "Final",
        svg,
        notes: "The final slide stays manual.",
        reveal: false,
        transition: "none",
        seconds: 10,
      },
    ],
  };
  const script =
    String.raw`
    window.__clockProbe = {holdHost:false,delivered:0,suppressed:0,wallOffset:0,writes:0};
    const nativeInterval = window.setInterval.bind(window);
    window.setInterval = (callback, delay, ...args) => nativeInterval(() => {
      if (delay === 100) {
        if (window.__clockProbe.holdHost) { window.__clockProbe.suppressed++; return; }
        window.__clockProbe.delivered++;
      }
      callback(...args);
    }, delay);
    const nativeDate = Date.now.bind(Date);
    Date.now = () => nativeDate() + window.__clockProbe.wallOffset;
  ` +
    runtime +
    ";mountPresenter(document.getElementById('root')," +
    JSON.stringify(options) +
    ");new MutationObserver(records => window.__clockProbe.writes += records.length).observe(document.getElementById('clock'), {childList:true});";
  const hash = createHash("sha256").update(script).digest("base64");
  const file = path.resolve("qa/reader-clock-fixture.html");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(
    file,
    '<!doctype html><html lang="de"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'sha256-' +
      hash +
      '\'; style-src \'unsafe-inline\'; img-src data:"><title>Reader clock fixture</title><body style="margin:0"><div id="root"></div><script>' +
      script +
      "</script></body></html>",
  );
  await page.goto(pathToFileURL(file).href);
  await expect(page.locator(".kollo-presenter")).toBeVisible();
}
async function probe(page: Page, values?: Partial<ClockProbe>) {
  return page.evaluate((updates) => {
    const state = (window as unknown as { __clockProbe: ClockProbe })
      .__clockProbe;
    if (updates) Object.assign(state, updates);
    return { ...state };
  }, values);
}
async function open(page: Page, role: "audience" | "teleprompter") {
  const pending = page.waitForEvent("popup");
  await page.locator("#" + role + "-open").click();
  const child = await pending;
  await expect(child.locator(".kollo-presenter")).toBeVisible();
  return child;
}
const read = (page: Page) => page.locator(".prompt-word.is-read").count();
async function waiting(page: Page, cue: string) {
  await expect(page.locator(".prompt-marker.is-waiting")).toHaveAttribute(
    "data-cue",
    cue,
  );
  await expect(page.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
}

test("visible children keep the offline reader and timer moving when controller callbacks are suppressed", async ({
  page,
  context,
}) => {
  const network: string[] = [],
    errors: string[] = [];
  context.on("request", (request) => {
    if (/^https?:/.test(request.url())) network.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await context.setOffline(true);
  await fixture(page, true);
  const audience = await open(page, "audience");
  let prompt = await open(page, "teleprompter");
  await probe(page, { holdHost: true });
  const delivered = (await probe(page)).delivered;
  await prompt.locator("#reader-toggle").click();
  await prompt.locator("#timer-toggle").click();
  await expect.poll(() => read(prompt)).toBeGreaterThan(1);
  await expect(prompt.locator("#clock")).not.toHaveText("00:00");
  await waiting(prompt, "0");
  expect((await probe(page)).delivered).toBe(delivered);
  expect((await probe(page)).suppressed).toBeGreaterThan(5);
  await page.waitForTimeout(400);
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "0",
  );
  await audience.keyboard.press("ArrowRight");
  await expect.poll(() => read(prompt)).toBeGreaterThan(8);
  const beforeClose = await read(page);
  await prompt.close();
  await expect.poll(() => read(page)).toBeGreaterThan(beforeClose);
  prompt = await open(page, "teleprompter");
  await waiting(prompt, "1");
  await expect(page.locator(".kollo-presenter")).toHaveAttribute(
    "data-phase",
    "1",
  );
  await expect(page.locator("#count")).toHaveText("1 / 2");
  await probe(page, { holdHost: false });
  await prompt.close();
  await audience.close();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => read(page)).toBeGreaterThan(16);
  await waiting(page, "2");
  await expect(page.locator("#count")).toHaveText("1 / 2");
  expect(network).toEqual([]);
  expect(errors).toEqual([]);
});

for (const wallOffset of [-3_600_000, 3_600_000])
  test(
    "wall-clock jump " +
      wallOffset +
      " cannot rewind or skip narration or the timer",
    async ({ page }) => {
      await fixture(page);
      const prompt = await open(page, "teleprompter");
      await prompt.locator("#reader-toggle").click();
      await prompt.locator("#timer-toggle").click();
      await expect.poll(() => read(prompt)).toBeGreaterThan(1);
      const before = await read(prompt);
      await probe(page, { wallOffset });
      await page.waitForTimeout(750);
      const after = await read(prompt);
      expect(after).toBeGreaterThanOrEqual(before);
      expect(after).toBeLessThan(before + 6);
      await expect(prompt.locator("#reader-toggle")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(prompt.locator("#clock")).toHaveText(/^00:0[1-9]$/);
      await expect(page.locator("#clock")).toHaveText(
        (await prompt.locator("#clock").textContent())!,
      );
      await probe(page, { wallOffset: 0 });
      await prompt.locator("#reader-toggle").click();
      const paused = await read(prompt);
      await page.waitForTimeout(500);
      expect(await read(prompt)).toBe(paused);
      await prompt.locator("#reader-toggle").click();
      await expect.poll(() => read(prompt)).toBeGreaterThan(paused);
    },
  );

test("three visible windows coalesce periodic rendering and retain one speaking pace", async ({
  page,
}) => {
  await fixture(page);
  await open(page, "audience");
  const prompt = await open(page, "teleprompter");
  await prompt.locator("#reader-toggle").click();
  await prompt.locator("#timer-toggle").click();
  await page.waitForTimeout(200);
  const before = await probe(page),
    wordBefore = await read(prompt);
  await page.waitForTimeout(1200);
  const after = await probe(page),
    wordAfter = await read(prompt);
  expect(after.writes - before.writes).toBeGreaterThanOrEqual(7);
  expect(after.writes - before.writes).toBeLessThanOrEqual(18);
  expect(wordAfter - wordBefore).toBeGreaterThanOrEqual(2);
  expect(wordAfter - wordBefore).toBeLessThanOrEqual(4);
});
