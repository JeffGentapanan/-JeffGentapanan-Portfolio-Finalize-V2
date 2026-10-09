import { useEffect, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);
  function navigate(next) {
    setOpen(false);
    onChange(next);
    document.getElementById('main')?.focus({ preventScroll: true });
  }
  useEffect(() => {
    setOpen(false);
  }, [view]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const reset = () => setOpen(false);
    desktop.addEventListener('change', reset);
    return () => desktop.removeEventListener('change', reset);
  }, []);
  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (event.type === 'keydown' && event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      } else if (event.type === 'pointerdown' && !header.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', dismiss);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [open]);
  return (
    <header className="header" ref={header}>
      <a
        className="wordmark brand-logo"
        aria-label="JEFF.DEV — Home"
        href="#home"
        onClick={() => navigate('index')}
      >
        <img src="/portfolio/jeff-dev-logo.png" alt="JEFF.DEV" width="64" height="64" />
      </a>
      <button
        ref={toggle}
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="portfolio-navigation"
        onClick={() => setOpen(!open)}
      >
        <svg
          className="menu-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
        <span className="menu-label">{open ? 'Close' : 'Menu'}</span>
      </button>
      <nav
        id="portfolio-navigation"
        className={open ? 'navigation-open' : ''}
        aria-label="Primary navigation"
      >
        {links.map((link) => (
          <a
            key={link.view}
            href={'#' + link.hash}
            aria-current={view === link.view ? 'page' : undefined}
            onClick={() => navigate(link.view)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
