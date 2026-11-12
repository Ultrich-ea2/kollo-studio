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
import delfiPreview from "../../showcases/delfi/preview.jpg";
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
  const offline = document.documentElement.dataset.offline === "true";
  return (
    <section className="example-gallery" aria-labelledby="examples-title">
      <div className="gallery-intro">
        <p className="eyebrow">VORLAGEN & EIN ECHTER AUFTRITT</p>
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
      <article className="delfi-showcase">
        <a
          className="delfi-preview"
          href={
            offline
              ? "./downloads/kollo-delfi.zip"
              : "./examples/delfi/vorfuehren.html"
          }
          target={offline ? undefined : "_blank"}
          rel="noopener noreferrer"
          download={offline || undefined}
          aria-label={
            offline
              ? "DELFI-Originaldemo herunterladen"
              : "DELFI-Originaldemo in neuem Tab vorführen"
          }
        >
          <img
            src={delfiPreview}
            width="1920"
            height="1080"
            loading="lazy"
            alt="PyTutorAI: Feedback, das den nächsten Schritt erklärt — Titelszene der DELFI-Präsentation"
          />
          <span className="delfi-duration">
            <Play size={15} aria-hidden="true" /> 6:32
          </span>
        </a>
        <div className="delfi-caption">
          <p className="eyebrow">ORIGINALDEMO · DELFI · 16 SZENEN</p>
          <h3>
            Ein Gedanke.
            <br />
            <em>In Bewegung.</em>
          </h3>
          <p>
            PyTutorAI — Feedback, das den nächsten Schritt erklärt. Die
            vollständige Originalpräsentation mit animierten Abläufen, Demo und
            zeitgenauem Sprechtext.
          </p>
          <p className="delfi-credit">Ultrich Edima Edima · André Greubel</p>
          <div className="delfi-actions">
            {!offline && (
              <a
                className="button primary"
                href="./examples/delfi/vorfuehren.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play size={17} /> Original vorführen <ArrowUpRight size={16} />
              </a>
            )}
            <a className="button" href="./downloads/kollo-delfi.zip" download>
              <Download size={17} /> Demo mitnehmen
            </a>
          </div>
          <p className="delfi-format">
            Video ohne Ton · Teleprompter synchron zum Bild · separates
            Publikumsfenster. Im ZIP direkt per Doppelklick öffnen. Dieses
            Original ist ein Anschauungsbeispiel; die drei Vorlagen darunter
            kannst du im Studio bearbeiten.
          </p>
        </div>
      </article>
      {showcaseExamples.map((example, order) => (
        <Example key={example.id} example={example} order={order} {...props} />
      ))}
    </section>
  );
}
