import { OwnerAccess } from '@/components/owner/owner-access';
import { ProjectGrid } from '@/components/projects/project-grid';

export function ProjectsPage({ projects, onEdit, children }) {
  return (
    <section className="work-section" id="selected-work" aria-labelledby="work-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Selected projects / Design & code</p>
          <h2 id="work-title">Ideas, given form</h2>
        </div>
        {onEdit && <OwnerAccess label="Edit projects" onEdit={onEdit} />}
      </div>
      <ProjectGrid projects={projects} />
      {children}
    </section>
  );
}
