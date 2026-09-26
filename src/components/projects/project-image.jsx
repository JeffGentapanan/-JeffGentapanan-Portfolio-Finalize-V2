'use client';
import { useState } from 'react';
export function ProjectImage({ src, title, index }) {
    const [failed, setFailed] = useState(false);
    return <div className={`project-image image-${index % 3}`}>
    {src && !failed ? <img src={src} alt={title} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)}/> : <div className="typographic-preview" aria-label={`${title} typographic preview`}><strong>{title.slice(0, 1)}</strong><span>{title}</span></div>}
  </div>;
}
