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

/* ═══════════════ ДЕКОР: пелюстки часу (падають до низу видимого екрана, збираються, реагують на скрол) ═══════════════ */
(function petals() {
  const box = document.getElementById('particles');
  if (!box) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COLORS = [
    'rgba(232,167,207,.62)', // рожевий
    'rgba(125,136,95,.5)',   // шавлія
    'rgba(201,162,74,.5)',   // золото
    'rgba(255,255,255,.85)', // світлий
  ];
  const countdown = document.getElementById('countdown');
  const footer = document.querySelector('.footer');

  let W = window.innerWidth, top0 = 0, H = 0, pileYFooter = 0;
  function measure() {
    if (!countdown) return;
    top0 = countdown.getBoundingClientRect().bottom + window.scrollY - 70;
    H = document.documentElement.scrollHeight - top0;
    box.style.top = top0 + 'px';
    box.style.height = H + 'px';
    W = box.clientWidth || window.innerWidth;
    pileYFooter = footer ? (footer.getBoundingClientRect().top + window.scrollY - top0) : (H - 40);
  }
  // «підлога» = низ видимого екрана (у координатах контейнера), обмежена футером
  function computeFloor() {
    return Math.max(0, Math.min((window.scrollY + window.innerHeight) - top0 - 24, pileYFooter));
  }

  const N = 120;         // пул пелюсток (безперервно рециклюються)
  const B = 40;          // колонки для стека купки
  const layerH = 7;      // висота шару (менша = щільніша купка, ближче до дна)
  const buckets = Array.from({ length: B }, () => []);
  const arr = [];
  let total = 0;

  const bucketAt = (x) => Math.max(0, Math.min(B - 1, (x / Math.max(W, 1) * B) | 0));

  // прибрати пелюстку з купки → верхні осідають у прогалину
  function removeFromPile(p) {
    if (p.bucket < 0) return;
    const b = buckets[p.bucket];
    const i = b.indexOf(p);
    if (i >= 0) { b.splice(i, 1); for (let k = i; k < b.length; k++) b[k].layer = k; }
    p.bucket = -1; p.landed = false;
  }

  function reset(p) {
    p.x = Math.random() * W; p.y = -20 - Math.random() * 140; p.vy = 0;
    p.ph = Math.random() * Math.PI * 2; p.rot = Math.random() * 360;
    p.rest = 0; p.recycle = false; p.op = 0;
    p.lifespan = 5 + Math.random() * 10;
    p.bucket = -1; p.layer = 0; p.landed = false;
  }

  function spawn() {
    if (total >= N) return;
    total++;
    const size = 8 + Math.random() * 10;
    const color = COLORS[(Math.random() * COLORS.length) | 0];
    const el = document.createElement('span');
    el.className = 'particle';
    el.style.width = size + 'px';
    el.style.height = (size * 0.62) + 'px';
    el.style.background = 'linear-gradient(135deg, rgba(255,255,255,.9), ' + color + ' 85%)';
    box.appendChild(el);
    arr.push({
      el, x: Math.random() * W, y: -20 - Math.random() * 140, vy: 0,
      ph: Math.random() * Math.PI * 2, amp: 6 + Math.random() * 16,
      rot: Math.random() * 360, vr: (Math.random() * 2 - 1) * 45, size,
      rest: 0, lifespan: 5 + Math.random() * 10, recycle: false, op: 0,
      bucket: -1, layer: 0, landed: false,
    });
  }

  let lastT = 0, floorY = 0;
  function frame(t) {
    if (!lastT) lastT = t;
    let dt = (t - lastT) / 1000; lastT = t; if (dt > 0.05) dt = 0.05;
    floorY = computeFloor();

    for (const p of arr) {
      if (p.recycle) {
        // згасає на місці, звільняючи прогалину; потім падає заново
        p.op -= dt * 2;
        if (p.op <= 0) { reset(p); continue; }
        p.el.style.opacity = Math.max(0, p.op);
        p.el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + p.rot + 'deg)';
        continue;
      }

      const restOff = (p.landed ? p.layer : buckets[bucketAt(p.x)].length) * layerH;
      const target = floorY - restOff;

      if (p.y < target - 0.5) {
        // падає з повітря, або осідає в прогалину (коли нижня зникла)
        p.vy = Math.min(p.vy + 240 * dt, 150);
        p.y += p.vy * dt;
        if (!p.landed) { p.ph += dt * 1.6; p.rot += p.vr * dt; }
        p.rest = 0;
        if (p.y >= target) {
          p.y = target; p.vy = 0;
          if (!p.landed) {
            const bi = bucketAt(p.x);
            p.bucket = bi; p.layer = buckets[bi].length; buckets[bi].push(p); p.landed = true;
          }
        }
      } else {
        // лежить — тримається (їде синхронно зі скролом угору), рахує час життя
        p.y = target; p.vy = 0;
        if (p.landed) {
          p.rest += dt;
          if (p.rest > p.lifespan) { p.recycle = true; removeFromPile(p); }
        }
      }

      const airborne = !p.landed;
      const x = p.x + (airborne ? Math.sin(p.ph) * p.amp : 0);
      let op = p.y < 46 ? Math.max(0, p.y / 46) : 1;   // зникають угорі (біля відліку)
      op *= airborne ? 0.6 : 0.88;
      p.op = op;
      p.el.style.opacity = op;
      p.el.style.transform = 'translate(' + x + 'px,' + p.y + 'px) rotate(' + p.rot + 'deg)';
    }
    requestAnimationFrame(frame);
  }

  function start() {
    measure();
    for (let i = 0; i < 10; i++) spawn();  // на старті — потроху
    requestAnimationFrame(frame);
    const iv = setInterval(() => { if (total >= N) { clearInterval(iv); return; } spawn(); }, 300);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    setTimeout(measure, 700);
    setTimeout(measure, 1800); // межі стабілізуються після шрифтів/появи контенту
  }
  if (!document.body.classList.contains('is-locked')) start();
  else {
    const wait = setInterval(() => {
      if (!document.body.classList.contains('is-locked')) { clearInterval(wait); start(); }
    }, 200);
  }
})();
