import { createPortal } from 'react-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
/** Scrolls the current page only. It never changes views or reopens the intro. */
export function BackToTop() {
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    return createPortal(<button className="back-to-top" onClick={() => { window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' }); document.getElementById('main')?.focus({ preventScroll: true }); }} aria-label="Back to top" title="Back to top"><span aria-hidden="true">↑</span></button>, document.body);
}
