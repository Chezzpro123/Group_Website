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

/* ======= GLOW ORB ======= */
let mouseX = 0, mouseY = 0, orbX = 0, orbY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
(function animate() {
  orbX += (mouseX - orbX) * 0.18;
  orbY += (mouseY - orbY) * 0.18;
  const x = orbX - (glow.offsetWidth / 2);
  const y = orbY - (glow.offsetHeight / 2);
  glow.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(animate);
})();

/* ========== CARD HOVER LIGHTING ========== */
function getAccentRGBA() {
  const s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return s || 'rgba(100,255,218,0.35)';
}

cards.forEach(card => {
  card.addEventListener('mouseenter', () => card.classList.add('lit'));
  card.addEventListener('mouseleave', () => card.classList.remove('lit'));
  card.addEventListener('click', () => openOverlayFor(card));
  card.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openOverlayFor(card);
  });
});

/* ========== OVERLAY BEHAVIOR ========== */
function openOverlayFor(card) {
  const type = card.dataset.card || 'generic';
  const accent = getAccentRGBA();
  overlayContent.innerHTML = '';

  if (type === 'outline') {
    overlayContent.innerHTML = `
      <h2>Streaming Outline</h2>
      <p>
        The stream will explore the importance and influence of Theater and Performing Arts in developing critical thinking, social awareness, educational growth, and emotional connection.
        <br><br>
        Each segment will focus on one key topic supported by discussions, videos, and personal insights. The full outline details topics like "The Evolution of Stagecraft", "Performing Arts in Education", and "Cultural Preservation Through Performance".
      </p>
      <br><br>
      <h1>4:00-4:05 | Critical thinking</h1>
      <p>
      The stream opens with a short video that encourages viewers to think critically. This serves as an icebreaker and sets the tone for that discussion.
      </p>

      <br><br>
      <h1>4:05–4:10 | Introduction to Theater and Performing Arts</h1>
      <p>
      We’ll narrate a video explaining the foundations of Theater and Performing Arts, introducing the main theme and why it remains a vital part of education and culture.
      </p>

      <br><br>
      <h1>4:10–4:20 | Theater’s Connection to Social Awareness</h1>
      <p>
      In this segment, we share our research and insights on how performing arts can raise social awareness and address real-life issues.
      (Example: how plays and performances can reflect or critique society.)
      </p>

      <br><br>
      <h1>4:20–4:30 | Theater’s Role in Educational Development</h1>
      <p>
      We discuss how engaging in theater activities enhances students’ creativity, communication, and teamwork, contributing to their overall educational growth.
      </p>

      <br><br>
      <h1>4:30–4:40 | Personal and Emotional Growth</h1>
      <p>
      We explain how theater helps individuals build empathy, confidence, and emotional intelligence through performance and storytelling.
      </p>

      <>br><br>
      <h1>4:40–4:45 | Conclusion</h1>
      <p>
      The stream wraps up with a short summary of key insights from all segments, highlighting how performing arts shape both individuals and communities.
      </p>
    `;
  } else if (type === 'plan') {
    overlayContent.innerHTML = `
      <h2>Promotional Plan</h2>
      <p>
       Pending...
      </p>
    `;
  } else if (type === 'posters') {
    const carousel = card.querySelector('.poster-carousel').cloneNode(true);
    overlayContent.appendChild(carousel);
    initCarousel(carousel);
  } else if (type === 'video') {
    const video = card.querySelector('video');
    if (video) {
      const bigVideo = document.createElement('video');
      bigVideo.controls = true;
      bigVideo.autoplay = true;
      bigVideo.style.width = '100%';
      bigVideo.style.borderRadius = '10px';
      Array.from(video.querySelectorAll('source')).forEach(s => {
        const srcEl = document.createElement('source');
        srcEl.src = s.src;
        srcEl.type = s.type;
        bigVideo.appendChild(srcEl);
      });
      overlayContent.appendChild(bigVideo);
    } else {
      overlayContent.textContent = 'No video found.';
    }
  }

  overlayInner.style.borderColor = 'transparent';
  overlayInner.classList.remove('aura');

  requestAnimationFrame(() => {
    overlayInner.style.borderColor = accent;
    overlayInner.classList.add('aura');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    overlayClose.focus();
  });
}

function closeOverlay() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlayInner.classList.remove('aura');
  overlayContent.innerHTML = '';
}

overlayClose.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay(); });

/* ========== CAROUSEL LOGIC ========== */
function initCarousel(root) {
  const track = root.querySelector('.carousel-track');
  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const left = root.querySelector('.carousel-btn.left');
  const right = root.querySelector('.carousel-btn.right');
  const dotsWrap = root.querySelector('.carousel-dots');
  if (items.length === 0) return;

  let idx = 0;
  const go = (n) => {
    idx = (n + items.length) % items.length;
    refresh();
  };
  const refresh = () => {
    items.forEach((it, i) => {
      it.classList.toggle('active', i === idx);
      if (dotsWrap) dotsWrap.children[i].style.background = i === idx ? 'var(--accent-border)' : 'rgba(0,0,0,0.12)';
    });
  };

  if (dotsWrap) {
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
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
    });
  }

  left.addEventListener('click', () => go(idx - 1));
  right.addEventListener('click', () => go(idx + 1));

  let autoplay = true;
  let timer = setInterval(() => { if (autoplay) go(idx + 1); }, 4500);
  root.addEventListener('mouseenter', () => autoplay = false);
  root.addEventListener('mouseleave', () => autoplay = true);

  refresh();
}

document.querySelectorAll('.poster-carousel').forEach(c => initCarousel(c));

/* ========== SYNC GLOW COLOR ========= */
function syncAccentColor() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'rgba(100,255,218,0.35)';
  document.documentElement.style.setProperty('--computed-accent', accent);
  overlayInner.style.setProperty('border-color', accent);
}
syncAccentColor();
new MutationObserver(syncAccentColor).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
