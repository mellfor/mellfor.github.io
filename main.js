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
  // Плавное следование кольца
  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;
  // Точка следует быстрее
  dotX += (mouseX - dotX) * 0.5;
  dotY += (mouseY - dotY) * 0.5;

  if (cursor && cursorDot) {
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
  }
  requestAnimationFrame(animateCursor);
}

// Включаем курсор только на ПК (на тачах скрыт через CSS)
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
      // Событие для запуска анимаций после прелоадера
      window.dispatchEvent(new Event('siteLoaded'));
    }, 600);
  }
}, 100);

/* ==========================================
   3. THREE.JS (3D Торус из точек)
   ========================================== */
const canvas = document.getElementById('webgl');

if (canvas && typeof THREE !== 'undefined') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true, 
    antialias: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Геометрия: TorusKnot из точек
  const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 150, 16);
  const material = new THREE.PointsMaterial({
    color: 0x7c5cff, // Цвет акцента (фиолетовый)
    size: 0.015,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  
  const knot = new THREE.Points(geometry, material);
  scene.add(knot);

  // Параллакс от мыши
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate3D() {
    requestAnimationFrame(animate3D);

    // Плавное движение (lerp)
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    // Вращение объекта
    knot.rotation.x += 0.003;
    knot.rotation.y += 0.005;
    
    // Смещение от мыши
    knot.position.x = currentX * 0.5;
    knot.position.y = -currentY * 0.5;

    renderer.render(scene, camera);
  }
  animate3D();

  // Адаптив под ресайз
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
/* ==========================================
   4. GSAP АНИМАЦИИ ПРИ СКРОЛЛЕ
   ========================================== */
// Проверяем, загрузился ли GSAP
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Анимация появления секций (добавляем класс .reveal элементам)
  const revealElements = document.querySelectorAll('.section-head, .about-grid, .project-item, .stack-col, .contact-body');
  
  revealElements.forEach((el) => {
    el.classList.add('reveal'); // Класс из CSS
    
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%', // Начинаем, когда элемент появляется на 15% снизу экрана
      onEnter: () => el.classList.add('in'),
      once: true // Анимация срабатывает только один раз
    });
  });
}

/* ==========================================
   5. АНИМАЦИЯ СЧЁТЧИКОВ (260+, 18, 2026)
   ========================================== */
const statNumbers = document.querySelectorAll('.stat-num');

if (statNumbers.length > 0) {
  const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Плавное замедление в конце (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      obj.innerText = Math.floor(easeProgress * (end - start) + start);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerText = end; // Фиксируем конечное значение
      }
    };
    window.requestAnimationFrame(step);
  };

  // Запускаем анимацию цифр, когда блок статистики появляется на экране
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endValue = parseInt(target.getAttribute('data-count'), 10);
        animateValue(target, 0, endValue, 2000); // 2000 мс = 2 секунды
        statsObserver.unobserve(target); // Отключаем наблюдение после запуска
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => statsObserver.observe(num));
}

/* ==========================================
   6. ЗАЩИТА И БРЕНДИНГ (Anti-Fake)
   ========================================== */
// Предупреждение в консоли для тех, кто пытается вскрыть или скопировать
console.log(
  '%cSTOP!',
  'color: #ff5c8a; font-size: 40px; font-weight: bold; font-family: sans-serif; text-shadow: 2px 2px 0 #000;'
);
console.log(
  '%cЭтот сайт принадлежит Dani "MellFor". Если вам предлагают купить этот сайт, взломать его или использовать код без разрешения — это скам. Официальные контакты: t.me/mellfor',
  'color: #7c5cff; font-size: 16px; font-family: sans-serif; padding: 10px; border: 2px solid #7c5cff; border-radius: 8px;'
);

// Защита от копирования контента (отключает выделение на некоторых элементах)
document.addEventListener('contextmenu', (e) => {
  // Можно раскомментировать, если хочешь полностью запретить правый клик
  // e.preventDefault(); 
});

/* ==========================================
   7. ЗАПУСК АНИМАЦИЙ ПОСЛЕ ПРЕЛОАДЕРА
   ========================================== */
window.addEventListener('siteLoaded', () => {
  // Если нужно запустить что-то именно после исчезновения лоадера
  document.body.classList.add('loaded');
});
