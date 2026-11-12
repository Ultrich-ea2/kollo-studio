# DELFI · Feedback, das den nächsten Schritt erklärt

Die originale PyTutorAI-Präsentation von Ultrich Edima Edima, mit André Greubel. Das Bildmaterial umfasst 16 Szenen und 6 Minuten 32 Sekunden. Originalvideo und ursprünglicher Sprechtext bleiben erhalten. Stand des gezeigten Projekts: 8. September 2026.

## Gemeinsam vorführen

Dieses Beispiel verwendet dieselbe Vortragssteuerung wie die bearbeitbaren Kollo-Beispiele. `presentation.html` enthält Video, Vorschauen, Sprechtext und Steuerung in einer Datei. Herunterladen und im Browser öffnen. Das Originalvideo hat keine Tonspur; du sprichst selbst.

1. Im Hauptfenster steht der private Sprechtext neben dem Bild. Die hellen Hinweise mitten im Text nennen die nächste Aktion und die Taste **→**.
2. **→** spielt genau eine Animationsphase und hält an deren Ende. Ein weiterer Druck während der Animation beendet diese Phase, ohne die nächste vorzumerken. Erst ein neuer Druck nach der letzten Phase wechselt die Szene.
3. **←** geht eine Phase zurück. Am Anfang einer Szene führt die Taste zur letzten Phase der vorherigen Szene. Bild, private Markierung und Leseposition bleiben zusammen.
4. **Publikumsfenster öffnen** zeigt ausschließlich das Bild. **Teleprompter öffnen** öffnet denselben privaten Leser separat. Die Fenster können auf verschiedene Bildschirme gezogen werden; das Hauptfenster bleibt offen.
5. Die optionale Leseführung startet nur nach einem bewussten Klick. Sie hält vor einem Klicksignal an und schaltet die Präsentation niemals selbst weiter. Eine manuelle Phasenwahl pausiert sie und setzt den Text zur passenden Erklärung. Schriftgröße, Spiegeln und Lesefokus sind in beiden Lesern verfügbar.

Es gibt keinen automatischen Durchlauf. 6:32 beschreibt die Länge des zugrunde liegenden Bildmaterials; die tatsächliche Vortragsdauer hängt von deinem Tempo ab. Standbilder zwischen Animationen werden übersprungen, soweit sie keine neue Bildinformation enthalten.

## Herkunft der neuen Klickphasen

`content.json` bewahrt die ursprünglichen Szenenzeiten, Texte und Credits. `phases.json` ergänzt 81 redaktionell gesetzte, anhand des Originalvideos überprüfte Haltepunkte und die zugehörigen Einfügepositionen für Klicksignale. Diese Phasen waren im Original nicht als Klickanimationen gespeichert. Die Erklärtexte werden durch das Einfügen der Marker nicht umgeschrieben. Die Dateiprüfung rekonstruiert jedes ursprüngliche Wort.

Gleichzeitig ablaufende oder eng verbundene Bewegungen bilden eine gemeinsame Phase. Die einzelnen Grafikelemente liegen im Originalvideo bereits zusammen; sie lassen sich hier nicht unabhängig bearbeiten. Dekorative Bewegung erhält keine zusätzlichen Klicks. `frames/` enthält die Basisansichten der Szenen für die Vorschau.

## Dateien und Grenzen

- `presentation.mp4` und `preview.jpg`: unveränderte Originalmedien, geprüft gegen `provenance.json`.
- `content.json`: Originalinhalte; `phases.json`: neue manuelle Regie.
- `player.js`: kleiner Einstieg in den gemeinsamen Kollo-Presenter. Der Build verwendet `src/presenter/runtime.mjs` und dessen gemeinsame Gestaltung.
- `vorfuehren.html`: veröffentlichte Fassung mit getrennten Dateien; `presentation.html`: vollständige Offline-Datei.

Dieses Video ist ein Anschauungsbeispiel, keine bearbeitbare Kollo- oder PowerPoint-Datei. Eigene bearbeitbare Präsentationen entstehen aus den drei anderen Vorlagen. Veröffentliche private Notizen nur bewusst. Das Publikumsfenster enthält keine Sprechtexte; die vollständige HTML-Datei enthält sie im Quelltext.
