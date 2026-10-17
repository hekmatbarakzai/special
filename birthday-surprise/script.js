const cfg = window.BirthdayConfig || {
  name: 'Sweetheart',
  birthdayDate: '2026-10-17',
  message: 'You are loved beyond words.',
  reasons: ['You make every day brighter.'],
  wishes: ['May all your dreams come true.'],
  photos: [{ src: 'download.jpg', caption: 'Memory' }],
  theme: { primary: '#f7a8d8', secondary: '#c9a0ff', accent: '#ffd76d' },
  finalMessage: 'Happy Birthday Again!'
};

// IMPORTANT: Only use the attached project photos as decorative ambience.
// All main photo areas are intentionally left as placeholders so real photos
// can be dropped in later without rewriting the layout structure.

const state = {
  music: null,
  isPlaying: false,
  letterOpen: false,
  countdownInterval: null,
  activeLightbox: null,
  theme: cfg.theme || {}
};

const photosAsBackgroundOnly = Boolean(cfg.photosAsBackgroundOnly);
const safeRelativePath = (src) => `./assets/photos/${src}`;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove('visible'), 1800);
}

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty('--primary', state.theme.primary || '#f7a8d8');
  root.style.setProperty('--secondary', state.theme.secondary || '#c9a0ff');
  root.style.setProperty('--accent', state.theme.accent || '#ffd76d');
}

function applyProjectPhotoBackgrounds() {
  const root = document.documentElement;
  const photos = cfg.photos || [];
  const layers = ['--bg-photo-1', '--bg-photo-2', '--bg-photo-3', '--bg-photo-4'];

  layers.forEach((layer, index) => {
    const photo = photos[index];
    root.style.setProperty(layer, photo ? `url("${safeRelativePath(photo.src)}")` : 'none');
  });
}

function populateNames() {
  const nameNodes = document.querySelectorAll('[data-name]');
  nameNodes.forEach((node) => {
    const current = node.dataset.name || 'name';
    if (current === 'greeting') node.textContent = cfg.name;
    else if (current === 'hero') node.textContent = cfg.name;
    else if (current === 'letter') node.textContent = cfg.name;
    else if (current === 'finale') node.textContent = cfg.name;
  });
}

function buildAnimatedName(el, text) {
  if (!el) return;
  el.innerHTML = '';
  [...text].forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(22px) rotateX(-80deg)';
    span.style.transition = 'transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.75s ease';
    span.style.transitionDelay = `${index * 0.045}s`;
    el.appendChild(span);
    requestAnimationFrame(() => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(0) rotateX(0deg)';
    });
  });
}

function buildDecorativePhotos() {
  if (photosAsBackgroundOnly) return;

  const rail = document.getElementById('decorative-photos');
  if (!rail || !cfg.photos || !cfg.photos.length) return;

  const photos = cfg.photos.slice(0, 5);
  photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'decor-photo';
    card.style.backgroundImage = `url('${safeRelativePath(photo.src)}')`;
    card.style.animationDelay = `${index * 0.4}s`;
    card.style.setProperty('--rot', `${(index % 2 === 0 ? 1 : -1) * (8 + index * 4)}deg`);
    rail.appendChild(card);
  });
}

function buildOrbitGallery() {
  if (photosAsBackgroundOnly) return;

  const container = document.getElementById('gallery-carousel');
  if (!container || !cfg.photos || !cfg.photos.length) return;

  cfg.photos.forEach((photo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'orbit-card';
    card.style.backgroundImage = `url('${safeRelativePath(photo.src)}')`;
    card.style.transform = `translate(-50%, -50%) rotateY(${index * 52}deg) translateZ(170px) rotateX(10deg)`;
    card.setAttribute('aria-label', photo.caption || `Memory ${index + 1}`);
    card.addEventListener('click', () => openLightbox(photo));
    container.appendChild(card);
  });

  let angle = 0;
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;

  const updateOrbit = () => {
    Array.from(container.children).forEach((child, idx) => {
      const offset = (idx * 52 + angle) % 360;
      const rad = (offset * Math.PI) / 180;
      const x = Math.sin(rad) * 170;
      const z = Math.cos(rad) * 170;
      const y = Math.sin(rad * 2) * 18;
      child.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${offset}deg) scale(${offset % 360 > 180 ? 0.88 : 1})`;
      child.style.zIndex = String(Math.round(1000 + z));
    });
  };

  container.addEventListener('pointerdown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startAngle = angle;
    container.setPointerCapture(event.pointerId);
  });

  container.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;
    angle = startAngle - delta * 0.25;
    updateOrbit();
  });

  container.addEventListener('pointerup', () => {
    isDragging = false;
  });

  container.addEventListener('pointerleave', () => {
    isDragging = false;
  });

  setInterval(() => {
    if (!isDragging) {
      angle += 0.6;
      updateOrbit();
    }
  }, 30);

  updateOrbit();
}

function buildPolaroidGallery() {
  if (photosAsBackgroundOnly) return;

  const container = document.getElementById('gallery-polaroid');
  if (!container || !cfg.photos || !cfg.photos.length) return;

  cfg.photos.forEach((photo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'polaroid';
    card.style.setProperty('--rotate', `${(index % 2 === 0 ? 1 : -1) * (7 + index * 2)}deg`);
    card.style.setProperty('--lift', `${index % 2 === 0 ? '10px' : '-12px'}`);
    card.innerHTML = `
      <div class="polaroid-image" style="background-image:url('${safeRelativePath(photo.src)}')"></div>
      <span class="caption">${photo.caption || 'Memory'}</span>
    `;
    card.addEventListener('click', () => openLightbox(photo));
    container.appendChild(card);
  });
}

function buildTimelineGallery() {
  if (photosAsBackgroundOnly) return;

  const container = document.getElementById('gallery-timeline');
  if (!container || !cfg.photos || !cfg.photos.length) return;

  cfg.photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-date">${String(index + 1).padStart(2, '0')}</div>
      <div class="timeline-card">
        <div class="timeline-thumb" style="background-image:url('${safeRelativePath(photo.src)}')"></div>
        <div>
          <h3>${photo.caption || `Moment ${index + 1}`}</h3>
          <p>${cfg.message || 'Cherished memories that sparkle forever.'}</p>
        </div>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(photo));
    container.appendChild(item);
  });
}

function renderReasons() {
  const container = document.getElementById('reasonGrid');
  if (!container || !cfg.reasons || !cfg.reasons.length) return;

  cfg.reasons.forEach((reason, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'reason-card';
    card.setAttribute('aria-label', `Reason ${index + 1}: ${reason}`);
    card.innerHTML = `
      <div class="reason-inner">
        <div class="reason-face reason-front">
          <span class="reason-number">${index + 1}</span>
          <span class="reason-heart">❤️</span>
        </div>
        <div class="reason-face reason-back">
          <p>${reason}</p>
        </div>
      </div>
    `;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.classList.toggle('flipped');
      }
    });
    container.appendChild(card);
  });
}

function buildStars() {
  const container = document.getElementById('wishGrid');
  if (!container || !cfg.wishes || !cfg.wishes.length) return;

  cfg.wishes.forEach((wish, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'star-badge';
    button.title = wish;
    button.setAttribute('aria-label', `${wish}`);
    button.addEventListener('click', () => showToast(wish));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showToast(wish);
      }
    });
    button.style.animationDelay = `${index * 0.3}s`;
    container.appendChild(button);
  });
}

function setCountdown() {
  const container = document.getElementById('countdownWrap');
  if (!container) return;

  const target = new Date(cfg.birthdayDate + 'T00:00:00');
  const now = new Date();
  let diff = target.getTime() - now.getTime();

  if (diff < 0) {
    const nextYear = new Date(now.getFullYear() + 1, target.getMonth(), target.getDate());
    if (nextYear.getTime() < now.getTime()) {
      nextYear.setFullYear(now.getFullYear() + 1);
    }
    diff = nextYear.getTime() - now.getTime();
  }

  const totalSec = Math.max(Math.floor(diff / 1000), 0);
  const days = Math.floor(totalSec / (24 * 60 * 60));
  const hours = Math.floor((totalSec % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const createCard = (value, label) => `
    <div class="count-card">
      <strong>${String(value).padStart(2, '0')}</strong>
      <span>${label}</span>
    </div>
  `;

  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    container.innerHTML = '<div class="count-card" style="grid-column:1/-1"><strong>Today is your day!</strong><span>Happy Birthday</span></div>';
    return;
  }

  container.innerHTML = [
    createCard(days, 'Days'),
    createCard(hours, 'Hours'),
    createCard(minutes, 'Minutes'),
    createCard(seconds, 'Seconds')
  ].join('');
}

function initCountdown() {
  setCountdown();
  clearInterval(state.countdownInterval);
  state.countdownInterval = setInterval(setCountdown, 1000);
}

function openLightbox(photo) {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  if (!box || !img || !caption) return;
  img.src = safeRelativePath(photo.src);
  caption.textContent = photo.caption || 'Birthday memory';
  box.classList.add('open');
  box.setAttribute('aria-hidden', 'false');
  state.activeLightbox = box;
}

function closeLightbox() {
  const box = document.getElementById('lightbox');
  if (!box) return;
  box.classList.remove('open');
  box.setAttribute('aria-hidden', 'true');
}

function setLetterText() {
  const text = document.getElementById('letterText');
  if (text) text.textContent = cfg.letters?.body || cfg.message;
}

function wireLetter() {
  const readBtn = document.getElementById('readLetter');
  const replayBtn = document.getElementById('replayLetter');
  const closeBtn = document.getElementById('closeLetter');
  const envelope = document.getElementById('envelope');
  const container = document.getElementById('letterContainer');

  const openLetter = () => {
    if (!envelope || !container) return;
    envelope.classList.add('open');
    container.classList.add('visible');
    state.letterOpen = true;
  };

  const closeLetter = () => {
    if (!envelope || !container) return;
    envelope.classList.remove('open');
    container.classList.remove('visible');
    state.letterOpen = false;
  };

  readBtn?.addEventListener('click', openLetter);
  replayBtn?.addEventListener('click', () => {
    closeLetter();
    requestAnimationFrame(openLetter);
  });
  closeBtn?.addEventListener('click', closeLetter);
  envelope?.addEventListener('click', () => {
    if (state.letterOpen) closeLetter();
    else openLetter();
  });
}

function enableGiftBox() {
  const button = document.getElementById('openGift');
  const box = document.getElementById('giftBox');
  if (!button || !box) return;

  button.addEventListener('click', () => {
    box.classList.add('open');
    document.getElementById('intro')?.classList.add('revealed');
    showToast('Surprise opened!');
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (state.music) {
      state.music.volume = 0.18;
      if (!state.isPlaying) {
        state.isPlaying = true;
        startAmbientAudio();
      }
    }
  });
}

function initAudio() {
  const toggleBtn = document.getElementById('music-toggle');
  const volumeSlider = document.getElementById('music-volume');

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  const notes = [220, 277.18, 329.63, 392, 349.23, 293.66];
  const activeOscillators = [];

  function startAmbientAudio() {
    if (state.isPlaying) return;
    ctx.resume();
    state.isPlaying = true;
    toggleBtn.textContent = '❚❚';
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.01;
      osc.connect(gain);
      gain.connect(master);
      osc.start(ctx.currentTime + index * 0.25);
      const drift = () => {
        osc.frequency.linearRampToValueAtTime(freq * (1 + Math.sin(index + performance.now() / 1000) * 0.04), ctx.currentTime + 1.6);
      };
      const loop = () => {
        drift();
        activeOscillators[index] = setTimeout(loop, 1500);
      };
      activeOscillators[index] = setTimeout(loop, 500 * index);
      osc.stop(ctx.currentTime + 30);
    });
  }

  function stopAmbientAudio() {
    state.isPlaying = false;
    toggleBtn.textContent = '♫';
    activeOscillators.forEach((id) => clearTimeout(id));
  }

  toggleBtn?.addEventListener('click', () => {
    if (state.isPlaying) {
      stopAmbientAudio();
    } else {
      startAmbientAudio();
    }
  });

  volumeSlider?.addEventListener('input', (event) => {
    const value = Number(event.target.value || 0.5);
    master.gain.value = value * 0.25;
  });

  state.music = { context: ctx, gain: master, start: startAmbientAudio, stop: stopAmbientAudio };
}

function setupFireworks() {
  const finale = document.getElementById('finale');
  const celebrateBtn = document.getElementById('celebrateAgain');
  const restartBtn = document.getElementById('restartExperience');

  const burst = () => {
    if (!finale) return;
    const particles = Array.from({ length: 26 }, (_, index) => {
      const dot = document.createElement('span');
      const angle = (Math.PI * 2 * index) / 26;
      const radius = 80 + Math.random() * 120;
      dot.className = 'fire-particle';
      dot.style.position = 'absolute';
      dot.style.left = '50%';
      dot.style.top = '50%';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = ['#ffd76d', '#ff9ad8', '#a7d3ff', '#a8ffb0'][index % 4];
      dot.style.transform = 'translate(-50%, -50%)';
      dot.style.boxShadow = '0 0 16px rgba(255,255,255,0.7)';
      dot.style.setProperty('--dx', `${Math.cos(angle) * radius}px`);
      dot.style.setProperty('--dy', `${Math.sin(angle) * radius}px`);
      dot.style.animation = 'fire-burst 1.2s ease-out forwards';
      finale.appendChild(dot);
      setTimeout(() => dot.remove(), 1200);
    });
    return particles;
  };

  const triggerFinale = () => {
    burst();
    showToast('Let the magic begin!');
    document.getElementById('finale')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  celebrateBtn?.addEventListener('click', triggerFinale);
  restartBtn?.addEventListener('click', () => {
    document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    triggerFinale();
  });

  if (finale) {
    finale.style.setProperty('--fire-glow', 'rgba(255, 218, 123, 0.2)');
  }
}

function bindBlowOutCandle() {
  const btn = document.getElementById('blowCandles');
  const cake = document.getElementById('cakeDisplay');
  if (!btn || !cake) return;

  btn.addEventListener('click', () => {
    cake.classList.toggle('cake-blown');
    const flames = cake.querySelectorAll('.flame');
    flames.forEach((flame) => {
      flame.style.opacity = '0';
      flame.style.transform = 'scale(0.2)';
    });
    showToast('The candles are out!');
    const message = document.getElementById('cakeMessage');
    if (message) message.textContent = 'A wish has been made — and magic is already on its way.';
    setTimeout(() => {
      document.getElementById('finale')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 550);
  });
}

function initThreeScene() {
  const canvas = document.getElementById('three-scene');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 8;

  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xf7a8d8,
    emissive: 0xffa8d8,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.4
  });

  const particles = new THREE.Group();
  for (let i = 0; i < 30; i += 1) {
    const geometry = new THREE.SphereGeometry(0.06 + Math.random() * 0.05, 12, 12);
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    );
    mesh.material.color = new THREE.Color().setHSL(Math.random(), 0.8, 0.7);
    particles.add(mesh);
  }

  group.add(particles);
  scene.add(group);
  const lightA = new THREE.PointLight(0xffd76d, 2.2, 18);
  const lightB = new THREE.PointLight(0xc9a0ff, 2, 18);
  lightA.position.set(3, 4, 6);
  lightB.position.set(-4, -2, 5);
  scene.add(lightA, lightB);

  const animate = () => {
    requestAnimationFrame(animate);
    group.rotation.y += 0.0025;
    group.rotation.x += 0.0015;
    particles.children.forEach((mesh, index) => {
      mesh.position.y += Math.sin(performance.now() * 0.001 + index) * 0.0012;
      mesh.position.x += Math.cos(performance.now() * 0.0014 + index) * 0.0008;
    });
    renderer.render(scene, camera);
  };

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const fill = document.getElementById('loading-fill');
  const label = document.getElementById('loading-label');

  if (!screen || !fill) return;

  const imagesToLoad = cfg.photos.map((photo) => safeRelativePath(photo.src));
  let loaded = 0;

  const imageLoad = () => {
    loaded += 1;
    const progress = Math.round((loaded / (imagesToLoad.length || 1)) * 100);
    fill.style.width = `${progress}%`;
    label.textContent = `Loading memories ${progress}%`;
    if (loaded >= imagesToLoad.length) {
      setTimeout(() => {
        screen.classList.add('hidden');
      }, 500);
    }
  };

  if (!imagesToLoad.length) {
    fill.style.width = '100%';
    label.textContent = 'All set';
    setTimeout(() => screen.classList.add('hidden'), 420);
    return;
  }

  imagesToLoad.forEach((src) => {
    const img = new Image();
    img.onload = imageLoad;
    img.onerror = imageLoad;
    img.src = src;
  });
}

function bindGiftActions() {
  const cards = document.querySelectorAll('[data-gift]');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const type = card.dataset.gift;
      if (type === 'message') {
        showToast(cfg.message);
      }
      if (type === 'memories') {
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (type === 'final') {
        document.getElementById('finale')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function init() {
  applyTheme();
  applyProjectPhotoBackgrounds();
  populateNames();

  // Keep all real-image gallery logic disabled while the site uses decorative
  // background photos only. This keeps the structure ready for future main-photo swaps.
  buildDecorativePhotos();
  buildOrbitGallery();
  buildPolaroidGallery();
  buildTimelineGallery();
  renderReasons();
  buildStars();
  initCountdown();
  setLetterText();
  wireLetter();
  enableGiftBox();
  bindBlowOutCandle();
  bindGiftActions();
  setupFireworks();
  initAudio();
  initThreeScene();
  initLoadingScreen();

  const heroName = document.querySelector('.name-title');
  if (heroName) buildAnimatedName(heroName, cfg.name);

  document.getElementById('closeLightbox')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });
}

window.addEventListener('DOMContentLoaded', init);
