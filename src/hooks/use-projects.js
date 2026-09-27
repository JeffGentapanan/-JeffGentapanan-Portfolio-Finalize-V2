import { useEffect, useState } from 'react';
import seed from '@/data/projects.json';
import { MAX_PROJECTS, validateProject } from '@/lib/project-store';
import { api, jsonRequest } from '@/lib/api';
import { useOwner } from '@/context/owner-context';
export function useProjects() {
  const [projects, setProjects] = useState(seed),
    [ready, setReady] = useState(false),
    [error, setError] = useState('');
  const { csrf } = useOwner();
  useEffect(() => {
    let active = true;
    api('/api/content')
      .then((data) => {
        if (active) {
          setProjects(data.projects);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setError('Live content is unavailable. Showing the bundled portfolio.');
      });
    return () => {
      active = false;
    };
  }, []);
  async function commit(next) {
    if (!csrf) {
      setError('Owner sign-in is required.');
      return false;
    }
    setReady(false);
    try {
      const data = await api('/api/projects', jsonRequest('PUT', next, csrf));
      setProjects(data.projects);
      setError('');
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setReady(true);
    }
  }
  async function save(input, id) {
    const cleaned = Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, value.trim()])
    );
    const validation = validateProject(cleaned);
    if (validation) {
      setError(validation);
      return false;
    }
    if (!id && projects.length >= MAX_PROJECTS) {
      setError('You can store up to ' + MAX_PROJECTS + ' projects.');
      return false;
    }
    return commit(
      id
        ? projects.map((project) => (project.id === id ? { ...cleaned, id } : project))
        : [...projects, { ...cleaned, id: crypto.randomUUID() }]
    );
  }
  return {
    projects,
    ready,
    error,
    save,
    remove: (id) => commit(projects.filter((project) => project.id !== id)),
  };
}
