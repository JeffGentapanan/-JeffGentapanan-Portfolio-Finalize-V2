import { lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { OpeningPage } from './components/opening-page';
import { OwnerProvider } from './components/owner/owner-provider';
import { Portfolio } from './components/portfolio';
import { useMediaQuery } from './hooks/use-media-query';
import './styles/tokens.css';
import './styles/global.css';
const Plasma = lazy(() => import('./components/three/plasma-background'));

function Experience() {
  const [phase, setPhase] = useState('opening');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    if (phase !== 'entering') return;
    const timer = setTimeout(() => setPhase('portfolio'), reduced ? 0 : 500);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    const id = phase === 'portfolio' ? 'main' : phase === 'opening' ? 'get-started' : null;
    if (id) document.getElementById(id)?.focus({ preventScroll: true });
  }, [phase]);

  return <div className="experience">
    <Suspense fallback={null}><Plasma opacity={0.36}/></Suspense>
    {phase !== 'portfolio' && <OpeningPage leaving={phase === 'entering'} onEnter={() => setPhase('entering')}/>}
    {phase !== 'opening' && <div className="main-reveal" inert={phase === 'entering'}><Portfolio/></div>}
  </div>;
}
export default function App() { return <ThemeProvider><OwnerProvider><Experience/></OwnerProvider></ThemeProvider>; }

import './styles/owner-refinement.css';
