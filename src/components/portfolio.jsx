import { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useOwner } from '@/context/owner-context';
import { useProjects } from '@/hooks/use-projects';
import { routes } from '@/data/navigation';
import { Navigation } from './layout/Navigation';
import { User } from './layout/User';
import { Footer } from './layout/Footer';
import { BackToTop } from './layout/BackToTop';
import { ProjectManager } from './projects/project-manager';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SkillsPage } from '@/pages/SkillsPage';
import { ResumePage } from '@/pages/ResumePage';
import { ContactPage } from '@/pages/ContactPage';

export function Portfolio() {
  const owner = useOwner();
  const store = useProjects();
  const [view, setView] = useState(() => routes[window.location.hash.slice(1)] || 'index');
  const [managerOpen, setManagerOpen] = useState(false);

  const content = useRef(null);
  useScrollReveal(content, view);

  function changePage(nextPage) {
    setManagerOpen(false);
    setView(nextPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Keep browser back/forward buttons in sync with the selected page.
  useEffect(() => {
    function syncPage() {
      const hash = window.location.hash.slice(1);
      if (routes[hash]) changePage(routes[hash]);
      else if (!hash) changePage('index');
    }
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  useEffect(() => {
    const names = {
      index: 'Design & Development',
      work: 'Projects',
      studio: 'About',
      skills: 'Skills',
      resume: 'Resume',
      contact: 'Contact',
    };
    document.title = 'Jeff A. Gentapanan — ' + names[view];
  }, [view]);

  function renderPage() {
    switch (view) {
      case 'work':
        return <ProjectsPage projects={store.projects} onEdit={() => setManagerOpen(true)} />;
      case 'studio':
        return <AboutPage />;
      case 'skills':
        return <SkillsPage />;
      case 'resume':
        return <ResumePage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage projects={store.projects} />;
    }
  }

  return (
    <div className="portfolio jeff-portfolio" data-view={view}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation view={view} onChange={changePage} />
      <main ref={content} id="main" tabIndex={-1}>
        <User view={view} />
        <div className="view-body" key={view} id="section-content">
          {renderPage()}
        </div>
        {store.error && !managerOpen && (
          <p role="status" className="storage-note">
            {store.error}
          </p>
        )}
      </main>
      <Footer />
      <BackToTop />
      {managerOpen && view === 'work' && owner.authenticated && (
        <ProjectManager {...store} onClose={() => setManagerOpen(false)} />
      )}
    </div>
  );
}
