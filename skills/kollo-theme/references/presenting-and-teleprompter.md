# Sprechtext, Probe und getrennte Fenster

Kollo trennt die öffentliche Folie von der privaten Leseansicht. Folie, Einblendungsstand, Schwarzbild und Vortragsuhr werden gemeinsam gesteuert. Der Teleprompter liest die `notes` der aktuellen Folie und führt den Text mit einem einstellbaren Tempo. Er hört nicht zu; es gibt keine Spracherkennung, keine Tonaufnahme und keine automatische Abstimmung auf eine Videospur.

## Sprechtext erstellen

Schreibe sprechbare Sätze, die den sichtbaren Inhalt erklären, statt alle Stichpunkte vorzulesen. Eine Folie mit Beleg braucht zunächst den Kontext des Belegs, dann die Beobachtung und erst danach die Schlussfolgerung. Definiere unverzichtbare Begriffe und Einheiten rechtzeitig. Notwendige Einschränkungen gehören auch in den sichtbaren Inhalt, wenn sonst eine falsche Aussage entsteht.

Nutze Absätze als Atem- und Gedankenpausen. Stelle eine Verbindung zur nächsten Folie her, wenn sie für den Ablauf hilft. Bei einer geplanten Publikumsfrage genügt die Frage plus eine kurze Regiezeile; Antworten nicht vorwegnehmen. Eine Demo braucht klare sprachliche Unterscheidungen zwischen beobachtetem Ergebnis, erwarteter Wirkung und geplantem Schritt.

## Signale für den nächsten manuellen Schritt

Wenn ein Vortrag mit Klicksignalen gewünscht ist, plane den Sprechtext mit den tatsächlich sichtbaren Zuständen. Kollo erkennt in `notes` zwei private Marken, jeweils allein auf einer Zeile und genau in dieser Großschreibung:

| Marke     | Bedeutung                                                 |
| --------- | --------------------------------------------------------- |
| `[KLICK]` | Jetzt die nächste Einblendung auf derselben Folie zeigen. |
| `[FOLIE]` | Jetzt zur nächsten Folie wechseln.                        |

Leerzeichen oder Tabulatoren vor und nach der Marke sind erlaubt. Die Marken sind keine gesprochenen Wörter. Im Teleprompter erscheinen sie als hervorgehobene Anweisungen. Erreicht die tempoabhängige Leseführung eine offene Marke, hält sie dort an. Erst **Weiter**, die entsprechende Tastaturtaste oder der Signal-Knopf führt den manuellen Schritt aus. Das Publikum wird nie allein durch eine Marke automatisch weitergeschaltet. War die Leseführung zuvor aktiv, kann sie nach Bestätigung fortsetzen; eine bewusst angehaltene Leseführung bleibt angehalten.

Beispiel für eine Folie mit zwei zunächst verborgenen Gruppen und einer folgenden Folie:

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

Für einen vollständig markierten Ablauf eine passende Marke für jeden nötigen manuellen Schritt setzen. `[FOLIE]` steht einmal am Ende der Notizen, nach allen Einblendungen und dem abschließenden Sprechtext. Nach ihr darf kein noch vorzutragender Text stehen. Die letzte Folie bekommt keine `[FOLIE]`-Marke. Bestehende Notizen ohne Marken bleiben gültig; keine fremden Texte allein wegen dieser Konvention ungefragt umschreiben.

Weitere Regiehinweise, etwa `[PAUSE: Frage abwarten]` oder die ältere Schreibweise `[KLICK: Vergleich zeigen]`, bleiben gewöhnlicher Notiztext. Sie erzeugen kein Signal und werden bei der Lesegeschwindigkeit mitgezählt. Auch ein mitten im Satz stehendes `[KLICK]` ist keine Marke. Für ein nutzbares Klicksignal die unterstützte Zeile verwenden; eine Beschreibung des folgenden Schrittes bei Bedarf daneben als eigenen Satz schreiben. Keine zusätzlichen JSON-Steuerfelder oder ausführbaren Befehle erfinden.

**Automatisch laufende Medien:** Bei einer selbstständig ablaufenden Video- oder Animationssequenz keine manuellen Klicks für jeden Bildwechsel erfinden. Zuerst bestimmen, welche Steuerung tatsächlich erforderlich ist: Start, Pause, manuelle Szenenwahl oder echte Folienwechsel. Ein videobasierter Teleprompter kann dem Medienzeitpunkt folgen; das ist ein anderer Ablauf als die manuell gesteuerten Kollo-Folien. Der Skill darf diese Funktionen nicht allein durch neue JSON-Felder behaupten.

`seconds` ist die geplante Sprechzeit pro Folie, `duration` die Gesamtdauer in Minuten. Beide ersetzen keine gesprochene Probe und schalten keine Folie automatisch weiter. Plane Erklärung, Klicks, bewusste Pausen und Fragenzeit mit ein. Wähle keine pauschale feste Wortzahl als Bestehensgrenze; sprechbare Notation und fachliche Dichte verändern das Tempo.

## Fenster aufbauen

1. Im Studio den Präsentationsmodus öffnen oder die exportierte HTML-Datei im Browser starten.
2. **Publikumsfenster öffnen** wählen. Dieses Fenster zeigt die Folien ohne Sprechtext.
3. **Teleprompter öffnen** wählen. Dort erscheinen Notizen, aktuelle Folie, nächste Folie, Steuerung und Uhr.
4. Für einen Beamer oder zweiten Monitor die Betriebssystemanzeige **erweitern** und das Publikumsfenster auf den gewünschten Bildschirm ziehen. Nur dieses Fenster für eine Videokonferenz teilen. Spiegeln der gesamten Anzeige würde auch private Fenster sichtbar machen.
5. Vollbild bei Bedarf im jeweiligen Fenster aktivieren. Die Browserentscheidung über Fenster, Tab und Bildschirmposition bleibt beim Nutzer.

Popup-Blockierung wird im Ausgangsfenster gemeldet. Popups für die eigene Kollo-Adresse oder lokale Datei zulassen und den Öffnungsknopf erneut betätigen. Wiederholtes Öffnen derselben Rolle fokussiert das bereits verbundene Fenster. Das Ausgangsfenster bleibt die Steuerzentrale und muss offen bleiben. Ein manuell neu geöffneter Browser-Tab oder ein anderer Rechner gehört nicht automatisch zur Sitzung.

Nach Schließen oder Neuladen eines Zusatzfensters dieses über die Steuerzentrale erneut öffnen; der aktuelle Vortragsstand wird übernommen. Beim Beenden oder Neuladen der Steuerzentrale endet die Sitzung und ihre Zusatzfenster werden geschlossen. Eine Vortragssitzung ersetzt keine gesicherte Projektdatei. Im Zweifel zuerst JSON sichern und neu starten.

## Leseführung und Navigation

Die Schrift lässt sich von 22 bis 68 px einstellen, das Lesetempo von 60 bis 240 Wörtern pro Minute. Diese Werte steuern eine rechnerische Leseposition, nicht die Erkennung tatsächlich gesprochener Wörter. Beginne langsam und passe bei einer Probe an. **Spiegeln** dreht nur den Sprechtext für Teleprompterglas; **Lesefokus** blendet die Vorschauseite aus.

**Leseführung starten** bewegt die Markierung durch den Sprechtext und hält an offenen Klickmarken an. Manuelles Scrollen pausiert sie. Ein Wort lässt sich als neue Leseposition anklicken; mit **Textanfang** gehst du zum Beginn der aktuellen Notizen zurück. Dabei werden bereits sichtbare Einblendungen nicht zurückgesetzt. Ein früh bestätigter Einblendungsklick überspringt den noch nicht gelesenen Sprechtext auf derselben Folie nicht. Ein Folienwechsel zeigt dagegen die neuen Notizen von vorn. Rücksprünge und erneutes Lesen deshalb mit den konkreten Marken proben.

Der Teleprompter zeigt außerdem den tatsächlich nächsten Schritt an: weitere Einblendung, nächste Folie oder Ende. Dieser Hinweis bleibt auch ohne Marken nützlich. Er bestimmt jedoch nicht, an welcher Stelle deiner Erklärung ein Klick fachlich passt; dafür braucht es den abgestimmten Sprechtext und eine Probe. Stimmen Marker und tatsächlicher Folienzustand nicht überein, den Ablauf korrigieren und keine zusätzlichen Klicks blind auslösen.

Leseführung und Vortragsuhr haben getrennte Start-/Pause-Steuerungen. Das Pausieren der Uhr hält nicht automatisch die Folie an und löst keinen Folienwechsel aus. Für eine Gesprächspause die Leseführung gezielt pausieren. Die Uhr kann weiterlaufen, wenn die gesamte tatsächliche Redezeit gemessen werden soll.

| Taste                            | Wirkung                                                |
| -------------------------------- | ------------------------------------------------------ |
| Pfeil rechts, Bild ab, Leertaste | Nächste Einblendung, danach nächste Folie              |
| Pfeil links, Bild auf            | Vorherige Einblendung beziehungsweise Folie            |
| Pos1 / Ende                      | Erste Folie beziehungsweise letzte Folie im Endzustand |
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
