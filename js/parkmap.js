// ── the park map: the official plan, made pannable and clickable ──────
// Structure follows the Six Flags Qiddiya park-map page: the artwork is the
// canvas, and a floating panel over it carries search, category chips and a
// grouped list of everything in the park. Picking a row flies the map to the
// matching pin; picking a pin does the same move from the other direction.
(() => {
  const frame = document.getElementById("pm-frame");
  if (!frame || !window.WBK) return;

  const stage = document.getElementById("pm-stage");
  const pinLayer = document.getElementById("pm-pins");
  const hint = document.getElementById("pm-hint");
  const panel = document.getElementById("pm-panel");
  const listEl = document.getElementById("pp-list");
  const pins = WBK.mapPins || [];

  const MIN = 1, MAX = 4.6;
  let z = 1, tx = 0, ty = 0;          // scale + translate, in frame pixels

  /* ── view transform ─────────────────────────────────────────────── */
  // At z = 1 the artwork exactly fills the frame, so panning is clamped to
  // the slack the zoom creates — the map can never drift off its own frame.
  function clamp() {
    const r = frame.getBoundingClientRect();
    const slackX = (r.width * z - r.width) / 2;
    const slackY = (r.height * z - r.height) / 2;
    tx = Math.max(-slackX, Math.min(slackX, tx));
    ty = Math.max(-slackY, Math.min(slackY, ty));
  }

  function apply() {
    clamp();
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
    pinLayer.style.setProperty("--inv", 1 / z);
    frame.classList.toggle("zoomed", z > 1.02);
    const out = document.getElementById("pm-out");
    const inn = document.getElementById("pm-in");
    if (out) out.disabled = z <= MIN + 0.01;
    if (inn) inn.disabled = z >= MAX - 0.01;
  }

  // zoom about a point (frame-local px), so the spot under the cursor stays put
  function zoomAt(nz, px, py) {
    const r = frame.getBoundingClientRect();
    nz = Math.max(MIN, Math.min(MAX, nz));
    const cx = px - r.width / 2, cy = py - r.height / 2;
    const k = nz / z;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    z = nz;
    apply();
  }
  const zoomCentre = (nz) => {
    const r = frame.getBoundingClientRect();
    zoomAt(nz, r.width / 2, r.height / 2);
  };

  // bring a pin into the part of the frame the panel isn't covering
  function framePin(i, nz) {
    const pin = pins[i];
    if (!pin) return;
    const r = frame.getBoundingClientRect();
    // how much of the map the panel actually covers — nothing when they sit
    // side by side, the lot in list mode
    let hidden = 0;
    if (panel) {
      const p = panel.getBoundingClientRect();
      hidden = Math.max(0, Math.min(p.right, r.right) - Math.max(p.left, r.left));
    }
    z = Math.max(nz || 2.4, MIN);
    // where the pin should land: middle of the strip to the right of the panel
    const aimX = hidden + (r.width - hidden) / 2;
    tx = aimX - r.width / 2 - (pin.x / 100 - 0.5) * r.width * z;
    ty = -(pin.y / 100 - 0.5) * r.height * z;
    apply();
  }

  /* ── pins ───────────────────────────────────────────────────────── */
  const expByZone = new Map((WBK.parkExperiences || []).map((p) => [p.zone, p.items]));

  // the label as printed on the map, in the casing the rest of the site uses
  const keyOf = (pin) =>
    pin.label === "THE PLANET" ? "The Planet"
      : pin.label === "WARZONE" ? "Warzone"
        : pin.label === "PIER" ? "Pier"
          : pin.zone || pin.label.charAt(0) + pin.label.slice(1).toLowerCase();

  const nodes = pins.map((pin, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pm-pin" + (pin.gate ? " is-gate" : "");
    b.style.setProperty("--x", pin.x + "%");
    b.style.setProperty("--y", pin.y + "%");
    b.style.setProperty("--tone", pin.tone);
    b.dataset.i = i;
    b.setAttribute("aria-label", pin.label);
    b.innerHTML = `<i class="pm-dot"></i><span class="pm-tag">${pin.label}</span>`;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      select(i, 2.4);        // same move as picking the row in the panel
    });
    pinLayer.appendChild(b);
    return b;
  });

  // one interaction, whichever side it starts from: the pin lights up, the map
  // flies onto it, and the panel scrolls its row into view and highlights it
  function select(i, zoom) {
    const pin = pins[i];
    nodes.forEach((n, k) => n.classList.toggle("on", k === i));
    hint?.classList.add("gone");
    if (zoom) framePin(i, zoom);

    const key = keyOf(pin);
    const row = [...listEl.querySelectorAll(".pp-row")]
      .find((r) => r.dataset.pin === String(i)) ||
      [...listEl.querySelectorAll(".pp-row")].find((r) => r.textContent.includes(key));
    if (row) {
      listEl.querySelectorAll(".pp-row.on").forEach((r) => r.classList.remove("on"));
      row.classList.add("on");
      // scroll the list itself, never scrollIntoView: that walks every
      // scrollable ancestor and would drag the page off the map
      const delta = row.getBoundingClientRect().top - listEl.getBoundingClientRect().top;
      listEl.scrollTo({
        top: Math.max(0, listEl.scrollTop + delta - (listEl.clientHeight - row.offsetHeight) / 2),
        behavior: "smooth",
      });
    }
  }

  /* ── the panel's list: everything in the park, one row shape ────── */
  // a zone-name → photo lookup, so every row can carry a thumbnail
  const zoneImg = new Map();
  for (const p of WBK.parkExperiences || []) if (p.img) zoneImg.set(p.zone, "img/zones/" + p.img);
  for (const r of WBK.restaurants || []) if (!zoneImg.has(r.zone)) zoneImg.set(r.zone, "img/zones/" + r.img);
  // the globe's zone gallery is the last fallback, so zones that appear in
  // neither the experience sheet nor the dining list still get a thumbnail
  for (const zn of WBK.zones || []) if (!zoneImg.has(zn.name) && zn.imgs?.length) zoneImg.set(zn.name, "img/zones/" + zn.imgs[0]);
  for (const pin of pins) {
    const k = keyOf(pin);
    if (!zoneImg.has(k) && pin.extra?.imgs?.length) zoneImg.set(k, "img/zones/" + pin.extra.imgs[0]);
  }
  const pinOf = new Map(pins.map((p, i) => [keyOf(p), i]));

  // the shows sheet names two zones its own way; alias them so those rows
  // still get a thumbnail and still fly the map to the right pin
  for (const [alias, canon] of [["Korea", "South Korea"], ["USA", "United States"]]) {
    if (!zoneImg.has(alias) && zoneImg.has(canon)) zoneImg.set(alias, zoneImg.get(canon));
    if (!pinOf.has(alias) && pinOf.has(canon)) pinOf.set(alias, pinOf.get(canon));
  }

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };

  const items = [];
  (WBK.rides || []).forEach((r) => items.push({
    cat: "rides", group: "RECORD-BREAKING RIDES", name: r.name,
    img: "img/rides/" + r.img, kind: r.kind,
    meta: [["bolt", r.kind], ["heat", ["Gentle", "Lively", "Full throttle"][(HEAT[r.kind] || 2) - 1]]],
  }));
  (WBK.parkExperiences || []).forEach((p) => p.items.forEach((n) => items.push({
    cat: "rides", group: "EXPERIENCES BY ZONE", name: n, zone: p.zone,
    img: zoneImg.get(p.zone), meta: [["pin", p.zone]],
  })));
  (WBK.restaurants || []).forEach((r) => items.push({
    cat: "dining", group: "PLACES TO EAT", name: r.name, zone: r.zone,
    img: "img/zones/" + r.img,
    meta: [["pin", r.zone], ["price", "from SAR " + r.from]],
  }));
  (WBK.showsByZone || []).forEach((s) => s.items.forEach((it) => items.push({
    cat: "shows", group: "TONIGHT'S SHOWS", name: it.n, zone: s.zone,
    img: zoneImg.get(s.zone),
    meta: [["pin", s.zone], ["time", `${it.t} ${it.ap}`], ["bolt", it.ty]],
  })));
  pins.forEach((p, i) => {
    const key = keyOf(p);
    const nExp = (expByZone.get(key) || []).length;
    const nEat = (WBK.restaurants || []).filter((r) => r.zone === key).length;
    const nShow = (WBK.showsByZone || []).filter((s) => s.zone === key)
      .reduce((n, s) => n + s.items.length, 0);
    // only count what the zone actually has — the official sheet lists
    // experiences for ten zones, so zeros everywhere else would read as broken
    const bits = [];
    if (nExp) bits.push(`${nExp} experience${nExp > 1 ? "s" : ""}`);
    if (nEat) bits.push(`${nEat} to eat`);
    if (nShow) bits.push(`${nShow} show${nShow > 1 ? "s" : ""}`);
    items.push({
      cat: "zones", group: p.gate ? "GATES" : "ZONES", name: p.gate ? p.label : key,
      zone: key, img: zoneImg.get(key), pin: i,
      meta: [["pin", p.gate ? "Park entrance" : bits.join(" · ") || "Walk-through zone"]],
    });
  });

  // the pins interleave gates among zones, so settle the groups into a fixed
  // order — otherwise a heading repeats every time the list crosses back
  const GROUPS = ["RECORD-BREAKING RIDES", "EXPERIENCES BY ZONE", "PLACES TO EAT",
                  "TONIGHT'S SHOWS", "ZONES", "GATES"];
  items.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));

  const ICON = {
    pin: "M8 1.6a4.2 4.2 0 0 0-4.2 4.2c0 3 4.2 8.6 4.2 8.6s4.2-5.6 4.2-8.6A4.2 4.2 0 0 0 8 1.6zm0 5.9a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z",
    bolt: "M9.2 1 3.4 9h3.3l-.9 6 5.8-8.4H8.3z",
    time: "M8 1.4a6.6 6.6 0 1 0 0 13.2A6.6 6.6 0 0 0 8 1.4zm.7 7.1H5.9V7.2h1.6V4h1.2z",
    price: "M8 1.4 9.9 6h4.7l-3.8 2.9 1.4 4.7L8 10.8l-4.2 2.8 1.4-4.7L1.4 6h4.7z",
    heat: "M8 1.2s3.6 3.1 3.6 6.6a3.6 3.6 0 1 1-7.2 0C4.4 4.3 8 1.2 8 1.2z",
  };
  const svg = (k) => `<svg class="rm-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="${ICON[k] || ICON.pin}"/></svg>`;

  function render() {
    const cat = document.querySelector(".pp-chip.on")?.dataset.cat || "rides";
    const q = (document.getElementById("pp-q")?.value || "").trim().toLowerCase();
    const hits = items.filter((it) =>
      it.cat === cat &&
      (!q || it.name.toLowerCase().includes(q) || (it.zone || "").toLowerCase().includes(q)));

    if (!hits.length) {
      listEl.innerHTML = `<p class="pp-empty">Nothing matches “${q}”.</p>`;
      return;
    }

    let html = "", group = null, n = 0;
    for (const it of hits) {
      if (it.group !== group) {
        group = it.group;
        html += `<h4 class="pp-group">${group}</h4>`;
      }
      const pi = it.pin !== undefined ? it.pin : (it.zone !== undefined ? pinOf.get(it.zone) : undefined);
      html += `
        <button class="pp-row" type="button" data-pin="${pi === undefined ? "" : pi}" data-n="${n++}">
          <span class="rm-shot">${it.img ? `<img src="${it.img}" alt="" loading="lazy">` : ""}</span>
          <span class="rm-text">
            <b>${it.name}</b>
            <span class="rm-meta">${it.meta.map(([k, v]) => `<span>${svg(k)}${v}</span>`).join("")}</span>
          </span>
        </button>`;
    }
    listEl.innerHTML = html;

    listEl.querySelectorAll(".pp-row").forEach((row) => {
      row.addEventListener("click", () => {
        listEl.querySelectorAll(".pp-row").forEach((r) => r.classList.remove("on"));
        row.classList.add("on");
        const pi = row.dataset.pin;
        if (pi !== "") select(Number(pi), 2.4);      // fly the map to its zone
      });
    });
  }

  /* ── panel controls ─────────────────────────────────────────────── */
  document.querySelectorAll(".pp-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".pp-chip").forEach((c) => c.classList.remove("on"));
      chip.classList.add("on");
      render();
      listEl.scrollTop = 0;
      // dim the pins that have nothing in the chosen category
      const cat = chip.dataset.cat;
      nodes.forEach((nd, i) => {
        const key = keyOf(pins[i]);
        const keep = cat === "zones"
          || (cat === "dining" && (WBK.restaurants || []).some((r) => r.zone === key))
          || (cat === "rides" && (expByZone.get(key) || []).length)
          || (cat === "shows" && (WBK.showsByZone || []).some((s) => s.zone === key));
        nd.classList.toggle("muted", !keep);
      });
    });
  });

  const q = document.getElementById("pp-q");
  q?.addEventListener("input", () => { render(); listEl.scrollTop = 0; });

  const mapBtn = document.getElementById("pp-map");
  const listBtn = document.getElementById("pp-listview");
  const searchBtn = document.getElementById("pp-searchbtn");
  function mode(m) {
    panel.classList.toggle("as-list", m === "list");
    mapBtn?.setAttribute("aria-pressed", String(m === "map"));
    listBtn?.setAttribute("aria-pressed", String(m === "list"));
    mapBtn?.classList.toggle("on", m === "map");
    listBtn?.classList.toggle("on", m === "list");
  }
  mapBtn?.addEventListener("click", () => mode("map"));
  listBtn?.addEventListener("click", () => mode("list"));
  searchBtn?.addEventListener("click", () => {
    panel.classList.toggle("searching");
    searchBtn.classList.toggle("on", panel.classList.contains("searching"));
    searchBtn.setAttribute("aria-pressed", String(panel.classList.contains("searching")));
    if (panel.classList.contains("searching")) q?.focus();
    else if (q) { q.value = ""; render(); }
  });

  /* ── pan: pointer drag, only meaningful once zoomed ─────────────── */
  let drag = null;
  frame.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".pm-pin, .pm-zoom, .pm-status")) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, tx, ty, moved: 0 };
    frame.setPointerCapture(e.pointerId);
    frame.classList.add("dragging");
  });
  frame.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
    tx = drag.tx + dx; ty = drag.ty + dy;
    apply();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    frame.classList.remove("dragging");
    drag = null;
  };
  frame.addEventListener("pointerup", endDrag);
  frame.addEventListener("pointercancel", endDrag);

  // double-click / double-tap toggles a close look at that spot
  frame.addEventListener("dblclick", (e) => {
    if (e.target.closest(".pm-pin")) return;
    const r = frame.getBoundingClientRect();
    if (z > 1.4) { z = 1; tx = ty = 0; apply(); }
    else zoomAt(2.6, e.clientX - r.left, e.clientY - r.top);
  });

  // The page owns the wheel — trapping the scroll here would strand the
  // reader mid-section. Ctrl/⌘ + wheel (and pinch, which browsers report
  // the same way) zooms instead.
  frame.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = frame.getBoundingClientRect();
    zoomAt(z * (e.deltaY < 0 ? 1.12 : 0.89), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  document.getElementById("pm-in")?.addEventListener("click", () => zoomCentre(z * 1.5));
  document.getElementById("pm-out")?.addEventListener("click", () => zoomCentre(z / 1.5));
  document.getElementById("pm-reset")?.addEventListener("click", () => {
    z = 1; tx = ty = 0; apply();
    nodes.forEach((n) => n.classList.remove("on"));
    listEl.querySelectorAll(".pp-row.on").forEach((r) => r.classList.remove("on"));
  });

  addEventListener("resize", apply);
  render();
  apply();
})();
