// main.js – Portafolio Miriam Zárate
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    setYear();
    setupNavToggle();
    setupSmoothScroll();
    setupProjectsFilter();
    setupVideoModals(); // <-- aquí, dentro del mismo IIFE
  });

  // --- Footer year
  function setYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  // --- Mobile nav toggle (accessible)
  function setupNavToggle() {
    const toggle = $('.nav__toggle');
    const menu = $('#menu');
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // --- Smooth scroll con offset de la barra
  function setupSmoothScroll() {
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    });
  }

  // --- Filtro de proyectos (Todos / WEB / ANDROID)
  function setupProjectsFilter() {
    const section = $('#proyectos');
    const grid = section?.querySelector('.projects-grid');
    if (!section || !grid) return;

    let toolbar = section.querySelector('.project-filters');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'project-filters';
      toolbar.style.display = 'flex';
      toolbar.style.gap = '0.5rem';
      toolbar.style.margin = '0 0 1rem 0';

      const mkBtn = (label, value) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.dataset.filter = value;
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = label;
        return btn;
      };

      toolbar.append(mkBtn('Todos', 'all'), mkBtn('Web', 'web'), mkBtn('Android', 'android'));
      section.insertBefore(toolbar, grid);
    }

    const cards = $$('.project-card', grid);
    const urlTipo = new URLSearchParams(location.search).get('tipo');
    const persisted = sessionStorage.getItem('pfiltro');
    const initial =
      (urlTipo && ['web', 'android'].includes(urlTipo.toLowerCase()) && urlTipo.toLowerCase()) ||
      (persisted && ['all', 'web', 'android'].includes(persisted) && persisted) ||
      'all';

    applyFilter(initial);

    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      applyFilter(btn.dataset.filter);
    });

    function applyFilter(type) {
      $$('.project-filters .btn', section).forEach(b => {
        const active = b.dataset.filter === type;
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
        b.classList.toggle('btn--primary', active);
      });

      cards.forEach(card => {
        const t = (card.getAttribute('data-type') || '').toLowerCase();
        card.classList.toggle('hidden', !(type === 'all' || t === type));
      });

      sessionStorage.setItem('pfiltro', type);
    }
  }

  // --- Modal de video para botones [data-demo]
  function setupVideoModals(){
    const modal = document.getElementById('videoModal');
    const content = modal?.querySelector('.modal__content');
    if (!modal || !content) return;

    let lastFocused = null;

    const open = (src) => {
      document.body.classList.add('no-scroll');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');

      // Inyectar video
      content.innerHTML = `
        <video controls autoplay playsinline>
          <source src="${src}" type="video/mp4">
          Tu navegador no soporta video HTML5.
        </video>
      `;

      lastFocused = document.activeElement;
      modal.querySelector('.modal__close')?.focus();
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');

      const video = content.querySelector('video');
      if (video){ video.pause(); video.src = ""; }
      content.innerHTML = "";

      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    // abrir desde cualquier botón con data-demo
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-demo]');
      if (!btn) return;
      e.preventDefault();
      const src = btn.getAttribute('data-video');
      if (src) open(src);
    });

    // cerrar con backdrop o botón
    modal.addEventListener('click', (e) => {
      const closer = e.target.closest('[data-close]');
      if (closer) {
        e.preventDefault();
        close();
      }
    });

    // opcional: por accesibilidad, engancha el click directo del botón también
    const btnClose = modal.querySelector('.modal__close');
    if (btnClose) {
      btnClose.addEventListener('click', (e) => {
        e.preventDefault();
        close();
      });
    }

    // cerrar con Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }
})();
