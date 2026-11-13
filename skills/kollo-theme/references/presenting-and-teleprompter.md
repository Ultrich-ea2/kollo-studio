# Sprechtext, Probe und getrennte Fenster

Kollo trennt die öffentliche Folie von der privaten Leseansicht. Alle Beispiele und HTML-Exporte verwenden dieselbe Vortragssteuerung. Folie, Animationsphase, Schwarzbild und Vortragsuhr werden gemeinsam gesteuert. Die Notizansicht im Hauptfenster und der getrennte Teleprompter zeigen die `notes` mit denselben eingebetteten Klicksignalen. Ein Vorwärtsschritt wählt den passenden Textabschnitt und führt ihn bis zum nächsten Signal; Rücksprünge lassen ihn zum Nachlesen pausiert. Das Publikumsfenster enthält ausschließlich Folieninhalt ohne Schaltflächen, Notizen oder Bedienleiste. Es gibt keine Spracherkennung oder Tonaufnahme.

## Sprechtext erstellen

Schreibe sprechbare Sätze, die den sichtbaren Inhalt erklären, statt alle Stichpunkte vorzulesen. Eine Folie mit Beleg braucht zunächst den Kontext des Belegs, dann die Beobachtung und erst danach die Schlussfolgerung. Definiere unverzichtbare Begriffe und Einheiten rechtzeitig. Notwendige Einschränkungen gehören auch in den sichtbaren Inhalt, wenn sonst eine falsche Aussage entsteht.

Nutze Absätze als Atem- und Gedankenpausen. Stelle eine Verbindung zur nächsten Folie her, wenn sie für den Ablauf hilft. Bei einer geplanten Publikumsfrage genügt die Frage plus eine kurze Regiezeile; Antworten nicht vorwegnehmen. Eine Demo braucht klare sprachliche Unterscheidungen zwischen beobachtetem Ergebnis, erwarteter Wirkung und geplantem Schritt.

## Signale für den nächsten manuellen Schritt

Wenn ein Vortrag mit Klicksignalen gewünscht ist, plane den Sprechtext mit den tatsächlich sichtbaren Zuständen. Kollo erkennt in `notes` zwei private Marken, jeweils allein auf einer Zeile und genau in dieser Großschreibung:

| Marke     | Bedeutung                                                 |
| --------- | --------------------------------------------------------- |
| `[KLICK]` | Jetzt die nächste Einblendung auf derselben Folie zeigen. |
| `[FOLIE]` | Jetzt zur nächsten Folie wechseln.                        |

Leerzeichen oder Tabulatoren vor und nach der Marke sind erlaubt. Die Marken sind keine gesprochenen Wörter. In beiden Leseansichten erscheinen sie mitten im Sprechtext als kompakte einzeilige Pfeilhinweise. Sie benennen die nächste Phase beziehungsweise ausdrücklich den Folienwechsel. Halte eigene Aktionsbezeichnungen kurz; die ausführliche Erklärung gehört in den gesprochenen Absatz. Der allgemeine Hinweis zur nächsten Aktion ergänzt diese Stellen, ersetzt sie aber nicht.

`→`, **Weiter** oder der Signal-Knopf führt genau den nächsten manuellen Schritt aus, richtet die Leseposition auf den dazugehörigen Abschnitt aus und startet dessen Leseführung bis zum nächsten Signal. Solange noch eine Einblendung offen ist, bleibt die aktuelle Folie stehen. Erst ein weiterer Schritt nach dem letzten Einblendungszustand wechselt die Folie. `←` geht genau eine Phase zurück, auch im Sprechtext, und pausiert zum Nachlesen. Am Anfang einer Folie führt es zum Endzustand der vorherigen Folie. Ein früher Tastendruck wählt bewusst die nächste Phase samt Text; er wartet nicht, bis ein Lesetimer den Marker erreicht.

Beim Öffnen ist die tempoabhängige Leseführung pausiert. **Leseführung starten** kann den Ausgangsabschnitt führen; jeder Vorwärtsschritt startet sie beim neu gewählten Abschnitt. Erreicht sie eine offene Marke, hält sie dort an, ohne die Animation oder Folie auszulösen. Der nächste Vorwärtsschritt setzt den Ablauf fort. Eine ausdrückliche Pause oder manuelles Scrollen stoppt die Führung; `→` startet sie beim nächsten Abschnitt wieder. `←`, Pos1, Ende und direkte Folienwahl richten den Text aus und lassen ihn pausiert. Am Ende des Sprechtexts hält die Leseführung ebenfalls an.

Beispiel für eine Folie mit zwei tatsächlich vorhandenen, zunächst verborgenen Gruppen und einer folgenden Folie. Der erste Absatz erklärt den Ausgangszustand, jeder folgende Absatz den gerade eingeblendeten Zustand:

```text
Wir vergleichen zwei Fassungen desselben Textes.

[KLICK]
Hier ist Fassung A als fortlaufender Text.

[KLICK]
Fassung B enthält dieselben Wörter mit Zwischenüberschriften.
Auf der nächsten Folie sehen wir den Ablauf des Vergleichs.

[FOLIE]
```

Bei `reveal: true` sind die zugehörigen Gruppen zunächst verborgen. Setze deshalb auch vor der Erklärung der **ersten** verborgenen Gruppe eine `[KLICK]`-Marke. Eine Gruppe kann mehrere Texte oder Formen enthalten. Zähle die tatsächlichen manuellen Schritte in der Vorschau, nicht Wörter, Codezeilen oder pauschal die Anzahl der `items`. Besonders bei Codeblöcken, Bildtexten und Zitaten können sich diese Zahlen unterscheiden. Bei `reveal: false` keine `[KLICK]`-Marken verwenden.

Plane vor dem Schreiben kurz die Zuordnung: **sichtbarer Ausgangszustand → erste SVG-Einblendungsgruppe → zweite Gruppe → vollständig sichtbare Folie**. Ordne jedem tatsächlichen Zustand genau die Erklärung zu, die das Publikum jetzt verstehen kann. Ein Marker steht unmittelbar vor der Erklärung des neu sichtbaren Inhalts, nach der Erklärung des vorherigen Zustands. Ein statisches Layout kann trotz mehrerer Absätze null Einblendungsgruppen haben. Soll dort schrittweise erklärt werden, zuerst eine passende Darstellung oder eine echte Codeerweiterung umsetzen; zusätzliche Notizmarken erzeugen keine Animation.

Für einen vollständig markierten Ablauf eine passende Marke für jeden nötigen manuellen Schritt setzen. `[FOLIE]` steht einmal am Ende der Notizen, nach allen Einblendungen und dem abschließenden Sprechtext. Nach ihr darf kein noch vorzutragender Text stehen. Die letzte Folie bekommt keine `[FOLIE]`-Marke. Bestehende Notizen ohne Marken bleiben gültig; keine fremden Texte allein wegen dieser Konvention ungefragt umschreiben.

Weitere Regiehinweise, etwa `[PAUSE: Frage abwarten]` oder die ältere Schreibweise `[KLICK: Vergleich zeigen]`, bleiben gewöhnlicher Notiztext. Sie erzeugen kein Signal und werden bei der Lesegeschwindigkeit mitgezählt. Auch ein mitten im Satz stehendes `[KLICK]` ist keine Marke. Für ein nutzbares Klicksignal die unterstützte Zeile verwenden; eine Beschreibung des folgenden Schrittes bei Bedarf daneben als eigenen Satz schreiben. Keine zusätzlichen JSON-Steuerfelder oder ausführbaren Befehle erfinden.

**Individuelle Mediensequenzen:** Ein fertig gerendertes Video ist keine bearbeitbare Kollo-Folie. Soll es dieselbe manuelle Phasensteuerung erhalten, braucht der geprüfte Präsentationscode passende stabile Haltepunkte und eine Zuordnung zum Sprechtext. Ein Vorwärtsschritt startet einen Abschnitt bis zu seinem Halt sowie die Leseführung bis zum nächsten Signal. Ein weiterer Druck während dieser Bewegung beendet nur dieselbe Videophase sofort; er lässt Leseposition und laufende oder wartende Leseführung unverändert. Medienzeit darf weder die nächste Phase noch die nächste Folie oder den Sprechtext automatisch wählen. Die reine Videolänge ist nicht die Dauer des manuell gehaltenen Vortrags. Diese Anpassung gehört in vertrauenswürdigen Quellcode, nicht in erfundene Video- oder Zeitachsenfelder einer `.kollo.json`. Details für einen solchen Codeauftrag stehen in [Erweiterungen im Code](advanced-code.md).

`seconds` ist die geplante Sprechzeit pro Folie, `duration` die Gesamtdauer in Minuten. Beide ersetzen keine gesprochene Probe und schalten keine Folie automatisch weiter. Plane Erklärung, Klicks, bewusste Pausen und Fragenzeit mit ein. Wähle keine pauschale feste Wortzahl als Bestehensgrenze; sprechbare Notation und fachliche Dichte verändern das Tempo.

## Fenster aufbauen

1. Im Studio den Präsentationsmodus öffnen oder die exportierte HTML-Datei im Browser starten.
2. **Publikumsfenster öffnen** wählen. Dieses Fenster zeigt nur Folieninhalt, ohne Schaltflächen, Notizen oder Bedienleiste. **F** schaltet dort weiterhin Vollbild.
3. Im Hauptfenster **Sprechtext (N)** einschalten oder **Teleprompter öffnen** wählen. Beide bieten dieselben Inline-Signale und dieselbe Leseposition; das getrennte Sprechpult zeigt zusätzlich Vorschauen, Steuerung und Uhr.
4. Für einen Beamer oder zweiten Monitor die Betriebssystemanzeige **erweitern** und das Publikumsfenster auf den gewünschten Bildschirm ziehen. Nur dieses Fenster für eine Videokonferenz teilen. Spiegeln der gesamten Anzeige würde auch private Fenster sichtbar machen.
5. Vollbild bei Bedarf im jeweiligen Fenster aktivieren. Die Browserentscheidung über Fenster, Tab und Bildschirmposition bleibt beim Nutzer.

Popup-Blockierung wird im Ausgangsfenster gemeldet. Popups für die eigene Kollo-Adresse oder lokale Datei zulassen und den Öffnungsknopf erneut betätigen. Wiederholtes Öffnen derselben Rolle fokussiert das bereits verbundene Fenster. Das Ausgangsfenster bleibt die Steuerzentrale und muss offen bleiben; es darf im Hintergrund liegen, während der getrennte Teleprompter sichtbar ist. Ein manuell neu geöffneter Browser-Tab oder ein anderer Rechner gehört nicht automatisch zur Sitzung. Ein vollständiges Anhalten aller Fenster, des Browsers oder des Betriebssystems ist kein zugesicherter Vortragsbetrieb.

Nach Schließen oder Neuladen eines Zusatzfensters dieses über die Steuerzentrale erneut öffnen; der aktuelle Vortragsstand wird übernommen. Beim Beenden oder Neuladen der Steuerzentrale endet die Sitzung und ihre Zusatzfenster werden geschlossen. Eine Vortragssitzung ersetzt keine gesicherte Projektdatei. Im Zweifel zuerst JSON sichern und neu starten.

## Leseführung und Navigation

Die Schrift lässt sich von 22 bis 68 px einstellen, das Lesetempo von 60 bis 240 Wörtern pro Minute. Diese Werte steuern eine rechnerische Leseposition, nicht die Erkennung tatsächlich gesprochener Wörter. Beginne langsam und passe bei einer Probe an. **Spiegeln** dreht nur den Sprechtext für Teleprompterglas; **Lesefokus** blendet die Vorschauseite aus.

**Leseführung starten** bewegt die Markierung durch den Sprechtext und hält an offenen Klickmarken an. Manuelles Scrollen pausiert sie. Ein Wort lässt sich als neue Leseposition anklicken; auch das pausiert die Führung bewusst. Mit **Textanfang** gehst du zum Beginn der aktuellen Notizen zurück. Dabei werden bereits sichtbare Einblendungen nicht zurückgesetzt. Der nächste manuelle Phasenwechsel richtet den Text wieder auf die gewählte Phase aus. Ein Vorwärtssprung auf eine neue Folie beginnt mit deren Ausgangstext; ein Rücksprung zur vorherigen Folie wählt deren letzte Phase samt Erklärung. Notizen ohne Marker bleiben gültig, ermöglichen aber keine genaue Zuordnung einzelner Absätze zu Einblendungen.

Die vorhandene Statuszeile beim nächsten Schritt unterscheidet laufende Leseführung, bewusste Pause, Warten am Klicksignal und das Ende des Sprechtexts. Prüfe diesen Zustand, bevor du einen Stillstand als Fehler einordnest. Eine Pause nach Scrollen oder Wortwahl wird mit **Leseführung starten** an dieser Stelle fortgesetzt; an einem offenen Signal ist der nächste Vorwärtsschritt erforderlich. Am Textende gibt es in den aktuellen Notizen keine weiteren Wörter. Ein im Hintergrund liegendes Hauptfenster soll den sichtbaren Teleprompter dagegen nicht anhalten.

Der Teleprompter zeigt außerdem den tatsächlich nächsten Schritt an: weitere Einblendung, nächste Folie oder Ende. Dieser Hinweis bleibt auch ohne Marken nützlich. Er bestimmt jedoch nicht, an welcher Stelle deiner Erklärung ein Klick fachlich passt; dafür braucht es den abgestimmten Sprechtext und eine Probe. Stimmen Marker und tatsächlicher Folienzustand nicht überein, den Ablauf korrigieren und keine zusätzlichen Klicks blind auslösen.

Leseführung und Vortragsuhr haben getrennte Start-/Pause-Steuerungen. Das Pausieren der Uhr hält nicht automatisch die Folie an und löst keinen Folienwechsel aus. Für eine Gesprächspause die Leseführung gezielt pausieren. Die Uhr kann weiterlaufen, wenn die gesamte tatsächliche Redezeit gemessen werden soll.

| Taste                            | Wirkung                                                |
| -------------------------------- | ------------------------------------------------------ |
| Pfeil rechts, Bild ab, Leertaste | Nächste Phase und Leseführung bis zum nächsten Signal; erst nach der letzten Phase zur nächsten Folie |
| Pfeil links, Bild auf            | Vorherige Phase mit pausiertem Text; am Folienanfang zur letzten Phase der vorherigen Folie |
| Pos1 / Ende                      | Erste Folie beziehungsweise letzte Folie im Endzustand; Text pausiert |
| T oder P                         | Vortragsuhr starten/pausieren                          |
| R                                | Vortragsuhr zurücksetzen                               |
| B                                | Schwarzbild an/aus                                     |
| F                                | Vollbild im aktiven Fenster                            |
| N                                | Notizen im Ausgangsfenster anzeigen/ausblenden         |

In Eingabefeldern gelten die üblichen Eingabetasten. Verwende für die Probe eine Tastatur oder einen Presenter, dessen Tasten den angebotenen Befehlen entsprechen. Die nächste Vorschau ist eine Orientierung; beim Weiterschalten können Einblendungen zunächst wieder verborgen sein.

## Offline und Weitergabe

Die gemeinsame Präsentationslaufzeit steckt auch im HTML-Export. Eine einzelne HTML-Datei benötigt keinen lokalen Server und kein Node.js. Für Sprechtext muss der Export die Notizen enthalten: Im einzelnen HTML- oder PPTX-Download die entsprechende Option bewusst einschalten. Das Projekt-JSON und das Arbeitskit enthalten sie immer.

Ohne enthaltene Notizen kann das Publikumsbild weiterhin präsentiert werden; der Teleprompter zeigt dann einen Hinweis. Vertrauliche Notizen sind in einer Datei nicht geschützt, nur weil die Publikumsansicht sie ausblendet. Für eine öffentliche Ausgabe eine separate Datei ohne Notizen erzeugen.

Keine Fernbedienung über andere Geräte, WLAN-Übertragung oder automatische Mehrmonitorplatzierung zusichern. Prüfe den heruntergeladenen Export, die tatsächlichen Browserfenster und soweit verfügbar das Zielgerät nach [Prüfung und Übergabe](review-and-delivery.md). Bei reduzierter Bewegung muss die Information weiterhin verständlich sein.
