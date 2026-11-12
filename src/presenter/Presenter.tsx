import { useEffect, useRef } from "react";
import type { Deck } from "../model";
import { createScene, svgMarkup } from "../scene";
import { mountPresenter } from "./runtime.mjs";
import { presenterCss } from "./styles";

/** The runtime is also embedded in HTML exports; no second presenter implementation. */
export function Presenter({
  deck,
  start,
  onClose,
}: {
  deck: Deck;
  start: number;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!root.current) return;
    return mountPresenter(root.current, {
      title: deck.title,
      duration: deck.duration,
      start,
      css: presenterCss,
      slides: deck.slides.map((slide, index) => ({
        title: slide.title,
        svg: svgMarkup(createScene(slide, deck, index)),
        notes: slide.notes,
        reveal: slide.reveal,
        transition: slide.transition,
        seconds: slide.seconds,
      })),
      onClose: () => close.current(),
    });
  }, [deck, start]);
  return <div ref={root} />;
}
