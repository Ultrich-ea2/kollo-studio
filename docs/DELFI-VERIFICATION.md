# DELFI-Originalbeispiel: Prüfstand

Stand: 12. November 2026. Dieser Bericht dokumentiert die Originaldatei und die geprüfte lokale Einbindung in Kollo 1.2.0. Die früheren Berichte zur Version 1.1 beschreiben die damalige Veröffentlichung mit drei fiktiven Beispielen und werden durch diesen zusätzlichen Bericht nicht rückwirkend geändert.

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

## Beobachteter Test der Originaldatei

Die unveränderte lokale Originaldatei wurde in automatisiertem Microsoft Edge über `file://` geöffnet:

- Video geladen; Browser meldet 392 Sekunden, 1920 × 1080 und 16 Szenenschaltflächen.
- Keine HTTP-Anfragen und keine JavaScript-Seitenfehler während des Durchlaufs.
- Abgetrenntes Publikumsfenster geladen; Auswahl von Szene 9 setzte beide Videos auf 184 Sekunden.
- Wiedergabe startete in beiden Fenstern. Leertaste im Publikumsfenster pausierte beide Videos.
- Pfeil rechts im Publikumsfenster wechselte beide Videos zu Szene 10 bei 212 Sekunden.

Der Sprechtext wird anhand der Videozeit geführt. Es gibt weder aufgezeichnete Sprache noch eine Spracherkennung. Die Szene ist bereits in das Video gerendert; eine Änderung der Textdaten verändert die Videobilder nicht.

## Einbindung und Downloadpakete (lokal geprüft)

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

CI und Live-Prüfung erfolgen für den exakten veröffentlichten Git-Commit. Dieser Bericht bestätigt die oben beschriebenen lokalen Ergebnisse; die tatsächlichen Deployment- und Downloadprüfungen werden im lokalen Release-Protokoll erfasst. Es werden keine zusätzlichen Forschungs- oder Wirksamkeitsaussagen aus dieser technischen Prüfung abgeleitet.
