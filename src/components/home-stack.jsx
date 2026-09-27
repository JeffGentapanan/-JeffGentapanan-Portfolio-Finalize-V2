import languages from '@/data/stack.json';
import '@/styles/home-stack.css';
const groups = [
  { title: 'Frameworks & libraries', items: ['React', 'Three.js', 'React Three Fiber'] },
  { title: 'Tools & runtime', items: ['Vite', 'Node.js', 'npm'] },
];
/** Source composition is generated before dev/build; it is not a skill rating. */
export function HomeStack() {
  return (
    <section className="home-stack" aria-labelledby="stack-title">
      <div className="stack-intro">
        <p className="eyebrow">Behind this portfolio</p>
        <h2 id="stack-title">Languages & tools.</h2>
        <p>The code, libraries, and tools that bring this website to life.</p>
      </div>
      <div className="stack-layout">
        <div>
          <h3>Languages</h3>
          <ul className="language-list">
            {languages.map((language) => (
              <li key={language.name}>
                <div className="language-label">
                  <span>{language.name}</span>
                  <strong>{language.percentage}%</strong>
                </div>
                <div className="language-track" aria-hidden="true">
                  <span style={{ width: `${language.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="stack-note">
            Share of this site’s source code by file size. Excludes dependencies, assets, and
            generated files.
          </p>
        </div>
        <div className="stack-tools">
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
