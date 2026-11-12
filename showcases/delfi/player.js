(() => {
  "use strict";
  const content = JSON.parse(
    document.getElementById("content-data").textContent,
  );
  const scenes = content.scenes,
    duration = content.duration;
  const $ = (id) => document.getElementById(id);
  const video = $("presentation-video"),
    viewport = $("script-viewport");
  const sceneLinks = [],
    progressBars = [],
    timings = [],
    allSentences = [];
  const state = {
    scene: -1,
    word: -1,
    sentence: null,
    follow: true,
    font:
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--prompt-size",
        ),
      ) || 36,
    mirror: false,
    activeWord: null,
    targetScroll: null,
    immediate: true,
    countdown: null,
    child: null,
    childVideo: null,
    toastTimer: null,
    ready: false,
    lastFrame: 0,
    nextLabel: "",
  };
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  // New identity for every controller and every newly opened audience window.
  // Reloaded/navigated windows no longer belong to this controller.
  const session = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) =>
    n.toString(16),
  ).join("-");
  let opening = 0;
  let ownedAudience = null;
  const fmt = (t) => {
    const s = Math.max(0, Math.floor(Number(t) || 0));
    return (
      String(Math.floor(s / 60)).padStart(2, "0") +
      ":" +
      String(s % 60).padStart(2, "0")
    );
  };
  const cleanTitle = (s) => s.title.replace(/\s+/g, " ");
  function toast(message) {
    $("toast").textContent = message;
    $("toast").hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      $("toast").hidden = true;
    }, 3500);
  }
  function savePrefs() {
    try {
      localStorage.setItem(
        "pytutorai-sprechpult-v1",
        JSON.stringify({ font: state.font, mirror: state.mirror }),
      );
    } catch (_) {}
  }
  function fontSize(value, announce = true) {
    state.font = Math.max(22, Math.min(68, value));
    document.documentElement.style.setProperty(
      "--prompt-size",
      state.font + "px",
    );
    $("font-down").disabled = state.font <= 22;
    $("font-up").disabled = state.font >= 68;
    state.immediate = true;
    state.targetScroll = null;
    savePrefs();
    if (announce) toast("Schriftgröße: " + state.font + " px");
  }
  function setMirror(value) {
    state.mirror = value;
    document.body.classList.toggle("mirror", value);
    $("mirror-button").setAttribute("aria-pressed", String(value));
    savePrefs();
  }
  try {
    const p = JSON.parse(
      localStorage.getItem("pytutorai-sprechpult-v1") || "null",
    );
    if (p) {
      if (Number.isFinite(p.font)) fontSize(p.font, false);
      setMirror(!!p.mirror);
    }
  } catch (_) {}

  scenes.forEach((scene, i) => {
    const article = document.createElement("article");
    article.dataset.scene = String(i);
    article.setAttribute(
      "aria-label",
      "Szene " + (i + 1) + ": " + cleanTitle(scene),
    );
    const divider = document.createElement("div");
    divider.className = "script-divider";
    divider.textContent =
      String(i + 1).padStart(2, "0") + " · " + scene.chapter;
    article.append(divider);
    const words = [];
    // Sentence boundaries preserve the original wording, including Scala.js and other technical terms.
    const sentences = scene.speech.match(/[\s\S]*?[.!?](?=\s|$)|[\s\S]+$/g) || [
      scene.speech,
    ];
    // A sentence segmenter keeps abbreviations and technical names intact where supported.
    const pieces =
      typeof Intl.Segmenter === "function"
        ? Array.from(
            new Intl.Segmenter("de", { granularity: "sentence" }).segment(
              scene.speech,
            ),
            (x) => x.segment.trim(),
          ).filter(Boolean)
        : sentences.map((x) => x.trim());
    pieces.forEach((piece) => {
      const p = document.createElement("p");
      p.className = "sentence";
      piece.split(/\s+/).forEach((token, j) => {
        if (j) p.append(document.createTextNode(" "));
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = token;
        p.append(span);
        words.push({
          el: span,
          sentence: p,
          weight:
            1 +
            Math.min(token.length, 14) / 28 +
            (/[,;:]$/.test(token) ? 0.3 : /[.!?]$/.test(token) ? 0.9 : 0),
        });
      });
      allSentences.push(p);
      article.append(p);
    });
    $("paper").append(article);
    const totalWeight = words.reduce((sum, w) => sum + w.weight, 0);
    let cumulative = 0;
    const lead = 0.25,
      tail = 0.45,
      speakingSpan = scene.duration - lead - tail;
    words.forEach((word) => {
      word.at = scene.start + lead + (speakingSpan * cumulative) / totalWeight;
      cumulative += word.weight;
    });
    timings.push(words);
    const button = document.createElement("button");
    button.className = "scene-link";
    button.setAttribute(
      "aria-label",
      "Szene " + (i + 1) + ": " + cleanTitle(scene),
    );
    button.setAttribute("aria-current", "false");
    const number = document.createElement("span");
    number.className = "scene-index mono";
    number.textContent = String(i + 1).padStart(2, "0");
    const title = document.createElement("span");
    title.className = "scene-link-title";
    title.textContent = cleanTitle(scene);
    const time = document.createElement("span");
    time.className = "scene-time mono";
    time.textContent = fmt(scene.start);
    button.append(number, title, time);
    button.addEventListener("click", () => seek(scene.start));
    $("scene-list").append(button);
    sceneLinks.push(button);
    const segment = document.createElement("div");
    segment.className = "segment";
    segment.style.flexGrow = String(scene.duration);
    const fill = document.createElement("div");
    fill.className = "segment-progress";
    segment.append(fill);
    $("segments").append(segment);
    progressBars.push(fill);
  });

  function setFollow(value) {
    state.follow = value;
    $("follow-button").setAttribute("aria-pressed", String(value));
    $("follow-status").classList.toggle("is-manual", !value);
    $("follow-label").textContent = value
      ? "Leseführung an"
      : "Manuell gescrollt";
    $("return-follow").hidden = value;
    $("scene-remaining").hidden = !value;
    if (value) {
      state.immediate = true;
      state.targetScroll = null;
    }
  }
  function currentScene(t) {
    for (let i = scenes.length - 1; i >= 0; i--)
      if (t >= scenes[i].start) return i;
    return 0;
  }
  function selectScene(index) {
    state.scene = index;
    state.word = -1;
    state.targetScroll = null;
    const scene = scenes[index];
    $("scene-number").textContent =
      String(index + 1).padStart(2, "0") + " / " + String(scenes.length);
    $("scene-chapter").textContent = scene.chapter;
    $("scene-title").textContent = cleanTitle(scene);
    $("visual-cue").textContent = scene.visual;
    $("next-scene").textContent =
      index + 1 < scenes.length
        ? "Danach: " + cleanTitle(scenes[index + 1])
        : "Zum Abschluss: Danke fürs Zuhören.";
    $("previous-button").disabled = index === 0;
    $("next-button").disabled = index === scenes.length - 1;
    sceneLinks.forEach((link, i) => {
      link.setAttribute("aria-current", String(i === index));
      link.classList.toggle("is-past", i < index);
    });
    const nav = $("scene-list"),
      link = sceneLinks[index];
    if (nav.clientHeight) {
      const top = link.offsetTop - nav.offsetTop;
      if (
        top < nav.scrollTop ||
        top + link.offsetHeight > nav.scrollTop + nav.clientHeight
      )
        nav.scrollTop = Math.max(0, top - nav.clientHeight / 3);
    }
    allSentences.forEach((p) => {
      const i = Number(p.closest("article").dataset.scene);
      p.classList.toggle("is-read", i < index);
    });
  }
  function setActiveWord(index) {
    const words = timings[state.scene],
      word = words[index];
    if (!word) return;
    if (state.activeWord) state.activeWord.classList.remove("is-current");
    if (state.sentence !== word.sentence) {
      if (state.sentence) state.sentence.classList.remove("is-active");
      const localSentences = [
        ...word.sentence.parentElement.querySelectorAll(".sentence"),
      ];
      const sentenceIndex = localSentences.indexOf(word.sentence);
      localSentences.forEach((p, i) =>
        p.classList.toggle("is-read", i < sentenceIndex),
      );
      word.sentence.classList.add("is-active");
      state.sentence = word.sentence;
    }
    word.el.classList.add("is-current");
    state.activeWord = word.el;
    state.word = index;
    state.targetScroll = null;
  }
  function update(t = video.currentTime || 0) {
    t = Math.max(0, Math.min(duration, t));
    const scene = currentScene(t);
    if (scene !== state.scene) selectScene(scene);
    const words = timings[scene];
    let index = 0;
    for (let i = words.length - 1; i >= 0; i--)
      if (t >= words[i].at) {
        index = i;
        break;
      }
    if (index !== state.word) setActiveWord(index);
    $("current-time").textContent = fmt(t);
    $("timeline").value = String(t);
    $("timeline").setAttribute(
      "aria-valuetext",
      fmt(t) + " von " + fmt(duration),
    );
    const remaining = Math.max(
      0,
      Math.ceil((scenes[scene].end - t) / video.playbackRate),
    );
    $("scene-remaining").textContent = remaining + " s in dieser Szene";
    progressBars.forEach((bar, i) => {
      bar.style.width =
        100 *
          Math.max(0, Math.min(1, (t - scenes[i].start) / scenes[i].duration)) +
        "%";
    });
  }
  function scrollToWord(dt) {
    if (!state.follow || !state.activeWord || !viewport.clientHeight) return;
    if (state.targetScroll === null) {
      const w = state.activeWord.getBoundingClientRect(),
        r = viewport.getBoundingClientRect();
      state.targetScroll = Math.max(
        0,
        Math.min(
          viewport.scrollHeight - viewport.clientHeight,
          viewport.scrollTop +
            w.top -
            r.top -
            viewport.clientHeight * 0.32 +
            Math.min(w.height * 0.08, 6),
        ),
      );
    }
    const delta = state.targetScroll - viewport.scrollTop;
    if (
      state.immediate ||
      reducedMotion ||
      Math.abs(delta) > viewport.clientHeight * 1.4
    ) {
      viewport.scrollTop = state.targetScroll;
      state.immediate = false;
    } else if (Math.abs(delta) > 0.65)
      viewport.scrollTop += delta * (1 - Math.exp(-dt / 110));
  }
  function renderFrame(now) {
    const dt = Math.min(100, Math.max(1, now - (state.lastFrame || now - 16)));
    state.lastFrame = now;
    if (!video.paused && !video.seeking) update();
    scrollToWord(dt);
    requestAnimationFrame(renderFrame);
  }
  function playbackUI() {
    const playing = !video.paused && !video.ended;
    document.body.classList.toggle("is-playing", playing);
    $("play-label").textContent = playing
      ? "Pause"
      : video.ended
        ? "Noch einmal"
        : video.currentTime > 0
          ? "Weiter"
          : "Starten";
    $("play-button").setAttribute(
      "aria-label",
      playing
        ? "Pausieren"
        : video.ended
          ? "Noch einmal starten"
          : video.currentTime > 0
            ? "Fortsetzen"
            : "Starten",
    );
    $("play-icon").innerHTML = playing
      ? '<path d="M8 5v14M16 5v14" stroke-width="4"/>'
      : '<path d="m8 5 11 7-11 7V5Z" fill="currentColor"/>';
    $("play-status").textContent = playing
      ? "Video und Text laufen"
      : video.ended
        ? "Geschafft. Danke fürs Zuhören."
        : video.currentTime > 0
          ? "Pausiert"
          : "Bereit für deinen Vortrag";
  }
  function cancelCountdown() {
    clearInterval(state.countdown);
    state.countdown = null;
    $("countdown-overlay").hidden = true;
  }
  async function start() {
    if (!state.ready) {
      toast("Das Video wird noch geladen.");
      return;
    }
    cancelCountdown();
    if (video.ended || video.currentTime >= duration - 0.05) seek(0);
    try {
      await video.play();
    } catch (_) {
      toast("Bitte erneut auf Starten klicken, um das Video abzuspielen.");
    }
  }
  function togglePlayback() {
    if (state.countdown) {
      cancelCountdown();
      return;
    }
    if (video.paused) start();
    else video.pause();
  }
  function seek(t) {
    cancelCountdown();
    const target = Math.max(0, Math.min(duration, t));
    video.currentTime = target;
    state.immediate = true;
    state.targetScroll = null;
    setFollow(true);
    update(target);
    playbackUI();
    syncChild(true);
  }
  function stepScene(delta) {
    seek(
      scenes[Math.max(0, Math.min(scenes.length - 1, state.scene + delta))]
        .start,
    );
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else toast("Vollbild ist in diesem Browser nicht verfügbar.");
    } catch (_) {
      toast("Vollbild konnte nicht aktiviert werden.");
    }
  }
  function ownsAudience(audience) {
    try {
      return Boolean(
        audience &&
        ownedAudience === audience &&
        !audience.window.closed &&
        audience.window.document === audience.document &&
        audience.document.documentElement.dataset.delfiSession === session,
      );
    } catch (_) {
      return false;
    }
  }
  function releaseAudience(audience) {
    if (!audience) return;
    try {
      audience.window.clearInterval(audience.watchdog);
    } catch (_) {}
    if (ownedAudience !== audience) return;
    ownedAudience = null;
    state.child = null;
    state.childVideo = null;
    $("detach-button").setAttribute("aria-pressed", "false");
  }
  function closeAudience() {
    const audience = ownedAudience;
    if (ownsAudience(audience)) audience.window.close();
    releaseAudience(audience);
  }
  function syncChild(force = false) {
    const audience = ownedAudience;
    if (!ownsAudience(audience)) {
      releaseAudience(audience);
      return;
    }
    try {
      const cv = audience.video;
      if (cv.readyState < 1) return;
      cv.playbackRate = video.playbackRate;
      if (force || Math.abs(cv.currentTime - video.currentTime) > 0.2)
        cv.currentTime = video.currentTime;
      if (video.paused || video.ended) cv.pause();
      else if (cv.paused) cv.play().catch(() => {});
    } catch (_) {
      releaseAudience(audience);
    }
  }
  function detach() {
    if (ownsAudience(ownedAudience)) {
      ownedAudience.window.focus();
      return;
    }
    releaseAudience(ownedAudience);
    const child = window.open(
      "",
      "kollo-delfi-" + session + "-" + ++opening,
      "popup,width=1280,height=720",
    );
    if (!child) {
      toast(
        "Bitte erlaube das zweite Fenster und klicke erneut auf Abtrennen.",
      );
      return;
    }
    state.child = child;
    child.document.open();
    child.document.write(
      '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PyTutorAI · Präsentation</title><style>html,body{margin:0;height:100%;background:#080f1b;color:white;font-family:system-ui,sans-serif;overflow:hidden}video{display:block;width:100%;height:100%;object-fit:contain}#hint{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);padding:11px 18px;background:#102437e8;border:1px solid #395369;border-radius:10px;font-size:12px;white-space:nowrap;transition:opacity .4s;pointer-events:none}:fullscreen #hint{opacity:0}</style></head><body><video muted playsinline disablepictureinpicture aria-label="PyTutorAI-Präsentation"></video><div id="hint">Doppelklick für Vollbild · Steuerung im Sprechpult</div></body></html>',
    );
    child.document.close();
    const cv = child.document.querySelector("video");
    state.childVideo = cv;
    cv.muted = true;
    cv.poster = video.poster;
    cv.src = video.currentSrc || video.src;
    child.document.documentElement.dataset.delfiSession = session;
    const audience = {
      window: child,
      document: child.document,
      video: cv,
      watchdog: null,
    };
    ownedAudience = audience;
    cv.addEventListener("loadedmetadata", () => syncChild(true), {
      once: true,
    });
    const toggleChildFullscreen = async () => {
      if (!ownsAudience(audience)) return;
      try {
        if (child.document.fullscreenElement)
          await child.document.exitFullscreen();
        else await child.document.documentElement.requestFullscreen();
      } catch (_) {}
    };
    child.document.addEventListener("dblclick", toggleChildFullscreen);
    child.document.addEventListener("keydown", (e) => {
      if (
        !ownsAudience(audience) ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.repeat
      )
        return;
      if (e.code === "KeyF") {
        e.preventDefault();
        toggleChildFullscreen();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlayback();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepScene(1);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepScene(-1);
      } else if (e.code === "Home") {
        e.preventDefault();
        video.pause();
        seek(0);
      }
    });
    // Only committed navigation relinquishes ownership, never cancelled beforeunload.
    child.addEventListener("pagehide", () => releaseAudience(audience), {
      once: true,
    });
    audience.watchdog = child.setInterval(() => {
      if (window.closed) {
        try {
          if (child.document === audience.document) child.close();
        } catch (_) {}
        child.clearInterval(audience.watchdog);
      } else if (!ownsAudience(audience)) releaseAudience(audience);
    }, 400);
    child.setTimeout(() => {
      if (!ownsAudience(audience)) return;
      const hint = audience.document.getElementById("hint");
      if (hint) hint.style.opacity = "0";
    }, 6000);
    $("detach-button").setAttribute("aria-pressed", "true");
    syncChild(true);
    toast("Das Präsentationsfenster wird hier mitgesteuert.");
  }
  $("play-button").addEventListener("click", togglePlayback);
  $("restart-button").addEventListener("click", () => {
    video.pause();
    seek(0);
  });
  $("previous-button").addEventListener("click", () => stepScene(-1));
  $("next-button").addEventListener("click", () => stepScene(1));
  $("timeline").addEventListener("input", (e) => seek(Number(e.target.value)));
  $("speed").addEventListener("change", (e) => {
    video.playbackRate = Number(e.target.value);
    update();
    syncChild(true);
  });
  $("font-down").addEventListener("click", () => fontSize(state.font - 2));
  $("font-up").addEventListener("click", () => fontSize(state.font + 2));
  $("mirror-button").addEventListener("click", () => setMirror(!state.mirror));
  $("follow-button").addEventListener("click", () => setFollow(!state.follow));
  $("return-follow").addEventListener("click", () => setFollow(true));
  viewport.addEventListener("wheel", () => setFollow(false), { passive: true });
  viewport.addEventListener("touchstart", () => setFollow(false), {
    passive: true,
  });
  viewport.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target === viewport) setFollow(false);
    },
    { passive: true },
  );
  viewport.addEventListener("keydown", (e) => {
    if (["PageDown", "PageUp", "ArrowDown", "ArrowUp", "End"].includes(e.code))
      setFollow(false);
  });
  $("focus-button").addEventListener("click", () => {
    const value = document.body.classList.toggle("only-text");
    $("focus-button").setAttribute("aria-pressed", String(value));
    state.targetScroll = null;
    state.immediate = true;
  });
  $("text-view").addEventListener("click", () => {
    document.body.classList.remove("mobile-video");
    $("text-view").setAttribute("aria-pressed", "true");
    $("video-view").setAttribute("aria-pressed", "false");
    state.targetScroll = null;
    state.immediate = true;
  });
  $("video-view").addEventListener("click", () => {
    document.body.classList.add("mobile-video");
    $("video-view").setAttribute("aria-pressed", "true");
    $("text-view").setAttribute("aria-pressed", "false");
  });
  $("fullscreen-button").addEventListener("click", fullscreen);
  $("detach-button").addEventListener("click", detach);
  $("help-button").addEventListener("click", () => {
    video.pause();
    cancelCountdown();
    $("help-dialog").showModal();
  });
  $("close-help").addEventListener("click", () => $("help-dialog").close());
  $("help-dialog").addEventListener("click", (e) => {
    if (e.target === $("help-dialog")) {
      const r = e.target.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        e.target.close();
    }
  });
  $("countdown-button").addEventListener("click", () => {
    if (!state.ready) {
      toast("Das Video wird noch geladen.");
      return;
    }
    video.pause();
    cancelCountdown();
    let n = 3;
    $("countdown-number").textContent = "3";
    $("countdown-overlay").hidden = false;
    state.countdown = setInterval(() => {
      n--;
      if (n <= 0) {
        cancelCountdown();
        start();
      } else $("countdown-number").textContent = String(n);
    }, 1000);
  });
  $("cancel-countdown").addEventListener("click", cancelCountdown);
  video.addEventListener("loadedmetadata", () => {
    state.ready = true;
    $("play-button").disabled = false;
    update();
  });
  video.addEventListener("loadeddata", () => {
    $("loading").hidden = true;
  });
  video.addEventListener("canplay", () => {
    $("loading").hidden = true;
  });
  video.addEventListener("waiting", () => {
    if (!video.paused) {
      $("loading").textContent = "Video lädt …";
      $("loading").hidden = false;
    }
  });
  video.addEventListener("playing", () => {
    $("loading").hidden = true;
  });
  video.addEventListener("error", () => {
    $("loading").textContent =
      "Video konnte nicht geladen werden. Bitte die Datei in Chrome, Edge oder Safari öffnen.";
    $("loading").hidden = false;
    toast("Das eingebettete Video konnte nicht geladen werden.");
  });
  ["play", "pause", "ended", "ratechange"].forEach((event) =>
    video.addEventListener(event, () => {
      playbackUI();
      update();
      syncChild(true);
    }),
  );
  video.addEventListener("seeked", () => {
    state.targetScroll = null;
    update();
    syncChild(true);
  });
  video.addEventListener("timeupdate", () => {
    update();
    syncChild();
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      $("help-dialog").open ||
      e.target.isContentEditable ||
      /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)
    )
      return;
    if (e.code === "Escape" && state.countdown) {
      cancelCountdown();
      return;
    }
    if (e.repeat && e.code === "Space") return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlayback();
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      stepScene(-1);
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      stepScene(1);
    } else if (e.code === "Home") {
      e.preventDefault();
      video.pause();
      seek(0);
    } else if (e.key.toLowerCase() === "j") {
      seek(video.currentTime - 5);
    } else if (e.key.toLowerCase() === "l") {
      seek(video.currentTime + 5);
    } else if (e.key.toLowerCase() === "f") {
      fullscreen();
    } else if (e.key.toLowerCase() === "m") {
      setMirror(!state.mirror);
    } else if (e.key.toLowerCase() === "r") {
      setFollow(true);
    } else if (e.key === "+" || e.key === "=") {
      fontSize(state.font + 2);
    } else if (e.key === "-" || e.key === "−") {
      fontSize(state.font - 2);
    }
  });
  window.addEventListener("resize", () => {
    state.targetScroll = null;
    state.immediate = true;
  });
  if (typeof ResizeObserver === "function")
    new ResizeObserver(() => {
      state.targetScroll = null;
      state.immediate = true;
    }).observe(viewport);
  window.addEventListener("pagehide", closeAudience);
  setInterval(() => syncChild(), 300);
  if (video.readyState >= 1) {
    state.ready = true;
    $("play-button").disabled = false;
  }
  if (video.readyState >= 2) $("loading").hidden = true;
  update(0);
  playbackUI();
  requestAnimationFrame(renderFrame);
})();
