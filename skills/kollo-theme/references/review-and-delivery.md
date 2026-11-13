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

Der Schema-Prüfer meldet unzulässige Felder, Typen, Werte oder Bilddaten. Der Review-Helfer gibt Hinweise zu bekannten Darstellungsgrenzen, Zeitplanung, Kontrast, Quellen und widersprüchlichen Klickmarken. Klickmarken bleiben Notiztext im Schema: etwa ein Folienwechsel auf der letzten Folie ist ein Ablaufproblem, kein ungültiges Datenformat. Der Helfer zählt keine tatsächlich gerenderten Einblendungsgruppen; diese im Sprechpult prüfen. Die übrigen Darstellungs- und Inhaltshinweise sind heuristisch. Ein Titel darf bewusst länger sein; eine Titelfolie braucht nicht automatisch einen Literaturbeleg. Warnungen fachlich beurteilen und nie durch erfundene Quellen „beheben“.

Der Python-Lader lehnt doppelte JSON-Schlüssel ab. Solche Dateien nicht ausgeben, selbst wenn eine andere JSON-Implementierung den letzten Wert behalten würde. Prüfvermerke gehören in einen Begleitbericht oder passende Notizen, nicht in zusätzliche Schemafelder.

## Tatsächlicher Import und Sichtprüfung

Importiere die Datei in Kollo. Kontrolliere Anzahl, Reihenfolge, sichtbaren Text, Bilder, Quellen und Notizen. Prüfe Layoutwarnungen, lange Wörter, Formeln, Code, Kontrast und die Bildschirmränder. Gespeicherte Felder sind nicht in jedem Layout sichtbar.

Spiele die Präsentation durch: Einblendungen, Navigation, Tastatur, Pausen und Zeitplanung. Erst eine Probe mit gesprochenem Text zeigt, ob die Redezeit passt. Berücksichtige vorgegebene Fragenzeit. Bei vollständiger Übertragung jede Ausgangsfolie mit dem Ziel vergleichen. Textextraktion reicht bei komplexen Diagrammen oder Formeln nicht.

Kann die Umgebung weder Vorschau öffnen noch rendern, kennzeichne den Entwurf als visuell ungeprüft und benenne ausstehende Kontrollen. Keine PowerPoint-Prüfung behaupten, wenn nur XML gelesen wurde.

Bei einer neuen Gestaltung die dichteste Inhaltsfolie, längste Titel und alle verwendeten Layouts ansehen. Prüfe bewusst unterschiedliche Kompositionen, wenn mehrere Beispiele geliefert werden. Eine dunkle und eine helle Kopie desselben Aufbaus belegen noch keine gestalterische Vielfalt. Keine Inhaltsebene wegen eines auffälligen Designs weglassen.

## Sprechpult und getrennte Fenster

Bei einem entsprechenden Auftrag die Fenster tatsächlich gemeinsam öffnen. Folie und Einblendungsstand müssen zusammenbleiben; Vorwärts- und Rückwärtsnavigation, Pause und Schwarzschaltung prüfen, soweit die Oberfläche sie anbietet. Das Publikumsfenster darf weder Sprechernotizen noch Schaltflächen oder Bedienleisten enthalten. **F** muss dort weiterhin Vollbild schalten. Notizen können trotzdem in einer exportierten Datei enthalten sein: ausgeblendet bedeutet nicht vertraulich geschützt.

Teste Schriftgröße, Textspiegelung, Scrolltempo und manuelles Lesen mit kurzem, langem und leerem Sprechtext. Prüfe die Inline-Signale sowohl unter **Sprechtext (N)** im Hauptfenster als auch im getrennten Teleprompter. Bei einem Klickplan jede alleinstehende `[KLICK]`- oder `[FOLIE]`-Marke mit dem tatsächlich gerenderten nächsten Schritt abgleichen. Auch vor der ersten verborgenen Gruppe ein Signal vorsehen. `[FOLIE]` gehört nach den gesamten Sprechtext, nie auf die letzte Folie. Gewöhnliche Klammerhinweise bleiben Text.

Prüfe zuerst den pausierten Anfangszustand. Drücke `→` auch vor Erreichen eines Markers: genau die nächste Phase muss erscheinen, und die Leseführung muss bei ihrer Erklärung starten. Lass sie bis zum nächsten Signal laufen: Sie muss dort halten, ohne Publikumsinhalt weiterzuschalten. Ein erneutes `→` wählt die nächste Phase und führt deren Text weiter. Nach ausdrücklicher Pause oder manuellem Scrollen bleibt der Text stehen; erst ein neuer Lesestart oder Vorwärtsschritt führt ihn weiter. Drücke `←`: dieselbe Folie geht eine Phase zurück; am Folienanfang muss die vorherige Folie mit ihrer letzten Phase samt passendem, pausiertem Text erscheinen. Auch Pos1, Ende und direkte Folienwahl müssen ausgerichtet und pausiert bleiben.

Kontrolliere kompakte einzeilige Signale, Lesefokus und eine schmale Ansicht. Bei manuell unterteiltem Video muss jeder Abschnitt am eigenen Halt stoppen. Ein zweites `→` während der Bewegung beendet denselben Abschnitt, ohne den nächsten zu überspringen oder die Leseposition zurückzusetzen; eine laufende Leseführung läuft weiter, eine wartende bleibt am Signal. Die Probe mit gesprochener Sprache bleibt nötig; ein Zeitmesser ist keine Spracherkennung.

Unterscheide bei einem stehenden Text die sichtbaren Zustände: bewusst pausiert nach Scrollen, Wortwahl oder Pause, wartend am echten Klicksignal und am Ende der Notizen. Prüfe die passende Fortsetzung und die Statuszeile in beiden privaten Ansichten. Lass außerdem das Hauptfenster offen im Hintergrund und den getrennten Teleprompter im Vordergrund laufen. Die Leseführung und Vortragsuhr sollen dabei weiter aktualisiert werden und an Signalen weiterhin halten.

Bei einer Prüfung der Laufzeit selbst gezielt die regelmäßigen Aktualisierungen des Hauptfensters aussetzen, während die des sichtbaren Zusatzfensters weiterlaufen. Simuliere außerdem Sprünge der Systemzeit um eine Stunde vor und zurück, ohne die tatsächliche Geräteuhr zu verändern. Leser und Vortragsuhr dürfen dadurch weder vorspringen noch zurücklaufen. Dokumentiere den tatsächlichen Testaufbau; ein bestandener gezielter Test belegt weder die genaue Ursache eines gemeldeten Einzelfalls noch Betrieb bei vollständig angehaltenem Browser oder Betriebssystem.

Öffne den tatsächlich heruntergeladenen HTML-Export lokal. Prüfe dort das zusätzliche Fenster, Popup-Blockierung, Schließen und Wiederöffnen, sowie die Meldung bei getrennter Steuerverbindung. Den Browser und geprüften Betriebsweg nennen. Zwei Browserfenster auf demselben Monitor sind ein sinnvoller Funktionstest, aber kein Nachweis für eine reale Beamer-/Mehrmonitorprobe. Für diese muss die Anzeige erweitert und das reine Publikumsfenster auf dem Zielbildschirm kontrolliert werden.

## Benötigte Ausgaben öffnen

| Ausgabe           | Prüfen                                                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON              | Erneut importierbar, passende Version, Inhalte und IDs vollständig                                                                                                                      |
| Bearbeitbare PPTX | Im Zielprogramm öffnen: Folienzahl, Umbrüche, Schrift, editierbare Objekte, Bilder, Quellen und optionale Notizen                                                                       |
| Visuelle PPTX     | Feste Folienansicht und Auflösung; Texte sind Bestandteil eines Bildes                                                                                                                  |
| PDF               | Seitenzahl, Format, jede Seite, nichts abgeschnitten; keine durchsuchbare Textebene zugesichert                                                                                         |
| HTML              | Offline öffnen, Navigation, Einblendungen, Notizenwahl, reduzierte Bewegung, Druckansicht                                                                                               |
| Arbeitskit        | ZIP öffnen: aktuelles JSON und HTML, Ressourcen; Notizen sind enthalten                                                                                                                 |
| Offline-Studio    | Entpacken, lokalen Starter ausführen, Editor und Exporte prüfen; Node.js nötig                                                                                                          |
| Studentenpaket    | ZIP frisch entpacken; Startanleitung, Beispiele samt Vorschau, kompletter Skill, fertiges Studio und getrennten Quellcode auf Vollständigkeit und funktionierende relative Links prüfen |

Teste die beauftragten Ausgaben und relevanten Risiken. Bei ausdrücklich ausführlicher Prüfung sind mehrere Formate und Rückimporte sinnvoll. Gib genaue Testergebnisse an und trenne sie von bloß vorgesehenen Tests.

## Datenschutz und Übergabe

Keine privaten Quellpakete, Manuskripte, Feedbacktexte oder Testdaten veröffentlichen. Notizen, Bildmetadaten, Dateinamen und Kontaktangaben prüfen. Allgemeines Methodenwissen darf aus Erfahrungen abgeleitet werden; dadurch werden die privaten Dokumente nicht freigegeben.

Eine Übergabe nennt bearbeitbare Datei und tatsächlich geprüfte Ausgaben, wichtige Änderungen, offene Belege und nicht übernommene Funktionen. Bei großem Umbau die Folienzuordnung beilegen. Keine Garantie „immer perfekt“: fremde Schriften, Office-Versionen, schlechte Scans oder falsches Ausgangsmaterial können auch einen technisch gültigen Vortrag verändern.
