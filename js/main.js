/* =========================================
   PAVIO CURTO — main.js
   ========================================= */

'use strict';

/* ─── NAV / Hamburger ──────────────────── */
(function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.querySelector('.nav__menu');
  if (!toggle || !menu) return;

  const open  = () => { toggle.classList.add('open'); menu.classList.add('open'); document.body.style.overflow = 'hidden'; toggle.setAttribute('aria-expanded', 'true'); };
  const close = () => { toggle.classList.remove('open'); menu.classList.remove('open'); document.body.style.overflow = ''; toggle.setAttribute('aria-expanded', 'false'); };
  const toggleMenu = () => toggle.classList.contains('open') ? close() : open();

  toggle.addEventListener('click', toggleMenu);

  // Close on link click
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) close();
  });

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Highlight active link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  menu.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop();
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });
})();

/* ─── Nav scroll style ─────────────────── */
(function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.style.borderBottomColor = window.scrollY > 20 ? 'var(--border)' : 'transparent';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── Scroll Reveal ────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .stagger');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ─── Page transitions ─────────────────── */
(function initPageTransitions() {
  // Only animate out on same-origin internal links
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    link.addEventListener('click', function(e) {
      const wrapper = document.querySelector('.page-wrapper');
      if (!wrapper) return;
      e.preventDefault();
      wrapper.classList.add('page-out');
      setTimeout(() => { window.location.href = this.href; }, 320);
    });
  });
})();

/* ─── Cifra: Transpose ─────────────────── */
(function initTranspose() {
  const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const CHORD_RE = /([A-G][b#]?)(m(?:aj)?[0-9]*|maj[0-9]*|[0-9]+|dim|aug|sus[24]?|add[0-9]+|[mM])?(\s*\/\s*[A-G][b#]?)?/g;

  let semitones = 0;
  const display = document.getElementById('transposeDisplay');
  const plusBtn = document.getElementById('transposeUp');
  const minBtn  = document.getElementById('transposeDown');
  if (!plusBtn || !minBtn) return;

  function noteIndex(note) {
    let i = NOTES_SHARP.indexOf(note);
    if (i === -1) i = NOTES_FLAT.indexOf(note);
    return i;
  }
  function transposeNote(note, steps) {
    const idx = noteIndex(note);
    if (idx === -1) return note;
    return NOTES_SHARP[((idx + steps) % 12 + 12) % 12];
  }
  function transposeChord(chord, steps) {
    return chord.replace(CHORD_RE, (match, root, quality = '', bass = '') => {
      if (!root) return match;
      const newRoot = transposeNote(root, steps);
      const newBass = bass ? bass.replace(/([A-G][b#]?)/, n => transposeNote(n, steps)) : '';
      return newRoot + quality + newBass;
    });
  }
  function applyTranspose() {
    document.querySelectorAll('.chord').forEach(el => {
      const original = el.dataset.original || el.textContent;
      el.dataset.original = original;
      el.textContent = transposeChord(original, semitones);
    });
    display.textContent = semitones === 0 ? 'Tom' : (semitones > 0 ? '+' + semitones : semitones);
  }

  plusBtn.addEventListener('click', () => { semitones = ((semitones + 1) % 12 + 12) % 12; if (semitones > 6) semitones -= 12; applyTranspose(); });
  minBtn.addEventListener('click',  () => { semitones = ((semitones - 1) % 12 + 12) % 12; if (semitones > 6) semitones -= 12; applyTranspose(); });
})();

/* ─── Cifra: Font size ─────────────────── */
(function initFontSize() {
  const body = document.querySelector('.cifra-body');
  if (!body) return;
  const sizes = ['size-sm', 'size-md', 'size-lg', 'size-xl'];
  let current = 1; // md default
  body.classList.add(sizes[current]);

  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir;
      if (dir === 'up'   && current < sizes.length - 1) current++;
      if (dir === 'down' && current > 0) current--;
      body.className = body.className.replace(/size-\w+/, '') + ' ' + sizes[current];
      document.querySelectorAll('.font-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();

/* ─── Repertório: Search filter ─────────── */
(function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll('.song-row').forEach(row => {
      const title = row.querySelector('.song-row__title')?.textContent.toLowerCase() || '';
      const meta  = row.querySelector('.song-row__meta')?.textContent.toLowerCase() || '';
      row.style.display = (title.includes(q) || meta.includes(q)) ? '' : 'none';
    });
    // Hide dividers if all songs in section hidden
    document.querySelectorAll('.cat-divider').forEach(div => {
      let next = div.nextElementSibling;
      let anyVisible = false;
      while (next && !next.classList.contains('cat-divider')) {
        if (next.classList.contains('song-row') && next.style.display !== 'none') anyVisible = true;
        next = next.nextElementSibling;
      }
      div.style.display = anyVisible ? '' : 'none';
    });
  });
})();
