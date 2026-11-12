import fs from "node:fs/promises";
import path from "node:path";
import { showcaseExamples } from "../src/examples";

// One authored source; the portable skill also carries concrete, editable examples.
const folder = path.resolve("skills/kollo-theme/assets/examples");
await fs.mkdir(folder, { recursive: true });
for (const example of showcaseExamples) {
  await fs.writeFile(
    path.join(folder, `${example.id}.kollo.json`),
    JSON.stringify(example.deck, null, 2) + "\n",
  );
}
await fs.copyFile(
  "src/example-assets/campus-plan.svg",
  path.join(folder, "campus-plan.svg"),
);
