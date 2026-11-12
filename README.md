# Kollo Studio

Ein lokales Präsentationsstudio für Kolloquien, Seminare und Abschlussvorträge. Inhalte bearbeiten, eine Präsentation abspielen und dieselben Folien als HTML, PDF oder PowerPoint ausgeben. Das Thema stammt aus Ultrichs eigener Präsentationsgestaltung; persönliche Inhalte der Bachelorarbeit sind nicht enthalten. Die mitgelieferten akademischen Inhalte sind Beispiele.

## Starten

Voraussetzung: Node.js 22 oder neuer mit npm; empfohlen ist Node.js 24 LTS. Den Quellcode entpacken und im Projektordner ausführen:

```sh
npm ci
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

1. Beispiel oder Vorlage öffnen, Identität und Redezeit anpassen.
2. Folienlayouts auswählen und Inhalte eingeben. Hinweise auf Überlauf in der Vorschau beheben.
3. Als `.kollo.json` sichern. Dieser bearbeitbare Projektstand enthält auch Vortragsnotizen und Bilder.
4. Präsentation und exportierte Dateien vor dem Vortrag im Zielprogramm prüfen.

Automatische Browserspeicherung ist eine Arbeitshilfe, kein Ersatz für eine Datei. Das Offline-Kit enthält die aktuelle Präsentation als eigenständiges HTML, das Projekt-JSON, die Anleitung und den KI-Skill. Die HTML-Datei ist ein Leser für diese Präsentation; der vollständige Editor liegt im Quellcodepaket.

| Export | Zweck und Grenze |
|---|---|
| `.kollo.json` | vollständig bearbeitbarer Projektstand; unabhängig von einem PowerPoint-Layout |
| HTML | eigenständiger Offline-Vortrag mit Übergängen und Einblendungen |
| PowerPoint, bearbeitbar | native Texte, Formen und Bilder; Schriftmetriken können abweichen |
| PowerPoint, visuell | Folien als Bilder mit fester Darstellung; einzelne Texte nicht bearbeitbar |
| PDF | feste Bilddarstellung der Folien, ohne Animationen |

PPTX/PDF zeigen den Endzustand aller Einblendungen. PowerPoint verwendet einfache Folienübergänge; Browser-Zoom wird als Fade angenähert. Arial und Georgia werden als Systemschriften verwendet und nicht eingebettet. Notizen sind in JSON und Offline-Kit enthalten, dort auch in der HTML-Datei; für einzeln heruntergeladenes HTML/PPTX ist ihre Mitgabe gesondert wählbar.

## KI-Skill und Anleitung

- [Deutsche Anleitung](public/guide.md): Nutzung, Offline-Betrieb, Exporte und Installation des Skills.
- [Kollo-Skill](skills/kollo-theme/SKILL.md): erzeugt aus geprüften Materialien importierbare `.kollo.json`-Dateien.
- [Dateiformat](skills/kollo-theme/references/schema.md) und [kleines Beispiel](skills/kollo-theme/assets/beispiel.kollo.json).
- [Entscheidungen und offizielle Quellen](docs/research.md).
- [Datenschutz und Sicherheitsgrenzen](SECURITY.md).

Die fertige Anwendung bietet `downloads/kollo-theme.zip`, `downloads/kollo-studio-source.zip` und `guide.md` zum Download. Der Skill ist auch ohne Installation als Anweisung samt Referenzdateien verwendbar. Er enthält keinen KI-Account und ruft selbst keine KI-API auf.

## Aufbau und Lizenz

`src/model.ts` prüft das Datenformat. `src/scene.ts` beschreibt die gemeinsame Folienfläche; Vorschau und Exporte verwenden dieselben Elemente. `src/exports.ts` erzeugt die Dateiformate. Dokumentation und Skill liegen getrennt von privaten Präsentationen.

Projektcode und ursprüngliches Thema: Copyright © 2026 Ultrich, [MIT-Lizenz](LICENSE). Abhängigkeiten behalten ihre eigenen Lizenzen. Studierende behalten die Rechte und Verantwortung für ihre eigenen Inhalte und eingebundenen Materialien.
