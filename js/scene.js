// ── neon street scene: signs, windows, wheel, starfields, parallax ──
(function () {
  // starfield on any .stars canvas in the active view
  const fields = [];
  function initStars(canvas) {
    const ctx = canvas.getContext("2d");
    const state = { canvas, ctx, stars: [] };
    function size() {
      // the page sky spans the viewport; a view's canvas spans its own box
      const w = canvas.offsetWidth || innerWidth;
      const h = canvas.offsetHeight || innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      state.stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.4 + 0.3) * devicePixelRatio,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
      }));
    }
    size();
    window.addEventListener("resize", size);
    // The page sky is measured while the loader is still the active view, so it
    // has no box yet and sizes to 0x0 — and a canvas at 0x0 draws nothing however
    // long it waits. A ResizeObserver re-sizes it the moment it gains one.
    if (window.ResizeObserver) new ResizeObserver(() => {
      if (canvas.offsetWidth && canvas.width !== canvas.offsetWidth * devicePixelRatio) size();

    }).observe(canvas);
    armMeteor(state);
    fields.push(state);
  }
  document.querySelectorAll("canvas.stars").forEach(initStars);

  /* ── shooting stars ──
     One at a time per sky, on a random interval of a few seconds. It enters near
     the top on a shallow angle, drags a streak that tapers into nothing behind a
     bright head, and fades out mid-flight rather than reaching an edge. Most fall
     to the right; a third of them go the other way, so the sky never looks
     scripted. Everything is in device pixels, like the stars. */
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function armMeteor(f) {
    f.nextMeteor = performance.now() + 4200 + Math.random() * 9000;
  }
  function spawnMeteor(f) {
    const c = f.canvas, dpr = devicePixelRatio;
    if (!c.width || !c.height) return;                 // nothing to fall through yet
    const dir = Math.random() < 0.34 ? -1 : 1;
    const a = (17 + Math.random() * 17) * Math.PI / 180;
    const len = (150 + Math.random() * 170) * dpr;
    const speed = (600 + Math.random() * 430) * dpr;   // device pixels a second
    // it starts just off the edge it travels from, in the upper part of the sky
    const x0 = dir > 0 ? -len * 0.5 + Math.random() * c.width * 0.42
                       : c.width + len * 0.5 - Math.random() * c.width * 0.42;
    f.meteor = {
      x: x0, y: c.height * (0.02 + Math.random() * 0.4),
      vx: Math.cos(a) * speed * dir, vy: Math.sin(a) * speed,
      len, life: 0.85 + Math.random() * 0.7, age: 0,
      w: (1.1 + Math.random() * 1.1) * dpr,
    };
  }
  function drawMeteor(f, dt) {
    const m = f.meteor;
    if (!m) return;
    m.age += dt;
    if (m.age >= m.life) { f.meteor = null; armMeteor(f); return; }
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    const a = Math.sin((m.age / m.life) * Math.PI);    // in and out, never a hard cut
    const h = Math.hypot(m.vx, m.vy) || 1;
    const tx = m.x - (m.vx / h) * m.len, ty = m.y - (m.vy / h) * m.len;
    const ctx = f.ctx;
    const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
    g.addColorStop(0, `rgba(230, 242, 255, ${a.toFixed(3)})`);
    g.addColorStop(0.34, `rgba(176, 212, 255, ${(a * 0.34).toFixed(3)})`);
    g.addColorStop(1, "rgba(156, 198, 255, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = g; ctx.lineWidth = m.w; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(m.x, m.y); ctx.stroke();
    ctx.fillStyle = `rgba(255, 255, 255, ${(a * 0.95).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.w * 1.15, 0, 7); ctx.fill();
    ctx.restore();
  }

  let t = 0, last = performance.now();
  function tick(now) {
    now = now || performance.now();
    // real elapsed time for the meteors, clamped so a backgrounded tab does not
    // teleport one across the sky on the frame it comes back
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    t += 0.016;
    for (const f of fields) {
      // the page sky lives on the body, so it always draws; a view's own canvas
      // only draws while that view is the active one
      if (f.canvas.id !== "stars-page" && !f.canvas.closest(".view.active")) continue;
      const { ctx, canvas, stars } = f;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const st of stars) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(st.p + t * st.s));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#cfe4ff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!REDUCED) {
        if (!f.meteor && now >= (f.nextMeteor || 0)) spawnMeteor(f);
        drawMeteor(f, dt);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // hero landmark layers from Figma (positions as % of the 1512x982 frame)
  // clipped edges of the source art are anchored past the viewport so cuts never show
  // floating props (assets go in img/props/ — hidden until real PNGs exist)
  const PROPS = [
    { file: "prop-a.png", fb: "💜", x: 8,  y: 22, sz: 84,  depth: 1.6, glow: "rgba(196,168,255,.8)", dur: 5.4 },
    { file: "prop-b.png", fb: "🎡", x: 84, y: 16, sz: 110, depth: 2.2, glow: "rgba(255,143,220,.8)", dur: 6.4 },
    { file: "prop-c.png", fb: "🎟️", x: 6,  y: 62, sz: 96,  depth: 2.8, glow: "rgba(255,217,138,.8)", dur: 5.0 },
    { file: "prop-d.png", fb: "⭐", x: 88, y: 58, sz: 78,  depth: 1.3, glow: "rgba(143,243,255,.8)", dur: 7.2 },
    { file: "prop-e.png", fb: "🌙", x: 16, y: 84, sz: 70,  depth: 2.0, glow: "rgba(143,243,255,.7)", dur: 6.0 },
    { file: "prop-f.png", fb: "🎶", x: 78, y: 82, sz: 88,  depth: 3.2, glow: "rgba(255,62,200,.7)",  dur: 4.6 },
  ];
  const propEls = [];
  // no prop artwork is shipped yet — drop the files into img/props/ (see the
  // README there) and flip this on to avoid 404s in the meantime
  const PROPS_ENABLED = false;
  const propsHolder = PROPS_ENABLED ? document.getElementById("props") : null;
  if (propsHolder) {
    for (const p of PROPS) {
      const el = document.createElement("div");
      el.className = "prop";
      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
      el.style.setProperty("--sz", p.sz + "px");
      el.style.setProperty("--glow", p.glow);
      el.style.setProperty("--dur", p.dur + "s");
      el.style.setProperty("--del", (-Math.random() * 6).toFixed(2) + "s");
      const bob = document.createElement("span");
      bob.className = "bob";
      const img = document.createElement("img");
      img.src = "img/props/" + p.file;
      img.alt = "";
      img.onerror = () => { el.remove(); };
      bob.appendChild(img);
      el.appendChild(bob);
      propsHolder.appendChild(el);
      propEls.push({ el, depth: p.depth });
    }
  }

  // The hero is a heading and three tiles on the page's own colour. There is no
  // scene left to tilt or fold — only the block itself, which lifts and fades as
  // the page scrolls past it. scrollP (0→1 over the first viewport) is written by
  // the scroll handler below.
  const heroUi = document.querySelector(".hero-ui");
  let scrollP = 0;
  if (heroUi) {
    (function fold() {
      heroUi.style.transform =
        `translate3d(0, ${(-scrollP * 90).toFixed(1)}px, 0) scale(${(1 - scrollP * 0.06).toFixed(4)})`;
      heroUi.style.opacity = String(1 - Math.min(scrollP * 1.5, 1));
      requestAnimationFrame(fold);
    })();
  }

  // ── scroll: hero hand-off + reveals + card parallax ────────
  const homeView = document.getElementById("view-home");
  const heroScene = document.getElementById("street");
  if (homeView) {
    const rail = document.querySelector("#scroll-rail i");
    const cue = document.querySelector(".scroll-cue");
    const stickyBar = document.getElementById("sticky-cta");
    const tabs = [...document.querySelectorAll("#sticky-cta [data-sec]")];

    // tabs scroll the inner container (a plain anchor jump would not work,
    // because the page scrolls inside #view-home rather than the window)
    for (const t of tabs) {
      t.addEventListener("click", (e) => {
        e.preventDefault();
        const sec = document.getElementById(t.dataset.sec);
        if (sec) homeView.scrollTo({ top: sec.offsetTop, behavior: "smooth" });
      });
    }
    const globeHolder = document.getElementById("globe-holder");
    let ticking = false;

    function onScroll() {
      const y = homeView.scrollTop;
      const vh = homeView.clientHeight || 1;
      const p = Math.min(y / vh, 1); // 0 → 1 across the first viewport
      scrollP = p; // the parallax loop composes this into the hero transform

      // the hero holds its ground while the landmarks fold away, then clears
      if (heroScene) {
        heroScene.style.setProperty("--scenelift", `${-p * 40}px`);
        const fade = Math.min(1, Math.max(0, (p - 0.62) / 0.38));
        heroScene.style.opacity = String(1 - fade * fade);
      }

      // the planet swells up into frame as the fold completes
      if (globeHolder) {
        const g = Math.min(1, Math.max(0, (p - 0.24) / 0.76));
        const ge = g * g * (3 - 2 * g);
        globeHolder.style.setProperty("--globe-y", `${((1 - ge) * 26).toFixed(1)}vh`);
        globeHolder.style.setProperty("--globe-s", (0.62 + ge * 0.38).toFixed(3));
        globeHolder.style.setProperty("--globe-o", ge.toFixed(3));
      }

      // the cue has done its job once you have started scrolling
      if (cue) cue.style.opacity = String(1 - Math.min(p * 3, 1));

      // scroll-spy: highlight whichever section owns the upper third
      if (tabs.length) {
        const mark = y + vh * 0.34;
        let current = -1;
        tabs.forEach((t, i) => {
          const sec = document.getElementById(t.dataset.sec);
          if (sec && sec.offsetTop <= mark) current = i;
        });
        tabs.forEach((t, i) => t.classList.toggle("on", i === current));
      }

      // fail-open backstop: if the observer ever misses an element, scrolling
      // past it still reveals it, so content is never stuck invisible
      for (const el of document.querySelectorAll(".reveal:not(.in)")) {
        if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("in");
      }

      // booking bar arrives once the hero is mostly behind you
      if (stickyBar) stickyBar.classList.toggle("show", p > 0.72);

      // scroll progress rail
      if (rail) {
        const max = homeView.scrollHeight - vh;
        rail.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0).toFixed(2) + "%";
      }

      ticking = false;
    }

    homeView.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // magnetic pull on the primary CTAs — the button leans toward the cursor
    for (const pill of document.querySelectorAll(".book-cta .pill, .xp-cta")) {
      const host = pill.closest(".book-cta") || pill;
      host.addEventListener("pointermove", (e) => {
        const r = pill.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        pill.style.transform = `translate(${dx * 9}px, ${dy * 6}px)`;
      });
      host.addEventListener("pointerleave", () => { pill.style.transform = ""; });
    }

    // reveal on enter. Sections injected later by app.js (restaurant cards,
    // show rows, FAQ items) must be handed to the observer too, so scan() is
    // exposed and a MutationObserver catches anything added after boot —
    // otherwise those elements sit at opacity 0 forever.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    }, { root: homeView, threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    const watched = new WeakSet();
    function scanReveals() {
      for (const el of document.querySelectorAll(".reveal:not(.in)")) {
        if (watched.has(el)) continue;
        watched.add(el);
        io.observe(el);
      }
    }
    scanReveals();
    window.WBK_REVEAL = { scan: scanReveals };

    new MutationObserver(scanReveals).observe(homeView, { childList: true, subtree: true });
  }
})();

// (the hero video is gone — the built scene plays the hero again)

