const body = document.body;
const toggleBtn = document.getElementById('modeToggle');
const glow = document.querySelector('.glow');
const cards = Array.from(document.querySelectorAll('.card'));
const overlay = document.getElementById('overlay');
const overlayInner = document.querySelector('.overlay-inner');
const overlayContent = document.getElementById('overlayContent');
const overlayClose = document.getElementById('overlayClose');

/* THEME TOGGLE */
toggleBtn.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark');
  toggleBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
  toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
});

/* GLOW ORB */
let mouseX = 0, mouseY = 0, orbX = 0, orbY = 0;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
(function animate() {
  orbX += (mouseX - orbX) * 0.18;
  orbY += (mouseY - orbY) * 0.18;
  glow.style.transform = `translate(${orbX - glow.offsetWidth/2}px, ${orbY - glow.offsetHeight/2}px)`;
  requestAnimationFrame(animate);
})();

/* CARD HOVER */
cards.forEach(card => {
  card.addEventListener('mouseenter', () => card.classList.add('lit'));
  card.addEventListener('mouseleave', () => card.classList.remove('lit'));
  card.addEventListener('click', () => openOverlayFor(card));
  card.addEventListener('keyup', e => { if(e.key === 'Enter' || e.key === ' ') openOverlayFor(card); });
});

/* OVERLAY BEHAVIOR */
function openOverlayFor(card) {
  const type = card.dataset.card || 'generic';
  overlayContent.querySelectorAll('.overlay-item').forEach(el => el.hidden = true);

  const item = overlayContent.querySelector(`.overlay-item[data-card="${type}"]`);
  if(item) {
    // clone carousel if posters
    if(type === 'posters') {
      const carousel = card.querySelector('.poster-carousel').cloneNode(true);
      item.appendChild(carousel);
      initCarousel(carousel);
    }
    item.hidden = false;
  }

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  overlayClose.focus();
}

function closeOverlay() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlayContent.querySelectorAll('.overlay-item').forEach(el => el.hidden = true);
}

overlayClose.addEventListener('click', closeOverlay);
overlay.addEventListener('click', e => { if(e.target === overlay) closeOverlay(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay(); });

/* SIMPLE CAROUSEL */
function initCarousel(root) {
  const track = root.querySelector('.carousel-track');
  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const left = root.querySelector('.carousel-btn.left');
  const right = root.querySelector('.carousel-btn.right');
  let idx = 0;

  const go = n => { idx = (n + items.length) % items.length; refresh(); };
  const refresh = () => { items.forEach((it,i) => it.classList.toggle('active', i === idx)); };
  
  left.addEventListener('click', () => go(idx-1));
  right.addEventListener('click', () => go(idx+1));
  refresh();
}

document.querySelectorAll('.poster-carousel').forEach(c => initCarousel(c));
