# DELFI-Originalbeispiel: Prüfstand

Stand: 13. November 2026. Das Originalvideo verwendet das gemeinsame Sprechpult mit manuell ausgelösten Animationsphasen. Version 1.5.1 ergänzt Leseführung nach jedem Vorwärtsschritt bis zum nächsten Signal, kompakte einzeilige Hinweise und ein Publikumsfenster ohne Schaltflächen. Die Phasenmetadaten und Originalmedien bleiben unverändert. Die lokale Prüfung der geänderten Bedienung ist abgeschlossen. Frühere Metadaten- und Laufzeitergebnisse der Versionen 1.5.0 und 1.2.0 bleiben gesondert erhalten; die Veröffentlichung wird am neuen Release-Commit geprüft.

## Geprüfte Originalfassung

Der Autor hat die Veröffentlichung seiner ungefähr sechs bis sieben Minuten langen DELFI-Präsentation ausdrücklich beauftragt. Untersucht wurden die beiden lokalen Originaldateien `PyTutorAI_DELFI.html` und `PyTutorAI_DELFI_Teleprompter.html`. Als Basis dient die jüngere `PyTutorAI_DELFI.html`.

| Eigenschaft               | Beobachtung                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| Originaldatei             | `PyTutorAI_DELFI.html`, 11.148.651 Bytes                           |
| SHA-256 Originaldatei     | `4299dcf2a341c369fe2987022e3341a303782d9a24714b45cb86e41db871e2a3` |
| Alternative Originaldatei | `PyTutorAI_DELFI_Teleprompter.html`, 11.148.480 Bytes              |
| SHA-256 Alternative       | `0076826040bfba418cf3e15017b93b315d4bcde3d97f5690ca6dece88296a61f` |
| Dauer                     | Genau 392 Sekunden, also 6:32 Minuten                              |
| Szenen                    | 16, mit Sprechtext und Start-/Endzeiten                            |
| Video                     | 8.280.949 Bytes, 1920 × 1080, AVC/H.264                            |
| SHA-256 Video             | `c909e7b75744d132dd56524d0e88b9c536f69d9ab239cdb5080bdac43710096b` |
| Ton                       | Keine Audiospur; Video- und Textspur vorhanden                     |
| Vorschaubild              | JPEG, 39.440 Bytes                                                 |
| SHA-256 Vorschaubild      | `b3ba2e61bdc40f0e3ff665f224fa91f6e67de7827057487e5aac0ea7acf52c42` |
| Originalcredits           | Ultrich Edima Edima; Mitarbeit: André Greubel                      |
| Historischer Stand        | 8. September 2026 laut Inhaltsdaten                                |

Beide Originalfassungen enthalten identische Video- und JPEG-Bytes sowie identische Inhaltsdaten. Die jüngere Datei ändert den kurzen Browserseitentitel und ergänzt die Taste **F** für Vollbild im abgetrennten Fenster. Die einzige externe URL in der textuellen Quelle verweist auf die [ursprüngliche Feedback-Demo](https://greubela.github.io/edusquirrel-workbook/feedback-demo/).

Die MP4-Metadaten nennen den Titel „PyTutorAI – DELFI 2026“, Ultrich Edima Edima als Autor und `Lavf60.16.100` als Encoder. Die Quelltextprüfung fand keine eingebetteten Zugangsdaten, API-Schlüssel oder privaten Kontaktdaten. Alle 16 vorhandenen Szenenaufnahmen wurden visuell gesichtet; darin wurden keine fremden privaten Unterlagen oder sichtbaren Geheimnisse erkannt. Das ist eine begrenzte Prüfung der gelieferten Dateien, keine neue fachliche Validierung der gezeigten Forschungs- oder Softwareaussagen.

## Aktuelle Phasensteuerung

DELFI verwendet denselben Player wie die bearbeitbaren Beispiele und HTML-Exporte. Das Video wird über einen Adapter eingebunden; das importierbare Kollo-JSON-Format erhält dadurch keine Videofelder.

- `→` startet die nächste definierte Animationsphase sowie die Leseführung in ihrem Textabschnitt. Das Video hält am festgelegten Phasenende, die Leseführung am nächsten Signal. Ein weiterer Druck während der laufenden Animation beendet nur diese Videophase und erhält Leseposition sowie laufende oder wartende Leseführung; erst der folgende Druck löst die nächste Phase aus.
- `←` stellt den vorherigen Phasenzustand mit pausiertem Sprechtext wieder her. Vom Anfang einer Szene geht es zum letzten Zustand der vorherigen Szene. Auch Pos1, Ende und direkte Szenenwahl pausieren den ausgerichteten Text. Nach der letzten Phase ist ein eigener Vorwärtsschritt für den Szenenwechsel erforderlich.
- Beim Öffnen steht die Leseführung still. Ein Vorwärtsschritt richtet den Sprechtext aus und startet ihn bis zum nächsten Signal, wo er auf erneutes Weiter wartet. Eine ausdrückliche Pause oder manuelles Scrollen stoppt die Führung; der nächste Vorwärtsschritt startet sie erneut. Lesetempo und Vortragstimer lösen weder Phasen noch Szenenwechsel aus. Es gibt keine Spracherkennung oder Tonaufnahme.
- Die privaten Signale stehen als kompakte einzeilige Pfeilhinweise innerhalb des Sprechtexts. Das Publikumsfenster enthält ausschließlich Folieninhalt, ohne Schaltflächen, Bedienleiste oder Regiehinweise; **F** bleibt für Vollbild verfügbar.

Die Medienlänge bleibt 6:32 Minuten. Die tatsächliche Vortragsdauer hängt von Klicks und Sprechpausen ab. Definierte Animationsanfänge überspringen reine Wartezeiten im Originalvideo; zusammenhängende Bewegung bleibt erhalten. Eine Änderung des Sprechtexts verändert die bereits gerenderten Videobilder nicht.

## Abgeschlossene Prüfung der neuen Metadaten

Die zusätzlich untersuchte Originaldatei `PyTutorAI_DELFI_Animationen.pptx` enthält 16 eingebettete Szenenvideos und zugehörige Vorschaubilder. Ihre PowerPoint-Zeitsteuerung startet die jeweiligen Videos; sie enthält keinen separat steuerbaren Objektanimationsplan. Auch die beiden HTML-Originale liefern Szenenzeiten und Sprechtext, aber keine ursprünglichen Klickmarken für einzelne Animationsphasen. Die neuen Haltepunkte sind deshalb ausdrücklich als nachträglich kuratierte Metadaten gekennzeichnet.

`showcases/delfi/phases.json` beschreibt **81 manuelle Phasen über alle 16 Szenen**. Pro Szene enthält die Datei ein Startbild, absolute Anfangs- und Endzeiten jeder Phase, eine verständliche Aktionsbezeichnung sowie Einfügepositionen im ursprünglichen Sprechtext. Die Herkunft ist über die Original- und Video-Prüfsummen sowie einen eigenen Sprechtext-Hash je Szene gebunden.

- Alle **16 Startbilder und 81 Phasenendbilder** wurden aus dem Originalvideo mit 30 Bildern pro Sekunde erzeugt und visuell geprüft. Kontaktbögen und ergänzende Einzelbilder dienten dazu, tatsächliche Einblendungen, Zahlenwechsel und vollständig gezeichnete Verbindungen zu erkennen.
- Die Phasen beruhen auf erklärbaren Bildzuständen, nicht auf gleich großen Zeitintervallen. Parallel laufende oder eng verbundene Aufbauten bilden gemeinsam eine Phase. Dekorative Bewegung und wiederholte Umläufe erzeugen keine zusätzlichen Klicks.
- Die Sichtprüfung korrigierte zunächst zu frühe Haltepunkte an dünnen Verbindungslinien. Der Rückweg im Workbook einschließlich seiner Zusammenfassung und der Übergang zu vergrößerten Testergebnissen einschließlich des bereits sichtbaren Erfolgszählers werden jeweils als zusammenhängender Aufbau behandelt.
- Alle Zeitfolgen sind geordnet und liegen innerhalb ihrer ursprünglichen Szene. Keine Phase reicht in den Szenenwechsel oder dessen Ausblendung hinein. Die Wiedergabeanfänge lassen zusammengehörige Verbindungen sichtbar entstehen und überspringen nur geeignete Zwischenhalte.
- Alle 81 Einfügepositionen sind eindeutige, aufsteigende Zeichenpositionen an Wortgrenzen. Die 16 ursprünglichen Sprechtexte lassen sich nach Einfügen und Entfernen der Signale bytegenau wiederherstellen. Die Positionen stimmen auch mit JavaScript-UTF-16-Indizes überein. Für die 15 nicht letzten Szenen kommt jeweils eine abschließende `[FOLIE]`-Marke hinzu.
- Unter `showcases/delfi/frames/` liegen 16 szenenspezifische JPEG-Startbilder mit jeweils 960 × 540 Pixeln. Zusammen benötigen sie **483.743 Bytes**. Damit zeigt auch die Vorschau der nächsten Szene deren eigenen Ausgangszustand.
- Die SHA-256-Prüfung bestätigt weiterhin die unveränderten ursprünglichen MP4-Bytes. Weder Video noch ursprünglicher Sprechtext wurden für die Klicksteuerung neu geschrieben.

Diese Ergebnisse bestätigen die kuratierten Daten und ihre visuelle Zuordnung. Sie ersetzen noch keinen Browsernachweis, dass Wiedergabe, Tastatur, Leseposition und mehrere Fenster dieselben Zustände tatsächlich gemeinsam erreichen.

## Abgeschlossene lokale Prüfung, Version 1.5.1

44 Node-Tests, 30 Python-Tests und alle 38 Browserfälle bestanden. Der Skill-Validator bestätigt das Paket ebenfalls. Acht Cue-Fälle, fünf Medienfälle, vier Fensterfälle und fünf DELFI-Fälle prüfen die geänderte Steuerung: wiederholtes Weiterlesen bis zum nächsten Signal, erneutes Weiter nach Pause oder Scrollen, pausierte Rücksprünge, Erhalt des Lesestands beim Beenden einer laufenden Videophase sowie Offline-HTML. Das Publikumsfenster enthält auch bei Hover und Fokus keine Schaltflächen; echtes Ein- und Ausschalten von Vollbild mit F ist geprüft. Die kurzen Hinweise bleiben bei 1440 und 390 Pixeln in der Prüffassung unter 34 Pixeln Höhe. Alle Wörter und gewöhnlichen Absatzwechsel bleiben erhalten. Die DELFI-Hauptansicht wurde zusätzlich bei 1440, 1024, 768 und 390 Pixeln visuell geprüft. CI und veröffentlichte Archive werden für denselben Release-Commit separat abgeglichen.

## Abgeschlossene Laufzeitprüfung, Version 1.5.0

- 44 Node-Tests, 30 Python-Tests und 35 Browserfälle bestanden. Der lokale Browserlauf verwendet Microsoft Edge unter Windows; ein veralteter Testselektor für die frühere Notizansicht wurde an das neue private Sprechtextfenster angepasst und erneut erfolgreich geprüft.
- Alle 81 Phasen und alle 16 Szenen wurden vorwärts durchlaufen, einschließlich der Textzuordnung und Rücksprünge über jede Foliengrenze. Echte Bewegung stoppt am vorgesehenen Phasenende; ein zweiter Druck beendet nur die laufende Phase. Stillstand und Timer lösen keinen Folienwechsel aus.
- Pixelproben der sichtbaren Canvas-Bilder sind in Steuerung, Publikum und Teleprompter identisch. Ein gemeinsamer Decoder verhindert unabhängig laufende Videozeiten. Das Publikumsfenster enthält weder private Notizen noch Regiemarken.
- Die Fensterprüfung umfasst abgebrochene Navigation, Neuladen, Schließen, Wiederöffnen, fremde Navigation, unabhängige Sitzungen und blockierte Pop-ups.
- Die tatsächlich erzeugte Einzeldatei funktioniert unter `file://` ohne Netzwerk. Ein gefundener CRLF/LF-Unterschied beim CSP-Skript-Hash ist behoben und durch eine Regression gesichert. Sowohl DELFI als auch allgemeine HTML-Exporte normalisieren Skriptzeilen vor dem Hashen und Einbetten.
- Reduzierte Bewegung zeigt pro Klick direkt den stabilen Endzustand. Ungültige oder fehlende Medienpläne, beschädigte Medien und verspätete Metadaten blockieren die Steuerung nicht.
- Die Hauptansicht wurde bei 1440, 1024, 768 und 390 Pixeln Breite geprüft. Keine horizontale Überbreite; Inline-Signale und Steuerelemente bleiben erreichbar. Lesefokus, Schriftgröße, Spiegelung und manuelles Scrollen wurden ebenfalls geprüft.

## Historischer Test der Originaldatei, Version 1.2.0

Die unveränderte lokale Originaldatei wurde in automatisiertem Microsoft Edge über `file://` geöffnet:

- Video geladen; Browser meldet 392 Sekunden, 1920 × 1080 und 16 Szenenschaltflächen.
- Keine HTTP-Anfragen und keine JavaScript-Seitenfehler während des Durchlaufs.
- Abgetrenntes Publikumsfenster geladen; Auswahl von Szene 9 setzte beide Videos auf 184 Sekunden.
- Wiedergabe startete in beiden Fenstern. Leertaste im Publikumsfenster pausierte beide Videos.
- Pfeil rechts im Publikumsfenster wechselte beide Videos zu Szene 10 bei 212 Sekunden.

Im unveränderten Original wurde der Sprechtext anhand der Videozeit geführt. Diese Steuerung beschreibt den damaligen Stand, nicht die aktuelle manuelle Phasensteuerung. Es gibt weder aufgezeichnete Sprache noch eine Spracherkennung. Die Szene ist bereits in das Video gerendert; eine Änderung der Textdaten verändert die Videobilder nicht.

## Historische Einbindung und Downloadprüfung, Version 1.2.0

Die folgenden Ergebnisse wurden am 12. November 2026 für die frühere Einbindung festgehalten. Sie sind keine Testbestätigung der aktuellen Umstellung.

- **42 Node-Tests, 24 Python-Tests und 22 Browser-Tests bestanden.** Die Browser-Suite lief vollständig mit Microsoft Edge unter Windows; keine Tests übersprungen. Die vier neuen DELFI-Tests decken die 16 Szenen, Wiedergabe, Pause, Tempo, Wortmarkierung, Fensterisolation, Neuladen, fremde Navigation, blockierte Pop-ups, Countdown und Offline-/Mobilbedienung ab.
- Video- und JPEG-Hashes entsprechen dem Original. Der kanonische Inhalts-Fingerprint schützt die ursprünglichen Credits, Texte und Zeiten. Der Build verweigert beschädigte Originalmedien und unvollständige Szenenfolgen.
- Die Online-Fassung verwendet externe Skripte und funktioniert unter der produktiven CSP-Konfiguration. Die Einzeldatei für offline erlaubt nur das eigene Skript über dessen exakten SHA-256-Hash. Das globale Verbot fremder oder beliebiger Inline-Skripte bleibt bestehen.
- Alle sechs Archive wurden auf CRC, Größe und SHA-256 geprüft. Elf direkte oder in Archiven verschachtelte Medienkopien bewahren dieselben Videobytes; sieben HTML-Kopien enthalten dieselben ursprünglichen Inhaltsdaten. Einstieg und relative Links sind vorhanden.
- Das separate DELFI-ZIP wurde tatsächlich entpackt und per `file://` geöffnet: 392 Sekunden, 16 Szenen, keine HTTP-Anfragen oder CSP-/JavaScript-Fehler. Nach Wiedergabe mit 1,25× und Pause im Publikumsfenster zeigten beide Videos 135,5225 Sekunden an.
- Desktop, Publikumsvideo, Pipeline-Szene und beide Mobilansichten wurden visuell geprüft. Bei 390 Pixeln Breite gab es keinen horizontalen Überlauf; Wiedergabesteuerung und Text waren zugänglich.
- Die Galerie lädt nur das Vorschaubild. Erst der ausdrückliche Aufruf öffnet die Videodemo in einem eigenen Tab ohne Zugriff auf den Studio-Tab über `window.opener`.
- Der allgemeine Skill bleibt unverändert: nur Anleitungen und drei fiktive, bearbeitbare Beispiele. Keine DELFI-Inhalte oder persönlichen Ausgangsarbeiten wurden in den Skill aufgenommen. Das Video-Beispiel ist in Oberfläche, Anleitung und Paketen als Original und getrennt von bearbeitbarem JSON/PPTX gekennzeichnet.

Der lokale Prüflauf hatte zunächst zwei Umgebungsprobleme: Playwrights weiter aktive Request-Interception blockierte Videoladen im über `document.write` erzeugten Fenster; die Interception wird nun nach dem Einspielen der Dokument-CSP entfernt, die CSP selbst bleibt bestehen. Außerdem beendete Edge in der eingeschränkten Windows-Umgebung eine Testinstanz vor dem Anlegen des nächsten Browserkontexts. Der vollständige abschließende Lauf außerhalb dieser Einschränkung bestand. Es wurden keine fehlgeschlagenen Prüfungen übersprungen oder fachlichen Erwartungen abgeschwächt.

## Veröffentlichungsprüfung

CI und Live-Prüfung erfolgen für den exakten veröffentlichten Git-Commit. Dieser Bericht trennt die neue Metadaten- und Laufzeitprüfung von den historischen Ergebnissen. Die aktuellen Deployment- und Downloadprüfungen werden nach Abschluss im lokalen Release-Protokoll erfasst. Es werden keine zusätzlichen Forschungs- oder Wirksamkeitsaussagen aus dieser technischen Prüfung abgeleitet.
