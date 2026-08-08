// ── about: the park in its own figures ──────────────────────────────────────
// Every number in this section is counted from WBK at load. None of them is typed
// into the markup, because a figure typed into a page is a figure that goes wrong
// the first time the data behind it changes — and this project has twenty zones,
// twenty-six map pins and a hundred and fifty-one showtimes, none of which anybody
// is going to recount by hand.
//
// The zone count comes from the map's pins rather than from WBK.zones, and the two
// genuinely differ: the globe carries twenty zones, the printed park map has
// twenty-four plus two gates. The map is the park as built, so the map wins here —
// and it is the same source the home page's map module counts, so the two sections
// can never disagree with each other.
(function () {
  const out = document.getElementById("ab-facts");
  if (!out || !window.WBK) return;

  const pins = WBK.mapPins || [];
  const zones = pins.filter((p) => !p.gate).length;
  const rides = (WBK.rides || []).length;
  const eats = (WBK.restaurants || []).length;
  const shows = (WBK.showsByZone || [])
    .reduce((n, z) => n + ((z.items && z.items.length) || 0), 0);

  const facts = [
    { n: zones, label: "zones" },
    { n: rides, label: "rides" },
    { n: eats, label: "restaurants" },
    { n: shows, label: "showtimes a night" },
  ].filter((f) => f.n > 0);

  out.innerHTML = facts.map((f) => `<li><b>${f.n}</b><span>${f.label}</span></li>`).join("");

  /* The figures are in the page already, and the count-up runs over the top of
     them: neither requestAnimationFrame nor an IntersectionObserver callback runs
     in a background tab, and a section read later should not be showing zeroes. */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    for (const el of out.querySelectorAll("b")) {
      const to = +el.textContent;
      let t0 = null;
      const step = (t) => {
        if (t0 === null) t0 = t;
        const k = Math.min((t - t0) / 1100, 1);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
        else el.textContent = String(to);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.45 });
  io.observe(out);

  /* The four-card section's figures are the client's park totals, written into the
     markup rather than counted here: our data holds a sample (fourteen named rides,
     four featured restaurants) and counting it would have printed 14 and 4 beside a
     brochure saying 40+ and 350+. The about row above still counts, because those
     four figures describe this site's own data. */


  /* ── the visit card ──
     Written from WBK.visit, which is the client's own card word for word. Reading it
     from the data rather than typing it here means the hours cannot end up saying one
     thing on the home page and another in the FAQ. */
  const v = WBK.visit;
  if (v) {
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el && text) el.textContent = text;
    };
    set("vs-hours", `${v.from} \u2013 ${v.to}`);
    set("vs-days", `${v.days}, right through the season`);
    set("vs-season", `${v.seasonFrom} \u2013 ${v.seasonTo}`);
    set("vs-where", v.where);
  }

})();
