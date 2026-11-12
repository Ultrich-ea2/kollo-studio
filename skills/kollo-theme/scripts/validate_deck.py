#!/usr/bin/env python3
"""Validate Kollo v1 data locally; standard library only, no writes or network."""
import argparse
import base64
import binascii
import json
import math
from pathlib import Path
import re
import struct
import sys

MAX_FILE = 10 * 1024 * 1024
MAX_IMAGE = 2 * 1024 * 1024
LAYOUTS = {"title", "section", "bullets", "columns", "process", "stats", "quote", "code", "image", "chart", "references", "closing"}
DECK_KEYS = {"version", "title", "author", "institution", "date", "duration", "theme", "slides"}
THEME_KEYS = {"background", "foreground", "muted", "primary", "secondary", "font", "scale", "showProgress"}
SLIDE_KEYS = {"id", "layout", "section", "title", "subtitle", "items", "body", "image", "imageAlt", "notes", "source", "transition", "reveal", "seconds"}
FORBIDDEN = {"__proto__", "prototype", "constructor"}
DECK_TEXT = {"title": 200, "author": 160, "institution": 200, "date": 80}
SLIDE_TEXT = {"section": 100, "title": 200, "subtitle": 600, "body": 8000, "imageAlt": 300, "notes": 20000, "source": 2000}
# ECMAScript String.trim whitespace, deliberately not Python's larger strip set.
# In particular U+0085 is not removed while U+FEFF is removed by the application.
JS_WHITESPACE = "\u0009\u000a\u000b\u000c\u000d\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff"


def js_trim(value):
    return value.strip(JS_WHITESPACE)


def utf16_length(value):
    return len(value.encode("utf-16-le", errors="surrogatepass")) // 2


def image_dimensions(data, kind):
    """Read raster header dimensions without decoding or executing image content."""
    if kind == "png":
        if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
            raise ValueError("PNG-Signatur oder IHDR fehlt")
        return struct.unpack(">II", data[16:24])
    if kind == "jpeg":
        if data[:2] != b"\xff\xd8":
            raise ValueError("JPEG-Signatur fehlt")
        offset = 2
        while offset < len(data):
            if data[offset] != 255:
                raise ValueError("JPEG-Marker ungültig")
            while offset < len(data) and data[offset] == 255:
                offset += 1
            if offset >= len(data):
                break
            marker = data[offset]
            offset += 1
            if marker == 0x01 or 0xD0 <= marker <= 0xD7:
                continue
            if marker in {0xD9, 0xDA} or offset + 2 > len(data):
                break
            length = int.from_bytes(data[offset:offset + 2], "big")
            if length < 2 or offset + length > len(data):
                raise ValueError("JPEG-Segmentlänge ungültig")
            if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                if length < 8:
                    break
                height = int.from_bytes(data[offset + 3:offset + 5], "big")
                width = int.from_bytes(data[offset + 5:offset + 7], "big")
                return width, height
            offset += length
        raise ValueError("JPEG-Abmessungen nicht lesbar")
    if kind == "webp":
        if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
            raise ValueError("WebP-Signatur fehlt")
        chunk = data[12:16]
        if chunk == b"VP8X" and len(data) >= 30:
            return 1 + int.from_bytes(data[24:27], "little"), 1 + int.from_bytes(data[27:30], "little")
        if chunk == b"VP8L" and data[20] == 0x2F:
            bits = int.from_bytes(data[21:25], "little")
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        if chunk == b"VP8 " and len(data) >= 30 and data[23:26] == b"\x9d\x01\x2a":
            return int.from_bytes(data[26:28], "little") & 0x3FFF, int.from_bytes(data[28:30], "little") & 0x3FFF
        raise ValueError("WebP-Abmessungen nicht lesbar")
    raise ValueError("Unbekanntes Bildformat")


def validate_deck(deck):
    errors = []

    def fail(path, message):
        if len(errors) < 40:
            errors.append(f"{path}: {message}")

    def object_keys(value, expected, path, optional=frozenset()):
        if not isinstance(value, dict):
            fail(path, "Objekt erwartet")
            return False
        if not expected <= set(value) or not set(value) <= expected | optional:
            missing = sorted(expected - set(value))
            extra = sorted(set(value) - expected - optional)
            if missing:
                fail(path, "Pflichtfelder fehlen: " + ", ".join(missing))
            if extra:
                fail(path, "Unbekannte Felder: " + ", ".join(extra))
        return True

    def text(value, maximum, path):
        if not isinstance(value, str):
            fail(path, "Text erwartet")
            return False
        if utf16_length(value) > maximum:
            fail(path, f"höchstens {maximum} UTF-16-Codeeinheiten erlaubt")
        if re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", value):
            fail(path, "nicht druckbare Steuerzeichen sind nicht erlaubt")
            return False
        if re.search(r"[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]", value):
            fail(path, "ungültige Unicode-Zeichenfolge")
            return False
        return True

    def integer(value, minimum, maximum, path):
        if type(value) not in (int, float) or not math.isfinite(value) or value != int(value) or not minimum <= value <= maximum:
            fail(path, f"ganze Zahl von {minimum} bis {maximum} erwartet")

    def finite(value, minimum, maximum, path):
        if type(value) not in (int, float) or not math.isfinite(value) or not minimum <= value <= maximum:
            fail(path, f"endliche Zahl von {minimum} bis {maximum} erwartet")

    def boolean(value, path):
        if type(value) is not bool:
            fail(path, "true oder false erwartet")

    def scan_keys(value, path="$", depth=0):
        if depth > 16:
            fail(path, "unerwartet tief verschachtelte Daten")
            return
        if isinstance(value, dict):
            for key, item in value.items():
                if key in FORBIDDEN:
                    fail(path, "Unzulässiger Objektschlüssel")
                scan_keys(item, path + "." + key, depth + 1)
        elif isinstance(value, list):
            for index, item in enumerate(value):
                scan_keys(item, f"{path}[{index}]", depth + 1)

    scan_keys(deck)
    if not object_keys(deck, DECK_KEYS, "$"):
        return errors
    if type(deck.get("version")) not in (int, float) or deck.get("version") != 1:
        fail("version", "Version 1 erwartet")
    for field, maximum in DECK_TEXT.items():
        text(deck.get(field), maximum, field)
    integer(deck.get("duration"), 1, 240, "duration")
    theme = deck.get("theme")
    if object_keys(theme, THEME_KEYS, "theme", {"composition"}):
        for field in ("background", "foreground", "muted", "primary", "secondary"):
            if not isinstance(theme.get(field), str) or not re.fullmatch(r"#[0-9A-Fa-f]{6}", theme[field]):
                fail("theme." + field, "Farbe #RRGGBB erwartet")
        if theme.get("font") not in ("Arial", "Georgia"):
            fail("theme.font", "Arial oder Georgia erwartet")
        finite(theme.get("scale"), 0.8, 1.25, "theme.scale")
        boolean(theme.get("showProgress"), "theme.showProgress")
        if "composition" in theme and theme["composition"] not in ("classic", "editorial", "technical", "stage"):
            fail("theme.composition", "classic, editorial, technical oder stage erwartet")
    slides = deck.get("slides")
    if not isinstance(slides, list):
        fail("slides", "Liste erwartet")
        return errors
    if not 1 <= len(slides) <= 80:
        fail("slides", "1 bis 80 Folien erwartet")
    seen = set()
    for index, slide in enumerate(slides[:81]):
        path = f"slides[{index}]"
        if not object_keys(slide, SLIDE_KEYS, path):
            continue
        slide_id = slide.get("id")
        if not isinstance(slide_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", slide_id):
            fail(path + ".id", "1–80 Buchstaben, Ziffern, _ oder - erwartet")
        elif slide_id in seen:
            fail(path + ".id", "ID ist nicht eindeutig")
        else:
            seen.add(slide_id)
        layout = slide.get("layout")
        if not isinstance(layout, str) or layout not in LAYOUTS:
            fail(path + ".layout", "unbekanntes Layout")
        for field, maximum in SLIDE_TEXT.items():
            text(slide.get(field), maximum, path + "." + field)
        items = slide.get("items")
        if not isinstance(items, list):
            fail(path + ".items", "Liste erwartet")
        else:
            if len(items) > 12:
                fail(path + ".items", "höchstens 12 Einträge erlaubt")
            if layout == "columns" and len(items) > 2:
                fail(path + ".items", "columns erlaubt höchstens zwei Spalten")
            for item_index, item in enumerate(items[:13]):
                item_path = f"{path}.items[{item_index}]"
                if not text(item, 1200, item_path):
                    continue
                if layout in ("stats", "chart"):
                    parts = item.split("|")
                    if len(parts) != 2 or not all(js_trim(part) for part in parts):
                        fail(item_path, "Wert | Bezeichnung mit zwei nicht leeren Teilen erwartet")
                    elif layout == "chart":
                        try:
                            if not re.fullmatch(r"[0-9]+(?:[.,][0-9]+)?", js_trim(parts[0])):
                                raise ValueError
                            value = float(js_trim(parts[0]).replace(",", "."))
                            if not math.isfinite(value) or value < 0:
                                raise ValueError
                        except ValueError:
                            fail(item_path, "Diagrammwert muss eine endliche, nicht negative Zahl sein")
        if slide.get("transition") not in ("none", "fade", "slide", "zoom"):
            fail(path + ".transition", "none, fade, slide oder zoom erwartet")
        boolean(slide.get("reveal"), path + ".reveal")
        integer(slide.get("seconds"), 0, 3600, path + ".seconds")
        image = slide.get("image")
        if not isinstance(image, str):
            fail(path + ".image", "Text erwartet")
        elif image:
            match = re.fullmatch(r"data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})", image)
            if not match:
                fail(path + ".image", "eingebettetes PNG/JPEG/WebP als Base64 erwartet")
            else:
                try:
                    if len(match.group(2)) % 4:
                        raise ValueError("Base64-Länge muss ein Vielfaches von vier sein")
                    if len(image) > ((MAX_IMAGE + 2) // 3) * 4 + 64:
                        raise ValueError("Bild ist größer als 2 MiB")
                    data = base64.b64decode(match.group(2), validate=True)
                    if len(data) > MAX_IMAGE:
                        raise ValueError("Bild ist größer als 2 MiB")
                    width, height = image_dimensions(data, match.group(1))
                    if not 1 <= width <= 4096 or not 1 <= height <= 4096 or width * height > 4096 * 4096:
                        raise ValueError("Bildabmessungen überschreiten 4096 × 4096 Pixel")
                except (ValueError, binascii.Error, struct.error) as exc:
                    fail(path + ".image", str(exc))
    return errors


def load_deck(path):
    if path.stat().st_size > MAX_FILE:
        raise ValueError("Datei ist größer als 10 MiB")
    data = path.read_bytes()
    if len(data) > MAX_FILE:
        raise ValueError("Datei ist größer als 10 MiB")

    def pairs_hook(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("Doppelter JSON-Objektschlüssel")
            result[key] = value
        return result

    def reject_constant(_):
        raise ValueError("NaN und Infinity sind kein gültiges JSON")

    return json.loads(data.decode("utf-8-sig"), object_pairs_hook=pairs_hook, parse_constant=reject_constant)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Kollo-v1-Datei lokal prüfen; keine Änderung, kein Upload.")
    parser.add_argument("file", type=Path, help="Pfad zur .kollo.json-Datei")
    args = parser.parse_args(argv)
    try:
        errors = validate_deck(load_deck(args.file))
    except (OSError, ValueError, UnicodeError, RecursionError, OverflowError) as exc:
        print(f"Ungültig: {exc}", file=sys.stderr)
        return 1
    if errors:
        for error in errors:
            print("Fehler: " + error, file=sys.stderr)
        return 1
    print("Grundprüfung bestanden. Jetzt in Kollo Studio importieren und alle Folien fachlich und visuell prüfen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
