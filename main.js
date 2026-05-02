/* ============================================================
   KAYMAN SRINIVASAN — main.js
   Neural canvas · Custom cursor · Scroll reveals · Counters
   ============================================================ */

(function () {
  'use strict';

  // ── NEURAL NET CANVAS ─────────────────────────────────────
  const canvas = document.getElementById('neural-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, nodes, mouse = { x: -999, y: -999 };
  const NODE_COUNT = 80;
  const CONNECTION_DIST = 140;
  const NODE_SPEED = 0.25;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * NODE_SPEED,
      vy: (Math.random() - 0.5) * NODE_SPEED,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      // Mouse repulsion
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        n.x += dx / dist * 1.2;
        n.y += dy / dist * 1.2;
      }
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.4;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(200,247,224,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,247,224,0.5)';
      ctx.fill();
    });

    requestAnimationFrame(drawCanvas);
  }

  resize();
  createNodes();
  drawCanvas();
  window.addEventListener('resize', () => { resize(); createNodes(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });


  // ── CUSTOM CURSOR ─────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    trailX = e.clientX;
    trailY = e.clientY;
  });

  function animateTrail() {
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
      cursor.style.opacity = '0.6';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.opacity = '1';
    });
  });


  // ── NAV SCROLL ────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });


  // ── COUNTER ANIMATION ─────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── INTERSECTION OBSERVER ─────────────────────────────────
  const observerOpts = { threshold: 0.15 };

  // Project rows
  const projectObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate sentiment/shap bars inside
        entry.target.querySelectorAll('.sbar-fill').forEach(b => {
          b.style.width = b.style.getPropertyValue('width') || '0%';
          // The inline width is set as a style — trigger it
          const w = b.getAttribute('style').match(/width:([\d.]+%)/);
          if (w) { b.style.width = '0'; requestAnimationFrame(() => { b.style.width = w[1]; }); }
        });
        entry.target.querySelectorAll('.shap-bar').forEach(b => {
          const w = getComputedStyle(b).width;
          b.style.width = '0';
          requestAnimationFrame(() => { b.style.width = b.style.width || w; });
        });
        projectObs.unobserve(entry.target);
      }
    });
  }, observerOpts);
  document.querySelectorAll('.project-row').forEach(r => projectObs.observe(r));

  // Skill bars
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
          const w = bar.getAttribute('data-width');
          setTimeout(() => { bar.style.width = w + '%'; }, i * 80);
        });
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skills-matrix').forEach(el => skillObs.observe(el));

  // Counters
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num[data-target]').forEach(el => animateCounter(el));
        statObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statObs.observe(heroStats);

  // SHAP bars — trigger on scroll
  const shapObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.shap-bar').forEach((bar, i) => {
          setTimeout(() => { bar.style.width = bar.style.width; }, i * 100);
        });
      }
    });
  }, observerOpts);
  document.querySelectorAll('.shap-visual').forEach(el => shapObs.observe(el));

  // Terminal typewriter
  const terminal = document.querySelector('.about-terminal');
  if (terminal) {
    const termObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const lines = terminal.querySelectorAll('.t-out');
        lines.forEach((line, i) => {
          line.style.opacity = '0';
          setTimeout(() => {
            line.style.transition = 'opacity 0.3s';
            line.style.opacity = '1';
          }, 400 + i * 100);
        });
        termObs.unobserve(terminal);
      }
    }, { threshold: 0.3 });
    termObs.observe(terminal);
  }

  // SHAP bar width fix — ensure inline widths fire after layout
  document.querySelectorAll('.shap-bar').forEach(bar => {
    const widthMatch = bar.getAttribute('style') && bar.getAttribute('style').match(/width:([\d.]+%)/);
    if (widthMatch) {
      const target = widthMatch[1];
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = target; }, 600);
    }
  });

  // Sentiment bar width — same pattern
  document.querySelectorAll('.sbar-fill').forEach(bar => {
    const style = bar.getAttribute('style') || '';
    const match = style.match(/width:([\d.]+%)/);
    if (match) {
      const target = match[1];
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = target; }, 800);
    }
  });


  // ── ENHANCEMENT #4 — HERO NAME SHIMMER ─────────────────────
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    // Trigger shimmer after the slide-up animations complete (~1.5s)
    setTimeout(() => {
      heroName.classList.add('shimmer-active');
    }, 1800);
  }


  // ── ENHANCEMENT #5 — HERO PHOTO PARALLAX ───────────────────
  const heroPhoto = document.getElementById('hero-photo');
  if (heroPhoto) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroPhoto.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
    });
  }


  // ── ENHANCEMENT #6 — SECTION TITLE LETTER REVEAL ───────────
  document.querySelectorAll('.section-header h2').forEach(h2 => {
    const text = h2.textContent;
    h2.textContent = '';
    h2.setAttribute('aria-label', text);

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.classList.add('section-title-letter');
      if (char === ' ') {
        span.classList.add('space');
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      // Stagger delay per letter
      span.style.transitionDelay = `${i * 0.04}s`;
      h2.appendChild(span);
    });
  });

  // Observe section headers for letter reveal
  const titleObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.section-title-letter').forEach(letter => {
          letter.classList.add('revealed');
        });
        titleObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.section-header').forEach(el => titleObs.observe(el));


  // ── ENHANCEMENT #11 — MAGNETIC NAV LINKS ───────────────────
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('mousemove', e => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translate(0, 0)';
    });
  });


  // ── ENHANCEMENT #12 — SCROLL PROGRESS BAR ─────────────────
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }, { passive: true });
  }

})();
