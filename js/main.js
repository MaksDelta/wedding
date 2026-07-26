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

/* ═══════════════ RSVP-ФОРМА (Google Apps Script) ═══════════════ */
(function rsvp() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  // ✏️ ВСТАВТЕ СЮДИ URL вашого веб-застосунку Apps Script:
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJ7iYc7oYgT648_ehIW5I2Z2vqJOTOjVMjrqfgGVBnMp7mDvm2qYA_tFPvBDy07dCQvQ/exec';

  const statusEl = document.getElementById('rsvp-status');
  const submitBtn = document.getElementById('rsvp-submit');
  const nameInput = form.elements['name'];
  const choiceWrap = form.querySelector('.rsvp-choice');

  const setStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.classList.remove('is-ok', 'is-err');
    if (type) statusEl.classList.add(type === 'ok' ? 'is-ok' : 'is-err');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const attending = form.querySelector('input[name="attending"]:checked');
    let ok = true;
    nameInput.classList.toggle('is-invalid', !name); if (!name) ok = false;
    choiceWrap.classList.toggle('is-invalid', !attending); if (!attending) ok = false;
    if (!ok) { setStatus('Будь ласка, вкажіть імʼя та оберіть відповідь.', 'err'); return; }

    if (SCRIPT_URL.startsWith('ВАШ')) {
      setStatus('Форму ще не підключено (додайте URL Apps Script).', 'err');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Надсилаємо…';
    setStatus('', '');
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form)),
      });
      form.reset();
      setStatus('Дякуємо! Вашу відповідь надіслано 🤍', 'ok');
      submitBtn.textContent = 'Надіслано ✓';
    } catch (err) {
      setStatus('Не вдалося надіслати. Спробуйте ще раз або зателефонуйте нам.', 'err');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Надіслати';
    }
  });
})();

/* ═══════════════ ДЕКОР: фігурки, що сходяться при скролі ═══════════════ */
(function coupleWalk() {
  const wrap = document.getElementById('couplewalk');
  if (!wrap) return;
  const l = wrap.querySelector('.couplewalk__f--l');
  const r = wrap.querySelector('.couplewalk__f--r');
  const heart = wrap.querySelector('.couplewalk__heart');
  const footer = document.querySelector('.footer');

  const gArm = wrap.querySelector('.couplewalk__f--l .cw-throw');
  const bArm = wrap.querySelector('.cw-barm');   // одна рухома рука нареченої
  const love = wrap.querySelector('.cw-love');
  const msg = wrap.querySelector('.cw-msg');
  const dress = wrap.querySelector('.cw-dress');
  const suit = wrap.querySelector('.cw-suit');

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const setArm = (el, deg) => { if (el) el.style.transform = 'rotate(' + deg + 'deg)'; };
  // піднята рука нареченої (bo — наскільки піднята); опущена рука зникає, щоб не було «третьої»
  const setBArm = (deg) => { if (bArm) bArm.style.transform = 'rotate(' + deg + 'deg)'; };
  const DRESS = ['#cbb488', '#e8a7cf', '#7d885f', '#9a8b78', '#c98f6a'];
  const SUIT  = ['#7d885f', '#4a3b2e', '#6d784c', '#8a7a58', '#3a4634'];
  let jumpL = 0, jumpR = 0;   // вертикальні стрибки фігурок

  // кеш позицій секцій
  const ids = ['countdown', 'schedule', 'location', 'dresscode', 'rsvp'];
  let secs = [];
  const measureSecs = () => {
    secs = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return { id, top: el.getBoundingClientRect().top + window.scrollY, h: el.offsetHeight };
    }).filter(Boolean);
  };

  const resetParts = () => {
    setArm(gArm, 0);
    setBArm(0);
    jumpL = 0; jumpR = 0;
    if (love) love.style.opacity = 0;
    if (msg) msg.style.opacity = 0;
    if (dress) dress.style.fill = '#cbb488';
    if (suit) suit.style.fill = '#7d885f';
  };

  // усе залежить від локального прогресу секції p (0..1)
  const scene = (id, p) => {
    const b = Math.sin(Math.PI * p);   // 0 на краях, 1 посередині
    if (id === 'countdown') {
      let ga = 0;
      if (p < 0.35) { const q = p / 0.35; ga = q < 0.5 ? lerp(0, -120, q / 0.5) : lerp(-120, -20, (q - 0.5) / 0.5); }
      setArm(gArm, ga);
      if (p > 0.18 && p < 0.72) {
        const q = (p - 0.18) / 0.54;
        msg.style.opacity = q < 0.15 ? q / 0.15 : (q > 0.85 ? (1 - q) / 0.15 : 1);
        const x = lerp(-44, 44, q), y = -4 - Math.sin(q * Math.PI) * 16;
        msg.style.transform = 'translateX(' + x + 'vw) translateY(' + y + 'px) scale(' + (0.7 + 0.3 * Math.sin(q * Math.PI)) + ')';
      }
      if (p > 0.5) {
        const q = (p - 0.5) / 0.5;
        const raise = Math.sin(q * Math.PI);              // плавно піднімає й опускає
        setBArm(raise * (150 + Math.sin(q * Math.PI * 6) * 22));   // махає (вгору-трохи-ліворуч)
      }
    } else if (id === 'schedule') {           // обидва підстрибують
      jumpL = -Math.abs(Math.sin(p * Math.PI * 3)) * 11;
      jumpR = -Math.abs(Math.sin(p * Math.PI * 3 + 0.7)) * 11;
      setArm(gArm, -22 * b);
      setBArm(18 * b);
    } else if (id === 'location') {           // обоє показують «нам туди»
      setArm(gArm, -80 * b);
      setBArm(80 * b);
    } else if (id === 'dresscode') {          // наречена міняє сукню, наречений — костюм; він плескає
      dress.style.fill = DRESS[Math.min(DRESS.length - 1, Math.floor(p * DRESS.length))];
      if (suit) suit.style.fill = SUIT[Math.min(SUIT.length - 1, Math.floor(((p + 0.35) % 1) * SUIT.length))];
      setArm(gArm, b * (-40 + Math.sin(p * Math.PI * 6) * 16));   // плескання (0 на краях)
    } else if (id === 'rsvp') {               // наречена шле повітряний поцілунок, наречений «ловить»
      setBArm(150 * b);
      const lq = clamp01((p - 0.25) / 0.75);
      love.style.opacity = Math.sin(lq * Math.PI);
      love.style.transform = 'translate(' + (-32 * lq) + 'px,' + (-26 * lq) + 'px) scale(' + (0.4 + lq) + ')';
      setArm(gArm, -100 * b);
    }
  };

  let ticking = false, runT = null;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const prog = max > 0 ? clamp01(window.scrollY / max) : 0;
    const GAP = window.innerWidth / 2 - 26;
    const offL = -(1 - prog) * GAP;
    const offR = (1 - prog) * GAP; // синхронне (дзеркальне) зближення
    heart.style.opacity = prog > 0.9 ? (prog - 0.9) / 0.1 : 0;
    wrap.classList.toggle('is-met', prog > 0.985);

    let bottom = 18;
    if (footer) { const ft = footer.getBoundingClientRect().top; bottom = Math.max(bottom, window.innerHeight - ft + 14); }
    wrap.style.bottom = bottom + 'px';

    // скрабінг жестів по активній секції (усе від скролу); під час поцілунку — руки спокійні
    resetParts();
    if (prog <= 0.985) {
      const center = window.scrollY + window.innerHeight / 2;
      for (const s of secs) {
        if (center >= s.top && center <= s.top + s.h) { scene(s.id, clamp01((center - s.top) / s.h)); break; }
      }
    }

    // зближення + стрибки
    l.style.transform = 'translateX(' + offL + 'px) translateY(' + jumpL + 'px)';
    r.style.transform = 'translateX(' + offR + 'px) translateY(' + jumpR + 'px)';
    ticking = false;
  };
  const onScroll = () => {
    wrap.classList.add('is-running');
    if (runT) clearTimeout(runT);
    runT = setTimeout(() => wrap.classList.remove('is-running'), 150);
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measureSecs(); update(); });
  window.addEventListener('load', () => { measureSecs(); update(); });
  setTimeout(() => { measureSecs(); update(); }, 700);
  setTimeout(() => { measureSecs(); update(); }, 1800);
  measureSecs();
  update();
})();
