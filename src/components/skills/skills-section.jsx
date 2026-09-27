import { useEffect, useState } from 'react';
import seed from '@/data/skills.json';
import { api, jsonRequest } from '@/lib/api';
import { OwnerAccess } from '@/components/owner/owner-access';
import { useOwner } from '@/context/owner-context';
import { Modal } from '@/components/ui/modal';
export function SkillsSection() {
  const [groups, setGroups] = useState(seed),
    [editing, setEditing] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const [id, setId] = useState(),
    [title, setTitle] = useState(''),
    [items, setItems] = useState(''),
    [deleting, setDeleting] = useState(),
    [notice, setNotice] = useState('');
  const owner = useOwner();
  useEffect(() => {
    let active = true;
    api('/api/content')
      .then((data) => {
        if (active) setGroups(data.skills);
      })
      .catch(() => {
        if (active) setError('Live skills are unavailable. Showing the bundled skills.');
      });
    return () => {
      active = false;
    };
  }, []);
  async function commit(next) {
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/skills', jsonRequest('PUT', next, owner.csrf));
      setGroups(data.skills);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setId(undefined);
    setTitle('');
    setItems('');
  }
  return (
    <section className="personal-section" aria-labelledby="skills-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">My toolkit</p>
          <h2 id="skills-title">
            Skills in progress.
            <br />
            <em>Possibilities ahead.</em>
          </h2>
        </div>
        <OwnerAccess label="Edit skills" onEdit={() => setEditing(true)} />
      </div>
      <p className="personal-lead">
        The languages, libraries, and tools I’m exploring as I develop my practice.
      </p>
      <div className="skill-columns">
        {groups.map((group) => (
          <article key={group.id}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {!groups.length && <p>No skills added yet.</p>}
      {error && !editing && <p role="status">{error}</p>}
      {editing && owner.authenticated && (
        <Modal title="Edit skills" onClose={() => setEditing(false)}>
          <p className="muted">
            Organize your skills into categories. Changes are saved to your portfolio.
          </p>
          <div className="manager-list">
            {groups.map((group) => (
              <div className="manager-row" key={group.id}>
                <strong>{group.title}</strong>
                <button
                  disabled={busy}
                  onClick={() => {
                    setId(group.id);
                    setTitle(group.title);
                    setItems(group.items.join('\n'));
                    setNotice('');
                  }}
                >
                  Edit
                </button>
                <button disabled={busy} onClick={() => setDeleting(group.id)}>
                  Delete
                </button>
                {deleting === group.id && (
                  <div className="delete-confirm">
                    <p>Delete “{group.title}” and its skills?</p>
                    <button
                      className="button solid"
                      disabled={busy}
                      onClick={async () => {
                        if (await commit(groups.filter((item) => item.id !== group.id))) {
                          setDeleting(undefined);
                          if (id === group.id) reset();
                          setNotice('Category deleted.');
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
              const list = [
                ...new Set(
                  items
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean)
                ),
              ];
              if (list.length > 50 || list.some((item) => item.length > 80)) {
                setError('Use up to 50 skills per category, each under 81 characters.');
                return;
              }
              if (!title.trim()) {
                setError('Enter a category name.');
                return;
              }
              if (!id && groups.length >= 20) {
                setError('Use up to 20 categories.');
                return;
              }
              const group = { id: id || crypto.randomUUID(), title: title.trim(), items: list };
              if (
                await commit(
                  id ? groups.map((item) => (item.id === id ? group : item)) : [...groups, group]
                )
              ) {
                reset();
                setNotice('Skills saved.');
              }
            }}
          >
            <div className="form-heading">
              <h3>{id ? 'Edit category' : 'Add category'}</h3>
              {id && (
                <button type="button" onClick={reset}>
                  Cancel edit
                </button>
              )}
            </div>
            <label>
              Category name
              <input
                required
                maxLength={80}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              Skills — one per line
              <textarea rows={6} value={items} onChange={(event) => setItems(event.target.value)} />
            </label>
            {error && <p role="alert">{error}</p>}
            <p role="status">{notice}</p>
            <button className="button solid" disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Save skills'}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
