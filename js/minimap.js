// ── the mini map's counts, on the home page under the zones ────────────────
// The module itself is a static picture — the artwork names every zone in print,
// so there is nothing to pin, hover or click. The only thing worth computing is
// how much of it there is, and that is counted from the same WBK.mapPins the full
// map page reads. Typed into the copy it would be a second version of the truth,
// and it would be wrong the first time a zone was added.
(function () {
  const out = document.getElementById("mm-count");
  if (!out || !window.WBK || !Array.isArray(WBK.mapPins)) return;

  /* The client's table of minimum points of interest, rather than a count of the
     pins we happen to have drawn. Both are true of different things — the pins are
     what is on the artwork, the table is what the map has to carry — and under a
     picture of the park the brief is the more useful of the two.

     Quoted from WBK.mapSpec so the numbers live with the rest of the data; nothing
     here is typed into the markup. */
  const spec = WBK.mapSpec || [];
  if (!spec.length) return;

  out.innerHTML = spec
    .map((s) => `<span><b>${s.n}</b> ${s.l}</span>`)
    .join('<i aria-hidden="true">&#183;</i>');

})();
