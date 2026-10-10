import { ThemeToggle } from './theme-toggle';
import { DepthText } from './ui/DepthText';
import { TrueFocus } from './ui/TrueFocus';
export function OpeningPage({ leaving, onEnter }) {
  return (
    <section className={'opening-page' + (leaving ? ' leaving' : '')} aria-labelledby="intro-title">
      <div className="opening-top">
        <span className="wordmark">JEFF.DEV</span>
        <ThemeToggle />
      </div>
      <div className="opening-copy">
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
        <h1 id="intro-title">
          <span className="intro-depth-line">
            <DepthText text="Ideas into form." />
          </span>
          <span className="intro-depth-line intro-depth-line--accent">
            <DepthText
              text="Code into feeling."
              faceColor="var(--muted)"
              depthColor="color-mix(in srgb, var(--muted) 18%, var(--background))"
            />
          </span>
        </h1>
        <p className="intro-description">
          A student of design. A builder of digital experiences.
          <br />
          Always curious about what comes next.
        </p>
        <button
          id="get-started"
          className="button solid get-started"
          disabled={leaving}
          onClick={onEnter}
        >
          Get Started
        </button>
      </div>
      <p className="opening-bottom">Front-end development & UI/UX design</p>
    </section>
  );
}
