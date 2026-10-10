import { useEffect, useMemo, useRef } from 'react';
import './depth-text.css';

const MAX_LAYERS = 64;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getLayerColor(faceColor, depthColor, index, total) {
  const progress = total <= 1 ? 1 : index / total;
  const faceMix = Math.round((1 - progress * progress) * 76 + 4);
  return `color-mix(in srgb, ${faceColor} ${faceMix}%, ${depthColor})`;
}

function getTransform(rotateX, rotateY) {
  return `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
}

export function DepthText({
  text = 'Elevate',
  layers = 34,
  depth = 1.6,
  faceColor = 'var(--foreground)',
  depthColor = 'color-mix(in srgb, var(--foreground) 18%, var(--background))',
  tilt = 7.5,
  pointerTracking = true,
  smoothing = 0.2,
  perspective = 950,
  autoOrbit = true,
  orbitSpeed = 0.2,
  fontSize,
  fontWeight = 750,
  shadow = true,
  className = '',
}) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const safeLayers = clamp(Math.round(Number(layers) || 1), 2, MAX_LAYERS);
  const safeDepth = clamp(Number(depth) || 0, 0, 12);
  const safeTilt = clamp(Number(tilt) || 0, 0, 12);
  const safeSmoothing = clamp(Number(smoothing) || 0.14, 0.02, 0.35);
  const safePerspective = clamp(Number(perspective) || 900, 300, 2000);
  const safeOrbitSpeed = clamp(Number(orbitSpeed) || 0, 0, 2);
  const baseRotation = useMemo(
    () => ({ x: -safeTilt * 0.28, y: safeTilt * 0.34 }),
    [safeTilt]
  );

  const depthLayers = useMemo(
    () => Array.from({ length: safeLayers }, (_, layerIndex) => {
      const index = safeLayers - layerIndex;
      return {
        index,
        color: getLayerColor(faceColor, depthColor, index, safeLayers),
        transform: `translateZ(${-index * safeDepth}px)`,
      };
    }),
    [safeLayers, safeDepth, faceColor, depthColor]
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const canTrackPointer = pointerTracking && finePointer && !reducedMotion;
    let frameId;
    let activePointer = false;
    const startTime = performance.now();
    const current = { ...baseRotation };
    const target = { ...baseRotation };

    if (reducedMotion) {
      stage.style.transform = getTransform(baseRotation.x, baseRotation.y);
      return undefined;
    }

    const handlePointerMove = (event) => {
      const bounds = root.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      activePointer = true;
      // The wrapper spans the full headline line, so cursor movement near the
      // words is tracked without requiring the pointer to sit on a glyph.
      const x = clamp((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width * 0.38), -1, 1);
      const y = clamp((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height * 0.9), -1, 1);
      target.x = baseRotation.x - y * safeTilt;
      target.y = baseRotation.y + x * safeTilt;
    };

    const handlePointerLeave = () => {
      activePointer = false;
      target.x = baseRotation.x;
      target.y = baseRotation.y;
    };

    if (canTrackPointer) {
      root.addEventListener('pointermove', handlePointerMove);
      root.addEventListener('pointerleave', handlePointerLeave);
    }

    if (!canTrackPointer && !autoOrbit) {
      stage.style.transform = getTransform(baseRotation.x, baseRotation.y);
      return undefined;
    }

    const tick = (now) => {
      if ((!canTrackPointer || !activePointer) && autoOrbit) {
        const orbit = ((now - startTime) / 1000) * safeOrbitSpeed * Math.PI * 2;
        const orbitAmount = canTrackPointer ? 0.22 : 0.5;
        target.x = baseRotation.x + Math.sin(orbit) * safeTilt * orbitAmount;
        target.y = baseRotation.y + Math.cos(orbit * 0.85) * safeTilt * orbitAmount;
      }
      current.x += (target.x - current.x) * safeSmoothing;
      current.y += (target.y - current.y) * safeSmoothing;
      stage.style.transform = getTransform(current.x, current.y);
      frameId = window.requestAnimationFrame(tick);
    };

    stage.style.transform = getTransform(current.x, current.y);
    frameId = window.requestAnimationFrame(tick);

    return () => {
      root.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', handlePointerLeave);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [
    autoOrbit,
    baseRotation,
    pointerTracking,
    safeOrbitSpeed,
    safeSmoothing,
    safeTilt,
  ]);

  const rootStyle = {
    '--depth-text-perspective': `${safePerspective}px`,
    '--depth-text-font-size': fontSize,
    '--depth-text-font-weight': fontWeight,
    '--depth-text-face-color': faceColor,
    '--depth-text-depth-color': depthColor,
    '--depth-text-shadow': shadow
      ? `0 18px 30px color-mix(in srgb, ${depthColor} 34%, transparent), 0 3px 8px rgba(0, 0, 0, 0.2)`
      : 'none',
  };

  return (
    <span ref={rootRef} className={`depth-text ${className}`.trim()} style={rootStyle}>
      <span ref={stageRef} className="depth-text__stage">
        {depthLayers.map((layer) => (
          <span
            aria-hidden="true"
            className="depth-text__layer"
            key={layer.index}
            style={{ color: layer.color, transform: layer.transform }}
          >
            {text}
          </span>
        ))}
        <span className="depth-text__face">{text}</span>
      </span>
    </span>
  );
}

export default DepthText;
