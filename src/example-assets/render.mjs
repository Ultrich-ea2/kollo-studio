/** Rebuild the embedded, local PNG after editing campus-plan.svg. */
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";

const folder = new URL("./", import.meta.url);
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
let executablePath;
if (process.platform === "win32") {
  try {
    await fs.access(edge);
    executablePath = edge;
  } catch { /* Use the installed Playwright Chromium below. */ }
}
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 360 }, deviceScaleFactor: 2 });
  // This is a bundled, author-owned source asset. It is not an untrusted upload.
  const source = await fs.readFile(new URL("campus-plan.svg", folder), "utf8");
  await page.route("**/*", (route) => route.abort());
  await page.setContent('<html><head><meta charset="utf-8"><style>html,body{margin:0;width:1280px;height:360px}</style></head><body>' + source + "</body></html>");
  const bytes = await page.screenshot();
  await fs.writeFile(new URL("campus-plan.json", folder), JSON.stringify({ image: "data:image/png;base64," + bytes.toString("base64") }, null, 2) + "\n");
} finally {
  await browser.close();
}
