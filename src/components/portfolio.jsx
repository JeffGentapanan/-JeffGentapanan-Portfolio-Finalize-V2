'use client';
import { lazy, Suspense, useEffect, useState } from 'react';
import { OwnerAccess } from './owner/owner-access';
import { useOwner } from './owner/owner-provider';
import { BackToTop } from './back-to-top';
import { Navigation } from './navigation';
import { ProjectGrid } from './projects/project-grid';
import { ProjectManager } from './projects/project-manager';
import { PersonalSections } from './personal-sections';
import { HomeStack } from './home-stack';
import { useProjects } from '@/hooks/use-projects';
const Scene = lazy(() => import('./three/scene'));
const routes = { home: 'index', index: 'index', projects: 'work', work: 'work', about: 'studio', studio: 'studio', skills: 'skills', resume: 'resume', contact: 'contact' };
const titles = { index: ['Learning to build.', 'Designing to feel.'], work: ['Selected work.', 'Ideas in motion.'], studio: ['Hello, I’m Jeff.', 'Always exploring.'], skills: ['The toolkit.', 'Always evolving.'], resume: ['My background.', 'What comes next.'], contact: ['Let’s connect.', 'Make it happen.'] };
export function Portfolio() {
    const owner = useOwner();
    const [view, setView] = useState(() => routes[window.location.hash.slice(1)] || 'index');
    const [manager, setManager] = useState(false);
    const store = useProjects();
    useEffect(() => { const sync = () => { const hash = location.hash.slice(1); if (routes[hash]) {
        setView(routes[hash]);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    else if (!hash)
        setView('index'); }; window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
    useEffect(() => { document.title = 'Jeff A. Gentapanan — ' + (view === 'index' ? 'Design & Development' : view === 'studio' ? 'About' : view === 'work' ? 'Projects' : view[0].toUpperCase() + view.slice(1)); }, [view]);
    function change(next) { setManager(false); setView(next); window.scrollTo({ top: 0, behavior: 'instant' }); }
    return <div className="portfolio jeff-portfolio" data-view={view}><a className="skip-link" href="#main">Skip to content</a><Navigation view={view} onChange={change}/>
    <main id="main" tabIndex={-1}><section className="hero" aria-labelledby="hero-title"><div className="hero-title" key={view}><p className="eyebrow">Jeff A. Gentapanan</p><h1 id="hero-title">{titles[view][0]}<br /><em>{titles[view][1]}</em></h1></div><Suspense fallback={<div className="scene scene-loading" aria-label="Loading interactive sculpture">◇</div>}><Scene view={view}/></Suspense>
    <div className="hero-foot"><p>I’m a 2nd-year IT student building my skills in front-end development and design, one thoughtful project at a time.</p></div></section>
    <div className="view-body" key={view} id="section-content">{view === 'index' || view === 'work' ? <section className="work-section" id="selected-work" aria-labelledby="work-title"><div className="section-heading"><div><p className="eyebrow">Selected projects / Design & code</p><h2 id="work-title">Ideas, given form</h2></div>{view === 'work' && <OwnerAccess label="Edit projects" onEdit={() => setManager(true)}/>}</div><ProjectGrid projects={store.projects}/>{view === 'index' && <HomeStack />}{view === 'index' && <div className="home-about-link"><p>Curiosity, a little code,<br /><em>and a lot of possibility.</em></p><a className="button" href="#about">Meet the person behind the work ↗</a></div>}</section> : <PersonalSections view={view}/>}</div>{store.error && !manager && <p role="status" className="storage-note">{store.error}</p>}</main>
    <footer><span>© {new Date().getFullYear()} · Designed & built by Jeff A. Gentapanan.</span><div className="footer-socials"><a href="https://github.com/JeffGentapanan" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/jeff-gentapanan-4b76b8370/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://www.facebook.com/share/182aXsGi6r/" target="_blank" rel="noopener noreferrer">Facebook ↗</a><a href="https://github.com/JeffGentapanan/MY-PORTFOLIO-JEFFGENTAPANAN-BSIT2-SECTION1.git" target="_blank" rel="noopener noreferrer">Source ↗</a></div></footer>
    <BackToTop />{manager && view === 'work' && owner.authenticated && <ProjectManager {...store} onClose={() => setManager(false)}/>}</div>;
}
