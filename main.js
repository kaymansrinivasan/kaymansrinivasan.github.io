/* ============================================================
   KAYMAN SRINIVASAN — main.js
   Nav scroll state · scroll progress · reveal animations · counters
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── FOOTER YEAR ───────────────────────────────────────────
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // ── NAV SCROLL STATE ──────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── SCROLL PROGRESS BAR ───────────────────────────────────
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }, { passive: true });
  }

  if (prefersReducedMotion) return; // skip all animation wiring below

  // ── GENERIC REVEAL-UP ─────────────────────────────────────
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal-up').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
    revealObs.observe(el);
  });

  // ── COUNTER ANIMATION ─────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
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

  // ── PROJECT ROWS ──────────────────────────────────────────
  const projectObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.sbar-fill, .shap-bar').forEach(bar => {
          const target = bar.style.width;
          bar.style.width = '0';
          requestAnimationFrame(() => { setTimeout(() => { bar.style.width = target; }, 50); });
        });
        projectObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.project-row').forEach(r => projectObs.observe(r));

  // ── SKILL BARS ────────────────────────────────────────────
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
          const w = bar.getAttribute('data-width');
          setTimeout(() => { bar.style.width = w + '%'; }, i * 60);
        });
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skills-matrix').forEach(el => skillObs.observe(el));

})();
