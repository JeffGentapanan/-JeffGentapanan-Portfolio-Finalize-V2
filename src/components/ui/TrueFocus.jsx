import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './true-focus.css';

export function TrueFocus({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 1.2,
  borderColor = 'var(--foreground)',
  glowColor = 'color-mix(in srgb, var(--foreground) 28%, transparent)',
  animationDuration = 0.7,
  pauseBetweenAnimations = 1.2,
  className = '',
}) {
  const words = sentence.split(separator || ' ').filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const lastActiveIndex = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (manualMode || reduceMotion || words.length < 2) return undefined;
    const interval = window.setInterval(
      () => {
        setCurrentIndex((index) => (index + 1) % words.length);
      },
      (animationDuration + pauseBetweenAnimations) * 1000
    );
    return () => window.clearInterval(interval);
  }, [animationDuration, manualMode, pauseBetweenAnimations, reduceMotion, words.length]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const activeWord = wordRefs.current[currentIndex];
    if (!container || !activeWord) return undefined;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const parentRect = container.getBoundingClientRect();
        const wordRect = activeWord.getBoundingClientRect();
        setFocusRect({
          x: wordRect.left - parentRect.left,
          y: wordRect.top - parentRect.top,
          width: wordRect.width,
          height: wordRect.height,
        });
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [currentIndex, words.length]);

  function activate(index) {
    if (!manualMode) return;
    lastActiveIndex.current = currentIndex;
    setCurrentIndex(index);
  }

  function restoreFocus() {
    if (manualMode) setCurrentIndex(lastActiveIndex.current);
  }

  return (
    <span
      className={`focus-container ${className}`.trim()}
      ref={containerRef}
      aria-label={sentence}
    >
      {words.map((word, index) => {
        const active = index === currentIndex;
        const isFocused = reduceMotion || active;
        return (
          <span
            key={`${word}-${index}`}
            ref={(element) => {
              wordRefs.current[index] = element;
            }}
            className={`focus-word${active && !manualMode ? ' active' : ''}${manualMode ? ' manual' : ''}`}
            style={{
              filter: isFocused ? 'blur(0)' : `blur(${blurAmount}px)`,
              transition: reduceMotion
                ? 'none'
                : `filter ${animationDuration}s cubic-bezier(.22, 1, .36, 1)`,
              '--border-color': borderColor,
              '--glow-color': glowColor,
            }}
            onMouseEnter={() => activate(index)}
            onMouseLeave={restoreFocus}
          >
            {word}
          </span>
        );
      })}
      <motion.span
        className="focus-frame"
        aria-hidden="true"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: reduceMotion ? 0 : 1,
        }}
        transition={{
          duration: reduceMotion ? 0 : animationDuration,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ '--border-color': borderColor, '--glow-color': glowColor }}
      >
        <span className="focus-corner focus-corner--top-left" />
        <span className="focus-corner focus-corner--top-right" />
        <span className="focus-corner focus-corner--bottom-left" />
        <span className="focus-corner focus-corner--bottom-right" />
      </motion.span>
    </span>
  );
}
