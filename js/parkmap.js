// ── the park map: the official plan, made pannable and clickable ──────
// Pins are positioned in percentages of the artwork and live inside the same
// transformed layer as the image, so they stay glued to their zone at any
// zoom. Only their inner content is counter-scaled, keeping tags legible.
(() => {
  const frame = document.getElementById("pm-frame");
  if (!frame || !window.WBK) return;

  const stage = document.getElementById("pm-stage");
  const pinLayer = document.getElementById("pm-pins");
  const hint = document.getElementById("pm-hint");
  const pins = WBK.mapPins || [];

  const MIN = 1, MAX = 4.6;
  let z = 1, tx = 0, ty = 0;          // scale + translate, in frame pixels

  // ── view transform ────────────────────────────────────────────────
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

  // ── pins ──────────────────────────────────────────────────────────
  const byName = new Map((WBK.zones || []).map((zn, i) => [zn.name, i]));
  const expByZone = new Map((WBK.parkExperiences || []).map((p) => [p.zone, p.items]));

  // A pin without its own WBK.zones entry still gets a full drawer: the
  // official per-zone experience list and this site's dining entries are
  // stitched into a zone-shaped object.
  function synth(pin) {
    const label = pin.label.replace("KSA 1", "West Gate · KSA 1").replace("KSA 2", "North Gate · KSA 2");
    const pretty = pin.gate ? label : pin.label.charAt(0) + pin.label.slice(1).toLowerCase();
    const key = pin.label === "THE PLANET" ? "The Planet"
      : pin.label === "WARZONE" ? "Warzone"
      : pin.label === "PIER" ? "Pier" : pretty;
    const food = (WBK.restaurants || []).filter((r) => r.zone === key).map((r) => r.name);
    return {
      name: pin.gate ? pretty : key,
      blurb: pin.extra?.blurb || "",
      imgs: pin.extra?.imgs || [],
      attractions: expByZone.get(key) || [],
      food,
      rides: [],
    };
  }

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
      select(i);
    });
    pinLayer.appendChild(b);
    return b;
  });

  function select(i) {
    const pin = pins[i];
    nodes.forEach((n, k) => n.classList.toggle("on", k === i));
    const ref = pin.zone && byName.has(pin.zone) ? byName.get(pin.zone) : synth(pin);
    window.WBK_GLOBE?.openZone?.(ref);
    hint?.classList.add("gone");
  }

  // ── filters: dim what you're not looking for ──────────────────────
  const FILTERS = {
    all: () => true,
    experiences: (p) => {
      const key = p.label === "THE PLANET" ? "The Planet" : p.label === "WARZONE" ? "Warzone"
        : p.label === "PIER" ? "Pier" : p.label.charAt(0) + p.label.slice(1).toLowerCase();
      return expByZone.has(key) || expByZone.has(p.zone || "");
    },
    dining: (p) => (WBK.restaurants || []).some((r) => r.zone === (p.zone || "")),
    gates: (p) => !!p.gate,
  };
  frame.parentElement.querySelectorAll(".pm-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      frame.parentElement.querySelectorAll(".pm-chip").forEach((c) => c.classList.remove("on"));
      chip.classList.add("on");
      const test = FILTERS[chip.dataset.f] || FILTERS.all;
      nodes.forEach((n, i) => n.classList.toggle("muted", !test(pins[i])));
    });
  });

  // ── pan: pointer drag, only meaningful once zoomed ─────────────────
  let drag = null;
  frame.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".pm-pin, .pm-zoom, .pm-legend")) return;
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
  });

  addEventListener("resize", apply);
  apply();
})();
