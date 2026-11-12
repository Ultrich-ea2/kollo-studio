"""Synthetic standard-library tests, discoverable with test_skill_*.py."""
import base64
import contextlib
import copy
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "skills" / "kollo-theme" / "scripts"
sys.dont_write_bytecode = True
sys.path.insert(0, str(SCRIPTS))
import validate_deck as validator
import review_deck as reviewer


def deck():
    return json.loads((ROOT / "skills/kollo-theme/assets/beispiel.kollo.json").read_text(encoding="utf-8"))


class ValidatorTests(unittest.TestCase):
    def test_example_and_unicode_utf16_boundaries(self):
        value = deck()
        self.assertEqual(validator.validate_deck(value), [])
        value["title"] = "\U0001F600" * 100
        self.assertEqual(validator.validate_deck(value), [])
        value["title"] += "x"
        self.assertTrue(validator.validate_deck(value))
        value = deck(); value["slides"][0]["notes"] = "\ud800"
        self.assertTrue(validator.validate_deck(value))

    def test_keys_and_all_line_terminators_are_strict(self):
        for ending in ("\n", "\r", "\r\n", "\u2028", "\u2029"):
            for field in ("id", "color", "image"):
                with self.subTest(ending=repr(ending), field=field):
                    value = deck()
                    if field == "id": value["slides"][0]["id"] += ending
                    elif field == "color": value["theme"]["primary"] += ending
                    else: value["slides"][0]["image"] = "data:image/png;base64,YWJjZA==" + ending
                    self.assertTrue(validator.validate_deck(value))
        for key in ("__proto__", "prototype", "constructor", "custom"):
            value = deck(); value["slides"][0][key] = "blocked"
            self.assertTrue(validator.validate_deck(value))

    def test_bom_duplicate_keys_and_file_limit(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "deck.json"
            path.write_text("\ufeff" + json.dumps(deck()), encoding="utf-8")
            self.assertEqual(validator.validate_deck(validator.load_deck(path)), [])
            path.write_text('{"version":1,"version":1}', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "Doppelter"):
                validator.load_deck(path)
            path.write_bytes(b" " * (validator.MAX_FILE + 1))
            with self.assertRaisesRegex(ValueError, "10 MiB"):
                validator.load_deck(path)

    def test_numeric_types_pairs_and_limits(self):
        for value in (True, "1", 0, 241, 1.5, float("inf")):
            candidate = deck(); candidate["duration"] = value
            self.assertTrue(validator.validate_deck(candidate))
        for value in (1, 240):
            candidate = deck(); candidate["duration"] = value
            self.assertEqual(validator.validate_deck(candidate), [])
        for value in ("1e3 | x", "-1 | x", "Infinity | x", "1 | x | y", "1 | "):
            candidate = deck(); candidate["slides"][0].update(layout="chart", items=[value])
            self.assertTrue(validator.validate_deck(candidate))

    def test_ecmascript_whitespace_and_base64_padding(self):
        for value, valid in (("\ufeff12,5 | x", True), ("12 | \ufeff", False), ("\u008512 | x", False), ("12 | \u0085", True)):
            candidate = deck(); candidate["slides"][0].update(layout="chart", items=[value])
            self.assertEqual(not validator.validate_deck(candidate), valid, repr(value))
        # Header-only PNG fixture suffices to test the shared header parser.
        data = b"\x89PNG\r\n\x1a\n" + b"\0\0\0\rIHDR" + b"\0\0\0\x01\0\0\0\x01"
        encoded = base64.b64encode(data).decode("ascii")
        self.assertEqual(len(encoded) % 4, 0)
        candidate = deck(); candidate["slides"][0]["image"] = "data:image/png;base64," + encoded
        self.assertEqual(validator.validate_deck(candidate), [])
        candidate["slides"][0]["image"] += "="
        self.assertTrue(validator.validate_deck(candidate))

    def test_repeated_jpeg_soi_is_not_a_standalone_marker(self):
        normal = bytes([255, 216, 255, 192, 0, 8, 8, 0, 20, 0, 30, 1, 255, 217])
        for data, valid in ((normal, True), (normal[:2] + normal, False)):
            candidate = deck(); candidate["slides"][0]["image"] = "data:image/jpeg;base64," + base64.b64encode(data).decode("ascii")
            self.assertEqual(not validator.validate_deck(candidate), valid)


class ReviewTests(unittest.TestCase):
    def test_schema_failure_stops_semantic_checks(self):
        candidate = deck(); candidate["slides"][0]["title"] = None
        report = reviewer.review_deck(candidate)
        self.assertFalse(report["schema"]["valid"])
        self.assertIsNone(report["summary"])
        self.assertEqual(report["issues"], [])
        self.assertEqual(report["contrast"], [])

    def test_exact_contrast_and_opaque_color_cases(self):
        self.assertAlmostEqual(reviewer.contrast_ratio("#000000", "#ffffff"), 21)
        self.assertAlmostEqual(reviewer.contrast_ratio("#ffffff", "#000000"), 21)
        self.assertEqual(reviewer.contrast_ratio("#123456", "#123456"), 1)
        candidate = deck(); candidate["theme"].update(background="#ffffff", foreground="#ffffff", muted="#777777")
        report = reviewer.review_deck(candidate)
        self.assertTrue(report["schema"]["valid"])
        self.assertTrue(any(i["code"] == "CONTRAST_LARGE_LOW" for i in report["issues"]))
        muted = next(c for c in report["contrast"] if c["pair"] == "muted/background")
        self.assertFalse(muted["normalPass"])
        self.assertTrue(muted["largePass"])

    def test_timing_totals_unset_and_exact_twenty_percent_boundary(self):
        candidate = deck(); candidate["duration"] = 10
        for slide in candidate["slides"]: slide["seconds"] = 0
        report = reviewer.review_deck(candidate)
        self.assertEqual(report["summary"]["plannedSeconds"], 0)
        self.assertTrue(any(i["code"] == "TIMING_UNPLANNED" for i in report["issues"]))
        candidate["slides"][0]["seconds"] = 480
        report = reviewer.review_deck(candidate)
        self.assertFalse(any(i["code"] == "TIMING_TARGET_MISMATCH" for i in report["issues"]))
        candidate["slides"][0]["seconds"] = 479
        report = reviewer.review_deck(candidate)
        self.assertEqual(report["summary"]["differenceSeconds"], -121)
        self.assertTrue(any(i["code"] == "TIMING_TARGET_MISMATCH" for i in report["issues"]))

    def test_invisible_fields_are_specific_and_content_is_unchanged(self):
        candidate = deck()
        first = candidate["slides"][0]
        first.update(layout="code", body="return 1", items=["not visible"])
        second = candidate["slides"][1]
        second.update(layout="closing", items=["a", "b", "c", "d"])
        before = copy.deepcopy(candidate)
        report = reviewer.review_deck(candidate)
        codes = {i["code"] for i in report["issues"]}
        self.assertIn("CODE_ITEMS_NOT_VISIBLE", codes)
        self.assertIn("CLOSING_ITEMS_NOT_VISIBLE", codes)
        self.assertEqual(candidate, before)

    def test_provenance_gaps_are_advisory_not_fact_claims(self):
        candidate = deck(); first = candidate["slides"][0]
        first.update(layout="chart", items=["12 | illustrative"], source="", notes="LOCAL-NOTE-SECRET")
        report = reviewer.review_deck(candidate)
        self.assertTrue(report["schema"]["valid"])
        self.assertIn("DATA_PROVENANCE_MISSING", {i["code"] for i in report["issues"]})
        first["source"] = "https://example.invalid/unread"
        report = reviewer.review_deck(candidate)
        self.assertIn("SOURCE_URL_ONLY", {i["code"] for i in report["issues"]})
        self.assertNotIn("LOCAL-NOTE-SECRET", json.dumps(report))
        self.assertTrue(any("nicht verifiziert" in s for s in report["limitations"]))

    def test_machine_cli_always_outputs_json_and_uses_schema_exit_status(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "sample.json"
            path.write_text(json.dumps(deck()), encoding="utf-8")
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                code = reviewer.main([str(path), "--json"])
            self.assertEqual(code, 0)
            self.assertTrue(json.loads(output.getvalue())["schema"]["valid"])
            path.write_text("{", encoding="utf-8")
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                code = reviewer.main([str(path), "--json"])
            self.assertEqual(code, 1)
            self.assertFalse(json.loads(output.getvalue())["schema"]["valid"])


if __name__ == "__main__":
    unittest.main()
