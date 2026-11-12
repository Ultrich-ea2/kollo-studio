# Kollo Studio – Anleitung

## Fertiges Studio ohne Paketinstallation

Unter **Mitnehmen → Fertiges Offline-Studio** findest du die gebaute Anwendung. ZIP entpacken, einmalig Node.js 22 oder neuer installieren (empfohlen: 24 LTS), dann unter Windows `Start-Kollo.cmd` öffnen. Auf macOS/Linux im entpackten Ordner `node server.mjs` ausführen. Die Adresse `http://127.0.0.1:4179` im Browser öffnen. Das Terminal bleibt während der Arbeit offen. Der Server ist ausschließlich über das eigene Gerät erreichbar. Beenden mit Strg+C.

Das Paket enthält Editor, Exporte, Anleitung, Skill und Quellcode-ZIP. Nach der einmaligen Node.js-Installation ist keine Internetverbindung und kein `npm install` nötig. Sichere dein Projekt trotzdem regelmäßig als JSON. Für das reine Präsentieren reicht die einzelne exportierte HTML-Datei ohne Node.js.

Mit Kollo Studio gestaltest du einen Abschlussvortrag, ein Seminar oder ein Kolloquium. Die mitgelieferten Folien sind Beispiele. Ersetze ihre Inhalte durch deine eigenen Aussagen und geprüften Belege.

## Schnell zum eigenen Vortrag

1. Wähle eine Vorlage oder beginne mit der Beispielpräsentation.
2. Trage Titel, Name, Hochschule, Datum und geplante Redezeit ein.
3. Wähle je Folie ein Layout und bearbeite Texte, Punkte, Quellen und Notizen. Nutze kurze Aussagen; längere Erklärungen passen in die Vortragsnotizen.
4. Prüfe die Vorschau und behebe Hinweise auf überlaufenden Inhalt. Teile eine volle Folie auf zwei Folien auf.
5. Sichere das Projekt als `.kollo.json`. Probiere den Vortrag und die vorgesehenen Exporte vor der Abgabe aus.

Das Dateiformat erhält Texte, Thema, Bilder, Ablauf und Notizen. Es eignet sich deshalb als Hauptsicherung und zum späteren Weiterarbeiten. Ein PDF oder eine PowerPoint-Datei ersetzt diesen Projektstand nicht.

## Layouts und Bilder

Titel und Abschnittsfolien geben Orientierung. Punkte eignen sich für eine Kernaussage, Spalten für einen Vergleich, Prozess für eine Abfolge. Kennzahlen und Diagramme erwarten Einträge nach dem Muster `Wert | Bezeichnung`. Diagrammwerte müssen größer oder gleich null sein. Code, Zitat, Bild, Quellen und Abschluss haben eigene Layouts.

Verwende für typische Inhaltsfolien drei bis fünf kurze Punkte. Die technischen Textgrenzen sind großzügiger als der tatsächlich lesbare Platz. Schriftgröße und Farben lassen sich über das Thema anpassen; prüfe dabei Lesbarkeit und Kontrast.

Bilder werden in das Projekt eingebettet. Unterstützt werden PNG, JPEG und WebP mit höchstens 2 MiB pro Bild und maximal 4096 Pixeln je Kante. Beschreibe wesentliche Bildinhalte im Alternativtext. Verwende Materialien, für die du die erforderlichen Rechte besitzt. Externe Bild-URLs und SVG sind im Projektformat nicht vorgesehen.

## Präsentieren und exportieren

Im Präsentationsmodus folgen Einblendungen und Folien auf Tastatureingaben. Die eigenständige HTML-Datei enthält außerdem eine kurze Tastenhilfe. Die Zeitangabe je Folie dient zur Planung deiner Redezeit; sie schaltet die Folie nicht automatisch weiter. Übe den Ablauf auf dem Rechner, den du beim Vortrag verwenden wirst.

| Download | Wofür er geeignet ist |
|---|---|
| Projekt `.kollo.json` | später weiterbearbeiten, auf einem anderen Rechner importieren, sichern |
| HTML | ohne Internet präsentieren; die heruntergeladene Datei im Browser öffnen |
| PPTX bearbeitbar | Texte und Formen in PowerPoint weiterbearbeiten |
| PPTX visuell | die Folienansicht als Bilder in PowerPoint zeigen |
| PDF | feste Seiten für Abgabe oder Handout |
| Offline-Kit | HTML, Projekt, Anleitung und KI-Skill gemeinsam mitnehmen |

Im bearbeitbaren PPTX bleiben Texte und Formen einzelne Objekte. Ein anderes Betriebssystem oder eine Ersatzschrift kann Umbrüche verändern. Im visuellen PPTX und PDF sind Folien Bilder; ihre Texte sind nicht einzeln bearbeitbar, eine durchsuchbare Textebene wird nicht zugesichert. Arial und Georgia werden vom System bereitgestellt und nicht mit dem Projekt geliefert oder in PowerPoint eingebettet.

HTML spielt die Browser-Übergänge und Einblendungen ab. PPTX und PDF enthalten den vollständig sichtbaren Endzustand jeder Folie. PowerPoint erhält einfache Übergänge: Fade bleibt Fade, Slide wird Push, Zoom wird Fade. Elementanimationen des Browsers werden nicht vollständig nach PowerPoint übertragen. PDF enthält keine Animationen.

## Daten und Notizen

Das Studio verarbeitet Präsentationsinhalte im Browser und sendet sie nicht an eine KI oder einen Präsentationsserver. Beim Besuch einer gehosteten Version werden die Anwendungsdateien geladen; der Hoster kann dabei übliche technische Zugriffsdaten erhalten. Wenn du selbst Materialien an einen KI-Anbieter weitergibst, gelten dessen Bedingungen.

Die automatische Speicherung gehört zum aktuellen Browserprofil und zur jeweiligen Adresse. Ein anderer Browser, privater Modus, gelöschte Websitedaten oder ein Adresswechsel können diesen Stand unzugänglich machen. Speichere daher regelmäßig eine `.kollo.json`-Datei an einem eigenen Ort.

Projekt-JSON und Offline-Kit enthalten immer die Vortragsnotizen, im Kit auch in der HTML-Datei. Für einzeln heruntergeladenes HTML und PPTX kannst du ihre Mitgabe ausdrücklich einschalten; standardmäßig bleiben sie dort weg. Mitgelieferte Notizen sind Teil der Datei und für Empfänger lesbar, auch wenn sie zunächst ausgeblendet sind. Prüfe vor dem Teilen, welche Inhalte du tatsächlich weitergibst.

## Vollständiges Studio lokal starten

Lade das Quellcode-ZIP herunter und entpacke es. Installiere Node.js 22 oder neuer mit npm; empfohlen ist Node.js 24 LTS. Die erste Paketinstallation benötigt Internet. Danach kann das lokale Studio mit den installierten Paketen auch ohne Internet arbeiten.

Unter Windows öffnest du PowerShell oder die Eingabeaufforderung im entpackten Projektordner. Unter macOS und Linux öffnest du dort ein Terminal. Die Befehle sind gleich:

```sh
npm ci
npm run dev
```

Öffne die vom Terminal angezeigte Adresse, normalerweise `http://127.0.0.1:5173`. Beende den lokalen Server mit Strg+C. Blockiert PowerShell das Skript `npm.ps1`, verwende stattdessen `npm.cmd ci` und `npm.cmd run dev`; eine Änderung deiner Ausführungsrichtlinie ist dafür nicht erforderlich.

Zum Prüfen und Bauen:

```sh
npm test
npm run build
npm run preview
```

Der Produktionsbuild liegt in `dist`. `preview` öffnet ihn über einen lokalen Webserver. Die Datei `index.html` aus dem Quellcode oder Build direkt anzuklicken ersetzt diesen Server nicht. Für einen einzelnen Vortrag ist dagegen der HTML-Export ausdrücklich als eigenständige Datei gedacht und benötigt kein Node.js.

## Mit einer KI arbeiten

Lade das Skill-ZIP herunter und entpacke den vollständigen Ordner `kollo-theme`. Er enthält `SKILL.md`, die Formatbeschreibung, einen lokalen Python-Prüfer und ein kleines Beispiel. Er benötigt keine API-Schlüssel und installiert sich nicht selbst.

| Werkzeug | Lokale Einrichtung |
|---|---|
| Codex CLI / IDE | Ordner nach `.agents/skills/kollo-theme` in deinem Projekt kopieren; alternativ persönlich nach `~/.agents/skills/kollo-theme`. Mit `$kollo-theme` aufrufen oder über die Skill-Auswahl wählen. |
| Claude Code | Ordner nach `.claude/skills/kollo-theme` im Projekt oder `~/.claude/skills/kollo-theme` kopieren. Mit `/kollo-theme` aufrufen. Diese lokalen Pfade gelten nicht automatisch für jeden Web- oder Cloudmodus. |
| Andere KI | `SKILL.md` und `references/schema.md` zusammen mit deinen freigegebenen Materialien bereitstellen. Um eine reine `.kollo.json`-Datei bitten. Das ist eine Arbeitsanweisung, keine garantierte native Skill-Integration. |

`~` steht für deinen Benutzerordner, unter Windows in der Regel `C:\Users\dein-name`. Falls ein neu kopierter Skill nicht erscheint, starte die jeweilige Anwendung neu. Die genaue Erkennung kann von Version und Organisationsrichtlinien abhängen.

Ein geeigneter Auftrag lautet:

> Nutze kollo-theme. Erstelle aus meinen beigefügten Forschungsnotizen einen deutschen Vortrag für 12 Minuten. Übernimm nur belegte Ergebnisse. Kennzeichne offene Punkte. Liefere eine importierbare vortrag.kollo.json und nenne fehlende Informationen. Behalte die vorhandene Farbpalette bei.

Lasse die Datei bei verfügbarem Python aus dem Skill-Ordner prüfen:

```sh
python scripts/validate_deck.py vortrag.kollo.json
```

Unter Windows ist auch `py -3 scripts/validate_deck.py vortrag.kollo.json` möglich. Der Prüfer benötigt keine zusätzlichen Python-Pakete, lädt nichts hoch und verändert das Projekt nicht. Importiere die Datei anschließend im Studio und prüfe alle Folien fachlich und visuell. Eine bestandene Formatprüfung bestätigt keine Quellen oder Forschungsergebnisse.

## Wenn etwas nicht passt

- **Importfehler:** Die Datei muss reines JSON im Version-1-Format enthalten, höchstens 10 MiB und 80 Folien. Nutze die Meldung des Importers und die Formatbeschreibung im Skill.
- **Text läuft über:** Kürze ihn, verschiebe Details in die Notizen oder teile die Folie. Die Vorschau ist für die tatsächliche Lesbarkeit entscheidend.
- **Schrift sieht anders aus:** Prüfe verfügbare Systemschriften. Für eine feste Ansicht den visuellen PPTX-Export oder PDF verwenden.
- **Browserstand fehlt:** Eine zuvor gesicherte `.kollo.json` importieren. Die Browserspeicherung ist keine geräteübergreifende Synchronisierung.

Thema und Projektcode von Ultrich stehen unter MIT-Lizenz. Eingebundene Bibliotheken haben eigene Lizenzen; persönliche Folien, Forschungstexte und fremde Materialien werden dadurch nicht automatisch freigegeben.
