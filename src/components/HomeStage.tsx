import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Download,
  Play,
  Plus,
} from "lucide-react";
import type { Deck } from "../model";
import { createScene, svgMarkup } from "../scene";

type Props = {
  deck: Deck;
  onEditor: () => void;
  onTemplates: () => void;
  onCode: () => void;
  onDownloads: () => void;
  onPresent: (index: number) => void;
};

export function HomeStage({
  deck,
  onEditor,
  onTemplates,
  onCode,
  onDownloads,
  onPresent,
}: Props) {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, deck.slides.length - 1);
  const slide = deck.slides[index];
  const preview = useMemo(
    () => svgMarkup(createScene(slide, deck, index)),
    [slide, deck, index],
  );
  return (
    <div className="launchpad">
      <div className="launch-index">
        <span>PRÄSENTATIONEN MIT EIGENEM KOPF.</span>
        <span>ENTWERFEN / PROBEN / ZEIGEN</span>
      </div>
      <section className="launch-heading" aria-labelledby="launch-title">
        <h1 id="launch-title">
          Zeig, was
          <br />
          du <span>meinst.</span>
        </h1>
        <div className="launch-intro">
          <span className="launch-mark" aria-hidden="true">
            <ArrowDown strokeWidth={1.2} />
          </span>
          <p>
            Aus deiner Arbeit wird ein Auftritt.
            <br />
            Bring Gedanken in Form, finde deinen Rhythmus und nimm alles mit.
          </p>
          <button className="button primary launch-open" onClick={onEditor}>
            Werkstatt öffnen <ArrowUpRight size={20} />
          </button>
          <button className="text-button" onClick={onTemplates}>
            <Plus size={17} /> Neu anfangen & Beispiele
          </button>
        </div>
      </section>
      <section className="project-deck" aria-label="Dein aktuelles Projekt">
        <div className="project-ticket">
          <div className="ticket-top">
            <span className="eyebrow">AUF DEINEM TISCH</span>
            <span className="ticket-status">
              <i /> Auf diesem Gerät
            </span>
          </div>
          <h2>{deck.title}</h2>
          <dl>
            <div>
              <dt>Umfang</dt>
              <dd>{String(deck.slides.length).padStart(2, "0")} Folien</dd>
            </div>
            <div>
              <dt>Zielzeit</dt>
              <dd>{deck.duration} Min.</dd>
            </div>
          </dl>
          <p>
            Hier siehst du dein aktuelles Projekt. Blättere durch die Folien
            oder probiere deinen Vortrag aus.
          </p>
          <button
            className="ticket-play"
            onClick={() => onPresent(index)}
            aria-label="Aktuelles Projekt ausprobieren"
          >
            <Play size={21} fill="currentColor" />
            <span>Vorhang auf</span>
            <ArrowUpRight size={18} />
          </button>
          <span className="ticket-perforation" aria-hidden="true" />
        </div>
        <div className="project-screen">
          <div className="screen-registration">
            <span>VORSCHAU / {String(index + 1).padStart(2, "0")}</span>
            <span>16:9</span>
          </div>
          <div
            className="home-proof-stage"
            role="img"
            aria-label={`Dein Projekt, Folie ${index + 1}: ${slide.title}`}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          <div
            className="proof-sequence"
            aria-label="Projektvorschau: Folie wählen"
          >
            {deck.slides.map((item, i) => (
              <button
                key={item.id}
                aria-label={`Projektvorschau: Folie ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => setSelected(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="workflow-directory" aria-label="Deine Arbeitsweise">
        <div className="directory-heading">
          <span className="eyebrow">DREI EINGÄNGE. DEIN WEG.</span>
          <p>Wo möchtest du ansetzen?</p>
        </div>
        <button onClick={onEditor}>
          <span className="directory-index">01</span>
          <strong>Direkt gestalten</strong>
          <span>Inhalte, Bild, Bewegung.</span>
          <ArrowUpRight />
        </button>
        <button onClick={onCode}>
          <span className="directory-index">02</span>
          <strong>In Code denken</strong>
          <span>Dein Projekt als offenes JSON.</span>
          <Code2 />
        </button>
        <a href="./downloads/kollo-theme.zip" download>
          <span className="directory-index">03</span>
          <strong>Mit KI anfangen</strong>
          <span>Der Skill gibt deiner KI das Handwerk.</span>
          <Download />
        </a>
      </section>
      <section className="takeaway-strip">
        <div>
          <span className="eyebrow">DER VORTRAG GEHÖRT DIR.</span>
          <h2>
            Fertig?
            <br />
            Nimm ihn mit.
          </h2>
        </div>
        <div>
          <p>
            PowerPoint zum Weiterarbeiten. PDF für die Abgabe. HTML für den
            Auftritt mit Animationen und Teleprompter.
          </p>
          <button className="button" onClick={onDownloads}>
            Alle Formate ansehen <ArrowRight size={18} />
          </button>
        </div>
        <span className="takeaway-stamp" aria-hidden="true">
          .ZIP
          <br />
          .PPTX
          <br />
          .HTML
        </span>
      </section>
    </div>
  );
}
