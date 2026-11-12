import { test, expect } from "@playwright/test";
test("an incomplete chart cannot replace a valid saved project and JSON can rescue the draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page.getByLabel("Projektname", { exact: true }).fill("Sichere Fassung");
  await expect(
    page.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Folie 7: Unterschiede sichtbar machen" })
    .click();
  await page
    .getByRole("textbox", { name: "Eintrag 1", exact: true })
    .fill("noch keine Zahl");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Entwurf noch nicht gespeichert" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kollo.project.v1")!).deck.slides[6]
          .items[0],
    ),
  ).toBe("12 | Variante A");
  await page.getByRole("button", { name: "Mitnehmen", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page
    .locator(".export-card")
    .filter({
      has: page.getByRole("heading", { name: "Projekt sichern", exact: true }),
    })
    .getByRole("button")
    .click();
  expect((await pending).suggestedFilename()).toContain("kollo.json");
  await page
    .locator(".export-card")
    .filter({
      has: page.getByRole("heading", { name: "Weiterarbeiten", exact: true }),
    })
    .getByRole("button")
    .click();
  await expect(page.locator(".toast")).toContainText("Export fehlgeschlagen");
  await page.getByRole("button", { name: "Werkstatt", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Eintrag 1", exact: true })
    .fill("14 | Meine Messung");
  await expect(
    page.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kollo.project.v1")!).deck.slides[6]
          .items[0],
    ),
  ).toBe("14 | Meine Messung");
});
test("multiline columns preserve item boundaries and revealed items stay hidden until requested", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Werkstatt öffnen" }).click();
  await page
    .getByRole("button", {
      name: "Folie 4: Zwei Wege unter gleichen Bedingungen",
    })
    .click();
  await page
    .getByRole("textbox", { name: "Perspektive 1", exact: true })
    .fill("Variante A\nErste Zeile\nZweite Zeile");
  await expect(
    page.getByRole("status").filter({ hasText: "Lokal gespeichert" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("kollo.project.v1")!).deck.slides[3]
          .items.length,
    ),
  ).toBe(2);
  await page
    .getByLabel("Inhalte schrittweise zeigen", { exact: false })
    .check();
  await page.getByRole("button", { name: "Präsentieren", exact: true }).click();
  await page.waitForTimeout(800);
  expect(
    await page.locator(".scene-element.is-hidden").count(),
  ).toBeGreaterThan(0);
  expect(
    await page
      .locator(".scene-element.is-hidden")
      .first()
      .evaluate((e) => getComputedStyle(e).visibility),
  ).toBe("hidden");
  const before = await page.locator(".scene-element.is-hidden").count();
  await page.keyboard.press("ArrowRight");
  expect(await page.locator(".scene-element.is-hidden").count()).toBeLessThan(
    before,
  );
});
