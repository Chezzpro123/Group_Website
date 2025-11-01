/* ========== ELEMENTS ========== */
const body = document.body;
const toggleBtn = document.getElementById('modeToggle');
const glow = document.querySelector('.glow');
const cards = Array.from(document.querySelectorAll('.card'));
const overlay = document.getElementById('overlay');
const overlayInner = document.querySelector('.overlay-inner');
const overlayContent = document.getElementById('overlayContent');
const overlayClose = document.getElementById('overlayClose');

/* ========== THEME TOGGLE ========== */
toggleBtn.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark');
  toggleBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
  toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
});

/* ======= GLOW ORB: follow mouse ======= */
let mouseX = 0, mouseY = 0, orbX = 0, orbY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// smooth follow
(function animate() {
  orbX += (mouseX - orbX) * 0.18;
  orbY += (mouseY - orbY) * 0.18;
  // center the orb on cursor
  const x = orbX - (glow.offsetWidth / 2);
  const y = orbY - (glow.offsetHeight / 2);
  glow.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(animate);
})();

/* ========== CARD HOVER LIGHTING ========== */
/* When hovering a card we add .lit so it picks up CSS border-color and shadow.
   We also sync the border color to the accent variable so it matches the orb. */

function getAccentRGBA(){
  // read --accent value; fallback to computed color
  const s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return s || 'rgba(100,255,218,0.35)';
}

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.classList.add('lit');
  });
  card.addEventListener('mouseleave', () => {
    card.classList.remove('lit');
  });

  // open fullscreen on click
  card.addEventListener('click', () => openOverlayFor(card));
  card.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' || e.key === ' ') openOverlayFor(card);
  });
});

/* ========== OVERLAY (EXPAND SECTION) ========== */
function openOverlayFor(card){
  // clone content or build custom content depending on card type
  const type = card.dataset.card || 'generic';
  const accent = getAccentRGBA();
  overlayContent.innerHTML = ''; // reset

  // build content based on type
  if(type === 'posters'){
    // move carousel into overlay (clone)
    const carousel = card.querySelector('.poster-carousel');
    const clone = carousel.cloneNode(true);
    // ensure cloned images are visible/active in overlay (carousel logic will reinit)
    overlayContent.appendChild(clone);
    initCarousel(clone); // attach carousel behavior to clone
  } else if(type === 'video'){
    const video = card.querySelector('video');
    if(video){
      // clone but keep source; create new video element to avoid playback conflicts
      const sources = Array.from(video.querySelectorAll('source')).map(s => ({ src: s.src, type: s.type }));
      const bigVideo = document.createElement('video');
      bigVideo.controls = true;
      bigVideo.autoplay = true;
      bigVideo.style.width = '100%';
      bigVideo.style.borderRadius = '10px';
      sources.forEach(s => {
        const srcEl = document.createElement('source');
        srcEl.src = s.src;
        srcEl.type = s.type;
        bigVideo.appendChild(srcEl);
      });
      overlayContent.appendChild(bigVideo);
    } else {
      overlayContent.textContent = 'No video found.';
    }
  } else {
    // generic text/plan/outline: clone inner HTML
    const cloneInner = card.cloneNode(true);
    cloneInner.style.boxShadow = 'none';
    cloneInner.style.cursor = 'default';
    // remove interactive elements inside clone
    cloneInner.querySelectorAll('button,video').forEach(n => n.remove());
    overlayContent.appendChild(cloneInner);
  }

  // Visual sync: set overlay border + aura color
  overlayInner.style.borderColor = 'transparent'; // reset first
  overlayInner.classList.remove('aura');

  // Force reflow for smooth transition
  requestAnimationFrame(() => {
    // set border using accent color
    overlayInner.style.borderColor = accent;
    overlayInner.classList.add('aura');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    // focus trap-ish: focus close
    overlayClose.focus();
  });
}

/* close overlay */
function closeOverlay(){
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  overlayInner.classList.remove('aura');
  overlayContent.innerHTML = '';
}

/* close via close button */
overlayClose.addEventListener('click', closeOverlay);

/* close on background click (if clicking outside inner panel) */
overlay.addEventListener('click', (e) => {
  if(e.target === overlay) closeOverlay();
});

/* close on Esc */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
});

/* ========== CAROUSEL LOGIC ========== */
/* Works for the in-page carousel and for cloned overlay carousel.
   initCarousel(root) - root is .poster-carousel element
*/
function initCarousel(root){
  const track = root.querySelector('.carousel-track');
  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const left = root.querySelector('.carousel-btn.left');
  const right = root.querySelector('.carousel-btn.right');
  const dotsWrap = root.querySelector('.carousel-dots');

  if(items.length === 0) return;

  let idx = 0;
  // initial state
  items.forEach((it, i) => {
    it.classList.toggle('active', i === idx);
    it.style.transform = 'scale(0.98)';
  });

  // build dots
  if(dotsWrap){
    dotsWrap.innerHTML = '';
    items.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot';
      d.style.margin = '0 4px';
      d.style.width = '8px';
      d.style.height = '8px';
      d.style.borderRadius = '50%';
      d.style.border = '0';
      d.style.background = i === idx ? 'var(--accent-border)' : 'rgba(0,0,0,0.12)';
      d.addEventListener('click', () => { go(i); });
      dotsWrap.appendChild(d);
    });
  }

  function refresh(){
    items.forEach((it, i) => {
      it.classList.toggle('active', i === idx);
      it.style.transform = i === idx ? 'scale(1)' : 'scale(0.98)';
      if(dotsWrap) dotsWrap.children[i].style.background = i === idx ? 'var(--accent-border)' : 'rgba(0,0,0,0.12)';
    });
  }

  function go(n){
    idx = (n + items.length) % items.length;
    refresh();
  }

  left.addEventListener('click', () => go(idx - 1));
  right.addEventListener('click', () => go(idx + 1));

  // optional: allow swipe on mobile
  let startX = null;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, {passive:true});
  track.addEventListener('touchend', (e) => {
    if(startX === null) return;
    const delta = (e.changedTouches[0].clientX - startX);
    if(delta > 40) go(idx - 1);
    else if(delta < -40) go(idx + 1);
    startX = null;
  });

  // autoplay small
  let autoplay = true;
  let timer = setInterval(() => { if(autoplay) go(idx + 1); }, 4500);
  // pause on hover
  root.addEventListener('mouseenter', () => autoplay = false);
  root.addEventListener('mouseleave', () => autoplay = true);
}

/* init all carousels present on page */
document.querySelectorAll('.poster-carousel').forEach(c => initCarousel(c));

/* ========== SYNC GLOW COLOR WITH BORDER on hover / overlay ========= */
/* Update CSS variable --accent-border when theme changes or later */
function syncAccentColor(){
  // compute accent from root var --accent (which might be rgba)
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'rgba(100,255,218,0.35)';
  // set a CSS var used by overlay border if needed
  document.documentElement.style.setProperty('--computed-accent', accent);
  // also apply to overlay border styling directly for consistent result
  overlayInner.style.setProperty('border-color', accent);
}
syncAccentColor();

// watch for theme toggle to resync
new MutationObserver(syncAccentColor).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });