import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { showcaseExamples } from "../src/examples";
import { createScene } from "../src/scene";
import { parseDeck } from "../src/model";

test("authored example cues cover the actual reveal groups and every manual slide change", () => {
  const minimal = parseDeck(
    readFileSync("skills/kollo-theme/assets/beispiel.kollo.json", "utf8"),
  );
  for (const example of [...showcaseExamples, { deck: minimal }]) {
    for (const [index, slide] of example.deck.slides.entries()) {
      const scene = createScene(slide, example.deck, index);
      const groups = new Set(
        scene.elements
          .map((element) => element.group)
          .filter((group) => group !== undefined),
      );
      const expectedClicks = slide.reveal ? groups.size : 0;
      const lines = slide.notes.replace(/\r\n?/g, "\n").split("\n");
      const clicks = lines.filter((line) => line.trim() === "[KLICK]");
      const changes = lines.filter((line) => line.trim() === "[FOLIE]");
      const isLast = index === example.deck.slides.length - 1;
      assert.equal(clicks.length, expectedClicks, slide.id);
      assert.equal(changes.length, isLast ? 0 : 1, slide.id);
      if (!isLast) assert.ok(slide.notes.trimEnd().endsWith("[FOLIE]"));

      // Every reveal cue introduces an explanation before the next action.
      // Adjacent cues would otherwise ask for unexplained repeated clicks.
      const parts = slide.notes.split(/^[ \t]*\[(KLICK|FOLIE)\][ \t]*$/m);
      for (let part = 1; part < parts.length; part += 2) {
        if (parts[part] === "KLICK")
          assert.ok(parts[part + 1].trim().length > 0, slide.id);
      }
      const visibleText = scene.elements
        .filter((element) => element.type === "text")
        .map((element) => element.text)
        .join(" ");
      assert.doesNotMatch(visibleText, /\[(?:KLICK|FOLIE)\]/, slide.id);
    }
  }
});
