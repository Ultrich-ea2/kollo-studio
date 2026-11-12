# Prüfen und übergeben

Ein bestandenes Format beweist keine fachliche Richtigkeit; ein schönes Bild beweist keine vollständige Übernahme. Die Prüfung braucht deshalb mehrere Ebenen.

## Inhalt und Belege

Prüfe Frage, Antwort und eigenen Beitrag gegen das Material. Vergleiche zentrale Zahlen, Einheiten, Bezugsgrößen, Zitate und Quellen direkt mit ihren Fundstellen. Für die Interpretation entscheidende Einschränkungen sichtbar erhalten. Eigene Ergebnisse, fremde Forschung und geplante Arbeit trennen.

Bei größerer Anpassung die Folienzuordnung prüfen: Was wurde verändert, zusammengefasst, verschoben oder ausgelassen? Kein wichtiges Ergebnis darf verschwinden, weil es nicht zur gewünschten Geschichte passt. Feedback im vereinbarten Umfang umsetzen, offene Konflikte nennen.

## Daten und Hinweise

Vom Skill-Ordner aus:

```sh
python scripts/validate_deck.py vortrag.kollo.json
python scripts/review_deck.py vortrag.kollo.json --json
```

Der Schema-Prüfer meldet unzulässige Felder, Typen, Werte oder Bilddaten. Der Review-Helfer gibt Hinweise zu bekannten Darstellungsgrenzen, Zeitplanung, Kontrast und Quellen. Diese Hinweise sind heuristisch. Ein Titel darf bewusst länger sein; eine Titelfolie braucht nicht automatisch einen Literaturbeleg. Warnungen fachlich beurteilen und nie durch erfundene Quellen „beheben“.

Der Python-Lader lehnt doppelte JSON-Schlüssel ab. Solche Dateien nicht ausgeben, selbst wenn eine andere JSON-Implementierung den letzten Wert behalten würde. Prüfvermerke gehören in einen Begleitbericht oder passende Notizen, nicht in zusätzliche Schemafelder.

## Tatsächlicher Import und Sichtprüfung

Importiere die Datei in Kollo. Kontrolliere Anzahl, Reihenfolge, sichtbaren Text, Bilder, Quellen und Notizen. Prüfe Layoutwarnungen, lange Wörter, Formeln, Code, Kontrast und die Bildschirmränder. Gespeicherte Felder sind nicht in jedem Layout sichtbar.

Spiele die Präsentation durch: Einblendungen, Navigation, Tastatur, Pausen und Zeitplanung. Erst eine Probe mit gesprochenem Text zeigt, ob die Redezeit passt. Berücksichtige vorgegebene Fragenzeit. Bei vollständiger Übertragung jede Ausgangsfolie mit dem Ziel vergleichen. Textextraktion reicht bei komplexen Diagrammen oder Formeln nicht.

Kann die Umgebung weder Vorschau öffnen noch rendern, kennzeichne den Entwurf als visuell ungeprüft und benenne ausstehende Kontrollen. Keine PowerPoint-Prüfung behaupten, wenn nur XML gelesen wurde.

## Benötigte Ausgaben öffnen

| Ausgabe           | Prüfen                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| JSON              | Erneut importierbar, passende Version, Inhalte und IDs vollständig                                                |
| Bearbeitbare PPTX | Im Zielprogramm öffnen: Folienzahl, Umbrüche, Schrift, editierbare Objekte, Bilder, Quellen und optionale Notizen |
| Visuelle PPTX     | Feste Folienansicht und Auflösung; Texte sind Bestandteil eines Bildes                                            |
| PDF               | Seitenzahl, Format, jede Seite, nichts abgeschnitten; keine durchsuchbare Textebene zugesichert                   |
| HTML              | Offline öffnen, Navigation, Einblendungen, Notizenwahl, reduzierte Bewegung, Druckansicht                         |
| Arbeitskit        | ZIP öffnen: aktuelles JSON und HTML, Ressourcen; Notizen sind enthalten                                           |
| Offline-Studio    | Entpacken, lokalen Starter ausführen, Editor und Exporte prüfen; Node.js nötig                                    |

Teste die beauftragten Ausgaben und relevanten Risiken. Bei ausdrücklich ausführlicher Prüfung sind mehrere Formate und Rückimporte sinnvoll. Gib genaue Testergebnisse an und trenne sie von bloß vorgesehenen Tests.

## Datenschutz und Übergabe

Keine privaten Quellpakete, Manuskripte, Feedbacktexte oder Testdaten veröffentlichen. Notizen, Bildmetadaten, Dateinamen und Kontaktangaben prüfen. Allgemeines Methodenwissen darf aus Erfahrungen abgeleitet werden; dadurch werden die privaten Dokumente nicht freigegeben.

Eine Übergabe nennt bearbeitbare Datei und tatsächlich geprüfte Ausgaben, wichtige Änderungen, offene Belege und nicht übernommene Funktionen. Bei großem Umbau die Folienzuordnung beilegen. Keine Garantie „immer perfekt“: fremde Schriften, Office-Versionen, schlechte Scans oder falsches Ausgangsmaterial können auch einen technisch gültigen Vortrag verändern.
