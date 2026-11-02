/* ==========================================
   1. КАСТОМНЫЙ КУРСОР
   ========================================== */
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
const hoverTargets = document.querySelectorAll('a, button, .project-item, .about-card');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;
  dotX += (mouseX - dotX) * 0.5;
  dotY += (mouseY - dotY) * 0.5;

  if (cursor && cursorDot) {
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateCursor);
}

if (window.matchMedia('(hover: hover)').matches) {
  animateCursor();
  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
    target.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
  });
}

/* ==========================================
   2. ПРЕЛОАДЕР
   ========================================== */
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loaderPct');
const loaderBar = document.querySelector('.loader-bar span');
let progress = 0;

const loadInterval = setInterval(() => {
  progress += Math.random() * 15;
  if (progress > 100) progress = 100;

  if (loaderPct) loaderPct.innerText = Math.floor(progress) + '%';
  if (loaderBar) loaderBar.style.transform = `scaleX(${progress / 100})`;

  if (progress === 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      loader?.classList.add('done');
      window.dispatchEvent(new Event('siteLoaded'));
    }, 600);
  }
}, 100);

/* ==========================================
   3. THREE.JS (МОБИЛЬНОЕ И КРУТОЕ 3D)
   ========================================== */
const canvas = document.getElementById('webgl');

if (canvas && typeof THREE !== 'undefined') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Точки
  const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32);
  const material = new THREE.PointsMaterial({
    color: 0x7c5cff, // Фиолетовый
    size: 0.02,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const knotPoints = new THREE.Points(geometry, material);
  scene.add(knotPoints);

  // 2. Сетка (для объема)
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0xff5c8a, // Розовый
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const knotWire = new THREE.Mesh(geometry, wireframeMat);
  scene.add(knotWire);

  // Управление мышью и ТАЧЕМ (для телефона)
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  function handleMove(x, y) {
    targetX = (x / window.innerWidth - 0.5) * 2;
    targetY = (y / window.innerHeight - 0.5) * 2;
  }

  document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
  // Слушаем палец на телефоне
  document.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // Анимация
  let time = 0;
  function animate3D() {
    requestAnimationFrame(animate3D);
    time += 0.01;

    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    // Вращение
    knotPoints.rotation.x += 0.002;
    knotPoints.rotation.y += 0.003;
    knotWire.rotation.x -= 0.001;
    knotWire.rotation.y -= 0.002;

    // Легкое дыхание
    const scale = 1 + Math.sin(time) * 0.05;
    knotPoints.scale.set(scale, scale, scale);
    knotWire.scale.set(scale, scale, scale);

    // Смещение от мыши/пальца
    knotPoints.position.x = currentX * 1.5;
    knotPoints.position.y = -currentY * 1.5;
    knotWire.position.copy(knotPoints.position);

    renderer.render(scene, camera);
  }
  animate3D();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================
   4. GSAP АНИМАЦИИ ПРИ СКРОЛЛЕ
   ========================================== */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  const revealElements = document.querySelectorAll('.section-head, .about-grid, .project-item, .contact-body');
  
  revealElements.forEach((el) => {
    el.classList.add('reveal');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('in'),
      once: true
    });
  });
}

/* ==========================================
   5. АНИМАЦИЯ СЧЕТЧИКОВ
   ========================================== */
const statNumbers = document.querySelectorAll('.stat-num');

if (statNumbers.length > 0) {
  const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      obj.innerText = Math.floor(easeProgress * (end - start) + start);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerText = end;
      }
    };
    window.requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endValue = parseInt(target.getAttribute('data-count'), 10);
        animateValue(target, 0, endValue, 2000);
        statsObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => statsObserver.observe(num));
}

/* ==========================================
   6. ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКОВ (RU/EN)
   ========================================== */
const langToggleBtn = document.getElementById('langToggle');
let currentLang = 'ru';

if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    // Меняем язык
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    // Меняем текст на кнопке
    langToggleBtn.innerText = currentLang === 'ru' ? 'EN' : 'RU';

    // Проходимся по всем тегам с переводами и меняем текст
    document.querySelectorAll('[data-ru]').forEach(el => {
      el.innerHTML = el.getAttribute(`data-${currentLang}`);
    });
  });
}

/* ==========================================
   7. ЗАЩИТА И БРЕНДИНГ
   ========================================== */
console.log(
  '%cSTOP!',
  'color: #ff5c8a; font-size: 40px; font-weight: bold; font-family: sans-serif; text-shadow: 2px 2px 0 #000;'
);
console.log(
  '%cЭтот сайт принадлежит Dani "MellFor". Официальные контакты: t.me/mellfor',
  'color: #7c5cff; font-size: 16px; font-family: sans-serif; padding: 10px; border: 2px solid #7c5cff; border-radius: 8px;'
);
