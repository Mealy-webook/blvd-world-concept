// ── the glass tiles' specular sweep ──
// A pane of glass gives away that it is glass by the way its highlight travels
// when you move past it. The blur, the rim and the sheen gradient are all CSS;
// this only writes where the highlight sits, as --mx/--my on the tile the
// pointer is over. One listener on the row, not three on the tiles.
//
// It does nothing on a touch device or under reduced motion: with no pointer to
// follow, the CSS default rests the highlight off the top-left corner and the
// pane simply reads as lit from up there.
(function () {
  const row = document.querySelector(".book-tiles");
  if (!row) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let queued = null;

  row.addEventListener("pointermove", (e) => {
    const tile = e.target.closest(".bt");
    if (!tile) return;
    if (queued) return;                            // one write per frame
    queued = requestAnimationFrame(() => {
      queued = null;
      const b = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", (((e.clientX - b.left) / b.width) * 100).toFixed(1) + "%");
      tile.style.setProperty("--my", (((e.clientY - b.top) / b.height) * 100).toFixed(1) + "%");
    });
  });

  // hand the highlight back to its resting corner
  row.addEventListener("pointerout", (e) => {
    const tile = e.target.closest(".bt");
    if (!tile || tile.contains(e.relatedTarget)) return;
    tile.style.removeProperty("--mx");
    tile.style.removeProperty("--my");
  });
})();
