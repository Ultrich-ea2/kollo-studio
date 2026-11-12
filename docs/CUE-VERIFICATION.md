# Klicksignale und manuelle Phasen im Teleprompter

Stand: 13. November 2026. Alle Beispiele verwenden denselben Player mit manueller Phasensteuerung und privaten Signalen im Sprechtext. Die neue DELFI-Phasenkarte ist geprüft. Die lokalen Laufzeitprüfungen der Version 1.5.0 sind abgeschlossen; CI und Release werden am exakten Commit geprüft; die weiter unten genannten Testzahlen dokumentieren ausdrücklich den früheren Stand der Version 1.3.

## Aktuelles Verhalten

Die optionalen eigenen Notizzeilen `[KLICK]` und `[FOLIE]` bezeichnen die nächste Einblendungsphase beziehungsweise den nächsten Folienwechsel. Der Teleprompter stellt sie zwischen den gesprochenen Abschnitten als private Regiehinweise dar. Sie zählen nicht zur gesprochenen Wortmenge und erscheinen nicht im Publikumsfenster.

- `→` löst genau die nächste Phase aus. Erst nach deren letztem Zustand führt ein weiterer Schritt zur nächsten Folie. Bei DELFI spielt die Phase ihren definierten Videoabschnitt ab und hält anschließend.
- Ein Druck auf `→` während eines noch laufenden Videoabschnitts beendet zunächst die aktuelle Animation. Er überspringt keine zusätzliche Phase. Ein weiterer Druck führt weiter.
- `←` kehrt zur vorherigen Phase zurück. Am Folienanfang öffnet die Taste den letzten Zustand der vorherigen Folie.
- Jeder Phasenwechsel richtet den Teleprompter auf den zugehörigen Sprechtext aus und pausiert die Leseführung. Ein früher Klick wählt bewusst die nächste Phase samt Erklärung, auch wenn der vorherige Absatz noch nicht vollständig gelesen wurde.
- Die Leseführung startet nur auf Wunsch und wartet an einer noch offenen Marke. Sie löst keine Animation und keinen Folienwechsel aus. Auch der Vortragstimer steuert keine Phasen. Das Lesetempo bleibt eine Schätzung ohne Spracherkennung.

Damit ersetzt die neue Steuerung das frühere Verhalten, bei dem ein früher Klick die alte Leseposition behielt und eine zuvor laufende Leseführung nach der Bestätigung fortgesetzt werden konnte. Die aktuelle Regel gilt im Studio, in den HTML-Beispielen und in den getrennten Teleprompter- und Publikumsfenstern.

## Zuordnung von Inhalt und Signalen

Ein `[KLICK]` entspricht einer tatsächlich vorhandenen Gruppe des Folienrenderers oder einem kuratierten Medienabschnitt. Zusätzliche Notizmarken erzeugen keine neuen Animationen. Die Marke steht unmittelbar vor dem gesprochenen Abschnitt, der zum neuen Bildzustand gehört. Die letzte Folie erhält keine `[FOLIE]`-Marke.

Ohne Marken bleibt die tatsächliche nächste Aktion sichtbar; eine genaue Zuordnung zu einer Textstelle lässt sich daraus jedoch nicht ableiten. Freie Klammertexte bleiben gewöhnliche Notizen. Unpassende oder überzählige Marken werden als Widerspruch im Regieplan angezeigt, während die Navigation der tatsächlichen Präsentationsstruktur folgt. PowerPoint übernimmt die Marken lediglich als lesbaren Notiztext und erhält dadurch keine HTML-Steuerung.

Für das DELFI-Original sind **81 Klicksignale und 15 abschließende Folienwechsel** aus `showcases/delfi/phases.json` ableitbar. Alle 16 Startbilder und 81 Phasenendbilder wurden visuell geprüft. Die Einfügepositionen bewahren den vollständigen ursprünglichen Sprechtext; die Prüfsummen der Texte und des Videos bleiben erhalten. Einzelheiten, Herkunft und Grenzen dieser Prüfung stehen in [DELFI-VERIFICATION.md](DELFI-VERIFICATION.md).

Die ursprünglichen HTML- und PPTX-Dateien enthielten keine solchen Phasenmarken. Die neue Zuordnung wurde anhand der tatsächlichen Videoaufbauten kuratiert. Sie ist keine automatisch aus beliebigen Zeitabständen abgeleitete Klickfolge. Zusammenhängende oder parallel laufende Bewegung darf eine gemeinsame Phase bilden; rein dekorative Bewegung braucht keinen zusätzlichen Klick.

## Prüfstatus der aktuellen Umstellung

Abgeschlossen sind die Daten- und Sichtprüfung der DELFI-Phasenkarte einschließlich vollständiger Rekonstruktion der Originaltexte sowie 44 Node-, 30 Python- und 35 Browserfälle. Sechs Cue-Fälle, fünf DELFI-Fälle und vier gezielte Medienfälle prüfen die neue Steuerung. Der Offline-Test öffnet die erzeugten HTML-Dateien ohne Netzwerk. CI und Produktionsarchive werden anschließend für denselben Git-Stand geprüft.

Die aktuelle Verhaltensprüfung deckt insbesondere folgende Fälle ab:

- Vorwärts- und Rückwärtsnavigation durch jede Einblendung und über Foliengrenzen hinweg, jeweils mit passender Textzuordnung.
- Videoabschnitte, die am Phasenende halten, sowie ein zweiter Tastendruck während einer laufenden Animation.
- Hinweise am Textanfang, benachbarte Marken und bewusst frühe Klicks; nach Navigation bleibt die Leseführung pausiert.
- Gleiche Zustände in Haupt-, Teleprompter- und Publikumsfenster; keine privaten Notizen im Publikumsbild.
- Wiederöffnen und Neuladen getrennter Fenster, kleine Bildschirmbreiten, fehlerhafte Regiepläne und Präsentationen ohne Marken.
- Tatsächlich erzeugte und heruntergeladene Offline-HTML mit denselben Phasen und Hinweisen unter der vorgesehenen CSP.

## Historischer Inhalt und Skill, Version 1.3

Die folgenden Abschnitte bewahren den früheren Prüfumfang. Sie bestätigen nicht das Verhalten der aktuell geänderten Laufzeit.

- Alle 21 Folien der drei bearbeitbaren Beispiele enthalten passende Regiepläne: 42 Klickmarken und 18 Folienwechsel. Der Test vergleicht sie mit den tatsächlichen Gruppen aus `createScene`, nicht nur mit der Zahl der Inhaltspunkte. Die sichtbaren Folien, Aussagen, Layouts und Zeitbudgets bleiben unverändert.
- Auch das kleine Formatbeispiel im Skill ist mit drei Klickmarken und zwei Folienwechseln versehen. Alte Dateien ohne Marken bleiben gültig.
- Der Skill erklärt die erste zunächst verborgene Gruppe, die letzte Folie, die genaue Schreibweise und die Abstimmung auf den wirklichen Ablauf. Bei automatisch laufenden Medien sollen keine zusätzlichen manuellen Schritte erfunden werden. Die ursprüngliche Videodemo bleibt unverändert.
- Der portable Python-Review erkennt strukturelle Widersprüche: Klick bei deaktivierten Einblendungen, doppelte oder unpassende Folienwechsel, Text hinter einem Wechsel und gemischte Notation. Er rendert keine Folien und bestätigt ausdrücklich nicht die tatsächliche Gruppenanzahl.

## Historischer unabhängiger Anwendungsversuch

Ein separater Agent erhielt nur den aktualisierten Skill und einen Auftrag für ein fiktives Konzept mit vier Folien, drei einzeln gezeigten Ablaufschritten und zwei einzeln gezeigten Grenzen. Ohne vorgegebene Syntax erzeugte er die fünf Klickmarken und drei Folienwechsel richtig, einschließlich der jeweils ersten verborgenen Gruppe. Es entstanden keine zusätzlichen Steuerfelder oder erfundenen Erfolgszahlen.

Die anschließende tatsächliche Rendererprüfung fand einen zu breiten zusammengesetzten Titel. Dieser wurde im Testartefakt gekürzt; der Projektname blieb in Metadaten und sichtbarem Text erhalten. Danach meldete der Renderer keinen Überlauf. Das unterstreicht, weshalb die portablen Validatoren keine Sichtprüfung ersetzen.

Die Datei wurde im Studio importiert und mit getrenntem Publikumsfenster durchgespielt: alle acht Signale führten zur richtigen Aktion. Die HTML-Fassung funktionierte anschließend ohne Netzwerk. Desktop- und Mobilansicht wurden visuell geprüft; das Publikumsfenster enthielt keine privaten Signale.

## Historische Verhaltensprüfung, Version 1.3

Der vollständige lokale Lauf bestand mit 43 Node-Tests, 30 Python-Tests und 27 Browser-Tests in Microsoft Edge unter Windows. Keine Tests wurden übersprungen. Die fünf neuen Browserfälle prüfen das Verhalten der Hinweise; die übrigen Fälle schützen die bestehenden Funktionen.

Die damaligen Browserfälle prüften insbesondere:

- Warten am Hinweis, manuelles Bestätigen und Fortsetzen einer zuvor laufenden Leseführung.
- Erhalt der Leseposition bei frühem Klick; Rücksprung zum passenden Hinweis, ohne ungewollt weiterzulesen.
- Wechsel auf eine Folie, die unmittelbar mit einer Klickmarke beginnt; benachbarte Marken und Hinweis am Textanfang.
- Wiederöffnen des Sprechpults und bewusst pausierter Zustand nach Verlassen des Hauptfensters.
- Weiterbedienbarkeit fehlerhafter Pläne, alte freie Klammertexte, Lesefokus und kleine Bildschirmbreite.
- Tatsächlich heruntergeladene Einzel-HTML mit Notizen, Offline-Bedienung und Trennung vom Publikumsbild.

Bei der Prüfung wurden ein veralteter Statustext nach Klickbestätigung und ein erhaltener Fortsetzungswunsch nach `pagehide` gefunden und korrigiert. Eine zurückkehrende pausierte Sitzung startet die Leseführung dadurch nicht allein mit dem Bestätigen eines Hinweises neu.

Die historischen Erwartungen zum Erhalt der Leseposition und zur Fortsetzung der Leseführung wurden durch die aktuelle ausdrückliche Ausrichtung auf die gewählte Phase ersetzt. Für die neue Release-Prüfung sind zusätzlich die bestehenden Import-, Export-, Fenster-, Sicherheits- und Archivtests erneut auszuführen. CI und Live-Prüfungen beziehen sich auf den exakten veröffentlichten Commit; deren tatsächliches Ergebnis und Download-Prüfsummen werden im lokalen Release-Protokoll festgehalten. PowerPoint übernimmt die Marken als Notiztext, ohne die HTML-Steuerung. Die Leseführung bleibt eine Tempo-Schätzung und erkennt keine gesprochene Sprache.
