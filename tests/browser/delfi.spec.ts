import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const route = "/examples/delfi/vorfuehren.html";
const offlineFolder = path.resolve("qa/delfi-browser");
const root = ".kollo-presenter";
const media = "#phase-media";
type Scene = {
  id: string;
  start: number;
  starts: number[];
  stops: number[];
  labels: string[];
  offsets: number[];
};
let phases: Scene[];
let speeches: string[];

const clock = (page: Page) =>
  page.locator(media).evaluate((video: HTMLVideoElement) => video.currentTime);
const canvas = (page: Page, index: number) =>
  page.locator(`.media-canvas[data-media-slide="${index}"]:visible`);
async function ready(page: Page) {
  await expect(page.locator(root)).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(media)
        .evaluate((v: HTMLVideoElement) => !v.seeking && v.readyState >= 2),
    )
    .toBe(true);
  expect(
    await page.locator(media).evaluate((v: HTMLVideoElement) => v.duration),
  ).toBeCloseTo(392, 1);
  await stable(page, 0, 0);
}
async function stable(page: Page, index: number, phase: number) {
  const expectedTime = phase
    ? phases[index].stops[phase - 1]
    : phases[index].start;
  await expect(page.locator(root)).toHaveAttribute(
    "data-slide-index",
    String(index),
  );
  await expect(page.locator(root)).toHaveAttribute("data-phase", String(phase));
  await expect(page.locator(root)).toHaveAttribute(
    "data-media-playing",
    "false",
  );
  await expect(canvas(page, index)).toBeVisible();
  await expect
    .poll(async () =>
      Number(await canvas(page, index).getAttribute("data-media-time")),
    )
    .toBeCloseTo(expectedTime, 2);
}
async function open(page: Page, role: "audience" | "teleprompter") {
  const waiting = page.waitForEvent("popup");
  await page.locator(`#${role}-open`).click();
  const child = await waiting;
  await expect(child.locator(root)).toBeVisible();
  return child;
}
async function finishNext(page: Page) {
  await page.keyboard.press("ArrowRight");
  if ((await page.locator(root).getAttribute("data-media-playing")) === "true")
    await page.keyboard.press("ArrowRight");
}
async function frame(page: Page, index: number) {
  return canvas(page, index).evaluate((element: HTMLCanvasElement) => {
    const pixels = element
      .getContext("2d")!
      .getImageData(0, 0, element.width, element.height).data;
    let hash = 2166136261,
      energy = 0;
    for (let i = 0; i < pixels.length; i += 16) {
      for (let channel = 0; channel < 3; channel++) {
        const value = pixels[i + channel];
        hash = Math.imul(hash ^ value, 16777619);
        energy += value;
      }
    }
    return {
      hash: hash >>> 0,
      energy,
      width: element.width,
      height: element.height,
    };
  });
}
async function equalFrames(pages: Page[], index: number) {
  const expected = await frame(pages[0], index);
  expect(expected.energy).toBeGreaterThan(1000);
  expect([expected.width, expected.height]).toEqual([1280, 720]);
  for (const page of pages.slice(1))
    await expect.poll(() => frame(page, index)).toEqual(expected);
  return expected.hash;
}
function watch(page: Page, errors: string[]) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /content security|violates|refused/i.test(message.text())
    )
      errors.push(message.text());
  });
}

test.beforeAll(async () => {
  const { buildDelfi } = await import(
    pathToFileURL(path.resolve("scripts/build-delfi.mjs")).href
  );
  await buildDelfi(offlineFolder);
  phases = JSON.parse(
    await fs.readFile("showcases/delfi/phases.json", "utf8"),
  ).scenes;
  speeches = JSON.parse(
    await fs.readFile("showcases/delfi/content.json", "utf8"),
  ).scenes.map((scene: { speech: string }) => scene.speech);
});

test("DELFI advances one real animation phase with inline narration and identical frames in all three views", async ({
  page,
  context,
  baseURL,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  watch(page, errors);
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|$)/.test(baseURL || "")) {
    await page.route(`**${route}`, async (intercepted) => {
      const response = await intercepted.fetch();
      await intercepted.fulfill({
        response,
        headers: {
          ...response.headers(),
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
        },
      });
    });
  }
  await page.goto(route);
  await page.unroute(`**${route}`);
  const origin = new URL(page.url()).origin;
  context.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).origin !== origin
    )
      external.push(request.url());
  });
  await ready(page);
  const audience = await open(page, "audience"),
    prompt = await open(page, "teleprompter");
  for (const child of [audience, prompt]) watch(child, errors);
  for (const view of [audience, prompt]) await stable(view, 0, 0);
  const baseline = await equalFrames([page, audience, prompt], 0);
  await expect(page.locator("#notes")).toBeVisible();
  await expect(page.locator(".prompt-script .prompt-marker")).toHaveCount(
    phases[0].stops.length + 1,
  );
  expect(await page.locator(".prompt-script").textContent()).toEqual(
    await prompt.locator(".prompt-script").textContent(),
  );
  expect(await audience.content()).not.toContain(speeches[0]);
  await expect(
    audience.locator(".prompt-script, .prompt-marker, #phase-media"),
  ).toHaveCount(0);
  await expect(prompt.locator("#phase-media")).toHaveCount(0);
  const initialWord = await page
    .locator(".prompt-word.is-current")
    .textContent();
  await page.waitForTimeout(450);
  await stable(page, 0, 0);
  expect(await page.locator(".prompt-word.is-current").textContent()).toEqual(
    initialWord,
  );
  await audience.keyboard.press("ArrowRight");
  await expect(page.locator(root)).toHaveAttribute("data-phase", "1");
  await expect
    .poll(() => clock(page))
    .toBeGreaterThan(phases[0].starts[0] + 0.1);
  for (const view of [page, audience, prompt]) await stable(view, 0, 1);
  expect(await equalFrames([page, audience, prompt], 0)).not.toBe(baseline);
  const word = speeches[0]
    .slice(phases[0].offsets[0])
    .trimStart()
    .split(/\s+/)[0];
  for (const reader of [page, prompt]) {
    await expect(reader.locator(".prompt-word.is-current")).toHaveText(word);
    await expect(reader.locator(".prompt-marker.is-done")).toHaveCount(1);
    await expect(reader.locator("#reader-toggle")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }
  await prompt.keyboard.press("ArrowRight");
  await expect(page.locator(root)).toHaveAttribute(
    "data-media-playing",
    "true",
  );
  await audience.keyboard.press("ArrowRight");
  for (const view of [page, audience, prompt]) await stable(view, 0, 2);
  await equalFrames([page, audience, prompt], 0);
  await page.waitForTimeout(450);
  await stable(page, 0, 2);
  await prompt.keyboard.press("ArrowRight");
  await stable(page, 1, 0);
  await audience.keyboard.press("ArrowLeft");
  for (const view of [page, audience, prompt])
    await stable(view, 0, phases[0].stops.length);
  await page.keyboard.press("ArrowLeft");
  await stable(page, 0, phases[0].stops.length - 1);
  await page.screenshot({
    path: path.join(offlineFolder, "desktop.png"),
    fullPage: true,
  });
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("all 16 scenes keep every curated phase, inline cue and speech position reachable in both directions", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(route);
  await ready(page);
  const prompt = await open(page, "teleprompter");
  await expect(prompt.locator("#jump option")).toHaveCount(16);
  for (const [index, scene] of phases.entries()) {
    await prompt.locator("#jump").selectOption(String(index));
    await stable(page, index, 0);
    await expect(page.locator(".prompt-marker")).toHaveCount(
      scene.stops.length + (index < phases.length - 1 ? 1 : 0),
    );
    await expect(page.locator("#cue-warning")).toBeHidden();
    for (let phase = 1; phase <= scene.stops.length; phase++) {
      await finishNext(page);
      for (const view of [page, prompt]) await stable(view, index, phase);
      const word = speeches[index]
        .slice(scene.offsets[phase - 1])
        .trimStart()
        .split(/\s+/)[0];
      for (const reader of [page, prompt]) {
        await expect(reader.locator(".prompt-word.is-current")).toHaveText(
          word,
        );
        await expect(reader.locator(".prompt-marker.is-done")).toHaveCount(
          phase,
        );
      }
    }
    await equalFrames([page, prompt], index);
    if (index < phases.length - 1) {
      await page.keyboard.press("ArrowRight");
      await stable(page, index + 1, 0);
      await page.keyboard.press("ArrowLeft");
      await stable(page, index, scene.stops.length);
    } else {
      await expect(page.locator("#next")).toBeDisabled();
      await page.keyboard.press("ArrowRight");
      await stable(page, index, scene.stops.length);
    }
    if (index === 11)
      await page.screenshot({
        path: path.join(offlineFolder, "pipeline.png"),
        fullPage: true,
      });
  }
});

test("DELFI retains cancelled navigation and isolates or relinquishes popup ownership", async ({
  page,
  context,
}) => {
  await page.goto(route);
  await ready(page);
  const first = await open(page, "audience");
  for (const view of [page, first])
    await view.evaluate(() => {
      const cancelled = new Event("beforeunload", { cancelable: true });
      cancelled.preventDefault();
      window.dispatchEvent(cancelled);
    });
  await page.locator("#audience-open").click();
  expect(context.pages()).toHaveLength(2);
  expect(first.isClosed()).toBe(false);
  const another = await context.newPage();
  await another.goto(route);
  await ready(another);
  const second = await open(another, "audience");
  expect(await first.evaluate(() => window.name)).not.toBe(
    await second.evaluate(() => window.name),
  );
  await finishNext(first);
  await stable(page, 0, 1);
  await stable(another, 0, 0);
  await first.reload();
  await expect(page.locator(".presenter-status")).toContainText(/getrennt/);
  const afterReload = await open(page, "audience");
  await stable(afterReload, 0, 1);
  expect(first.isClosed()).toBe(false);
  expect(await first.evaluate(() => window.name)).not.toBe(
    await afterReload.evaluate(() => window.name),
  );
  await afterReload.route("https://former-delfi.invalid/**", (intercepted) =>
    intercepted.fulfill({
      contentType: "text/html",
      body: "<title>Unrelated</title><p>Former DELFI audience</p>",
    }),
  );
  await afterReload.goto("https://former-delfi.invalid/");
  const restored = await open(page, "audience");
  await stable(restored, 0, 1);
  await expect(afterReload.getByText("Former DELFI audience")).toBeVisible();
  await another.close();
  await expect.poll(() => second.isClosed()).toBe(true);
  expect(restored.isClosed()).toBe(false);
  await page.goto("about:blank");
  await expect.poll(() => restored.isClosed()).toBe(true);
  expect(first.isClosed()).toBe(false);
  expect(afterReload.isClosed()).toBe(false);
});

test("downloaded DELFI runs offline with the same phases, popups and readable mobile notes", async ({
  page,
  context,
}) => {
  const external: string[] = [],
    errors: string[] = [];
  context.on("request", (request) => {
    if (/^https?:/.test(request.url())) external.push(request.url());
  });
  watch(page, errors);
  await context.setOffline(true);
  await page.goto(
    pathToFileURL(path.join(offlineFolder, "presentation.html")).href,
  );
  await ready(page);
  const audience = await open(page, "audience"),
    prompt = await open(page, "teleprompter");
  for (const child of [audience, prompt]) watch(child, errors);
  await prompt.locator("#jump").selectOption("11");
  await stable(page, 11, 0);
  await finishNext(audience);
  for (const view of [page, audience, prompt]) await stable(view, 11, 1);
  await equalFrames([page, audience, prompt], 11);
  await page.reload();
  await expect.poll(() => audience.isClosed() && prompt.isClosed()).toBe(true);
  await ready(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".prompt-reader")).toBeVisible();
  await expect(page.locator(".prompt-marker").first()).toBeVisible();
  await page.locator("#prompt-font").evaluate((input: HTMLInputElement) => {
    input.value = "48";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#font-value")).toHaveText("48 px");
  await page.locator("#mirror-toggle").click();
  await expect(page.locator(".prompt-script")).toHaveClass(/is-mirrored/);
  await page.locator("#mirror-toggle").click();
  await page.locator("#reader-toggle").click();
  await expect(page.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator(".prompt-reader").hover();
  await page.mouse.wheel(0, 180);
  await expect(page.locator("#reader-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.screenshot({
    path: path.join(offlineFolder, "mobile-prompt.png"),
    fullPage: true,
  });
  await page.locator("#notes-toggle").click();
  await expect(page.locator("#notes")).toBeHidden();
  await page.screenshot({
    path: path.join(offlineFolder, "mobile-video.png"),
    fullPage: true,
  });
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("blocked popup attempts leave the manual phase and narration unchanged", async ({
  page,
}) => {
  await page.goto(route);
  await ready(page);
  const text = await page.locator(".prompt-script").textContent();
  await page.evaluate(() => {
    window.open = () => null;
  });
  for (const role of ["audience", "teleprompter"]) {
    await page.locator(`#${role}-open`).click();
    await expect(page.locator(".presenter-status")).toContainText(/blockiert/i);
    await stable(page, 0, 0);
    expect(await page.locator(".prompt-script").textContent()).toEqual(text);
  }
});
