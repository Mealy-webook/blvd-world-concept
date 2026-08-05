// ── the home page's rides band: three intensity rails ───────────────────
// Fourteen rides strung along GENTLE / LIVELY / FULL THROTTLE. The length of
// each rail is the section's real content — you can see at a glance that this
// park is thrill-heavy — and pointing at a name floats its photograph in.
(function () {
  const bands = document.getElementById("rt-bands");
  const peek = document.getElementById("rt-peek");
  const sec = document.getElementById("rides2");
  if (!bands || !sec) return;
  const rides = (window.WBK && WBK.rides) || [];
  if (!rides.length) return;

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };
  const BAND = { 1: "gentle", 2: "lively", 3: "thrill" };
  const heat = (r) => HEAT[r.kind] || 2;

  // gentlest rail first, so the section reads top to bottom, calm to wild
  const ORDER = [
    ["gentle", "Gentle"],
    ["lively", "Lively"],
    ["thrill", "Full throttle"],
  ];

  const byBand = new Map(ORDER.map(([k]) => [k, []]));
  rides.forEach((r, i) => byBand.get(BAND[heat(r)]).push({ ...r, i }));

  bands.innerHTML = ORDER.map(([key, label]) => {
    const set = byBand.get(key);
    if (!set.length) return "";
    return `
      <div class="rt-band" data-band="${key}">
        <div class="rt-key">
          <b>${label}</b>
          <span>${set.length} ride${set.length === 1 ? "" : "s"}</span>
        </div>
        <div class="rt-rail" role="list">
          ${set.map((r) => `
            <button class="rt-node" type="button" role="listitem" data-i="${r.i}">
              <i class="rt-dot" aria-hidden="true"></i><span>${r.name}</span>
            </button>`).join("")}
        </div>
      </div>`;
  }).join("");

  /* ── the photograph that follows the pointer ── */
  const shot = peek && peek.querySelector("img");
  const pName = peek && peek.querySelector(".rt-peek-name");
  const pFare = peek && peek.querySelector(".rt-peek-fare");
  let live = -1;

  function show(i) {
    if (!peek || i === live) return;
    const r = rides[i];
    if (!r) return;
    live = i;
    // held back until first asked for, so arriving at the section doesn't pull
    // down fourteen photographs nobody has pointed at yet
    shot.src = "img/rides/" + r.img;
    pName.textContent = r.name;
    pFare.textContent = `SAR ${r.reg} · fast ${r.fast}`;
  }

  const foot = sec.querySelector(".rt-foot");

  function place(node) {
    if (!peek) return;
    const s = sec.getBoundingClientRect();
    const n = node.getBoundingClientRect();
    const w = peek.offsetWidth || 180;
    const h = peek.offsetHeight || 176;
    const pad = 12;
    // it slides horizontally to sit under whatever is being pointed at
    let x = n.left - s.left + n.width / 2 - w / 2;
    x = Math.max(pad, Math.min(s.width - w - pad, x));
    // and lands in one fixed band — the empty space below the CTA — so the
    // photograph never covers the heading it is meant to illustrate
    let y = foot ? foot.getBoundingClientRect().bottom - s.top + 14 : 0;
    if (y + h > s.height - pad) {
      // no room down there: fall back to floating just above the node
      y = Math.max(pad, n.top - s.top - h - 12);
    }
    peek.style.left = "0";
    peek.style.top = "0";
    peek.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  function light(node) {
    bands.querySelectorAll(".rt-node.on").forEach((n) => n.classList.remove("on"));
    if (!node) { peek && peek.classList.remove("on"); return; }
    node.classList.add("on");
    show(+node.dataset.i);
    // it needs a laid-out box before it can be positioned, so reveal first
    // and place in the same frame
    if (peek) { peek.classList.add("on"); place(node); }
  }

  bands.addEventListener("pointerover", (e) => {
    const node = e.target.closest(".rt-node");
    if (node) light(node);
  });
  bands.addEventListener("focusin", (e) => {
    const node = e.target.closest(".rt-node");
    if (node) light(node);
  });
  bands.addEventListener("pointerleave", () => light(null));
  bands.addEventListener("focusout", (e) => {
    if (!bands.contains(e.relatedTarget)) light(null);
  });
  // a rail scrolling under a lit node would leave its card behind
  bands.querySelectorAll(".rt-rail").forEach((rail) =>
    rail.addEventListener("scroll", () => {
      const on = bands.querySelector(".rt-node.on");
      if (on) place(on);
    }, { passive: true })
  );

  // a tap goes through to the rides page, where the ride is actually bookable;
  // on touch the first tap only lights it, the second follows through
  bands.addEventListener("click", (e) => {
    const node = e.target.closest(".rt-node");
    if (!node) return;
    if (matchMedia("(hover: hover)").matches || node.classList.contains("on")) {
      location.hash = "#/rides";
    } else {
      light(node);
    }
  });

  addEventListener("resize", () => {
    const on = bands.querySelector(".rt-node.on");
    if (on) place(on);
  });
})();
