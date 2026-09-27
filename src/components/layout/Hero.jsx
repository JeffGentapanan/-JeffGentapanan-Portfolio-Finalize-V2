import { lazy, Suspense } from 'react';
import { titles } from '@/data/navigation';
const Scene = lazy(() => import('@/components/three/scene'));

export function Hero({ view }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-title" key={view}>
        <p className="eyebrow">Jeff A. Gentapanan</p>
        <h1 id="hero-title">
          {titles[view][0]}
          <br />
          <em>{titles[view][1]}</em>
        </h1>
      </div>
      <Suspense
        fallback={
          <div className="scene scene-loading" aria-label="Loading interactive sculpture">
            ◇
          </div>
        }
      >
        <Scene view={view} />
      </Suspense>
      <div className="hero-foot">
        <p>
          I’m a 2nd-year IT student building my skills in front-end development and design, one
          thoughtful project at a time.
        </p>
      </div>
    </section>
  );
}
