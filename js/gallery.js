// ── gallery: two belts of plates drifting in opposite directions ──
// The drift is CSS; scrolling nudges the belts a little further along, so the
// section keeps moving with the page rather than looping in place.
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

  const plate = (p) => `
    <figure class="gal-plate">
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
