import { World } from './world.js';
import { SLIDES } from './slides.js';
import { drawHeroPoster } from './textures.js';

const W = 1920, H = 1080;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

const viewport = document.querySelector('.viewport');
const canvas = viewport.querySelector('canvas');
const stage = viewport.querySelector('.stage');

// ---------- build slides ----------
const sections = SLIDES.map((s, i) => {
  const el = document.createElement('section');
  el.className = `slide slide--${s.kind || 'chapter'}`;
  el.dataset.i = i;
  el.setAttribute('aria-roledescription', 'slide');
  el.setAttribute('aria-label', `${i + 1} of ${SLIDES.length}: ${s.title || s.menu}`);
  const head = s.title
    ? `<header class="slide__head"><p class="eyebrow">${s.eyebrow}</p><h2 class="slide__title">${s.title}</h2><p class="slide__support">${s.support}</p></header>`
    : '';
  el.innerHTML = head + s.html;
  stage.insertBefore(el, stage.querySelector('.labels'));
  return el;
});

stage.querySelectorAll('.js-hero-poster').forEach((cv) => {
  const src = drawHeroPoster(600, 800);
  cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
});

// ---------- chrome ----------
const chrome = document.createElement('div');
chrome.className = 'chrome';
chrome.innerHTML = `
  <button class="play" type="button" aria-pressed="false"><svg viewBox="0 0 16 16"><path class="i-play" d="M4 2.5v11l9-5.5z"/><path class="i-pause" d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg><span>Play</span></button>
  <div class="chrome__bar">${SLIDES.map(() => '<i></i>').join('')}</div>
  <span class="chrome__count">01 / ${pad(SLIDES.length)}</span>`;
stage.appendChild(chrome);
const segs = [...chrome.querySelectorAll('.chrome__bar i')];
const count = chrome.querySelector('.chrome__count');
const playBtn = chrome.querySelector('.play');

const menuBtn = document.createElement('button');
menuBtn.className = 'menu-btn';
menuBtn.type = 'button';
menuBtn.innerHTML = '<svg viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h12"/></svg>Slides';
const menu = document.createElement('nav');
menu.className = 'menu';
menu.hidden = true;
menu.innerHTML = `<p class="menu__head">Marketing Assets Intelligence System</p><ol>${SLIDES.map((s, i) => `<li><button type="button" data-i="${i}"><span>${pad(i + 1)}</span>${s.title || s.menu}${s.chapter ? `<em>${s.chapter}</em>` : ''}</button></li>`).join('')}</ol>`;
stage.append(menuBtn, menu);

// ---------- labels ----------
const labelLayer = stage.querySelector('.labels');
let labels = [];
function setLabels(list) {
  labelLayer.innerHTML = '';
  const t0 = performance.now();
  labels = list.map((l) => {
    const el = document.createElement('div');
    el.className = `lbl ${l.cls || ''}`;
    el.innerHTML = `<i style="${l.color ? `--c:${l.color}` : ''}"></i><span class="lbl__t">${l.text}</span>${l.sub ? `<span class="lbl__s">${l.sub}</span>` : ''}`;
    labelLayer.appendChild(el);
    return { ...l, el, at: t0 + (l.delay || 0) * 1000 + 500 };
  });
}

// ---------- world ----------
let world = null;
const pt = { x: 0, y: 0, vis: false };

// ---------- navigation ----------
let cur = -1, step = 0, playing = false, timer = 0;

function go(i, s = 0, { instant = false } = {}) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  const slide = SLIDES[i];
  s = Math.max(0, Math.min(slide.states.length - 1, s));
  const changed = i !== cur;
  if (changed) {
    sections.forEach((el, k) => {
      el.classList.toggle('is-current', k === i);
      if (k !== i) el.classList.remove('is-in');
    });
    const el = sections[i];
    el.classList.remove('is-in');
    void el.offsetWidth;
    el.classList.add('is-in');
    startCounters(el);
  }
  cur = i; step = s;
  const el = sections[i];
  el.dataset.step = s;
  el.querySelectorAll('[data-from]').forEach((n) => n.classList.toggle('is-on', s >= +n.dataset.from));
  el.querySelectorAll('[data-step-on]').forEach((n) => {
    const k = +n.dataset.stepOn;
    n.classList.toggle('is-on', k === s);
    n.classList.toggle('is-done', k < s);
  });
  stage.dataset.kind = slide.kind || 'chapter';
  segs.forEach((g, k) => g.classList.toggle('is-done', k <= i));
  count.textContent = `${pad(i + 1)} / ${pad(SLIDES.length)}`;
  setLabels(slide.labels ? slide.labels(s) : []);
  if (world) world.apply({ ...slide.states[s], instant: instant || reduced });
  history.replaceState(null, '', `#${i + 1}${s ? '.' + (s + 1) : ''}`);
  schedule();
}

function next() {
  const slide = SLIDES[cur];
  if (step < slide.states.length - 1) go(cur, step + 1);
  else if (cur < SLIDES.length - 1) go(cur + 1, 0);
  else if (playing) togglePlay(false);
}
function prev() {
  if (step > 0) go(cur, step - 1);
  else if (cur > 0) go(cur - 1, SLIDES[cur - 1].states.length - 1);
}

function schedule() {
  clearTimeout(timer);
  if (!playing) return;
  const hold = (SLIDES[cur].hold || [])[step] ?? 7;
  timer = setTimeout(next, hold * 1000);
}
function togglePlay(on = !playing) {
  playing = on;
  playBtn.setAttribute('aria-pressed', on);
  playBtn.querySelector('span').textContent = on ? 'Pause' : 'Play';
  stage.classList.toggle('is-playing', on);
  schedule();
}

function startCounters(el) {
  el.querySelectorAll('.js-count').forEach((n) => {
    const to = +n.dataset.to, dur = +n.dataset.dur || 3000, t0 = performance.now() + 600;
    const tick = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      n.textContent = Math.round(to * (1 - Math.pow(1 - k, 2))).toLocaleString('en-GB');
      if (k < 1 && el.classList.contains('is-current')) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ---------- input ----------
function toggleMenu(open = menu.hidden) {
  menu.hidden = !open;
  stage.classList.toggle('menu-open', open);
}
menuBtn.addEventListener('click', () => toggleMenu());
menu.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (b) { toggleMenu(false); go(+b.dataset.i, 0); }
});
playBtn.addEventListener('click', () => togglePlay());

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (!menu.hidden && e.key === 'Escape') { toggleMenu(false); return; }
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter':
      e.preventDefault(); next(); break;
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
      e.preventDefault(); prev(); break;
    case 'Home': go(0, 0); break;
    case 'End': go(SLIDES.length - 1, 0); break;
    case 'm': case 'M': toggleMenu(); break;
    case 'p': case 'P': togglePlay(); break;
    case 'f': case 'F':
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
      break;
  }
});
let touchX = null;
viewport.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
viewport.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  touchX = null;
});

// ---------- layout ----------
function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const s = Math.min(vw / W, vh / H);
  const x = (vw - W * s) / 2, y = (vh - H * s) / 2;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  Object.assign(canvas.style, { left: x + 'px', top: y + 'px', width: W * s + 'px', height: H * s + 'px' });
  if (world) world.resize(Math.round(W * s), Math.round(H * s));
}
window.addEventListener('resize', layout);

// ---------- frame loop ----------
function frame(now) {
  if (world) {
    world.update(now);
    for (const l of labels) {
      const p = world.project(l.key, pt);
      const inTitle = p && p.x < 1250 && p.y < 330;
      const on = p && p.vis && !inTitle && now >= l.at && p.x > 40 && p.x < W - 260 && p.y > 60 && p.y < H - 40;
      l.el.classList.toggle('is-on', !!on);
      if (p) l.el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    }
  }
  requestAnimationFrame(frame);
}

// ---------- boot ----------
async function boot() {
  try {
    await Promise.all([
      document.fonts.load('600 40px Inter'), document.fonts.load('400 20px Inter'),
      document.fonts.load('500 20px "IBM Plex Mono"'),
    ]);
  } catch (e) { /* fonts are embedded; continue regardless */ }
  // fonts are ready, so canvas textures can be drawn
  stage.querySelectorAll('.js-hero-poster').forEach((cv) => {
    const src = drawHeroPoster(600, 800);
    const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(src, 0, 0, cv.width, cv.height);
  });
  world = new World(canvas);
  if (world.failed) { world = null; document.body.classList.add('no-gl'); }
  layout();
  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
  const i = m ? +m[1] - 1 : 0, s = m && m[2] ? +m[2] - 1 : 0;
  go(i, s, { instant: true });
  document.body.classList.add('is-ready');
  requestAnimationFrame(frame);
  if (new URLSearchParams(location.search).has('play')) togglePlay(true);
}
layout();
boot();

// expose for automated checks
window.__deck = { go, next, prev, get world() { return world; }, get cur() { return cur; } };
