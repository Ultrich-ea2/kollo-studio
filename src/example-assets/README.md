# Bildquellen der Beispiele

`campus-plan.svg` ist eine eigens gezeichnete, fiktive Entwurfsskizze ohne Maßstab. Die SVG-Datei bleibt als editierbare Quelle erhalten. `campus-plan.json` enthält ausschließlich das daraus erzeugte PNG als eingebettete Daten-URI. Die Folien benötigen dadurch keine externen Bilddateien, Schriftdateien oder Netzverbindungen. Beides steht unter der MIT-Lizenz dieses Projekts.

Nach einer Änderung der SVG-Quelle im Repository:

```sh
npm ci --ignore-scripts
# Unter Windows wird vorhandenes Microsoft Edge verwendet.
# Sonst einmalig: npx playwright install chromium
node src/example-assets/render.mjs
npm run build
```

Der Renderer arbeitet mit 2560 × 720 Pixeln und blockiert externe Requests. Er dient dieser eigenen, vertrauenswürdigen Quelle; er ist kein Konverter für beliebige fremde SVG-Dateien. Das neue Ergebnis anschließend in der Studio-Vorschau und im benötigten Exportformat kontrollieren.

Ohne Quellcode: SVG in einem geeigneten Grafikprogramm bearbeiten, als PNG exportieren und im Bildlayout des Studios lokal einfügen. Kollo akzeptiert Rasterbilder bis 2 MiB und höchstens 4096 Pixel pro Kante. Die Bestandteile der Skizze bleiben in der SVG editierbar; im PPTX erscheinen sie zusammen als Bild.
