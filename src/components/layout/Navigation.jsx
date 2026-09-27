import { ThemeToggle } from '@/components/theme-toggle';
const links = [
  { view: 'index', label: 'Home', hash: 'home' },
  { view: 'studio', label: 'About', hash: 'about' },
  { view: 'work', label: 'Projects', hash: 'projects' },
  { view: 'skills', label: 'Skills', hash: 'skills' },
  { view: 'resume', label: 'Resume', hash: 'resume' },
  { view: 'contact', label: 'Contact', hash: 'contact' },
];
export function Navigation({ view, onChange }) {
  return (
    <header className="header">
      <a
        className="wordmark brand-logo"
        aria-label="JEFF.DEV — Home"
        href="#home"
        onClick={() => onChange('index')}
      >
        <img src="/portfolio/jeff-dev-logo.png" alt="JEFF.DEV" width="64" height="64" />
      </a>
      <nav aria-label="Primary navigation">
        {links.map((link) => (
          <a
            key={link.view}
            href={'#' + link.hash}
            aria-current={view === link.view ? 'page' : undefined}
            onClick={() => onChange(link.view)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
