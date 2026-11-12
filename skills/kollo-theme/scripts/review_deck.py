#!/usr/bin/env python3
"""Advisory review of valid Kollo v1 data. Standard library, no writes/network.

This does not implement the Studio renderer and cannot verify facts, references,
image decoding, spoken duration, accessibility conformance or export fidelity.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from validate_deck import load_deck, validate_deck, utf16_length, js_trim

LIMITATIONS = [
    "Längen- und Layoutmeldungen sind Heuristiken; createScene und die gerenderte Vorschau prüfen den tatsächlichen Umbruch.",
    "Kontrastwerte vergleichen nur die fünf Themenfarben mit dem Hintergrund. Karten, Bilder, Schriftgröße und weitere visuelle Inhalte sind nicht vollständig geprüft.",
    "4,5:1 gilt als WCAG-Referenz für normalen Text, 3:1 für großen Text. Die Werte bescheinigen keine vollständige Barrierefreiheit.",
    "Zeitwerte sind geplante Sekunden, keine gemessene Vortragsdauer und kein automatischer Folienwechsel.",
    "Klickmarken werden auf Reihenfolge und offensichtliche Widersprüche geprüft. Anzahl und Zeitpunkt der tatsächlich gerenderten Einblendungen müssen im Sprechpult geprüft werden.",
    "Quellen- und Notizfelder werden nur auf Vorhandensein geprüft. Behauptungen, Zitate, URLs, Bibliografien und die Herkunft von Daten werden nicht verifiziert.",
    "Die Bildprüfung liest Formatheader und Grenzen; sie ersetzt keine echte Bilddecodierung und keine visuelle Prüfung.",
]


def contrast_ratio(foreground, background):
    """WCAG relative luminance for six-digit opaque sRGB colors."""
    def luminance(color):
        channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
        return sum(c * weight for c, weight in zip(linear, (0.2126, 0.7152, 0.0722)))
    a, b = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (a + 0.05) / (b + 0.05)


def cue_plan(notes):
    """Match the private presenter convention; preserve legacy bracket text."""
    lines = re.split(r"\r\n?|\n", notes)
    markers = []
    near_markers = []
    for number, line in enumerate(lines):
        match = re.fullmatch(r"[ \t]*\[(KLICK|FOLIE)\][ \t]*", line)
        if match:
            markers.append((number, match.group(1)))
        elif re.fullmatch(r"[ \t]*\[(?:KLICK|FOLIE)(?:[ \t]*:[^\]\r\n]*|[ \t]*)\][ \t]*", line, re.IGNORECASE):
            near_markers.append(number)
    return lines, markers, near_markers


def review_deck(deck):
    try:
        errors = validate_deck(deck)
    except (ValueError, TypeError, RecursionError, OverflowError) as exc:
        errors = ["Schema konnte nicht geprüft werden: " + str(exc)]
    report = {"version": 1, "schema": {"valid": not errors, "errors": errors},
              "summary": None, "issues": [], "contrast": [], "limitations": list(LIMITATIONS)}
    if errors:
        return report

    def issue(code, severity, path, message, slide=None):
        item = {"code": code, "severity": severity, "path": path, "message": message}
        if slide is not None:
            item["slideId"] = slide["id"]
        report["issues"].append(item)

    slides = deck["slides"]
    target = deck["duration"] * 60
    planned = sum(slide["seconds"] for slide in slides)
    report["summary"] = {
        "slideCount": len(slides), "targetSeconds": target, "plannedSeconds": planned,
        "differenceSeconds": planned - target,
        "slidesWithSource": sum(bool(js_trim(slide["source"])) for slide in slides),
        "slidesWithNotes": sum(bool(js_trim(slide["notes"])) for slide in slides),
    }
    if planned == 0:
        issue("TIMING_UNPLANNED", "warning", "slides[].seconds", "Für keine Folie ist Redezeit geplant.")
    elif abs(planned - target) > target * 0.2:
        issue("TIMING_TARGET_MISMATCH", "warning", "duration", "Geplante Folienzeiten und Zielzeit weichen um mehr als 20 % voneinander ab.")

    theme = deck["theme"]
    for field in ("foreground", "muted", "primary", "secondary"):
        ratio = contrast_ratio(theme[field], theme["background"])
        pair = field + "/background"
        report["contrast"].append({"pair": pair, "ratio": round(ratio, 4),
                                   "normalPass": ratio >= 4.5, "largePass": ratio >= 3})
        if ratio < 3:
            issue("CONTRAST_LARGE_LOW", "warning", "theme." + field,
                  "Kontrast zum Hintergrund liegt unter 3:1; auch große Schrift ist kritisch. Tatsächliche Verwendung visuell prüfen.")
        elif ratio < 4.5:
            issue("CONTRAST_NORMAL_LOW", "warning", "theme." + field,
                  "Kontrast zum Hintergrund liegt unter 4,5:1. Besonders kleine Schrift und Quellenangaben prüfen.")

    for index, slide in enumerate(slides):
        path = f"slides[{index}]"
        layout = slide["layout"]
        lines, markers, near_markers = cue_plan(slide["notes"])
        if markers:
            clicks = [line for line, kind in markers if kind == "KLICK"]
            changes = [line for line, kind in markers if kind == "FOLIE"]
            if clicks and not slide["reveal"]:
                issue("CUE_CLICK_WITHOUT_REVEAL", "warning", path + ".notes",
                      "[KLICK] verlangt eine Einblendung, aber für diese Folie sind Einblendungen deaktiviert. Marke oder Folienablauf berichtigen.", slide)
            if len(changes) > 1:
                issue("CUE_SLIDE_DUPLICATE", "warning", path + ".notes",
                      "Mehrere [FOLIE]-Marken auf derselben Folie: Nur eine abschließende Wechselmarke verwenden.", slide)
            if changes and index == len(slides) - 1:
                issue("CUE_SLIDE_ON_LAST", "warning", path + ".notes",
                      "Die letzte Folie hat keine nächste Folie; ihre [FOLIE]-Marke entfernen oder die Reihenfolge prüfen.", slide)
            if changes and any(js_trim(line) for line in lines[changes[0] + 1:]):
                issue("CUE_CONTENT_AFTER_SLIDE", "warning", path + ".notes",
                      "Nach [FOLIE] stehen noch Text oder weitere Marken. Der Wechsel würde diesen Rest zurücklassen; erst den Sprechtext und alle Einblendungen abschließen.", slide)
            if not changes and index < len(slides) - 1:
                issue("CUE_SLIDE_MISSING", "info", path + ".notes",
                      "Diese Folie enthält Klickmarken, aber keine abschließende [FOLIE]-Marke. Für einen vollständig markierten Vortrag den tatsächlichen Folienwechsel ergänzen.", slide)
            if near_markers:
                issue("CUE_MIXED_NOTATION", "info", path + ".notes",
                      "Neben erkannten Marken stehen ähnlich geschriebene Klammerzeilen. Nur [KLICK] und [FOLIE] allein auf einer Zeile erzeugen ein Signal; Varianten bleiben normaler Sprechtext.", slide)
            issue("CUE_PLAN_REVIEW", "info", path + ".notes",
                  f"Markierter Ablauf: {len(clicks)} Einblendung(en), {len(changes)} Folienwechsel. Mit den tatsächlich gerenderten Schritten abgleichen, auch vor der ersten zunächst verborgenen Gruppe. Der Helfer rendert keine Folien.", slide)
        if slide["seconds"] == 0:
            issue("SLIDE_TIME_UNSET", "info", path + ".seconds", "Für diese Folie ist kein Zeitbudget eingetragen.", slide)
        if slide["image"] and layout != "image":
            issue("IMAGE_NOT_VISIBLE", "warning", path + ".image", "Das gespeicherte Bild ist außerhalb des Bildlayouts nicht sichtbar.", slide)
        if layout == "code" and slide["items"]:
            issue("CODE_ITEMS_NOT_VISIBLE", "warning", path + ".items", "Zusätzliche Inhaltspunkte werden im Codelayout nicht dargestellt.", slide)
        if layout == "closing" and len(slide["items"]) > 3:
            issue("CLOSING_ITEMS_NOT_VISIBLE", "warning", path + ".items", "Das Abschlusslayout zeigt höchstens drei Inhaltspunkte.", slide)
        if utf16_length(slide["title"]) > 90:
            issue("TITLE_LENGTH_RISK", "warning", path + ".title", "Heuristik: Ein langer Titel kann mehrere Zeilen belegen und den Inhaltsbereich verkleinern.", slide)
        if len(slide["items"]) > 6 and layout not in ("code", "closing"):
            issue("ITEM_COUNT_RISK", "warning", path + ".items", "Heuristik: Mehr als sechs Punkte können dieses Layout überladen. Im Studio prüfen und gegebenenfalls aufteilen.", slide)
        if any(utf16_length(item) > 180 for item in slide["items"]):
            issue("ITEM_LENGTH_RISK", "warning", path + ".items", "Heuristik: Ein langer Inhaltspunkt kann den verfügbaren Platz überschreiten.", slide)
        if utf16_length(slide["subtitle"]) > 160:
            issue("SUBTITLE_LENGTH_RISK", "warning", path + ".subtitle", "Heuristik: Ein langer Untertitel kann wenig Platz für die eigentlichen Inhalte lassen.", slide)
        if utf16_length(slide["source"]) > 250:
            issue("SOURCE_LENGTH_RISK", "warning", path + ".source", "Heuristik: Eine lange Quellenangabe kann den Folienfuß überlaufen.", slide)
        if layout == "code":
            lines = slide["body"].replace("\r\n", "\n").replace("\r", "\n").expandtabs(4).split("\n")
            if len(lines) > 12 or any(len(line) > 80 for line in lines):
                issue("CODE_SIZE_RISK", "warning", path + ".body", "Heuristik: Viele oder lange Codezeilen können überlaufen. Code wird nicht automatisch umgebrochen.", slide)
        elif utf16_length(slide["body"]) > 1000:
            issue("BODY_LENGTH_RISK", "warning", path + ".body", "Heuristik: Langer Fließtext gehört meist auf mehrere Folien oder in die Notizen.", slide)

        source_present = bool(js_trim(slide["source"]))
        if not source_present:
            if layout in ("stats", "chart") and slide["items"]:
                issue("DATA_PROVENANCE_MISSING", "warning", path + ".source", "Für die gezeigten Werte ist keine sichtbare Herkunft angegeben. Eigene Messung oder geprüfte Quelle nachtragen, ohne Belege zu erfinden.", slide)
            elif layout == "quote" and slide["body"]:
                issue("QUOTE_SOURCE_MISSING", "warning", path + ".source", "Für den Zitattext fehlt eine sichtbare Zuordnung. Originalfundstelle oder eigene Formulierung kennzeichnen.", slide)
            elif layout == "image" and slide["image"]:
                issue("IMAGE_PROVENANCE_MISSING", "warning", path + ".source", "Bildherkunft und Nutzungsrecht prüfen; das Feld allein bestätigt keine Freigabe.", slide)
            elif layout in ("bullets", "columns", "process", "code") and (slide["body"] or slide["items"]):
                issue("SOURCE_REVIEW_NEEDED", "info", path + ".source", "Prüfen, ob übernommene Aussagen oder eigene Ergebnisse eine Quellen- oder Herkunftsangabe benötigen.", slide)
        elif re.fullmatch(r"https?://\S+", js_trim(slide["source"])):
            issue("SOURCE_URL_ONLY", "info", path + ".source", "Eine URL allein belegt weder die Lektüre noch die Unterstützung einer konkreten Aussage. Fundstelle und Zusammenhang prüfen.", slide)
        if slide["image"] and not js_trim(slide["imageAlt"]):
            issue("IMAGE_ALT_MISSING", "warning", path + ".imageAlt", "Für das Bild fehlt eine inhaltliche Beschreibung.", slide)
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description="Kollo-Datei lokal und ohne Upload beraten; keine Fakten- oder Renderprüfung.")
    parser.add_argument("file", type=Path)
    parser.add_argument("--json", action="store_true", help="maschinenlesbarer Bericht statt Kurzfassung")
    args = parser.parse_args(argv)
    try:
        report = review_deck(load_deck(args.file))
    except (OSError, ValueError, UnicodeError, RecursionError, OverflowError) as exc:
        report = {"version": 1, "schema": {"valid": False, "errors": [str(exc)]},
                  "summary": None, "issues": [], "contrast": [], "limitations": list(LIMITATIONS)}
    if args.json:
        print(json.dumps(report, ensure_ascii=True, indent=2, allow_nan=False))
    elif not report["schema"]["valid"]:
        for error in report["schema"]["errors"]:
            print("Fehler: " + error, file=sys.stderr)
    else:
        summary = report["summary"]
        print(f"Schema gültig: {summary['slideCount']} Folien, {summary['plannedSeconds']} geplante Sekunden, Ziel {summary['targetSeconds']} Sekunden.")
        for item in report["issues"]:
            print(f"{item['severity']} {item['code']} ({item['path']}): {item['message']}")
        print("Advisory-Prüfung: Aussagen, Quellen, Bilder und gerenderte Folien weiterhin selbst prüfen.")
    return 0 if report["schema"]["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
