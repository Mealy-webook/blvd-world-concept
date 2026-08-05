// ── the park map, laid out like the Six Flags Qiddiya park-map page ────
// The artwork is the page. Everything else floats over it: a title that turns
// into a result count, a map/list switch, category chips that stand alone once
// chosen, and a badge on every zone carrying how many things of the chosen kind
// are in it. Picking a badge zooms to that zone and narrows the list to it.
(() => {
  const frame = document.getElementById("pm-frame");
  if (!frame || !window.WBK) return;

  const stage = document.getElementById("pm-stage");
  const pinLayer = document.getElementById("pm-pins");
  const hint = document.getElementById("pm-hint");
  const panel = document.getElementById("pm-panel");
  const listEl = document.getElementById("pp-list");
  const titleEl = document.getElementById("pb-title");
  const countEl = document.getElementById("pb-count");
  const sortBtn = document.getElementById("pp-sort");
  const sortLabel = document.getElementById("pp-sort-label");
  const zoneChip = document.getElementById("pp-zonechip");
  const pins = WBK.mapPins || [];

  const MIN = 1, MAX = 4.6;
  const ART = 3855 / 2110;            // the map artwork's aspect ratio
  let z = 1, tx = 0, ty = 0;          // scale + translate, in frame pixels
  let baseW = 0, baseH = 0;           // the stage's untransformed size

  /* ── what the page is showing ──
     `cat` is the chosen category, or null for the park as a whole.
     `zone` is the zone whose badge was picked, or null for all of it. */
  let cat = null, zone = null, sortAZ = false;

  // The map lives beside the card, never behind it: this is the strip of frame
  // the card leaves free — to its right on a wide screen, above it once the card
  // becomes a bottom sheet.
  let avX = 0, avY = 0, avW = 0, avH = 0;
  function measureFree() {
    const r = frame.getBoundingClientRect();
    avX = 0; avY = 0; avW = r.width; avH = r.height;
    if (!panel) return;
    const p = panel.getBoundingClientRect();
    const GAP = 14;
    if (innerWidth > 900) {
      avX = Math.max(0, p.right - r.left + GAP);
      avW = Math.max(120, r.width - avX);
    } else {
      avH = Math.max(120, p.top - r.top - GAP);
    }
  }

  // Fit the whole plan inside that strip, at the artwork's own ratio, so at rest
  // nothing is cropped and nothing is hidden. Badges are positioned in
  // percentages of the stage, so keeping the stage the art's shape is what keeps
  // every badge over its zone.
  function sizeStage() {
    const r = frame.getBoundingClientRect();
    if (!r.width || !r.height) return;
    measureFree();
    baseW = avW; baseH = avW / ART;
    if (baseH > avH) { baseH = avH; baseW = avH * ART; }
    stage.style.width = baseW + "px";
    stage.style.height = baseH + "px";
    stage.style.left = avX + (avW - baseW) / 2 + "px";
    stage.style.top = avY + (avH - baseH) / 2 + "px";
  }

  /* ── view transform ─────────────────────────────────────────────── */
  // At z = 1 the whole plan is in view, so panning is clamped to the slack the
  // zoom creates — the map can never drift out of the strip it lives in.
  function clamp() {
    const slackX = Math.max(0, (baseW * z - avW) / 2);
    const slackY = Math.max(0, (baseH * z - avH) / 2);
    tx = Math.max(-slackX, Math.min(slackX, tx));
    ty = Math.max(-slackY, Math.min(slackY, ty));
  }

  function apply() {
    clamp();
    placePois();
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
    focus = null;                        // zooming by hand releases the hold
    nz = Math.max(MIN, Math.min(MAX, nz));
    const cx = px - (avX + avW / 2), cy = py - (avY + avH / 2);
    const k = nz / z;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    z = nz;
    apply();
  }
  const zoomCentre = (nz) => zoomAt(nz, avX + avW / 2, avY + avH / 2);

  // Bring a zone into the middle of the strip the map lives in. The target is
  // held rather than turned into pixels once: rendering the card can resize it,
  // which resizes the strip and the stage under it, and a translation worked out
  // against the old stage would leave the zone off to one side.
  let focus = null;                    // { i, z } — the zone the view is held on
  function frameZone(i, nz) {
    focus = { i, z: Math.max(nz || 2.4, MIN) };
    reframe();
  }
  function reframe() {
    if (!focus) return;
    const pin = pins[focus.i];
    if (!pin) return;
    z = focus.z;
    tx = -(pin.x / 100 - 0.5) * baseW * z;
    ty = -(pin.y / 100 - 0.5) * baseH * z;
    apply();
  }

  /* ── the park's contents, one row shape ─────────────────────────── */
  const expByZone = new Map((WBK.parkExperiences || []).map((p) => [p.zone, p.items]));

  // the label as printed on the map, in the casing the rest of the site uses
  const keyOf = (pin) =>
    pin.label === "THE PLANET" ? "The Planet"
      : pin.label === "WARZONE" ? "Warzone"
        : pin.label === "PIER" ? "Pier"
          : pin.zone || pin.label.charAt(0) + pin.label.slice(1).toLowerCase();

  // a zone-name → photo lookup, so every row can carry a thumbnail
  const zoneImg = new Map();
  for (const p of WBK.parkExperiences || []) if (p.img) zoneImg.set(p.zone, "img/zones/" + p.img);
  for (const r of WBK.restaurants || []) if (!zoneImg.has(r.zone)) zoneImg.set(r.zone, "img/zones/" + r.img);
  for (const zn of WBK.zones || []) if (!zoneImg.has(zn.name) && zn.imgs?.length) zoneImg.set(zn.name, "img/zones/" + zn.imgs[0]);
  for (const pin of pins) {
    const k = keyOf(pin);
    if (!zoneImg.has(k) && pin.extra?.imgs?.length) zoneImg.set(k, "img/zones/" + pin.extra.imgs[0]);
  }
  const pinOf = new Map(pins.map((p, i) => [keyOf(p), i]));
  const toneOf = new Map(pins.map((p) => [keyOf(p), p.tone]));

  // the shows sheet names two zones its own way; alias them so those rows still
  // get a thumbnail and still fly the map to the right zone
  for (const [alias, canon] of [["Korea", "South Korea"], ["USA", "United States"]]) {
    if (!zoneImg.has(alias) && zoneImg.has(canon)) zoneImg.set(alias, zoneImg.get(canon));
    if (!pinOf.has(alias) && pinOf.has(canon)) pinOf.set(alias, pinOf.get(canon));
  }

  const HEAT = { THRILL: 3, AERIAL: 3, ADVENTURE: 2, "FAMILY SWING": 2, FAMILY: 1, SCENIC: 1 };

  const items = [];
  (WBK.rides || []).forEach((r) => items.push({
    cat: "rides", group: "RECORD-BREAKING RIDES", name: r.name,
    img: "img/rides/" + r.img,
    meta: [["bolt", r.kind], ["heat", ["Gentle", "Lively", "Full throttle"][(HEAT[r.kind] || 2) - 1]]],
  }));
  (WBK.parkExperiences || []).forEach((p) => p.items.forEach((n) => items.push({
    cat: "rides", group: "ATTRACTIONS & EXPERIENCES", name: n, zone: p.zone,
    img: zoneImg.get(p.zone), meta: [["pin", p.zone]],
  })));
  (WBK.restaurants || []).forEach((r) => items.push({
    cat: "dining", group: "PLACES TO EAT", name: r.name, zone: r.zone,
    img: "img/zones/" + r.img, desc: r.desc,
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
    const bits = [];
    if (nExp) bits.push(`${nExp} experience${nExp > 1 ? "s" : ""}`);
    if (nEat) bits.push(`${nEat} to eat`);
    if (nShow) bits.push(`${nShow} show${nShow > 1 ? "s" : ""}`);
    items.push({
      cat: "zones", group: p.gate ? "GATES" : "ZONES", name: p.gate ? p.label : key,
      zone: key, img: zoneImg.get(key), pin: i, desc: p.extra?.blurb,
      meta: [["pin", p.gate ? "Park entrance" : bits.join(" · ") || "Walk-through zone"]],
    });
  });

  // fixed group order, so a heading never repeats as the list crosses back
  const GROUPS = ["RECORD-BREAKING RIDES", "ATTRACTIONS & EXPERIENCES", "PLACES TO EAT",
                  "TONIGHT'S SHOWS", "ZONES", "GATES"];
  items.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));

  /* ── zone badges: a count per zone, in the zone's own colour ─────── */
  // how many things of the chosen kind a zone holds. With no category chosen
  // it's everything the sheets list for that zone, which is what the reference
  // page shows at rest.
  function countIn(key, which) {
    const nExp = (expByZone.get(key) || []).length;
    const nEat = (WBK.restaurants || []).filter((r) => r.zone === key).length;
    const nShow = (WBK.showsByZone || []).filter((s) => s.zone === key)
      .reduce((n, s) => n + s.items.length, 0);
    if (which === "rides") return nExp;
    if (which === "dining") return nEat;
    if (which === "shows") return nShow;
    if (which === "zones") return 1;
    return nExp + nEat + nShow;
  }

  const nodes = pins.map((pin, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pm-badge" + (pin.gate ? " is-gate" : "");
    b.style.setProperty("--x", pin.x + "%");
    b.style.setProperty("--y", pin.y + "%");
    b.style.setProperty("--tone", pin.tone);
    b.dataset.i = i;
    b.innerHTML = `<b class="pb-n"></b><span class="pb-name">${pin.label}</span>`;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      select(i, 2.4);
    });
    pinLayer.appendChild(b);
    return b;
  });

  // singular/plural for what a badge is counting
  const NOUN = {
    all: ["thing to do", "things to do"],
    rides: ["attraction", "attractions"],
    dining: ["place to eat", "places to eat"],
    shows: ["show", "shows"],
    zones: ["zone", "zones"],
  };

  function paintBadges() {
    nodes.forEach((nd, i) => {
      const key = keyOf(pins[i]);
      const n = pins[i].gate ? 0 : countIn(key, cat);
      nd.querySelector(".pb-n").textContent = pins[i].gate ? "◇" : n;
      nd.setAttribute("aria-label", pins[i].gate
        ? pins[i].label
        : `${key} — ${n} ${NOUN[cat || "all"][n === 1 ? 0 : 1]}, zoom in`);
      // a zone with nothing of the chosen kind steps back rather than vanishing
      nd.classList.toggle("empty", !pins[i].gate && n === 0);
      // inside a zone, every other badge leaves the map so the zone has it alone
      nd.classList.toggle("away", !!zone && key !== zone);
      nd.classList.toggle("on", !!zone && key === zone);
    });
  }

  /* ── inside a zone: its own things, pinned on the artwork ─────────
     The reference drops the land badges once you are in a land and shows one
     pin per place. BLVD's sheets carry no coordinate for any single place —
     only the 26 zone anchors — so these are ARRANGED around the zone's anchor
     rather than surveyed: even spacing, no claim about where a thing really is.
     Feed real x/y per item and the layout function is all that changes. */
  const CAT_ICON = { rides: "heat", dining: "fork", shows: "time", zones: "pin" };

  // An even spread around a point (phyllotaxis). The radius is reckoned in
  // screen pixels — pins counter-scale with the zoom, so a radius in stage
  // percent would crowd them at one zoom and fling them apart at another — and
  // then converted to stage percent. x is divided by the artwork's ratio so the
  // ring reads as a circle rather than an ellipse.
  const GOLDEN = 2.399963229728653;
  function spread(n, cx, cy) {
    // ~34px between neighbours, which clears a 26px pin head with room to spare
    const R = 20 * Math.sqrt(n) + 14;
    const rvMax = (R * 100) / Math.max(1, baseH * z);
    return Array.from({ length: n }, (_, k) => {
      const t = GOLDEN * k, rv = rvMax * Math.sqrt((k + 0.55) / n);
      return { x: cx + (rv / ART) * Math.cos(t), y: cy + rv * Math.sin(t) };
    });
  }

  // re-seat the existing pins without rebuilding them, for when the zoom or the
  // strip changes under them
  let lastPlaceZ = 0;
  function placePois(force) {
    if (!poiNodes.length || !zone) return;
    // the layout only depends on the zoom, so panning doesn't need to redo it
    if (!force && Math.abs(z - lastPlaceZ) < 0.001) return;
    lastPlaceZ = z;
    const anchor = pins[pinOf.get(zone)];
    if (!anchor) return;
    const at = spread(poiNodes.length, anchor.x, anchor.y);
    poiNodes.forEach((n, k) => {
      n.style.setProperty("--x", at[k].x + "%");
      n.style.setProperty("--y", at[k].y + "%");
    });
  }

  let poiNodes = [];
  function renderPois(list) {
    poiNodes.forEach((n) => n.remove());
    poiNodes = [];
    if (!zone) return;
    const anchor = pins[pinOf.get(zone)];
    if (!anchor) return;
    poiNodes = list.map((it, k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pm-poi";
      b.style.setProperty("--tone", toneOf.get(zone) || "#ffc24d");
      b.dataset.k = k;
      b.setAttribute("aria-label", `${it.name} — ${zone}`);
      b.innerHTML = `<span class="poi-head">${svg(CAT_ICON[it.cat] || "pin")}</span>` +
                    `<span class="poi-tag">${it.name}</span>`;
      b.addEventListener("click", (e) => { e.stopPropagation(); focusRow(k); });
      pinLayer.appendChild(b);
      return b;
    });
    placePois(true);
  }

  // pin and row are two views of the same thing: picking either lights both
  function focusRow(k) {
    poiNodes.forEach((n, i) => n.classList.toggle("on", i === k));
    const rows = [...listEl.querySelectorAll(".pp-row")];
    rows.forEach((r, i) => r.classList.toggle("on", i === k));
    const row = rows[k];
    if (!row) return;
    const delta = row.getBoundingClientRect().top - listEl.getBoundingClientRect().top;
    listEl.scrollTo({
      top: Math.max(0, listEl.scrollTop + delta - (listEl.clientHeight - row.offsetHeight) / 2),
      behavior: "smooth",
    });
  }

  /* ── the list ───────────────────────────────────────────────────── */
  const ICON = {
    pin: "M8 1.6a4.2 4.2 0 0 0-4.2 4.2c0 3 4.2 8.6 4.2 8.6s4.2-5.6 4.2-8.6A4.2 4.2 0 0 0 8 1.6zm0 5.9a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6z",
    bolt: "M9.2 1 3.4 9h3.3l-.9 6 5.8-8.4H8.3z",
    time: "M8 1.4a6.6 6.6 0 1 0 0 13.2A6.6 6.6 0 0 0 8 1.4zm.7 7.1H5.9V7.2h1.6V4h1.2z",
    price: "M8 1.4 9.9 6h4.7l-3.8 2.9 1.4 4.7L8 10.8l-4.2 2.8 1.4-4.7L1.4 6h4.7z",
    heat: "M8 1.2s3.6 3.1 3.6 6.6a3.6 3.6 0 1 1-7.2 0C4.4 4.3 8 1.2 8 1.2z",
    fork: "M4 1.5v5a2 2 0 0 0 1.3 1.9V14.5h1.4V8.4A2 2 0 0 0 8 6.5v-5H6.7v4H6v-4H4.7v4H4zm7 0c-1 0-1.8 1.3-1.8 3 0 1.3.5 2.4 1.2 2.8v7.2h1.4V7.3c.7-.4 1.2-1.5 1.2-2.8 0-1.7-.8-3-1.8-3z",
  };
  const svg = (k) => `<svg class="rm-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="${ICON[k] || ICON.pin}"/></svg>`;

  function hits() {
    const q = (document.getElementById("pp-q")?.value || "").trim().toLowerCase();
    let out = items.filter((it) =>
      (!cat || it.cat === cat) &&
      (!zone || it.zone === zone) &&
      (!q || it.name.toLowerCase().includes(q) || (it.zone || "").toLowerCase().includes(q)));
    if (zone) out = out.filter((it) => it.cat !== "zones");   // don't list the zone inside itself
    if (sortAZ) out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }

  function render() {
    const list = hits();

    // Inside a zone the card takes the zone's name and counts its locations, as
    // the reference does. Otherwise the title gives way to a result count the
    // moment anything is filtered.
    const q = document.getElementById("pp-q")?.value.trim();
    const filtered = !!(cat || zone || q);
    if (titleEl) {
      titleEl.hidden = filtered && !zone;
      if (zone) titleEl.textContent = zone;
      else if (!filtered) titleEl.textContent = "Discover the park";
    }
    if (countEl) {
      countEl.hidden = !filtered;
      countEl.classList.toggle("as-sub", !!zone);
      countEl.querySelector("b").textContent = list.length;
      countEl.querySelector("span").textContent = zone
        ? (list.length === 1 ? "location" : "locations")
        : (list.length === 1 ? "result" : "results");
    }
    if (sortBtn) sortBtn.hidden = !filtered;
    panel?.classList.toggle("has-cat", !!cat);
    panel?.classList.toggle("in-zone", !!zone);
    if (zoneChip) {
      zoneChip.hidden = !zone;
      if (zone) zoneChip.querySelector("span").textContent = zone;
    }

    renderPois(list);

    if (!list.length) {
      listEl.innerHTML = `<p class="pp-empty">${q
        ? `Nothing in ${zone || "the park"} matches “${q}”.`
        : `No attractions, kitchens or shows are listed for ${zone || "this filter"} yet.`}</p>`;
      return;
    }

    let html = "", group = null;
    for (const it of list) {
      if (!sortAZ && it.group !== group) {
        group = it.group;
        html += `<h4 class="pp-group">${group}</h4>`;
      }
      const pi = it.pin !== undefined ? it.pin : (it.zone !== undefined ? pinOf.get(it.zone) : undefined);
      const tone = it.zone ? toneOf.get(it.zone) : null;
      html += `
        <button class="pp-row" type="button" data-pin="${pi === undefined ? "" : pi}">
          <span class="rm-shot">${it.img ? `<img src="${it.img}" alt="" loading="lazy">` : ""}</span>
          <span class="rm-text">
            <b>${it.name}</b>
            <span class="rm-meta">${it.meta.map(([k, v], n) =>
              `<span${n === 0 && tone ? ` style="--tone:${tone}"` : ""}>${svg(k)}${v}</span>`).join("")}</span>
            ${it.desc ? `<span class="rm-desc">${it.desc}</span>` : ""}
            ${pi === undefined ? "" : `<span class="rm-more">Show on the map</span>`}
          </span>
        </button>`;
    }
    listEl.innerHTML = html;

    listEl.querySelectorAll(".pp-row").forEach((row, k) => {
      row.addEventListener("click", () => {
        // inside a zone the row simply lights its own pin; outside it, the row
        // is a way into whichever zone the thing belongs to
        if (zone) { view("map"); focusRow(k); return; }
        listEl.querySelectorAll(".pp-row").forEach((r) => r.classList.remove("on"));
        row.classList.add("on");
        const pi = row.dataset.pin;
        if (pi !== "") {
          view("map");
          select(Number(pi), 2.4);
        }
      });
    });
  }

  // one interaction, whichever side it starts from: the badge lights up, the map
  // flies onto it, and the list narrows to that zone
  function select(i, zoom) {
    const pin = pins[i];
    nodes.forEach((n, k) => n.classList.toggle("on", k === i));
    hint?.classList.add("gone");
    if (zoom) frameZone(i, zoom);
    if (!pin.gate) {
      zone = keyOf(pin);
      paintBadges();          // the other zones step off the map
      render();
      listEl.scrollTop = 0;
    }
  }

  /* ── the control bar ────────────────────────────────────────────── */
  function view(m) {
    frame.classList.toggle("as-list", m === "list");
    // the card's width changes, so the strip the map fits into changes with it
    requestAnimationFrame(() => { sizeStage(); reframe(); apply(); });
    const mapBtn = document.getElementById("pp-map");
    const listBtn = document.getElementById("pp-listview");
    mapBtn?.classList.toggle("on", m === "map");
    listBtn?.classList.toggle("on", m === "list");
    mapBtn?.setAttribute("aria-pressed", String(m === "map"));
    listBtn?.setAttribute("aria-pressed", String(m === "list"));
  }
  document.getElementById("pp-map")?.addEventListener("click", () => view("map"));
  document.getElementById("pp-listview")?.addEventListener("click", () => view("list"));

  // a chip claims the bar: the others step aside until it's cleared
  document.querySelectorAll(".pp-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      const clearing = chip.classList.contains("on") || e.target.closest(".ch-x");
      document.querySelectorAll(".pp-chip").forEach((c) => c.classList.remove("on"));
      if (clearing) {
        cat = null;
      } else {
        cat = chip.dataset.cat;
        chip.classList.add("on");
        view("list");                       // a category is a list of things
      }
      paintBadges();
      render();
      listEl.scrollTop = 0;
    });
  });

  sortBtn?.addEventListener("click", () => {
    sortAZ = !sortAZ;
    sortBtn.classList.toggle("on", sortAZ);
    if (sortLabel) sortLabel.textContent = sortAZ ? "Sort · A–Z" : "Sort · Grouped";
    render();
    listEl.scrollTop = 0;
  });

  // the zone chip's cross puts the whole park back
  function clearZone() {
    zone = null; focus = null;
    nodes.forEach((n) => n.classList.remove("on"));
    z = 1; tx = ty = 0; apply();
    paintBadges();
    render();
    listEl.scrollTop = 0;
  }
  zoneChip?.addEventListener("click", clearZone);

  const q = document.getElementById("pp-q");
  q?.addEventListener("input", () => { render(); listEl.scrollTop = 0; });

  const searchBtn = document.getElementById("pp-searchbtn");
  searchBtn?.addEventListener("click", () => {
    const on = !panel.classList.contains("searching");
    panel.classList.toggle("searching", on);
    searchBtn.classList.toggle("on", on);
    searchBtn.setAttribute("aria-pressed", String(on));
    if (on) q?.focus();
    else if (q) { q.value = ""; render(); }
  });

  /* ── pan: pointer drag, only meaningful once zoomed ─────────────── */
  let drag = null;
  frame.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".pm-badge, .pm-zoom, .pm-status, .pm-panel")) return;
    focus = null;                      // panning by hand releases the hold
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
    if (e.target.closest(".pm-badge, .pm-panel")) return;
    const r = frame.getBoundingClientRect();
    if (z > 1.4) { z = 1; tx = ty = 0; apply(); }
    else zoomAt(2.6, e.clientX - r.left, e.clientY - r.top);
  });

  // Ctrl/⌘ + wheel (and pinch, which browsers report the same way) zooms.
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
    cat = null;
    document.querySelectorAll(".pp-chip").forEach((c) => c.classList.remove("on"));
    view("map");
    clearZone();
  });

  addEventListener("resize", () => { sizeStage(); reframe(); apply(); });
  // the view starts hidden, so re-measure once it has real dimensions; the card
  // is watched too, since its size decides how much room the map gets
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { sizeStage(); reframe(); apply(); });
    ro.observe(frame);
    if (panel) ro.observe(panel);
  }
  paintBadges();
  render();
  sizeStage();
  apply();

  // a plate on the home page links to #/map?zone=Egypt — open on that zone, and
  // keep answering later links while the route is already up
  function fromHash() {
    const m = location.hash.match(/[?&]zone=([^&]+)/);
    if (!m) return;
    const want = decodeURIComponent(m[1]);
    const i = pinOf.has(want) ? pinOf.get(want) : pins.findIndex((p) => keyOf(p) === want);
    if (i >= 0) requestAnimationFrame(() => select(i, 2.4));
  }
  addEventListener("hashchange", fromHash);
  fromHash();
})();
