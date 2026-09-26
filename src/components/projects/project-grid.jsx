'use client';
import details from '@/data/project-details.json';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { ProjectImage } from './project-image';
export function ProjectGrid({ projects }) {
    const [selected, setSelected] = useState(null);
    const detail = selected ? details[selected.id] : undefined;
    return <>
    <div className="project-grid">{projects.length ? projects.map((project, index) => <article className="project-card" key={project.id}>
      <button className="project-preview" onClick={() => setSelected(project)} aria-label={`Preview ${project.title}`}><ProjectImage key={project.thumbnail} src={project.thumbnail} title={project.title} index={index}/><span className="preview-label">Explore project ↗</span></button>
      <div className="project-info"><div><p className="eyebrow">{project.category}</p><h3><button onClick={() => setSelected(project)}>{project.title}</button></h3></div><a className="external" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.title} in a new tab`}>↗</a></div>
    </article>) : <p className="empty-state">A blank canvas. Open the project editor to add your first project.</p>}</div>
    {selected && <Modal title={selected.title} onClose={() => setSelected(null)}><ProjectImage key={selected.thumbnail} src={selected.thumbnail} title={selected.title} index={projects.findIndex(p => p.id === selected.id)}/><p className="eyebrow">{selected.category}</p><p className="modal-description">{selected.tagline}</p>{detail && <><ul className="stack-tags">{detail.stack.map(tag => <li key={tag}>{tag}</li>)}</ul>{detail.github && <a className="button" href={detail.github} target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a>}</>}<a className="button solid" href={selected.url} target="_blank" rel="noopener noreferrer">Visit project ↗</a></Modal>}
  </>;
}
