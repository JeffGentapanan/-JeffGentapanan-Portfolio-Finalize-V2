import { ThemeToggle } from './theme-toggle';
export function OpeningPage({ leaving, onEnter }) {
    return <section className={'opening-page' + (leaving ? ' leaving' : '')} aria-labelledby="intro-title">
    <div className="opening-top"><span className="wordmark">JEFF.DEV</span><ThemeToggle /></div>
    <div className="opening-copy"><p className="eyebrow">Jeff A. Gentapanan</p>
      <h1 id="intro-title">Ideas into form.<br /><em>Code into feeling.</em></h1>
      <p className="intro-description">A student of design. A builder of digital experiences.<br />Always curious about what comes next.</p>
      <button id="get-started" className="button solid get-started" disabled={leaving} onClick={onEnter}>Get Started</button>
    </div>
    <p className="opening-bottom">Front-end development & UI/UX design</p>
  </section>;
}
