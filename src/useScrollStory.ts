import { useEffect } from 'react';
import Lenis from 'lenis';
import Snap from 'lenis/snap';
import 'lenis/dist/lenis.css';

// A single clock drives scrolling, snapping and each element's reversible motion.
export function useScrollStory() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let teardown = () => {};
    const setup = () => {
      teardown();
      const track = document.querySelector<HTMLElement>('.story-track')!;
      const stage = document.querySelector<HTMLElement>('.story-stage')!;
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.scene'));
      const selector = 'h1, h2, h3, p, .hero, .image-card, img, .photo-badge, .photo-badge small, .photo-badge strong, .photo-note, .tabs, .booking-bar, .booking-bar label, fieldset, .experience-bar, .experience-bar strong, .benefits > span, .comfort-tags > span, .comfort-search, .comfort-booking, .comfort-booking label, button, a, .small-label';
      const reduced = media.matches;
      const lenis = reduced ? null : new Lenis({
        lerp: 0.085, smoothWheel: true, syncTouch: false,
        anchors: false,
        prevent: node => Boolean(node.closest('.modal-backdrop, input, select, textarea')),
      });
      const snap = lenis ? new Snap(lenis, { type: 'mandatory', duration: 0.9, debounce: 180, easing: t => 1 - Math.pow(1 - t, 3) }) : null;
      document.documentElement.classList.toggle('smooth-story', !reduced);
      let removeStops: (() => void)[] = [];
      const resize = () => {
        removeStops.forEach(remove => remove());
        const header = document.querySelector('header')!.getBoundingClientRect().height;
        lenis?.resize();
        const base = scrollY + track.getBoundingClientRect().top - header;
        removeStops = sections.map((_, index) => snap?.add(Math.max(0, base + index * stage.clientHeight)) || (() => {}));
      };
      let groups = sections.map(section => ({ section, items: [] as HTMLElement[] }));
      const collect = () => {
        groups = sections.map(section => ({ section, items: Array.from(section.querySelectorAll<HTMLElement>(selector)) }));
        groups.forEach(({ items }) => items.forEach(item => item.classList.add('story-object')));
      };
      collect(); resize();
      const observer = new MutationObserver(collect);
      sections.forEach(section => observer.observe(section, { childList: true, subtree: true }));
      let raf = 0;
      const start = performance.now();
      const draw = (time: number) => {
        lenis?.raf(time);
        const header = document.querySelector('header')!.getBoundingClientRect().height;
        const progress = Math.max(0, Math.min(1, (header - track.getBoundingClientRect().top) / Math.max(1, stage.clientHeight)));
        groups.forEach(({ section, items }, sceneIndex) => {
          const signed = sceneIndex - progress;
          const smooth = (n: number) => { const v = Math.max(0, Math.min(1, n)); return v * v * (3 - 2 * v); };
          const opacity = reduced ? (Math.round(progress) === sceneIndex ? 1 : 0) : sceneIndex === 0 ? 1 - smooth(progress / 0.72) : smooth((progress - 0.22) / 0.78);
          section.style.opacity = String(opacity);
          section.style.setProperty('--scene-y', `${reduced ? 0 : signed * 35}px`);
          const active = Math.round(progress) === sceneIndex;
          section.inert = !active;
          section.setAttribute('aria-hidden', String(!active));
          section.style.zIndex = active ? '2' : '1';
          items.forEach((item, index) => {
            const delay = (index % 7) * 0.035;
            const entry = Math.max(0, 1 - (time - start - delay * 1000) / 850);
            const distance = Math.abs(signed);
            const progress = Math.min(1, distance * (1 + delay));
            const direction = signed < 0 ? -1 : 1;
            const amount = reduced ? 0 : Math.max(progress, section === sections[0] ? entry * entry : 0);
            const container = item.matches('.hero, .image-card, .booking-bar, .comfort-booking, .comfort-search, .tabs, .photo-badge, .experience-bar');
            const image = item.tagName === 'IMG';
            const horizontal = !container && !image && index % 3 === 1;
            const x = horizontal ? amount * (index % 2 ? -55 : 55) : 0;
            const y = horizontal ? 0 : amount * direction * (container ? 34 : 65 + index % 4 * 12);
            item.style.setProperty('--motion-x', `${x.toFixed(2)}px`);
            item.style.setProperty('--motion-y', `${y.toFixed(2)}px`);
            item.style.setProperty('--motion-scale', String(image ? 1 + amount * 0.06 : container ? 1 - amount * 0.025 : 1));
            item.style.setProperty('--motion-opacity', String(container || image ? 1 - amount * 0.3 : Math.max(0, 1 - amount * 1.25)));
          });
        });
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      const navigate = (event: MouseEvent) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>('a[href="#home"], a[href="#comfort"]');
        if (!link) return;
        event.preventDefault();
        const index = link.hash === '#comfort' ? 1 : 0;
        const header = document.querySelector('header')!.getBoundingClientRect().height;
        const target = scrollY + track.getBoundingClientRect().top - header + index * stage.clientHeight;
        if (lenis) lenis.scrollTo(target, { duration: 1.2 }); else window.scrollTo({ top: target, behavior: 'instant' });
      };
      document.addEventListener('click', navigate);
      window.addEventListener('resize', resize);
      teardown = () => {
        cancelAnimationFrame(raf); observer.disconnect(); document.removeEventListener('click', navigate); window.removeEventListener('resize', resize);
        removeStops.forEach(remove => remove()); snap?.destroy(); lenis?.destroy();
        document.documentElement.classList.remove('smooth-story');
        groups.forEach(({ items }) => items.forEach(item => { item.classList.remove('story-object'); ['--motion-x', '--motion-y', '--motion-scale', '--motion-opacity'].forEach(key => item.style.removeProperty(key)); }));
      };
    };
    setup(); media.addEventListener('change', setup);
    return () => { media.removeEventListener('change', setup); teardown(); };
  }, []);
}
