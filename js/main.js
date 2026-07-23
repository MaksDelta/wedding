/* ═══════════════════════════════════════════════
   НАЛАШТУВАННЯ — змініть тут ⬇
   Дата й час весілля у форматі: рік, місяць(1-12), день, година, хвилина
   ═══════════════════════════════════════════════ */
const WEDDING_DATE = new Date(2026, 8, 19, 14, 0, 0); // 19 вересня 2026, 14:00

/* ═══════════════ ЗВОРОТНИЙ ВІДЛІК ═══════════════ */
(function countdown() {
  const el = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };
  const grid = document.getElementById('countdown-grid');
  const done = document.getElementById('countdown-done');
  if (!el.days) return;

  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      grid.hidden = true;
      done.hidden = false;
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    el.days.textContent  = pad(Math.floor(s / 86400));
    el.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    el.mins.textContent  = pad(Math.floor((s % 3600) / 60));
    el.secs.textContent  = pad(s % 60);
  }
  tick();
  const timer = setInterval(tick, 1000);
})();

/* ═══════════════ АНІМАЦІЇ ПРИ ПРОКРУТЦІ ═══════════════ */
let revealStarted = false;
function initReveal() {
  if (revealStarted) return;
  revealStarted = true;
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-visible'));
    return;
  }
  // елементи з'являються при вході в екран і зникають при виході (симетрично);
  // з атрибутом data-once — показуються один раз і не зникають
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        if (e.target.hasAttribute('data-once')) io.unobserve(e.target);
      } else if (!e.target.hasAttribute('data-once')) {
        e.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });
  items.forEach((i) => io.observe(i));
}

/* ═══════════════ ПРЕЛОАДЕР-КОНВЕРТ ═══════════════ */
(function intro() {
  const intro = document.getElementById('intro');

  // Немає прелоадера → одразу показуємо сайт
  if (!intro) { initReveal(); return; }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ✏️ Автовідкриття, якщо гість не натиснув сам (мс). 0 = лише за кліком.
  const AUTO_OPEN_MS = 0;

  document.body.classList.add('is-locked');
  let opened = false;

  function open() {
    if (opened) return;
    opened = true;
    intro.classList.add('is-open'); // печатка + клапан злітають, решта розчиняється

    const hideDelay = reduce ? 150 : 900; // час на зліт клапана
    setTimeout(() => {
      intro.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
      initReveal(); // hero анімується вже після відкриття
    }, hideDelay);
    setTimeout(() => intro.remove(), hideDelay + 1000);
  }

  // клік / тап
  intro.addEventListener('click', open);
  // клавіатура
  intro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  // свайп (будь-який напрямок від ~50px)
  let sx = 0, sy = 0, tracking = false;
  intro.addEventListener('pointerdown', (e) => { tracking = true; sx = e.clientX; sy = e.clientY; });
  intro.addEventListener('pointermove', (e) => {
    if (!tracking) return;
    if (Math.hypot(e.clientX - sx, e.clientY - sy) > 50) { tracking = false; open(); }
  });
  intro.addEventListener('pointerup', () => { tracking = false; });

  if (AUTO_OPEN_MS > 0) setTimeout(open, AUTO_OPEN_MS);
})();

/* ═══════════════ НАВІГАЦІЯ ═══════════════ */
(function nav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      nav.classList.remove('is-open');
    })
  );
})();

/* ═══════════════ КАРУСЕЛЬ ОБРАЗІВ (безперервна стрічка) ═══════════════ */
(function carousel() {
  const track = document.getElementById('looks-track');
  const prev = document.getElementById('looks-prev');
  const next = document.getElementById('looks-next');
  if (!track) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // клонуємо весь набір → безшовне зациклення
  Array.from(track.children).forEach((node) => track.appendChild(node.cloneNode(true)));

  let half = track.scrollWidth / 2;
  const measure = () => { half = track.scrollWidth / 2; };
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);

  const step = () => {
    const card = track.querySelector('.look');
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 24;
    return card ? card.offsetWidth + gap : 240;
  };

  // ── безперервний плавний рух ──
  const SPEED = 0.5; // пікселів за кадр (~30px/с)
  let paused = false, last = 0;
  function frame(t) {
    if (!last) last = t;
    const dt = t - last; last = t;
    if (!paused) {
      track.scrollLeft += SPEED * (dt / 16.67);
      if (track.scrollLeft >= half) track.scrollLeft -= half;
      else if (track.scrollLeft <= 0) track.scrollLeft += half;
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame);

  // пауза лише під час активного перетягування, тоді плавно відновлюємо
  let resumeT = null;
  const pause = () => { paused = true; if (resumeT) { clearTimeout(resumeT); resumeT = null; } };
  const resumeSoon = () => { if (resumeT) clearTimeout(resumeT); resumeT = setTimeout(() => { paused = false; }, 1000); };
  track.addEventListener('pointerdown', pause, { passive: true });
  window.addEventListener('pointerup', resumeSoon, { passive: true });

  // стрілки — плавний зсув на один образ
  const nudge = (dir) => { pause(); track.scrollBy({ left: dir * step(), behavior: 'smooth' }); resumeSoon(); };
  if (next) next.addEventListener('click', () => nudge(1));
  if (prev) prev.addEventListener('click', () => nudge(-1));

  document.addEventListener('visibilitychange', () => { if (!document.hidden) last = 0; });
})();
