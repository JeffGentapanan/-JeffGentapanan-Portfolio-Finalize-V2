import { useEffect, useState } from 'react';
import { uploadProjectImage, discardProjectUpload } from '@/lib/project-upload';
import seed from '@/data/projects.json';
import { MAX_PROJECTS, validateProject } from '@/lib/project-store';
import { loadContent, saveContentRow, deleteContentRow } from '@/lib/content-store';
import { useOwner } from '@/context/owner-context';

export function useProjects() {
  const [projects, setProjects] = useState(seed);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const { authenticated } = useOwner();

  useEffect(() => {
    let active = true;
    loadContent('projects')
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch(() => {
        if (active) setError('Live content is unavailable. Showing the bundled portfolio.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function mutate(action) {
    if (!authenticated) {
      setError('Owner sign-in is required.');
      return false;
    }
    setReady(false);
    setError('');
    try {
      await action();
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setReady(true);
    }
  }

  async function save(input, id, imageFile) {
    const cleaned = Object.fromEntries(
      ['title', 'url', 'category', 'tagline', 'thumbnail', 'github'].map((key) => [
        key,
        (input[key] || '').trim(),
      ])
    );
    cleaned.tags = [
      ...new Set(
        (input.tags || '')
          .split(/[,\n]/)
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];
    const previousThumbnail = projects.find((project) => project.id === id)?.thumbnail;
    if (
      !imageFile &&
      cleaned.thumbnail.startsWith('/portfolio/') &&
      cleaned.thumbnail !== previousThumbnail
    ) {
      setError('Choose an image from your computer or paste a complete HTTPS image URL.');
      return false;
    }
    if (imageFile) cleaned.thumbnail = '';
    const validation = validateProject(cleaned);
    if (validation) {
      setError(validation);
      return false;
    }
    if (!id && projects.length >= MAX_PROJECTS) {
      setError('You can store up to ' + MAX_PROJECTS + ' projects.');
      return false;
    }
    return mutate(async () => {
      const existing = projects.find((project) => project.id === id);
      const position =
        existing?.position ?? Math.max(-1, ...projects.map((p) => p.position ?? 0)) + 1;
      let upload;
      let saved;
      try {
        if (imageFile) upload = await uploadProjectImage(imageFile);
        saved = await saveContentRow(
          'projects',
          {
            ...cleaned,
            thumbnail: upload?.url || cleaned.thumbnail,
            id: id || crypto.randomUUID(),
            position,
          },
          Boolean(id)
        );
      } catch (error) {
        if (upload) {
          try {
            await discardProjectUpload(upload.path);
          } catch {
            throw new Error(
              error.message + ' The unused image could not be removed; check Supabase Storage.'
            );
          }
        }
        if (error.code === 'PGRST204')
          throw new Error(
            'Run supabase/project-editor.sql in the Supabase SQL Editor to enable tags and source links.'
          );
        throw error;
      }
      setProjects((current) =>
        id ? current.map((project) => (project.id === id ? saved : project)) : [...current, saved]
      );
    });
  }

  function remove(id) {
    return mutate(async () => {
      await deleteContentRow('projects', id);
      setProjects((current) => current.filter((project) => project.id !== id));
    });
  }

  return { projects, ready, error, save, remove };
}
