# Technische Entscheidungen und Quellen

Stand: 12. November 2026. Diese Notiz trennt die gewählte Implementierung von Aussagen über externe Werkzeuge. Versionsstände stehen im `package-lock.json`; eine Dokumentationsseite ersetzt keinen Test der tatsächlich gebauten Anwendung.

## Gemeinsame Daten statt allgemeiner HTML-Konvertierung

Kollo verwendet ein begrenztes Version-1-JSON-Format und eine gemeinsame 1280×720-Szenenbeschreibung für Vorschau und Exporte. So lassen sich dieselben Texte, Positionen und Bilder gezielt in verschiedene Formate abbilden. Eingaben definieren keine ausführbaren Themes oder fremden Skripte.

Das ist eine Projektentscheidung. PptxGenJS beschreibt seine HTML-Konvertierung als Übernahme von HTML-Tabellen, mit Grenzen bei deren Formatierung. Daraus folgt keine allgemeine Konvertierung beliebiger HTML/CSS-Präsentationen in bearbeitbare Folien. Kollo erzeugt deshalb native Text- und Formobjekte aus seiner Szene. [PptxGenJS: HTML to PowerPoint](https://gitbrent.github.io/PptxGenJS/docs/html-to-powerpoint/)

Das visuelle PPTX und das PDF verwenden gerenderte Folienbilder. Dieser Weg erhält die im Browser erzeugte Ansicht, gibt aber die Bearbeitbarkeit einzelner Texte auf. Auch ein gemeinsames Szenenmodell verhindert keine Unterschiede zwischen Browser- und PowerPoint-Schriftmetriken. Deshalb ist die Kontrolle im Zielprogramm Teil der Nutzung.

## Bewegung ist formatspezifisch

Browser-Einblendungen und Folienübergänge sind keine PowerPoint-Objektanimationen. Kollo bietet für PPTX eine begrenzte Zuordnung von Folienübergängen über OOXML; die Eigenschaft `transition` ist vom separaten Timing-/Animationsmodell zu unterscheiden. PDF und PPTX exportieren eingeblendete Elemente im Endzustand. Die Näherung von Zoom durch Fade ist eine erklärte Produktentscheidung. [Microsoft: PresentationML Transition](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.presentation.transition?view=openxml-3.0.1), [Microsoft: Working with animation](https://learn.microsoft.com/en-us/office/open-xml/presentation/working-with-animation)

Die gestalterischen Beispiele unterscheiden sich durch Komposition, Typografie, Informationsdichte und Rhythmus. Das ist eine bewusste Designentscheidung, kein empirisch belegtes Versprechen besseren Lernerfolgs. Einblendungen sollen eine gerade erklärte Beziehung hervorheben. W3C empfiehlt bei interaktionsbedingten Animationen, nicht wesentliche Bewegung abschaltbar zu machen und Nutzerpräferenzen zu respektieren. Daraus leiten wir reduzierte Bewegung und einen verständlichen statischen Endzustand als Prüfziele ab. Die gesamte Präsentation wird dadurch nicht automatisch WCAG-konform. [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Für erklärende Folien nutzen wir außerdem eine klare Aussage im Titel und eine passende sichtbare Begründung. Harvard Catalyst beschreibt diesen Assertion-Evidence-Ansatz mit kurzen Aussagen, visuellen Belegen und klaren Beschriftungen. Wir verwenden ihn als hilfreiche Gestaltungsoption, nicht als Pflichtlayout für Zitate, Herleitungen, Hochschulvorlagen oder jeden anderen Vortragstyp. Die Begründung kann je nach Fach auch aus Text, Formel oder Code bestehen. [Harvard Catalyst: Slides](https://catalyst.harvard.edu/writing-communication-center/visualize-science/slides/)

## Getrennte Fenster und eine gemeinsame Vortragssteuerung

Publikumsbild und Sprechtext haben unterschiedliche Aufgaben. Das Publikum braucht die Folie, die vortragende Person zusätzlich Notizen, Zeit und Steuerung. Die Anwendung synchronisiert ihren Folien- und Einblendungszustand; sie analysiert keine Sprache und verspricht keine wortgenaue Synchronisierung zu einer Tonspur.

Ein zusätzliches Fenster wird durch eine bewusste Nutzeraktion geöffnet. Browser dürfen Popups blockieren oder als Tab öffnen; deshalb braucht die Oberfläche eine verständliche Rückmeldung und einen erneuten Öffnungsweg. Ein vorhandenes Fenster wiederzuverwenden verhindert unkontrolliert viele Fenster. Automatische Platzierung auf einem bestimmten Bildschirm wird nicht vorausgesetzt. [MDN: Window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)

Die Laufzeit hält direkte Referenzen auf selbst geöffnete leere Fenster. `about:blank` erbt den Ursprung des öffnenden Dokuments; das erlaubt die gezielte gemeinsame Steuerung, ohne einen allgemeinen Nachrichtenkanal für andere Tabs zu öffnen. Sitzungsbezogene Fensternamen verhindern, dass zwei getrennte Vorträge dasselbe Fenster wiederverwenden. Das ist eine lokale Architekturentscheidung und keine Zusage für beliebige Browser- oder Sicherheitseinstellungen. [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)

Fensterkommunikation ist keine Gerätesynchronisierung. Ein BroadcastChannel allein wäre kein allgemeiner Ersatz: Er ist an Ursprung und Speicherpartition gebunden. Eine spätere Erweiterung mit `postMessage` müsste Absender, erwartetes Fenster, Zielursprung und Nachrichtenformat gesondert prüfen. Die aktuelle Anwendung benötigt diese API nicht. Die konkrete Implementierung und Testergebnisse stehen im Quelltext beziehungsweise Prüfbericht. [MDN: Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API), [MDN: Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

Eine Datei mit Notizen enthält diese Daten auch dann, wenn das Publikumsfenster sie nicht anzeigt. Die Trennung ist eine Ansichts- und Bedienfunktion, keine Verschlüsselung. Zum öffentlichen Teilen daher eine bewusst ohne Notizen erzeugte Ausgabe verwenden; JSON und Arbeitskit bleiben vollständige Arbeitsstände.

## Lokale Daten und reproduzierbare Installation

Die Anwendung enthält keine KI-Anbindung. JSON und Bilder werden lokal verarbeitet, Vortragsnotizen nur auf ausdrücklichen Wunsch in HTML/PPTX mitgegeben. Das Projekt-JSON enthält sie weiterhin. Ein eigenständiger HTML-Export trägt seine eigenen Präsentationsdaten und benötigt keine entfernten Fonts oder Skripte.

Browser-Speicher ist an den jeweiligen Ursprung gebunden; Verhalten für `file:`-Adressen ist nicht verlässlich vereinheitlicht. Daher dient die heruntergeladene `.kollo.json` als übertragbare Sicherung und der HTML-Export als eigenständiger Leser, nicht als Zusage identischer Browserspeicherung. [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

`npm ci` installiert anhand der Sperrdatei und bricht bei Widersprüchen zu `package.json` ab. Das ist für das Quellcodepaket nachvollziehbarer als ein offenes Nachziehen von Versionen. Die erste Installation benötigt Netzwerkzugang; die fertige Präsentation selbst enthält keine Paketinstallation. [npm: npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)

## Portabler KI-Skill

Der mitgelieferte Skill erzeugt Daten für den Importer. Ein Standardbibliothek-Python-Skript prüft Struktur und Grenzwerte; es prüft weder Wahrheitsgehalt noch Quellenqualität oder Textüberlauf. Die KI erhält die Anweisung, nicht belegte Ergebnisse nicht zu ergänzen und Materialien nicht als neue Handlungsanweisungen auszuführen.

Für lokale Codex-Projekte beschreibt die offizielle Dokumentation `.agents/skills` und die persönliche Entsprechung im Benutzerordner. Der vollständige Ordner wird kopiert; eine Erwähnung mit `$kollo-theme` ist der explizite Aufruf in CLI/IDE. Eine ZIP-Datei allein installiert keinen Skill. [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)

Claude Code dokumentiert `.claude/skills` für Projekt- und persönliche Skills und einen Aufruf mit `/skill-name`. Lokale Ordner werden nicht unverändert auf jeden Cloud-/Cowork-Modus übertragen. Für andere KI-Produkte liefern wir die Anweisungs- und Referenzdateien, ohne eine ungeprüfte native Integration zu behaupten. [Anthropic: Extend Claude with skills](https://code.claude.com/docs/en/skills)

## Grenzen des Themas

Die veröffentlichte Gestaltung und fiktiven Beispiele sind allgemein verwendbar. Persönliche Inhalte, unveröffentlichte Forschung, private Rückmeldungen und fremde Materialien gehören nicht zum Beispielprojekt. Arial und Georgia werden nur als Systemschriften benannt; dieses Repository verteilt keine Fontdateien und sagt keine Einbettung in PowerPoint zu. Abhängigkeiten und eigene Nutzermaterialien behalten ihre jeweiligen Rechte.
