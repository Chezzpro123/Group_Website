const body = document.body;
const toggleBtn = document.getElementById("modeToggle");
const glow = document.querySelector(".glow");
const cards = Array.from(document.querySelectorAll(".card"));
const overlay = document.getElementById("overlay");
const overlayInner = document.querySelector(".overlay-inner");
const overlayContent = document.getElementById("overlayContent");
const overlayClose = document.getElementById("overlayClose");

/* THEME TOGGLE */
toggleBtn.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark");
  toggleBtn.textContent = isDark ? "🌙 Dark Mode" : "☀️ Light Mode";
  toggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
});

/* GLOW ORB */
let mouseX = 0,
  mouseY = 0,
  orbX = 0,
  orbY = 0;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
(function animate() {
  orbX += (mouseX - orbX) * 0.18;
  orbY += (mouseY - orbY) * 0.18;
  glow.style.transform = `translate(${orbX - glow.offsetWidth / 2}px, ${
    orbY - glow.offsetHeight / 2
  }px)`;
  requestAnimationFrame(animate);
})();

/* CARD HOVER */
cards.forEach((card) => {
  card.addEventListener("mouseenter", () => card.classList.add("lit"));
  card.addEventListener("mouseleave", () => card.classList.remove("lit"));
  // Only open the global overlay for specific cards (exclude posters and video)
  if ((card.dataset.card || "") !== "posters" && (card.dataset.card || "") !== "video") {
    card.addEventListener("click", () => openOverlayFor(card));
    card.addEventListener("keyup", (e) => {
      if (e.key === "Enter" || e.key === " ") openOverlayFor(card);
    });
  }
});

/* OVERLAY BEHAVIOR */
function openOverlayFor(card) {
  const type = card.dataset.card || "generic";
  overlayContent.querySelectorAll(".overlay-item").forEach((el) => (el.hidden = true));

  const item = overlayContent.querySelector(`.overlay-item[data-card="${type}"]`);
  if (item) {
    // clone carousel if posters
    if (type === "posters") {
      const original = card.querySelector(".poster-carousel");
      const carousel = original.cloneNode(true);
      // add nav buttons for overlay only
      const leftBtn = document.createElement("button");
      leftBtn.className = "carousel-btn left";
      leftBtn.setAttribute("aria-label", "Previous poster");
      leftBtn.textContent = "‹";
      const rightBtn = document.createElement("button");
      rightBtn.className = "carousel-btn right";
      rightBtn.setAttribute("aria-label", "Next poster");
      rightBtn.textContent = "›";
      carousel.insertBefore(leftBtn, carousel.firstChild);
      carousel.appendChild(rightBtn);

      item.appendChild(carousel);
      initCarousel(carousel, { auto: true });
    } else {
      item.hidden = false;
    }
  }

  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  overlayClose.focus();
}

function closeOverlay() {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  overlayContent.querySelectorAll(".overlay-item").forEach((el) => (el.hidden = true));
}

overlayClose.addEventListener("click", closeOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("open")) closeOverlay();
});

/* SIMPLE CAROUSEL */
function initCarousel(root, opts = { auto: true }) {
  const track = root.querySelector(".carousel-track");
  const items = Array.from(track.querySelectorAll(".carousel-item"));
  const left = root.querySelector(".carousel-btn.left");
  const right = root.querySelector(".carousel-btn.right");
  let idx = 0;

  const go = (n) => {
    idx = (n + items.length) % items.length;
    refresh();
    resetTimer();
  };
  const refresh = () => {
    items.forEach((it, i) => it.classList.toggle("active", i === idx));
  };

  // click logic: select if not active; if active, open spotlight modal (not fullscreen)
  items.forEach((img, i) => {
    img.addEventListener("click", () => {
      if (i !== idx) {
        go(i);
      } else {
        openSpotlight(img.src, img.alt, root, idx, items);
      }
    });
  });

  if (left && right) {
    left.addEventListener("click", () => go(idx - 1));
    right.addEventListener("click", () => go(idx + 1));
  }

  // 30s auto-scroll
  let timer = null;
  function resetTimer() {
    if (!opts.auto) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 30000);
  }

  refresh();
  resetTimer();
}

// Initialize main page carousel with auto-scroll and with nav buttons present
// Poster card no longer uses global overlay; it uses a lightweight spotlight
// for the active image when clicked.
document.querySelectorAll(".poster-carousel").forEach((c) => initCarousel(c, { auto: true }));

// Lightweight spotlight implementation
let spotlightEl = null;
let spotlightCarousel = null;
function openSpotlight(src, alt, carousel, currentIdx, items) {
  if (!spotlightEl) {
    spotlightEl = document.createElement("div");
    spotlightEl.className = "overlay open";
    spotlightEl.innerHTML = `
      <div class="overlay-inner spotlight" role="dialog" aria-modal="true">
        <button class="overlay-close" aria-label="Close">✕</button>
        <button class="spotlight-nav left" aria-label="Previous poster">‹</button>
        <button class="spotlight-nav right" aria-label="Next poster">›</button>
        <div class="overlay-content">
          <img class="spotlight-img" src="" alt="" />
        </div>
      </div>`;
    document.body.appendChild(spotlightEl);
    spotlightEl.querySelector(".overlay-close").addEventListener("click", closeSpotlight);
    spotlightEl.addEventListener("click", (e) => { if (e.target === spotlightEl) closeSpotlight(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && spotlightEl.classList.contains("open")) closeSpotlight(); });
  }
  const img = spotlightEl.querySelector(".spotlight-img");
  img.src = src;
  img.alt = alt || "Poster";
  spotlightEl.classList.add("open");
  spotlightEl.setAttribute("aria-hidden", "false");
  
  // Handle carousel navigation buttons if carousel is provided
  spotlightCarousel = { carousel, items, currentIdx };
  const leftBtn = spotlightEl.querySelector(".spotlight-nav.left");
  const rightBtn = spotlightEl.querySelector(".spotlight-nav.right");
  
  if (carousel && items) {
    leftBtn.style.display = "block";
    rightBtn.style.display = "block";
    leftBtn.onclick = () => navigateSpotlightCarousel(-1);
    rightBtn.onclick = () => navigateSpotlightCarousel(1);
  } else {
    leftBtn.style.display = "none";
    rightBtn.style.display = "none";
  }
}

function navigateSpotlightCarousel(direction) {
  if (!spotlightCarousel) return;
  const { carousel, items } = spotlightCarousel;
  const track = carousel.querySelector(".carousel-track");
  const currentActive = track.querySelector(".carousel-item.active");
  const currentIdx = items.indexOf(currentActive);
  const newIdx = (currentIdx + direction + items.length) % items.length;
  
  items.forEach((it, i) => it.classList.toggle("active", i === newIdx));
  const newImg = items[newIdx];
  const img = spotlightEl.querySelector(".spotlight-img");
  img.src = newImg.src;
  img.alt = newImg.alt;
}
function closeSpotlight() {
  if (!spotlightEl) return;
  spotlightEl.classList.remove("open");
  spotlightEl.setAttribute("aria-hidden", "true");
}

// Mobile handling for documentary link: try fullscreen-like iframe; fallback to navigation
(function setupDocLink() {
  const link = document.getElementById("docLink");
  if (!link) return;
  const url = link.href;
  function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }
  link.addEventListener("click", (e) => {
    if (!isMobile()) return; // desktop: allow default (new tab)
    e.preventDefault();
    openDocFullscreen(url);
  });
})();

function openDocFullscreen(url) {
  if (!spotlightEl) {
    openSpotlight("", ""); // initialize container
  } else {
    spotlightEl.classList.add("open");
    spotlightEl.setAttribute("aria-hidden", "false");
  }
  const content = spotlightEl.querySelector(".overlay-content");
  content.innerHTML = '<iframe class="doc-iframe" src="' + url + '" allowfullscreen style="width:100vw;height:100vh;border:0;display:block;"></iframe>';
}
