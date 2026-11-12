"""Meaningful advisory cases for private teleprompter cue plans."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / "skills/kollo-theme/scripts"))
import review_deck as reviewer


def deck():
    return json.loads((ROOT / "skills/kollo-theme/assets/beispiel.kollo.json").read_text(encoding="utf-8"))


def codes(report, slide_id):
    return {item["code"] for item in report["issues"]
            if item.get("slideId") == slide_id and item["code"].startswith("CUE_")}


class CueReviewTests(unittest.TestCase):
    def test_legacy_and_inline_brackets_remain_unmarked(self):
        value = deck()
        value["slides"][0]["notes"] = "Jetzt [KLICK] erklären.\n[KLICK: zweite Gruppe zeigen]\n[klick]\n[PAUSE: fragen]"
        report = reviewer.review_deck(value)
        self.assertTrue(report["schema"]["valid"])
        self.assertEqual(codes(report, value["slides"][0]["id"]), set())

    def test_valid_plan_recognizes_crlf_and_tabs_without_modification_or_text_leaks(self):
        value = deck()
        first = value["slides"][0]
        first.update(layout="columns", items=["A", "B"], reveal=True,
                     notes="LOCAL-PRIVATE-SPEECH\r\n \t[KLICK]\t \r\nFassung A.\r[KLICK]\nFassung B.\n[FOLIE]\n\t")
        before = copy.deepcopy(value)
        report = reviewer.review_deck(value)
        self.assertTrue(report["schema"]["valid"])
        self.assertEqual(codes(report, first["id"]), {"CUE_PLAN_REVIEW"})
        self.assertEqual(value, before)
        self.assertNotIn("LOCAL-PRIVATE-SPEECH", json.dumps(report))
        self.assertEqual(reviewer.cue_plan(first["notes"])[1], [(1, "KLICK"), (3, "KLICK"), (5, "FOLIE")])

    def test_manual_click_on_fully_visible_slide_is_advisory_not_schema_failure(self):
        value = deck()
        first = value["slides"][0]
        first.update(reveal=False, notes="[KLICK]\nJetzt erklären.\n[FOLIE]")
        report = reviewer.review_deck(value)
        self.assertTrue(report["schema"]["valid"])
        self.assertIn("CUE_CLICK_WITHOUT_REVEAL", codes(report, first["id"]))

    def test_switch_cannot_precede_remaining_speech_or_other_cues(self):
        for remainder in ("Nicht überspringen.", "[KLICK]", "[FOLIE]"):
            with self.subTest(remainder=remainder):
                value = deck()
                first = value["slides"][0]
                first["notes"] = "Einleitung.\n[FOLIE]\n" + remainder
                found = codes(reviewer.review_deck(value), first["id"])
                self.assertIn("CUE_CONTENT_AFTER_SLIDE", found)
                self.assertEqual("CUE_SLIDE_DUPLICATE" in found, remainder == "[FOLIE]")

    def test_last_slide_has_no_forward_slide_cue(self):
        value = deck()
        last = value["slides"][-1]
        last["notes"] = "Danke.\n[FOLIE]"
        self.assertIn("CUE_SLIDE_ON_LAST", codes(reviewer.review_deck(value), last["id"]))

    def test_partial_and_mixed_plan_needs_review_but_untagged_notes_do_not(self):
        value = deck()
        first = value["slides"][0]
        first.update(reveal=True, notes="[KLICK]\nErste Gruppe.\n[KLICK: zweite Gruppe]\n[Folie]")
        found = codes(reviewer.review_deck(value), first["id"])
        self.assertEqual(found, {"CUE_SLIDE_MISSING", "CUE_MIXED_NOTATION", "CUE_PLAN_REVIEW"})
        first["notes"] = "Eine frei vorgetragene Erklärung ohne Klickplan."
        self.assertEqual(codes(reviewer.review_deck(value), first["id"]), set())


if __name__ == "__main__":
    unittest.main()
