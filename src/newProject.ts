import { createSlide, defaultDeck, type Deck, type Theme } from "./model";

/** A genuinely new project: no example claims, sources or speaker notes survive. */
export function createBlankDeck(
  title: string,
  duration: number,
  theme: Theme = defaultDeck.theme,
): Deck {
  const slide = createSlide("title");
  return {
    version: 1,
    title: title.trim() || "Mein neuer Vortrag",
    author: "",
    institution: "",
    date: "",
    duration,
    theme: { ...theme },
    slides: [
      {
        ...slide,
        title: title.trim() || "Dein Titel",
        section: "",
        subtitle: "",
        items: [],
        body: "",
        image: "",
        imageAlt: "",
        notes: "",
        source: "",
        transition: "fade",
        reveal: false,
        seconds: 0,
      },
    ],
  };
}
