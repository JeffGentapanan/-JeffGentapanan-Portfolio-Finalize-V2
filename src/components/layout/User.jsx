import { lazy, Suspense } from 'react';
import { titles } from '@/data/navigation';
import { TrueFocus } from '@/components/ui/TrueFocus';
const Scene = lazy(() => import('@/components/three/scene'));

export function User({ view }) {
  return (
    <section className="user" aria-labelledby="user-title">
      <div className="user-title" key={view}>
        <div className="eyebrow focus-name">
          <TrueFocus
            sentence="Jeff A. Gentapanan"
            blurAmount={1.2}
            animationDuration={0.7}
            pauseBetweenAnimations={1.2}
            borderColor="var(--foreground)"
            glowColor="color-mix(in srgb, var(--foreground) 28%, transparent)"
          />
        </div>
        <h1 id="user-title">
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
      <div className="user-foot">
        <p>
          I’m a 3rd-year IT student building my skills in front-end development and design, one
          thoughtful project at a time.
        </p>
      </div>
    </section>
  );
}
