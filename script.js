(() => {
  'use strict';

  const hasGSAP = !!window.gsap;
  const hasST = !!window.ScrollTrigger;
  const hasLenis = !!window.Lenis;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasGSAP && hasST) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({ invalidateOnRefresh: true });
  }

  /* ---------- LENIS: scroll suave ---------- */
  function initLenis() {
    if (!hasLenis || prefersReduced) return;
    const lenis = new Lenis({ duration: 1.5, wheelMultiplier: 1, touchMultiplier: 1, smoothWheel: true });
    window.lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    if (hasST) lenis.on('scroll', ScrollTrigger.update);
  }

  /* ---------- LOADER + COVER (scroll bloqueado) ---------- */
  function initCover() {
    const intro = document.querySelector('.pirata-intro');
    const introLogo = document.querySelector('.intro-logo');
    const cover = document.getElementById('pirata-cover');
    const items = document.querySelectorAll('.cover-item');
    const coverLogo = document.querySelector('.cover-logo');

    // Sin GSAP: mostrar el sitio directamente
    if (!hasGSAP || !intro || !cover) {
      if (intro) intro.style.display = 'none';
      if (cover) cover.style.display = 'none';
      document.body.classList.add('show-site');
      return;
    }

    document.body.style.overflow = 'hidden';
    const prevent = e => { e.preventDefault(); };
    const keyBlock = e => { if ([32,33,34,35,36,37,38,39,40].includes(e.keyCode)) e.preventDefault(); };
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('keydown', keyBlock, { passive: false });
    const unlock = () => {
      document.body.style.overflow = '';
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('keydown', keyBlock);
    };

    // 1) Intro
    gsap.timeline({ onComplete: () => { intro.style.display = 'none'; showCover(); } })
      .to(introLogo, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' })
      .to(introLogo, { opacity: 0, scale: 1.05, duration: 0.3, ease: 'power2.in' }, '+=0.5')
      .to(intro, { opacity: 0, duration: 0.3, ease: 'power1.out' }, '-=0.3');

    // 2) Cover: las fotos aparecen escalonadas
    function showCover() {
      const tl = gsap.timeline({ onComplete: hideCover });
      items.forEach((item, i) => tl.to(item, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, i * 0.12));
      if (coverLogo) tl.to(coverLogo, { opacity: 1, duration: 1.2, ease: 'power2.out' }, '-=0.6');
      tl.to({}, { duration: 1.2 });
    }

    // 3) Cover desaparece y entra el hero
    function hideCover() {
      const tl = gsap.timeline({ onComplete: () => { cover.style.display = 'none'; unlock(); } });
      if (coverLogo) tl.to(coverLogo, { opacity: 0, scale: 0.95, duration: 0.6, ease: 'power2.in' });
      tl.to(cover, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.8, ease: 'power2.inOut' }, '-=0.3');
      Array.from(items).reverse().forEach((item, i) =>
        tl.to(item, { opacity: 0, scale: 0.92, duration: 0.7, ease: 'power2.in' }, i * 0.08));
      tl.to(cover, { opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
      tl.call(() => { document.body.classList.add('show-site'); initHero(); }, null, '-=0.5');
    }
  }

  /* ---------- HERO ---------- */
  function initHero() {
    if (!hasGSAP || prefersReduced) return;
    const lines = document.querySelectorAll('.line');
    const fotoEsq = document.querySelector('.foto-colada-esquerda');
    const fotoDer = document.querySelector('.foto-colada-animada');
    const heroTitle = document.getElementById('hero-title');
    const others = [fotoEsq, fotoDer, document.querySelector('.hero-sub'),
                    document.querySelector('.sub-quote'), document.querySelector('.hero-btn')].filter(Boolean);

    gsap.from(lines, { y: 100, opacity: 0, ease: 'power3.out', duration: 1.2, stagger: 0.12 });
    gsap.from(others, {
      opacity: 0, y: 60, duration: 1.4, ease: 'power3.out', stagger: 0.15,
      onComplete: () => gsap.set([fotoEsq, fotoDer], { clearProps: 'transform' })
    });

    // flotación suave continua
    gsap.delayedCall(1.6, () => {
      gsap.to(fotoEsq,  { y: -1.5, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(fotoDer,  { y:  1.5, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(heroTitle,{ y:   12, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
    });
  }

  /* ---------- PICTURE EXPAND ---------- */
  function initPictureExpand() {
    if (!hasGSAP || !hasST || prefersReduced) return;
    gsap.to('#pictureExpandBox', {
      width: '100%', ease: 'none',
      scrollTrigger: { trigger: '.picture-expand-section', start: 'top 150%', end: 'bottom bottom', scrub: true }
    });
  }

  /* ---------- ICONOS QUE GIRAN CON EL SCROLL ---------- */
  function initSpinIcons() {
    if (!hasGSAP || !hasST || prefersReduced) return;
    document.querySelectorAll('.skull, .spin-icon').forEach(el => {
      gsap.to(el, { rotation: 360, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- ESTUDIO: imagen se desplaza en X ---------- */
  function initEstudio() {
    if (!hasGSAP || !hasST || prefersReduced || innerWidth < 900) return;
    gsap.fromTo('#estImg1', { x: -30 }, { x: 30, ease: 'none',
      scrollTrigger: { trigger: '.estudio', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- CARRUSELES CON FADE ---------- */
  function initFadeCarousels() {
    document.querySelectorAll('.fade-carousel').forEach((c, idx) => {
      const imgs = c.querySelectorAll('img');
      let i = 0;
      setInterval(() => {
        imgs[i].classList.remove('on');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('on');
      }, 2800 + idx * 400);
    });
  }

  /* ---------- SCROLL HORIZONTAL (pin) ---------- */
  function initHorizontalScroll() {
    if (!hasGSAP || !hasST || prefersReduced) return;
    const track = document.querySelector('.scroll-track');
    const wrapper = document.querySelector('.pirata-horizontal-section');
    if (!track || !wrapper) return;

    gsap.matchMedia().add('(min-width: 769px)', () => {
      const total = () => track.scrollWidth - window.innerWidth;
      const st = ScrollTrigger.create({
        trigger: wrapper, start: 'top top', end: () => `+=${total()}`,
        scrub: true, pin: true, anticipatePin: 0, invalidateOnRefresh: true,
        animation: gsap.to(track, { x: () => `-${total()}`, ease: 'none' })
      });
      return () => st.kill();
    });
  }

  /* ---------- APARICIÓN DE CASOS Y SECCIONES ---------- */
  function initReveals() {
    if (!hasGSAP || !hasST || prefersReduced) return;
    const sel = '.hamilton-hero-image-wrapper, .hamilton-hero-content, .case-gallery .gallery-item, .neymar-compact-header, .montagem-col, .evento-body, .pcard, .miembro, .campanha, .oferta-cols > div, .t-big, .t-mid, .t-mid-b, .cierre-cols > div';
    gsap.set(sel, { opacity: 0, y: 40 });
    ScrollTrigger.batch(sel, {
      start: 'top 85%',
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', stagger: 0.1 })
    });
  }

  /* ---------- LIGHTBOX ---------- */
  function initLightbox() {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    const photos = [...document.querySelectorAll('.gallery-photo')];
    let cur = 0;
    const show = i => { cur = (i + photos.length) % photos.length; img.src = photos[cur].querySelector('img').src; };
    const close = () => { lb.classList.remove('active'); document.body.style.overflow = ''; };
    photos.forEach((p, i) => p.addEventListener('click', () => { show(i); lb.classList.add('active'); document.body.style.overflow = 'hidden'; }));
    lb.querySelector('.lightbox-close').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    lb.querySelector('.lightbox-prev').addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
    lb.querySelector('.lightbox-next').addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- REPRODUCTORES DE VIDEO ---------- */
  function initVideoPlayers() {
    document.querySelectorAll('.gallery-video, .video-wrapper').forEach(box => {
      const video = box.querySelector('video');
      const btn = box.querySelector('.video-play-btn, .play-btn');
      if (!video || !btn) return;
      const update = () => { btn.style.opacity = video.paused ? '1' : '0'; btn.style.pointerEvents = video.paused ? 'auto' : 'none'; };
      const toggle = () => video.paused ? video.play().catch(() => {}) : video.pause();
      btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
      video.addEventListener('click', toggle);
      ['play', 'pause', 'ended'].forEach(ev => video.addEventListener(ev, update));
      update();
    });
  }

  /* ---------- ENLACES #contacto → WhatsApp (cambia tu número) ---------- */
  function initContactLinks() {
    const WHATSAPP = ''; // ej: 'https://wa.me/5491112345678'
    if (!WHATSAPP) return;
    document.querySelectorAll('a[href="#contacto"]').forEach(a => {
      a.href = WHATSAPP; a.target = '_blank'; a.rel = 'noopener noreferrer';
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    initLenis();
    initCover();
    initPictureExpand();
    initSpinIcons();
    initEstudio();
    initFadeCarousels();
    initHorizontalScroll();
    initReveals();
    initLightbox();
    initVideoPlayers();
    initContactLinks();
    if (hasST) {
      let t;
      addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 250); });
      addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init, { once: true }) : init();
})();
