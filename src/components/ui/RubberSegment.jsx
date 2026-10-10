import { useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import './rubber-segment.css';

export function RubberSegment({
  items,
  value,
  onNavigate,
  className = '',
  radius = 9,
  inset = 2,
  'aria-label': ariaLabel = 'Primary navigation',
}) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const slots = useRef([]);
  const currentIndex = useRef(-1);
  const [thumbValue, setThumbValue] = useState(value);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const labelOpacity = useMotionValue(1);
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value)
  );
  const itemKey = items.map((item) => item.value).join('|');

  function setPosition(index) {
    const slot = slots.current[index];
    if (!slot) return;
    x.jump(slot.x);
    y.jump(slot.y);
    width.jump(slot.width);
    height.jump(slot.height);
  }

  function measure() {
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    slots.current = items.map((_, index) => {
      const element = itemRefs.current[index];
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - trackRect.left,
        y: rect.top - trackRect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    if (currentIndex.current < 0) {
      currentIndex.current = selectedIndex;
      setThumbValue(items[selectedIndex]?.value);
    }
    setPosition(currentIndex.current);
  }

  useLayoutEffect(() => {
    measure();
    let observer;
    if (typeof ResizeObserver !== 'undefined' && trackRef.current) {
      observer = new ResizeObserver(measure);
      observer.observe(trackRef.current);
      itemRefs.current.forEach((item) => item && observer.observe(item));
    } else {
      window.addEventListener('resize', measure);
    }
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey, inset]);

  useLayoutEffect(() => {
    if (!slots.current[selectedIndex]) return;
    if (currentIndex.current < 0) {
      currentIndex.current = selectedIndex;
      setThumbValue(items[selectedIndex]?.value);
      setPosition(selectedIndex);
      return;
    }
    if (currentIndex.current === selectedIndex) return;

    currentIndex.current = selectedIndex;
    setThumbValue(items[selectedIndex]?.value);
    labelOpacity.jump(1);

    const next = slots.current[selectedIndex];
    const transition = { type: 'tween', duration: 0.16, ease: 'easeOut' };
    animate(x, next.x, transition);
    animate(y, next.y, transition);
    animate(width, next.width, transition);
    animate(height, next.height, transition);
  }, [selectedIndex, items, x, y, width, height, labelOpacity]);

  return (
    <div
      ref={trackRef}
      className={`rubber-segment${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={ariaLabel}
      style={{
        '--rs-track': 'var(--surface)',
        '--rs-thumb': 'var(--foreground)',
        '--rs-ink': 'var(--foreground)',
        '--rs-ink-active': 'var(--background)',
        '--rs-radius': `${radius}px`,
        '--rs-inset': `${inset}px`,
      }}
    >
      {items.map((item, index) => (
        <a
          key={item.value}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          className="rubber-segment__item"
          href={item.href}
          aria-current={item.value === value ? 'page' : undefined}
          onClick={() => onNavigate(item.value)}
        >
          {item.label}
        </a>
      ))}
      <motion.div
        className="rubber-segment__thumb"
        aria-hidden="true"
        style={{ x, y, width, height }}
      >
        <motion.span className="rubber-segment__thumb-label" style={{ opacity: labelOpacity }}>
          {items.find((item) => item.value === thumbValue)?.label}
        </motion.span>
      </motion.div>
    </div>
  );
}
