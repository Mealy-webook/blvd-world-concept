// ── gallery globe: drag-to-rotate sphere with letter pins ──
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const holder = document.getElementById("globe-holder");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
holder.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

const root = new THREE.Group();
scene.add(root);

const globe = new THREE.Group();
root.add(globe);

// sphere body
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.6, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0x0d1740, roughness: 0.85, metalness: 0.1 })
);
globe.add(sphere);

// wire overlay
const wire = new THREE.Mesh(
  new THREE.SphereGeometry(2.612, 28, 28),
  new THREE.MeshBasicMaterial({ color: 0x2f5cbf, wireframe: true, transparent: true, opacity: 0.1 })
);
globe.add(wire);

// real country borders, drawn as great-circle-ish line segments on the sphere

// lights
scene.add(new THREE.AmbientLight(0x8899ff, 0.7));
const key = new THREE.DirectionalLight(0xbcd8ff, 1.6);
key.position.set(4, 3, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xff3ec8, 0.7);
rim.position.set(-5, -1, -4);
scene.add(rim);

function latLon(lat, lon, r) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// borders: one LineSegments mesh for the whole world, in the wireframe's key
{
  const R = 2.625;
  const verts = [];
  for (const ring of (window.WBK_BORDERS || [])) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i];
      const [lon2, lat2] = ring[i + 1];
      // subdivide long spans so the line hugs the curve of the sphere
      const span = Math.hypot(lon2 - lon1, lat2 - lat1);
      const steps = Math.max(1, Math.min(8, Math.round(span / 4)));
      let prev = latLon(lat1, lon1, R);
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const next = latLon(lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t, R);
        verts.push(prev.x, prev.y, prev.z, next.x, next.y, next.z);
        prev = next;
      }
    }
  }
  const bg = new THREE.BufferGeometry();
  bg.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  globe.add(new THREE.LineSegments(bg, new THREE.LineBasicMaterial({
    color: 0x8fc4ff, transparent: true, opacity: 0.32,
  })));
}

// park zones: a taller gold marker on a stalk, so they read apart from letters
const zoneGroup = new THREE.Group();
globe.add(zoneGroup);
const zoneHeadGeo = new THREE.SphereGeometry(0.05, 14, 14);
const zoneHeadMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });
const zoneStalkGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6);
const zoneStalkMat = new THREE.MeshBasicMaterial({ color: 0xffc24d, transparent: true, opacity: 0.6 });
const zoneHaloGeo = new THREE.RingGeometry(0.07, 0.092, 24);

// one HTML label per zone, projected from its 3D pin every frame
const labelLayer = document.createElement("div");
labelLayer.className = "globe-labels";
holder.appendChild(labelLayer);
const labels = [];
const heads = [];

function buildZones() {
  zoneGroup.clear();
  labelLayer.innerHTML = "";
  labels.length = 0;
  heads.length = 0;
  (WBK.zones || []).forEach((z, i) => {
    const base = latLon(z.lat, z.lon, 2.6);
    const up = base.clone().normalize();

    const stalk = new THREE.Mesh(zoneStalkGeo, zoneStalkMat);
    stalk.position.copy(base.clone().addScaledVector(up, 0.1));
    stalk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
    zoneGroup.add(stalk);

    const head = new THREE.Mesh(zoneHeadGeo, zoneHeadMat);
    head.position.copy(base.clone().addScaledVector(up, 0.21));
    head.userData.zone = i;
    zoneGroup.add(head);

    const halo = new THREE.Mesh(
      zoneHaloGeo,
      new THREE.MeshBasicMaterial({ color: 0xffc24d, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    halo.position.copy(base.clone().addScaledVector(up, 0.004));
    halo.lookAt(base.clone().multiplyScalar(2));
    halo.userData.pulse = Math.random() * Math.PI * 2;
    zoneGroup.add(halo);

    const tag = document.createElement("span");
    tag.className = "glabel";
    tag.textContent = z.name;
    labelLayer.appendChild(tag);
    labels.push(tag);
    heads.push(head);
  });
}
buildZones();

// project each pin to screen space and park its label there
const proj = new THREE.Vector3();
const camDir = new THREE.Vector3();
function placeLabels() {
  const w = holder.clientWidth, h = holder.clientHeight;
  for (let i = 0; i < heads.length; i++) {
    heads[i].getWorldPosition(proj);
    // hide labels on the far side of the globe
    camDir.copy(camera.position).sub(proj);
    const facing = proj.clone().normalize().dot(camDir.normalize());
    proj.project(camera);
    const x = (proj.x * 0.5 + 0.5) * w;
    const y = (-proj.y * 0.5 + 0.5) * h;
    const tag = labels[i];
    tag.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -140%)`;
    tag.style.opacity = facing > 0.12 ? Math.min(1, (facing - 0.12) * 4).toFixed(2) : "0";
  }
}

// drag rotate
const IDLE_SPIN = 0.0012;
let dragging = false, px = 0, py = 0, vx = IDLE_SPIN, vy = 0, rotX = 0.35, rotY = 2.4, moved = 0;
const el = renderer.domElement;
el.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; px = e.clientX; py = e.clientY; });
window.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - px, dy = e.clientY - py;
  moved += Math.abs(dx) + Math.abs(dy);
  rotY += dx * 0.005;
  rotX = Math.max(-1.1, Math.min(1.1, rotX + dy * 0.003));
  vx = dx * 0.0004;
  px = e.clientX; py = e.clientY;
});
window.addEventListener("pointerup", () => (dragging = false));

// pick pins
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
el.addEventListener("click", (e) => {
  if (moved > 6) return;
  const r = el.getBoundingClientRect();
  mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera);

  // zones sit proud of the surface, so test them first
  const zoneHits = ray.intersectObjects(zoneGroup.children.filter((c) => c.geometry === zoneHeadGeo));
  if (zoneHits.length) openZone(zoneHits[0].object.userData.zone);
});

// ── zone drawer: opening one freezes the globe so it stays put ──
const panel = document.getElementById("zone-panel");
const zpEls = {
  img: document.getElementById("zp-img"),
  nA: document.getElementById("zp-n-a"),
  nF: document.getElementById("zp-n-f"),
  nR: document.getElementById("zp-n-r"),
  name: document.getElementById("zp-name"),
  blurb: document.getElementById("zp-blurb"),
  attractions: document.getElementById("zp-attractions"),
  food: document.getElementById("zp-food"),
  rides: document.getElementById("zp-rides"),
};
let frozen = false;

function fill(ul, items) {
  ul.innerHTML = (items || []).map((t) => `<li>${t}</li>`).join("");
}

// hero image + thumbnail strip; clicking a thumb cross-fades the hero
const thumbs = document.getElementById("zp-thumbs");
function buildGallery(imgs) {
  thumbs.innerHTML = "";
  if (!imgs.length) { zpEls.img.removeAttribute("src"); return; }
  zpEls.img.src = "img/zones/" + imgs[0];
  imgs.forEach((file, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = i === 0 ? "on" : "";
    b.innerHTML = `<img src="img/zones/${file}" alt="" loading="lazy">`;
    b.addEventListener("click", () => {
      [...thumbs.children].forEach((c) => c.classList.remove("on"));
      b.classList.add("on");
      zpEls.img.classList.add("swap");
      setTimeout(() => {
        zpEls.img.src = "img/zones/" + file;
        zpEls.img.classList.remove("swap");
      }, 180);
    });
    thumbs.appendChild(b);
  });
}

// `ref` is an index into WBK.zones (the globe's pins) or a zone-shaped
// object — the park map builds those for zones the globe doesn't carry.
function openZone(ref) {
  const z = typeof ref === "number" ? WBK.zones[ref] : ref;
  if (!z) return;
  frozen = true;                 // stop the idle spin while reading
  vx = 0;
  zpEls.name.textContent = z.name;
  zpEls.blurb.textContent = z.blurb;
  fill(zpEls.attractions, z.attractions);
  fill(zpEls.food, z.food);
  fill(zpEls.rides, z.rides);
  zpEls.nA.textContent = (z.attractions || []).length;
  zpEls.nF.textContent = (z.food || []).length;
  zpEls.nR.textContent = (z.rides || []).length;
  buildGallery(z.imgs || []);
  focusZone(z);                  // fly the camera onto the zone
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

function closeZone() {
  frozen = false;                // hand the spin back
  vx = IDLE_SPIN;
  resetCamera();                 // and pull back out to the whole globe
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}
document.getElementById("zp-close").addEventListener("click", closeZone);
addEventListener("keydown", (e) => { if (e.key === "Escape") closeZone(); });

// clicking anywhere outside the drawer closes it (a click that lands on
// another zone pin is handled by the globe's own handler first)
addEventListener("pointerdown", (e) => {
  if (!panel.classList.contains("open")) return;
  if (panel.contains(e.target)) return;
  if (e.target === el && ray && hitsZone(e)) return; // let pin-to-pin switching through
  if (e.target.closest?.(".pm-pin")) return;         // ditto for the park map's pins
  closeZone();
}, true);

function hitsZone(e) {
  const r = el.getBoundingClientRect();
  mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  return ray.intersectObjects(zoneGroup.children.filter((c) => c.geometry === zoneHeadGeo)).length > 0;
}

// ── camera moves: selecting a zone flies in on it, closing pulls back ──
let baseDist = 9;                  // the whole-globe framing, set by size()
let distTarget = baseDist;         // where the camera is easing towards
let shiftTarget = 0;               // slide left so the drawer doesn't cover it
let aimX = null, aimY = null;      // rotation targets while a zone is held

// the rotation that brings a lat/lon round to face the camera
function aimAt(lat, lon) {
  const p = latLon(lat, lon, 2.6);
  const flat = Math.hypot(p.x, p.z);
  aimY = Math.atan2(-p.x, p.z);
  aimX = Math.max(-1.1, Math.min(1.1, Math.atan2(p.y, flat)));
}

const ZOOM = 0.78;                 // close enough to read a region, horizon kept

function focusZone(z) {
  const named = (WBK.zones || []).find((n) => n.name === z.name);
  const src = typeof z.lat === "number" ? z : named;
  if (!src || typeof src.lat !== "number") return;   // map-only zone, no coords
  aimAt(src.lat, src.lon);
  distTarget = baseDist * ZOOM;
  // the drawer covers the right edge, so slide the globe out from under it by
  // half of what it hides — measured, not guessed, so it holds on any width
  const hidden = Math.min(430, innerWidth * 0.92) / Math.max(1, innerWidth);
  const halfW = distTarget * Math.tan((camera.fov / 2) * (Math.PI / 180)) * camera.aspect;
  shiftTarget = -halfW * hidden;
}

function resetCamera() {
  aimX = aimY = null;
  distTarget = baseDist;
  shiftTarget = 0;
}

function size() {
  const w = holder.offsetWidth || innerWidth;
  const h = holder.offsetHeight || innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  // frame the sphere from its own size: fit vertically, and on narrow
  // viewports pull back further so it also fits horizontally
  const FIT = 2.95; // sphere radius (2.6) + zone stalks, snug to the frame
  const halfFov = (camera.fov / 2) * (Math.PI / 180);
  const dV = FIT / Math.tan(halfFov);
  const z = Math.max(dV, dV / camera.aspect);
  const held = distTarget !== baseDist;              // keep a zoom through resize
  baseDist = z;
  distTarget = held ? baseDist * ZOOM : baseDist;
  if (!held) camera.position.z = z;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}
size();
window.addEventListener("resize", size);

const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  if (!holder.closest(".view.active")) return; // skip work off-route
  const t = clock.getElapsedTime();
  if (!dragging && !frozen) {
    rotY += vx; vx *= 0.985;
    if (Math.abs(vx) < IDLE_SPIN) vx = Math.sign(vx || 1) * IDLE_SPIN;
  }

  // ease towards the held zone (or back to the resting view once released);
  // dragging always wins, so a reader can pull the globe off its mark
  if (aimY !== null && !dragging) {
    let d = (aimY - rotY) % (Math.PI * 2);           // take the short way round
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    rotY += d * 0.085;
    rotX += (aimX - rotX) * 0.085;
  } else if (aimY === null && !dragging && Math.abs(rotX) > 0.001) {
    rotX += (0 - rotX) * 0.06;                       // settle the tilt back
  }
  camera.position.z += (distTarget - camera.position.z) * 0.075;
  root.position.x += (shiftTarget - root.position.x) * 0.075;

  globe.rotation.set(rotX, rotY, 0);
  zoneGroup.children.forEach((c) => {
    if (c.userData.pulse !== undefined) {
      const s = 1 + Math.sin(t * 2.4 + c.userData.pulse) * 0.25;
      c.scale.setScalar(s);
    }
  });
  placeLabels();
  renderer.render(scene, camera);
}
tick();

window.WBK_GLOBE = {
  refresh: buildZones,
  wake: () => { size(); placeLabels(); },
  openZone,
  closeZone,
};
