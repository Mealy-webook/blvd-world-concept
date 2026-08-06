// ── the mini map's counts, on the home page under the zones ────────────────
// The module itself is a static picture — the artwork names every zone in print,
// so there is nothing to pin, hover or click. The only thing worth computing is
// how much of it there is, and that is counted from the same WBK.mapPins the full
// map page reads. Typed into the copy it would be a second version of the truth,
// and it would be wrong the first time a zone was added.
(function () {
  const out = document.getElementById("mm-count");
  if (!out || !window.WBK || !Array.isArray(WBK.mapPins)) return;

  const pins = WBK.mapPins;
  const zones = pins.filter((p) => !p.gate).length;
  const gates = pins.filter((p) => p.gate).length;

  out.innerHTML =
    `<b>${zones}</b> zones <i aria-hidden="true">&#183;</i> <b>${gates}</b> gates`;
})();
