// ── the story-scroll section transition ─────────────────────────────────
// A port of the supplied GSAP `FlowArt` / `story-scroll` component. The mechanic
// is kept: every section is a stacking layer, and each one arrives rotated about
// its bottom-left corner, swinging level as it comes up the screen. Sections sit
// on rising z-index so the incoming one hinges over the one it replaces.
//
// What is NOT ported is the machinery: this project has no React, no Tailwind and
// no build step, and GSAP's ScrollTrigger would have to pin every section — which
// fights the CSS scroll-snap that gives this page its one-section-per-gesture
// scrolling. The snap already holds each section in place, so the rotation is
// driven straight off scroll position instead, exactly as js/headings.js and the
// .reveal system do. No dependencies, and nothing to fight over the scroller.
(function () {
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const home = document.getElementById("view-home");
  if (!home) return;

  // the hero is the ground floor — it never swings in, everything hinges over it
  const SEL = ".zonesec, .ridetrack, .cashless, .eats, .shows, .gallery, .faqs, .sponsors, .pkcall";
  const secs = [...home.querySelectorAll(SEL)].filter((s) => s.offsetParent);
  if (!secs.length) return;

  const MAX = 26;              // degrees the section is turned when it is a screen away

  // Each section gets an inner wrapper to turn, so the rotation never lands on the
  // element that scroll-snap is measuring — a snap target with a transform on it
  // reports a moved box and the snapping goes wrong.
  const inners = secs.map((sec, i) => {
    let inner = sec.querySelector(":scope > .flow-in");
    if (!inner) {
      inner = document.createElement("div");
      inner.className = "flow-in";
      while (sec.firstChild) inner.appendChild(sec.firstChild);
      sec.appendChild(inner);
    }
    // the stack: later sections hinge over earlier ones
    sec.style.zIndex = String(11 + i);
    return inner;
  });

  if (STILL) {                 // stood still it is a plain stack of sections
    inners.forEach((el) => { el.style.transform = "none"; });
    return;
  }

  let raf = null;

  function paint() {
    raf = null;
    const vh = home.clientHeight || 1;
    const st = home.scrollTop;
    for (let i = 0; i < secs.length; i++) {
      // offsetTop, not getBoundingClientRect: the sections are sticky, so their
      // painted box reads 0 the moment they pin, which would land the rotation
      // long before the section has actually arrived
      const top = secs[i].offsetTop - st;
      // 1 while the section is still a full screen below, 0 once its top reaches
      // a quarter of the way up — the same window the original scrubbed over
      let p = (top - vh * 0.25) / (vh * 0.75);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      // ease the tail so it settles level rather than creeping the last degree
      const e = p * p;
      inners[i].style.transform = e < 0.0005 ? "none" : `rotate(${(e * MAX).toFixed(2)}deg)`;
    }
  }

  // requestAnimationFrame does not run in a hidden document, and the preview pane
  // is one — without this the sections stay parked at whatever angle they had
  function tick() {
    if (document.hidden) { paint(); return; }
    if (raf === null) raf = requestAnimationFrame(paint);
  }

  home.addEventListener("scroll", tick, { passive: true });
  addEventListener("resize", tick);
  // the sections are only laid out once the home view is the active one
  new MutationObserver(tick).observe(home, { attributes: true, attributeFilter: ["class"] });
  tick();
})();
