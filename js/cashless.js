// ── the BLVD card: tilts to the pointer, layers lifting on Z ──
// CSS holds the idle float; this takes over while a pointer is on the stage,
// writing rotation, sheen and glare as custom properties. The top-up chips
// drive the balance printed on the card, and tapping the card plays a ring.
(function () {
  const stage = document.getElementById("card-stage");
  const card = document.getElementById("blvd-card");
  if (!stage || !card) return;

  const MAX = 15;               // degrees of tilt at the far edge
  let raf = null, tx = 0, ty = 0;

  function write() {
    raf = null;
    card.style.setProperty("--rx", ty.toFixed(2) + "deg");
    card.style.setProperty("--ry", tx.toFixed(2) + "deg");
  }

  stage.addEventListener("pointermove", (e) => {
    const b = card.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width;      // 0 → 1 across the card
    const py = (e.clientY - b.top) / b.height;
    tx = (px - 0.5) * MAX * 2;
    ty = (0.5 - py) * MAX * 1.4;
    card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    // the glare rides the pointer twice as far, so it reads as a hard reflection
    card.style.setProperty("--glare", (px * 130 - 65).toFixed(1) + "%");
    card.style.animation = "none";                  // hand over from the float
    if (!raf) raf = requestAnimationFrame(write);
  });

  stage.addEventListener("pointerleave", () => {
    for (const p of ["--rx", "--ry", "--mx", "--my", "--glare"]) card.style.removeProperty(p);
    card.style.animation = "";                      // let the float resume
  });

  /* ── top-up: the chips run the balance up on the card itself ── */
  const amount = document.getElementById("bc-amount");
  const tapNote = document.getElementById("tu-tap");
  let balance = parseInt(amount.textContent, 10) || 0;
  let counting = null;

  function runTo(target) {
    cancelAnimationFrame(counting);
    const from = balance, delta = target - from, t0 = performance.now();
    amount.classList.add("bump");
    (function step(now) {
      const p = Math.min(1, (now - t0) / 550);
      const e = 1 - Math.pow(1 - p, 3);             // ease out
      amount.textContent = Math.round(from + delta * e);
      if (p < 1) counting = requestAnimationFrame(step);
      else {
        balance = target;
        setTimeout(() => amount.classList.remove("bump"), 260);
      }
    })(performance.now());
  }

  document.querySelectorAll(".tu-chip").forEach((chip) => {
    chip.addEventListener("click", () => runTo(balance + Number(chip.dataset.add)));
  });

  // tapping the card spends a play: ring out of the chip, balance down
  card.addEventListener("click", () => {
    if (balance < 25) { tapNote.textContent = "TOP UP TO PLAY"; return; }
    card.classList.remove("tapped");
    void card.offsetWidth;                          // restart the ring animation
    card.classList.add("tapped");
    tapNote.textContent = "− SAR 25 · RIDE UNLOCKED";
    tapNote.classList.add("on");
    runTo(balance - 25);
    setTimeout(() => {
      card.classList.remove("tapped");
      tapNote.textContent = "TAP TO PLAY";
      tapNote.classList.remove("on");
    }, 1600);
  });
})();
