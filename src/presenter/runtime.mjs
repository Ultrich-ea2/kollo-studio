/**
 * Self-contained, dependency-free presenter. Its function source is embedded in
 * downloaded HTML. Keep every helper inside this function: no eval, imports,
 * remote resources, ambient messaging, or scripts injected into child windows.
 */
export function mountPresenter(root, options) {
  "use strict";
  const host = root.ownerDocument.defaultView;
  const slides = options.slides;
  const session =
    host.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const views = [];
  const state = {
    index: Math.max(0, Math.min(slides.length - 1, options.start || 0)),
    steps: slides.map(() => 0),
    black: false,
    elapsed: 0,
    started: 0,
    running: false,
    notes: false,
    font: 36,
    speed: 130,
    mirror: false,
    focus: false,
    reading: false,
    readerPosition: 0,
    readerStarted: 0,
  };
  let disposed = false;
  let popupOrdinal = 0;
  let status = "Bereit. Fenster auf die gewünschten Bildschirme ziehen.";
  const reducedMotion = host.matchMedia?.("(prefers-reduced-motion: reduce)");
  const node = (view, selector) => view.root.querySelector(selector);
  const listen = (view, target, type, fn, settings) => {
    target.addEventListener(type, fn, settings);
    view.cleanups.push(() => target.removeEventListener(type, fn, settings));
  };
  const button = (id, text, extra = "") =>
    `<button type="button" id="${id}" ${extra}>${text}</button>`;
  const controlBar = () =>
    `<footer class="presenter-controls" aria-label="Präsentationssteuerung">${button("previous", "← Zurück", 'aria-label="Vorherige Einblendung oder Folie"')}<span id="count" class="presenter-count"></span>${button("next", "Weiter →", 'aria-label="Nächste Einblendung oder Folie"')}${button("black-toggle", "Schwarzbild (B)", 'aria-pressed="false"')}${button("fullscreen", "Vollbild (F)")}</footer>`;
  const header = (role) =>
    `<header class="presenter-bar"><div class="presenter-tools">${role === "controller" && options.onClose ? button("close", "← Zur Werkstatt", 'aria-label="Präsentation beenden"') : ""}<span class="presenter-label">${role === "teleprompter" ? "Kollo / Sprechpult" : "Kollo / Präsentation"}</span><span class="presenter-count" data-count></span></div><div class="presenter-tools"><span id="clock" class="presenter-clock" aria-label="Verstrichene Vortragszeit">00:00</span>${button("timer-toggle", "Timer starten (T)", 'aria-pressed="false"')}${button("timer-reset", "Timer zurücksetzen (R)")}</div></header>`;
  function elapsed(now = Date.now()) {
    return state.elapsed + (state.running ? now - state.started : 0);
  }
  function readerPosition(now = Date.now()) {
    return (
      state.readerPosition +
      (state.reading ? ((now - state.readerStarted) / 60000) * state.speed : 0)
    );
  }
  function announce(message) {
    status = message;
    views.forEach((v) => {
      const el = node(v, ".presenter-status");
      if (el) el.textContent = message;
    });
  }
  function setReading(value) {
    state.readerPosition = readerPosition();
    state.readerStarted = Date.now();
    state.reading = value;
    tick();
  }
  function manualScroll() {
    if (state.reading) setReading(false);
    announce(
      "Leseführung pausiert. Mit »Leseführung starten« an der markierten Stelle fortsetzen.",
    );
  }
  function transitionTo(index, step = 0) {
    if (index !== state.index) {
      state.readerPosition = 0;
      state.readerStarted = Date.now();
    }
    state.index = Math.max(0, Math.min(slides.length - 1, index));
    state.steps[state.index] = Math.max(
      0,
      Math.min(views[0]?.groups[state.index].length || 0, step),
    );
    draw();
  }
  function groupCount() {
    return views[0]?.groups[state.index].length || 0;
  }
  function next() {
    if (slides[state.index].reveal && state.steps[state.index] < groupCount())
      state.steps[state.index]++;
    else if (state.index < slides.length - 1) {
      transitionTo(state.index + 1);
      return;
    }
    draw();
  }
  function previous() {
    if (slides[state.index].reveal && state.steps[state.index] > 0)
      state.steps[state.index]--;
    else if (state.index > 0) {
      transitionTo(state.index - 1);
      return;
    }
    draw();
  }
  function toggleTimer() {
    state.elapsed = elapsed();
    state.started = Date.now();
    state.running = !state.running;
    tick();
  }
  function resetTimer() {
    state.elapsed = 0;
    state.started = Date.now();
    tick();
  }
  function toggleBlack() {
    state.black = !state.black;
    draw();
  }
  function toggleNotes() {
    state.notes = !state.notes;
    draw();
  }
  async function fullscreen(view) {
    try {
      if (view.doc.fullscreenElement) await view.doc.exitFullscreen();
      else await view.root.requestFullscreen();
    } catch {
      announce(
        "Vollbild ist hier nicht verfügbar. Das Fenster kann manuell maximiert werden.",
      );
    }
  }
  function close() {
    if (host.document.fullscreenElement)
      void host.document.exitFullscreen().catch(() => {});
    dispose();
    options.onClose?.();
  }
  function keyboard(view, event) {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target.closest?.("input,textarea,select,[contenteditable]")
    )
      return;
    if (event.key === " " && event.target.closest?.("button,a")) return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      next();
    } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      previous();
    } else if (event.key === "Home") {
      event.preventDefault();
      transitionTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      transitionTo(slides.length - 1, Number.MAX_SAFE_INTEGER);
    } else if (event.key.toLowerCase() === "b") toggleBlack();
    else if (["t", "p"].includes(event.key.toLowerCase())) toggleTimer();
    else if (event.key.toLowerCase() === "r") resetTimer();
    else if (event.key.toLowerCase() === "f") void fullscreen(view);
    else if (event.key.toLowerCase() === "n" && view.role === "controller")
      toggleNotes();
    else if (
      event.key === "Escape" &&
      view.role === "controller" &&
      options.onClose &&
      !view.doc.fullscreenElement
    )
      close();
  }
  function addSlides(view) {
    const stage = node(view, ".stage");
    view.slideElements = [];
    view.groups = [];
    slides.forEach((slide, index) => {
      const section = view.doc.createElement("section");
      section.className = "slide";
      section.setAttribute("role", "group");
      section.setAttribute("aria-roledescription", "Folie");
      section.setAttribute("aria-label", `${index + 1}: ${slide.title}`);
      section.dataset.transition = slide.transition;
      section.dataset.reveal = String(slide.reveal);
      // svg comes exclusively from Kollo's escaped, validated scene renderer.
      section.innerHTML = slide.svg;
      stage.append(section);
      view.slideElements.push(section);
      view.groups.push(
        [
          ...new Set(
            [...section.querySelectorAll("[data-group]")].map((el) =>
              Number(el.dataset.group),
            ),
          ),
        ].sort((a, b) => a - b),
      );
    });
    const black = view.doc.createElement("div");
    black.className = "black-screen";
    black.hidden = true;
    black.setAttribute("aria-label", "Schwarzbild aktiv");
    stage.append(black);
  }
  function buildReader(view) {
    const script = node(view, ".prompt-script");
    script.replaceChildren();
    view.words = [];
    let total = 0;
    const notes =
      slides[state.index].notes ||
      "Für diese Folie sind keine Sprechernotizen enthalten.";
    notes.split(/(\s+)/u).forEach((part) => {
      if (!part) return;
      if (/^\s+$/u.test(part)) {
        script.append(view.doc.createTextNode(part));
        return;
      }
      const word = view.doc.createElement("span");
      word.className = "prompt-word";
      word.textContent = part;
      const from = total;
      total += 1 + (/[.!?;:]$/u.test(part) ? 0.45 : /,$/u.test(part) ? 0.2 : 0);
      view.words.push({ element: word, from, to: total });
      // Clicking a word is a deliberate reading-position change, never a slide command.
      word.addEventListener("click", () => {
        state.readerPosition = from;
        state.readerStarted = Date.now();
        state.reading = false;
        tick();
        announce("Leseposition gesetzt. Die Leseführung ist pausiert.");
      });
      script.append(word);
    });
    view.totalWords = total;
    view.highlight = -1;
    node(view, ".prompt-reader").scrollTop = 0;
  }
  function buildView(view) {
    view.root.className = `kollo-presenter ${view.role === "controller" ? "presenter " : ""}role-${view.role}`;
    const style = view.doc.createElement("style");
    style.textContent = options.css;
    view.root.replaceChildren(style);
    const content = view.doc.createElement("div");
    // display:contents keeps the one flex layout independent of the host app.
    content.style.display = "contents";
    view.root.append(content);
    if (view.role === "audience") {
      content.innerHTML = `<main class="stage" aria-label="Präsentation"></main>${button("fullscreen", "Vollbild (F)", 'class="audience-fullscreen"')}`;
      addSlides(view);
    } else if (view.role === "teleprompter") {
      content.innerHTML = `${header(view.role)}<div class="prompt-settings"><label>Schrift <input id="prompt-font" type="range" min="22" max="68" step="2" value="36" aria-label="Teleprompter-Schriftgröße"><output id="font-value">36 px</output></label><label>Tempo <input id="prompt-speed" type="range" min="60" max="240" step="10" value="130" aria-label="Lesetempo in Wörtern pro Minute"><output id="speed-value">130 W/min</output></label>${button("reader-toggle", "Leseführung starten", 'aria-pressed="false"')}${button("reader-reset", "Textanfang")}${button("mirror-toggle", "Spiegeln", 'aria-pressed="false"')}${button("focus-toggle", "Lesefokus", 'aria-pressed="false"')}</div><div class="prompt-workspace"><section class="prompt-column"><header class="prompt-heading"><span class="presenter-label" id="prompt-section"></span><h1 id="prompt-title"></h1></header><div class="prompt-reader" tabindex="0" aria-label="Sprechtext; manuelles Scrollen pausiert die Leseführung"><p class="prompt-script"></p></div><div class="prompt-footer">Leseführung nach Tempo, keine Spracherkennung. Folienwechsel erfolgt manuell.</div></section><aside class="prompt-preview"><p class="preview-label">Jetzt im Publikum</p><div id="current-preview"></div><p class="prompt-cue" id="cue-status"></p><p class="preview-label">Als Nächstes</p><div id="next-preview"></div><p class="preview-title" id="next-title"></p><label class="preview-label" for="jump">Direkt zu Folie</label><select id="jump" aria-label="Zu Folie springen"></select></aside></div>${controlBar()}<p class="presenter-status" role="status" aria-live="polite"></p>`;
      const select = node(view, "#jump");
      slides.forEach((slide, index) => {
        const option = view.doc.createElement("option");
        option.value = String(index);
        option.textContent = `${index + 1}. ${slide.title}`;
        select.append(option);
      });
      listen(view, select, "change", () => transitionTo(Number(select.value)));
      listen(view, node(view, "#prompt-font"), "input", (e) => {
        state.font = Number(e.target.value);
        draw();
      });
      listen(view, node(view, "#prompt-speed"), "input", (e) => {
        state.readerPosition = readerPosition();
        state.readerStarted = Date.now();
        state.speed = Number(e.target.value);
        draw();
      });
      const reader = node(view, ".prompt-reader");
      listen(view, reader, "wheel", manualScroll, { passive: true });
      listen(view, reader, "touchstart", manualScroll, { passive: true });
      listen(view, reader, "pointerdown", (e) => {
        if (e.target === reader) manualScroll();
      });
      listen(view, reader, "keydown", (e) => {
        if (["ArrowUp", "ArrowDown"].includes(e.key)) manualScroll();
      });
    } else {
      content.innerHTML = `${header(view.role)}<main class="stage" aria-label="Präsentation"></main>${controlBar()}<nav class="presenter-controls" aria-label="Fenster und Notizen">${button("audience-open", "Publikumsfenster öffnen")}${button("teleprompter-open", "Teleprompter öffnen")}${button("notes-toggle", "Notizen (N)", 'aria-controls="notes" aria-expanded="false"')}${button("print", "Drucken / PDF")}</nav><p class="help">← → / Leertaste: Einblendung oder Folie · T/P: Timer · R: Timer zurücksetzen · B: Schwarzbild · F: Vollbild. Fenster auf getrennte Bildschirme ziehen; nur das Publikumsfenster teilen.<br>${slides.some((slide) => slide.notes) ? "Diese Steuerung enthält Sprechernotizen. Enthaltene Notizen sind auch im Quelltext einer exportierten HTML-Datei lesbar." : "Für diesen Vortrag sind keine Sprechernotizen enthalten."}</p><aside id="notes" hidden aria-label="Private Vortragsnotizen"><strong>Private Notizen sind auf diesem Bildschirm sichtbar.</strong><pre id="note-content"></pre><span id="next-note"></span></aside><p class="presenter-status" role="status" aria-live="polite"></p><p id="announced" class="sr-only" role="status" aria-live="polite"></p>`;
      addSlides(view);
    }
    const actions = {
      previous,
      next,
      "timer-toggle": toggleTimer,
      "timer-reset": resetTimer,
      "black-toggle": toggleBlack,
      "notes-toggle": toggleNotes,
      "audience-open": () => openWindow("audience"),
      "teleprompter-open": () => openWindow("teleprompter"),
      fullscreen: () => void fullscreen(view),
      print: () => view.win.print(),
      close,
      "reader-toggle": () => {
        setReading(!state.reading);
        announce(
          state.reading
            ? "Leseführung läuft. Scrollen pausiert sie."
            : "Leseführung pausiert.",
        );
      },
      "reader-reset": () => {
        state.readerPosition = 0;
        state.readerStarted = Date.now();
        tick();
        const reader = node(view, ".prompt-reader");
        if (reader) reader.scrollTop = 0;
      },
      "mirror-toggle": () => {
        state.mirror = !state.mirror;
        draw();
      },
      "focus-toggle": () => {
        state.focus = !state.focus;
        draw();
      },
    };
    Object.entries(actions).forEach(([id, fn]) => {
      const el = node(view, `#${id}`);
      if (el) listen(view, el, "click", fn);
    });
    listen(view, view.doc, "keydown", (event) => keyboard(view, event));
  }
  function dropView(view) {
    view.cleanups.forEach((fn) => fn());
    const index = views.indexOf(view);
    if (index >= 0) views.splice(index, 1);
  }
  function openWindow(role) {
    const existing = views.find((v) => v.role === role && !v.win.closed);
    if (existing) {
      existing.win.focus();
      announce(
        `${role === "audience" ? "Publikumsfenster" : "Teleprompter"} ist bereits verbunden.`,
      );
      return;
    }
    const child = host.open(
      "",
      `kollo-${session}-${role}-${++popupOrdinal}`,
      `popup,width=${role === "audience" ? 1280 : 1180},height=820`,
    );
    if (!child) {
      announce(
        "Fenster blockiert. Bitte Pop-ups für Kollo erlauben und erneut öffnen.",
      );
      return;
    }
    try {
      const doc = child.document;
      doc.title = `${role === "audience" ? "Publikum" : "Teleprompter · privat"} — ${options.title}`;
      doc.documentElement.lang = "de";
      doc.body.style.margin = "0";
      const childRoot = doc.createElement("div");
      doc.body.replaceChildren(childRoot);
      const view = {
        win: child,
        doc,
        root: childRoot,
        role,
        cleanups: [],
        renderedIndex: -1,
        slideElements: [],
        groups: [],
      };
      views.push(view);
      buildView(view);
      // A browser/process can close the controller without beforeunload. The
      // child owns this timer, so it can retire an orphaned private window.
      const watchdog = child.setInterval(() => {
        if (host.closed) {
          try {
            child.close();
          } catch {
            /* Already closed. */
          }
        }
      }, 250);
      view.cleanups.push(() => child.clearInterval(watchdog));
      listen(view, child, "beforeunload", () => {
        dropView(view);
        if (!disposed)
          announce(
            `${role === "audience" ? "Publikumsfenster" : "Teleprompter"} getrennt. Erneutes Öffnen übernimmt den aktuellen Stand.`,
          );
      });
      draw();
      child.focus();
      announce(
        `${role === "audience" ? "Publikumsfenster" : "Teleprompter"} verbunden. Folie, Einblendungen und Uhr sind synchron.`,
      );
    } catch {
      try {
        child.close();
      } catch {
        /* Child may have navigated away. */
      }
      announce(
        "Das Fenster konnte nicht verbunden werden. Bitte erneut öffnen.",
      );
    }
  }
  function draw() {
    if (disposed) return;
    const slide = slides[state.index];
    const count = `${state.index + 1} / ${slides.length}`;
    views.forEach((view) => {
      view.root.querySelectorAll("#count,[data-count]").forEach((el) => {
        el.textContent = count;
      });
      view.slideElements.forEach((el, index) => {
        el.setAttribute("aria-current", String(index === state.index));
        el.setAttribute(
          "aria-hidden",
          String(index !== state.index || state.black),
        );
        el.querySelectorAll("[data-group]").forEach((group) => {
          const visible =
            !slides[index].reveal ||
            view.groups[index].indexOf(Number(group.dataset.group)) <
              state.steps[index];
          group.classList.toggle("unrevealed", !visible);
        });
      });
      const black = node(view, ".black-screen");
      if (black) black.hidden = !state.black;
      const blackButton = node(view, "#black-toggle");
      if (blackButton) {
        blackButton.setAttribute("aria-pressed", String(state.black));
        blackButton.textContent = state.black
          ? "Schwarzbild beenden (B)"
          : "Schwarzbild (B)";
      }
      const prev = node(view, "#previous");
      if (prev)
        prev.disabled =
          state.index === 0 && (!slide.reveal || state.steps[0] === 0);
      const nextButton = node(view, "#next");
      if (nextButton)
        nextButton.disabled =
          state.index === slides.length - 1 &&
          (!slide.reveal || state.steps[state.index] >= groupCount());
      if (view.role === "controller") {
        const notes = node(view, "#notes");
        notes.hidden = !state.notes;
        notes.className = state.notes ? "presenter-notes" : "";
        node(view, "#notes-toggle").setAttribute(
          "aria-expanded",
          String(state.notes),
        );
        node(view, "#note-content").textContent =
          slide.notes || "Für diese Folie sind keine Notizen enthalten.";
        node(view, "#next-note").textContent =
          `Nächste Folie: ${slides[state.index + 1]?.title || "Ende"}`;
        node(view, "#announced").textContent = `Folie ${count}: ${slide.title}`;
      }
      if (view.role === "teleprompter") {
        view.root.classList.toggle("is-focus", state.focus);
        node(view, "#prompt-section").textContent =
          `Folie ${count} · ${slide.seconds > 0 ? `${slide.seconds} s geplant` : "ohne Zeitvorgabe"}`;
        node(view, "#prompt-title").textContent = slide.title;
        node(view, "#current-preview").innerHTML = state.black
          ? '<div style="aspect-ratio:16/9;background:#000" aria-label="Schwarzbild aktiv"></div>'
          : viewCloneSvg();
        node(view, "#cue-status").textContent =
          `${state.black ? "Schwarzbild aktiv · " : ""}${slide.reveal ? `Einblendung ${Math.min(state.steps[state.index], groupCount())} / ${groupCount()}` : "Folie vollständig sichtbar"}`;
        if (view.renderedIndex !== state.index) {
          node(view, "#next-preview").innerHTML =
            slides[state.index + 1]?.svg || "";
          node(view, "#next-title").textContent =
            slides[state.index + 1]?.title || "Ende der Präsentation";
          node(view, "#jump").value = String(state.index);
          buildReader(view);
          view.renderedIndex = state.index;
        }
        node(view, "#prompt-font").value = String(state.font);
        node(view, "#font-value").textContent = `${state.font} px`;
        node(view, "#prompt-speed").value = String(state.speed);
        node(view, "#speed-value").textContent = `${state.speed} W/min`;
        node(view, ".prompt-script").style.setProperty(
          "--prompt-font",
          `${state.font}px`,
        );
        node(view, ".prompt-script").classList.toggle(
          "is-mirrored",
          state.mirror,
        );
        node(view, "#mirror-toggle").setAttribute(
          "aria-pressed",
          String(state.mirror),
        );
        node(view, "#focus-toggle").setAttribute(
          "aria-pressed",
          String(state.focus),
        );
      }
      const statusElement = node(view, ".presenter-status");
      if (statusElement) statusElement.textContent = status;
    });
    tick();
  }
  function viewCloneSvg() {
    const current = views[0].slideElements[state.index];
    return current?.innerHTML || slides[state.index].svg;
  }
  function tick() {
    if (disposed) return;
    const now = Date.now();
    const seconds = Math.floor(elapsed(now) / 1000);
    const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    for (const view of [...views]) {
      if (view.role !== "controller" && view.win.closed) {
        dropView(view);
        announce(
          "Ein Fenster wurde geschlossen. Es lässt sich mit dem aktuellen Stand erneut öffnen.",
        );
        continue;
      }
      const clock = node(view, "#clock");
      if (clock) {
        clock.textContent = time;
        clock.classList.toggle("over", seconds >= options.duration * 60);
      }
      const timer = node(view, "#timer-toggle");
      if (timer) {
        timer.textContent = state.running
          ? "Timer pausieren (T)"
          : seconds
            ? "Timer fortsetzen (T)"
            : "Timer starten (T)";
        timer.setAttribute("aria-pressed", String(state.running));
      }
      if (view.role !== "teleprompter") continue;
      const readerButton = node(view, "#reader-toggle");
      readerButton.textContent = state.reading
        ? "Leseführung pausieren"
        : "Leseführung starten";
      readerButton.setAttribute("aria-pressed", String(state.reading));
      const position = readerPosition(now);
      let current = view.words.findIndex((word) => position < word.to);
      if (current < 0) {
        current = Math.max(0, view.words.length - 1);
        if (state.reading) {
          state.readerPosition = position;
          state.reading = false;
          readerButton.textContent = "Leseführung starten";
          readerButton.setAttribute("aria-pressed", "false");
        }
      }
      if (view.highlight !== current) {
        view.words.forEach((word, index) => {
          word.element.classList.toggle("is-current", index === current);
          word.element.classList.toggle("is-read", index < current);
        });
        view.highlight = current;
      }
      if (state.reading && view.words[current]) {
        const reader = node(view, ".prompt-reader");
        const wordRect = view.words[current].element.getBoundingClientRect();
        const readerRect = reader.getBoundingClientRect();
        const target = Math.max(
          0,
          reader.scrollTop +
            wordRect.top -
            readerRect.top -
            reader.clientHeight * 0.32,
        );
        const delta = target - reader.scrollTop;
        if (Math.abs(delta) > 1)
          reader.scrollTop += reducedMotion?.matches ? delta : delta * 0.32;
      }
    }
  }
  function pageHide() {
    // pagehide means navigation was committed. beforeunload may be cancelled;
    // clearing the player there would destroy a presentation the user kept open.
    // Keep the controller intact for a possible back/forward-cache restoration.
    state.elapsed = elapsed();
    state.running = false;
    setReading(false);
    for (const view of [...views]) {
      if (view.role === "controller") continue;
      dropView(view);
      try {
        view.win.close();
      } catch {
        /* Already closed. */
      }
    }
    announce("Präsentation pausiert. Fenster können erneut geöffnet werden.");
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    host.clearInterval(interval);
    host.removeEventListener("pagehide", pageHide);
    for (const view of [...views]) {
      dropView(view);
      if (view.role !== "controller") {
        try {
          view.win.close();
        } catch {
          /* No foreign window operations. */
        }
      }
    }
    root.replaceChildren();
  }
  const main = {
    win: host,
    doc: root.ownerDocument,
    root,
    role: "controller",
    cleanups: [],
    renderedIndex: -1,
    slideElements: [],
    groups: [],
  };
  views.push(main);
  buildView(main);
  draw();
  const interval = host.setInterval(tick, 100);
  host.addEventListener("pagehide", pageHide);
  return dispose;
}
