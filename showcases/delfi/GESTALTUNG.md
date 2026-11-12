# DELFI · Feedback, das den nächsten Schritt erklärt

Die originale PyTutorAI-Präsentation von Ultrich Edima Edima, mit André Greubel. 16 Szenen, 6 Minuten 32 Sekunden. Das Video, die Szenenzeiten und der Sprechtext sind erhalten. Stand des darin gezeigten Projekts: 8. September 2026.

## Vorführen

`presentation.html` enthält Video, Vorschaubild, Sprechtext und Bedienoberfläche in einer Datei. Herunterladen und per Doppelklick in Edge, Chrome oder Safari öffnen. Zum Abspielen ist keine Internetverbindung nötig. Das Originalvideo hat keine Tonspur: Du sprichst selbst, der Teleprompter folgt der Videozeit. Er hört dir nicht zu.

1. „Starten“ spielt Video und Leseführung gemeinsam ab; Leertaste pausiert beide.
2. „Abtrennen“ öffnet nur das Video für den Beamer. Das Hauptfenster mit deinem Text bleibt offen. Das zweite Fenster auf den gewünschten Bildschirm ziehen; mit F oder Doppelklick Vollbild einschalten.
3. Im Hauptfenster eine Szene auswählen oder die Zeitleiste verschieben. Das Publikumsvideo folgt. „Tempo“ verändert Video und Leseführung gemeinsam.
4. Textgröße, Spiegelmodus und „Nur Text“ nach Bedarf einstellen. Manuelles Scrollen pausiert die Leseführung; „Zur Leseposition“ schaltet sie wieder ein.

Ein blockiertes Fenster wird erklärt; Pop-ups für die Seite erlauben und „Abtrennen“ erneut wählen. Zwei gleichzeitig geöffnete Präsentationen steuern jeweils ihr eigenes Fenster. Nach dem Neuladen oder Navigieren des Publikumsfensters „Abtrennen“ erneut wählen: Das frühere Fenster wird nicht wiederverwendet. Das Schließen oder Verlassen des Hauptfensters schließt sein noch verbundenes Publikumsfenster.

Der externe Link zur Feedback-Demo in der Hilfe öffnet sich nur nach Anklicken und benötigt Internet. Beim Öffnen und Abspielen werden keine externen Dienste geladen. Die beiden Namen sind die Originalcredits dieses Beispiels; für deine eigene Arbeit deine eigenen Credits verwenden.

## Was die Gestaltung zeigt

- Code und Testergebnis werden als zusammenhängender Ablauf erklärt: Erst der plausible Versuch, dann der Gegenfall, danach die eigene Korrektur.
- Animationen folgen der Erklärung. Sie markieren einen konkreten Startwert, einen Testfall oder einen Weg durch die Pipeline.
- Ruhige dunkelblaue Flächen und Cyan-/Mintakzente verbinden schematische Szenen mit echten Aufnahmen der Demo.
- Ein wiederkehrender Gedanke verbindet den Anfang und den Schluss: der nächste eigene Lernschritt.

Die Animationen sind im originalen Video enthalten. Sie werden weder in einzelne PowerPoint-Formen zurückverwandelt noch als editierbare Folien angeboten. Die drei anderen Beispiele enthalten zusätzlich editierbare Kollo-Projekte und PowerPoint-Dateien.

## Quellcode und Anpassung

Im Quellcode-ZIP liegt dieses Beispiel getrennt unter `showcases/delfi/`:

| Datei              | Aufgabe                                                         |
| ------------------ | --------------------------------------------------------------- |
| `content.json`     | Originaltexte, Credits und 16 Szenen mit Anfang, Ende und Dauer |
| `template.html`    | Struktur und Bedienelemente mit Build-Platzhaltern              |
| `style.css`        | Darstellung des Sprechpults                                     |
| `player.js`        | Videozeit, Leseführung und sichere Fenstersteuerung             |
| `presentation.mp4` | Unverändertes Originalvideo                                     |
| `preview.jpg`      | Unverändertes Originalvorschaubild                              |
| `provenance.json`  | Originaldateiname, Dauer und SHA-256-Prüfsummen                 |

`scripts/build-delfi.mjs` erzeugt die Online-Fassung mit getrennten Assets und die vollständig eingebettete Offline-Datei. `npm run build` erstellt beide. Der Build prüft die Originalmedien und die vollständige Szenenfolge.

Für eine neue eigene Videopräsentation das Beispiel in einen eigenen Ordner kopieren, ein eigenes Video verwenden und dazu passende Texte und Zeiten erstellen. Geänderte Sprechtexte verändern die eingebrannten Bilder im Video nicht. Für frei bearbeitbare Folien von null oder den Umbau einer bestehenden Präsentation den allgemeinen Kollo-Skill und die editierbaren Beispiele verwenden.

Die Originaldarstellung in diesem Video bleibt bei deaktivierten Browseranimationen unverändert, weil sie Teil der Videodatei ist. Die Oberfläche respektiert reduzierte Bewegung bei der Leseführung. Bei Bedarf pausieren, die Zeitposition wählen und die Szenen im eigenen Tempo besprechen.
