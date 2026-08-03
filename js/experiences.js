// ── experiences: infinite concave-arc carousel ─────────────────
(function () {
  const arc = document.getElementById("xp-arc");
  if (!arc) return;

  const track = document.getElementById("xp-track");
  const view = document.getElementById("view-experiences");
  const els = {
    title: document.getElementById("xp-title"),
    blurb: document.getElementById("xp-blurb"),
    price: document.getElementById("xp-price"),
    dots: document.getElementById("xp-dots"),
  };

  const DATA = (window.WBK && WBK.experiences) || [];
  const N = DATA.length;
  if (!N) return;

  // ── build cards + dots ──────────────────────────────────────
  const cards = DATA.map((x, i) => {
    const el = document.createElement("article");
    el.className = "xp-card";
    el.innerHTML =
      `<img src="img/exp/${x.img}" alt="${x.title}" draggable="false" loading="lazy">` +
      `<div class="xp-cap"><b>${x.title}</b><span>SAR ${x.price}</span></div>`;
    el.addEventListener("click", () => { if (!moved) goTo(i); });
    track.appendChild(el);
    return el;
  });

  const dots = DATA.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to ${DATA[i].title}`);
    b.addEventListener("click", () => goTo(i));
    els.dots.appendChild(b);
    return b;
  });

  // ── geometry ────────────────────────────────────────────────
  const SPREAD = 22;   // degrees of arc per card
  const TURN = 0.85;   // how much each card turns to face the centre
  const LIFT = 18;     // px each card rises away from the centre (the "valley")
  let R = 560, STEP = 200;

  // radius is derived from the rendered card width so neighbours always sit
  // a consistent fraction of a card apart, at any viewport size
  function measure() {
    const cw = cards[0].offsetWidth || 240;
    STEP = cw * 1.06;
    R = STEP / Math.sin((SPREAD * Math.PI) / 180);
  }
  measure();
  addEventListener("resize", measure);

  // shortest signed distance from pos to card i, wrapped for infinity
  function delta(i, p) {
    let d = ((i - p) % N + N) % N;
    if (d > N / 2) d -= N;
    return d;
  }

  let pos = 0, target = 0, vel = 0, active = -1;

  function render() {
    for (let i = 0; i < N; i++) {
      const d = delta(i, pos);
      const ad = Math.abs(d);
      const el = cards[i];
      if (ad > 3.2) { el.style.visibility = "hidden"; continue; }
      el.style.visibility = "visible";

      const rad = (d * SPREAD * Math.PI) / 180;
      const x = Math.sin(rad) * R;
      const z = (Math.cos(rad) - 1) * R;      // sides recede → concave
      const y = -ad * LIFT;                    // sides rise → valley
      const rotY = -d * SPREAD * TURN;
      const scale = Math.max(0.6, 1 - ad * 0.05);
      const op = ad > 2.6 ? Math.max(0, (3.2 - ad) / 0.6) : 1;

      el.style.transform =
        `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px)` +
        ` rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = op.toFixed(2);
      el.style.zIndex = String(1000 - Math.round(ad * 100));
      el.style.setProperty("--veil", Math.min(ad * 0.34, 0.62).toFixed(2));
      el.style.setProperty("--capop", ad < 0.5 ? "0" : Math.min(1, ad * 0.9).toFixed(2));
    }
    syncFront();
  }

  // header / footer / dots follow whichever card is at the front
  function syncFront() {
    const idx = ((Math.round(pos) % N) + N) % N;
    if (idx === active) return;
    active = idx;
    const x = DATA[idx];

    els.title.classList.add("swap");
    els.blurb.classList.add("swap");
    setTimeout(() => {
      els.title.textContent = x.title;
      els.blurb.textContent = x.blurb;
      els.price.textContent = `SAR ${x.price}`;
      els.title.classList.remove("swap");
      els.blurb.classList.remove("swap");
    }, 150);

    dots.forEach((d, i) => d.classList.toggle("on", i === idx));
  }

  // ── motion: drag / momentum / snap ──────────────────────────
  let dragging = false, moved = false, lastX = 0, startX = 0;

  function loop() {
    if (!dragging) {
      const diff = target - pos;
      if (Math.abs(diff) > 0.0004) pos += diff * 0.13;
      else if (pos !== target) pos = target;
    }
    render();
    requestAnimationFrame(loop);
  }

  function goTo(i) {
    // travel the short way round, even across the wrap point
    target = Math.round(pos) + delta(i, Math.round(pos));
  }
  function step(n) { target = Math.round(target) + n; }

  arc.addEventListener("pointerdown", (e) => {
    // the arrows live inside the arc; capturing the pointer here would
    // swallow their click, so leave presses on them alone
    if (e.target.closest(".xp-nav")) return;
    dragging = true; moved = false; vel = 0;
    startX = lastX = e.clientX;
    arc.setPointerCapture(e.pointerId);
  });
  arc.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    if (Math.abs(e.clientX - startX) > 4) moved = true;
    const dIdx = -dx / STEP;
    pos += dIdx;
    vel = vel * 0.7 + dIdx * 0.3;
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    target = Math.round(pos + vel * 9);
  }
  arc.addEventListener("pointerup", release);
  arc.addEventListener("pointercancel", release);
  arc.addEventListener("lostpointercapture", release);

  document.getElementById("xp-prev").addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  document.getElementById("xp-next").addEventListener("click", (e) => { e.stopPropagation(); step(1); });

  let wheelLock = 0;
  arc.addEventListener("wheel", (e) => {
    const now = performance.now();
    if (now < wheelLock) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    wheelLock = now + 260;
    step(d > 0 ? 1 : -1);
  }, { passive: true });

  addEventListener("keydown", (e) => {
    if (!view.classList.contains("active")) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  render();
  requestAnimationFrame(loop);
})();
