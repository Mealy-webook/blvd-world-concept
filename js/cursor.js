// ── the cursor ───────────────────────────────────────────────────────────
// Two parts: a small dot pinned exactly to the pointer, and a larger ring that
// trails it. Both are drawn in `difference` blend mode, so they invert whatever
// is under them and stay visible over a poster, a photograph or the night sky
// without needing a colour of their own.
//
// It reads the thing under the pointer and changes state: interactive elements
// swell the ring, draggable surfaces swell it further and letter a word into it,
// and pressing shrinks it. The native cursor is only hidden where this one is
// actually running.
(function () {
  // touch has no cursor to replace, and a trailing ring is exactly the kind of
  // motion someone asking for less of it does not want
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || still) return;

  const root = document.createElement("div");
  root.className = "cur";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <i class="cur-dot"></i>
    <i class="cur-ring"><span class="cur-word"></span></i>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("has-cursor");

  const dot = root.querySelector(".cur-dot");
  const ring = root.querySelector(".cur-ring");
  const word = root.querySelector(".cur-word");

  // what the pointer is over decides the state. Kept as data rather than a pile
  // of if-statements so adding a surface is one line.
  const GRAB = ".cf-frame, .rail, #eat-rail, #show-rail, #pm-stage, #pm-frame, .rs-strip";
  const HIT = 'a, button, [role="button"], summary, label, .cf-card, .cf-dot, .bt, .pill, .eat-card, .vr-tile, .faq-q';
  const TEXT = "input, textarea, [contenteditable]";

  let tx = innerWidth / 2, ty = innerHeight / 2;   // where the pointer is
  let rx = tx, ry = ty;                            // where the ring has got to
  let raf = null, shown = false;

  function paint() {
    raf = null;
    // the ring eases toward the pointer; the dot is already there
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) translate(-50%, -50%)`;
    if (Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1) tick();
  }
  function tick() {
    // requestAnimationFrame does not run in a hidden document; without this the
    // ring would stay parked wherever it was when the tab was hidden
    if (document.hidden) { rx = tx; ry = ty; paint(); return; }
    if (raf === null) raf = requestAnimationFrame(paint);
  }

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
    if (!shown) { shown = true; root.classList.add("on"); }
    tick();

    const el = e.target instanceof Element ? e.target : null;
    if (!el) return;
    const grab = el.closest(GRAB);
    const text = el.closest(TEXT);
    root.classList.toggle("is-text", !!text);
    root.classList.toggle("is-grab", !!grab && !text);
    root.classList.toggle("is-hit", !text && !grab && !!el.closest(HIT));
    if (grab && !text) word.textContent = "Drag";
  }, { passive: true });

  // pressing pulls the ring in, the way a button does under a finger
  addEventListener("pointerdown", () => root.classList.add("is-down"));
  addEventListener("pointerup", () => root.classList.remove("is-down"));
  addEventListener("pointercancel", () => root.classList.remove("is-down"));

  // leaving the window takes it with you, rather than leaving a ring stranded
  addEventListener("pointerout", (e) => {
    if (!e.relatedTarget && !e.toElement) { shown = false; root.classList.remove("on"); }
  });
  addEventListener("blur", () => { shown = false; root.classList.remove("on"); });
})();
