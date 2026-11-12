import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { defaultDeck, type Deck } from "../model";
import { showcaseExamples } from "../examples";
import { createBlankDeck } from "../newProject";

export function NewProject({ onCreate }: { onCreate: (deck: Deck) => void }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("10");
  const [design, setDesign] = useState("classic");
  const [error, setError] = useState("");
  return (
    <section className="new-project" aria-labelledby="new-project-title">
      <div className="new-project-intro">
        <p className="eyebrow">NEUSTART / OHNE VORLAGE</p>
        <h2 id="new-project-title">
          Folie 01.
          <br />
          Alles offen.
        </h2>
        <p>
          Ein Titel, eine Zeit, eine erste Richtung. Danach bestimmst du, welche
          Folien deine Geschichte braucht.
        </p>
        <span className="new-project-format">
          16:9 <span>DEIN NÄCHSTER VORTRAG</span>
        </span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const minutes = Number(duration);
          if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
            setError("Bitte eine Redezeit von 1 bis 240 Minuten eingeben.");
            return;
          }
          setError("");
          onCreate(
            createBlankDeck(
              title,
              minutes,
              showcaseExamples.find((example) => example.id === design)?.deck
                .theme || defaultDeck.theme,
            ),
          );
        }}
      >
        <label>
          Arbeitstitel
          <input
            aria-label="Neuer Arbeitstitel"
            maxLength={160}
            value={title}
            placeholder="Worum geht dein Vortrag?"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="new-project-options">
          <label>
            Redezeit in Minuten
            <input
              type="number"
              min="1"
              max="240"
              step="1"
              required
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </label>
          <label>
            Gestaltung
            <select
              aria-label="Gestaltung"
              value={design}
              onChange={(event) => setDesign(event.target.value)}
            >
              <option value="classic">Kollo / klassisch</option>
              {showcaseExamples.map((example) => (
                <option key={example.id} value={example.id}>
                  {example.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" className="button primary">
          Leeres Projekt anlegen <ArrowUpRight size={18} />
        </button>
        <small>
          Das aktuelle Projekt lässt sich anschließend mit „Rückgängig“
          wiederherstellen.
        </small>
      </form>
    </section>
  );
}
