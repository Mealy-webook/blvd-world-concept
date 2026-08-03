# BLVD World — campaign concept

An interactive landing-page concept for **BLVD World** (Riyadh Season), built as a
prototype for testing. Structurally inspired by immersive brand microsites such as
the OREO × BTS campaign site.

**Live demo:** https://mealy-webook.github.io/blvd-world-concept/

## The experience

1. **Loader → intro** — a typewriter intro over a starfield.
2. **Arch fly-through** — the BLVD World rock arch settles into frame, then the camera
   dives through the glowing archway to reveal the page behind it.
3. **Hero** — "EXPLORE NEW WORLDS." over parallaxing landmark cut-outs, with entry and
   entry-plus-experience booking CTAs.
4. **Interactive globe** — a Three.js planet with real country borders, carrying a gold
   pin for each of the 20 park zones. Drag to spin; click a pin to freeze the globe and
   open a drawer with that zone's photos, attractions, restaurants and rides.
5. **Zones** — nine photo cards revealing on scroll with per-card image parallax.
6. **Experiences** (`#/experiences`) — an infinite concave-arc carousel with drag,
   swipe, wheel, arrow-key and click-to-front navigation, snapping to the nearest card.

Also included: a generative WebAudio soundtrack (♪ toggle, bottom-left), a scroll
progress rail, film grain, and a fan-letter flow at `#/letter`.

## Running it

No build step — it's plain HTML, CSS and vanilla JS. Serve the folder over HTTP
(ES modules and `fetch` need a server, `file://` won't do):

```bash
python3 -m http.server 4919
```

Then open http://localhost:4919.

## Layout

```
index.html          all views (hash-routed: #/, #/experiences, #/letter, #/prizes)
css/main.css        every style
js/data.js          zones, experiences, letters — edit copy and prices here
js/borders.js       country outlines (Natural Earth 110m, RDP-simplified)
js/scene.js         landmarks, starfields, fireworks, scroll + parallax
js/globe.js         Three.js globe, zone pins, labels, zone drawer
js/experiences.js   arc carousel
js/app.js           router, intro, arch fly-through, music, letter flow
```

Three.js loads from unpkg at runtime; everything else is local.

## Notes

- Prices (SAR 50 / SAR 150 and the experience prices) are **placeholders**.
- The giveaway and letter flows are mock-ups — nothing is submitted anywhere.
- Country borders come from [Natural Earth](https://www.naturalearthdata.com/)
  (public domain), simplified to ~37 KB.
- Imagery is BLVD World / Riyadh Season material used here for prototyping only.
