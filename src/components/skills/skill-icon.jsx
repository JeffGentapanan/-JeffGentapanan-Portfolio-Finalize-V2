import { useState } from 'react';

const iconSlugs = {
  javascript: 'javascript',
  css: 'css3',
  css3: 'css3',
  html: 'html5',
  html5: 'html5',
  jsx: 'react',
  'mern stack': 'mongodb',
  mongodb: 'mongodb',
  express: 'express',
  react: 'react',
  'react dom': 'react',
  'font awesome': 'fontawesome',
  'google fonts': 'googlefonts',
  'formsubmit api': 'formsubmit',
  reactbits: 'react',
  'three.js': 'threedotjs',
  'react three fiber': 'threedotjs',
  'supabase javascript sdk': 'supabase',
  'supabase auth': 'supabase',
  'supabase database (postgresql)': 'postgresql',
  'supabase storage': 'supabase',
  vercel: 'vercel',
  vite: 'vite',
  'git & github': 'github',
  git: 'git',
  github: 'github',
  figma: 'figma',
};

function getInitials(label) {
  const words = label.match(/[A-Z0-9]+|[a-z0-9]+/gi) || [];
  return (words.length > 1 ? words.map((word) => word[0]) : [words[0]?.slice(0, 2)])
    .join('')
    .toUpperCase();
}

function getIconSlug(name) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[®™]/g, '')
    .replace(/\s+/g, ' ');
  if (iconSlugs[normalized]) return iconSlugs[normalized];
  if (normalized.includes('supabase')) return 'supabase';
  if (normalized.includes('react') || normalized === 'jsx') return 'react';
  if (normalized.includes('three')) return 'threedotjs';
  if (normalized.includes('figma')) return 'figma';
  if (normalized.includes('vite')) return 'vite';
  if (normalized.includes('github')) return 'github';
  if (normalized.includes('javascript')) return 'javascript';
  if (normalized.includes('postgres')) return 'postgresql';
  return '';
}

function FallbackSkillIcon({ name }) {
  const label = name.toLowerCase();

  if (label.includes('submit') || label.includes('form')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m3 11 18-8-6 18-3-8-9-2Z" />
        <path d="m12 13 5-5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.75h7l4 4v12.5H7z" />
      <path d="M14 4v4h4M10 12l-2 2 2 2m4-4 2 2-2 2" />
      <title>{getInitials(name)}</title>
    </svg>
  );
}

export function SkillIcon({ name }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const slug = getIconSlug(name);
  const showBrandLogo = slug && !failed;

  return (
    <span className="skill-icon" aria-hidden="true">
      {showBrandLogo && (
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt=""
          className={loaded ? 'is-loaded' : ''}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {(!showBrandLogo || !loaded) && (
        <span className="skill-icon-fallback">
          <FallbackSkillIcon name={name} />
        </span>
      )}
    </span>
  );
}
