export function ResumePage() {
  return (
    <section className="personal-section" aria-labelledby="resume-title">
      <p className="eyebrow">Background</p>
      <h2 id="resume-title">
        A little context.
        <br />
        <em>The next chapter.</em>
      </h2>
      <dl className="resume-details">
        {[
          ['Name', 'Jeff A. Gentapanan'],
          ['Address', 'Igcocolo, Guimbal, Iloilo'],
          ['Education', 'BSIT — Western Institute of Technology'],
          ['Birthday', 'May 25, 2004'],
        ].map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="resume-actions">
        <a
          className="button solid"
          href="https://drive.google.com/file/d/1zBMBMWVx96HQH1sKYThS32GJTFgdBkIW/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          View résumé ↗
        </a>
        <a
          className="button"
          href="/portfolio/Jeff-Gentapanan-Resume.pdf"
          download="Jeff-Gentapanan-Resume.pdf"
        >
          Download PDF ↓
        </a>
      </div>
    </section>
  );
}
