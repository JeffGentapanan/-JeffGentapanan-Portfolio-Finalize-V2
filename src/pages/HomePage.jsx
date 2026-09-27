import { ProjectsPage } from './ProjectsPage';
import { HomeStack } from '@/components/home-stack';

export function HomePage({ projects }) {
  return (
    <ProjectsPage projects={projects}>
      <HomeStack />
      <div className="home-about-link">
        <p>
          Curiosity, a little code,
          <br />
          <em>and a lot of possibility.</em>
        </p>
        <a className="button" href="#about">
          Meet the person behind the work ↗
        </a>
      </div>
    </ProjectsPage>
  );
}
