# Gestaltung und Bewegung im Kollo-Thema

Kollo verwendet eine gemeinsame Fläche von 1280 × 720. Vorschau und Export teilen diese Geometrie. Die Beispielpalette ist dunkelblau mit Cyan und Mint; die Farbwerte stehen in der Beispieldatei. Eine vorhandene gültige Palette bleibt erhalten, solange der Auftrag keine neue Gestaltung verlangt. Arial und Georgia sind die unterstützten Schriftfamilien und werden nicht eingebettet.

## Eine eigene gestalterische Richtung

Entscheide vor der Ausarbeitung, wie der Inhalt gesehen werden soll. Ein philologischer Textvergleich, eine technische Demo und eine Entscheidungsvorlage brauchen unterschiedliche visuelle Beziehungen. „Modern“ allein ist noch keine Richtung. Formuliere eine konkrete Absicht, etwa: „ruhige Satzspiegel mit großen Textbelegen“, „präzise technische Beschriftungen mit klarer Leserichtung“ oder „große Behauptung, danach sparsame Evidenz“.

Die optionale `theme.composition` wählt `classic`, `editorial`, `technical` oder `stage`; ohne Angabe gilt `classic`. Das ändert die Anordnung der unterstützten Layouts, nicht das Datenmodell. Die drei zusätzlichen Beispielreihen zeigen unterschiedliche Richtungen. Ihre fiktiven Themen, Texte, Zahlen und Ablaufpläne sind kein wissenschaftliches Ausgangsmaterial.

| Richtung    | Sinnvolle Verwendung                                                | Worauf achten                                                                                  |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `classic`   | Bestehende Kollo-Dateien, klare akademische Erklärung               | Gewohnte Hierarchie bewahren; nicht jede Folie als Liste behandeln                             |
| `editorial` | Textargument, gesellschaftliche Frage, begründeter Vergleich        | Großzügige Fläche, kurze Überschriften, kontrollierte Textmenge                                |
| `technical` | Ablauf, System, Messung, nachvollziehbare Demo                      | Präzise Labels, Einheiten und Leserichtung; keine technisch wirkende Dekoration ohne Bedeutung |
| `stage`     | Pointierter Einstieg, Projektidee, mündlich getragene Argumentation | Starke Größenunterschiede brauchen kurze Texte; Evidenz und Einschränkungen bleiben lesbar     |

Ein eigenständiger Vortrag entsteht durch die passende Auswahl und Ausarbeitung, nicht durch eine behauptete „KI-freie“ Ästhetik. Prüfe insbesondere, ob jede Folie denselben austauschbaren Aufbau aus Überschrift und drei Kacheln wiederholt. Wechsle dort die Darstellung, wo sich die Beziehung der Inhalte ändert: Vergleich, Beleg, Prozess, Bild oder Antwort. Vermeide zufällige Variation ohne inhaltlichen Grund.

Halte Palette, typografische Hierarchie, Beschriftungen und Abstände innerhalb des Vortrags konsistent. Setze große ruhige Flächen neben präzise dichte Belege. Dekorative Farbverläufe, Glanz, riesige Nummern oder abstrakte Formen sind keine Pflicht; benutze sie nur, wenn die tatsächlich unterstützte Komposition und der Auftrag dazu passen. Keine externen Fonts, CSS oder beliebigen Skripte in die JSON-Datei schreiben.

## Layout nach Beziehung der Inhalte wählen

| Inhalt                                 | Layout und praktische Grenze                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Einstieg mit Thema und Identität       | `title`; Titel, Untertitel, optional kurzer Text und wenige Punkte               |
| Übergang zu einer neuen Frage          | `section`; sparsam einsetzen, keine leeren Trennfolien für kurze Vorträge        |
| Aussage mit Begründungen               | `bullets`; lange Punkte in Sprechtext oder mehrere Folien aufteilen              |
| Zwei Perspektiven                      | `columns`; höchstens zwei `items`, Zeilenumbrüche bleiben innerhalb einer Spalte |
| Nachvollziehbare Schritte              | `process`; wenige kurze Schritte, Leserichtung kontrollieren                     |
| Einzelne Kennzahlen                    | `stats`; `Wert \| Bezeichnung`, Bedeutung und Bezugsgröße ergänzen               |
| Einfacher quantitativer Vergleich      | `chart`; nicht negative Zahlen, vergleichbare Einheit und Bezugsgröße            |
| Wörtlicher Beleg                       | `quote`; `body` enthält das Zitat, `source` den Nachweis                         |
| Codeausschnitt                         | `code`; `body` ist Code, `items` werden nicht als Liste dargestellt              |
| Screenshot, Diagramm oder Formelgrafik | `image`; nicht verzerren, Lesbarkeit und Alternativtext prüfen                   |
| Verwendete Literatur                   | `references`; Kurzbelege auf den betreffenden Folien bleiben nötig               |
| Antwort und Ausblick                   | `closing`; maximal drei Abschlussfelder sichtbar                                 |

Das Schema erlaubt mehr Text, als auf eine gut lesbare Folie passt. Lange Wörter, Formeln und Quellenzeilen können auch unter Zeichenlimits überlaufen. Prüfe Layoutwarnungen und die tatsächliche Vorschau. Nicht pauschal alle Schriften verkleinern, um dichte Inhalte zu verstecken. Ein außerhalb des Bildlayouts gespeichertes `image` ist dort nicht sichtbar.

Bei `process` und `closing` sind die Textfelder wesentlich schmaler als bei einer normalen Liste. Beginne mit kurzen Beschriftungen von etwa zwei bis fünf Wörtern je Feld. Erklärungen gehören daneben auf eine andere Folie oder in Notizen. Vier Schritte mit vollständigen langen Sätzen überlaufen häufig; wähle dafür gegebenenfalls `bullets` oder `columns`. Auch der große Untertitel einer Titelfolie bietet nur wenig Platz. Diese Startwerte sind Orientierung, keine garantierten Grenzwerte. Erst die tatsächliche Szene zeigt, was mit Palette, Schriftgröße und Wortlängen passt.

## Lesbarkeit und Präzision

Titel tragen eine präzise Aussage oder Frage. Keine unbelegten Steigerungen wie „revolutionär“, wenn das Material nur einen Prototyp zeigt. Notwendige Fachbegriffe behalten und Abkürzungen beim ersten relevanten Auftreten erklären. Pro Folie eine erkennbare Hauptaussage. Drei bis fünf Punkte können passen, sind aber keine Pflicht.

Fachlich wichtige Grafiken haben Vorrang vor dekorativen Bildern. Ein wissenschaftlicher Vortrag braucht keine Illustration auf jeder Seite. Farben nicht als einziges Unterscheidungsmerkmal einsetzen; Beschriftung oder Form ergänzen. Auch Quellen, Einschränkungen und Nebentext müssen lesbar sein.

Bei erklärenden Folien ist eine präzise Aussage im Titel mit einem passenden sichtbaren Beleg eine hilfreiche Möglichkeit. Harvard Catalyst beschreibt diesen Assertion-Evidence-Ansatz. Nutze ihn dort, wo er dem Inhalt dient; er ersetzt weder den eigenen Fachstil noch vorgeschriebene Vorlagen. Eine Textanalyse braucht nicht zwanghaft ein Diagramm, ein Diagramm keine dekorative Illustration. [Harvard Catalyst: Slides](https://catalyst.harvard.edu/writing-communication-center/visualize-science/slides/)

Der Kontrastprüfer nutzt 4,5:1 für normalen und 3:1 für großen Text als Orientierung nach WCAG. Er kennt nicht jede tatsächliche Hintergrundfläche oder Projektionseigenschaft und stellt keine Barrierefreiheitszertifizierung aus. Bilder lokal prüfen, sinnvoll zuschneiden und bei Bedarf neu speichern. Alttext beschreibt die Funktion und die relevante Aussage, statt nur „Grafik“ zu schreiben.

## Bewegung mit einem Zweck

`transition` wählt `none`, `fade`, `slide` oder `zoom`. `reveal` blendet geeignete Inhaltsgruppen ein; es ist keine frei programmierbare Zeitleiste. `seconds` plant die Redezeit, löst keinen automatischen Wechsel aus.

Einblendungen helfen bei Prozessen, Herleitungen oder schrittweisen Vergleichen. Gleichzeitig benötigte Inhalte müssen gleichzeitig sichtbar sein. Dauerndes Zoomen oder wechselnde Übergänge erschweren das Lesen. Reduzierte Bewegung respektieren, Tastatursteuerung und vollständig sichtbaren Endzustand prüfen.

Gestalte einen gedanklichen Takt statt eines Effektkatalogs. Bei einem Prozess erklärt der Sprechtext erst den aktuellen Schritt, dann folgt die nächste Einblendung. Bei einer Gegenüberstellung dürfen die beiden Vergleichspartner nicht unnötig nacheinander verschwinden. Eine kurze, einfache Bewegung kann die Blickführung unterstützen; die Information muss auch ohne Bewegung verständlich sein.

Kollo kann vorhandene Inhaltsgruppen einblenden und Folien überblenden. Es bietet keine frei programmierbaren Bewegungspfade, Zeichenanimation von Diagrammverbindungen, Videozeitleiste, automatisch synchronisierte Stimme oder PowerPoint-Morph-Effekte. Eine gewünschte semantische Animation gegebenenfalls mit aufeinanderfolgenden Folienzuständen, einer übersichtlichen Prozessfolge oder einem geeigneten externen Werkzeug umsetzen. Zusätzliche Folien dürfen dabei nicht als verschiedene Forschungsergebnisse erscheinen. Keine nicht unterstützte Funktion als „fertig“ beschreiben.

Plane für eine Demo bewusst den ersten sichtbaren Zustand und den Endzustand sowie die tatsächlich gerenderten Gruppen dazwischen. Kontrolliere mit zurückgesetzten Einblendungen, ob eine Frage noch verständlich ist, bevor ihre Antwort erscheint. Für gewünschte Klicksignale eine alleinstehende `[KLICK]`-Zeile vor der Erklärung jeder zunächst verborgenen Gruppe und `[FOLIE]` am tatsächlichen Folienende einsetzen. `→` zeigt die nächste Phase samt zugehörigem Sprechtext, `←` kehrt zur vorherigen Phase zurück. Beide Leseansichten zeigen die Anweisung direkt zwischen den gesprochenen Absätzen. Die optionale Leseführung hält am Signal an und bleibt nach dem manuellen Schritt pausiert; sie schaltet die Folie nicht selbst weiter. Frei formulierte Regiezeilen bleiben gewöhnlicher Text. Auf statischen Layouts keine künstlichen Klickphasen erfinden. Die genaue Syntax und Probe stehen in [Präsentieren und Teleprompter](presenting-and-teleprompter.md).

HTML erhält Browserfunktionen. PowerPoint erhält einfache Übergänge; Zoom wird Fade, Einblendungen werden nicht vollständig übertragen. PDF ist statisch. Ein Spannungsaufbau kann im PDF die Antwort sofort zeigen. Die statische Folie muss auch allein verständlich bleiben.

## Referenzen für die genannten Prüfziele

- [WCAG: Kontrastminimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [WCAG: Informationen nicht nur durch Farbe vermitteln](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [WCAG: Animationen durch Interaktion](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Diese Referenzen bedeuten nicht, dass jede Kollo-Präsentation alle WCAG-Anforderungen erfüllt.
