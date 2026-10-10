import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

function decimalPlaces(value) {
  const text = String(value);
  if (!text.includes('.')) return 0;
  const decimals = text.split('.')[1];
  return Number.parseInt(decimals, 10) ? decimals.length : 0;
}

export function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}) {
  const ref = useRef(null);
  const callbacks = useRef({ onStart, onEnd });
  callbacks.current = { onStart, onEnd };

  const initialValue = direction === 'down' ? to : from;
  const motionValue = useMotionValue(initialValue);
  const safeDuration = Math.max(0.1, Number(duration) || 2);
  const springValue = useSpring(motionValue, {
    damping: 20 + 40 * (1 / safeDuration),
    stiffness: 100 * (1 / safeDuration),
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });
  const maxDecimals = Math.max(decimalPlaces(from), decimalPlaces(to));

  const formatValue = useCallback(
    (latest) => {
      const options = {
        useGrouping: Boolean(separator),
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals,
      };
      const formatted = Intl.NumberFormat('en-US', options).format(latest);
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [maxDecimals, separator]
  );

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(initialValue);
  }, [formatValue, initialValue]);

  useEffect(() => {
    if (!isInView || !startWhen) return undefined;

    callbacks.current.onStart?.();
    const target = direction === 'down' ? from : to;
    const timeout = window.setTimeout(() => motionValue.set(target), Math.max(0, delay) * 1000);
    const finish = window.setTimeout(
      () => callbacks.current.onEnd?.(),
      (Math.max(0, delay) + safeDuration) * 1000
    );

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(finish);
    };
  }, [isInView, startWhen, motionValue, direction, from, to, delay, safeDuration]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return unsubscribe;
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}
