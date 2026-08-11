// ── the film ───────────────────────────────────────────────────────────────
// The park's own banner film, after the About copy, with no frame around it. It plays
// by itself while it is on screen. Four jobs, none of which the markup can do:
//
//   · --fm-p, 0 to 1 across the approach, which is what opens the slot
//   · the source is attached late, so a 5.7MB file is not fetched by every visitor
//   · play while on screen, pause the moment it leaves
//   · the sound, which autoplay cannot have and which the control offers
(function () {
  const section = document.getElementById("film");
  const stage = document.getElementById("fm-stage");
  const vid = document.getElementById("fm-vid");
  const sound = document.getElementById("fm-sound");
  const home = document.getElementById("view-home");
  if (!section || !stage || !vid || !home) return;

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── the source, attached late ──
     The film is the heaviest thing on the site by a factor of two. In the markup,
     everyone who opens the landing page pays for it; here it is fetched once the
     section is within a screen and a half, which for a scroll is early enough to be
     ready and for a bounce is never. */
  let wired = false;
  function wire() {
    if (wired) return;
    wired = true;
    const src = document.createElement("source");
    src.src = "video/hero-real.mp4";
    src.type = "video/mp4";
    vid.appendChild(src);
    vid.load();
  }

  /* ── the slot ──
     A plain scroll handler rather than a scroll-linked animation, because the page
     scrolls inside #view-home and not the window. 0 while the section is a screen
     below the fold, 1 once its top has reached a third of the way up. It writes a
     custom property and the CSS does the rest, so nothing here touches layout. */
  let queued = false;
  function measure() {
    queued = false;
    const box = section.getBoundingClientRect();
    const vh = home.clientHeight || 1;
    const p = 1 - (box.top - vh * 0.34) / (vh * 0.66);
    section.style.setProperty("--fm-p", Math.min(1, Math.max(0, p)).toFixed(4));
    if (box.top < vh * 1.5 && box.bottom > -vh) wire();
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(measure);
  }
  if (!still) {
    home.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
  }
  /* Measured once now rather than left at 0 until the first scroll: a background tab
     runs no rAF and fires no scroll, and the section would sit as a letterbox slot
     that never opens. */
  measure();

  /* ── playing ──
     Muted, because a browser will not start a film with sound without a gesture — and
     nor should it. play() still returns a promise that can reject (a data-saver
     setting, a policy we cannot see), and an unhandled rejection here would leave the
     section looking like a still with no explanation, so a failure puts the poster
     back and says nothing further. */
  function start() {
    if (still) return;
    wire();
    const p = vid.play();
    if (p && p.catch) p.catch(() => { section.classList.remove("is-playing"); });
    section.classList.add("is-playing");
  }
  function stop() {
    if (!vid.paused) vid.pause();
    section.classList.remove("is-playing");
  }

  /* On screen, playing; off screen, paused. Not just for the battery: with the sound
     switched on, a film still running three sections further down is the kind of thing
     you notice from another room. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => {
      for (const e of es) (e.isIntersecting ? start : stop)();
    }, { threshold: 0.35 }).observe(stage);
  } else {
    wire();
  }

  /* ── the sound ──
     The control is the whole reason autoplay is defensible here: the film has sound,
     muted autoplay throws it away, and a muted video with no way to unmute it is just
     a heavy animated background. Pressing it unmutes and, if the film was held back
     for any reason, starts it. */
  if (sound) {
    const label = sound.querySelector(".fm-slab");
    const sync = () => {
      sound.setAttribute("aria-pressed", vid.muted ? "false" : "true");
      sound.classList.toggle("is-on", !vid.muted);
      if (label) label.textContent = vid.muted ? "Sound off" : "Sound on";
      sound.setAttribute("aria-label", vid.muted ? "Turn the sound on" : "Turn the sound off");
    };
    sound.addEventListener("click", () => {
      vid.muted = !vid.muted;
      /* pressing it counts as the gesture, so this is also the one moment the film is
         allowed to start with sound if it had not started at all */
      if (!vid.muted && vid.paused) start();
      sync();
    });
    /* the browser can mute it back — a tab switch, a system setting — so the label
       follows the element rather than the last press */
    vid.addEventListener("volumechange", sync);
    sync();
  }
})();
