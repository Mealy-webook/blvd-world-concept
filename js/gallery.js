// ── gallery: two belts of plates drifting in opposite directions ──
// The drift is CSS; scrolling nudges the belts a little further along, so the
// section keeps moving with the page rather than looping in place. Clicking a
// plate opens it full size in a lightbox.
(function () {
  const host = document.getElementById("gal-belts");
  if (!host) return;

  const PLATES = [
    { img: "fireworks.jpg",     cap: "Fireworks over the lake" },
    { img: "rock-mapping.jpg",  cap: "Projections on the rock" },
    { img: "greek-zone.jpg",    cap: "Cable cars, Greek quarter" },
    { img: "lake-aerial.jpg",   cap: "The lake from above" },
    { img: "beast-gate.jpg",    cap: "Into Beast Land" },
    { img: "skyloop-night.jpg", cap: "Sky Loop after dark" },
    { img: "amazonia-sign.jpg", cap: "Amazonia Awakens" },
    { img: "night-aerial.jpg",  cap: "One night, many worlds" },
  ];

  // the index is on the plate, because each belt renders its run twice over and
  // the same photograph therefore appears in the strip more than once
  const plate = (p) => `
    <figure class="gal-plate" role="button" tabindex="0"
            data-i="${PLATES.indexOf(p)}" aria-label="Open ${p.cap}">
      <img src="img/gallery/${p.img}" alt="${p.cap}" loading="lazy" draggable="false">
      <figcaption>${p.cap}</figcaption>
    </figure>`;

  // each belt holds its run twice over, so the -50% keyframe lands seamlessly
  const belt = (items, cls) => {
    const run = items.map(plate).join("");
    return `<div class="gal-belt ${cls}"><div class="gal-run">${run}${run}</div></div>`;
  };

  const half = Math.ceil(PLATES.length / 2);
  host.innerHTML = belt(PLATES.slice(0, half), "b1") + belt(PLATES.slice(half), "b2");

  const runs = [...host.querySelectorAll(".gal-run")];

  // pause the drift while a plate is being looked at
  host.addEventListener("pointerover", (e) => {
    const f = e.target.closest(".gal-plate");
    host.classList.toggle("held", !!f);
  });
  host.addEventListener("pointerleave", () => host.classList.remove("held"));

  /* ── the lightbox ──
     One frame, reused. It hangs off <body> rather than the section: .view carries
     a filter, and a filter makes an element the containing block for anything
     fixed inside it, so a fixed overlay in there would be trapped in the page. */
  const box = document.createElement("div");
  box.className = "lbx";
  box.hidden = true;
  box.innerHTML = `
    <div class="lbx-scrim" data-close></div>
    <div class="lbx-stage" role="dialog" aria-modal="true" aria-label="Gallery">
      <div class="lbx-frame">
        <figure class="lbx-shot">
          <img alt="">
        </figure>
      </div>
      <div class="lbx-bar">
        <p class="lbx-cap"></p>
        <p class="lbx-count"></p>
      </div>
      <button class="lbx-nav lbx-prev" type="button" aria-label="Previous photograph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="lbx-nav lbx-next" type="button" aria-label="Next photograph">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="lbx-x" type="button" aria-label="Close" data-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  document.body.appendChild(box);

  const shot = box.querySelector(".lbx-shot img");
  const cap = box.querySelector(".lbx-cap");
  const count = box.querySelector(".lbx-count");
  const closeBtn = box.querySelector(".lbx-x");
  let at = 0, opener = null;

  function paint(i, dir) {
    at = (i + PLATES.length) % PLATES.length;
    const p = PLATES[at];
    // re-run the entry animation on each change, in the direction of travel
    box.classList.remove("slid-l", "slid-r");
    if (dir) { void box.offsetWidth; box.classList.add(dir > 0 ? "slid-r" : "slid-l"); }
    shot.src = "img/gallery/" + p.img;
    shot.alt = p.cap;
    cap.textContent = p.cap;
    count.textContent = String(at + 1).padStart(2, "0") + " / " + String(PLATES.length).padStart(2, "0");
  }

  function open(i) {
    opener = document.activeElement;
    paint(i);
    box.hidden = false;
    void box.offsetWidth;                       // let the transition catch
    box.classList.add("on");
    document.documentElement.classList.add("lbx-open");
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    box.classList.remove("on");
    document.documentElement.classList.remove("lbx-open");
    const done = () => { box.hidden = true; };
    setTimeout(done, 320);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  // a plate opens by click, and by keyboard because it answers to a role
  host.addEventListener("click", (e) => {
    const f = e.target.closest(".gal-plate");
    if (f) open(+f.dataset.i || 0);
  });
  host.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const f = e.target.closest(".gal-plate");
    if (!f) return;
    e.preventDefault();
    open(+f.dataset.i || 0);
  });

  // the page scrolls inside #view-home, not the window, so rather than freezing
  // that container — and risking its scroll position — the overlay simply eats
  // the wheel and the drag while it is up
  const eat = (e) => e.preventDefault();
  box.addEventListener("wheel", eat, { passive: false });
  box.addEventListener("touchmove", eat, { passive: false });

  box.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return close();
    if (e.target.closest(".lbx-prev")) return paint(at - 1, -1);
    if (e.target.closest(".lbx-next")) return paint(at + 1, 1);
  });
  addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") paint(at - 1, -1);
    else if (e.key === "ArrowRight") paint(at + 1, 1);
    else if (e.key === "Tab") {
      // three controls and nothing else: keep Tab inside them
      const stops = [closeBtn, box.querySelector(".lbx-prev"), box.querySelector(".lbx-next")];
      const i = stops.indexOf(document.activeElement);
      e.preventDefault();
      stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
    }
  });

  // scroll adds a little extra travel, in opposite directions per belt
  const view = document.getElementById("view-home");
  if (!view) return;
  let queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const r = host.getBoundingClientRect();
      const vh = view.clientHeight || 1;
      if (r.bottom < -200 || r.top > vh + 200) return;      // off screen, skip
      // -1 → 1 as the section crosses the viewport
      const p = 1 - 2 * ((r.top + r.height / 2) / vh);
      runs[0].style.setProperty("--nudge", `${(-p * 5).toFixed(2)}%`);
      runs[1] && runs[1].style.setProperty("--nudge", `${(p * 5).toFixed(2)}%`);
    });
  }
  view.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
