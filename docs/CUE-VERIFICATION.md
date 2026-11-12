# Klicksignale im Teleprompter – Version 1.3

Die optionalen eigenen Notizzeilen `[KLICK]` und `[FOLIE]` bezeichnen manuelle Einblendungen beziehungsweise Folienwechsel. Im Sprechpult sind sie private Regieblöcke. Sie zählen nicht zum gesprochenen Text; eine laufende Leseführung wartet dort auf die manuelle Aktion. Auch ohne Marken ist die tatsächlich nächste Aktion sichtbar. Der Hinweis bleibt im Lesefokus und auf kleinen Bildschirmen erhalten.

## Geprüfter Inhalt und Skill

- Alle 21 Folien der drei bearbeitbaren Beispiele enthalten passende Regiepläne: 42 Klickmarken und 18 Folienwechsel. Der Test vergleicht sie mit den tatsächlichen Gruppen aus `createScene`, nicht nur mit der Zahl der Inhaltspunkte. Die sichtbaren Folien, Aussagen, Layouts und Zeitbudgets bleiben unverändert.
- Auch das kleine Formatbeispiel im Skill ist mit drei Klickmarken und zwei Folienwechseln versehen. Alte Dateien ohne Marken bleiben gültig.
- Der Skill erklärt die erste zunächst verborgene Gruppe, die letzte Folie, die genaue Schreibweise und die Abstimmung auf den wirklichen Ablauf. Bei automatisch laufenden Medien sollen keine zusätzlichen manuellen Schritte erfunden werden. Die ursprüngliche Videodemo bleibt unverändert.
- Der portable Python-Review erkennt strukturelle Widersprüche: Klick bei deaktivierten Einblendungen, doppelte oder unpassende Folienwechsel, Text hinter einem Wechsel und gemischte Notation. Er rendert keine Folien und bestätigt ausdrücklich nicht die tatsächliche Gruppenanzahl.

## Unabhängiger Anwendungsversuch

Ein separater Agent erhielt nur den aktualisierten Skill und einen Auftrag für ein fiktives Konzept mit vier Folien, drei einzeln gezeigten Ablaufschritten und zwei einzeln gezeigten Grenzen. Ohne vorgegebene Syntax erzeugte er die fünf Klickmarken und drei Folienwechsel richtig, einschließlich der jeweils ersten verborgenen Gruppe. Es entstanden keine zusätzlichen Steuerfelder oder erfundenen Erfolgszahlen.

Die anschließende tatsächliche Rendererprüfung fand einen zu breiten zusammengesetzten Titel. Dieser wurde im Testartefakt gekürzt; der Projektname blieb in Metadaten und sichtbarem Text erhalten. Danach meldete der Renderer keinen Überlauf. Das unterstreicht, weshalb die portablen Validatoren keine Sichtprüfung ersetzen.

Die Datei wurde im Studio importiert und mit getrenntem Publikumsfenster durchgespielt: alle acht Signale führten zur richtigen Aktion. Die HTML-Fassung funktionierte anschließend ohne Netzwerk. Desktop- und Mobilansicht wurden visuell geprüft; das Publikumsfenster enthielt keine privaten Signale.

## Verhaltensprüfung

Der vollständige lokale Lauf bestand mit 43 Node-Tests, 30 Python-Tests und 27 Browser-Tests in Microsoft Edge unter Windows. Keine Tests wurden übersprungen. Die fünf neuen Browserfälle prüfen das Verhalten der Hinweise; die übrigen Fälle schützen die bestehenden Funktionen.

Die Browserfälle prüfen insbesondere:

- Warten am Hinweis, manuelles Bestätigen und Fortsetzen einer zuvor laufenden Leseführung.
- Erhalt der Leseposition bei frühem Klick; Rücksprung zum passenden Hinweis, ohne ungewollt weiterzulesen.
- Wechsel auf eine Folie, die unmittelbar mit einer Klickmarke beginnt; benachbarte Marken und Hinweis am Textanfang.
- Wiederöffnen des Sprechpults und bewusst pausierter Zustand nach Verlassen des Hauptfensters.
- Weiterbedienbarkeit fehlerhafter Pläne, alte freie Klammertexte, Lesefokus und kleine Bildschirmbreite.
- Tatsächlich heruntergeladene Einzel-HTML mit Notizen, Offline-Bedienung und Trennung vom Publikumsbild.

Bei der Prüfung wurden ein veralteter Statustext nach Klickbestätigung und ein erhaltener Fortsetzungswunsch nach `pagehide` gefunden und korrigiert. Eine zurückkehrende pausierte Sitzung startet die Leseführung dadurch nicht allein mit dem Bestätigen eines Hinweises neu.

Die Release-Prüfung führt zusätzlich die bestehenden Import-, Export-, Fenster-, Sicherheits- und Archivtests aus. CI und Live-Prüfungen beziehen sich auf den exakten veröffentlichten Commit; deren Ergebnis und Download-Prüfsummen stehen im lokalen Release-Protokoll. PowerPoint übernimmt die Marken als Notiztext, ohne die HTML-Steuerung. Die Leseführung bleibt eine Tempo-Schätzung und erkennt keine gesprochene Sprache.
