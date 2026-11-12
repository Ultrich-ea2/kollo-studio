# Kollo-Dateiformat, Version 1

Die Datei ist ein JSON-Objekt mit Endung `.kollo.json`. Alle unten genannten Felder sind erforderlich; leere Textfelder und leere Listen sind erlaubt. Zusätzliche Felder sind nicht vorgesehen. Nutze `""` statt `null`. Speichere reine Daten, keine Markdown-Codeumzäunung um das JSON.

## Präsentation

| Feld | Typ und Grenze |
|---|---|
| `version` | Zahl `1` |
| `title` | Text, höchstens 200 Zeichen |
| `author` | Text, höchstens 160 Zeichen |
| `institution` | Text, höchstens 200 Zeichen |
| `date` | frei formulierter Text, höchstens 80 Zeichen |
| `duration` | ganze Minuten, 1–240 |
| `theme` | Objekt gemäß nächstem Abschnitt |
| `slides` | Liste mit 1–80 Folien |

Die gesamte UTF-8-Datei darf höchstens 10 MiB groß sein. Die Zeichenlimits entsprechen JavaScript-Zeichenlängen: Ein Emoji außerhalb der BMP zählt meist als zwei UTF-16-Codeeinheiten. Die Daten werden nicht automatisch gekürzt.

## Thema

| Feld | Wert |
|---|---|
| `background` | Hintergrund als `#RRGGBB` |
| `foreground` | Haupttext als `#RRGGBB` |
| `muted` | Nebentext als `#RRGGBB` |
| `primary` | erster Akzent als `#RRGGBB` |
| `secondary` | zweiter Akzent als `#RRGGBB` |
| `font` | `"Arial"` oder `"Georgia"` |
| `scale` | endliche Zahl von 0.8 bis 1.25 |
| `showProgress` | `true` oder `false` |

Die Beispielpalette verwendet einen dunklen Hintergrund und helle Akzente. Erhalte eine vom Nutzer gewählte gültige Palette. Prüfe Kontrast in der Vorschau, insbesondere bei neuen Farben. Schriftarten sind Systemschriften und werden nicht mitgeliefert oder in PowerPoint eingebettet.

## Folie

| Feld | Typ und Grenze |
|---|---|
| `id` | eindeutiger Text mit 1–80 Zeichen aus `A–Z`, `a–z`, `0–9`, `_`, `-` |
| `layout` | einer der unten aufgeführten Namen |
| `section` | Text, höchstens 100 Zeichen |
| `title` | Text, höchstens 200 Zeichen |
| `subtitle` | Text, höchstens 600 Zeichen |
| `items` | Liste mit höchstens 12 Texten, jeweils höchstens 1.200 Zeichen |
| `body` | Text, höchstens 8.000 Zeichen |
| `image` | leer oder eingebettete Bild-Daten-URI |
| `imageAlt` | Bildbeschreibung, höchstens 300 Zeichen |
| `notes` | Vortragsnotizen, höchstens 20.000 Zeichen |
| `source` | sichtbare Quellenangabe, höchstens 2.000 Zeichen |
| `transition` | `"none"`, `"fade"`, `"slide"` oder `"zoom"` |
| `reveal` | schrittweise Darstellung: `true` oder `false` |
| `seconds` | geplantes Zeitbudget dieser Folie, ganze Sekunden von 0 bis 3.600 |

Diese technischen Obergrenzen sind keine Empfehlung für Folienlängen. Für eine typische Folie genügen ein Titel bis etwa 70 Zeichen, ein kurzer Untertitel und drei bis fünf Punkte mit jeweils etwa 90 Zeichen. Kurze Sätze und wenige Codezeilen sind besser lesbar. Die gemeinsame Zeichenfläche ist 1280 × 720, entsprechend 16:9. Prüfe die tatsächliche Vorschau; lange Wörter und Formeln können früher überlaufen.

## Layoutwahl

| `layout` | Inhalt |
|---|---|
| `title` | Titel, Untertitel und Identität der Präsentation |
| `section` | Abschnittswechsel mit kurzer Einordnung |
| `bullets` | Kernaussage und Punkte aus `items` |
| `columns` | höchstens zwei Texte in `items`, je ein Text pro Spalte |
| `process` | Schritte in `items` |
| `stats` | Kennzahlen als `"Wert | Bezeichnung"`; beide Teile nicht leer |
| `quote` | belegtes Zitat in `body`, Nachweis in `source` |
| `code` | unveränderter Code in `body`, kurze Einordnung daneben |
| `image` | Bild in `image`, inhaltlicher Alternativtext in `imageAlt` |
| `chart` | `items` als `"Zahl | Bezeichnung"`; Zahl endlich und nicht negativ, nur Ziffern mit optionalem Dezimalpunkt oder -komma, keine Einheit und kein Exponent |
| `references` | tatsächlich verwendete Quellen in `items` und gegebenenfalls `body` |
| `closing` | Fazit, offene Punkte und Übergang zu Fragen |

Das Layout bestimmt die Darstellung, die Felder bleiben gleich. Verwende leere Werte für nicht benötigte Felder. Text wird als Text behandelt; HTML, Markdown-Syntax und LaTeX werden nicht als ausführbare bzw. eigene Layoutsprache interpretiert.

## Bilder und sichere Daten

`image` akzeptiert ausschließlich `data:image/png;base64,…`, `data:image/jpeg;base64,…` oder `data:image/webp;base64,…`. Die decodierte Datei darf höchstens 2 MiB groß sein, jede Kante höchstens 4096 Pixel. MIME-Typ und Bildsignatur müssen zusammenpassen. Remote-URLs, SVG, GIF und JavaScript sind nicht zugelassen. Die Anwendung prüft Eingaben erneut; Schlüssel wie `__proto__`, `constructor` und `prototype` sind unzulässig. Nicht druckbare Steuerzeichen und isolierte UTF-16-Surrogate sind in Textfeldern unzulässig; Zeilenumbrüche und Tabulatoren sind erlaubt. Referenz-URLs in `source` bleiben Text und werden nicht automatisch geladen.

## Bewegung und Exporte

| Format | Verhalten |
|---|---|
| Studio und eigenständiges HTML | Browser-Übergänge und schrittweises Einblenden; im HTML Tastatursteuerung und Notizenansicht |
| Bearbeitbares PPTX | native Text- und Formobjekte sowie Bilder; andere Schriftmetriken sind möglich |
| Visuelles PPTX | jede Folie als Bild; Text innerhalb der Folie nicht einzeln bearbeitbar |
| PDF | feste Darstellung der Folien als Bilder; keine Bewegung, kein durchsuchbarer Folientext zugesichert |

PowerPoint erhält nur einfache Folienübergänge: `none`, `fade` und `slide` als Push. `zoom` wird dort als Fade angenähert. Elementweise Einblendungen werden für PPTX/PDF im vollständig sichtbaren Endzustand ausgegeben; es gibt keine zugesicherte Übernahme von Browser-Objektanimationen. Ein Export ist keine Garantie für identische Schriftwirkung auf jedem Rechner. Vor der Abgabe die exportierten Dateien im Zielprogramm prüfen.

`seconds` dient zur Redezeitplanung. Es löst keinen automatischen Folienwechsel aus. Projekt-JSON und Arbeitskit enthalten die Notizen; im Arbeitskit auch die eigenständige HTML-Datei. Für einzeln heruntergeladenes HTML/PPTX steuert die Anwendung die Mitgabe von Notizen gesondert.

## Prüfung

`scripts/validate_deck.py` prüft ohne Fremdpakete Dateigröße, Version, Pflichtfelder, Typen, Wertebereiche, eindeutige IDs, Layouts und eingebettete Bilddaten. Er lädt keine URLs und verändert keine Datei. Der Studio-Import und die Vorschau bleiben die maßgebliche Prüfung für die verwendete Anwendungsversion. Überlauf, fachliche Richtigkeit und Quellenqualität lassen sich nicht allein aus dem JSON bestätigen.
