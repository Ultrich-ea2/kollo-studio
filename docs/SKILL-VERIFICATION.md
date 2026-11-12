# Prüfung des erweiterten Kollo-Skills

Stand: 12. November 2026. Diese Prüfung betrifft die allgemeine Arbeit mit vorhandenen Folien, wissenschaftlichen Quellen und Feedback. Private Ausgangsmaterialien, Namen, Themen, Decks und Prüfabbildungen werden nicht veröffentlicht.

## Was getestet wurde

| Ebene                                               | Umfang                                    | Ergebnis                                                                                        |
| --------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Anwendung, Modell, Szene und Export                 | 35 automatisierte Node-Tests              | Bestanden; darunter Vergleich der beiden Validatoren                                            |
| Gemeinsame Formatgrenzen                            | 68 Fälle jeweils in TypeScript und Python | Gleiche Entscheidungen für die abgedeckten Fälle                                                |
| Quellenhelfer, Prüfer und Review                    | 24 Python-Tests mit Unterfällen           | Bestanden; PDF mit PyMuPDF und zusätzlich isoliertem pypdf 7.0.1 geprüft                        |
| Browser                                             | 10 End-to-End-Tests                       | Bearbeitung, Import, Speicherung, echte Downloads, mobile Anleitung und Ressourcenlinks geprüft |
| Unabhängige Skill-Anwendung                         | Drei Aufgaben, zusammen 17 Folien         | Gezielte JSON-Änderung, PPTX-Übertragung, Manuskript mit älterem Feedback                       |
| Tatsächlicher Import und Export der drei Ergebnisse | 18 Downloads, je sechs Formate            | Exakte JSON-Rückimporte, korrekte PPTX-Folienzahl und vollständiges Arbeitskit                  |
| Installiertes Microsoft PowerPoint                  | Sechs Dateien, 34 gerenderte Folien       | Editierbare und visuelle Ausgaben geöffnet und visuell gegenübergestellt                        |
| PDF                                                 | Drei App-PDFs und sechs PowerPoint-PDFs   | Seitenzahlen stimmen; sämtliche Wörter des nativen PPTX erscheinen im nativen PDF               |
| Offline-HTML                                        | Drei unabhängige Vorträge                 | Offline geöffnet und navigiert, keine externen Netzwerkanfragen                                 |

Die 68 Formatfälle sind Unterfälle eines Node-Tests, keine 68 zusätzlichen unabhängigen Produkttests. Einige Python-Prüfungen laufen zusätzlich aus der Node-Suite. Die Zahlen werden deshalb nicht zu einer scheinbaren Gesamtsumme addiert.

## Verhalten in den unabhängigen Aufgaben

**Gezielte Änderung:** Nur Titel, Untertitel und Notizen der ausdrücklich ausgewählten Folie wurden verändert. Alle anderen Felder, IDs, Zahlen, Quellen, Farben und Notizen blieben unverändert. Ein bestehendes Zeitbudget wurde nicht ungefragt korrigiert.

**PPTX-Übertragung:** Alle fünf Ausgangsfolien wurden als gerenderte Bilder gesichtet. Die Übertragung erhielt Werte, Einheiten, Bezugsgröße und Einschränkungen. Eine gerundete Diagrammbeschriftung wurde mit Titel, Quelldaten und Diagrammcache abgeglichen und die Abweichung dokumentiert. Ein als Quelltext enthaltener unerwünschter Befehl wurde als Daten behandelt, nicht ausgeführt.

**Manuskript und Feedback:** Der aktuelle Materialstand wurde mit älteren Rückmeldungen verglichen. Aufgehobene Anforderungen wurden nicht wieder eingeführt. Eigener Beitrag, übernommene Teile, berichtete Beobachtungen und Grenzen blieben getrennt. Eine unabhängige inhaltliche Gegenprüfung fand keine wesentliche Abweichung von den verwendeten Quellen. Das ist keine neue fachliche Prüfung der ursprünglichen Forschung.

## Gefundene Probleme und Korrekturen

- Die ersten KI-Entwürfe bestanden den Python-Review, erzeugten aber zehn tatsächliche Layoutwarnungen: zu langer Titeluntertitel sowie dichte Prozess- und Abschlussfelder. Die sichtbaren Beschriftungen wurden gekürzt, notwendige Erklärungen in Notizen erhalten und die betreffenden Szenen erneut geprüft. Danach blieben auf allen 17 Folien null Szenenwarnungen. Der Gestaltungsleitfaden erklärt diese engen Felder jetzt ausdrücklich.
- Der Studio-Import akzeptierte bei einigen regulären Ausdrücken ein abschließendes Zeilenende. IDs, Farben und Bild-Daten-URIs werden nun vollständig geprüft. UTF-8-BOMs werden kontrolliert als Dateimarker akzeptiert; Inhalte bleiben unverändert. Der tatsächliche Dateiimport ist mitgetestet.
- Python und JavaScript behandelten einige Unicode-Leerzeichen, Base64-Padding und JPEG-Marker unterschiedlich. Die relevanten Fälle wurden angeglichen und als gemeinsame Regressionen aufgenommen.
- Der Quellenhelfer erkannte ausgeblendete PPTX-Folien zunächst nur mit `show="0"`. Auch die gültige Form `show="false"` wird jetzt berücksichtigt.
- Geschützte und weiche Bindestriche in DOCX gehen nicht mehr verloren.
- Fremde XML-Attribute können keine aktiven Markdown-Überschriften oder Links im lesbaren Quellenpaket einschleusen. Quelltext bleibt als Daten gekennzeichnet.
- Downloadpakete schließen Python-Caches aus. Feste ZIP-Metadaten vermeiden Unterschiede durch automatisch erzeugte Ordnerzeitstempel.

## Sicherheits- und Formatfälle

Geprüft wurden unter anderem echte Folienreihenfolge über Office-Beziehungen, ausgeblendete Folien, Notizplatzhalter, Gruppen, Tabellen, Diagramm-Caches, referenzierte Bilder, Fußnoten, Änderungsverfolgung, UTF-16-Text, CSV-Zellen mit Zeilenumbrüchen, fehlende PDF-Backends und textlose PDF-Seiten. Externe Beziehungen werden nur inventarisiert.

Negative Fälle umfassen ZIP-Pfadwechsel, doppelte Teile, Symlinks, Größen-/Kompressionsgrenzen, XML-DTD/Entitäten, unsichere Beziehungsziele, ungeeignete Bildformate, doppelte JSON-Schlüssel, Unicode-Grenzen, unzulässige Objektfelder und den Schutz vorhandener Ausgabeordner. Es werden keine Dokumentmakros, TeX-Befehle oder CSV-Formeln ausgeführt.

## Reproduzierbare automatische Prüfungen

```sh
npm ci --ignore-scripts
npm test
npm run test:skill
npm run build
npx playwright install chromium
npm run test:e2e
```

Für den PDF-Teil der Python-Tests muss eines der dokumentierten optionalen Backends vorhanden sein. Ohne Backend wird genau dieser Integrationstest übersprungen; ein eigener Test prüft die verständliche Fehlermeldung. In GitHub Actions wird pypdf 7.0.1 isoliert für die Tests installiert. PowerPoint-Sichtprüfungen benötigen das entsprechende Programm und werden nicht durch die CI simuliert.

## Grenzen

Der Quellenhelfer ist kein verlustfreier PPTX-Konverter und kein Renderer. PDF-Lesereihenfolge, gescannter Text, Formeln, Master, SmartArt, komplexe Diagramme, Videos und Animationen können weitere Werkzeuge benötigen. Rasterkopien bleiben ungeprüfte Originalbytes mit möglichen Metadaten. Begrenzte ZIP-/XML-Verarbeitung und ein PDF-Zeitlimit sind keine vollständige Betriebssystem-Sandbox.

Der Python-Review prüft weder die Wahrheit von Aussagen noch die Gültigkeit von Quellen. Kontrast ist ein Hinweis auf Themenfarben, keine vollständige Barrierefreiheitsprüfung. Geplante Sekunden sind keine gemessene Redezeit. Die Versuche zeigten ausdrücklich, dass ein unauffälliger Review eine echte Sichtprüfung nicht ersetzt. Andere Schriften, Office-Versionen und beliebige zukünftige Inhalte sind durch diese Fälle nicht garantiert.
