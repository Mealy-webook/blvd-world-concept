// ── the film ───────────────────────────────────────────────────────────────
// The park's own banner film, after the About copy. Three jobs, none of which the
// markup can do on its own:
//
//   · the play plate starts it and gets out of the way
//   · it pauses when it scrolls off screen, so a film nobody is looking at is not
//     still playing sound three sections further down
//   · the plate comes back when the film ends, so it can be played again
(function () {
  const frame = document.querySelector(".fm-frame");
  const vid = document.getElementById("fm-vid");
  const plate = document.getElementById("fm-play");
  if (!frame || !vid || !plate) return;

  function start() {
    frame.classList.add("is-playing");
    /* the control bar arrives with the film, not before it — see index.html */
    vid.controls = true;
    /* play() rejects if the browser will not allow it — a rejected promise here is
       unhandled otherwise, and the plate would have already gone */
    const p = vid.play();
    if (p && p.catch) p.catch(() => frame.classList.remove("is-playing"));
  }

  plate.addEventListener("click", start);
  /* the controls are on the element, so the video itself is also a play target once
     the plate has gone; this only covers the first press */
  vid.addEventListener("ended", () => {
    frame.classList.remove("is-playing");
    vid.controls = false;
  });

  /* Off screen, off. The film has sound, and the section is a third of the way down a
     long scroll — leaving it running is the kind of thing you notice from another
     room. It does not resume on its own coming back: that would be a video starting
     by itself, which is the thing the plate exists to avoid. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting && !vid.paused) vid.pause();
      }
    }, { threshold: 0.25 }).observe(frame);
  }
})();
