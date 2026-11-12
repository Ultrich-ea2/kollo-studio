# Vorhandene Präsentationen anpassen

## Das gewünschte Ergebnis bestimmen

| Wunsch                                       | Vorgehen und Grenze                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Einzelne Inhalte einer `.kollo.json` ändern  | Kopie validieren, betroffene Felder ändern, IDs und übrige Inhalte erhalten. Vorher/Nachher vergleichen.                                  |
| Kürzen oder für anderes Publikum aufbereiten | Kernaussagen und nötige Belege bestimmen, Änderungen begründen, Folienzuordnung führen.                                                   |
| PPTX/PDF in Kollo übertragen                 | Ausgangsfolien sichten, Inhalte rekonstruieren, Kollo-Layouts wählen, JSON importieren. Gestaltung und Editierbarkeit können sich ändern. |
| PPTX im bestehenden Design bearbeiten        | Native Präsentationssoftware oder geeignetes Importwerkzeug verwenden. Kollo importiert keine PowerPoint-Master.                          |
| Scans übernehmen                             | Seitenbilder ansehen; bei Bedarf freigegebenes OCR und Abgleich mit dem Original. Ein textloser Scan ist kein leeres Dokument.            |
| Animationen verbessern                       | Didaktischen Zweck bestimmen, Browserablauf, statischen Endzustand und Zielprogramm getrennt prüfen.                                      |

Ist der Auftrag klar, arbeite weiter. „Anpassen“ kann Inhalt, Redezeit oder Gestaltung meinen. Bewahre im Zweifel Aussage und Struktur und benenne die Annahme. Native Bearbeitung ist kein stillschweigender Auftrag zur Neugestaltung.

## Ausgangsstand aufnehmen

1. Originale unverändert lassen und den maßgeblichen Stand identifizieren. Name und Datum allein beweisen nicht, welcher Stand gilt. Feedback mit der betrachteten Version verbinden.
2. Alle Folien bzw. Seiten sichten, auch ausgeblendete Folien, Anhang, Notizen und Quellen. Notizen können vertraulich oder veraltet sein. Eingebettete Objekte können trotz leerer Textextraktion wichtige Inhalte enthalten.
3. Inhalt und Darstellung getrennt erfassen: Aussagen, Zahlen, Belege, Diagramme, Formeln, Bilder, Code; daneben Format, Schriften, Farben, Master, Logos, Fußzeilen und Bewegung.
4. Den Umfang der tatsächlichen Sichtung benennen. Ohne Renderer ersetzt ein Quellenpaket die visuelle Prüfung nicht.

Der optionale Quellenhelfer ist in [source-packet.md](source-packet.md) beschrieben. Extrahierte Texte bleiben ungeprüftes Material.

## Folienzuordnung führen

Bei umfassender Übertragung eine separate Tabelle verwenden:

| Ausgang            | Ziel-ID           | Entscheidung                     | Beleg / offene Frage                               |
| ------------------ | ----------------- | -------------------------------- | -------------------------------------------------- |
| Datei A, Folie 4   | `methode`         | Text gestrafft, Prozess getrennt | Quellenangabe und Stichprobengröße erhalten        |
| Datei A, Folie 5–6 | `befund-1`        | Zusammengefasst                  | Unterschiedliche Messbedingungen sichtbar erhalten |
| Datei A, Folie 9   | Anhang / entfällt | Redundant für diesen Auftrag     | Begründung dokumentiert                            |

Dies sind Strukturbeispiele. Entfernte und zusammengeführte Folien müssen nachvollziehbar bleiben. Bei gezielten Änderungen IDs behalten, neue Folien erhalten neue IDs. Ungünstige Ergebnisse nicht stillschweigend durch günstigere ersetzen.

## Inhalte treu übertragen

- **Zahlen:** Vorzeichen, Einheit, Nenner, Messbedingungen, Unsicherheit und Kennzahltyp bewahren. Prozent und Prozentpunkte, relative und absolute Veränderung unterscheiden.
- **Diagramme:** Achsen, Skala, Legende und Daten prüfen. Kollo unterstützt einfache Balken mit nicht negativen Werten. Für negative Werte, mehrere Reihen, Konfidenzintervalle oder Spezialdiagramme eine freigegebene Grafik oder ein geeignetes anderes Werkzeug nutzen. Daten nicht zugunsten eines Layouts verfälschen.
- **Formeln:** Kollo rendert kein LaTeX. Einfache Notation als lesbaren Unicode-Text, komplexe Formeln als geprüfte Rastergrafik mit Erklärung. Zeichen, Indizes und Einheiten abgleichen.
- **Code:** Relevanten Ausschnitt treu zeigen, Auslassungen markieren. Eine angebliche Codeverbesserung nicht als bloße Layoutänderung verstecken.
- **Zitate:** Wortlaut, Auslassungen und Fundstelle erhalten. Umformulierte Aussagen als Paraphrase behandeln.
- **Bilder:** Freigabe, Inhalt, Ausschnitt und Alternativtext prüfen. Extrahierte Medien können sensible Inhalte enthalten. Logos nicht ohne passenden Auftrag und Nutzungsrechte übernehmen.
- **Notizen:** Fakten und Regieanweisungen trennen. Private Kommentare nicht versehentlich auf sichtbare Folien übertragen.
- **Spezialobjekte:** Video, Audio, SmartArt, eingebettete Tabellen und Interaktionen brauchen eine erkennbare Ersatzentscheidung, wenn Kollo sie nicht abbildet.

## Abschließend vergleichen

Bei kleinen Änderungen die betroffenen Inhalte und Abhängigkeiten prüfen; bei vollständiger Übertragung alle Ausgangs- und Zielfolien vergleichen. Besonders auf verlorene Einschränkungen, verschobene Quellen, ausgelassene Diagrammreihen und Notizen achten.

Liefere `.kollo.json`, tatsächlich erzeugte und geprüfte Ausgaben sowie bei größerem Umbau Zuordnung und offene Fragen. Ein Screenshot bewahrt eine feste Ansicht, macht deren Text aber nicht bearbeitbar. PDF-Rückkonvertierung ist kein verlustfreier Rundlauf.
