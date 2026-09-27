import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useOwner } from '@/context/owner-context';
export function OwnerAccess({ label, onEdit }) {
  const owner = useOwner();
  const [open, setOpen] = useState(false),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <div className="owner-controls">
      {owner.authenticated ? (
        <>
          <button className="text-button" onClick={onEdit}>
            {label}
          </button>
          <button
            className="text-button"
            onClick={async () => {
              try {
                await owner.logout();
              } catch (error) {
                setError(error.message);
              }
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          className="text-button"
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          Owner sign in
        </button>
      )}
      {error && !open && <p role="alert">{error}</p>}
      {open && (
        <Modal
          title="Owner sign in"
          onClose={() => {
            setOpen(false);
            setPassword('');
          }}
        >
          <p className="muted">Only the owner can publish changes to projects and skills.</p>
          {!owner.configured && (
            <p className="setup-hint">
              Add the Supabase connection settings to your deployment before signing in.
            </p>
          )}
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError('');
              try {
                await owner.login(email, password);
                setPassword('');
                setOpen(false);
              } catch (error) {
                setError(error.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Owner email
              <input
                autoFocus
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Owner password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={256}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="button solid" disabled={busy} type="submit">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
