// ── two carousels sharing one motion engine, each with its own look ──
// dining  → coverflow: cards swing past on a horizontal turntable
// shows   → rotary wheel: showtimes roll vertically like a ferris wheel
(function () {
  const $ = (s, r) => (r || document).querySelector(s);

  /* shortest signed distance from pos to index i, wrapped for infinity */
  function delta(i, p, n) {
    let d = ((i - p) % n + n) % n;
    if (d > n / 2) d -= n;
    return d;
  }

  /**
   * Drag / momentum / snap controller. Vertical or horizontal, infinite.
   * render(pos) is called every frame; onSettle(index) when it lands.
   */
  function engine({ stage, getCount, axis = "x", step = () => 200, render, onSettle }) {
    let pos = 0, target = 0, vel = 0, settled = -1;
    let dragging = false, moved = false, last = 0, start = 0;

    const coord = (e) => (axis === "x" ? e.clientX : e.clientY);

    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".car-btn")) return;   // let the arrows have their click
      dragging = true; moved = false; vel = 0;
      start = last = coord(e);
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("grabbing");
    });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const c = coord(e);
      const d = c - last;
      last = c;
      if (Math.abs(c - start) > 4) moved = true;
      const di = -d / step();
      pos += di;
      vel = vel * 0.7 + di * 0.3;
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("grabbing");
      target = Math.round(pos + vel * 9);
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
    stage.addEventListener("lostpointercapture", release);

    let wheelLock = 0;
    stage.addEventListener("wheel", (e) => {
      const now = performance.now();
      if (now < wheelLock) return;
      const d = axis === "x"
        ? (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
        : e.deltaY;
      if (Math.abs(d) < 8) return;
      wheelLock = now + 240;
      target = Math.round(target) + (d > 0 ? 1 : -1);
    }, { passive: true });

    (function loop() {
      if (!dragging) {
        const diff = target - pos;
        if (Math.abs(diff) > 0.0005) pos += diff * 0.13;
        else if (pos !== target) pos = target;
      }
      const count = getCount();
      if (count > 0) {
        render(pos);
        const idx = ((Math.round(pos) % count) + count) % count;
        if (idx !== settled) { settled = idx; onSettle && onSettle(idx); }
      }
      requestAnimationFrame(loop);
    })();

    return {
      go: (i) => { target = Math.round(pos) + delta(i, Math.round(pos), getCount()); },
      nudge: (n) => { target = Math.round(target) + n; },
      jump: () => { pos = target = 0; settled = -1; },
      dragged: () => moved,
    };
  }

  /* ══════════════ DINING — coverflow turntable ══════════════ */
  function buildDining() {
    const stage = $("#cf-stage");
    if (!stage) return;
    const data = (window.WBK && WBK.restaurants) || [];
    if (!data.length) return;

    const track = $("#cf-track");
    const label = $("#cf-label");
    const cards = data.map((r, i) => {
      const el = document.createElement("article");
      el.className = "cf-card";
      el.innerHTML =
        `<img src="img/zones/${r.img}" alt="${r.name}" draggable="false" loading="lazy">` +
        `<span class="cf-cuisine">${r.cuisine}</span>`;
      el.addEventListener("click", () => { if (!ctl.dragged()) ctl.go(i); });
      track.appendChild(el);
      return el;
    });

    const N = data.length;
    let STEP = 210;
    function measure() { STEP = (cards[0].offsetWidth || 260) * 0.62; }
    measure();
    addEventListener("resize", measure);

    const ctl = engine({
      stage, getCount: () => N, axis: "x", step: () => STEP,
      render(pos) {
        for (let i = 0; i < N; i++) {
          const d = delta(i, pos, N), ad = Math.abs(d), el = cards[i];
          if (ad > 3.4) { el.style.visibility = "hidden"; continue; }
          el.style.visibility = "visible";
          el.style.transform =
            `translate3d(calc(-50% + ${(d * STEP).toFixed(1)}px), -50%, ${(-ad * 190).toFixed(1)}px)` +
            ` rotateY(${(-d * 42).toFixed(2)}deg) scale(${(1 - ad * 0.05).toFixed(3)})`;
          el.style.opacity = (ad > 2.4 ? Math.max(0, (3.4 - ad)) : 1).toFixed(2);
          el.style.zIndex = String(500 - Math.round(ad * 100));
          el.style.setProperty("--dim", Math.min(ad * 0.42, 0.72).toFixed(2));
        }
      },
      onSettle(i) {
        const r = data[i];
        label.classList.add("swap");
        setTimeout(() => {
          label.innerHTML =
            `<h3>${r.name}</h3><p>${r.desc}</p><span class="cf-zone">${r.zone} zone</span>`;
          label.classList.remove("swap");
        }, 140);
      },
    });

    $("#cf-prev").addEventListener("click", () => ctl.nudge(-1));
    $("#cf-next").addEventListener("click", () => ctl.nudge(1));
    addEventListener("keydown", (e) => {
      if (!stage.closest(".view.active")) return;
      const r = stage.getBoundingClientRect();
      if (r.top > innerHeight || r.bottom < 0) return;   // only when on screen
      if (e.key === "ArrowLeft") ctl.nudge(-1);
      else if (e.key === "ArrowRight") ctl.nudge(1);
    });
  }

  /* ══════════════ SHOWS — vertical rotary wheel ══════════════ */
  function buildShows() {
    const stage = $("#wh-stage");
    if (!stage) return;
    const zones = (window.WBK && WBK.showsByZone) || [];
    if (!zones.length) return;

    const track = $("#wh-track");
    const tabs = $("#show-tabs");
    const meta = $("#wh-meta");
    let items = [], ctl = null, N = 0, zoneIdx = 0;
    const STEP = 74;

    function mount(zi) {
      zoneIdx = zi;
      const list = zones[zi].items;
      N = list.length;
      track.innerHTML = "";
      items = list.map((s) => {
        const el = document.createElement("div");
        el.className = "wh-item";
        el.innerHTML =
          `<b class="wh-time">${s.t}<small>${s.ap}</small></b>` +
          `<span class="wh-name">${s.n}</span>`;
        track.appendChild(el);
        return el;
      });

      if (!ctl) ctl = spin();
      ctl.jump();          // land on the first showtime of the new zone
    }

    function spin() {
      const c = engine({
        stage, getCount: () => N, axis: "y", step: () => STEP,
        render(pos) {
          for (let i = 0; i < N; i++) {
            const d = delta(i, pos, N), ad = Math.abs(d), el = items[i];
            if (!el) continue;
            if (ad > 3.2) { el.style.visibility = "hidden"; continue; }
            el.style.visibility = "visible";
            const ang = d * 26;                          // degrees around the wheel
            const rad = (ang * Math.PI) / 180;
            const R = 230;
            el.style.transform =
              `translate3d(-50%, calc(-50% + ${(Math.sin(rad) * R).toFixed(1)}px), ${((Math.cos(rad) - 1) * R).toFixed(1)}px)` +
              ` rotateX(${(-ang).toFixed(2)}deg)`;
            el.style.opacity = (ad > 2.2 ? Math.max(0, (3.2 - ad)) : 1 - ad * 0.22).toFixed(2);
            el.classList.toggle("on", ad < 0.5);
            el.style.zIndex = String(200 - Math.round(ad * 20));
          }
        },
        onSettle(i) {
          const s = zones[zoneIdx].items[i];
          if (!s || !meta) return;
          meta.classList.add("swap");
          setTimeout(() => {
            meta.innerHTML =
              `<span class="wh-type t-${s.ty.split(" ")[0].toLowerCase()}">${s.ty}</span>` +
              `<span class="wh-dur">${s.m} minutes</span>`;
            meta.classList.remove("swap");
          }, 130);
        },
      });
      return c;
    }

    // zone tabs drive which wheel is mounted
    tabs.innerHTML = zones.map((z, i) =>
      `<button type="button" class="${i === 0 ? "on" : ""}">${z.zone}</button>`
    ).join("");
    [...tabs.querySelectorAll("button")].forEach((b, i) =>
      b.addEventListener("click", () => {
        [...tabs.querySelectorAll("button")].forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        mount(i);
      })
    );

    mount(0);
    $("#wh-up").addEventListener("click", () => ctl.nudge(-1));
    $("#wh-down").addEventListener("click", () => ctl.nudge(1));
  }

  buildDining();
  buildShows();
})();
