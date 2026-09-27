import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import details from '@/data/project-details.json';
import { validateImageFile } from '@/lib/project-images';
import { ProjectImage } from './project-image';
const blank = {
  title: '',
  url: '',
  category: '',
  tagline: '',
  thumbnail: '',
  tags: '',
  github: '',
};
export function ProjectManager({ projects, ready, error, save, remove, onClose }) {
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState();
  const [deleting, setDeleting] = useState();
  const [notice, setNotice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [fileKey, setFileKey] = useState(0);
  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  function clearFile() {
    setImageFile(null);
    setImageError('');
    setFileKey((key) => key + 1);
  }
  function reset() {
    setForm(blank);
    clearFile();
    setEditing(undefined);
  }
  return (
    <Modal title="Manage projects" onClose={onClose}>
      <p className="muted">Only your signed-in owner session can save changes.</p>
      <div className="manager-list">
        {projects.map((project) => (
          <div key={project.id} className="manager-row">
            <strong>{project.title}</strong>
            <button
              disabled={!ready}
              onClick={() => {
                clearFile();
                setEditing(project.id);
                setForm({
                  title: project.title,
                  url: project.url,
                  category: project.category,
                  tagline: project.tagline,
                  thumbnail: project.thumbnail,
                  tags: (project.tags ?? details[project.id]?.stack ?? []).join(', '),
                  github: project.github ?? details[project.id]?.github ?? '',
                });
                setNotice('');
              }}
            >
              Edit
            </button>
            <button disabled={!ready} onClick={() => setDeleting(project.id)}>
              Delete
            </button>
            {deleting === project.id && (
              <div className="delete-confirm">
                <p>Delete “{project.title}”?</p>
                <button
                  className="button solid"
                  disabled={!ready}
                  onClick={async () => {
                    if (await remove(project.id)) {
                      setDeleting(undefined);
                      if (editing === project.id) reset();
                      setNotice('Project deleted.');
                    }
                  }}
                >
                  Confirm delete
                </button>
                <button onClick={() => setDeleting(undefined)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!ready || imageError) return;
          if (await save(form, editing, imageFile)) {
            setNotice(editing ? 'Project updated.' : 'Project added.');
            reset();
          }
        }}
      >
        <fieldset className="project-editor-fields" disabled={!ready}>
          <div className="form-heading">
            <h3>{editing ? 'Edit project' : 'Add project'}</h3>
            {editing && (
              <button type="button" onClick={reset}>
                Cancel edit
              </button>
            )}
          </div>
          <label>
            Title
            <input
              name="title"
              required
              maxLength={80}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>
          <label>
            Link URL
            <input
              name="url"
              type="url"
              placeholder="https://"
              required
              maxLength={2048}
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
            />
          </label>
          <label>
            Category
            <input
              name="category"
              required
              maxLength={60}
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
          </label>
          <label>
            Choose an image from your computer
            <input
              key={fileKey}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const problem = validateImageFile(file);
                setImageError(problem || '');
                setImageFile(problem ? null : file);
              }}
            />
            <span className="muted">
              PNG, JPG, WebP, or AVIF, up to 5 MB. Uploaded when you save.
            </span>
          </label>
          {(imageFile || imageError) && (
            <button type="button" onClick={clearFile}>
              Remove selected file
            </button>
          )}
          {imageError && <p role="alert">{imageError}</p>}
          <label>
            Or use an image URL <span className="optional">(optional)</span>
            <input
              name="thumbnail"
              type="url"
              placeholder="https://example.com/image.png"
              maxLength={2048}
              value={form.thumbnail.startsWith('/portfolio/') ? '' : form.thumbnail}
              onChange={(event) => {
                clearFile();
                setForm({ ...form, thumbnail: event.target.value });
              }}
            />
          </label>
          {(imagePreview || form.thumbnail) && (
            <ProjectImage
              key={imagePreview || form.thumbnail}
              src={imagePreview || form.thumbnail}
              title={form.title || 'Image preview'}
              index={0}
            />
          )}
          <label>
            Tags / tools <span className="optional">(optional)</span>
            <textarea
              name="tags"
              rows={3}
              maxLength={1220}
              placeholder="Figma, Interaction Design, Travel Tech"
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
            />
            <span className="muted">Separate tags with commas or new lines. Up to 20 tags.</span>
          </label>
          <label>
            Source code URL <span className="optional">(optional)</span>
            <input
              name="github"
              type="url"
              maxLength={2048}
              placeholder="https://github.com/..."
              value={form.github}
              onChange={(event) => setForm({ ...form, github: event.target.value })}
            />
          </label>
          <label>
            Description <span className="optional">(optional)</span>
            <textarea
              name="tagline"
              rows={3}
              maxLength={2000}
              value={form.tagline}
              onChange={(event) => setForm({ ...form, tagline: event.target.value })}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <p role="status">{notice}</p>
          <button disabled={!ready || Boolean(imageError)} type="submit" className="button solid">
            {!ready ? 'Saving…' : editing ? 'Save changes' : 'Add project'}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
}
