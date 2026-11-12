# Studenten-Kit und Sprechpult: Prüfung der Version 1.1

Stand: 12. November 2026. Windows, Node.js 24, automatisierter Microsoft Edge und die lokal installierte Microsoft-PowerPoint-Version. Private Referenzpräsentationen wurden nur lokal untersucht; ihre Inhalte, Namen, Rohdateien und Screenshots sind nicht Bestandteil der Pakete.

## Automatisierte Kontrollen

- 40 Node-Tests: Modell, Szenen, Exporte, Rückwärtskompatibilität, neue Kompositionen, neue leere Projekte sowie Python-/TypeScript-Parität.
- 24 Python-Tests mit vorhandenem PDF-Backend; kein übersprungener PDF-Integrationstest.
- 68 gemeinsame Grenz- und Sicherheitsfälle plus 13 zusätzliche Werte für das optionale Kompositionsfeld in beiden Validatoren.
- 17 Browser-End-to-End-Tests, einschließlich echter heruntergeladener Dateien und als `file://` geöffneter Beispiele.
- Alle fünf Archive stimmen mit Größe und SHA-256 im Manifest überein; ZIP-CRC geprüft. Das Studenten-Kit enthält Einstieg, drei Beispiele, Skill, Offline-Studio, getrennten Quellcode und Anleitung. Keine Python-Caches, Umgebungsdateien oder privaten QA-Ordner in den Archiven.
- `npm audit --audit-level=high`: keine bekannten Schwachstellen zum Prüfzeitpunkt.

## Neue Präsentation und Skill

Ein unabhängiger Durchlauf erhielt nur ein allgemeines Lehrthema, sechs Minuten, eine Zielgruppe und den Skill. Ergebnis: zehn eigenständig erstellte Folien mit eigenen Diagrammzuständen, Quellenbezug, insgesamt 360 geplanten Sekunden und 697 Wörtern Sprechtext. Formatprüfer, tatsächlicher Renderer, Import, alle Notizen, Einblendungen und separates Sprechpult wurden geprüft. Der HTML-Export wurde tatsächlich heruntergeladen und lokal geöffnet. Es wurden keine Ausgangsfolien vorausgesetzt.

Die neue leere Projektanlage enthält genau eine Titelfolie und die gewählte Gestaltung. Beispielbefunde, Quellen, Identität, Bilder und Notizen werden nicht übernommen. Ein bestehendes Projekt bleibt beim bloßen Vorführen eines Beispiels unverändert. Ersetzen ist ausdrücklich bestätigt und rückgängig gemacht worden.

Der Skill wurde strukturell validiert. Die relativen Markdown-Verweise im heruntergeladenen Paket wurden gegen die tatsächlich enthaltenen Dateien geprüft. Die drei vollständigen Beispiel-JSON und die bearbeitbare Diagrammquelle sind auch im eigenständigen Skill enthalten. Fortgeschrittene Codearbeit ist als eigener Weg dokumentiert; unbekannte JSON-Felder werden nicht als neue Funktionen ausgegeben.

## Getrennte Fenster

Reale Browserfenster wurden verwendet, keine simulierten Nachrichtenobjekte. Geprüft wurden:

- Folie und Einblendung vorwärts und rückwärts von verschiedenen Fenstern aus, einschließlich Ende → zurück.
- Gleiche Uhrzeit, Pause, Reset und Schwarzbild; die Leseführung wird unabhängig gestartet.
- Aktuelle und nächste Folie, Wortmarkierung, Schriftgröße, Geschwindigkeit, Spiegelung, Textfokus und Pause bei manuellem Scrollen.
- Popup-Blockierung mit verständlicher Meldung; Schließen und erneutes Öffnen mit aktuellem Stand.
- Reload eines abgetrennten Fensters und Wiederverbindung in einem Klick.
- Ein auf eine andere Adresse navigiertes ehemaliges Fenster wird nicht wiederverwendet oder geschlossen.
- Zwei voneinander unabhängige Präsentationen; ihre Folien und Fenster bleiben getrennt.
- Schließen des Controllers schließt nur dessen noch verwaltete Zusatzfenster. Abgebrochene Navigation zerstört den Vortrag nicht.
- Notes-Injection wird als Text gezeigt. Private Notizen fehlen im Publikums-DOM. Die Hauptansicht druckt ohne Notizen.
- Gleiches Verhalten im Studio, unter der Produktions-CSP und im heruntergeladenen HTML per Doppelklick; keine externen Netzwerkanfragen.

Desktop-Sprechpult und 390-Pixel-Ansicht wurden visuell geprüft. Die Controller-Bedienelemente passen in die geprüfte Bildschirmhöhe. Ein tatsächlicher Browser-PDF-Druck ergab die erwarteten drei Seiten von 960 × 540 pt; die Endzustände der Einblendungen sind sichtbar.

## Folien, PowerPoint und PDF

Die 21 Folien der drei neuen Beispielreihen wurden im Browser gesichtet; keine Layoutwarnungen. Für jede Reihe wurden im Studio tatsächlich bearbeitbare PPTX, visuelle PPTX und PDF heruntergeladen. Zusätzlich wurden die drei im Kit gelieferten PPTX geöffnet.

Microsoft PowerPoint öffnete alle neun Dateien ohne Reparaturdialog; insgesamt 63 Folien wurden gerendert. Die 42 Folien der beiden UI-Exportarten und die 21 Seiten der heruntergeladenen PDFs wurden visuell geprüft. Keine abgeschnittenen oder fehlenden Inhalte erkannt. Alle 21 mitgelieferten PPTX-Folien waren im PowerPoint-Rendering pixelgleich mit dem bearbeitbaren UI-Export. Native Textwörter und die bewusst eingeschlossenen Notizwörter blieben erhalten. Die Campusgrafik wurde in allen Formaten korrekt angezeigt.

Eine unklare Diagrammbeschriftung wurde präzisiert: Die mögliche Punkteskala und die relative Balkenlänge sind jetzt ausdrücklich getrennt benannt. Die geänderte Folie wurde nochmals im Browser, in beiden bearbeitbaren PowerPoint-Fassungen und im nativen PDF geprüft; die Fassungen stimmen überein.

## Entpacktes Offline-Studio

Das tatsächlich heruntergeladene Studenten-Kit wurde vollständig entpackt und dessen `studio/server.mjs` gestartet. Geprüft: Neuanlage, Speicherung und Wiederherstellung nach Reload, separates Sprechpult, echter bearbeitbarer PowerPoint-Download sowie sämtliche angebotenen Offline-Downloadlinks. Der Server verweigert private beziehungsweise nicht freigegebene Pfade und Schreibmethoden. Keine externen Anfragen oder JavaScript-Fehler beobachtet.

## Grenzen dieser Prüfung

Es gab keine physische Beamer- oder Mehrmonitorprobe und keine laut gesprochene Zeitmessung. Die Fenster wurden im automatisierten Browser getestet. Native Popup-Regeln und Vollbild können zwischen Browsern und Betriebssystemen abweichen. Die Leseführung ist keine Spracherkennung; Folienwechsel bleiben manuell. Ein videotaktgenauer Vortrag ist ein gesondertes Entwicklungsformat.

Andere Office-Versionen und Schriftinstallationen können native PPTX anders umbrechen. Browser-Einblendungen sind in PPTX nicht enthalten. Visuelles PPTX und PDF enthalten Folienbilder. Ein gültiges Schema oder diese Beispiele garantieren kein korrektes Layout für jeden zukünftigen Inhalt; das konkrete Ergebnis auf dem Zielgerät prüfen.
