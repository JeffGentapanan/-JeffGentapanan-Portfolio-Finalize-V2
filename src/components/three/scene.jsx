'use client';
import { Canvas } from '@react-three/fiber';
import { Component, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/theme-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FloatingBox } from './floating-box';
function Fallback() {
  return (
    <div className="scene-fallback">
      <span>◇</span>
      <p>JEFF / DEV</p>
    </div>
  );
}
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}
export default function Scene({ view }) {
  const { resolvedTheme } = useTheme();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const interaction = useRef({ x: 0, y: 0, dragX: 0, dragY: 0 });
  const drag = useRef(null);
  const host = useRef(null);
  const [active, setActive] = useState(true);
  const [lost, setLost] = useState(false);
  useEffect(() => {
    let intersecting = true;
    const update = () => setActive(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });
    if (host.current) observer.observe(host.current);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return (
    <div
      ref={host}
      className="scene"
      tabIndex={0}
      role="group"
      aria-label="Interactive floating cube. Drag to rotate, use arrow keys, or press R to reset."
      onKeyDown={(e) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
          interaction.current.dragX +=
            e.key === 'ArrowLeft' ? -0.2 : e.key === 'ArrowRight' ? 0.2 : 0;
          interaction.current.dragY += e.key === 'ArrowUp' ? -0.2 : e.key === 'ArrowDown' ? 0.2 : 0;
        }
        if (e.key.toLowerCase() === 'r') {
          interaction.current.dragX = 0;
          interaction.current.dragY = 0;
        }
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        interaction.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        interaction.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (drag.current) {
          interaction.current.dragX += (e.clientX - drag.current.x) * 0.006;
          interaction.current.dragY += (e.clientY - drag.current.y) * 0.006;
          drag.current = { x: e.clientX, y: e.clientY };
        }
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onPointerLeave={() => {
        interaction.current.x = 0;
        interaction.current.y = 0;
      }}
    >
      <SceneBoundary>
        {lost ? (
          <Fallback />
        ) : (
          <Canvas
            shadows
            camera={{ position: [0, 0.12, 6.8], fov: 36 }}
            dpr={[1, 1.5]}
            frameloop={active ? 'always' : 'never'}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            fallback={<Fallback />}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', () => setLost(true), {
                once: true,
              });
            }}
          >
            <ambientLight intensity={0.45} />
            <directionalLight
              castShadow
              position={[-3, 5, 4]}
              intensity={3.4}
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-4}
              shadow-camera-right={4}
              shadow-camera-top={4}
              shadow-camera-bottom={-4}
              shadow-normalBias={0.025}
              shadow-bias={-0.0001}
              shadow-radius={5}
            />
            <directionalLight position={[4, 2, -3]} intensity={2.2} />
            <pointLight position={[1, -1, 4]} intensity={8} />
            <FloatingBox
              view={view}
              dark={resolvedTheme !== 'light'}
              reduced={reduced}
              interaction={interaction}
            />
          </Canvas>
        )}
      </SceneBoundary>
    </div>
  );
}
