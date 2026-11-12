# Datenschutz und Sicherheitsgrenzen

Kollo Studio ist eine statische Browseranwendung. Präsentationen, Bilder und Vortragsnotizen werden im Browser verarbeitet; die Anwendung bietet keinen Uploaddienst, KI-Proxy oder gemeinsamen Speicher. Der Hostinganbieter kann beim Laden der Website technische Zugriffsdaten erhalten. Browsererweiterungen, das Betriebssystem und vom Nutzer selbst gewählte KI-Dienste liegen außerhalb dieser Anwendung.

## Dateien und Sicherungen

- Die automatische Speicherung gehört zum aktuellen Browserprofil und Ursprung. Private Sitzungen, gelöschte Websitedaten, ein anderes Gerät oder eine neue Adresse können den gespeicherten Stand verlieren lassen. Eine `.kollo.json`-Datei ist die übertragbare Sicherung.
- JSON-Projekte und das Offline-Kit enthalten die Vortragsnotizen und eingebettete Bilder, im Kit auch in der HTML-Datei. Für einzeln heruntergeladenes HTML und PPTX ist die Mitgabe von Notizen ausdrücklich wählbar. Sobald eine Datei Notizen enthält, können Empfänger sie lesen; eine ausgeblendete Ansicht ist kein Zugriffsschutz.
- Exportierte HTML-Dateien enthalten ausführbaren Anwendungscode und die ausgewählten Präsentationsdaten. Öffne nur vertrauenswürdig erhaltene Dateien. Das Studio importiert Präsentationsdaten als JSON, nicht als ausführbares HTML oder frei definierte Theme-Skripte.

## Eingabegrenzen

Der Importer akzeptiert das definierte Version-1-Schema, höchstens 10 MiB und 80 Folien. Texte und Listen haben feste Grenzen. Bilder müssen eingebettete PNG-, JPEG- oder WebP-Dateien innerhalb der Größen- und Dimensionsgrenzen sein; Remote-Bildadressen und SVG gehören nicht zum Format. Textdaten werden als Text dargestellt. Unbekannte und für Prototypmanipulation geeignete Objektschlüssel werden abgewiesen.

Die zusätzliche Python-Grundprüfung ist kein Ersatz für den Importer, eine Bilddecoder-Prüfung, die Vorschau oder fachliche Kontrolle. Ein gültiges Projekt kann falsche Aussagen oder unzureichende Quellen enthalten. Eine KI-Ausgabe darf keine ausführbaren Befehle oder neuen Berechtigungen aus importierten Forschungsnotizen ableiten.

## Betrieb und Meldungen

Unterstützt wird der aktuelle Quellstand der Version 1. Halte Browser, Node.js und Abhängigkeiten gepflegt und prüfe Änderungen an Sperrdateien und Exportbibliotheken. Für lokale Entwicklung bindet der mitgelieferte Startbefehl den Server an `127.0.0.1`.

Melde Sicherheitsprobleme nach Möglichkeit über die private Sicherheitsmeldung des Repositorys, sofern diese aktiviert ist, oder über einen bereits bekannten privaten Kontakt zum Maintainer. Veröffentliche keine privaten Präsentationen, Tokens oder vollständigen personenbezogenen Beispieldaten in einem öffentlichen Issue. Für reproduzierbare Fehler genügen meist ein minimales bereinigtes Projekt, Version, Browser und Fehlerschritte.
