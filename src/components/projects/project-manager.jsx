import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
const blank = { title: '', url: '', category: '', tagline: '', thumbnail: '' };
export function ProjectManager({ projects, ready, error, save, remove, onClose }) {
    const [form, setForm] = useState(blank);
    const [editing, setEditing] = useState();
    const [deleting, setDeleting] = useState();
    const [notice, setNotice] = useState('');
    function reset() { setForm(blank); setEditing(undefined); }
    return <Modal title="Manage projects" onClose={onClose}>
    <p className="muted">Only your signed-in owner session can save changes.</p>
    <div className="manager-list">{projects.map(project => <div key={project.id} className="manager-row"><strong>{project.title}</strong>
      <button disabled={!ready} onClick={() => { setEditing(project.id); setForm({ title: project.title, url: project.url, category: project.category, tagline: project.tagline, thumbnail: project.thumbnail }); setNotice(''); }}>Edit</button>
      <button disabled={!ready} onClick={() => setDeleting(project.id)}>Delete</button>
      {deleting === project.id && <div className="delete-confirm"><p>Delete “{project.title}”?</p><button className="button solid" disabled={!ready} onClick={async () => { if (await remove(project.id)) {
            setDeleting(undefined);
            if (editing === project.id)
                reset();
            setNotice('Project deleted.');
        } }}>Confirm delete</button><button onClick={() => setDeleting(undefined)}>Cancel</button></div>}
    </div>)}</div>
    <form onSubmit={async (event) => { event.preventDefault(); if (await save(form, editing)) {
        setNotice(editing ? 'Project updated.' : 'Project added.');
        reset();
    } }}>
      <div className="form-heading"><h3>{editing ? 'Edit project' : 'Add project'}</h3>{editing && <button type="button" onClick={reset}>Cancel edit</button>}</div>
      <label>Title<input name="title" required maxLength={80} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })}/></label>
      <label>Link URL<input name="url" type="url" placeholder="https://" required maxLength={2048} value={form.url} onChange={event => setForm({ ...form, url: event.target.value })}/></label>
      <label>Category<input name="category" required maxLength={60} value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}/></label>
      <label>Preview thumbnail URL <span className="optional">(optional)</span><input name="thumbnail" placeholder="https:// or /portfolio/image.png" maxLength={2048} value={form.thumbnail} onChange={event => setForm({ ...form, thumbnail: event.target.value })}/></label>
      <label>Description <span className="optional">(optional)</span><textarea name="tagline" rows={3} maxLength={2000} value={form.tagline} onChange={event => setForm({ ...form, tagline: event.target.value })}/></label>
      {error && <p role="alert" className="form-error">{error}</p>}<p role="status">{notice}</p>
      <button disabled={!ready} type="submit" className="button solid">{editing ? 'Save changes' : 'Add project'}</button>
    </form>
  </Modal>;
}
