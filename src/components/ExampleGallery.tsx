import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Play,
} from "lucide-react";
import { showcaseExamples } from "../examples";
import { createScene, svgMarkup } from "../scene";
import type { Deck } from "../model";
import "./examples.css";

type Props = {
  onUse: (deck: Deck) => void;
  onPreview: (deck: Deck) => void;
  onDownload: (deck: Deck) => void;
};

function Example({
  example,
  order,
  onUse,
  onPreview,
  onDownload,
}: Props & { example: (typeof showcaseExamples)[number]; order: number }) {
  const [index, setIndex] = useState(0);
  const { deck } = example;
  const slide = deck.slides[index];
  return (
    <article className={`showcase showcase-${example.id}`}>
      <div className="showcase-caption">
        <span className="showcase-number">0{order + 1}</span>
        <div>
          <p className="eyebrow">
            {deck.slides.length} FOLIEN · FIKTIVES BEISPIEL
          </p>
          <h3>{example.name}</h3>
          <p>{example.description}</p>
        </div>
      </div>
      <div
        className="showcase-stage"
        role="img"
        aria-label={`${example.name}, Folie ${index + 1}: ${slide.title}`}
        dangerouslySetInnerHTML={{
          __html: svgMarkup(createScene(slide, deck, index)),
        }}
      />
      <div
        className="showcase-pagination"
        aria-label={`${example.name}: Folienvorschau`}
      >
        <button
          aria-label={`${example.name}: vorherige Folie`}
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          <ArrowLeft size={17} />
        </button>
        <span aria-live="polite">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(deck.slides.length).padStart(2, "0")}
        </span>
        <button
          aria-label={`${example.name}: nächste Folie`}
          disabled={index === deck.slides.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          <ArrowRight size={17} />
        </button>
        <button className="showcase-play" onClick={() => onPreview(deck)}>
          <Play size={16} /> {example.name} vorführen
        </button>
      </div>
      <div className="showcase-details">
        <ul>
          {example.designNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <div className="showcase-actions">
          <button className="button primary" onClick={() => onUse(deck)}>
            Als Ausgangspunkt <ArrowUpRight size={17} />
          </button>
          <button
            className="button"
            aria-label={`${example.name} als Projekt herunterladen`}
            onClick={() => onDownload(deck)}
          >
            <Download size={17} /> Projektdatei
          </button>
        </div>
      </div>
    </article>
  );
}

export function ExampleGallery(props: Props) {
  return (
    <section className="example-gallery" aria-labelledby="examples-title">
      <div className="gallery-intro">
        <p className="eyebrow">DREI REGIEN. DREI EIGENE STIMMEN.</p>
        <h2 id="examples-title">
          Schau hin.
          <br />
          <em>Dann mach es anders.</em>
        </h2>
        <p>
          Blättere durch die fertigen Beispiele oder führe sie mit Einblendungen
          und Teleprompter vor. Die Vorschau verändert dein eigenes Projekt
          nicht.
        </p>
      </div>
      {showcaseExamples.map((example, order) => (
        <Example key={example.id} example={example} order={order} {...props} />
      ))}
    </section>
  );
}
