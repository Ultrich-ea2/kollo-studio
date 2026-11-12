# Kollo Studio

**Ein Thema beginnen, vorhandene Folien überarbeiten oder einen Vortrag proben.** Kollo verbindet einen lokalen Editor mit einem wiederverwendbaren KI-Skill, gestalteten Beispielen und einem Sprechpult mit getrenntem Publikumsfenster. Die KI arbeitet in der vom Nutzer gewählten Umgebung; das Studio selbst enthält keinen KI-Dienst.

Für eine Lerngruppe das **Studenten-Kit** herunterladen, vollständig entpacken und `START-HIER.html` öffnen. Die drei fiktiven Beispielreihen enthalten Offline-HTML, Vorschaubild, Kollo-JSON, bearbeitbare PPTX und Hinweise zur Gestaltung. Skill, fertiges Studio, Quellcode und Anleitung liegen getrennt in `skills/`, `studio/`, `source/` und `guides/`. HTML-Beispiele benötigen keine Installation. Das gesamte Kit enthält keine privaten Forschungsunterlagen.

Das veröffentlichte Studio bietet ein **fertiges Offline-Studio** als ZIP. Dafür genügt Node.js 22 oder neuer (empfohlen: 24 LTS). Nach dem Entpacken unter Windows `Start-Kollo.cmd` starten; unter macOS/Linux `node server.mjs` ausführen. Die angezeigte Adresse `http://127.0.0.1:4179` öffnen. Es ist keine Paketinstallation nötig. Der feste lokale Port erhält den Browserspeicher beim Neustart.

Die Quellcode-Version unten richtet sich an Studierende, die das Studio weiterentwickeln möchten. Eine einzelne exportierte HTML-Präsentation funktioniert auch ohne Node.js direkt per Doppelklick.

Ein lokales Präsentationsstudio für Kolloquien, Seminare und Abschlussvorträge. Inhalte bearbeiten, eine Präsentation abspielen und dieselben Folien als HTML, PDF oder PowerPoint ausgeben. Die mitgelieferten akademischen Inhalte sind fiktive Beispiele. Persönliche Arbeiten und Feedback gehören zu den eigenen Materialien und werden nicht mit dem Studio verteilt.

## Starten

Voraussetzung: Node.js 22 oder neuer mit npm; empfohlen ist Node.js 24 LTS. Den Quellcode entpacken und im Projektordner ausführen:

```sh
npm ci --ignore-scripts
npm run dev
```

Die im Terminal angezeigte lokale Adresse öffnen. Das funktioniert unter Windows, macOS und Linux. Falls PowerShell `npm.ps1` blockiert, `npm.cmd ci` und `npm.cmd run dev` verwenden. Die erste Installation lädt Pakete aus dem Internet; das Studio benötigt danach keinen KI-Dienst, API-Schlüssel oder eigenen Serverdienst.

```sh
npm test
npm run build
npm run preview
```

`build` erstellt die statische Anwendung in `dist` und die Downloadpakete. `preview` zeigt den Produktionsbuild lokal an. Für eine Veröffentlichung den Inhalt von `dist` bei einem statischen Hoster bereitstellen. Eigene Präsentationsdateien müssen dafür nicht in das Repository aufgenommen werden.

## Verwenden und sichern

1. Leer beginnen oder ein Beispiel beziehungsweise eine Vorlage öffnen; Identität und Redezeit anpassen.
2. Folienlayouts auswählen und Inhalte eingeben. Hinweise auf Überlauf in der Vorschau beheben.
3. Als `.kollo.json` sichern. Dieser bearbeitbare Projektstand enthält auch Vortragsnotizen und Bilder.
4. Präsentation und exportierte Dateien vor dem Vortrag im Zielprogramm prüfen.

Automatische Browserspeicherung ist eine Arbeitshilfe, kein Ersatz für eine Datei. Das Offline-Kit enthält die aktuelle Präsentation als eigenständiges HTML, das Projekt-JSON, die Anleitung und den KI-Skill. Die HTML-Datei ist ein Leser für diese Präsentation; der vollständige Editor liegt im Quellcodepaket.

| Export                  | Zweck und Grenze                                                               |
| ----------------------- | ------------------------------------------------------------------------------ |
| `.kollo.json`           | vollständig bearbeitbarer Projektstand; unabhängig von einem PowerPoint-Layout |
| HTML                    | eigenständiger Offline-Vortrag mit Übergängen und Einblendungen                |
| PowerPoint, bearbeitbar | native Texte, Formen und Bilder; Schriftmetriken können abweichen              |
| PowerPoint, visuell     | Folien als Bilder mit fester Darstellung; einzelne Texte nicht bearbeitbar     |
| PDF                     | feste Bilddarstellung der Folien, ohne Animationen                             |

PPTX/PDF zeigen den Endzustand aller Einblendungen. PowerPoint verwendet einfache Folienübergänge; Browser-Zoom wird als Fade angenähert. Arial und Georgia werden als Systemschriften verwendet und nicht eingebettet. Notizen sind in JSON und Offline-Kit enthalten, dort auch in der HTML-Datei; für einzeln heruntergeladenes HTML/PPTX ist ihre Mitgabe gesondert wählbar.

## KI-Skill und Anleitung

Der Skill unterstützt neue Vorträge aus einer ersten Themenidee, Demos mit abgestimmtem Sprechtext, gezielte Änderungen bestehender Kollo-Dateien und die nachvollziehbare Übertragung von PPTX/PDF. Er enthält Leitfäden für Argumentation, Quellen, Feedback, unterschiedliche gestalterische Richtungen, Teleprompter und Prüfung sowie einen lokalen Quellenhelfer und zwei Prüfer. Er läuft in deiner KI-Umgebung; Kollo selbst ruft keine KI auf. PPTX/PDF sind Ausgangsmaterial, kein direkter Import und keine verlustfreie Konvertierung. Die nativen Originale bleiben unverändert.

Python-Helfer testen: `npm run test:skill`. Die optionalen PDF-Tests verwenden ein vorhandenes `pypdf` oder PyMuPDF; die GitHub-Prüfung installiert dafür isoliert die festgelegte pypdf-Version. Die Anwendung selbst benötigt diese Pakete nicht.

- [Deutsche Anleitung](public/guide.md): Nutzung, Offline-Betrieb, Exporte und Installation des Skills.
- [Kollo-Skill](skills/kollo-theme/SKILL.md): erzeugt aus geprüften Materialien importierbare `.kollo.json`-Dateien.
- [Dateiformat](skills/kollo-theme/references/schema.md) und [kleines Beispiel](skills/kollo-theme/assets/beispiel.kollo.json).
- [Entscheidungen und offizielle Quellen](docs/research.md).
- [Datenschutz und Sicherheitsgrenzen](SECURITY.md).

Die fertige Anwendung bietet `downloads/kollo-student-kit.zip`, `downloads/kollo-examples.zip`, `downloads/kollo-theme.zip`, `downloads/kollo-studio-offline.zip`, `downloads/kollo-studio-source.zip` und `guide.md` zum Download. Der Skill ist auch ohne Installation als Anweisung samt Referenzdateien verwendbar. Er enthält keinen KI-Account und ruft selbst keine KI-API auf.

## Aufbau und Lizenz

`src/model.ts` prüft das Datenformat. `src/scene.ts` beschreibt die gemeinsame Folienfläche; Vorschau und Exporte verwenden dieselben Elemente. `src/examples.ts` enthält die allgemeinen Beispielpräsentationen; `src/example-assets/` ihre bearbeitbaren Diagrammquellen. `src/presenter/` trennt den gemeinsamen Fenster- und Teleprompter-Code von Oberfläche und Gestaltung. `src/components/` enthält Galerie und Neuanlage. `src/exports.ts` erzeugt die Dateiformate. Die Build-Skripte erzeugen Beispiele, synchronisieren die portablen Skill-Beispiele und stellen die Downloadpakete zusammen. Dokumentation und Skill liegen getrennt von privaten Präsentationen; erzeugte Pakete gehören nicht zum bearbeitbaren Quelltext.

Projektcode und ursprüngliches Thema: Copyright © 2026 Ultrich, [MIT-Lizenz](LICENSE). Abhängigkeiten behalten ihre eigenen Lizenzen. Studierende behalten die Rechte und Verantwortung für ihre eigenen Inhalte und eingebundenen Materialien.
