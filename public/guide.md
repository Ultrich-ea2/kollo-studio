# Kollo Studio – Anleitung

## Das Studentenpaket weitergeben

Unter **Mitnehmen** kannst du das **Studenten-Kit** als ein ZIP herunterladen. Entpacke es vollständig und öffne `START-HIER.html`; die Textfassung `START-HIER.txt` funktioniert auch ohne Browser. Das Paket enthält allgemeine, ausdrücklich fiktive Beispiele und keine privaten Ausgangsarbeiten.

| Ordner | Inhalt und Verwendung |
| --- | --- |
| `examples/` | `index.html` zeigt die drei Beispielreihen. Jeder Beispielordner enthält `preview.svg`, den Offline-Vortrag `presentation.html`, das bearbeitbare Projekt `deck.kollo.json`, `bearbeitbar.pptx` und `GESTALTUNG.md`. |
| `skills/kollo-theme/` | Vollständiger KI-Skill mit Referenzen, Beispieldaten und lokalen Python-Helfern. Für eine KI diesen ganzen Ordner verwenden. |
| `studio/` | Fertiger Editor für den eigenen Rechner. Startanleitung und lokaler Server liegen dabei; keine npm-Paketinstallation nötig. |
| `source/` | `kollo-studio-source.zip` für eigene Codeänderungen. Das Archiv vor der Entwicklungsarbeit separat entpacken. |
| `guides/` | Ausführliche Nutzungshinweise. |

Die HTML-Beispiele lassen sich direkt im Browser ansehen, ohne Installation und ohne Internet. Für das Bearbeiten im fertigen Offline-Studio brauchst du Node.js wie unten beschrieben. Ein Beispiel in PowerPoint weiterzubearbeiten ist ebenfalls möglich; prüfe danach Schrift und Umbrüche auf deinem Rechner. Die `.kollo.json` bleibt der passende Projektstand für Kollo.

Nur Beispiele gewünscht? Das separate Beispiele-ZIP enthält denselben Einstieg und die Beispielordner. Nur mit einer KI arbeiten? Dafür reicht das vollständige Skill-ZIP. Deine eigenen Vorträge exportierst du separat als Projektdatei oder Arbeitskit.

## Fertiges Studio ohne Paketinstallation

Unter **Mitnehmen → Fertiges Offline-Studio** findest du die gebaute Anwendung. ZIP entpacken, einmalig Node.js 22 oder neuer installieren (empfohlen: 24 LTS), dann unter Windows `Start-Kollo.cmd` öffnen. Auf macOS/Linux im entpackten Ordner `node server.mjs` ausführen. Die Adresse `http://127.0.0.1:4179` im Browser öffnen. Das Terminal bleibt während der Arbeit offen. Der Server ist ausschließlich über das eigene Gerät erreichbar. Beenden mit Strg+C.

Das Paket enthält Editor, Exporte, Anleitung, Skill und Quellcode-ZIP. Nach der einmaligen Node.js-Installation ist keine Internetverbindung und kein `npm install` nötig. Sichere dein Projekt trotzdem regelmäßig als JSON. Für das reine Präsentieren reicht die einzelne exportierte HTML-Datei ohne Node.js.

Mit Kollo Studio gestaltest du einen Abschlussvortrag, ein Seminar oder ein Kolloquium. Die mitgelieferten Folien sind Beispiele. Ersetze ihre Inhalte durch deine eigenen Aussagen und geprüften Belege.

## Schnell zum eigenen Vortrag

1. Beginne mit einer leeren Präsentation, einer Vorlage oder einem gestalteten Beispiel.
2. Trage Titel, Name, Hochschule, Datum und geplante Redezeit ein.
3. Wähle je Folie ein Layout und bearbeite Texte, Punkte, Quellen und Notizen. Nutze kurze Aussagen; längere Erklärungen passen in die Vortragsnotizen.
4. Prüfe die Vorschau und behebe Hinweise auf überlaufenden Inhalt. Teile eine volle Folie auf zwei Folien auf.
5. Sichere das Projekt als `.kollo.json`. Probiere den Vortrag und die vorgesehenen Exporte vor der Abgabe aus.

Das Dateiformat erhält Texte, Thema, Bilder, Ablauf und Notizen. Es eignet sich deshalb als Hauptsicherung und zum späteren Weiterarbeiten. Ein PDF oder eine PowerPoint-Datei ersetzt diesen Projektstand nicht.

Du kannst auch nur mit einem Thema beginnen. Formuliere die Frage, die dein Publikum am Ende beantworten können soll, und wähle dafür passende Belege oder Beispiele. Die KI-Anleitung unten unterstützt diesen Weg ebenso wie die Anpassung vorhandener Folien. Fehlende Ergebnisse bleiben offen; die Beispielzahlen dürfen nicht als eigene Forschung übernommen werden.

## Drei Beispiele, vier Kompositionen

Die gestalteten Beispielreihen zeigen unterschiedliche visuelle Sprachen: offene redaktionelle Seiten, präzise technische Anordnungen und pointierte Bühnenfolien. Sie sind vollständig durchspielbar und enthalten Sprechtext, Einblendungen und Zeitplanung. In `GESTALTUNG.md` steht, warum eine Darstellung gewählt wurde und wie du sie sinnvoll anpasst.

Im Thema wählst du `classic`, `editorial`, `technical` oder `stage`. Farben, Schrift und Maßstab bleiben anpassbar. Ein Wechsel verändert verfügbare Textbreiten: Kontrolliere danach jede Folie. Alle zwölf Layouts bleiben erhalten. Du musst weder das Thema des Beispiels noch dessen Gliederung übernehmen.

## Layouts und Bilder

Titel und Abschnittsfolien geben Orientierung. Punkte eignen sich für eine Kernaussage, Spalten für einen Vergleich, Prozess für eine Abfolge. Kennzahlen und Diagramme erwarten Einträge nach dem Muster `Wert | Bezeichnung`. Diagrammwerte müssen größer oder gleich null sein. Code, Zitat, Bild, Quellen und Abschluss haben eigene Layouts.

Verwende für typische Inhaltsfolien drei bis fünf kurze Punkte. Die technischen Textgrenzen sind großzügiger als der tatsächlich lesbare Platz. Schriftgröße und Farben lassen sich über das Thema anpassen; prüfe dabei Lesbarkeit und Kontrast.

Bilder werden in das Projekt eingebettet. Unterstützt werden PNG, JPEG und WebP mit höchstens 2 MiB pro Bild und maximal 4096 Pixeln je Kante. Beschreibe wesentliche Bildinhalte im Alternativtext. Verwende Materialien, für die du die erforderlichen Rechte besitzt. Externe Bild-URLs und SVG sind im Projektformat nicht vorgesehen.

## Präsentieren und exportieren

Im Präsentationsmodus folgen Einblendungen und Folien auf Tastatureingaben. Die eigenständige HTML-Datei enthält außerdem eine kurze Tastenhilfe. Die Zeitangabe je Folie dient zur Planung deiner Redezeit; sie schaltet die Folie nicht automatisch weiter. Übe den Ablauf auf dem Rechner, den du beim Vortrag verwenden wirst.

| Download              | Wofür er geeignet ist                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Projekt `.kollo.json` | später weiterbearbeiten, auf einem anderen Rechner importieren, sichern  |
| HTML                  | ohne Internet präsentieren; die heruntergeladene Datei im Browser öffnen |
| PPTX bearbeitbar      | Texte und Formen in PowerPoint weiterbearbeiten                          |
| PPTX visuell          | die Folienansicht als Bilder in PowerPoint zeigen                        |
| PDF                   | feste Seiten für Abgabe oder Handout                                     |
| Offline-Kit           | HTML, Projekt, Anleitung und KI-Skill gemeinsam mitnehmen                |

Im bearbeitbaren PPTX bleiben Texte und Formen einzelne Objekte. Ein anderes Betriebssystem oder eine Ersatzschrift kann Umbrüche verändern. Im visuellen PPTX und PDF sind Folien Bilder; ihre Texte sind nicht einzeln bearbeitbar, eine durchsuchbare Textebene wird nicht zugesichert. Arial und Georgia werden vom System bereitgestellt und nicht mit dem Projekt geliefert oder in PowerPoint eingebettet.

HTML spielt die Browser-Übergänge und Einblendungen ab. PPTX und PDF enthalten den vollständig sichtbaren Endzustand jeder Folie. PowerPoint erhält einfache Übergänge: Fade bleibt Fade, Slide wird Push, Zoom wird Fade. Elementanimationen des Browsers werden nicht vollständig nach PowerPoint übertragen. PDF enthält keine Animationen.

Kollo unterstützt keine frei programmierbaren Videozeitleisten, Tonaufnahmen oder beliebigen Bewegungspfade. Einblendungen dienen dazu, den gerade erklärten Schritt sichtbar zu machen. Passe das Gesprochene und die Klicks aufeinander an; eine statische Abgabe muss auch mit allen Elementen gleichzeitig verständlich bleiben.

## Teleprompter und Publikumsfenster

Öffne im Präsentationsmodus **Publikumsfenster öffnen** und **Teleprompter öffnen**. Das Publikumsfenster zeigt nur die Folien. Das Sprechpult zeigt deine Notizen, die aktuelle Folie, eine Vorschau der nächsten Folie und gemeinsame Steuerung. Folie, Einblendungsstand, Schwarzbild und Vortragsuhr bleiben zusammen.

Für einen Beamer oder zweiten Monitor die Anzeige im Betriebssystem **erweitern** und das Publikumsfenster dorthin ziehen. Teile in einer Videokonferenz nur dieses Fenster. Eine Spiegelung des ganzen Bildschirms könnte deine privaten Notizen zeigen. Vollbild wird jeweils im aktiven Fenster eingeschaltet; Kollo verschiebt Fenster nicht automatisch auf einen bestimmten Bildschirm.

Der Teleprompter verwendet die Vortragsnotizen der jeweiligen Folie. Wähle Schriftgröße, Lesetempo, bei Bedarf Spiegelung für Teleprompterglas und den Lesefokus ohne Vorschauleiste. **Leseführung starten** führt durch den Text. Manuelles Scrollen pausiert die Führung; ein Wort anklicken wählt eine neue Leseposition. **Textanfang** setzt den Text zurück. Ein Folienwechsel zeigt die neuen Notizen von vorn.

Die Leseführung folgt einem einstellbaren Tempo von 60 bis 240 Wörtern pro Minute. Sie hört dir nicht zu. Die Vortragsuhr wird getrennt gestartet und pausiert. Folien und Einblendungen wechselst du selbst; die eingetragenen Sekunden schalten nichts automatisch weiter. Kurze Notizzeilen wie `[KLICK: Vergleich zeigen]` oder `[PAUSE: Frage abwarten]` helfen bei der Probe, sind aber keine automatischen Befehle.

| Taste | Wirkung |
| --- | --- |
| → / Bild ab / Leertaste | Nächste Einblendung oder Folie |
| ← / Bild auf | Zurück |
| Pos1 / Ende | Erste / letzte Folie |
| T oder P | Vortragsuhr starten oder pausieren |
| R | Vortragsuhr zurücksetzen |
| B | Schwarzbild |
| F | Vollbild |
| N | Notizen im Ausgangsfenster |

Lass das Ausgangsfenster offen. Wird ein Zusatzfenster geschlossen oder neu geladen, öffne es erneut über dessen Knopf in der Steuerzentrale. Das übernimmt den aktuellen Stand. Beim Schließen oder Neuladen der Steuerzentrale endet die Sitzung. Der Ablauf ist keine Synchronisierung mit einem zweiten Gerät.

Das funktioniert auch mit der eigenständigen HTML-Datei. Für deine private Probe beim HTML-Export **Notizen mitgeben** einschalten; im Arbeitskit sind sie enthalten. Ohne Notizen bleibt das Präsentieren möglich, der Teleprompter hat dann keinen Sprechtext. Die Zusatzfenster kann ein Browser als Tab öffnen oder blockieren. Bei einer Blockmeldung Popups für deine Kollo-Adresse beziehungsweise die lokale Datei zulassen und erneut öffnen.

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

Lade das Skill-ZIP herunter und entpacke den vollständigen Ordner `skills/kollo-theme`. Verwende den inneren Ordner `kollo-theme` für die Installation. Er enthält Anweisungen, Leitfäden zu Argumentation, Belegen, Feedback, Gestaltung und bestehenden Präsentationen, Beispielaufträge, einen Arbeitsbrief und drei lokale Python-Helfer. Er benötigt keine API-Schlüssel und installiert sich nicht selbst.

Der Skill ist Arbeitswissen für deine KI. Du gibst ihr den Skill, dein Thema oder freigegebene Materialien und einen Auftrag. Die KI erstellt oder überarbeitet eine `.kollo.json`; du importierst sie in Kollo und exportierst die benötigten Dateien. Kollo selbst ruft dafür keine KI auf. Was deine KI lesen, rendern und prüfen kann, hängt von ihren verfügbaren Werkzeugen ab.

| Werkzeug        | Lokale Einrichtung                                                                                                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codex CLI / IDE | Ordner nach `.agents/skills/kollo-theme` in deinem Projekt kopieren; alternativ persönlich nach `~/.agents/skills/kollo-theme`. Mit `$kollo-theme` aufrufen oder über die Skill-Auswahl wählen.                                                                                          |
| Claude Code     | Ordner nach `.claude/skills/kollo-theme` im Projekt oder `~/.claude/skills/kollo-theme` kopieren. Mit `/kollo-theme` aufrufen. Diese lokalen Pfade gelten nicht automatisch für jeden Web- oder Cloudmodus.                                                                              |
| Andere KI       | Den vollständigen Skill-Ordner als freigegebenes Material bereitstellen. Mindestens `SKILL.md`, `references/schema.md` und die zum Auftrag gehörenden Leitfäden mitgeben. Um eine reine `.kollo.json` bitten. Das ist eine Arbeitsanweisung, keine garantierte native Skill-Integration. |

`~` steht für deinen Benutzerordner, unter Windows in der Regel `C:\Users\dein-name`. Falls ein neu kopierter Skill nicht erscheint, starte die jeweilige Anwendung neu. Die genaue Erkennung kann von Version und Organisationsrichtlinien abhängen.

Ein geeigneter Auftrag lautet:

> Nutze kollo-theme. Erstelle aus meinen beigefügten Forschungsnotizen einen deutschen Vortrag für 12 Minuten. Übernimm nur belegte Ergebnisse. Kennzeichne offene Punkte. Liefere eine importierbare vortrag.kollo.json und nenne fehlende Informationen. Behalte die vorhandene Farbpalette bei.

Ohne Ausgangsfolien:

> Nutze kollo-theme. Ich beginne von null mit meinem genannten Thema. Entwickle einen verständlichen Vortrag für acht Minuten, eine passende eigenständige Gestaltung und Sprechtext für den Teleprompter. Recherchiere benötigte Fachbelege, erfinde keine Ergebnisse und kennzeichne offene Punkte. Liefere .kollo.json und prüfe die Folien tatsächlich.

Für eine Demo:

> Nutze kollo-theme. Zeige aus meinen Projektunterlagen Ausgangslage, Handlung, tatsächliches Ergebnis und Bedeutung. Plane passende Einblendungen und eine manuell gehaltene Publikumsfrage. Schreibe Sprechtext mit lesbaren Regiehinweisen. Prüfe Publikumsfenster und Teleprompter gemeinsam und nenne nicht unterstützte Funktionen.

### Kann der Skill meine bestehende Präsentation anpassen?

Ja. Bei einer `.kollo.json` kann die KI Texte, Struktur, Zeitplanung, Layouts und Übergänge gezielt ändern. Sie soll vorhandene IDs, Zahlen, Quellen und nicht betroffene Folien erhalten.

Bei einer **PPTX oder PDF** liest und prüft die KI die Ausgangsfolien und baut daraus eine Kollo-Präsentation. Das ist eine Übertragung, kein verlustfreier Direktimport. PowerPoint-Master, komplexe Diagramme, Videos, Formeln und Objektanimationen brauchen gegebenenfalls eine andere Darstellung. Für die Bearbeitung einer PPTX im exakt bestehenden Design braucht die KI zusätzlich passende Präsentationswerkzeuge. Der Kollo-Browsereditor importiert ausschließlich `.kollo.json`.

> Nutze kollo-theme. Übertrage meine beigefügte PPTX in das Kollo-Thema für zwölf Minuten. Bewahre Zahlen, Quellen und Einschränkungen. Verändere das Original nicht. Liefere .kollo.json, eine Zuordnung der alten zu den neuen Folien und nenne nicht vollständig übertragene Elemente. Prüfe jede Folie und die benötigten Exporte tatsächlich.

### Material lokal vorbereiten

Die KI kann deine Dateien mit ihren eigenen freigegebenen Werkzeugen lesen. Alternativ erstellt der mitgelieferte Helfer ein lokales Quellenpaket. Vom Skill-Ordner aus:

```sh
python scripts/prepare_sources.py --out material-paket meine-folien.pptx arbeit.docx feedback.md
```

`material-paket` muss neu sein. Der Helfer erstellt ein Manifest, lesbaren Quelltext und gegebenenfalls referenzierte Rasterbilder. Er verändert die Originale nicht, lädt nichts hoch und erzeugt noch keine fertige Präsentation. PPTX, DOCX und Text funktionieren mit der Python-Standardbibliothek. Für PDF ist optional `pypdf` oder PyMuPDF erforderlich; es erfolgt keine automatische Installation und kein OCR. Mehrspaltige PDFs, Scans, Formeln und komplexe Folien müssen visuell geprüft werden.

**Das Quellenpaket kann private Sprechernotizen enthalten.** Prüfe es vor der Weitergabe; mit `--omit-notes` kannst du PPTX-Notizen weglassen. Die ausführlichen Formatgrenzen stehen in `references/source-packet.md`. Die Leitfäden sind allgemein; eigene Arbeiten und Feedback gehören zu deinem Material, nicht in den öffentlichen Skill.

Lasse die Datei bei verfügbarem Python aus dem Skill-Ordner prüfen:

```sh
python scripts/validate_deck.py vortrag.kollo.json
python scripts/review_deck.py vortrag.kollo.json --json
```

Unter Windows ist auch `py -3` statt `python` möglich. Beide Prüfer benötigen keine zusätzlichen Pakete, laden nichts hoch und verändern das Projekt nicht. Der erste prüft das Format; der zweite gibt Hinweise zu Zeitbudget, Kontrast, nicht sichtbaren Inhalten und möglichen Beleglücken. Diese Hinweise sind keine fachliche oder visuelle Zertifizierung. Importiere die Datei anschließend im Studio und prüfe alle Folien und die benötigten Exporte. Eine bestandene Formatprüfung bestätigt keine Quellen oder Forschungsergebnisse.

## Wenn etwas nicht passt

- **Importfehler:** Die Datei muss reines JSON im Version-1-Format enthalten, höchstens 10 MiB und 80 Folien. Nutze die Meldung des Importers und die Formatbeschreibung im Skill.
- **Text läuft über:** Kürze ihn, verschiebe Details in die Notizen oder teile die Folie. Die Vorschau ist für die tatsächliche Lesbarkeit entscheidend.
- **Schrift sieht anders aus:** Prüfe verfügbare Systemschriften. Für eine feste Ansicht den visuellen PPTX-Export oder PDF verwenden.
- **Browserstand fehlt:** Eine zuvor gesicherte `.kollo.json` importieren. Die Browserspeicherung ist keine geräteübergreifende Synchronisierung.

Thema und Projektcode von Ultrich stehen unter MIT-Lizenz. Eingebundene Bibliotheken haben eigene Lizenzen; persönliche Folien, Forschungstexte und fremde Materialien werden dadurch nicht automatisch freigegeben.
