export function Footer() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} · Designed & built by Jeff A. Gentapanan.</span>
      <div className="footer-socials">
        <a href="https://github.com/JeffGentapanan" target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a
          href="https://www.linkedin.com/in/jeff-gentapanan-4b76b8370/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn ↗
        </a>
        <a
          href="https://www.facebook.com/share/182aXsGi6r/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook ↗
        </a>
        <a
          href="https://github.com/JeffGentapanan/MY-PORTFOLIO-JEFFGENTAPANAN-BSIT2-SECTION1.git"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source ↗
        </a>
      </div>
    </footer>
  );
}
