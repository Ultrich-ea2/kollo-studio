import { test } from "node:test";
import assert from "node:assert/strict";
import { createBlankDeck } from "../src/newProject";
import { defaultDeck, validateDeck } from "../src/model";
import { createScene } from "../src/scene";
import { showcaseExamples } from "../src/examples";

test("new presentations contain only a title and chosen design, no example claims or private notes", () => {
  for (const theme of [
    defaultDeck.theme,
    ...showcaseExamples.map((example) => example.deck.theme),
  ]) {
    const original = JSON.stringify(theme);
    const deck = createBlankDeck("  Mein Vortrag  ", 12, theme);
    assert.deepEqual(validateDeck(deck), []);
    assert.equal(deck.title, "Mein Vortrag");
    assert.equal(deck.slides.length, 1);
    assert.equal(deck.duration, 12);
    assert.equal(deck.author + deck.institution + deck.date, "");
    const slide = deck.slides[0];
    assert.equal(slide.title, "Mein Vortrag");
    assert.equal(
      slide.notes +
        slide.source +
        slide.subtitle +
        slide.body +
        slide.image +
        slide.section,
      "",
    );
    assert.deepEqual(slide.items, []);
    assert.deepEqual(createScene(slide, deck, 0).warnings, []);
    assert.notEqual(deck.theme, theme);
    assert.equal(JSON.stringify(theme), original);
  }
});
