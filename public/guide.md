# Kollo Studio – Anleitung

## Das Studentenpaket weitergeben

Unter **Mitnehmen** kannst du das **Studenten-Kit** als ein ZIP herunterladen. Entpacke es vollständig und öffne `START-HIER.html`; die Textfassung `START-HIER.txt` funktioniert auch ohne Browser. Das Paket enthält drei ausdrücklich fiktive, bearbeitbare Beispielreihen und zusätzlich die vom Autor zur Veröffentlichung freigegebene DELFI-Originalpräsentation. Weitere private Ausgangsarbeiten gehören nicht zum Paket.

| Ordner                | Inhalt und Verwendung                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `examples/`           | `index.html` zeigt alle Beispiele. Die drei fiktiven Reihen enthalten jeweils `preview.svg`, den Offline-Vortrag `presentation.html`, das bearbeitbare Projekt `deck.kollo.json`, `bearbeitbar.pptx` und `GESTALTUNG.md`. |
| `examples/delfi/`     | Zusätzliches Originalbeispiel: Video mit 6:32 Minuten Medienlänge, manuell gesteuerten Phasen und Teleprompter in `presentation.html`, außerdem `preview.jpg`, `GESTALTUNG.md` und `provenance.json`. Keine Kollo-JSON- oder PowerPoint-Vorlage. |
| `skills/kollo-theme/` | Vollständiger KI-Skill mit Referenzen, Beispieldaten und lokalen Python-Helfern. Für eine KI diesen ganzen Ordner verwenden.                                                                                              |
| `studio/`             | Fertiger Editor für den eigenen Rechner. Startanleitung und lokaler Server liegen dabei; keine npm-Paketinstallation nötig.                                                                                               |
| `source/`             | `kollo-studio-source.zip` für eigene Codeänderungen. Das Archiv vor der Entwicklungsarbeit separat entpacken.                                                                                                             |
| `guides/`             | Ausführliche Nutzungshinweise.                                                                                                                                                                                            |

Die HTML-Beispiele lassen sich direkt im Browser ansehen, ohne Installation und ohne Internet. Für das Bearbeiten im fertigen Offline-Studio brauchst du Node.js wie unten beschrieben. Die drei fiktiven Reihen kannst du auch in PowerPoint weiterbearbeiten; prüfe danach Schrift und Umbrüche auf deinem Rechner. Die `.kollo.json` bleibt der passende Projektstand für Kollo. Das DELFI-Video besitzt keine bearbeitbaren Folienobjekte.

Nur Beispiele gewünscht? Das separate Beispiele-ZIP enthält denselben Einstieg und die Beispielordner. Das DELFI-Beispiel gibt es auch einzeln als `kollo-delfi.zip`. Nur mit einer KI arbeiten? Dafür reicht das vollständige Skill-ZIP, das allgemeine Anweisungen und die drei fiktiven Beispiele enthält. Deine eigenen Vorträge exportierst du separat als Projektdatei oder Arbeitskit.

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

Die gestalteten Beispielreihen zeigen unterschiedliche visuelle Sprachen: offene redaktionelle Seiten, präzise technische Anordnungen und pointierte Bühnenfolien. Sie sind vollständig durchspielbar und enthalten Sprechtext, Einblendungen und Zeitplanung. Alle Beispiele, einschließlich DELFI, verwenden dieselbe Vortragsoberfläche mit manueller Phasensteuerung, Notizansicht, getrenntem Teleprompter und Publikumsfenster. In `GESTALTUNG.md` steht, warum eine Darstellung gewählt wurde und wie du sie sinnvoll anpasst.

Im Thema wählst du `classic`, `editorial`, `technical` oder `stage`. Farben, Schrift und Maßstab bleiben anpassbar. Ein Wechsel verändert verfügbare Textbreiten: Kontrolliere danach jede Folie. Alle zwölf Layouts bleiben erhalten. Du musst weder das Thema des Beispiels noch dessen Gliederung übernehmen.

## DELFI: das Original mit manuellen Animationsphasen

Die zusätzliche Präsentation **PyTutorAI – Feedback, das den nächsten Schritt erklärt** zeigt eine animierte Projektdemo von Ultrich Edima Edima unter Mitarbeit von André Greubel. Sie hat 16 Szenen und bewahrt das Originalvideo sowie die zugehörigen Sprechtexte und Szenenzeiten. Das Video umfasst 6:32 Minuten; dein Vortrag dauert je nach Erklärungen und Pausen länger oder kürzer. Neu gesetzte Haltepunkte verbinden die sichtbaren Animationsphasen mit den passenden Textabschnitten. Die gezeigten Softwareabläufe beziehen sich auf den dokumentierten Stand vom 8. September 2026; sie belegen keine späteren Ergebnisse oder Änderungen.

Auf der Website öffnet **Vorführen** das Sprechpult. Nach dem Herunterladen `examples/delfi/presentation.html` öffnen. Im einzelnen DELFI-ZIP `presentation.html` öffnen. Video und Sprechtext sind in der Offline-HTML enthalten, eine Installation oder Internetverbindung ist dafür nicht nötig. Nur der freiwillig geöffnete Link zur ursprünglichen Feedback-Demo benötigt Internet.

Wie in den anderen Beispielen zeigt `→` die nächste Phase auf derselben Folie. Der zugehörige Videoabschnitt läuft bis zu seinem Halt und wartet dort. Ein zweiter Druck während der Bewegung beendet genau diesen Abschnitt sofort; er startet keine zusätzliche Phase. `←` kehrt zum vorherigen Zustand zurück. Erst wenn alle Phasen gezeigt wurden, führt der nächste Druck zur nächsten Szene. Es gibt keinen automatischen Szenenwechsel und keine Tonaufnahme.

Mit **Sprechtext (N)** erscheint der Sprechtext im Hauptfenster. **Teleprompter öffnen** und **Publikumsfenster öffnen** öffnen die gleichen getrennten Ansichten wie bei den anderen Beispielen. Der ausgewählte Phasenstand bestimmt die Leseposition. Direkt im Text steht **→ Jetzt drücken** bei der nächsten passenden Handlung. Eine laufende Videoanimation bewegt den Text nicht selbstständig weiter. Die zusätzliche Leseführung lässt sich bewusst starten und hält am nächsten Klicksignal. Schriftgröße, Spiegeln, Lesefokus und die unten beschriebene Tastaturbelegung gelten für alle Beispiele.

Die Datei ist ein Vorführbeispiel für abgestimmte Bewegung und Erklärtext. Sie kann nicht als `.kollo.json` importiert oder als native, bearbeitbare PPTX exportiert werden. Für eigene Folien beginne mit einer der drei Kollo-Reihen. Wer eine eigene Videopräsentation programmieren möchte, findet unter `showcases/delfi/` getrennte Dateien für Inhalt, HTML-Vorlage, CSS, JavaScript und Medien. `GESTALTUNG.md` beschreibt die Gestaltung, `provenance.json` die Herkunft. Eine Änderung des Sprechtexts verändert nicht die Bilder im fertigen Video; dafür muss auch das Video überarbeitet und erneut mit den Szenenzeiten geprüft werden.

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

Der Kollo-Folieneditor unterstützt keine frei programmierbaren Videozeitleisten, Tonaufnahmen oder beliebigen Bewegungspfade. Das DELFI-Beispiel bindet ein bereits fertig gerendertes Video über einen eigenen Adapter in die gemeinsame Vortragssteuerung ein. Es fügt dem `.kollo.json`-Format keine Video- oder Zeitachsenfelder hinzu. Bei Kollo-Folien dienen Einblendungen dazu, den gerade erklärten Schritt sichtbar zu machen. Passe das Gesprochene und die Klicks aufeinander an; eine statische Abgabe muss auch mit allen Elementen gleichzeitig verständlich bleiben.

## Teleprompter und Publikumsfenster

Öffne im Präsentationsmodus **Publikumsfenster öffnen** und **Teleprompter öffnen**. Das Publikumsfenster zeigt nur die Folien. Das Sprechpult zeigt deine Notizen, die aktuelle Folie, eine Vorschau der nächsten Folie und gemeinsame Steuerung. Mit **Sprechtext (N)** kannst du denselben Sprechtext samt Klicksignalen direkt im Hauptfenster lesen. Folie, Animationsphase, Leseposition, Schwarzbild und Vortragsuhr bleiben zusammen.

Für einen Beamer oder zweiten Monitor die Anzeige im Betriebssystem **erweitern** und das Publikumsfenster dorthin ziehen. Teile in einer Videokonferenz nur dieses Fenster. Eine Spiegelung des ganzen Bildschirms könnte deine privaten Notizen zeigen. Vollbild wird jeweils im aktiven Fenster eingeschaltet; Kollo verschiebt Fenster nicht automatisch auf einen bestimmten Bildschirm.

Der Teleprompter verwendet die Vortragsnotizen der jeweiligen Folie. Wähle Schriftgröße, Lesetempo, bei Bedarf Spiegelung für Teleprompterglas und den Lesefokus ohne Vorschauleiste. **Leseführung starten** führt auf Wunsch durch den Text. Manuelles Scrollen pausiert die Führung; ein Wort anklicken wählt eine neue Leseposition. **Textanfang** setzt den Text zurück, ohne sichtbare Einblendungen zu ändern. Beim nächsten Phasenwechsel richtet sich der Text wieder auf den zugehörigen Abschnitt aus.

Die Leseführung folgt einem einstellbaren Tempo von 60 bis 240 Wörtern pro Minute und beginnt nur, wenn du sie ausdrücklich startest. Sie hört dir nicht zu. Nach Navigation bleibt sie pausiert. Die Vortragsuhr wird getrennt gestartet und pausiert. Folien und Einblendungen wechselst du selbst; die eingetragenen Sekunden schalten nichts automatisch weiter.

### Signale zum Weiterdrücken

Der Teleprompter nennt die tatsächliche nächste Aktion: eine weitere Einblendung, die nächste Folie oder das Ende. Dieser Hinweis bleibt auch im Lesefokus und auf kleinen Bildschirmen sichtbar. Für Hinweise an einer bestimmten Stelle im Sprechtext verwende diese Zeilen in den Sprechernotizen:

```text
Wir betrachten zuerst die Ausgangslage.
[KLICK]
Der erste eingeblendete Punkt zeigt die Ausgangslage.
[KLICK]
Der zweite Punkt zeigt, was sich geändert hat.
Damit können wir zur Auswertung übergehen.
[FOLIE]
```

Dieses Beispiel passt zu zwei einzeln eingeblendeten Gruppen auf einer Folie, auf die eine weitere Folie folgt. Bei eingeschalteten Einblendungen sind diese Gruppen zunächst verborgen: Setze den ersten `[KLICK]` deshalb vor ihre erste Erklärung. Pro Einblendung ein `[KLICK]`, anschließend höchstens ein `[FOLIE]` am Ende der Notizen. Auf der letzten Folie entfällt `[FOLIE]`. Ohne Einblendungen sind keine `[KLICK]`-Zeilen nötig.

Die exakt geschriebenen Marker stehen jeweils auf einer eigenen Zeile. In der Notizansicht und im getrennten Teleprompter erscheinen sie mitten im Text als **→ Jetzt drücken** mit der passenden Aktion. Sie zählen nicht zum gesprochenen Text. Erreicht die laufende Leseführung einen noch offenen Marker, hält sie an. **Weiter**, Pfeil rechts oder eine passende Presenter-Taste führt genau die nächste Phase aus und wählt deren Textabschnitt. Erst nach der letzten Phase folgt die nächste Folie. Die Leseführung bleibt nach diesem Schritt pausiert. Die Präsentation schaltet niemals allein wegen eines Markers weiter. Prüfe im Sprechpult, ob die Hinweise zur Anzahl und Reihenfolge der tatsächlichen Einblendungen passen.

Ein vorzeitiger Klick wählt bewusst die nächste Phase samt ihrer Erklärung, auch wenn du den vorherigen Absatz noch nicht gelesen hast. `←` stellt die vorherige Phase samt Sprechtext wieder her; am Folienanfang geht es zum letzten Zustand der vorherigen Folie. Auch Präsentationen ohne Marker funktionieren weiterhin; dann gibt es den allgemeinen Hinweis zur nächsten Aktion, aber keine genaue Zuordnung zu einer Textstelle. Andere Klammertexte wie `[PAUSE: Frage abwarten]` bleiben gewöhnliche Notizen. Zusätzliche `[KLICK]`-Zeilen erzeugen keine neuen Animationen auf statischen Folien.

Die Signale gehören zur HTML-Präsentation und zum Studio. In PowerPoint-Notizen bleiben sie lesbarer Text; sie steuern PowerPoint nicht. Der KI-Skill erklärt die Konvention und die Prüfung. Bitte ihn ausdrücklich um einen Sprechtext mit einem vollständigen Klickplan.

Beim DELFI-Beispiel gelten dieselben Regeln. Die Phase spielt jeweils ihren Videoabschnitt ab und hält dann. Der Sprechtext enthält passende Signale zwischen den Erklärungen; weder das Video noch der Lesetimer wechselt selbstständig die nächste Phase oder Szene.

| Taste                   | Wirkung                            |
| ----------------------- | ---------------------------------- |
| → / Bild ab / Leertaste | Genau nächste Phase; erst nach der letzten Phase zur nächsten Folie |
| ← / Bild auf            | Genau vorherige Phase; am Folienanfang zur letzten Phase der vorherigen Folie |
| Pos1 / Ende             | Erste / letzte Folie               |
| T oder P                | Vortragsuhr starten oder pausieren |
| R                       | Vortragsuhr zurücksetzen           |
| B                       | Schwarzbild                        |
| F                       | Vollbild                           |
| N                       | Notizen im Ausgangsfenster         |

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
