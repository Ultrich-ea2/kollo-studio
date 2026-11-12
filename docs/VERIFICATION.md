# Prüfung vor Veröffentlichung

Stand: 12. November 2026. Geprüft mit Node.js 24, Microsoft Edge und der lokal installierten Microsoft-PowerPoint-Version unter Windows.

- 35 automatisierte Modell-, Layout-, Sicherheits-, Export- und Skill-Paritätstests erfolgreich.
- 10 Browser-End-to-End-Tests erfolgreich: Bearbeitung, lokale Speicherung, Undo, ungültige Codeeingaben, XSS-Text, echte Downloads, Notizen, Mobilansicht, konkurrierende Fenster, unvollständige Diagrammwerte, mehrzeilige Spalten, BOM-Dateiimport und heruntergeladene Skill-Ressourcen.
- Die zusätzliche [Skill-Prüfung](SKILL-VERIFICATION.md) dokumentiert 24 Python-Tests, 68 gemeinsame Formatfälle und drei unabhängige Arbeitsabläufe mit 17 Folien einschließlich echter PowerPoint-Prüfung.
- Alle 31 Folien der drei Vorlagen sind gültig und ohne erkannte Layoutüberläufe. Das zusätzliche Skill-Beispiel und ein unabhängig erstelltes Beispieldeck wurden validiert.
- Beide PowerPoint-Ausgaben des Standarddecks in Microsoft PowerPoint geöffnet und alle 22 Folien als Bilder gerendert. Bearbeitbare Ausgabe visuell geprüft. Sämtlicher nativer Folientext erscheint auch im von PowerPoint erzeugten PDF.
- Heruntergeladenes PDF: 11 vollständige Seiten im Format 960 × 540 pt. Bild-Export mit eigenem Testbild geprüft: natives PNG im editierbaren PPTX, korrektes Bild im visuellen PPTX und im PDF.
- HTML-Präsentation direkt über `file://` geprüft: keine externen Netzwerkanfragen, keine Skript- oder CSP-Fehler, Navigation, Einblendungen, Timer, Pause und Reset funktionieren. Druck zeigt alle 11 Folien vollständig und ohne Notizen. Reduzierte Bewegung wird respektiert.
- Fertiges Offline-Studio aus dem ZIP entpackt und gestartet. Editor, dauerhafte lokale Sicherung und realer PowerPoint-Download funktionieren ohne externe Anfragen. Lokaler Server verweigert nicht freigegebene Pfade und Schreibmethoden.
- Abhängigkeiten mit `npm audit` geprüft. Bekannte Befunde in Vite und einer transitiven Bildbibliothek wurden durch geprüfte, festgelegte Versionen behoben; letzter Audit: 0 bekannte Schwachstellen.

## Praktische Grenzen

Diese Prüfungen sind keine Zusage für jede PowerPoint-Version, Schriftinstallation oder beliebig langen Inhalt. Editierbare PowerPoint-Folien verwenden native Objekte und Systemschriften; Browser-Einblendungen sind dort nicht enthalten. Visuelles PPTX und PDF erhalten das Folienbild, enthalten jedoch keine bearbeitbare beziehungsweise durchsuchbare Textebene. HTML bleibt für Browseranimationen der vollständige Export.

Eine ungültige laufende Eingabe überschreibt keine gültige lokale Sicherung. Die Oberfläche zeigt den ungespeicherten Entwurf an; JSON-Download bleibt zur Rettung möglich. Für den erneuten Import muss die JSON-Struktur wieder gültig sein. Die endgültige Datei auf dem Vortragsgerät öffnen und das Projekt zusätzlich als JSON sichern.
