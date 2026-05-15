/* ── Custom cursor ── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; });

;(function animCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a, button, .skill-icon, .legend-item, .filter-btn').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.8)');
  el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
});

/* ── Starfield ── */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const STAR_COUNT = 280;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 1.4 + 0.2,
  speed: Math.random() * 0.15 + 0.02,
  twinkle: Math.random() * Math.PI * 2,
  twinkleSpeed: Math.random() * 0.02 + 0.005,
  color: Math.random() > 0.85
    ? `hsl(${200 + Math.random()*60}, 80%, 80%)`
    : `hsl(0,0%,${80 + Math.random()*20}%)`,
}));

// A few bigger, colored stars
const BRIGHT = 12;
for (let i = 0; i < BRIGHT; i++) {
  stars[i].r = Math.random() * 2 + 1.5;
  stars[i].color = [`#4fc3f7`,`#b39ddb`,`#f48fb1`,`#81d4fa`,`#fff176`][i % 5];
}

function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.twinkle += s.twinkleSpeed;
    const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    ctx.shadowBlur = s.r > 1.5 ? 8 : 3;
    ctx.shadowColor = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Slow drift
    s.y -= s.speed;
    if (s.y < -4) { s.y = canvas.height + 4; s.x = Math.random() * canvas.width; }
  });
}

/* ── Shooting stars ── */
const shooters = [];
function spawnShooter() {
  const el = document.createElement('div');
  el.className = 'shooting-star';
  const startX = Math.random() * window.innerWidth * 1.5;
  const startY = Math.random() * window.innerHeight * 0.5;
  el.style.left = startX + 'px';
  el.style.top  = startY + 'px';
  const angle = 25 + Math.random() * 20; // degrees
  const dur = 600 + Math.random() * 600;
  el.style.animation = `none`;
  document.body.appendChild(el);

  const kf = el.animate([
    { transform: `rotate(${angle}deg) translateX(0)`, opacity: 0 },
    { transform: `rotate(${angle}deg) translateX(10px)`, opacity: 1, offset: 0.05 },
    { transform: `rotate(${angle}deg) translateX(${300 + Math.random()*300}px)`, opacity: 0 },
  ], { duration: dur, easing: 'ease-in' });

  kf.onfinish = () => el.remove();
}

setInterval(spawnShooter, 3000 + Math.random() * 4000);

/* ── Main animation loop ── */
;(function loop(t) {
  drawStars(t);
  requestAnimationFrame(loop);
})();

/* ── Orbit responsive ── */
const orbitSystem = document.getElementById('orbitSystem');

function updateOrbit() {
  const orbSize = Math.min(760, window.innerWidth * 0.95);
  const sf = orbSize / 760;
  orbitSystem.style.setProperty('--sf', sf);

  orbitSystem.querySelectorAll('.orbit-ring').forEach(ring => {
    const baseD  = parseFloat(ring.dataset.baseD);
    const realD  = baseD * sf;
    const radius = realD / 2;
    const iconW  = 46 * sf;

    ring.style.setProperty('--rd', realD + 'px');
    ring.style.width  = realD + 'px';
    ring.style.height = realD + 'px';

    ring.querySelectorAll('.skill-icon[data-a]').forEach(icon => {
      const angleDeg = parseFloat(icon.dataset.a);
      const angleRad = angleDeg * Math.PI / 180;
      const x = Math.cos(angleRad) * radius;
      const y = Math.sin(angleRad) * radius;
      icon.style.left = `calc(50% + ${x}px - ${iconW / 2}px)`;
      icon.style.top  = `calc(50% + ${y}px - ${iconW / 2}px)`;
    });
  });
}
window.addEventListener('load', () => {
  updateOrbit();
  requestAnimationFrame(updateOrbit);
});

document.fonts.ready.then(() => {
  updateOrbit();
});
window.addEventListener('resize', updateOrbit);

/* ── Skill tooltip ── */
/* ── Skill tooltip CORRIGIDO ── */
const tooltip = document.getElementById('skill-tooltip');
let tooltipTimeout = null;

orbitSystem.querySelectorAll('.skill-icon').forEach(icon => {
  const name = icon.querySelector('.skill-label')?.textContent.trim() || '';
  
  // Se não tem nome, não continua
  if (!name) return;

  // MOUSE: hover para mostrar
  icon.addEventListener('mouseenter', (e) => {
    orbitSystem.classList.add('paused');
    tooltip.textContent = name;
    tooltip.style.opacity = '1';
    // Posiciona no mouse
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY - 36) + 'px';
  });
  
  icon.addEventListener('mousemove', (e) => {
    // Só reposiciona se o tooltip estiver visível
    if (tooltip.style.opacity === '1') {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY - 36) + 'px';
    }
  });
  
  icon.addEventListener('mouseleave', () => {
    orbitSystem.classList.remove('paused');
    tooltip.style.opacity = '0';
  });

  // TOUCH (mobile): tap para mostrar e esconder após 2s
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    // Cancela timeout anterior se existir
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    
    tooltip.textContent = name;
    const rect = icon.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 40) + 'px';
    tooltip.style.opacity = '1';
    
    // Esconde após 2 segundos
    tooltipTimeout = setTimeout(() => {
      tooltip.style.opacity = '0';
    }, 2000);
  });
});

// Clica em qualquer lugar da tela fecha o tooltip no mobile
document.body.addEventListener('click', (e) => {
  // Se clicou fora de um ícone, esconde o tooltip
  if (!e.target.closest('.skill-icon')) {
    tooltip.style.opacity = '0';
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
  }
});

/* ── Legend toggle ── */
document.querySelectorAll('.legend-item').forEach(item => {
  item.addEventListener('click', () => {
    const cat = item.dataset.category;
    item.classList.toggle('disabled');
    document.querySelectorAll('.skill-icon.' + cat).forEach(skill => {
      skill.style.display = skill.style.display === 'none' ? 'flex' : 'none';
    });
  });
});

/* ── Filters ── */
const filterButtons = document.querySelectorAll('.filter-btn');

function applyFilter(filter) {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    const tags = item.getAttribute('data-tags') || '';
    item.style.display = (filter === 'all' || tags.includes(filter)) ? 'block' : 'none';
  });

  const visible = [...items].filter(i => i.style.display !== 'none');
  visible.forEach((item, idx) => {
    item.classList.remove('left','right');
    item.classList.add(idx % 2 === 0 ? 'left' : 'right');
  });

  document.querySelectorAll('.timeline-year').forEach(yr => {
    let next = yr.nextElementSibling; let has = false;
    while (next && !next.classList.contains('timeline-year')) {
      if (next.classList.contains('timeline-item') && next.style.display !== 'none') { has = true; break; }
      next = next.nextElementSibling;
    }
    yr.style.display = has ? 'flex' : 'none';
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// Initial zig-zag
let vi = 0;
document.querySelectorAll('.timeline-item').forEach(item => {
  if (item.style.display === 'none') return;
  item.classList.remove('left','right');
  item.classList.add(vi % 2 === 0 ? 'left' : 'right');
  vi++;
});

/* ── Fade-up on scroll ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
document.querySelector('.hero').classList.add('show');

/* ── Active nav highlight ── */
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

['hero','education','certificates','skills','languages','projects'].forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ── Parallax nebulae on scroll ── */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.nebula').forEach((n, i) => {
    const speed = [0.03, 0.05, 0.04, 0.02][i] || 0.03;
    n.style.transform = `translateY(${y * speed}px)`;
  });
});

// Typing effect no centro da órbita
const centerEl = document.querySelector('.orbit-center');
const phrases = ['FULL-STACK', 'AI-POWERED'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;


function typeEffect() {
  const current = phrases[phraseIndex];
  if (isDeleting) {
    centerEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    centerEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  
  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    setTimeout(typeEffect, 2000);
    return;
  }
  
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }
  
  setTimeout(typeEffect, isDeleting ? 100 : 150);
}
typeEffect();

const elements = document.querySelectorAll('.fade-up, .orbit-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, {
  threshold: 0.2
});

elements.forEach(el => observer.observe(el));