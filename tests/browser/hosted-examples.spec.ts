import { test, expect } from "@playwright/test";

test("hosted example gallery starts all three players and their audience windows under the production CSP", async ({
  page,
  baseURL,
}) => {
  const policy =
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'";
  // Vite preview does not apply vercel.json headers. Reproduce the real policy
  // locally, but preserve the actual response headers when testing production.
  if (
    ["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseURL!).hostname)
  ) {
    await page.route("**/examples/**", async (route) => {
      if (route.request().resourceType() !== "document") {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), "Content-Security-Policy": policy },
      });
    });
  }
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Content Security Policy|violates|Refused/i.test(message.text())
    )
      errors.push(message.text());
  });
  await page.goto("/examples/index.html");
  const links = page.locator('article nav a[href$="/vorfuehren.html"]');
  await expect(links).toHaveCount(3);
  expect(
    await links.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    ),
  ).toEqual([
    "lesespuren/vorfuehren.html",
    "signalweg/vorfuehren.html",
    "spielraum/vorfuehren.html",
  ]);
  for (const id of ["lesespuren", "signalweg", "spielraum"]) {
    const response = await page.request.get(`/examples/${id}/deck.kollo.json`);
    expect(response.ok()).toBe(true);
    const deck = await response.json();
    await page.goto("/examples/index.html");
    await page.locator(`article nav a[href="${id}/vorfuehren.html"]`).click();
    await expect(page).toHaveURL(
      new RegExp(`/examples/${id}/vorfuehren\\.html$`),
    );
    await expect(page.locator("#count")).toHaveText(
      `1 / ${deck.slides.length}`,
    );
    await page.keyboard.press("End");
    await expect(page.locator("#count")).toHaveText(
      `${deck.slides.length} / ${deck.slides.length}`,
    );
    const wait = page.waitForEvent("popup");
    await page
      .getByRole("button", { name: "Publikumsfenster öffnen", exact: true })
      .click();
    const audience = await wait;
    audience.on("pageerror", (error) => errors.push(error.message));
    await expect(audience.locator(".role-audience")).toBeVisible();
    await expect(
      audience.locator('.slide[aria-current="true"]'),
    ).toHaveAttribute(
      "aria-label",
      `${deck.slides.length}: ${deck.slides.at(-1).title}`,
    );
    await audience.keyboard.press("Home");
    await expect(page.locator("#count")).toHaveText(
      `1 / ${deck.slides.length}`,
    );
    await expect(
      audience.locator('.slide[aria-current="true"]'),
    ).toHaveAttribute("aria-label", `1: ${deck.slides[0].title}`);
    await audience.close();
  }
  expect(errors).toEqual([]);
});
