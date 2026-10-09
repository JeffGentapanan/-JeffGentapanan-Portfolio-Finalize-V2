import { useEffect } from 'react';

// Animate on viewport entry without hiding content or changing keyboard access.
export function useScrollReveal(root, view) {
  useEffect(() => {
    const container = root.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || !window.IntersectionObserver) return;
    const animations = new Map();
    const seen = new Set();
    const selector =
      '.section-heading, .project-card, .personal-section > h2, .personal-lead, .portrait, .skill-columns > article, .resume-details, .contact-columns, .home-stack';
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || motion.matches || !entry.target.animate) continue;
          animations.get(entry.target)?.cancel();
          const animation = entry.target.animate(
            [
              { opacity: 0.25, transform: 'translateY(22px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' }
          );
          animations.set(entry.target, animation);
          animation.onfinish = () => animations.delete(entry.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -35px 0px' }
    );
    function scan() {
      for (const element of seen) {
        if (!container.contains(element)) {
          observer.unobserve(element);
          animations.get(element)?.cancel();
          animations.delete(element);
          seen.delete(element);
        }
      }
      container.querySelectorAll(selector).forEach((element) => {
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
      if (motion.matches) animations.forEach((animation) => animation.cancel());
    };
    motion.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect();
      updates.disconnect();
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener('change', stopMotion);
    };
  }, [root, view]);
}
