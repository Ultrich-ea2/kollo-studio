# Klicksignale und manuelle Phasen im Teleprompter

Stand: 13. November 2026. Alle Beispiele verwenden denselben Player mit manueller Phasensteuerung und privaten Signalen im Sprechtext. Version 1.5.2 korrigiert die Aktualisierung im sichtbaren Teleprompter bei einem im Hintergrund liegenden Hauptfenster sowie die Abhängigkeit von der Systemuhr. Die seit Version 1.5.1 geltende Klick- und Leseführung bleibt erhalten. Die lokale Prüfung der Korrektur ist abgeschlossen; abgeschlossene Ergebnisse der Versionen 1.5.1, 1.5.0 und 1.3 bleiben getrennt dokumentiert.

## Aktuelles Verhalten

Die optionalen eigenen Notizzeilen `[KLICK]` und `[FOLIE]` bezeichnen die nächste Einblendungsphase beziehungsweise den nächsten Folienwechsel. Beide privaten Leseansichten stellen sie zwischen den gesprochenen Abschnitten als kompakte einzeilige Pfeilhinweise dar. Sie zählen nicht zur gesprochenen Wortmenge. Das Publikumsfenster zeigt ausschließlich Folieninhalt ohne Schaltflächen, Bedienleiste oder Notizen; **F** bleibt für Vollbild verfügbar.

- Beim Öffnen ist die Leseführung pausiert. `→` oder **Weiter** löst genau die nächste Phase aus, richtet den Text aus und startet die Leseführung bis zum nächsten Signal. Dort wartet sie auf den nächsten Vorwärtsschritt. Erst nach dem letzten Phasenzustand führt ein weiterer Schritt zur nächsten Folie.
- Bei DELFI spielt die Phase ihren definierten Videoabschnitt ab und hält anschließend. Ein Druck auf `→` während dieses Abschnitts beendet nur die aktuelle Animation. Leseposition und laufende oder wartende Leseführung bleiben unverändert. Ein weiterer Druck führt zur nächsten Phase.
- `←` kehrt zur vorherigen Phase zurück. Am Folienanfang öffnet die Taste den letzten Zustand der vorherigen Folie. Rückwärtsnavigation, Pos1, Ende und direkte Folienwahl richten den Text aus und lassen ihn zum Nachlesen pausiert.
- Ein früher Vorwärtsschritt wählt bewusst die nächste Phase samt Erklärung, auch wenn der vorherige Absatz noch nicht vollständig gelesen wurde. Eine ausdrückliche Pause oder manuelles Scrollen stoppt die Leseführung; der nächste Vorwärtsschritt startet sie im neuen Abschnitt wieder.
- Die Leseführung löst keine Animation und keinen Folienwechsel aus. Auch der Vortragstimer steuert keine Phasen. Das Lesetempo bleibt eine Schätzung ohne Spracherkennung.

Die vorhandene Statuszeile unterscheidet laufende Leseführung, bewusste Pause, Warten am Klicksignal und Sprechtextende. Manuelles Scrollen und die Wahl eines Wortes pausieren absichtlich. Das Hauptfenster muss offen bleiben, darf aber im Hintergrund liegen, während der getrennte Teleprompter sichtbar ist. Eine vollständig angehaltene Browser- oder Betriebssystemsitzung gehört nicht zum zugesicherten Betrieb.

Version 1.5.1 ändert die Regel von Version 1.5.0, nach der jeder Phasenwechsel die Leseführung pausierte. Die phasengenaue Textzuordnung bleibt erhalten; vorwärts läuft der zugehörige Text nun bis zum nächsten Signal. Die Regel gilt im Studio und in den HTML-Beispielen mit ihren gemeinsam gesteuerten Fenstern.

## Zuordnung von Inhalt und Signalen

Ein `[KLICK]` entspricht einer tatsächlich vorhandenen Gruppe des Folienrenderers oder einem kuratierten Medienabschnitt. Zusätzliche Notizmarken erzeugen keine neuen Animationen. Die Marke steht unmittelbar vor dem gesprochenen Abschnitt, der zum neuen Bildzustand gehört. Die letzte Folie erhält keine `[FOLIE]`-Marke.

Ohne Marken bleibt die tatsächliche nächste Aktion sichtbar; eine genaue Zuordnung zu einer Textstelle lässt sich daraus jedoch nicht ableiten. Freie Klammertexte bleiben gewöhnliche Notizen. Unpassende oder überzählige Marken werden als Widerspruch im Regieplan angezeigt, während die Navigation der tatsächlichen Präsentationsstruktur folgt. PowerPoint übernimmt die Marken lediglich als lesbaren Notiztext und erhält dadurch keine HTML-Steuerung.

Für das DELFI-Original sind **81 Klicksignale und 15 abschließende Folienwechsel** aus `showcases/delfi/phases.json` ableitbar. Alle 16 Startbilder und 81 Phasenendbilder wurden visuell geprüft. Die Einfügepositionen bewahren den vollständigen ursprünglichen Sprechtext; die Prüfsummen der Texte und des Videos bleiben erhalten. Einzelheiten, Herkunft und Grenzen dieser Prüfung stehen in [DELFI-VERIFICATION.md](DELFI-VERIFICATION.md).

Die ursprünglichen HTML- und PPTX-Dateien enthielten keine solchen Phasenmarken. Die neue Zuordnung wurde anhand der tatsächlichen Videoaufbauten kuratiert. Sie ist keine automatisch aus beliebigen Zeitabständen abgeleitete Klickfolge. Zusammenhängende oder parallel laufende Bewegung darf eine gemeinsame Phase bilden; rein dekorative Bewegung braucht keinen zusätzlichen Klick.

## Reproduzierte Ausgangsfehler und abgeschlossene Prüfung, Version 1.5.2

Ein gezielter Laufzeitversuch unterdrückte die regelmäßigen 100-ms-Aktualisierungen des Hauptfensters, während das sichtbare getrennte Sprechpult weiterhin eigene Timer ausführen konnte. Trotzdem blieb seine Anzeige stehen. Ein weiterer Versuch simulierte `Date.now()`-Sprünge um eine Stunde vor und zurück; die zeitabhängige Führung sprang vor beziehungsweise zurück. Diese Reproduktionen belegen konkrete Fehlerpfade, aber nicht den genauen Auslöser einer gemeldeten Sitzung.

Die Korrektur lässt ein sichtbares, weiterhin verbundenes Zusatzfenster die gemeinsame Aktualisierung übernehmen und verwendet für Leser und Vortragsuhr eine einzige monotone Zeitbasis aus `host.performance.now()`. Die bestehende Statuszeile macht den tatsächlichen Lesezustand sichtbar, ohne eine zusätzliche Bedienfläche einzuführen. Die manuellen Phasen- und Klickregeln werden nicht geändert.

44 Node-Tests, 30 Python-Tests und alle 42 Browserfälle bestanden. Vier gezielte Zeitsteuerungsfälle prüfen unterdrückte Hauptfenster-Aktualisierungen bei weiterlaufendem sichtbarem Zusatzfenster, Schließen und Wiederöffnen, Warten am Signal, Systemzeitsprünge um minus und plus eine Stunde sowie gemeinsames Lesetempo ohne doppelte Aktualisierung. Drei dieser Regressionen schlugen vor der Korrektur fehl und bestehen mit ihr. Die echte Geräteuhr wurde dabei nicht verändert. Im zusätzlichen Vergleich am tatsächlichen DELFI-Player blieb Version 1.5.1 bei unterdrücktem Hauptfenster-Takt auf „heute“ stehen (Wortindex 4). Die korrigierte lokale und Offline-Fassung liefen unter derselben Bedingung bis „PyTutorAI-Projekt“ weiter (Index 9), ohne die Phase zu ändern. Vollständig suspendierte Browser oder Betriebssysteme sind damit nicht geprüft; der konkrete Auslöser der gemeldeten Sitzung wurde nicht nachgewiesen. CI und Produktionsarchive werden für denselben Release-Commit separat abgeglichen.

## Abgeschlossene lokale Prüfung, Version 1.5.1

44 Node-Tests, 30 Python-Tests und alle 38 Browserfälle bestanden. Der Skill-Validator bestätigt das Paket ebenfalls. Acht Cue-Fälle, fünf Medienfälle, vier Fensterfälle und fünf DELFI-Fälle prüfen die geänderte Steuerung: wiederholtes Weiterlesen bis zum nächsten Signal, erneutes Weiter nach Pause oder Scrollen, pausierte Rücksprünge, Erhalt des Lesestands beim Beenden einer laufenden Videophase sowie Offline-HTML. Das Publikumsfenster enthält auch bei Hover und Fokus keine Schaltflächen; echtes Ein- und Ausschalten von Vollbild mit F ist geprüft. Die kurzen Hinweise bleiben bei 1440 und 390 Pixeln in der Prüffassung unter 34 Pixeln Höhe. Alle Wörter und gewöhnlichen Absatzwechsel bleiben erhalten. Die DELFI-Hauptansicht wurde zusätzlich bei 1440, 1024, 768 und 390 Pixeln visuell geprüft. CI und veröffentlichte Archive werden für denselben Release-Commit separat abgeglichen.

## Abgeschlossene Laufzeitprüfung, Version 1.5.0

Abgeschlossen sind die Daten- und Sichtprüfung der DELFI-Phasenkarte einschließlich vollständiger Rekonstruktion der Originaltexte sowie 44 Node-, 30 Python- und 35 Browserfälle. Sechs Cue-Fälle, fünf DELFI-Fälle und vier gezielte Medienfälle prüfen die neue Steuerung. Der Offline-Test öffnet die erzeugten HTML-Dateien ohne Netzwerk. CI und Produktionsarchive werden anschließend für denselben Git-Stand geprüft.

Die damalige Verhaltensprüfung deckte insbesondere folgende Fälle ab:

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

Die damaligen Erwartungen zum Erhalt der alten Leseposition unterscheiden sich von der heutigen Ausrichtung auf die gewählte Phase. Für die neue Release-Prüfung sind zusätzlich die bestehenden Import-, Export-, Fenster-, Sicherheits- und Archivtests erneut auszuführen. CI und Live-Prüfungen beziehen sich auf den exakten veröffentlichten Commit; deren tatsächliches Ergebnis und Download-Prüfsummen werden im lokalen Release-Protokoll festgehalten. PowerPoint übernimmt die Marken als Notiztext, ohne die HTML-Steuerung. Die Leseführung bleibt eine Tempo-Schätzung und erkennt keine gesprochene Sprache.
