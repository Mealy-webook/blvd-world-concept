// ── rides on the home page: the count large, the names live ─────────────
// The band's backdrop is whichever ride you are pointing at. Left alone it walks
// the list on its own, so the section is never static; touching the list takes
// the wheel and keeps it.
(function () {
  const list = document.getElementById("rh-list");
  const bg = document.getElementById("rh-bg");
  const split = document.getElementById("rh-split");
  if (!list || !bg) return;
  const rides = (window.WBK && WBK.rides) || [];
  if (!rides.length) return;

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };
  const BAND = { 1: "gentle", 2: "lively", 3: "thrill" };
  const LABEL = { gentle: "Gentle", lively: "Lively", thrill: "Full throttle" };
  const heat = (r) => HEAT[r.kind] || 2;
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── how the fourteen split by intensity ── */
  if (split) {
    const counts = rides.reduce((m, r) => { const b = BAND[heat(r)]; m[b] = (m[b] || 0) + 1; return m; }, {});
    split.innerHTML = ["thrill", "lively", "gentle"]
      .filter((b) => counts[b])
      .map((b) => `<div class="rh-stat b-${b}"><dt>${LABEL[b]}</dt><dd>${counts[b]}</dd></div>`).join("");
  }

  /* ── the backdrop: one plate per ride, only the live one lit ── */
  // src is held back until a plate is wanted, so the band doesn't pull fourteen
  // photographs down before anyone has looked at it
  bg.innerHTML = rides.map((r, i) => `
    <span class="rh-plate${i === 0 ? " on" : ""}"><img data-src="img/rides/${r.img}" alt=""></span>`).join("");
  const plates = [...bg.children];

  function load(i) {
    const el = plates[i];
    if (!el) return;
    const img = el.firstElementChild;
    if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
  }

  /* ── the names ── */
  list.innerHTML = rides.map((r, i) => {
    const h = heat(r);
    return `
      <li class="rh-item" data-i="${i}" style="--d:${Math.min(i, 9) * 40}ms">
        <a class="rh-link" href="#/rides">
          <span class="rh-no">${String(i + 1).padStart(2, "0")}</span>
          <span class="rh-name">${r.name}</span>
          <span class="rh-bars b${h}" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="rh-fare">SAR ${r.reg}</span>
        </a>
      </li>`;
  }).join("");
  const items = [...list.children];

  let live = -1;
  function show(i) {
    if (i === live || !rides[i]) return;
    live = i;
    load(i); load(i + 1);
    plates.forEach((p, n) => p.classList.toggle("on", n === i));
    items.forEach((it, n) => it.classList.toggle("on", n === i));
  }

  // pointer or keyboard, same handler
  list.addEventListener("pointerover", (e) => {
    const it = e.target.closest(".rh-item");
    if (it) { stop(); show(+it.dataset.i); }
  });
  list.addEventListener("focusin", (e) => {
    const it = e.target.closest(".rh-item");
    if (it) { stop(); show(+it.dataset.i); }
  });

  /* ── left alone, it walks the list itself ── */
  let timer = null;
  function start() {
    if (STILL || timer) return;
    timer = setInterval(() => show((live + 1) % rides.length), 3200);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  list.addEventListener("pointerleave", start);
  // and only while the band is actually on screen
  const sec = document.getElementById("rides2");
  if (sec && window.IntersectionObserver) {
    new IntersectionObserver((es) => {
      for (const en of es) en.isIntersecting ? start() : stop();
    }, { threshold: 0.25 }).observe(sec);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  /* ── the names rise in as the band arrives ── */
  if (STILL) {
    items.forEach((it) => it.classList.add("in"));
  } else {
    const io = new IntersectionObserver((es) => {
      for (const en of es) if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }, { threshold: 0.3 });
    items.forEach((it) => io.observe(it));
    setTimeout(() => items.forEach((it) => it.classList.add("in")), 4000);
  }

  show(0);
})();
