// ── rides on the home page: the names drift, the backdrop follows ───────
// Only the name shows here — number, intensity and fare live on the rides page.
// The belt runs continuously and whichever name is crossing the centre line is
// the live one, so the band is never still. Pointing at a name takes it over.
(function () {
  const reel = document.getElementById("rh-reel");
  const belt = document.getElementById("rh-belt");
  const bg = document.getElementById("rh-bg");
  const split = document.getElementById("rh-split");
  if (!reel || !belt || !bg) return;
  const rides = (window.WBK && WBK.rides) || [];
  if (!rides.length) return;

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };
  const BAND = { 1: "gentle", 2: "lively", 3: "thrill" };
  const LABEL = { gentle: "Gentle", lively: "Lively", thrill: "Full throttle" };
  const heat = (r) => HEAT[r.kind] || 2;
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── how the fourteen split by intensity, beside the lead ── */
  if (split) {
    const counts = rides.reduce((m, r) => { const b = BAND[heat(r)]; m[b] = (m[b] || 0) + 1; return m; }, {});
    split.innerHTML = ["thrill", "lively", "gentle"]
      .filter((b) => counts[b])
      .map((b) => `<div class="rh-stat b-${b}"><dt>${LABEL[b]}</dt><dd>${counts[b]}</dd></div>`).join("");
  }

  /* ── the backdrop: one plate per ride, only the live one lit ── */
  bg.innerHTML = rides.map((r, i) => `
    <span class="rh-plate${i === 0 ? " on" : ""}"><img data-src="img/rides/${r.img}" alt=""></span>`).join("");
  const plates = [...bg.children];
  function load(i) {
    const el = plates[i];
    if (!el) return;
    const img = el.firstElementChild;
    if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
  }

  /* ── the belt: the names twice over, so the loop has no seam ── */
  const row = (r, i) => `
    <button class="rh-word" type="button" data-i="${i}">
      <span>${r.name}</span>
    </button>`;
  belt.innerHTML = rides.map(row).join("") + rides.map(row).join("");
  const words = [...belt.children];

  let live = -1;
  function show(i) {
    if (i === live || !rides[i]) return;
    live = i;
    load(i); load((i + 1) % rides.length);
    plates.forEach((p, n) => p.classList.toggle("on", n === i));
    words.forEach((w) => w.classList.toggle("on", +w.dataset.i === i));
  }

  /* ── the name crossing the centre is the live one ── */
  let raf = null, held = false;
  function follow() {
    raf = null;
    if (!held) {
      const mid = reel.getBoundingClientRect().top + reel.clientHeight / 2;
      let best = -1, bestD = Infinity;
      for (const w of words) {
        const b = w.getBoundingClientRect();
        if (!b.height) continue;
        const d = Math.abs(b.top + b.height / 2 - mid);
        if (d < bestD) { bestD = d; best = +w.dataset.i; }
      }
      if (best >= 0) show(best);
    }
    if (running) raf = requestAnimationFrame(follow);
  }

  let running = false;
  function start() {
    if (STILL || running) return;
    running = true;
    belt.classList.add("rolling");
    raf = requestAnimationFrame(follow);
  }
  function stop() {
    running = false;
    belt.classList.remove("rolling");
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  // pointing at a name holds it; leaving hands the belt back
  belt.addEventListener("pointerover", (e) => {
    const w = e.target.closest(".rh-word");
    if (!w) return;
    held = true;
    belt.classList.add("paused");
    show(+w.dataset.i);
  });
  belt.addEventListener("focusin", (e) => {
    const w = e.target.closest(".rh-word");
    if (w) { held = true; belt.classList.add("paused"); show(+w.dataset.i); }
  });
  reel.addEventListener("pointerleave", () => { held = false; belt.classList.remove("paused"); });

  /* ── it only runs while the band is on screen and the tab is watched ──
     Scroll maths rather than an observer: the page scrolls inside #view-home,
     and an observer rooted there is unreliable about delivering — the heading
     reveal was bitten by exactly that. */
  const sec = document.getElementById("rides2");
  const home = document.getElementById("view-home");
  function check() {
    if (!sec) return;
    const b = sec.getBoundingClientRect();
    const vh = (home ? home.clientHeight : innerHeight) || 1;
    const top = home ? home.getBoundingClientRect().top : 0;
    const onScreen = b.bottom - top > vh * 0.1 && b.top - top < vh * 0.9;
    if (onScreen && !document.hidden) start(); else stop();
  }
  home && home.addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  document.addEventListener("visibilitychange", check);
  check();

  if (STILL) words.forEach((w) => w.classList.add("in"));
  show(0);
})();
