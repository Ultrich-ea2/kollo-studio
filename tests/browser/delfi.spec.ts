import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const route = "/examples/delfi/vorfuehren.html";
const offlineFolder = path.resolve("qa/delfi-browser");
const media = "#presentation-video";
const sceneStarts = [
  0, 18, 42, 66, 90, 110, 134, 162, 184, 212, 236, 256, 290, 320, 344, 372,
];
const actualMedia = (page: Page) => page.locator(media);
async function clock(page: Page, selector = media) {
  return page
    .locator(selector)
    .evaluate((video: HTMLVideoElement) => video.currentTime);
}
async function paused(page: Page, selector = media) {
  return page
    .locator(selector)
    .evaluate((video: HTMLVideoElement) => video.paused);
}
async function decodedFrame(page: Page, selector = media) {
  await expect
    .poll(() =>
      page
        .locator(selector)
        .evaluate(
          (video: HTMLVideoElement) => !video.seeking && video.readyState >= 2,
        ),
    )
    .toBe(true);
  // currentTime changes before the seeked event and before the replacement frame
  // is composited. Wait for both before inspecting visuals or the next scene.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
async function ready(page: Page) {
  await expect(page.locator("#play-button")).toBeEnabled();
  await expect
    .poll(() =>
      actualMedia(page).evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  expect(
    await actualMedia(page).evaluate((v: HTMLVideoElement) => v.duration),
  ).toBeCloseTo(392, 1);
}
async function seek(page: Page, time: number) {
  await page.locator("#timeline").evaluate((input: HTMLInputElement, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, time);
  await expect.poll(() => clock(page)).toBeCloseTo(time, 1);
  await decodedFrame(page);
}
async function audience(page: Page) {
  const waiting = page.waitForEvent("popup");
  await page.locator("#detach-button").click();
  const child = await waiting;
  await expect
    .poll(() =>
      child.locator("video").evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  return child;
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
});

test("original DELFI keeps 16 cues and 6:32 media; play, seek, rate and audience stay synchronized under hosted CSP", async ({
  page,
  context,
  baseURL,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  watch(page, errors);
  if (/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|$)/.test(baseURL || ""))
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
  await page.goto(route);
  // Keep the injected response policy, but release interception before opening
  // about:blank + document.write: Chromium otherwise stalls its media requests.
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
  await expect(page.locator(".scene-link")).toHaveCount(16);
  await expect(page.locator("#scene-number")).toHaveText("01 / 16");
  await page.screenshot({
    path: path.join(offlineFolder, "desktop.png"),
    fullPage: true,
  });
  for (let index = 0; index < sceneStarts.length; index++) {
    await page.locator(".scene-link").nth(index).click();
    await expect(page.locator("#scene-number")).toHaveText(
      `${String(index + 1).padStart(2, "0")} / 16`,
    );
    await expect.poll(() => clock(page)).toBeCloseTo(sceneStarts[index], 1);
    await decodedFrame(page);
  }
  await seek(page, 134);
  const initialWord = await page.locator(".word.is-current").textContent();
  const child = await audience(page);
  watch(child, errors);
  await expect.poll(() => clock(child, "video")).toBeCloseTo(134, 1);
  expect(await child.locator("body").textContent()).not.toContain(
    "Bei ausschließlich negativen Zahlen",
  );
  await page.locator("#speed").selectOption("1.25");
  await expect
    .poll(() =>
      child.locator("video").evaluate((v: HTMLVideoElement) => v.playbackRate),
    )
    .toBe(1.25);
  await page.locator("#play-button").click();
  await expect.poll(() => clock(page)).toBeGreaterThan(136);
  await expect(page.locator(".word.is-current")).not.toHaveText(initialWord!);
  await child.keyboard.press("Space");
  await expect.poll(() => paused(page)).toBe(true);
  await expect.poll(() => paused(child, "video")).toBe(true);
  await expect
    .poll(async () =>
      Math.abs((await clock(page)) - (await clock(child, "video"))),
    )
    .toBeLessThan(0.21);
  await child.keyboard.press("ArrowRight");
  await expect(page.locator("#scene-number")).toHaveText("08 / 16");
  await expect.poll(() => clock(child, "video")).toBeCloseTo(162, 1);
  await seek(page, 274);
  await page.screenshot({
    path: path.join(offlineFolder, "pipeline.png"),
    fullPage: true,
  });
  await child.keyboard.press("Home");
  await expect.poll(() => clock(page)).toBe(0);
  await page.locator("#help-button").click();
  await expect(page.locator("#help-dialog")).toContainText(
    "Ultrich Edima Edima",
  );
  await expect(page.locator("#help-dialog")).toContainText("André Greubel");
  await page.locator("#close-help").click();
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("DELFI window ownership survives cancelled navigation, isolates sessions, and relinquishes reloaded or foreign windows", async ({
  page,
  context,
}) => {
  await page.goto(route);
  await ready(page);
  const first = await audience(page);
  await page.evaluate(() => {
    const cancelled = new Event("beforeunload", { cancelable: true });
    cancelled.preventDefault();
    window.dispatchEvent(cancelled);
  });
  await first.evaluate(() => {
    const cancelled = new Event("beforeunload", { cancelable: true });
    cancelled.preventDefault();
    window.dispatchEvent(cancelled);
  });
  await page.locator("#detach-button").click();
  expect(context.pages()).toHaveLength(2);
  expect(first.isClosed()).toBe(false);
  const another = await context.newPage();
  await another.goto(route);
  await ready(another);
  const second = await audience(another);
  expect(await first.evaluate(() => window.name)).not.toBe(
    await second.evaluate(() => window.name),
  );
  await first.keyboard.press("ArrowRight");
  await expect.poll(() => clock(page)).toBeCloseTo(18, 1);
  expect(await clock(another)).toBe(0);
  await first.reload();
  await expect(page.locator("#detach-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const afterReload = await audience(page);
  expect(first.isClosed()).toBe(false);
  expect(await first.evaluate(() => window.name)).not.toBe(
    await afterReload.evaluate(() => window.name),
  );
  await afterReload.route("https://former-delfi.invalid/**", (intercept) =>
    intercept.fulfill({
      contentType: "text/html",
      body: "<title>Unrelated</title><p>Former DELFI audience</p>",
    }),
  );
  await afterReload.goto("https://former-delfi.invalid/");
  const restored = await audience(page);
  await expect(afterReload.getByText("Former DELFI audience")).toBeVisible();
  await expect.poll(() => clock(restored, "video")).toBeCloseTo(18, 1);
  await another.close();
  await expect.poll(() => second.isClosed()).toBe(true);
  expect(restored.isClosed()).toBe(false);
  await page.goto("about:blank");
  await expect.poll(() => restored.isClosed()).toBe(true);
  expect(first.isClosed()).toBe(false);
  expect(afterReload.isClosed()).toBe(false);
});

test("downloaded DELFI HTML plays offline with synchronized video and readable mobile controls", async ({
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
  for (let index = 0; index < sceneStarts.length; index++) {
    await page.locator(".scene-link").nth(index).click();
    await expect(page.locator("#scene-number")).toHaveText(
      `${String(index + 1).padStart(2, "0")} / 16`,
    );
    await expect.poll(() => clock(page)).toBeCloseTo(sceneStarts[index], 1);
    await decodedFrame(page);
  }
  const child = await audience(page);
  watch(child, errors);
  await seek(page, 198);
  await expect.poll(() => clock(child, "video")).toBeCloseTo(198, 1);
  await page.locator("#play-button").click();
  await expect.poll(() => clock(child, "video")).toBeGreaterThan(199);
  await page.locator("#play-button").click();
  await expect.poll(() => paused(child, "video")).toBe(true);
  await page.reload();
  await expect.poll(() => child.isClosed()).toBe(true);
  await ready(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("#script-viewport")).toBeVisible();
  await page.locator("#font-up").click();
  await page.locator("#mirror-button").click();
  await expect(page.locator("body")).toHaveClass(/mirror/);
  await page.locator("#mirror-button").click();
  await page.locator("#script-viewport").hover();
  await page.mouse.wheel(0, 250);
  await expect(page.locator("#follow-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#return-follow").click();
  await expect(page.locator("#follow-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({
    path: path.join(offlineFolder, "mobile-prompt.png"),
    fullPage: true,
  });
  await page.locator("#video-view").click();
  await expect(page.locator("#presentation-video")).toBeVisible();
  await page.screenshot({
    path: path.join(offlineFolder, "mobile-video.png"),
    fullPage: true,
  });
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("DELFI explains blocked popups and keeps countdown cancellation separate from playback", async ({
  page,
}) => {
  await page.goto(route);
  await ready(page);
  await page.evaluate(() => {
    window.open = () => null;
  });
  await page.locator("#detach-button").click();
  await expect(page.locator("#toast")).toContainText(
    "Bitte erlaube das zweite Fenster",
  );
  await page.locator("#countdown-button").click();
  await expect(page.locator("#countdown-overlay")).toBeVisible();
  await page.locator("#cancel-countdown").click();
  await expect(page.locator("#countdown-overlay")).toBeHidden();
  expect(await paused(page)).toBe(true);
  expect(await clock(page)).toBe(0);
});
