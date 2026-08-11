// ── the film ───────────────────────────────────────────────────────────────
// The park's own banner film, after the About copy, with no frame around it. Four
// jobs, none of which the markup can do on its own:
//
//   · --fm-p, 0 to 1 across the approach, which is what opens the slot
//   · the source is attached late, so a 5.7MB file is not fetched by every visitor
//   · the play control starts it and gets out of the way
//   · it pauses when it leaves the screen, so a film nobody is watching is not still
//     playing sound three sections further down
(function () {
  const section = document.getElementById("film");
  const stage = document.getElementById("fm-stage");
  const vid = document.getElementById("fm-vid");
  const play = document.getElementById("fm-play");
  const home = document.getElementById("view-home");
  if (!section || !stage || !vid || !play || !home) return;

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── the source, attached late ──
     The film is the heaviest thing on the site by a factor of two. Everyone who opens
     the landing page would pay for it in the markup; here it is fetched once the
     section is within a screen and a half, which for most of the scroll is early
     enough to be ready and for a bounce is never. */
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
     scrolls inside #view-home and not the window — a ViewTimeline would need the
     scroller named, and this is four lines.

     0 while the section is a screen below the fold, 1 once its top has reached a third
     of the way up. Written to the section as a custom property; the CSS does the rest,
     so nothing here touches layout. */
  let queued = false;
  function measure() {
    queued = false;
    const box = section.getBoundingClientRect();
    const vh = home.clientHeight || 1;
    /* how far the section's top has travelled from the bottom of the screen up to a
       third of the way in */
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
  /* Measured once now, not left at 0 until the first scroll: in a background tab no
     rAF runs and no scroll happens, and a section stuck at --fm-p 0 is a letterbox
     slot that never opens. The CSS default is 0, so this is the only thing that makes
     the section correct on arrival. */
  measure();

  /* ── playing ── */
  function start() {
    wire();
    section.classList.add("is-playing");
    vid.controls = true;
    /* play() rejects when the browser will not allow it, and an unhandled rejection
       would leave the control gone and nothing playing */
    const p = vid.play();
    if (p && p.catch) p.catch(() => {
      section.classList.remove("is-playing");
      vid.controls = false;
    });
  }
  play.addEventListener("click", start);

  vid.addEventListener("ended", () => {
    section.classList.remove("is-playing");
    vid.controls = false;
    vid.currentTime = 0;
  });

  /* Off screen, off. The film has sound and the section sits a third of the way down a
     long scroll. It does not resume coming back: that would be a video starting by
     itself, which is the thing the play control exists to avoid. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting && !vid.paused) vid.pause();
        if (e.isIntersecting) wire();
      }
    }, { threshold: 0.2 }).observe(stage);
  }
})();
