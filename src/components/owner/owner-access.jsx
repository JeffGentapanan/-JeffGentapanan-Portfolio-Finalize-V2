import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useOwner } from './owner-provider';
export function OwnerAccess({ label, onEdit }) {
    const owner = useOwner();
    const [open, setOpen] = useState(false), [password, setPassword] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    return <div className="owner-controls">
    {owner.authenticated ? <><button className="text-button" onClick={onEdit}>{label}</button><button className="text-button" onClick={async () => { try {
        await owner.logout();
    }
    catch (error) {
        setError(error.message);
    } }}>Sign out</button></> : <button className="text-button" onClick={() => { setError(''); setOpen(true); }}>Owner sign in</button>}
    {error && !open && <p role="alert">{error}</p>}
    {open && <Modal title="Owner sign in" onClose={() => { setOpen(false); setPassword(''); }}>
      <p className="muted">Only the owner can publish changes to projects and skills.</p>
      {!owner.configured && <p className="setup-hint">First time? Run <strong>SET OWNER PASSWORD.cmd</strong> in the portfolio folder to choose your password.</p>}
      <form onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(''); try {
            await owner.login(password);
            setPassword('');
            setOpen(false);
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setBusy(false);
        } }}>
        <label>Owner password<input autoFocus name="password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)}/></label>
        {error && <p role="alert">{error}</p>}<button className="button solid" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Modal>}
  </div>;
}
