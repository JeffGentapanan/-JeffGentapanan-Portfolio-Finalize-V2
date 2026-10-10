import { useEffect } from 'react';

// Coordinate viewport reveals; native scrolling and the 3D canvas stay independent.
export function useScrollReveal(root, view) {
  useEffect(() => {
    const container = root.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || !window.IntersectionObserver) return;
    const animations = new Map();
    const seen = new Set();
    const selector = [
      '.section-heading',
      '.project-card',
      '.personal-section > h2',
      '.about-section h2',
      '.personal-lead',
      '.personal-copy',
      '.portrait',
      '.skill-columns > article',
      '.resume-details > div',
      '.resume-actions',
      '.contact-columns > *',
      '.stack-intro',
      '.language-list > li',
      '.stack-tools > *',
      '.home-about-link',
    ].join(',');

    function play(element, frames, duration, delay = 0) {
      if (motion.matches || !element.animate) return;
      animations.get(element)?.cancel();
      const animation = element.animate(frames, {
        duration,
        delay,
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'backwards',
      });
      animations.set(element, animation);
      animation.onfinish = () => animations.delete(element);
      animation.oncancel = () => {
        if (animations.get(element) === animation) animations.delete(element);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const groups = new Map();
        const entering = entries.filter((entry) => entry.isIntersecting);
        entering.sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left
        );
        for (const entry of entering) {
          const element = entry.target;
          observer.unobserve(element);
          if (motion.matches || element.contains(document.activeElement)) continue;
          const compact = window.matchMedia('(max-width: 600px)').matches;
          const order = groups.get(element.parentElement) || 0;
          groups.set(element.parentElement, order + 1);
          const delay = Math.min(order, 3) * (compact ? 60 : 100);
          const heading = element.matches('.section-heading, h2, .stack-intro');
          const card = element.matches('.project-card, .skill-columns > article');
          const photo = element.matches('.portrait');
          const distance = compact ? 22 : card ? 46 : 30;
          play(
            element,
            [
              { opacity: 0, transform: `translate3d(0,${distance}px,0) scale(${card ? 0.97 : 1})` },
              { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
            ],
            compact ? 700 : heading ? 950 : 850,
            delay
          );

          // Reveal the portrait with a soft mask while preserving its color-hover effect.
          const image = photo ? element.querySelector('img') : null;
          if (image)
            play(
              image,
              [
                { clipPath: 'inset(0 0 14% 0)', transform: 'scale(1.045)' },
                { clipPath: 'inset(0 0 0% 0)', transform: 'scale(1)' },
              ],
              1100,
              delay
            );
          const bar = element.querySelector('.language-track span');
          if (bar)
            play(
              bar,
              [
                { transform: 'scaleX(0)', transformOrigin: 'left' },
                { transform: 'scaleX(1)', transformOrigin: 'left' },
              ],
              1100,
              delay + 100
            );
        }
      },
      { threshold: 0, rootMargin: '0px 0px -12px 0px' }
    );

    function scan() {
      for (const element of seen) {
        if (!container.contains(element)) {
          observer.unobserve(element);
          animations.get(element)?.cancel();
          seen.delete(element);
        }
      }
      container.querySelectorAll(selector).forEach((element) => {
        // Avoid combining a parent's entrance with an entrance on its text children.
        if (element.parentElement?.closest(selector)) return;
        if (!seen.has(element) && !element.closest('dialog')) {
          seen.add(element);
          observer.observe(element);
        }
      });
    }
    scan();
    const updates = new MutationObserver(scan);
    updates.observe(container, { childList: true, subtree: true });
    const stopMotion = () => {
      if (motion.matches) [...animations.values()].forEach((animation) => animation.cancel());
    };
    // Keyboard users never have to wait for an entrance to finish.
    const revealFocus = (event) => {
      for (const [element, animation] of animations) {
        if (element.contains(event.target)) animation.cancel();
      }
    };
    container.addEventListener('focusin', revealFocus);
    motion.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      updates.disconnect();
      [...animations.values()].forEach((animation) => animation.cancel());
      container.removeEventListener('focusin', revealFocus);
      motion.removeEventListener('change', stopMotion);
    };
  }, [root, view]);
}
