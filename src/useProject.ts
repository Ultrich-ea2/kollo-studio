import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultDeck,
  parseDeck,
  cloneDeck,
  validateDeck,
  type Deck,
} from "./model";
const KEY = "kollo.project.v1";
type Saved = { revision: string; deck: Deck };
function read(): { deck: Deck; revision: string; error: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { deck: cloneDeck(defaultDeck), revision: "", error: "" };
    const s = JSON.parse(raw) as Saved;
    return { deck: parseDeck(s.deck), revision: s.revision, error: "" };
  } catch {
    return {
      deck: cloneDeck(defaultDeck),
      revision: "",
      error:
        "Die lokale Sicherung konnte nicht gelesen werden. Sie bleibt erhalten. Exportiere dein Projekt vor dem nächsten Speichern.",
    };
  }
}
export function useProject() {
  const [initial] = useState(read);
  const [deck, setDeck] = useState(initial.deck);
  const [status, setStatus] = useState(initial.error || "Auf diesem Gerät");
  const [conflict, setConflict] = useState(Boolean(initial.error));
  const history = useRef<Deck[]>([]),
    future = useRef<Deck[]>([]),
    revision = useRef(initial.revision),
    latest = useRef(deck),
    dirty = useRef(false),
    lastEdit = useRef(0);
  const [historyVersion, tick] = useState(0);
  latest.current = deck;
  const change = useCallback(
    (value: Deck | ((current: Deck) => Deck), group = false) => {
      const next = typeof value === "function" ? value(latest.current) : value;
      if (!group || Date.now() - lastEdit.current > 800) {
        history.current.push(latest.current);
        if (history.current.length > 30) history.current.shift();
      }
      lastEdit.current = Date.now();
      future.current = [];
      latest.current = next;
      dirty.current = true;
      setDeck(next);
      tick((x) => x + 1);
      setStatus("Speichert lokal …");
    },
    [],
  );
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    future.current.push(latest.current);
    latest.current = prev;
    setDeck(prev);
    dirty.current = true;
    tick((x) => x + 1);
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(latest.current);
    latest.current = next;
    setDeck(next);
    dirty.current = true;
    tick((x) => x + 1);
  };
  const save = useCallback(() => {
    if (!dirty.current || conflict) return;
    const issues = validateDeck(latest.current);
    if (issues.length) {
      setStatus(
        "Entwurf noch nicht gespeichert: " +
          issues[0] +
          " Letzte gültige Sicherung bleibt erhalten.",
      );
      return;
    }
    try {
      const raw = localStorage.getItem(KEY);
      const stored = raw ? JSON.parse(raw).revision : "";
      if (stored !== revision.current) {
        setConflict(true);
        setStatus("Ein anderes Fenster hat dieses Projekt geändert.");
        return;
      }
      const rev = crypto.randomUUID();
      localStorage.setItem(
        KEY,
        JSON.stringify({ revision: rev, deck: latest.current }),
      );
      revision.current = rev;
      dirty.current = false;
      setStatus("Lokal gespeichert");
    } catch {
      setStatus(
        "Speicher voll oder nicht verfügbar. Bitte Projektdatei herunterladen.",
      );
    }
  }, [conflict]);
  useEffect(() => {
    const t = setTimeout(save, 400);
    return () => clearTimeout(t);
  }, [deck, save]);
  useEffect(() => {
    const storage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue !== e.oldValue) {
        setConflict(true);
        setStatus(
          "Änderung in einem anderen Fenster. Zuerst dein Projekt sichern.",
        );
      }
    };
    const unload = (e: BeforeUnloadEvent) => {
      save();
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("storage", storage);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("beforeunload", unload);
    };
  }, [save]);
  return {
    deck,
    change,
    undo,
    redo,
    canUndo: historyVersion >= 0 && history.current.length > 0,
    canRedo: future.current.length > 0,
    status,
    conflict,
  };
}
