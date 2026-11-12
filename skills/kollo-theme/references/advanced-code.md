# Eigene Layouts und Bewegung im Code

Die JSON-Werkstatt bietet zwölf Layouts, vier Kompositionen, vier Übergänge und schrittweise Gruppen. Wenn ein Auftrag mehr verlangt, kläre den gewünschten Ausgabekanal: eine weiter importierbare Kollo-Datei, eine Erweiterung des Studios oder eine individuell programmierte HTML-Präsentation. Keine erfundenen JSON-Felder für Funktionen ausgeben, die der aktuelle Player nicht versteht.

## Mit dem vorhandenen Quellcode arbeiten

Im Studenten-Kit liegt `source/kollo-studio-source.zip`. Entpackt enthält es die vollständige Anwendung und ihre Tests; keine benötigten privaten Referenzprojekte. Das Skill-Paket allein enthält nicht den vollständigen Studioquellcode. Fehlt er bei einem Codeauftrag, das passende Quellcodepaket verwenden statt interne APIs zu erfinden.

| Aufgabe | Zuständiger Code |
| --- | --- |
| Inhalte, Grenzen und neue strukturierte Felder | `src/model.ts`, dazu `skills/kollo-theme/scripts/validate_deck.py` und `references/schema.md` |
| Foliengeometrie, Kontrast, Textumbruch, Darstellungswarnungen | `src/scene.ts` |
| Kuratierte Beispiele und Diagrammquellen | `src/examples.ts`, `src/example-assets/` |
| Gleichzeitige Fenster, Folienstand, Einblendungen, Uhr, Leseführung | `src/presenter/runtime.mjs` |
| Übergänge und sichtbare Bewegung | `src/presenter/styles.ts` |
| Einbindung des Players im Editor | `src/presenter/Presenter.tsx` |
| HTML-, PowerPoint-, PDF- und Arbeitskit-Ausgaben | `src/exports.ts` |
| Offline-Server und Paketstruktur | `scripts/offline-server.mjs`, `scripts/package.mjs` |

Installation für Entwicklung: Node.js 22 oder neuer, `npm ci --ignore-scripts`, dann `npm run dev`. Das ist der Entwicklungsweg; der fertige Offline-Editor benötigt keine Paketinstallation. `npm test`, `npm run test:skill`, `npm run build` und die passenden Browsertests prüfen die betroffenen Abläufe. Nur tatsächlich ausgeführte Prüfungen als bestanden angeben.

## Eine eigenständige Bewegungsregie entwickeln

Zuerst die zu erklärende Veränderung benennen: neu hinzukommender Verarbeitungsschritt, korrigierter Wert, Vergleich zweier Zustände oder Weg durch ein Diagramm. Stabile Bezugspunkte stehen lassen. Veränderliche Elemente räumlich zuordnen, damit das Publikum die Beziehung verfolgen kann. Ein Bewegungsstil ist eine Entscheidung für diesen Inhalt, keine Sammlung möglichst vieler Effekte.

Für zusätzliche CSS-Bewegung wenige klar benannte Varianten implementieren und eine ruhige Endansicht erhalten. `prefers-reduced-motion` respektieren; automatisch laufende Bewegung muss pausierbar sein. Tastatursteuerung, sichtbarer Fokus und kurze, verständliche Bedienelemente erhalten. Frei programmierter Effektcode gehört in eine geprüfte Quelldatei, nicht in importierte Projektdaten oder Sprechernotizen.

Die gemeinsame Szene ist die Quelle für Vorschau und Exporte. Neue visuelle Primitive brauchen eine Umsetzung in Browser, SVG und PPTX/PDF oder einen klar bezeichneten Export-Fallback. Text in einem nativen PowerPoint-Export soll nach Möglichkeit Text bleiben. Für eigene Diagramme die editierbare Quelldatei mitgeben; ein eingebettetes Rasterbild wird dadurch nicht zu editierbaren Einzelobjekten.

## Synchronisation und Spezialformate

Der vorhandene Player hat einen einzigen Besitzer des Zustands. Er öffnet direkt verwaltete Fenster, bindet deren Steuerung an denselben Folien- und Einblendungsstand und gibt keine Notizen in den Publikums-DOM. Neue Fenster nicht über einen globalen Kanal ohne Sitzungszuordnung verbinden. Geschlossene oder neu geladene Fenster müssen ihren Zustand gezielt neu erhalten; das Hauptfenster bleibt erforderlich.

Ein Auftrag für einen zeitlich geschnittenen Videovortrag ist ein eigenes Format. Dafür kann eine KI mit geeigneten Werkzeugen eine Medienzeitleiste und einen Player entwickeln: das Medium ist dann die Zeitquelle, Szenen tragen explizite Anfangs- und Endzeiten, Pausieren und Springen müssen Video, Cue und Sprechtext gemeinsam aktualisieren. Das ist keine vorhandene Kollo-JSON-Funktion. Kein künstliches Versprechen einer wortgenauen Sprachsynchronisation aus einem WPM-Regler ableiten. Bei einer individuellen HTML-Lösung deren Code, Ressourcen, Startanleitung und tatsächliche Exportgrenzen getrennt liefern und offline testen.

## Nach der Erweiterung

Die neuen Zustände tatsächlich durchspielen: vorwärts, rückwärts, letzte Folie, Pause, Schwarzbild, Fenster schließen und wieder öffnen, zwei unabhängige Präsentationen, kleine Fenster, reduzierte Bewegung und HTML per Doppelklick. Zusätzlich jede betroffene Folie und das gewünschte Exportformat ansehen. Änderungen an Schema oder Gruppierung dürfen vorhandene Projekte nicht stillschweigend anders interpretieren.
