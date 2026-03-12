
/* ══════════════════════════════════════════
   1. THREE.JS — Animated water/wave background
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Wave plane geometry
  const geo = new THREE.PlaneGeometry(20, 20, 80, 80);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0d3020,
    wireframe: false,
    roughness: 0.4,
    metalness: 0.1,
    opacity: 0.9,
    transparent: true
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 3;
  scene.add(mesh);

  // Lights
  const amb = new THREE.AmbientLight(0x46A941, 0.5);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0x89BFE2, 1.2);
  dir.position.set(5, 8, 5);
  scene.add(dir);
  const pt = new THREE.PointLight(0x2d7a3a, 2, 20);
  pt.position.set(-3, 3, 3);
  scene.add(pt);

  // Floating particles
  const pGeo = new THREE.BufferGeometry();
  const pCount = 180;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 18;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x46A941, size: 0.05, opacity: 0.55, transparent: true });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // Animate
  const clock = new THREE.Clock();
  const pos = geo.attributes.position;
  const initialZ = [];
  for (let i = 0; i < pos.count; i++) initialZ.push(pos.getZ(i));

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Wave motion
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = initialZ[i] +
        Math.sin(x * 0.8 + t * 0.9) * 0.3 +
        Math.sin(y * 0.6 + t * 0.7) * 0.25 +
        Math.cos((x + y) * 0.5 + t * 0.5) * 0.15;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // Rotate particles slowly
    points.rotation.y = t * 0.04;
    points.rotation.x = t * 0.02;

    // Pulse point light
    pt.intensity = 1.5 + Math.sin(t * 1.4) * 0.8;

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ══════════════════════════════════════════
   2. GSAP — hero entrance + scroll animations
══════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

// Hero entrance
gsap.timeline({ delay: 0.4 })
  .from('#heroTag',               { opacity:0, y:20, duration:.6, ease:'power2.out' })
  .from('#heroTitle',             { opacity:0, y:36, duration:.85, ease:'power2.out' }, '-=.3')
  .from('#heroSub',               { opacity:0, y:22, duration:.65, ease:'power2.out' }, '-=.5')
  .from('#heroBtns .btn-primary', { opacity:0, x:-22, duration:.55, ease:'power2.out' }, '-=.4')
  .from('#heroBtns .btn-outline', { opacity:0, x:22,  duration:.55, ease:'power2.out' }, '-=.5')
  .from('#heroStats .hero-stat',  { opacity:0, y:18, stagger:.14, duration:.5, ease:'power2.out' }, '-=.3');

// Reusable scroll trigger factory
function st(selector, vars) {
  gsap.utils.toArray(selector).forEach((el, i) => {
    gsap.to(el, {
      ...vars,
      delay: (i % 4) * 0.1,
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
    });
  });
}
st('.g-up',    { opacity:1, y:0,    duration:.75, ease:'power2.out' });
st('.g-left',  { opacity:1, x:0,    duration:.85, ease:'power2.out' });
st('.g-right', { opacity:1, x:0,    duration:.85, ease:'power2.out' });
st('.g-pop',   { opacity:1, scale:1, duration:.65, ease:'back.out(1.5)' });

/* ══════════════════════════════════════════
   3. HERO SLIDER (3 slides auto + dots)
══════════════════════════════════════════ */
// Hero uses the Three.js bg — we just cycle a colour tint overlay for variety
const heroOverlay = document.querySelector('.hero-overlay');
const tints = [
  'linear-gradient(110deg, rgba(10,26,15,.85) 40%, rgba(10,26,15,.45) 100%)',
  'linear-gradient(110deg, rgba(10,20,40,.85) 40%, rgba(10,40,20,.45) 100%)',
  'linear-gradient(110deg, rgba(15,20,10,.85) 40%, rgba(30,15,10,.45) 100%)'
];
const dots = document.querySelectorAll('.dot');
let heroIdx = 0;
function goSlide(n) {
  dots[heroIdx].classList.remove('active');
  heroIdx = (n + 3) % 3;
  dots[heroIdx].classList.add('active');
  heroOverlay.style.background = tints[heroIdx];
}
setInterval(() => goSlide(heroIdx + 1), 5000);
dots.forEach(d => d.addEventListener('click', () => goSlide(+d.dataset.i)));

/* ══════════════════════════════════════════
   4. HAMBURGER / MOBILE MENU
══════════════════════════════════════════ */
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileMenu');
ham.addEventListener('click', () => {
  mob.classList.toggle('open');
  ham.querySelector('i').className = mob.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});
mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mob.classList.remove('open');
  ham.querySelector('i').className = 'fa-solid fa-bars';
}));

/* ══════════════════════════════════════════
   5. NAVBAR — collapse topbar on scroll
══════════════════════════════════════════ */
const mainNav = document.getElementById('mainNav');
const topbar  = document.querySelector('.topbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    mainNav.style.top        = '0';
    mainNav.style.boxShadow  = '0 4px 30px rgba(0,0,0,.15)';
    topbar.style.display     = 'none';
  } else {
    mainNav.style.top        = window.innerWidth > 768 ? '33px' : '0';
    mainNav.style.boxShadow  = '0 2px 24px rgba(0,0,0,.08)';
    if (window.innerWidth > 768) topbar.style.display = 'flex';
  }
});

/* ══════════════════════════════════════════
   6. ANIMATED COUNTERS
══════════════════════════════════════════ */
function animateCount(el, target, suffix) {
  let cur = 0;
  const step = Math.ceil(target / 70);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.innerHTML = cur.toLocaleString() + '<span>' + suffix + '</span>';
    if (cur >= target) clearInterval(t);
  }, 28);
}
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCount(document.getElementById('cnt1'), 49460, '+');
    animateCount(document.getElementById('cnt2'), 94,    '%');
    animateCount(document.getElementById('cnt3'), 120,   'K');
    animateCount(document.getElementById('cnt4'), 8,     '+');
    entries[0].target._obs.disconnect();
  }
}, { threshold: 0.25 }).observe(
  Object.assign(document.getElementById('statsStrip'), { _obs: null })
);
// Clean version of the same observer
(function () {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCount(document.getElementById('cnt1'), 49460, '+');
      animateCount(document.getElementById('cnt2'), 94,    '%');
      animateCount(document.getElementById('cnt3'), 120,   'K');
      animateCount(document.getElementById('cnt4'), 8,     '+');
      obs.disconnect();
    }
  }, { threshold: 0.25 });
  obs.observe(document.getElementById('statsStrip'));
})();

/* ══════════════════════════════════════════
   7. DONUT CHARTS — GSAP stroke animation
══════════════════════════════════════════ */
(function () {
  const data = [
    { id:'donut1', numId:'dnum1', target:24730, total:49460 },
    { id:'donut2', numId:'dnum2', target:16013, total:49460 },
    { id:'donut3', numId:'dnum3', target:8717,  total:49460 }
  ];
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      data.forEach(({ id, numId, target, total }) => {
        const circ  = document.getElementById(id);
        const numEl = document.getElementById(numId);
        gsap.fromTo(circ,
          { strokeDashoffset: 314 },
          { strokeDashoffset: 314 - 314 * target / total, duration: 2.2, ease: 'power2.out' }
        );
        let cur = 0;
        const step = Math.ceil(target / 80);
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          numEl.textContent = cur >= 1000 ? Math.round(cur / 1000) + 'K' : cur;
          if (cur >= target) clearInterval(t);
        }, 25);
      });
      obs.disconnect();
    }
  }, { threshold: 0.25 });
  obs.observe(document.getElementById('complaintsGrid'));
})();

/* ══════════════════════════════════════════
   8. PROJECTS SLIDER — GSAP powered
══════════════════════════════════════════ */
(function () {
  const track = document.getElementById('projTrack');
  let idx = 0;
  const W = 320; // card width + gap
  document.getElementById('projNext').addEventListener('click', () => {
    idx = Math.min(idx + 1, 3);
    gsap.to(track, { x: -(idx * W), duration: .55, ease: 'power2.out' });
  });
  document.getElementById('projPrev').addEventListener('click', () => {
    idx = Math.max(idx - 1, 0);
    gsap.to(track, { x: -(idx * W), duration: .55, ease: 'power2.out' });
  });
})();
