/* TEMCO · site interactions (no dependencies) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const ROOT = document.documentElement.dataset.root || './';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const fold = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[șş]/gi, 's').replace(/[țţ]/gi, 't').toLowerCase();
  const escHtml = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  let scrollLocks = 0;
  const lockScroll = (on) => {
    scrollLocks = Math.max(0, scrollLocks + (on ? 1 : -1));
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = scrollLocks ? 'hidden' : '';
    document.documentElement.style.paddingRight = scrollLocks && sbw > 0 ? sbw + 'px' : '';
  };

  // ------------------------------------------------------------ toast
  const toastEl = $('[data-toast]');
  let toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = `<svg class="i" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>${escHtml(msg)}`;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }

  // ------------------------------------------------------------ keyboard hint
  $$('[data-kbd]').forEach((k) => { k.textContent = isMac ? '⌘ K' : 'Ctrl K'; });
  $$('[data-year]').forEach((y) => { if (y.tagName === 'SPAN') y.textContent = new Date().getFullYear(); });

  // ------------------------------------------------------------ header (stays in place, gains a border when scrolled)
  const header = $('[data-header]');
  const toTop = $('[data-to-top]');
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    header?.classList.toggle('is-scrolled', y > 8);
    toTop?.classList.toggle('is-on', y > 900);
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => { scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); $('#main')?.focus({ preventScroll: true }); });

  // ------------------------------------------------------------ Produse dropdown (small card, no overlay)
  $$('[data-dropdown]').forEach((item) => {
    const trigger = $('.nav-link', item);
    let t;
    const set = (on) => { clearTimeout(t); item.classList.toggle('is-open', on); trigger.setAttribute('aria-expanded', on); };
    if (finePointer) {
      item.addEventListener('mouseenter', () => { clearTimeout(t); t = setTimeout(() => set(true), 60); });
      item.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => set(false), 120); });
    }
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); set(true); $('.dropdown a', item)?.focus(); }
    });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && item.classList.contains('is-open')) { set(false); trigger.focus(); } });
  });

  // ------------------------------------------------------------ mobile nav
  const menuBtn = $('.menu-toggle');
  const mnav = $('#mobile-nav');
  if (menuBtn && mnav) {
    const MENU = '<svg class="i" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/></svg>';
    const CLOSE = '<svg class="i" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    const set = (on) => {
      menuBtn.setAttribute('aria-expanded', on);
      menuBtn.setAttribute('aria-label', on ? 'Închide meniul' : 'Deschide meniul');
      menuBtn.innerHTML = on ? CLOSE : MENU;
      mnav.classList.toggle('is-open', on);
      header?.classList.toggle('is-open', on);
      lockScroll(on);
    };
    menuBtn.addEventListener('click', () => set(menuBtn.getAttribute('aria-expanded') !== 'true'));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && mnav.classList.contains('is-open')) { set(false); menuBtn.focus(); } });
    $$('[aria-controls="m-produse"]', mnav).forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', on);
      $('#m-produse').classList.toggle('is-open', on);
    }));
    matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches && mnav.classList.contains('is-open')) set(false); });
  }

  // ------------------------------------------------------------ statement: words light up as it scrolls into view
  $$('[data-statement]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = `<span class="sr-only">${escHtml(el.textContent.trim())}</span>` + words.map((w) => `<span class="sw" aria-hidden="true">${escHtml(w)}</span>`).join(' ');
    const spans = $$('.sw', el);
    const upd = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('is-lit', i < n));
    };
    addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    upd();
  });

  // ------------------------------------------------------------ reveal on scroll + counters
  const countUp = (el) => {
    const to = +el.dataset.countTo, from = +(el.dataset.countFrom || 0);
    if (reduced) { el.textContent = to; return; }
    const dur = 1600, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('is-in');
      if (el.dataset.countTo) countUp(el);
      $$('[data-count-to]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach((el) => io.observe(el));
  $$('[data-count-to]').forEach((el) => { if (!el.closest('[data-reveal]')) io.observe(el); });

  // ------------------------------------------------------------ hero slider
  const hero = $('[data-hero]');
  if (hero) {
    const slides = $$('[data-slide]', hero), dots = $$('[data-dot]', hero), cur = $('[data-hero-current]', hero);
    let idx = 0, timer;
    const DUR = 7000;
    hero.style.setProperty('--dur', DUR + 'ms');
    const go = (n, user) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      dots.forEach((d, i) => {
        d.classList.remove('is-active'); d.setAttribute('aria-selected', i === idx);
        if (i === idx) { void d.offsetWidth; d.classList.add('is-active'); }
      });
      if (cur) cur.textContent = String(idx + 1).padStart(2, '0');
      schedule();
      if (user) slides[idx].querySelector('img')?.setAttribute('loading', 'eager');
    };
    const schedule = () => { clearTimeout(timer); if (!reduced && !hero.classList.contains('is-paused')) timer = setTimeout(() => go(idx + 1), DUR); };
    dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.dot, true)));
    const pause = (on) => { hero.classList.toggle('is-paused', on); if (on) clearTimeout(timer); else schedule(); };
    document.addEventListener('visibilitychange', () => pause(document.hidden));
    let sx = null;
    hero.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    hero.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50) go(idx + (e.clientX < sx ? 1 : -1), true); sx = null; });
    // warm the second slide once the first has painted
    addEventListener('load', () => $$('img[loading="lazy"]', hero).forEach((i) => i.setAttribute('loading', 'eager')));
    if (reduced) dots.forEach((d) => d.classList.remove('is-active'));
    schedule();
  }

  // ------------------------------------------------------------ interactive list with image preview
  $$('[data-dlist]').forEach((dl) => {
    const imgs = $$('.dlist-preview > div', dl);
    const show = (i) => imgs.forEach((d, k) => d.classList.toggle('is-on', k === i));
    $$('a[data-i]', dl).forEach((a) => { a.addEventListener('mouseenter', () => show(+a.dataset.i)); a.addEventListener('focus', () => show(+a.dataset.i)); });
  });

  // ------------------------------------------------------------ catalog filters
  $$('[data-catalog]').forEach((cat) => {
    const grid = $('[data-grid]', cat);
    const items = [...grid.children];
    const pageSize = +cat.dataset.pageSize || 24;
    const qIn = $('[data-q]', cat), qClear = $('[data-q-clear]', cat), sortSel = $('[data-sort]', cat);
    const countEl = $('[data-count]', cat), countLbl = $('[data-count-label]', cat);
    const empty = $('[data-empty]', cat), moreWrap = $('[data-more-wrap]', cat), moreBtn = $('[data-load-more]', cat), shown = $('[data-shown]', cat);
    const chips = $$('[data-chip]', cat);
    const brandBoxes = $$('input[name="brand"]', cat);
    const brandCount = $('[data-brand-count]', cat);
    const params = new URLSearchParams(location.search);
    const state = { q: params.get('q') || '', brands: new Set(params.getAll('producator')), chip: '', sort: params.get('sort') || 'az', limit: pageSize };
    const chipFromUrl = params.get('sub');
    if (chipFromUrl) { const c = chips.find((x) => x.dataset.chipSlug === chipFromUrl); if (c) state.chip = c.dataset.chip; }
    if (qIn) qIn.value = state.q;
    if (sortSel) sortSel.value = state.sort;
    brandBoxes.forEach((b) => { b.checked = state.brands.has(b.value); });

    // Producător popover
    const pop = $('[data-pop]', cat);
    if (pop) {
      const btn = $('button', pop), panel = $('.pop-panel', pop);
      const setPop = (on) => { panel.hidden = !on; btn.setAttribute('aria-expanded', on); };
      btn.addEventListener('click', () => setPop(panel.hidden));
      document.addEventListener('click', (e) => { if (!pop.contains(e.target)) setPop(false); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setPop(false); btn.focus(); } });
    }

    const sorters = {
      az: (a, b) => a.dataset.sort.localeCompare(b.dataset.sort, 'ro'),
      za: (a, b) => b.dataset.sort.localeCompare(a.dataset.sort, 'ro'),
      new: (a, b) => b.dataset.date.localeCompare(a.dataset.date),
    };
    const label = (n) => n === 1 ? 'produs' : (n % 100 >= 20 || (n && n % 100 === 0) ? 'de produse' : 'produse');
    let first = true;
    function apply(resetLimit) {
      if (resetLimit) state.limit = pageSize;
      const tokens = fold(state.q).split(/\s+/).filter(Boolean);
      const chipIds = state.chip ? new Set(state.chip.split(' ')) : null;
      const vis = items.filter((it) => {
        if (tokens.length && !tokens.every((t) => it.dataset.name.includes(t))) return false;
        if (state.brands.size && !state.brands.has(it.dataset.brand)) return false;
        if (chipIds && !it.dataset.cats.split(' ').some((c) => chipIds.has(c))) return false;
        return true;
      }).sort(sorters[state.sort] || sorters.az);
      const visSet = new Set(vis);
      const frag = document.createDocumentFragment();
      vis.forEach((it) => frag.appendChild(it));
      items.filter((it) => !visSet.has(it)).forEach((it) => frag.appendChild(it));
      grid.appendChild(frag);
      items.forEach((it) => {
        const pos = vis.indexOf(it);
        const show = pos > -1 && pos < state.limit;
        const wasHidden = it.hidden;
        it.hidden = !show;
        if (show && wasHidden && !first && !reduced) { it.classList.remove('is-entering'); void it.offsetWidth; it.classList.add('is-entering'); }
      });
      first = false;
      countEl.textContent = vis.length;
      countLbl.textContent = label(vis.length);
      empty.hidden = vis.length > 0;
      grid.hidden = vis.length === 0;
      const visibleNow = Math.min(state.limit, vis.length);
      moreWrap.hidden = visibleNow >= vis.length;
      if (!moreWrap.hidden) shown.textContent = `${visibleNow} din ${vis.length}`;
      chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.chip === state.chip));
      if (qClear) qClear.hidden = !state.q;
      if (brandCount) brandCount.textContent = state.brands.size || '';
      const sp = new URLSearchParams();
      if (state.q) sp.set('q', state.q);
      state.brands.forEach((b) => sp.append('producator', b));
      const chipEl = chips.find((c) => state.chip && c.dataset.chip === state.chip);
      if (chipEl) sp.set('sub', chipEl.dataset.chipSlug);
      if (state.sort !== 'az') sp.set('sort', state.sort);
      const qs = sp.toString();
      history.replaceState(history.state, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
    let qT;
    qIn?.addEventListener('input', () => { clearTimeout(qT); qT = setTimeout(() => { state.q = qIn.value.trim(); apply(true); }, 120); });
    qClear?.addEventListener('click', () => { qIn.value = ''; state.q = ''; apply(true); qIn.focus(); });
    sortSel?.addEventListener('change', () => { state.sort = sortSel.value; apply(false); });
    chips.forEach((c) => c.addEventListener('click', () => { state.chip = c.dataset.chip; apply(true); }));
    brandBoxes.forEach((b) => b.addEventListener('change', () => { b.checked ? state.brands.add(b.value) : state.brands.delete(b.value); apply(true); }));
    moreBtn?.addEventListener('click', () => {
      const firstNew = state.limit;
      state.limit += pageSize; apply(false);
      items.filter((it) => !it.hidden)[firstNew]?.querySelector('a')?.focus({ preventScroll: true });
    });
    $$('[data-reset]', cat).forEach((b) => b.addEventListener('click', () => {
      state.q = ''; state.brands.clear(); state.chip = ''; if (qIn) qIn.value = '';
      brandBoxes.forEach((x) => { x.checked = false; });
      apply(true);
    }));
    apply(true);
  });

  // ------------------------------------------------------------ lightbox
  const ICON = {
    close: '<svg class="i" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    prev: '<svg class="i" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg class="i" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  };
  function lightbox(images, start = 0, origin = null, opts = {}) {
    let i = start;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Galerie imagini');
    lb.innerHTML = `
      <div class="lb-top"><span data-lb-count></span><button type="button" data-lb-close aria-label="Închide">${ICON.close}</button></div>
      <div class="lb-stage"><img alt="" data-lb-img${opts.light ? ' class="is-light"' : ''}>
        ${images.length > 1 ? `<button class="lb-nav prev" type="button" data-lb-prev aria-label="Anterioara">${ICON.prev}</button><button class="lb-nav next" type="button" data-lb-next aria-label="Următoarea">${ICON.next}</button>` : ''}
      </div>
      ${images.length > 1 ? `<div class="lb-thumbs">${images.map((im, k) => `<button type="button" data-lb-thumb="${k}" aria-label="Imaginea ${k + 1}"><img src="${im.thumb || im.src}" alt="" loading="lazy"></button>`).join('')}</div>` : '<div></div>'}`;
    document.body.appendChild(lb);
    lockScroll(true);
    const imgEl = $('[data-lb-img]', lb), countEl = $('[data-lb-count]', lb);
    const show = (n, dir = 0) => {
      i = (n + images.length) % images.length;
      imgEl.style.opacity = '0';
      imgEl.style.transform = dir ? `translateX(${dir * 30}px)` : '';
      const im = new Image();
      im.onload = im.onerror = () => {
        imgEl.src = images[i].src; imgEl.alt = images[i].alt || '';
        requestAnimationFrame(() => { imgEl.style.opacity = '1'; imgEl.style.transform = ''; });
      };
      im.src = images[i].src;
      countEl.textContent = images.length > 1 ? `${i + 1} / ${images.length}` : '';
      $$('[data-lb-thumb]', lb).forEach((t, k) => t.setAttribute('aria-current', k === i));
      $(`[data-lb-thumb="${i}"]`, lb)?.scrollIntoView({ block: 'nearest', inline: 'center' });
    };
    const close = () => {
      lb.classList.remove('is-open');
      removeEventListener('keydown', onKey);
      setTimeout(() => { lb.remove(); lockScroll(false); }, reduced ? 0 : 320);
      origin?.focus?.({ preventScroll: true });
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(i + 1, 1);
      else if (e.key === 'ArrowLeft') show(i - 1, -1);
      else if (e.key === 'Tab') { // focus trap
        const f = $$('button', lb); const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    addEventListener('keydown', onKey);
    lb.addEventListener('click', (e) => {
      if (e.target.closest('[data-lb-close]') || e.target.classList.contains('lb-stage')) close();
      else if (e.target.closest('[data-lb-prev]')) show(i - 1, -1);
      else if (e.target.closest('[data-lb-next]')) show(i + 1, 1);
      else { const t = e.target.closest('[data-lb-thumb]'); if (t) show(+t.dataset.lbThumb); }
    });
    let sx = null;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50 && images.length > 1) show(i + (e.clientX < sx ? 1 : -1), e.clientX < sx ? 1 : -1); sx = null; });
    show(i);
    requestAnimationFrame(() => lb.classList.add('is-open'));
    $('[data-lb-close]', lb).focus();
  }
  // single-image lightboxes (ISO certificates)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lightbox]');
    if (!b) return;
    const group = $$(`[data-lightbox="${b.dataset.lightbox}"]`);
    lightbox(group.map((g) => ({ src: g.dataset.src, thumb: g.querySelector('img')?.currentSrc, alt: g.dataset.alt })), group.indexOf(b), b, { light: true });
  });
  // article galleries
  $$('[data-gallery-group]').forEach((g) => {
    const images = JSON.parse(g.dataset.images || '[]');
    g.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lightbox-index]');
      if (b) lightbox(images, +b.dataset.lightboxIndex, b);
    });
  });

  // ------------------------------------------------------------ product gallery
  $$('[data-gallery]').forEach((g) => {
    const images = JSON.parse(g.dataset.images || '[]');
    const stage = $('[data-stage]', g), track = $('[data-track]', g);
    const slides = $$('.stage-slide', g), thumbs = $$('[data-thumb]', g), cur = $('[data-cur]', g);
    let i = 0;
    const go = (n) => {
      if (!slides.length) return;
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-i * 100}%)`;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      thumbs.forEach((t, k) => t.setAttribute('aria-current', k === i));
      if (cur) cur.textContent = i + 1;
    };
    thumbs.forEach((t) => { t.addEventListener('click', () => go(+t.dataset.thumb)); t.addEventListener('mouseenter', () => finePointer && go(+t.dataset.thumb)); });
    $('[data-prev]', g)?.addEventListener('click', (e) => { e.stopPropagation(); go(i - 1); });
    $('[data-next]', g)?.addEventListener('click', (e) => { e.stopPropagation(); go(i + 1); });
    const open = () => images.length && lightbox(images, i, stage, { light: true });
    $('[data-open-lightbox]', g)?.addEventListener('click', (e) => { e.stopPropagation(); open(); });
    stage.addEventListener('click', (e) => { if (!e.target.closest('button')) open(); });
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'Enter') open();
    });
    if (finePointer && !reduced) {
      stage.addEventListener('mousemove', (e) => {
        if (e.target.closest('button')) { stage.classList.remove('is-zooming'); return; }
        const r = stage.getBoundingClientRect();
        const im = slides[i]?.querySelector('img');
        if (!im) return;
        im.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        im.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        stage.classList.add('is-zooming');
      });
      stage.addEventListener('mouseleave', () => stage.classList.remove('is-zooming'));
    }
    let sx = null;
    stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    stage.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 40) go(i + (e.clientX < sx ? 1 : -1)); sx = null; });
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-focus-form]');
    if (!a) return;
    e.preventDefault();
    const target = $('#oferta') || $('#formular');
    target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => target?.querySelector('input:not([type=hidden])')?.focus({ preventScroll: true }), reduced ? 0 : 650);
  });

  // ------------------------------------------------------------ legal TOC scroll-spy
  const toc = $('[data-toc]');
  if (toc) {
    const links = $$('a', toc);
    const heads = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const spy = () => {
      let cur = heads[0];
      heads.forEach((h) => { if (h.getBoundingClientRect().top < 160) cur = h; });
      links.forEach((a) => a.classList.toggle('is-active', cur && a.hash === '#' + cur.id));
    };
    addEventListener('scroll', () => requestAnimationFrame(spy), { passive: true });
    spy();
  }

  // ------------------------------------------------------------ events year filter
  const yf = $('[data-year-filter]');
  if (yf) {
    const list = $$('[data-events] > li');
    yf.addEventListener('click', (e) => {
      const b = e.target.closest('[data-year]'); if (!b) return;
      $$('[data-year]', yf).forEach((x) => x.setAttribute('aria-pressed', x === b));
      list.forEach((li) => { li.hidden = !!b.dataset.year && li.dataset.year !== b.dataset.year; });
    });
  }

  // ------------------------------------------------------------ share / copy link
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-share], [data-copy]');
    if (!b) return;
    const url = b.dataset.share || b.dataset.copy;
    if (b.dataset.share && navigator.share) { try { await navigator.share({ title: b.dataset.shareTitle || document.title, url }); return; } catch { return; } }
    try { await navigator.clipboard.writeText(url); toast('Link copiat'); }
    catch { prompt('Copiați linkul:', url); }
  });

  // ------------------------------------------------------------ cookie consent + maps
  const CONSENT = 'temco-consent';
  const cookie = $('[data-cookie]');
  const loadMap = (w) => {
    if (w.dataset.loaded) return;
    w.dataset.loaded = '1';
    const f = document.createElement('iframe');
    f.src = w.dataset.src; f.title = w.dataset.title || 'Hartă'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    w.appendChild(f);
    f.addEventListener('load', () => $('.map-consent', w)?.remove());
  };
  const consent = store.get(CONSENT);
  const showCookie = (on) => {
    if (!cookie) return;
    if (on) { cookie.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => cookie.classList.add('is-on'))); }
    else { cookie.classList.remove('is-on'); setTimeout(() => { cookie.hidden = true; }, 400); }
  };
  if (!consent) setTimeout(() => showCookie(true), 900);
  if (consent === 'accepted') $$('[data-map]').forEach((w) => new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { loadMap(w); o.disconnect(); } }, { rootMargin: '200px' }).observe(w));
  $$('[data-cookie-choice]').forEach((b) => b.addEventListener('click', () => {
    store.set(CONSENT, b.dataset.cookieChoice);
    showCookie(false);
    if (b.dataset.cookieChoice === 'accepted') $$('[data-map]').forEach(loadMap);
    toast(b.dataset.cookieChoice === 'accepted' ? 'Preferințele au fost salvate' : 'Cookie-urile opționale au fost respinse');
  }));
  $$('[data-cookie-settings]').forEach((b) => b.addEventListener('click', () => showCookie(true)));
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-map-load]'); if (b) loadMap(b.closest('[data-map]')); });

  // ------------------------------------------------------------ forms
  const MSG = {
    required: 'Acest câmp este obligatoriu.',
    email: 'Introduceți o adresă de email validă.',
    tel: 'Introduceți un număr de telefon valid.',
    consent: 'Este necesar acordul pentru prelucrarea datelor.',
  };
  $$('[data-form]').forEach((form) => {
    let tried = false;
    const fields = $$('input:not([type=hidden]):not([name=website]), textarea', form).filter((f) => f.type !== 'checkbox');
    const consentBox = $('input[name="acord"]', form);
    const check = (f) => {
      const wrap = f.closest('.field'); if (!wrap) return true;
      let msg = '';
      const v = f.value.trim();
      if (f.required && !v) msg = MSG.required;
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = MSG.email;
      else if (f.type === 'tel' && v && !/^[0-9 +().\-/]{6,}$/.test(v)) msg = MSG.tel;
      wrap.classList.toggle('is-invalid', !!msg);
      f.setAttribute('aria-invalid', !!msg);
      $('.err', wrap).textContent = msg;
      return !msg;
    };
    fields.forEach((f) => {
      f.addEventListener('blur', () => tried && check(f));
      f.addEventListener('input', () => { if (f.closest('.is-invalid')) check(f); });
    });
    consentBox?.addEventListener('change', () => consentBox.closest('.consent').classList.toggle('is-invalid', tried && !consentBox.checked));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      tried = true;
      const okFields = fields.map(check).every(Boolean);
      const okConsent = !consentBox || consentBox.checked;
      consentBox?.closest('.consent').classList.toggle('is-invalid', !okConsent);
      if (!okFields || !okConsent) {
        const firstBad = fields.find((f) => f.closest('.is-invalid')) || consentBox;
        firstBad?.focus();
        if (!okConsent && okFields) toast(MSG.consent);
        return;
      }
      if ($('[name="website"]', form)?.value) return; // honeypot
      const data = new FormData(form);
      const btn = $('button[type="submit"]', form);
      const action = form.getAttribute('action') || '';
      const product = data.get('produs');
      const subject = product ? `Solicitare ofertă: ${product}` : 'Mesaj de pe temco.ro';
      if (action.startsWith('mailto:')) {
        const lines = [
          `Nume: ${data.get('nume')}`, `Email: ${data.get('email')}`, `Telefon: ${data.get('telefon')}`, `Oraș: ${data.get('oras')}`,
          product ? `Produs: ${product}\nLink: ${data.get('url_produs')}` : '', '', String(data.get('mesaj') || ''),
        ].filter((l) => l !== null);
        location.href = `${action}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
        success(form, true);
        return;
      }
      btn.classList.add('is-loading');
      try {
        data.append('_subject', subject);
        const r = await fetch(action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(r.status);
        success(form, false);
      } catch {
        toast('Mesajul nu a putut fi trimis. Vă rugăm încercați din nou sau scrieți-ne la office@temco.ro.');
      } finally { btn.classList.remove('is-loading'); }
    });
  });
  function success(form, viaMail) {
    const card = form.closest('.form-card');
    const h = card.offsetHeight;
    card.style.minHeight = h + 'px';
    form.hidden = true;
    const ctx = $('.form-context', card); if (ctx) ctx.hidden = true;
    const ok = document.createElement('div');
    ok.className = 'form-success'; ok.setAttribute('role', 'status'); ok.tabIndex = -1;
    ok.innerHTML = `<span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" pathLength="30"/></svg></span>
      <h3>${viaMail ? 'Mesajul este pregătit' : 'Vă mulțumim!'}</h3>
      <p>${viaMail ? 'Am deschis aplicația de email cu mesajul completat. Apăsați „Trimite” pentru a-l expedia către office@temco.ro.' : 'Mesajul a fost trimis. Un specialist TEMCO vă va contacta în cel mai scurt timp.'}</p>
      <button class="btn btn-ghost btn-sm" type="button">Trimite alt mesaj</button>`;
    card.appendChild(ok);
    ok.focus();
    $('button', ok).addEventListener('click', () => { ok.remove(); form.reset(); form.hidden = false; if (ctx) ctx.hidden = false; card.style.minHeight = ''; });
  }

  // ------------------------------------------------------------ search
  let INDEX = null, loading = null;
  const loadIndex = () => {
    if (INDEX) return Promise.resolve(INDEX);
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = ROOT + 'assets/js/search-index.js';
      s.onload = () => {
        INDEX = (window.__TEMCO_INDEX || []).map((x) => ({ ...x, f: fold(x.n) }));
        res(INDEX);
      };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return loading;
  };
  function search(q) {
    const nq = fold(q.trim());
    const tokens = nq.split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const res = [];
    for (const it of INDEX) {
      if (!tokens.every((t) => it.k.includes(t) || it.f.includes(t))) continue;
      let s = 0;
      if (it.f === nq) s += 200;
      if (it.f.startsWith(nq)) s += 100;
      else if (it.f.includes(nq)) s += 60;
      for (const t of tokens) {
        if (new RegExp('(^|[^a-z0-9])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(it.f)) s += 18;
        else if (it.f.includes(t)) s += 8;
        if (it.m && fold(it.m).includes(t)) s += 22;
        if (it.b && fold(it.b).includes(t)) s += 6;
      }
      if (it.t === 'c') s += 12;
      if (it.t === 'g') s += 4;
      res.push([s, it]);
    }
    return res.sort((a, b) => b[0] - a[0] || a[1].n.localeCompare(b[1].n, 'ro')).map((r) => r[1]);
  }
  function highlight(text, q) {
    const tokens = fold(q).split(/\s+/).filter((t) => t.length > 0);
    if (!tokens.length) return escHtml(text);
    const chars = [...text];
    const folded = chars.map((c) => fold(c) || c).map((c) => c[0] || ' ').join('');
    const mark = new Array(chars.length).fill(false);
    tokens.forEach((t) => { let p = folded.indexOf(t); while (p > -1) { for (let k = p; k < p + t.length; k++) mark[k] = true; p = folded.indexOf(t, p + t.length); } });
    let out = '', open = false;
    chars.forEach((c, k) => {
      if (mark[k] && !open) { out += '<mark>'; open = true; }
      if (!mark[k] && open) { out += '</mark>'; open = false; }
      out += escHtml(c);
    });
    return out + (open ? '</mark>' : '');
  }
  const TYPE = { p: 'Produse', c: 'Categorii', a: 'Instruire / Evenimente', g: 'Pagini' };
  const arrowSvg = '<svg class="i go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  const pageSvg = '<svg class="i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';
  function itemHtml(it, q, id, asOption = true) {
    const sub = it.t === 'p' ? [it.b, it.m && 'Model ' + it.m, it.c].filter(Boolean).join(' · ')
      : it.t === 'c' ? `${it.c ? it.c + ' · ' : ''}${it.q} produse`
      : it.t === 'a' ? new Date(it.d).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pagină';
    const thumb = it.i ? `<span class="thumb${it.t === 'p' ? '' : ' is-cover'}"><img src="${ROOT + it.i}" alt="" loading="lazy"></span>` : `<span class="thumb">${pageSvg}</span>`;
    return `<a class="sd-item" id="${id}"${asOption ? ' role="option" aria-selected="false"' : ''} href="${ROOT + it.u}">${thumb}<span class="txt"><strong>${highlight(it.n, q)}</strong><small>${escHtml(sub)}</small></span>${arrowSvg}</a>`;
  }
  const dlg = $('[data-search]');
  if (dlg) {
    const input = $('input', dlg), body = $('.sd-body', dlg), allLink = $('[data-search-all]', dlg);
    let sel = -1, opener = null;
    const RECENT = 'temco-recent-search';
    const recent = () => { try { return JSON.parse(store.get(RECENT) || '[]'); } catch { return []; } };
    const remember = (q) => { if (!q) return; const r = [q, ...recent().filter((x) => x !== q)].slice(0, 5); store.set(RECENT, JSON.stringify(r)); };
    const items = () => $$('.sd-item', body);
    const select = (n) => {
      const list = items(); if (!list.length) return;
      sel = (n + list.length) % list.length;
      list.forEach((el, k) => el.setAttribute('aria-selected', k === sel));
      input.setAttribute('aria-activedescendant', list[sel].id);
      list[sel].scrollIntoView({ block: 'nearest' });
    };
    const render = () => {
      const q = input.value;
      sel = -1;
      allLink.href = ROOT + 'cautare/' + (q.trim() ? '?q=' + encodeURIComponent(q.trim()) : '');
      if (!q.trim()) {
        const r = recent();
        const cats = INDEX.filter((x) => x.t === 'c' && !x.c).slice(0, 12);
        body.innerHTML = (r.length ? `<div class="sd-group"><h3 class="g-h">Căutări recente</h3><div class="sd-suggest">${r.map((x) => `<button class="chip" type="button" data-q="${escHtml(x)}">${escHtml(x)}</button>`).join('')}</div></div>` : '')
          + `<div class="sd-group"><h3 class="g-h">Domenii</h3>${cats.map((c, k) => itemHtml(c, '', 'sd-' + k)).join('')}</div>`;
        return;
      }
      const res = search(q);
      if (!res.length) {
        body.innerHTML = `<div class="sd-empty"><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/></svg><strong>Niciun rezultat pentru „${escHtml(q)}”</strong></div>`;
        return;
      }
      const groups = { c: [], p: [], a: [], g: [] };
      res.forEach((r) => groups[r.t].push(r));
      const lim = { c: 4, p: 8, a: 3, g: 3 };
      let k = 0, html = '';
      for (const t of ['c', 'p', 'a', 'g']) {
        if (!groups[t].length) continue;
        html += `<div class="sd-group"><h3 class="g-h"><span>${TYPE[t]}</span><span>${groups[t].length}</span></h3>${groups[t].slice(0, lim[t]).map((it) => itemHtml(it, q, 'sd-' + k++)).join('')}</div>`;
      }
      body.innerHTML = html;
      select(0);
    };
    const open = async (e) => {
      opener = e?.currentTarget || document.activeElement;
      if (!dlg.open) dlg.showModal();
      lockScroll(true);
      input.value = '';
      body.innerHTML = '<div class="sd-empty"><span>Se încarcă…</span></div>';
      input.focus();
      try { await loadIndex(); render(); } catch { body.innerHTML = '<div class="sd-empty">Căutarea nu este disponibilă momentan.</div>'; }
    };
    $$('[data-search-open]').forEach((b) => b.addEventListener('click', open));
    $('[data-search-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { lockScroll(false); opener?.focus?.({ preventScroll: true }); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); const c = e.target.closest('[data-q]'); if (c) { input.value = c.dataset.q; render(); input.focus(); } });
    let rT;
    input.addEventListener('input', () => { clearTimeout(rT); rT = setTimeout(() => INDEX && render(), 60); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(sel - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const list = items();
        remember(input.value.trim());
        if (sel > -1 && list[sel]) location.href = list[sel].href;
        else if (input.value.trim()) location.href = allLink.href;
      }
    });
    body.addEventListener('click', (e) => { if (e.target.closest('.sd-item')) remember(input.value.trim()); });
    body.addEventListener('mousemove', (e) => { const it = e.target.closest('.sd-item'); if (it) { const k = items().indexOf(it); if (k !== sel) select(k); } });
    addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); dlg.open ? dlg.close() : open(); }
      else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); open(); }
    });
    $$('.search-trigger, [data-search-open]').forEach((b) => b.addEventListener('mouseenter', () => loadIndex().catch(() => {}), { once: true }));
  }

  // full search results page
  const sp = $('[data-search-page]');
  if (sp) {
    const q = new URLSearchParams(location.search).get('q') || '';
    const input = $('[data-search-page-input]');
    if (input) input.value = q;
    loadIndex().then(() => {
      const res = q ? search(q) : [];
      const prods = res.filter((r) => r.t === 'p'), cats = res.filter((r) => r.t === 'c'), arts = res.filter((r) => r.t === 'a' || r.t === 'g');
      $('[data-search-summary]').innerHTML = q ? `<b>${res.length}</b> rezultate pentru „${escHtml(q)}”` : 'Introduceți un termen de căutare.';
      $('[data-search-cats]').innerHTML = cats.length ? `<div class="chip-row">${cats.map((c) => `<a class="chip" href="${ROOT + c.u}">${escHtml(c.n)} <span class="count">${c.q}</span></a>`).join('')}</div>` : '';
      $('[data-search-products]').innerHTML = prods.map((p) => `
        <li class="p-item"><article class="p-card"><div class="media">${p.i ? `<img src="${ROOT + p.i}" alt="" loading="lazy">` : ''}</div>
          <h3><a href="${ROOT + p.u}">${highlight(p.n, q)}</a></h3>${p.b ? `<p>${escHtml(p.b)}</p>` : ''}</article></li>`).join('');
      $('[data-search-posts]').innerHTML = arts.length ? `<h2 class="label" style="margin-bottom:12px">Pagini și evenimente</h2><div class="sd-group" style="max-width:720px">${arts.map((a, k) => itemHtml(a, q, 'sp-' + k, false)).join('')}</div>` : '';
      if (q && !res.length) $('[data-search-products]').outerHTML = `<div class="empty-state"><h2>Niciun rezultat</h2><a class="text-link" href="${ROOT}produsele-noastre/">Vezi produsele</a></div>`;
      document.title = q ? `${q} | Căutare | TEMCO` : document.title;
    });
  }
  // WordPress-style search URLs (/?s=...) keep working
  const s = new URLSearchParams(location.search).get('s');
  if (s !== null) location.replace(ROOT + 'cautare/?q=' + encodeURIComponent(s));

})();
