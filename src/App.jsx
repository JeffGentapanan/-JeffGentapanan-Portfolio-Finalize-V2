import { lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/theme-context';
import { OpeningPage } from './components/opening-page';
import { OwnerProvider } from '@/context/owner-context';
import { Portfolio } from './components/portfolio';
import { LoadingScreen } from './components/loading-screen';
import { useMediaQuery } from './hooks/use-media-query';
import './styles/tokens.css';
import './styles/global.css';
import './styles/layout-overrides.css';
const Plasma = lazy(() => import('./components/three/plasma-background'));

function Experience() {
  const [phase, setPhase] = useState('loading');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    if (phase === 'loading') {
      if (reduced) {
        setPhase('loading-exit');
        return;
      }
      const timer = setTimeout(() => setPhase('loading-exit'), 4000);
      return () => clearTimeout(timer);
    }
    if (phase === 'loading-exit') {
      const timer = setTimeout(() => setPhase('opening'), reduced ? 0 : 420);
      return () => clearTimeout(timer);
    }
    if (phase !== 'entering') return;
    const timer = setTimeout(() => setPhase('portfolio'), reduced ? 0 : 500);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    const id = phase === 'portfolio' ? 'main' : phase === 'opening' ? 'get-started' : null;
    if (id) document.getElementById(id)?.focus({ preventScroll: true });
  }, [phase]);

  return (
    <div className="experience">
      <Suspense fallback={null}>
        <Plasma opacity={0.36} />
      </Suspense>
      {(phase === 'loading' || phase === 'loading-exit') && (
        <LoadingScreen
          leaving={phase === 'loading-exit'}
          onComplete={() => setPhase('loading-exit')}
        />
      )}
      {phase !== 'portfolio' && (
        <OpeningPage leaving={phase === 'entering'} onEnter={() => setPhase('entering')} />
      )}
      {phase === 'portfolio' && (
        <div className="main-reveal">
          <Portfolio />
        </div>
      )}
    </div>
  );
}
export default function App() {
  return (
    <ThemeProvider>
      <OwnerProvider>
        <Experience />
      </OwnerProvider>
    </ThemeProvider>
  );
}
