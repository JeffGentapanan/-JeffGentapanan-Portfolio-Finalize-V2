export function AboutPage() {
  return (
    <section className="personal-section about-section" aria-labelledby="about-title">
      <div>
        <p className="eyebrow">A little about me</p>
        <h2 id="about-title">
          Curious by nature.
          <br />
          <em>Creative by practice.</em>
        </h2>
        <p className="personal-lead">
          I’m Jeff A. Gentapanan, a BSIT student at Western Institute of Technology, learning
          front-end development and UI/UX design.
        </p>
        <p className="muted personal-copy">
          I’m still pretty new to the world of front-end development and design, but I’m enjoying
          the process of exploring how it all works. I’m always looking for new things to learn and
          ways to expand what I know.
        </p>
        <a className="button solid" href="#projects">
          Explore my projects ↗
        </a>
      </div>
      <figure className="portrait">
        <img
          src="/portfolio/profile.jpg"
          alt="Jeff A. Gentapanan"
          width="600"
          height="700"
          loading="lazy"
        />
        <figcaption>
          <span>Jeff A. Gentapanan</span>
          <span>Designing. Building. Learning.</span>
        </figcaption>
      </figure>
    </section>
  );
}
